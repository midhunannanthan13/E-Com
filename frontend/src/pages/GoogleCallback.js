import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { tokenStore } from '../api/axios';

/**
 * The backend sends the shopper here after Google sign-in, with the JWT in the
 * URL fragment (#access=...&refresh=...&next=...). We store it exactly the way
 * a normal sign-in does (api/axios.js -> tokenStore, plus the "user" entry that
 * AuthContext reads), then reload into the page they wanted.
 */
export default function GoogleCallback() {
  const navigate = useNavigate();
  const ran = useRef(false);   // React StrictMode runs effects twice in development

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const access = params.get('access');
    const refresh = params.get('refresh');
    const rawNext = params.get('next') || '/';
    const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/';

    // Remove the tokens from the address bar straight away.
    window.history.replaceState(null, '', window.location.pathname);

    if (!access || !refresh) {
      navigate('/signin', { replace: true });
      return;
    }

    tokenStore.set({ access, refresh });
    api.get('/accounts/profile/')
      .then(({ data }) => {
        localStorage.setItem('user', JSON.stringify(data));
        window.location.replace(next);   // full reload so AuthContext picks up the new user
      })
      .catch(() => {
        tokenStore.clear();
        navigate('/signin?google_error=profile_failed', { replace: true });
      });
  }, [navigate]);

  return (
    <div className="google-callback">
      <p>Signing you in with Google…</p>
    </div>
  );
}
