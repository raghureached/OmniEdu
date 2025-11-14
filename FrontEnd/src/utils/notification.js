const callNotifier = (config) => {
  if (typeof window !== 'undefined' && window.__omniNotify) {
    return window.__omniNotify(config);
  }

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn('Notification system not ready yet:', config);
  }
  return null;
};

export const notify = (config = {}) => callNotifier(config);

export const notifySuccess = (message, options = {}) => callNotifier({
  type: 'success',
  message,
  ...options,
});

export const notifyError = (message, options = {}) => callNotifier({
  type: 'error',
  message,
  ...options,
});

export const notifyWarning = (message, options = {}) => callNotifier({
  type: 'warning',
  message,
  ...options,
});

export const notifyInfo = (message, options = {}) => callNotifier({
  type: 'info',
  message,
  ...options,
});

export default {
  notify,
  notifySuccess,
  notifyError,
  notifyWarning,
  notifyInfo,
};
