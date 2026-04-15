import { useState, useEffect } from 'react';
import { Search, Compass, BookOpen, Clock, Activity, Command } from 'lucide-react';
import { useAppStore } from '../../core/store/useAppStore';

const MODULES_MAP = [
  { id: 'dashboard', label: 'الرئيسية', icon: Compass },
  { id: 'work', label: 'العمل', icon: Activity },
  { id: 'finance', label: 'الماليات', icon: Activity },
  { id: 'focus', label: 'التركيز', icon: Clock },
  { id: 'study', label: 'الدراسة', icon: BookOpen },
  { id: 'intelligence', label: 'التحليل الذكي', icon: Command },
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

  if (!isOpen) return null;

  const filtered = MODULES_MAP.filter(m => m.label.includes(query) || m.id.includes(query));

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
          background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 24, overflow: 'hidden', boxShadow: '0 25px 70px -12px rgba(0, 0, 0, 0.8)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <Search size={22} color="#08A7E7" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن شاشة أو أمر..."
            style={{ 
              width: '100%', background: 'transparent', border: 'none', outline: 'none', 
              color: '#F1F5F9', fontSize: 18, padding: '0 15px',
              fontFamily: "'Noto Kufi Arabic', sans-serif"
            }}
          />
        </div>
        
        <div style={{ padding: '8px' }}>
          {filtered.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: '#3D5A80', fontSize: 14 }}>
              لا توجد نتائج مطابقة
            </div>
          )}
          {filtered.map(m => (
            <button
              key={m.id}
              onClick={() => {
                onNavigate(m.id);
                setOpen(false);
                setQuery('');
              }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', border: 'none', background: 'transparent',
                color: '#C0C8D8', cursor: 'pointer', borderRadius: 8,
                textAlign: 'right', fontFamily: "'Noto Kufi Arabic', sans-serif",
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(51, 65, 85, 0.4)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <m.icon size={18} color="#08A7E7" />
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
