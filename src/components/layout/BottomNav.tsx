import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Briefcase, 
  Calendar, 
  Wallet, 
  Heart, 
  Timer,
  MessageCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface BottomNavProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activePage, setActivePage }) => {
  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'study', label: 'دراسة', icon: BookOpen },
    { id: 'work', label: 'عمل', icon: Briefcase },
    { id: 'calendar', label: 'تقويم', icon: Calendar },
    { id: 'finance', label: 'مالية', icon: Wallet },
    { id: 'lifestyle', label: 'حياة', icon: Heart },
    { id: 'focus', label: 'تركيز', icon: Timer },
    { id: 'telegram', label: 'مدرب', icon: MessageCircle },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#050505]/80 backdrop-blur-xl border-t border-white/[0.08] px-2 py-1 z-50">
      <div className="flex justify-around items-center">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 p-2 transition-all",
              activePage === item.id ? "text-brand-400" : "text-white/40"
            )}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
