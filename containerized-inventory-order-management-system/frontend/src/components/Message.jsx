import { useEffect } from 'react';

/**
 * Displays a success or error banner with optional auto-dismiss.
 * Props:
 *   type: 'success' | 'error'
 *   message: string
 *   onClose: () => void
 *   autoDismiss: number (ms, default 4000, 0 = no auto-dismiss)
 */
export default function Message({ type = 'success', message, onClose, autoDismiss = 4000 }) {
  useEffect(() => {
    if (!message || autoDismiss === 0) return;
    const timer = setTimeout(onClose, autoDismiss);
    return () => clearTimeout(timer);
  }, [message, autoDismiss, onClose]);

  if (!message) return null;

  return (
    <div className={`message message-${type}`} role="alert">
      <span className="message-icon">{type === 'success' ? '✅' : '❌'}</span>
      <span className="message-text">{message}</span>
      <button className="message-close" onClick={onClose} aria-label="Close">×</button>
    </div>
  );
}
