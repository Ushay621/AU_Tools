// In-memory file store - files are NOT saved to disk
interface StoredFile {
  id: string;
  name: string;
  size: number;
  type: string;
  data: string; // base64 encoded
  uploadedAt: number;
}

class FileStore {
  private files: Map<string, StoredFile> = new Map();
  private listeners: Set<(files: StoredFile[]) => void> = new Set();

  addFile(file: StoredFile) {
    this.files.set(file.id, file);
    this.notifyListeners();
  }

  removeFile(id: string) {
    this.files.delete(id);
    this.notifyListeners();
  }

  getAllFiles(): StoredFile[] {
    return Array.from(this.files.values());
  }

  getFile(id: string): StoredFile | undefined {
    return this.files.get(id);
  }

  clearAll() {
    this.files.clear();
    this.notifyListeners();
  }

  addListener(listener: (files: StoredFile[]) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const files = this.getAllFiles();
    this.listeners.forEach(listener => {
      try {
        listener(files);
      } catch (error) {
        console.error('Error notifying listener:', error);
      }
    });
  }
}

// Singleton instance - files stored in memory only
export const fileStore = new FileStore();

