import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  X,
} from 'lucide-react';
import './Notification.css';

const NotificationContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const TITLES = {
  success: 'Success',
  error: 'Something went wrong',
  warning: 'Please check',
  info: 'Heads up',
};

const MAX_NOTIFICATIONS = 4;

const NotificationCard = ({
  id,
  type,
  title,
  message,
  onClose,
  duration,
  dismissible,
  action,
}) => {
  const Icon = ICONS[type] || Info;
  const autoCloseTimer = useRef(null);

  useEffect(() => {
    if (!duration) return undefined;

    autoCloseTimer.current = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => {
      if (autoCloseTimer.current) {
        clearTimeout(autoCloseTimer.current);
      }
    };
  }, [duration, id, onClose]);

  return (
    <div className={`notification-card notification-${type}`} role="status" aria-live="polite">
      <div className="notification-icon">
        <Icon size={20} aria-hidden="true" />
      </div>
      <div className="notification-content">
        <p className="notification-title">{title}</p>
        {message && <p className="notification-message">{message}</p>}
        {action && (
          <button
            type="button"
            className="notification-action"
            onClick={() => {
              action.onClick?.();
              onClose(id);
            }}
          >
            {action.label}
          </button>
        )}
      </div>
      {dismissible && (
        <button
          type="button"
          className="notification-close"
          onClick={() => onClose(id)}
          aria-label="Dismiss notification"
        >
          <X size={16}/>
        </button>
      )}
      {duration ? (
        <span
          className="notification-progress"
          style={{ animationDuration: `${duration}ms` }}
        />
      ) : null}
    </div>
  );
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showNotification = useCallback((config) => {
    const {
      type = 'info',
      title,
      message,
      duration = 5000,
      dismissible = true,
      action,
      id: customId,
    } = config;

    const id = customId || (typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

    setNotifications((prev) => {
      const next = [
        ...prev,
        {
          id,
          type,
          title: title || TITLES[type] || TITLES.info,
          message,
          duration,
          dismissible,
          action,
        },
      ];

      if (next.length > MAX_NOTIFICATIONS) {
        next.shift();
      }
      return next;
    });

    return id;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const notifier = (config) => showNotification(config);
    window.__omniNotify = notifier;

    return () => {
      if (window.__omniNotify === notifier) {
        delete window.__omniNotify;
      }
    };
  }, [showNotification]);

  const value = useMemo(
    () => ({
      showNotification,
      removeNotification,
    }),
    [removeNotification, showNotification],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="notification-stack" role="region" aria-label="Notifications">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              {...notification}
              onClose={removeNotification}
            />
          ))}
        </div>,
        document.body,
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationProvider;
