import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Send, MessageSquare } from 'lucide-react';
import { useMeta } from '../../hooks/useMeta';
import PublicHeader from '../../components/PublicHeader';
import PublicFooter from '../../components/PublicFooter';
import api from '../../services/api';
import styles from './RequestForm.module.css';

const INITIAL_FORM = { name: '', organisation: '', email: '', phone: '', location: '', village_parish: '', country: '', request_type: '', message: '', consent: false };

export default function RequestForm() {
  useMeta({
    title: 'Business Request — EducFarm',
    description: 'Explore strategic partnerships and distribution opportunities with EducFarm. Submit a business request and our team will get back to you.',
    url: 'https://www.educfarm.com/request',
    keywords: 'EducFarm business request, strategic partnership EducFarm, distribution opportunity Uganda, agritech business request Africa, EducFarm collaboration',
  });
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(() => ({ ...INITIAL_FORM, request_type: searchParams.get('type') || '' }));
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleChange = event => {
    const { name, value, type, checked } = event.target;
    setForm(current => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    try {
      await api.post('/business-requests/', form);
      setSent(true);
    } catch (submissionError) {
      setError(submissionError.response?.data?.detail || 'We could not submit your request. Please try again.');
    }
  };

  return (
    <div className={styles.page}>
      <PublicHeader />
      <main className={styles.main}>
        <Link to="/invest" className={styles.backLink}>Back to Investor Relations</Link>
        <section className={styles.hero}>
          <span className={styles.eyebrow}><MessageSquare size={14} /> Business request</span>
          <h1>Let&apos;s explore what we can build together.</h1>
          <p>Use this form to explore strategic partnerships and distribution opportunities with EducFarm.</p>
        </section>

        <form className={styles.form} onSubmit={handleSubmit}>
          {sent ? (
            <div className={styles.success}>
              <span className={styles.successMark}>✓</span>
              <h2>Request received.</h2>
              <p>Thank you. The EducFarm team will review your request and contact you with the next steps.</p>
              <Link to="/invest" className={styles.secondaryButton}>Return to Investor Relations</Link>
            </div>
          ) : (
            <>
              <div className={styles.formHeader}><h2>Tell us about your request</h2><p>Fields marked with * are required.</p></div>
              <div className={styles.grid}>
                <label>Full name *<input name="name" value={form.name} onChange={handleChange} required /></label>
                <label>Organisation<input name="organisation" value={form.organisation} onChange={handleChange} /></label>
                <label>Email address *<input name="email" type="email" value={form.email} onChange={handleChange} required /></label>
                <label>Phone number<input name="phone" type="tel" value={form.phone} onChange={handleChange} /></label>
                <label>City or region *<input name="location" value={form.location} onChange={handleChange} required /></label>
                <label>Village / Parish *<input name="village_parish" value={form.village_parish} onChange={handleChange} required /></label>
                <label>Country *<input name="country" value={form.country} onChange={handleChange} required /></label>
                <label>Request type *<select name="request_type" value={form.request_type} onChange={handleChange} required><option value="">Select one...</option><option>Strategic Partnership</option><option>Distribution Opportunity</option><option>Other</option></select></label>
                <label className={styles.fullWidth}>How can we help? *<textarea name="message" value={form.message} onChange={handleChange} rows="5" required /></label>
              </div>
              <label className={styles.consent}><input name="consent" type="checkbox" checked={form.consent} onChange={handleChange} required /> <span>I agree that EducFarm may contact me about this request. *</span></label>
              {error && <p className={styles.error} role="alert">{error}</p>}
              <button className={styles.submitButton} type="submit"><Send size={16} /> Submit request</button>
            </>
          )}
        </form>
      </main>
      <PublicFooter />
    </div>
  );
}
