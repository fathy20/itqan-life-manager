import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Briefcase, 
  Calendar, 
  Wallet, 
  Heart, 
  Timer,
  Sparkles,
  Settings,
  MessageCircle,
  Moon,
  Star,
  Sunrise,
  Swords
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'salah', label: 'الصلاة', icon: Sunrise },
    { id: 'quran', label: 'القرآن', icon: BookOpen },
    { id: 'adhkar', label: 'الأذكار', icon: Star },
    { id: 'sibaq', label: 'السباق', icon: Swords },
    { id: 'study', label: 'الدراسة', icon: BookOpen },
    { id: 'work', label: 'العمل', icon: Briefcase },
    { id: 'calendar', label: 'التقويم', icon: Calendar },
    { id: 'finance', label: 'المالية', icon: Wallet },
    { id: 'lifestyle', label: 'أسلوب الحياة', icon: Heart },
    { id: 'focus', label: 'التركيز', icon: Timer },
    { id: 'telegram', label: 'المدرب الشخصي', icon: MessageCircle },
    { id: 'plan-builder', label: 'مخطط النظام', icon: Sparkles },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white/[0.02] border-l border-white/[0.08] h-screen fixed right-0 top-0 z-40">
      <div className="p-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
          إتقان
        </h1>
        <p className="text-xs text-white/40 mt-1">نظام إدارة الحياة الذكي</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              activePage === item.id 
                ? "bg-brand-500/10 text-brand-400 border border-brand-500/20" 
                : "text-white/50 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon size={20} className={cn(
              "transition-transform duration-200",
              activePage === item.id ? "scale-110" : "group-hover:scale-110"
            )} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/[0.08]">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:bg-white/5 hover:text-white transition-all">
          <Settings size={20} />
          <span className="font-medium">الإعدادات</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
