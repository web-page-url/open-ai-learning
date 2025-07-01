// User session management utilities

export interface CurrentUser {
  name: string;
  email: string;
  loginTime: string;
}

export class UserSession {
  private static STORAGE_KEY = 'currentUser';

  // Get current logged-in user
  static getCurrentUser(): CurrentUser | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading user session:', error);
      return null;
    }
  }

  // Set current user (called during login)
  static setCurrentUser(user: CurrentUser): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user session:', error);
    }
  }

  // Check if user is logged in
  static isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Logout user
  static logout(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing user session:', error);
    }
  }

  // Get user email (convenient method)
  static getUserEmail(): string | null {
    const user = this.getCurrentUser();
    return user ? user.email : null;
  }

  // Get user name (convenient method)
  static getUserName(): string | null {
    const user = this.getCurrentUser();
    return user ? user.name : null;
  }
} 