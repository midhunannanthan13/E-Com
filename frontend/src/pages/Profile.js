import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { firstErrorMessage } from '../api/axios';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    postal_code: user?.postal_code || '',
    country: user?.country || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await updateProfile(form);
      toast('Profile updated.', 'success');
    } catch (err) {
      setError(firstErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid px-4 py-4">
      <h1 className="page-heading"><i className="bi bi-person"></i> Your profile</h1>

      <div className="row">
        <div className="col-12 col-lg-6">
          <section className="panel">
            <h2 className="panel__heading">Account</h2>
            <p className="dim">
              <strong>{user?.username}</strong> · {user?.email}
              {user?.is_staff && <span className="admin-tag"> · admin</span>}
            </p>

            <hr />

            <h2 className="panel__heading">Shipping details</h2>
            <form onSubmit={handleSubmit} className="field-stack" noValidate>
              <label className="field-label">Phone</label>
              <input type="text" className="field-input" value={form.phone} onChange={set('phone')} />

              <label className="field-label">Address</label>
              <input type="text" className="field-input" value={form.address} onChange={set('address')} />

              <div className="row g-3">
                <div className="col-sm-6">
                  <label className="field-label">City</label>
                  <input type="text" className="field-input" value={form.city} onChange={set('city')} />
                </div>
                <div className="col-sm-6">
                  <label className="field-label">Postal code</label>
                  <input type="text" className="field-input" value={form.postal_code} onChange={set('postal_code')} />
                </div>
              </div>

              <label className="field-label">Country</label>
              <input type="text" className="field-input" value={form.country} onChange={set('country')} />

              {error && <p className="field-error">{error}</p>}

              <button type="submit" className="btn btn--primary" disabled={submitting}>
                <i className="bi bi-check2"></i> {submitting ? 'Saving…' : 'Save changes'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
