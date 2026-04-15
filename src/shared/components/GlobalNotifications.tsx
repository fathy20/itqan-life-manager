import { X } from 'lucide-react';
import { useAppStore } from '../../core/store/useAppStore';
import { useEffect } from 'react';

export function GlobalNotifications() {
  const notifications = useAppStore(state => state.notifications);
  const markRead = useAppStore(state => state.markNotificationRead);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'success': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'alert': return '#EF4444';
      default: return '#3B82F6';
    }
  };

  if (unreadCount === 0) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: 24, zIndex: 9998,
      display: 'flex', flexDirection: 'column', gap: 12,
      maxWidth: 320, width: '100%'
    }}>
      {notifications.filter(n => !n.read).slice(0, 3).map(n => (
        <div key={n.id} style={{
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(12px)',
          border: `1px solid rgba(51, 65, 85, 0.4)`,
          borderRight: `4px solid ${getBorderColor(n.type)}`,
          padding: '16px', borderRadius: 12,
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <div>
            <h4 style={{ margin: 0, fontSize: 14, color: '#F1F5F9', fontFamily: "'Noto Kufi Arabic', sans-serif" }}>{n.title}</h4>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94A3B8', fontFamily: "'Noto Kufi Arabic', sans-serif" }}>{n.message}</p>
          </div>
          <button onClick={() => markRead(n.id)} style={{
            background: 'none', border: 'none', color: '#64748B', cursor: 'pointer',
            padding: 4
          }}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
