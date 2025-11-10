const API_BASE_URL = 'http://localhost:5000/api';

class ApiClient {
  private baseUrl: string;
  private requestQueue: Array<{requestFn: () => Promise<any>, resolve: (value: any) => void, reject: (error: any) => void}> = [];
  private processing = false;
  private readonly maxConcurrent = 3; // Reduced from 10 to 3
  private activeRequests = 0;
  private lastRequestTime = 0;
  private readonly minRequestInterval = 200; // Minimum 200ms between requests
  private retryCounts = new Map<string, number>();
  private readonly maxRetries = 2;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add development headers to match your backend middleware
    if (process.env.NODE_ENV === 'development') {
      headers['X-Development-Mode'] = 'true';
      headers['X-Local-Network'] = 'true';
      headers['X-Client-Type'] = 'browser';
    }

    return headers;
  }

  private async processQueue() {
    if (this.processing || this.requestQueue.length === 0) return;
    
    this.processing = true;
    
    while (this.requestQueue.length > 0 && this.activeRequests < this.maxConcurrent) {
      const queueItem = this.requestQueue.shift();
      if (queueItem) {
        this.activeRequests++;
        
        // Rate limiting: ensure minimum time between requests
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.minRequestInterval) {
          await new Promise(resolve => 
            setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
          );
        }

        this.lastRequestTime = Date.now();
        
        // Execute the request
        queueItem.requestFn()
          .then(queueItem.resolve)
          .catch(queueItem.reject)
          .finally(() => {
            this.activeRequests--;
            this.processQueue(); // Process next item after completion
          });
      }
    }
    
    this.processing = false;
  }

  private async queuedRequest<T>(requestFn: () => Promise<T>, endpoint: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        requestFn: async () => {
          try {
            return await requestFn();
          } catch (error: any) {
            // Handle rate limiting with exponential backoff
            if (error?.message?.includes('Rate limit') || error?.message?.includes('429')) {
              const retryKey = `${endpoint}_${Date.now()}`;
              const retryCount = this.retryCounts.get(retryKey) || 0;
              
              if (retryCount < this.maxRetries) {
                this.retryCounts.set(retryKey, retryCount + 1);
                const backoffDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
                
                console.warn(`Rate limit hit for ${endpoint}, retrying in ${backoffDelay}ms (attempt ${retryCount + 1})`);
                await new Promise(resolve => setTimeout(resolve, backoffDelay));
                
                // Retry the request
                return await requestFn();
              }
            }
            throw error;
          }
        },
        resolve,
        reject
      });
      
      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  private async handleResponse(response: Response, endpoint: string) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`API ${response.status}: ${endpoint}`);
    }

    if (!response.ok) {
      // For 429 errors, throw specific error for retry logic
      if (response.status === 429) {
        throw new Error(`Rate limit exceeded for ${endpoint}`);
      }

      try {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      } catch (parseError) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }
    
    const data = await response.json();
    
    // Handle structured responses from export endpoint
    if (data && typeof data === 'object' && data.success !== undefined) {
      return data.data || data;
    }
    
    return data;
  }

  async get(endpoint: string) {
    return this.queuedRequest(async () => {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response, endpoint);
    }, endpoint);
  }

  async post(endpoint: string, data: any) {
    return this.queuedRequest(async () => {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return this.handleResponse(response, endpoint);
    }, endpoint);
  }

  async put(endpoint: string, data: any) {
    return this.queuedRequest(async () => {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return this.handleResponse(response, endpoint);
    }, endpoint);
  }

  async delete(endpoint: string) {
    return this.queuedRequest(async () => {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response, endpoint);
    }, endpoint);
  }

  // Batch request method for multiple operations
  async batch(requests: Array<{method: string, endpoint: string, data?: any}>) {
    // Process batch requests sequentially to avoid rate limiting
    const results = [];
    for (const req of requests) {
      try {
        let result;
        switch (req.method.toLowerCase()) {
          case 'get':
            result = await this.get(req.endpoint);
            break;
          case 'post':
            result = await this.post(req.endpoint, req.data);
            break;
          case 'put':
            result = await this.put(req.endpoint, req.data);
            break;
          case 'delete':
            result = await this.delete(req.endpoint);
            break;
          default:
            throw new Error(`Unsupported method: ${req.method}`);
        }
        results.push(result);
      } catch (error) {
        results.push({ error: (error as Error).message });
      }
      
      // Add delay between batch requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return results;
  }

  // Get queue stats for monitoring
  getQueueStats() {
    return {
      queueSize: this.requestQueue.length,
      activeRequests: this.activeRequests,
      maxConcurrent: this.maxConcurrent
    };
  }

  // Clear queue (useful for logout)
  clearQueue() {
    this.requestQueue = [];
    this.activeRequests = 0;
    this.processing = false;
    this.retryCounts.clear();
  }
}

export const api = new ApiClient(API_BASE_URL);

// Development helper to monitor API performance
if (process.env.NODE_ENV === 'development') {
  let requestCount = 0;
  const originalGet = api.get.bind(api);
  const originalPost = api.post.bind(api);
  
  // Wrap methods to track performance
  api.get = async function(endpoint: string) {
    requestCount++;
    const start = performance.now();
    try {
      const result = await originalGet(endpoint);
      const duration = performance.now() - start;
      console.log(`✅ API GET ${endpoint} completed in ${duration.toFixed(2)}ms (Request #${requestCount})`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`❌ API GET ${endpoint} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  };

  api.post = async function(endpoint: string, data: any) {
    requestCount++;
    const start = performance.now();
    try {
      const result = await originalPost(endpoint, data);
      const duration = performance.now() - start;
      console.log(`✅ API POST ${endpoint} completed in ${duration.toFixed(2)}ms (Request #${requestCount})`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`❌ API POST ${endpoint} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  };

  // Log queue stats periodically
  setInterval(() => {
    const stats = api.getQueueStats();
    if (stats.queueSize > 0 || stats.activeRequests > 0) {
      console.log(`📊 API Queue: ${stats.queueSize} waiting, ${stats.activeRequests} active`);
    }
  }, 10000); // Reduced from 5s to 10s
}