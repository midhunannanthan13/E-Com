import React from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/google.css';

// Same address the rest of the app uses to reach the backend (see api/axios.js).
const API_ROOT = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

// Friendly messages for the error codes sent back by the backend.
const MESSAGES = {
  access_denied: 'Google sign-in was cancelled. You can try again whenever you are ready.',
  invalid_state: 'That sign-in attempt expired. Please click "Continue with Google" again.',
  missing_code: 'Google did not return a sign-in code. Please try again.',
  google_unreachable: 'We could not reach Google just now. Please try again in a moment.',
  email_not_verified: 'Your Google email is not verified, so we cannot sign you in with it.',
  account_disabled: 'This account is disabled. Please contact support.',
  not_configured: 'Google sign-in is not set up yet. Please use your username and password.',
  profile_failed: 'You were signed in with Google, but we could not load your profile. Please try again.',
};

/** "or" divider + Continue with Google button + a friendly error if Google sent one back. */
export default function GoogleButton({ next = '/' }) {
  const { search } = useLocation();
  const code = new URLSearchParams(search).get('google_error');

  const start = () => {
    window.location.href = `${API_ROOT}/auth/google/login/?next=${encodeURIComponent(next)}`;
  };

  return (
    <>
      <div className="google-divider">or</div>
      <button type="button" className="btn-google" onClick={start}>
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        Continue with Google
      </button>
      <p className="google-note">No password needed. We only receive your name and verified email.</p>
      {code && <p className="field-error google-error">{MESSAGES[code] || 'Google sign-in failed. Please try again.'}</p>}
    </>
  );
}
