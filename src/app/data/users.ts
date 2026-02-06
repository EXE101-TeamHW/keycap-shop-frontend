// src/app/data/users.ts
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'staff' | 'customer';
  avatar?: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@hwshop.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    phone: '+84 123 456 789',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'staff@hwshop.com',
    password: 'staff123',
    name: 'Staff User',
    role: 'staff',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    phone: '+84 987 654 321',
    address: '456 Lê Lợi, Quận 3, TP.HCM',
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    email: 'customer@gmail.com',
    password: 'customer123',
    name: 'Nguyễn Văn A',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    phone: '+84 555 123 456',
    address: '789 Trần Hưng Đạo, Quận 5, TP.HCM',
    createdAt: '2024-02-01T00:00:00Z'
  },
  {
    id: '4',
    email: 'user@example.com',
    password: 'password123',
    name: 'Trần Thị B',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    phone: '+84 777 888 999',
    address: '321 Võ Văn Tần, Quận 10, TP.HCM',
    createdAt: '2024-02-15T00:00:00Z'
  }
];

// Auth service
export class AuthService {
  private static currentUser: User | null = null;

  static login(email: string, password: string): { success: boolean; user?: User; message?: string } {
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      this.currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));
      return { success: true, user };
    }
    
    return { success: false, message: 'Email hoặc mật khẩu không đúng' };
  }

  static register(userData: Omit<User, 'id' | 'createdAt'>): { success: boolean; user?: User; message?: string } {
    const existingUser = mockUsers.find(u => u.email === userData.email);
    
    if (existingUser) {
      return { success: false, message: 'Email đã được sử dụng' };
    }

    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    mockUsers.push(newUser);
    this.currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    return { success: true, user: newUser };
  }

  static logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  static getCurrentUser(): User | null {
    if (this.currentUser) {
      return this.currentUser;
    }

    const stored = localStorage.getItem('currentUser');
    if (stored) {
      this.currentUser = JSON.parse(stored);
      return this.currentUser;
    }

    return null;
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  static hasRole(role: User['role']): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }
}