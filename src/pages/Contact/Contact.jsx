import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { useMeta } from '../../hooks/useMeta';
import PublicHeader from '../../components/PublicHeader';
import PublicFooter from '../../components/PublicFooter';
import styles from './Contact.module.css';

export default function Contact() {
  useMeta({
    title: 'Contact EducFarm — Get in Touch',
    description: 'Have a question, want to order a kit, or need support? Contact the EducFarm team by email, WhatsApp, or phone. Based in Fort Portal, Uganda.',
    url: 'https://www.educfarm.com/contact',
    keywords: 'contact EducFarm, EducFarm support, order irrigation kit Uganda, EducFarm WhatsApp, EducFarm phone, Fort Portal Uganda agritech',
  });
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    const mailto = `mailto:educarmcompanylimited@gmail.com?subject=${encodeURIComponent(form.subject || 'Contact from ' + form.name)}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`;
    window.location.href = mailto;
    setSent(true);
  };

  return (
    <div className={styles.page}>

      <PublicHeader />

      {/* ── Hero ── */}
      <div className={styles.heroSection}>
        <div className={styles.blob1} />
        <div className={styles.blob2} />
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}><MessageSquare size={13} /> Get in Touch</div>
          <h1 className={styles.heroTitle}>We'd love to <span className={styles.heroAccent}>hear from you</span></h1>
          <p className={styles.heroSub}>Have a question, want to order a kit, or need support? Drop us a message and we'll get back to you quickly.</p>
          <div className={styles.heroMeta}>
            <span className={styles.metaChip}><Clock size={13} /> Replies within 24 hours</span>
            <span className={styles.metaChip}><FaWhatsapp size={13} /> WhatsApp available</span>
          </div>
        </div>
        <div className={styles.waveDivider}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#fff" />
          </svg>
        </div>
      </div>

      {/* ── Content ── */}
      <div className={styles.content}>

        {/* Info column */}
        <div className={styles.infoCol}>
          <p className={styles.infoHeading}>Contact details</p>

          <div className={styles.infoCard}>
            <span className={styles.infoIcon}><Mail size={20} strokeWidth={1.8} /></span>
            <div>
              <h3 className={styles.infoTitle}>Email</h3>
              <a href="mailto:educarmcompanylimited@gmail.com" className={styles.infoValue}>educarmcompanylimited@gmail.com</a>
            </div>
          </div>

          <div className={styles.infoCard}>
            <span className={styles.infoIcon} style={{ background: '#dcfce7', color: '#16a34a' }}><FaWhatsapp size={20} /></span>
            <div>
              <h3 className={styles.infoTitle}>WhatsApp / Official Line</h3>
              <a href="tel:+256794448439" className={styles.infoValue}>+256 794 448 439</a>
              <a href="https://wa.me/256794448439" target="_blank" rel="noopener noreferrer" className={styles.infoValueSub}>
                <FaWhatsapp size={13} /> Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className={styles.infoCard}>
            <span className={styles.infoIcon} style={{ background: '#eff6ff', color: '#2563eb' }}><Phone size={20} strokeWidth={1.8} /></span>
            <div>
              <h3 className={styles.infoTitle}>Phone</h3>
              <a href="tel:+256754320214" className={styles.infoValue}>+256 754 320 214</a>
              <a href="tel:+256785905091" className={styles.infoValue} style={{ display: 'block', marginTop: '0.2rem' }}>+256 785 905 091</a>
            </div>
          </div>

          <div className={styles.infoCard}>
            <span className={styles.infoIcon} style={{ background: '#fef9c3', color: '#ca8a04' }}><MapPin size={20} strokeWidth={1.8} /></span>
            <div>
              <h3 className={styles.infoTitle}>Location</h3>
              <p className={styles.infoValue}>Kyebambe, Fort Portal City, Uganda</p>
            </div>
          </div>

          <div className={styles.responseCard}>
            <Clock size={16} strokeWidth={2} className={styles.responseIcon} />
            <div>
              <p className={styles.responseTitle}>Quick response</p>
              <p className={styles.responseSub}>We typically reply within 24 hours on business days.</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Send us a message</h2>
            <p className={styles.formSub}>Fill in the form and we'll get back to you as soon as possible.</p>
          </div>

          {sent ? (
            <div className={styles.successMsg}>
              <span className={styles.successIcon}>✅</span>
              <p>Your email client has been opened. Send the email to reach us!</p>
              <button type="button" className={styles.resetBtn} onClick={() => setSent(false)}>
                Send another message <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Your Name</label>
                  <input className={styles.input} name="name" value={form.name} onChange={handleChange} placeholder="Ayesiga Winnie" required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Email Address</label>
                  <input className={styles.input} name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Subject</label>
                <input className={styles.input} name="subject" value={form.subject} onChange={handleChange} placeholder="e.g. Order a kit, Support, Partnership..." />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Message</label>
                <textarea className={styles.textarea} name="message" value={form.message} onChange={handleChange} placeholder="Tell us how we can help..." rows={6} required />
              </div>
              <div className={styles.submitRow}>
                <button className={styles.submitBtn} type="submit">
                  <Send size={15} strokeWidth={2.2} /> Send Message
                </button>
              </div>
            </>
          )}
        </form>
      </div>

      <PublicFooter />
    </div>
  );
}
