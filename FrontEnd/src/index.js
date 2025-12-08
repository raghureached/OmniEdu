import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import store from './store';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ErrorBoundary from './pages/ErrorBoundary';
import './services/errorHandler';
import { NotificationProvider } from './components/common/Notification/NotificationProvider';
import { ConfirmDialogProvider} from "./components/ConfirmDialogue/ConfirmDialog"
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ConfirmDialogProvider>
      <ErrorBoundary>
        <Provider store={store}>
          <NotificationProvider>
            <Router>
              <App />
            </Router>
          </NotificationProvider>
        </Provider>
      </ErrorBoundary>
    </ConfirmDialogProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
