import crypto from 'crypto';

export class Block {
  constructor(data, previousHash = '') {
    this.timestamp = Date.now();
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
    this.merkleRoot = this.calculateMerkleRoot();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.previousHash + 
        this.timestamp + 
        JSON.stringify(this.data) + 
        this.nonce +
        this.merkleRoot
      )
      .digest('hex');
  }

  calculateMerkleRoot() {
    if (!this.data || !Array.isArray(this.data) || this.data.length === 0) {
      return crypto.createHash('sha256').update('').digest('hex');
    }
    
    const hashes = this.data.map(vote => 
      crypto.createHash('sha256').update(JSON.stringify(vote)).digest('hex')
    );
    
    return this.buildMerkleTree(hashes);
  }

  buildMerkleTree(hashes) {
    if (hashes.length === 1) return hashes[0];
    
    const newLevel = [];
    for (let i = 0; i < hashes.length; i += 2) {
      const left = hashes[i];
      const right = hashes[i + 1] || hashes[i]; // Duplicate if odd number
      const combined = crypto.createHash('sha256').update(left + right).digest('hex');
      newLevel.push(combined);
    }
    
    return this.buildMerkleTree(newLevel);
  }

  mineBlock(difficulty) {
    const target = Array(difficulty + 1).join('0');
    
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }

    console.log(`Block mined: ${this.hash}`);
  }
}

export class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = parseInt(process.env.BLOCKCHAIN_DIFFICULTY) || 4;
    this.pendingVotes = [];
  }

  createGenesisBlock() {
    const genesisBlock = new Block([], '0');
    genesisBlock.hash = process.env.GENESIS_BLOCK_HASH || '00000000000000000000000000000000';
    return genesisBlock;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addVoteToBlockchain(voteData) {
    const previousBlock = this.getLatestBlock();
    const newBlock = new Block([voteData], previousBlock.hash);
    
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
    
    return newBlock;
  }

  getVoteByHash(hash) {
    for (let block of this.chain) {
      if (block.hash === hash && block.data.length > 0) {
        return block.data[0];
      }
    }
    return null;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  getChainStats() {
    return {
      blocks: this.chain.length,
      totalVotes: this.chain.reduce((total, block) => total + (block.data ? block.data.length : 0), 0),
      isValid: this.isChainValid(),
      latestBlock: this.getLatestBlock().hash
    };
  }
}

export const blockchain = new Blockchain();