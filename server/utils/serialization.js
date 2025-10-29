// BigInt serialization utility
export function serializeBigInt(obj) {
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  }));
}

// Alternative: More comprehensive serialization
export function safeJSONStringify(obj) {
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    if (value instanceof Map) {
      return Object.fromEntries(value);
    }
    if (value instanceof Set) {
      return Array.from(value);
    }
    return value;
  });
}

export function safeJSONParse(str) {
  return JSON.parse(str);
}