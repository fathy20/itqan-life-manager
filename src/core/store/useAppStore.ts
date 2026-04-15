import { create } from 'zustand';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  module: 'work' | 'finance' | 'health' | 'study' | 'salah' | 'general';
  read: boolean;
  createdAt: Date;
}

interface AppState {
  // Command Palette
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  
  // Cross-Module Notifications
  notifications: AppNotification[];
  addNotification: (n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Theme/App Loading
  isLoading: boolean;
  setLoading: (l: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isCommandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  
  notifications: [
    {
      id: 'welcome_1',
      title: 'مرحباً في إتقان',
      message: 'تم تفعيل التحديث المعماري الجديد، أنت الآن على النظام الأذكى.',
      type: 'success',
      module: 'general',
      read: false,
      createdAt: new Date(),
    }
  ],
  addNotification: (n) => 
    set((state) => ({
      notifications: [
        {
          ...n,
          id: Math.random().toString(36).substring(7),
          read: false,
          createdAt: new Date(),
        },
        ...state.notifications,
      ]
    })),
  markNotificationRead: (id) => 
    set((state) => ({
      notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n)
    })),
  clearAllNotifications: () => set({ notifications: [] }),
  
  isLoading: false,
  setLoading: (l) => set({ isLoading: l }),
}));
