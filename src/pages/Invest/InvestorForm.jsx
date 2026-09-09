import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMeta } from '../../hooks/useMeta';
import { Send, TrendingUp } from 'lucide-react';
import PublicHeader from '../../components/PublicHeader';
import PublicFooter from '../../components/PublicFooter';
import api from '../../services/api';
import styles from './InvestorForm.module.css';

const INITIAL_FORM = {
  name: '',
  organisation: '',
  email: '',
  phone: '',
  location: '',
  village_parish: '',
  country: '',
  amount: '',
  currency: 'USD',
  source: '',
  timeline: '',
  experience: '',
  message: '',
  consent: false,
};

export default function InvestorForm() {
  useMeta({
    title: 'Investor Application — EducFarm',
    description: 'Submit your investor enquiry to EducFarm. Share your investment interest, goals, and timeline. Help scale smart irrigation technology across Africa.',
    url: 'https://www.educfarm.com/invest/form',
  });
  const [form, setForm] = useState(INITIAL_FORM);
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
      await api.post('/investor-applications/', form);
      setSent(true);
    } catch (submissionError) {
      setError(submissionError.response?.data?.detail || 'We could not submit your application. Please try again.');
    }
  };

  return (
    <div className={styles.page}>
      <PublicHeader />
      <main className={styles.main}>
        <div className={styles.intro}>
          <Link to="/invest" className={styles.backLink}>Back to Investor Relations</Link>
          <span className={styles.eyebrow}><TrendingUp size={14} /> Investor application</span>
          <h1>Let&apos;s build the future of farming.</h1>
          <p>Tell us a little about yourself and your investment interest. Our team will review your enquiry and respond with the appropriate information and next steps.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {sent ? (
            <div className={styles.success}>
              <span className={styles.successMark}>✓</span>
              <h2>Application received.</h2>
              <p>Thank you, <strong>{form.name}</strong>. Your investor enquiry has been submitted successfully. The EducFarm team will review your application and reach out to you at <strong>{form.email}</strong> within a few business days.</p>
              <Link to="/invest" className={styles.secondaryButton}>Back to Investor Relations</Link>
            </div>
          ) : (
            <>
              <div className={styles.formHeader}>
                <h2>Investor information</h2>
                <p>Fields marked with * are required.</p>
              </div>

              <fieldset>
                <legend>About you</legend>
                <div className={styles.fieldGrid}>
                  <label>Full name *<input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required /></label>
                  <label>Organisation<input name="organisation" value={form.organisation} onChange={handleChange} placeholder="Company or fund name" /></label>
                  <label>Email address *<input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required /></label>
                  <label>Phone number<input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+256 ..." /></label>
                  <label>City or region *<input name="location" value={form.location} onChange={handleChange} placeholder="City or region" required /></label>
                  <label>Village / Parish *<input name="village_parish" value={form.village_parish} onChange={handleChange} placeholder="Village or parish" required /></label>
                  <label>Country *<input name="country" value={form.country} onChange={handleChange} placeholder="Country of residence" required /></label>
                </div>
              </fieldset>

              <fieldset>
                <legend>Investment interest</legend>
                <div className={styles.fieldGrid}>
                  <label>Planned investment amount *<input name="amount" type="number" min="1" step="any" value={form.amount} onChange={handleChange} placeholder="e.g. 25000" required /></label>
                  <label>Currency *<select name="currency" value={form.currency} onChange={handleChange} required><option>USD</option><option>UGX</option><option>EUR</option><option>GBP</option><option>KES</option></select></label>
                  <label>Source of funds *<select name="source" value={form.source} onChange={handleChange} required><option value="">Select one...</option><option>Personal funds</option><option>Investment fund</option><option>Family office</option><option>Institutional funds</option><option>Other</option></select></label>
                  <label>Expected investment timeline *<select name="timeline" value={form.timeline} onChange={handleChange} required><option value="">Select one...</option><option>Within 3 months</option><option>3 to 6 months</option><option>6 to 12 months</option><option>More than 12 months</option><option>Exploring opportunities</option></select></label>
                  <label className={styles.fullWidth}>Previous investment experience<textarea name="experience" value={form.experience} onChange={handleChange} placeholder="Tell us about relevant sectors, investments, or experience." rows="3" /></label>
                  <label className={styles.fullWidth}>What would you like to discuss?<textarea name="message" value={form.message} onChange={handleChange} placeholder="Share your questions, goals, or partnership interests." rows="4" /></label>
                </div>
              </fieldset>

              <label className={styles.consent}><input name="consent" type="checkbox" checked={form.consent} onChange={handleChange} required /> <span>I agree that EducFarm may contact me about this investment enquiry. *</span></label>
              <button className={styles.submitButton} type="submit"><Send size={16} /> Submit investor enquiry</button>
              {error && <p className={styles.error} role="alert">{error}</p>}
              <p className={styles.notice}>Please do not submit passwords or highly sensitive personal information through this form.</p>
            </>
          )}
        </form>
      </main>
      <PublicFooter />
    </div>
  );
}
