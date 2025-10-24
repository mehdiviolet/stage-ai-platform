export const local = {
  get<T>(key: string): T | null {
    try {
      const value = localStorage.getItem(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch (err) {
      console.error("Error reading local storage", err);
      return null;
    }
  },
  set(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error("Error writing local storage", err);
    }
  },
  del(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error("Errro removing from localstorage", err);
    }
  },
};
