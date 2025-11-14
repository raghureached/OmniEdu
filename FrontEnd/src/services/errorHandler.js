import { notifyError } from "../utils/notification";

// Catch all unhandled errors
window.onerror = function (message, source, lineno, colno, error) {
  console.error("Global Error Caught:", { message, source, lineno, colno, error });
  notifyError("Something went wrong! Please try again.");
  return true; // prevent the red overlay
};

// Catch unhandled Promise rejections (like Axios errors)
window.onunhandledrejection = function (event) {
  console.error("Unhandled Promise Rejection:", event.reason);
  notifyError("Something went wrong! Please try again.");
  return true; // prevent the overlay
};
