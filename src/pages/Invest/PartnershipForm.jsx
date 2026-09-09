import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMeta } from '../../hooks/useMeta';
import { Send, Handshake } from 'lucide-react';
import PublicHeader from '../../components/PublicHeader';
import PublicFooter from '../../components/PublicFooter';
import api from '../../services/api';
import styles from './PartnershipForm.module.css';

const INITIAL_FORM = {
  name: '', organisation: '', email: '', phone: '', location: '', village_parish: '', country: '',
  partner_type: '', business_area: '', products: '', markets: '', capacity: '',
  website: '', interest: '', message: '', consent: false,
};

export default function PartnershipForm() {
  useMeta({
    title: 'Partnership Application — EducFarm',
    description: 'Become an EducFarm partner. Whether you are a trader, buyer, distributor, institution, or technology partner — let’s grow the future of farming together.',
    url: 'https://www.educfarm.com/partnership',
    keywords: 'EducFarm partnership, agritech partner Uganda, irrigation distribution partner, farming technology partnership Africa, EducFarm distributor, agricultural partnership Uganda',
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
      await api.post('/partnership-applications/', form);
      setSent(true);
    } catch (submissionError) {
      setError(submissionError.response?.data?.detail || 'We could not submit your partnership application. Please try again.');
    }
  };

  return (
    <div className={styles.page}>
      <PublicHeader />
      <main className={styles.main}>
        <Link to="/invest" className={styles.backLink}>Back to Investor Relations</Link>
        <section className={styles.hero}>
          <span className={styles.eyebrow}><Handshake size={14} /> Partnership application</span>
          <h1>Let&apos;s grow the future of farming together.</h1>
          <p>Whether you are a trader, buyer, distributor, institution, or technology partner, tell us how we can create value together.</p>
        </section>

        <form className={styles.form} onSubmit={handleSubmit}>
          {sent ? (
            <div className={styles.success}>
              <span className={styles.successMark}>✓</span>
              <h2>Application received.</h2>
              <p>Thank you. The EducFarm team will review your details and contact you about the next steps.</p>
              <Link to="/invest" className={styles.secondaryButton}>Return to Investor Relations</Link>
            </div>
          ) : (
            <>
              <div className={styles.formHeader}><h2>Partnership information</h2><p>Fields marked with * are required.</p></div>
              <fieldset>
                <legend>About you and your organisation</legend>
                <div className={styles.grid}>
                  <label>Contact person *<input name="name" value={form.name} onChange={handleChange} placeholder="Full name" required /></label>
                  <label>Organisation *<input name="organisation" value={form.organisation} onChange={handleChange} placeholder="Company or organisation" required /></label>
                  <label>Email address *<input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required /></label>
                  <label>Phone number<input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+256 ..." /></label>
                  <label>City or region *<input name="location" value={form.location} onChange={handleChange} placeholder="City or region" required /></label>
                  <label>Village / Parish *<input name="village_parish" value={form.village_parish} onChange={handleChange} placeholder="Village or parish" required /></label>
                  <label>Country *<input name="country" value={form.country} onChange={handleChange} placeholder="Country" required /></label>
                  <label>Partner type *<select name="partner_type" value={form.partner_type} onChange={handleChange} required><option value="">Select one...</option><option>Trader</option><option>Buyer</option><option>Distributor</option><option>Farmer organisation</option><option>Government or NGO</option><option>Technology partner</option><option>Other business partner</option></select></label>
                  <label>Website or social link<input name="website" type="url" value={form.website} onChange={handleChange} placeholder="https://..." /></label>
                </div>
              </fieldset>

              <fieldset>
                <legend>Your opportunity</legend>
                <div className={styles.grid}>
                  <label>Business area *<input name="business_area" value={form.business_area} onChange={handleChange} placeholder="e.g. produce trading, retail, logistics" required /></label>
                  <label>Markets or locations served *<input name="markets" value={form.markets} onChange={handleChange} placeholder="Regions or countries" required /></label>
                  <label className={styles.fullWidth}>Products, services, or buyer needs<textarea name="products" value={form.products} onChange={handleChange} placeholder="Tell us what you sell, distribute, source, or need." rows="3" /></label>
                  <label className={styles.fullWidth}>Capacity or reach<textarea name="capacity" value={form.capacity} onChange={handleChange} placeholder="Share volumes, number of customers, distribution reach, or other useful context." rows="3" /></label>
                  <label className={styles.fullWidth}>How would you like to work with EducFarm? *<textarea name="interest" value={form.interest} onChange={handleChange} placeholder="Describe the partnership, collaboration, or opportunity you have in mind." rows="4" required /></label>
                  <label className={styles.fullWidth}>Additional message<textarea name="message" value={form.message} onChange={handleChange} placeholder="Add any questions or important details." rows="4" /></label>
                </div>
              </fieldset>

              <label className={styles.consent}><input name="consent" type="checkbox" checked={form.consent} onChange={handleChange} required /> <span>I agree that EducFarm may contact me about this partnership application. *</span></label>
              {error && <p className={styles.error} role="alert">{error}</p>}
              <button className={styles.submitButton} type="submit"><Send size={16} /> Submit partnership application</button>
            </>
          )}
        </form>
      </main>
      <PublicFooter />
    </div>
  );
}
