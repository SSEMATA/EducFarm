import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Pencil, Check, X, Lock, Trash2, ChevronLeft, ChevronDown, ChevronUp, CheckCircle2, Camera } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { ensureFreshAvatar } from '../../utils/avatarCache';
import styles from './AccountSettings.module.css';

/* ── Single editable row ──────────────────────────────────────────── */
function EditRow({ label, value, inputType = 'text', placeholder, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(value || '');
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState(null); // {ok, text}

  const open  = () => { setDraft(value || ''); setMsg(null); setEditing(true); };
  const close = () => { setEditing(false); setMsg(null); };

  const save = async () => {
    if (draft.trim() === (value || '').trim()) { close(); return; }
    setSaving(true);
    setMsg(null);
    try {
      await onSave(draft.trim());
      setMsg({ ok: true, text: 'Saved.' });
      setEditing(false);
    } catch (err) {
      setMsg({ ok: false, text: err.response?.data?.detail || 'Failed to save.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.row}>
      <div className={styles.rowMeta}>
        <span className={styles.rowLabel}>{label}</span>
        {!editing && (
          <span className={styles.rowValue}>{value || <span className={styles.rowEmpty}>Not set</span>}</span>
        )}
        {editing && (
          <input
            className={styles.rowInput}
            type={inputType}
            value={draft}
            placeholder={placeholder}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') close(); }}
          />
        )}
        {msg && (
          <span className={msg.ok ? styles.inlineOk : styles.inlineErr}>
            {msg.ok && <CheckCircle2 size={12} />} {msg.text}
          </span>
        )}
      </div>
      <div className={styles.rowActions}>
        {!editing ? (
          <button className={styles.editBtn} onClick={open}><Pencil size={13} /> Edit</button>
        ) : (
          <>
            <button className={styles.saveRowBtn} onClick={save} disabled={saving}>
              <Check size={13} /> {saving ? '…' : 'Save'}
            </button>
            <button className={styles.cancelRowBtn} onClick={close}><X size={13} /></button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────────── */
export default function AccountSettings() {
  const navigate = useNavigate();
  const { user, setUser, login, logout } = useAuth();
  const backPath = user?.is_staff ? '/admin/dashboard' : '/settings';

  /* ── Avatar ───────────────────────────────────────────────────────── */
  const fileRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile,    setAvatarFile]    = useState(null);
  const [avatarSaving,  setAvatarSaving]  = useState(false);
  const [avatarMsg,     setAvatarMsg]     = useState(null);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setAvatarMsg({ ok: false, text: 'Image must be under 2 MB.' }); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarMsg(null);
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;
    setAvatarSaving(true);
    setAvatarMsg(null);
    try {
      const form = new FormData();
      form.append('avatar', avatarFile);
      const uploadResp = await api.post('/users/me/avatar/', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      // Update user with new avatar URL that includes cache-buster
      const newUser = { ...user, avatar_url: uploadResp.data.avatar_url };
      setUser(newUser);
      setAvatarPreview(null);
      setAvatarFile(null);
      setAvatarMsg({ ok: true, text: 'Avatar updated.' });
    } catch (err) {
      setAvatarMsg({ ok: false, text: err.response?.data?.detail || 'Upload failed.' });
    } finally {
      setAvatarSaving(false);
    }
  };

  const cancelAvatar = () => { setAvatarPreview(null); setAvatarFile(null); setAvatarMsg(null); };

  const [pwdOpen,   setPwdOpen]   = useState(false);
  const [pwd,       setPwd]       = useState({ current: '', next: '', confirm: '' });
  const [showPwd,   setShowPwd]   = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg,    setPwdMsg]    = useState(null);

  const [deletePass,    setDeletePass]    = useState('');
  const [showDelPwd,    setShowDelPwd]    = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting,      setDeleting]      = useState(false);
  const [deleteMsg,     setDeleteMsg]     = useState('');

  /* ── Generic field saver — patches only the one field, refreshes context ── */
  const saveField = (fieldKey) => async (value) => {
    await api.patch('/users/me/', { [fieldKey]: value });
    const { data } = await api.get('/users/me/');
    setUser(data);
  };

  /* ── Password change ──────────────────────────────────────────────── */
  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPwdMsg(null);
    if (pwd.next !== pwd.confirm) return setPwdMsg({ ok: false, text: 'Passwords do not match.' });
    if (pwd.next.length < 8)      return setPwdMsg({ ok: false, text: 'Min 8 characters.' });
    setPwdSaving(true);
    try {
      const { data } = await api.patch('/users/me/', {
        current_password: pwd.current,
        new_password:     pwd.next,
      });
      login(data.access, data.refresh, data.user);
      setPwd({ current: '', next: '', confirm: '' });
      setPwdMsg({ ok: true, text: 'Password changed.' });
      setPwdOpen(false);
    } catch (err) {
      setPwdMsg({ ok: false, text: err.response?.data?.detail || 'Failed.' });
    } finally {
      setPwdSaving(false);
    }
  };

  /* ── Delete account ───────────────────────────────────────────────── */
  const handleDelete = async () => {
    setDeleteMsg('');
    setDeleting(true);
    try {
      await api.delete('/users/me/', { data: { current_password: deletePass } });
      logout();
      navigate('/login');
    } catch (err) {
      setDeleteMsg(err.response?.data?.detail || 'Failed to delete account.');
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className={styles.page}>

        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(backPath)}>
            <ChevronLeft size={16} /> Back
          </button>
          <div>
            <h1 className={styles.title}>Account Settings</h1>
            <p className={styles.subtitle}>Manage your profile, password and account</p>
          </div>
        </div>

        {/* ── Avatar ─────────────────────────────────────────── */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Profile Photo</p>
          <div className={styles.avatarRow}>
            <div className={styles.avatarWrap}>
              <img
                src={avatarPreview || ensureFreshAvatar(user?.avatar_url) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'U')}&background=2d7a4f&color=fff&size=128`}
                alt="avatar"
                className={styles.avatarImg}
              />
              <button className={styles.avatarEditBtn} onClick={() => fileRef.current.click()} title="Change photo">
                <Camera size={13} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />
            </div>
            <div className={styles.avatarMeta}>
              <span className={styles.avatarName}>{user?.full_name}</span>
              <span className={styles.avatarHint}>JPG or PNG, max 2 MB</span>
              {avatarPreview && (
                <div className={styles.avatarActions}>
                  <button className={styles.saveRowBtn} onClick={uploadAvatar} disabled={avatarSaving}>
                    <Check size={13} /> {avatarSaving ? 'Uploading…' : 'Save photo'}
                  </button>
                  <button className={styles.cancelRowBtn} onClick={cancelAvatar}><X size={13} /></button>
                </div>
              )}
              {avatarMsg && (
                <span className={avatarMsg.ok ? styles.inlineOk : styles.inlineErr}>
                  {avatarMsg.ok && <CheckCircle2 size={12} />} {avatarMsg.text}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Profile fields ─────────────────────────────────── */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Profile</p>
          <EditRow label="Full Name"    value={user?.full_name}    placeholder="Your full name"   onSave={saveField('full_name')} />
          <EditRow label="Farm Name"    value={user?.farm_name}    placeholder="Optional"         onSave={saveField('farm_name')} />
          <EditRow label="Email"        value={user?.email}        inputType="email" placeholder="your@email.com" onSave={saveField('email')} />
          <EditRow label="Phone Number" value={user?.phone_number} placeholder="e.g. 0786023858"  onSave={saveField('phone_number')} />
        </div>

        {/* ── Password ───────────────────────────────────────── */}
        <div className={styles.section}>
          <button className={styles.collapseTrigger} onClick={() => { setPwdOpen(v => !v); setPwdMsg(null); }}>
            <span className={styles.sectionTitle} style={{margin:0}}><Lock size={13} style={{marginRight:5}} />Change Password</span>
            {pwdOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {pwdOpen && (
            <form onSubmit={handlePasswordSave} className={styles.pwdForm}>
              <div className={styles.pwdField}>
                <label className={styles.rowLabel}>Current Password</label>
                <div className={styles.pwdWrap}>
                  <input className={styles.rowInput} type={showPwd ? 'text' : 'password'}
                    value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
                    placeholder="Your current password" required />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPwd(v => !v)}>
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div className={styles.pwdField}>
                <label className={styles.rowLabel}>New Password</label>
                <input className={styles.rowInput} type={showPwd ? 'text' : 'password'}
                  value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
                  placeholder="Min 8 characters" required />
              </div>
              <div className={styles.pwdField}>
                <label className={styles.rowLabel}>Confirm New Password</label>
                <input className={styles.rowInput} type={showPwd ? 'text' : 'password'}
                  value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                  placeholder="Repeat new password" required />
              </div>
              {pwdMsg && (
                <div className={pwdMsg.ok ? styles.msgOk : styles.msgErr}>
                  {pwdMsg.ok && <CheckCircle2 size={13} />} {pwdMsg.text}
                </div>
              )}
              <div className={styles.pwdActions}>
                <button type="submit" className={styles.saveBtn} disabled={pwdSaving}>
                  {pwdSaving ? 'Changing…' : 'Change Password'}
                </button>
                <button type="button" className={styles.cancelRowBtn}
                  onClick={() => { setPwdOpen(false); setPwd({ current: '', next: '', confirm: '' }); setPwdMsg(null); }}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── Delete Account ─────────────────────────────────── */}
        <div className={styles.section}>
          <p className={styles.sectionTitle} style={{color:'#ef4444'}}><Trash2 size={13} style={{marginRight:5}} />Delete Account</p>
          {!deleteConfirm ? (
            <div className={styles.deleteIntro}>
              <p className={styles.deleteWarning}>
                Permanently deletes your account, all devices, farm settings and data. This cannot be undone.
              </p>
              <button className={styles.deleteOpenBtn} onClick={() => setDeleteConfirm(true)}>
                Delete my account
              </button>
            </div>
          ) : (
            <div className={styles.deleteForm}>
              <p className={styles.deleteWarning}>Enter your password to confirm.</p>
              <div className={styles.pwdWrap}>
                <input className={`${styles.rowInput} ${styles.inputDanger}`}
                  type={showDelPwd ? 'text' : 'password'}
                  value={deletePass} onChange={(e) => setDeletePass(e.target.value)}
                  placeholder="Your current password" />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowDelPwd(v => !v)}>
                  {showDelPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {deleteMsg && <div className={styles.msgErr}>{deleteMsg}</div>}
              <div className={styles.deleteActions}>
                <button className={styles.cancelRowBtn}
                  onClick={() => { setDeleteConfirm(false); setDeletePass(''); setDeleteMsg(''); }}>
                  Cancel
                </button>
                <button className={styles.deleteConfirmBtn} onClick={handleDelete} disabled={deleting || !deletePass}>
                  {deleting ? 'Deleting…' : 'Yes, delete my account'}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
