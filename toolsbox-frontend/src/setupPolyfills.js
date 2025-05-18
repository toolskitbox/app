// This file sets up polyfills for the application

// Simple Buffer polyfill
class BufferPolyfill {
  constructor() {
    this.isBuffer = () => false;
  }
  
  static from() {
    return new Uint8Array();
  }
  
  static isBuffer() {
    return false;
  }
  
  static alloc() {
    return new Uint8Array();
  }
}

// Assign to window.Buffer if it doesn't exist
window.Buffer = window.Buffer || BufferPolyfill;

// Process polyfill
window.process = window.process || {};

// Add any required process properties
if (!window.process.env) {
  window.process.env = {};
}

// Add browser-specific properties
window.process.browser = true;
window.process.version = '';
window.process.versions = { node: '' };
