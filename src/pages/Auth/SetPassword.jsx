import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import EducFarmLogo from '../../components/EducFarmLogo';
import styles from './Login.module.css';
import sp from './SetPassword.module.css';

export default function SetPassword() {
  const navigate          = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Passwords do not match.');
    if (password.length < 8)  return setError('Password must be at least 8 characters.');
    setLoading(true);
    try {
      const { data } = await api.post('/set-password/', { new_password: password });
      localStorage.setItem('token', data.access);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to set password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <div className={styles.logoBorder}>
            <EducFarmLogo size={38} variant="dark" showText={true} />
          </div>
        </div>
        <div className={sp.iconWrap}><ShieldCheck size={28} color="#10b981" /></div>
        <p className={styles.title}>Set Your Password</p>
        <p className={sp.hint}>You signed in with a temporary password. Choose a permanent password to secure your account.</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label className={styles.label}>New Password</label>
            <div className={styles.passwordWrapper}>
              <input className={styles.input}
                type={showPwd ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min 8 characters" required />
              <button type="button" className={styles.toggleBtn} onClick={() => setShowPwd(v => !v)}>
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Confirm Password</label>
            <input className={styles.input}
              type={showPwd ? 'text' : 'password'}
              value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat new password" required />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Saving…' : 'Set Password & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
