export const session = {
  get<T>(key: string): T | null {
    try {
      const value = sessionStorage.getItem(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch (err) {
      console.error("Error reading local storage", err);
      return null;
    }
  },
  set(key: string, value: unknown): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error("Error writing local storage", err);
    }
  },
  remove(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (err) {
      console.error("Errro removing from sessionStorage", err);
    }
  },
};
