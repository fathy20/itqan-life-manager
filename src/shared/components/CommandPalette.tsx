import { useState, useEffect } from 'react';
import { Search, Compass, BookOpen, Activity, Command as CommandIcon, Calendar, Briefcase, Wallet, Star, Droplets, Heart, Plus, Target } from 'lucide-react';
import { useAppStore } from '../../core/store/useAppStore';
import { useNavigate } from 'react-router-dom';

const MODULES_MAP = [
  { id: 'dashboard', label: 'الرئيسية', icon: Compass, type: 'شاشة' },
  { id: 'work', label: 'العمل والمهام', icon: Briefcase, type: 'شاشة' },
  { id: 'finance', label: 'الماليات', icon: Wallet, type: 'شاشة' },
  { id: 'focus', label: 'التركيز', icon: Activity, type: 'شاشة' },
  { id: 'study', label: 'الدراسة', icon: BookOpen, type: 'شاشة' },
  { id: 'intelligence', label: 'التحليل الذكي', icon: CommandIcon, type: 'شاشة' },
  { id: 'calendar', label: 'التقويم', icon: Calendar, type: 'شاشة' },
  { id: 'quran', label: 'القرآن', icon: BookOpen, type: 'شاشة' },
  { id: 'salah', label: 'الصلاة', icon: Activity, type: 'شاشة' },
  { id: 'adhkar', label: 'الأذكار', icon: Star, type: 'شاشة' },
  { id: 'fasting', label: 'الصيام', icon: Droplets, type: 'شاشة' },
  { id: 'health', label: 'الصحة', icon: Heart, type: 'شاشة' },
];

const QUICK_ACTIONS = [
  { id: 'new_task', label: 'إضافة مهمة جديدة', icon: Plus, type: 'إجراء سريع', actionPath: 'work' },
  { id: 'new_transaction', label: 'إضافة معاملة مالية', icon: Plus, type: 'إجراء سريع', actionPath: 'finance' },
  { id: 'start_focus', label: 'بدء جلسة تركيز', icon: Target, type: 'إجراء سريع', actionPath: 'focus' },
];

export function CommandPalette({ onNavigate }: { onNavigate: (page: string) => void }) {
  const isOpen = useAppStore(state => state.isCommandPaletteOpen);
  const setOpen = useAppStore(state => state.setCommandPaletteOpen);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(!isOpen);
      }
      if (e.key === 'Escape' && isOpen) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setOpen]);

  // Reset query when closed
  useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredModules = MODULES_MAP.filter(m => m.label.includes(query) || m.id.includes(query));
  const filteredActions = QUICK_ACTIONS.filter(a => a.label.includes(query));

  const allItems = [...filteredModules, ...filteredActions];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(2, 6, 23, 0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      paddingTop: '10vh'
    }}>
      {/* Click outside to close */}
      <div style={{ position: 'absolute', inset: 0 }} onClick={() => setOpen(false)} />
      
      <div 
        className="glass-card"
        style={{
          position: 'relative', width: '100%', maxWidth: 500,
          background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: 24, overflow: 'hidden', boxShadow: '0 25px 70px -12px rgba(8, 167, 231, 0.15)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <Search size={22} color="#38BDF8" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن شاشة، أمر، أو تقرير..."
            style={{ 
              width: '100%', background: 'transparent', border: 'none', outline: 'none', 
              color: '#F1F5F9', fontSize: 18, padding: '0 15px',
              fontFamily: "'Noto Kufi Arabic', sans-serif"
            }}
          />
        </div>
        
        <div style={{ padding: '8px', maxHeight: '50vh', overflowY: 'auto' }}>
          {allItems.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: '#3D5A80', fontSize: 14 }}>
              لا توجد نتائج مطابقة
            </div>
          )}
          
          {filteredActions.length > 0 && (
             <div style={{ fontSize: 11, color: '#3D5A80', padding: '8px 16px', marginTop: 8, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>إجراءات سريعة</div>
          )}
          {filteredActions.map(a => (
            <button
              key={a.id}
              onClick={() => {
                onNavigate(a.actionPath);
                setOpen(false);
                setQuery('');
              }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', border: 'none', background: 'transparent',
                color: '#C0C8D8', cursor: 'pointer', borderRadius: 8,
                textAlign: 'right', fontFamily: "'Noto Kufi Arabic', sans-serif",
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <a.icon size={18} color="#38BDF8" />
                <span>{a.label}</span>
              </div>
              <span style={{ fontSize: 10, color: '#3D5A80', background: 'rgba(51, 65, 85, 0.4)', padding: '2px 8px', borderRadius: 10 }}>{a.type}</span>
            </button>
          ))}

          {filteredModules.length > 0 && (
             <div style={{ fontSize: 11, color: '#3D5A80', padding: '8px 16px', marginTop: 8, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>شاشات النظام</div>
          )}
          {filteredModules.map(m => (
            <button
              key={m.id}
              onClick={() => {
                onNavigate(m.id);
                setOpen(false);
                setQuery('');
              }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', border: 'none', background: 'transparent',
                color: '#C0C8D8', cursor: 'pointer', borderRadius: 8,
                textAlign: 'right', fontFamily: "'Noto Kufi Arabic', sans-serif",
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(51, 65, 85, 0.4)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <m.icon size={18} color="#94A3B8" />
                <span>{m.label}</span>
              </div>
              <span style={{ fontSize: 10, color: '#3D5A80', background: 'rgba(51, 65, 85, 0.4)', padding: '2px 8px', borderRadius: 10 }}>{m.type}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
