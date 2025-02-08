type EventCallback = () => void;

class EventBus {
  private listeners: { [key: string]: EventCallback[] } = {};

  subscribe(event: string, callback: EventCallback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  emit(event: string) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback());
    }
  }
}

export const eventBus = new EventBus();
export const EVENTS = {
  HEALTH_STATUS_CHANGED: 'HEALTH_STATUS_CHANGED',
} as const;
