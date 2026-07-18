import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead, readIds } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggle = () => {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen) markAllRead();
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={toggle}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          fontSize: 22,
          padding: 6,
        }}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              background: '#dc2626',
              color: 'white',
              borderRadius: '50%',
              fontSize: 11,
              fontWeight: 700,
              width: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 38,
            width: 340,
            maxHeight: 420,
            overflowY: 'auto',
            background: 'white',
            borderRadius: 10,
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            border: '1px solid #e5e7eb',
            zIndex: 100,
          }}
        >
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', fontWeight: 700 }}>
            Notifications
          </div>
          {notifications.length === 0 ? (
            <p style={{ padding: 20, color: '#6b7280', fontSize: 14 }}>You're all caught up 🎉</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f5f5f5',
                  display: 'flex',
                  gap: 10,
                  background: readIds.includes(n.id) ? 'white' : '#f0fdf4',
                }}
              >
                <span style={{ fontSize: 18 }}>{n.type === 'success' ? '✅' : '⚠️'}</span>
                <div>
                  <p style={{ margin: 0, fontSize: 13.5, color: '#111827', lineHeight: 1.4 }}>{n.message}</p>
                  {n.date && (
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>
                      {new Date(n.date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}