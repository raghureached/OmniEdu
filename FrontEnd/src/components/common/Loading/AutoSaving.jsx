import React, { useState, useEffect } from 'react';
import { Check, Loader, AlertCircle, Clock } from 'lucide-react';

export const AutoSaving = ({ status = 'idle', lastSaved = null }) => {

  
  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <Loader className="autosave-spinner" size={16} />,
          text: 'Saving...',
          className: 'autosave-saving'
        };
      case 'saved':
        return {
          icon: <Check size={16} />,
          text: 'Saved',
          className: 'autosave-saved'
        };
      case 'error':
        return {
          icon: <AlertCircle size={16} />,
          text: 'Failed to save',
          className: 'autosave-error'
        };
      case 'intial':
        return {
          icon: <Clock size={16} />,
          text: 'Not saved',
          className: 'autosave-idle'
        };
      default:
        return {
          icon: <Clock size={16} />,
          text: lastSaved ? `Saved ${formatTime(lastSaved)}` : 'Not saved',
          className: 'autosave-idle'
        };
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(date).toLocaleDateString();
  };

  const config = getStatusConfig();

  return (
    <>
      <style>{`
        .autosave-indicator {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .autosave-idle {
          color: #6b7280;
          background: #f3f4f6;
        }

        .autosave-saving {
          color: #5570f1;
          background: linear-gradient(135deg, #eff3ff 0%, #e0e7ff 100%);
          animation: pulse 2s ease-in-out infinite;
        }

        .autosave-saved {
          color: #10b981;
          background: #d1fae5;
          animation: slideIn 0.3s ease-out;
        }

        .autosave-error {
          color: #ef4444;
          background: #fee2e2;
          animation: shake 0.5s ease-out;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        @keyframes slideIn {
          from {
            transform: translateY(-5px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .autosave-spinner {
          animation: spin 1s linear infinite;
        }

        /* Compact version */
        .autosave-indicator.compact {
          padding: 6px 12px;
          font-size: 13px;
        }

        .autosave-indicator.compact svg {
          width: 14px;
          height: 14px;
        }
      `}</style>

      <div className={`autosave-indicator ${config.className}`}>
        {config.icon}
        <span>{config.text}</span>
      </div>
    </>
  );
};