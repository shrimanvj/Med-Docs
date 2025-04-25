// Simple event emitter for cross-component communication
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }
}

export const eventEmitter = new EventEmitter();

// Event names
export const EVENTS = {
  DOCUMENT_UPLOADED: 'DOCUMENT_UPLOADED',
  DOCUMENT_SHARED: 'DOCUMENT_SHARED',
  DOCUMENT_ACCESS_REVOKED: 'DOCUMENT_ACCESS_REVOKED'
};
