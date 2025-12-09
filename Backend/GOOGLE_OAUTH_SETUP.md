# Google OAuth Setup Instructions

## 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API and Google OAuth2 API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Select "Web application"
6. Add authorized redirect URI: `http://localhost:5000/auth/google/callback`
7. Copy Client ID and Client Secret

## 2. Backend Configuration

1. Copy `.env.example` to `.env`
2. Add your Google OAuth credentials:
   ```
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
   SESSION_SECRET=your_session_secret_here
   FRONTEND_URL=http://localhost:3000
   ```

## 3. Frontend Configuration

1. Copy `.env.example` to `.env`
2. Add backend URL:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

## 4. How It Works

1. User clicks "Google" button on login page
2. Redirects to `/auth/google` (backend)
3. Passport.js redirects to Google OAuth
4. User authenticates with Google
5. Google redirects back to `/auth/google/callback`
6. Backend finds/creates user account
7. Generates JWT tokens and sets cookies
8. Redirects to appropriate dashboard based on user role

## 5. Security Notes

- Users must already exist in the database (no auto-registration)
- Supports both GlobalAdmin and regular User accounts
- Uses same JWT token system as regular login
- Session management handled by Passport.js

## 6. Testing

1. Start backend server
2. Start frontend application
3. Navigate to login page
4. Click "Google" button
5. Complete Google authentication flow
