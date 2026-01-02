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
  private uploaderSessionId: string | null = null;

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
    this.uploaderSessionId = null;
    this.notifyListeners();
  }

  setUploaderSession(sessionId: string) {
    this.uploaderSessionId = sessionId;
  }

  getUploaderSession(): string | null {
    return this.uploaderSessionId;
  }

  clearIfUploaderRefreshed(sessionId: string) {
    // If there are files and the session ID doesn't match the uploader's session,
    // it means uploader refreshed (got new session), so clear all files
    // This ensures files are only visible until uploader's device refreshes
    if (this.files.size > 0 && this.uploaderSessionId && this.uploaderSessionId !== sessionId) {
      console.log('Uploader refreshed - clearing all files. Old session:', this.uploaderSessionId, 'New session:', sessionId);
      this.clearAll();
      return true;
    }
    return false;
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

