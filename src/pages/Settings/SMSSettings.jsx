import { useEffect, useState, useCallback } from 'react';
import {
  Settings2, CloudRain, Waves, Radio,
  Bell, MessageSquare, Save, RotateCcw,
  CheckCircle2, AlertCircle, Lightbulb, Phone,
  Plus, Trash2, ChevronDown, ChevronUp, Users,
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import styles from './SMSSettings.module.css';

const EAST_AFRICA = [
  { code: '+254', flag: '🇰🇪', name: 'Kenya'       },
  { code: '+255', flag: '🇹🇿', name: 'Tanzania'    },
  { code: '+256', flag: '🇺🇬', name: 'Uganda'      },
  { code: '+250', flag: '🇷🇼', name: 'Rwanda'      },
  { code: '+257', flag: '🇧🇮', name: 'Burundi'     },
  { code: '+211', flag: '🇸🇸', name: 'South Sudan' },
  { code: '+251', flag: '🇪🇹', name: 'Ethiopia'    },
  { code: '+252', flag: '🇸🇴', name: 'Somalia'     },
  { code: '+253', flag: '🇩🇯', name: 'Djibouti'    },
  { code: '+291', flag: '🇪🇷', name: 'Eritrea'     },
];

const POPULAR = [
  { code: '+1',   flag: '🇺🇸', name: 'United States'  },
  { code: '+44',  flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+91',  flag: '🇮🇳', name: 'India'          },
  { code: '+86',  flag: '🇨🇳', name: 'China'          },
  { code: '+49',  flag: '🇩🇪', name: 'Germany'        },
  { code: '+33',  flag: '🇫🇷', name: 'France'         },
  { code: '+27',  flag: '🇿🇦', name: 'South Africa'   },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria'        },
  { code: '+233', flag: '🇬🇭', name: 'Ghana'          },
  { code: '+55',  flag: '🇧🇷', name: 'Brazil'         },
  { code: '+52',  flag: '🇲🇽', name: 'Mexico'         },
  { code: '+62',  flag: '🇮🇩', name: 'Indonesia'      },
  { code: '+20',  flag: '🇪🇬', name: 'Egypt'          },
];

const ALERT_TYPES = [
  { key: 'pump_alerts',           Icon: Settings2,  label: 'Pump Alerts',           desc: 'Notify when pump starts, stops, or fails'       },
  { key: 'weather_alerts',        Icon: CloudRain,  label: 'Weather Alerts',         desc: 'Notify on severe weather or rain forecasts'     },
  { key: 'low_water_alerts',      Icon: Waves,      label: 'Low Water Alerts',       desc: 'Notify when tank level drops below threshold'   },
  { key: 'sensor_failure_alerts', Icon: Radio,      label: 'Sensor Failure Alerts',  desc: 'Notify when a sensor goes offline or errors'    },
];

const MAX_CONTACTS = 5;
const VISIBLE_DEFAULT = 3;

const BLANK_CONTACT = () => ({ country_code: '+256', phone_number: '' });

const INIT = {
  contacts:      [BLANK_CONTACT()],
  sms_enabled:   false,
  pump_alerts:           false,
  weather_alerts:        false,
  low_water_alerts:      false,
  sensor_failure_alerts: false,
};

export default function SMSSettings() {
  const [form, setForm]       = useState(INIT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const [showAll, setShowAll] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications/');
      setForm((p) => ({
        ...p,
        ...data,
        contacts: data.contacts?.length ? data.contacts : [BLANK_CONTACT()],
      }));
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const toggle = (key) => {
    setForm((p) => ({ ...p, [key]: !p[key] }));
    setError(''); setSuccess('');
  };

  const updateContact = (i, field, value) => {
    setForm((p) => {
      const contacts = [...p.contacts];
      contacts[i] = { ...contacts[i], [field]: value };
      return { ...p, contacts };
    });
    setError(''); setSuccess('');
  };

  const addContact = () => {
    if (form.contacts.length >= MAX_CONTACTS) return;
    setForm((p) => ({ ...p, contacts: [...p.contacts, BLANK_CONTACT()] }));
    setShowAll(true);
  };

  const removeContact = (i) => {
    setForm((p) => {
      const contacts = p.contacts.filter((_, idx) => idx !== i);
      return { ...p, contacts: contacts.length ? contacts : [BLANK_CONTACT()] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.contacts.some(c => c.phone_number.trim())) {
      setError('At least one phone number is required.'); return;
    }
    const contacts = form.contacts
      .filter(c => c.phone_number.trim())
      .map(c => ({ ...c, phone_number: `${c.country_code}${c.phone_number.replace(/^0+/, '')}` }));
    const payload = { ...form, contacts };
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/notifications/', payload);
      setSuccess('SMS settings saved successfully.');
    } catch (err) {
      const d = err.response?.data;
      setError(
        typeof d === 'string' ? d : d?.detail || d?.message || Object.values(d ?? {})[0] || 'Failed to save settings.'
      );
    } finally {
      setSaving(false);
    }
  };

  const visibleContacts = showAll ? form.contacts : form.contacts.slice(0, VISIBLE_DEFAULT);
  const hiddenCount = form.contacts.length - VISIBLE_DEFAULT;

  const activeCount = ALERT_TYPES.filter(({ key }) => form[key]).length;

  return (
    <DashboardLayout>
      <div className={styles.page}>

        {/* ── Header ───────────────────────────────────── */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>SMS Settings</h1>
            <p className={styles.pageSubtitle}>Configure SIM-based SMS alerts for your farm</p>
          </div>
          {!loading && (
            <div className={`${styles.statusChip} ${form.sms_enabled ? styles.chipOn : styles.chipOff}`}>
              <span className={styles.chipDot} />
              SMS {form.sms_enabled ? 'Enabled' : 'Disabled'}
            </div>
          )}
        </div>

        {loading ? (
          <div className={styles.loadingBox}>
            <span className={styles.bigSpinner} />
            <p>Loading settings…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.layout}>

              {/* ── Left col ─────────────────────────────── */}
              <div className={styles.col}>

                {/* Phone + master toggle */}
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    <MessageSquare size={16} /> SIM Configuration
                  </h2>

                  <div className={styles.field}>
                    <div className={styles.contactsHeader}>
                      <label className={styles.label}>
                        <Users size={13} /> Contacts
                        <span className={styles.contactCount}>{form.contacts.length}/{MAX_CONTACTS}</span>
                      </label>
                      {form.contacts.length < MAX_CONTACTS && (
                        <button type="button" className={styles.addBtn} onClick={addContact}>
                          <Plus size={13} /> Add
                        </button>
                      )}
                    </div>

                    <div className={styles.contactList}>
                      {visibleContacts.map((contact, i) => (
                        <div key={i} className={styles.contactRow}>
                          <div className={styles.phoneWrap}>
                            <select
                              className={styles.countrySelect}
                              value={contact.country_code}
                              onChange={(e) => updateContact(i, 'country_code', e.target.value)}
                              aria-label="Country code"
                            >
                              <optgroup label="🇺🇬 East Africa">
                                {EAST_AFRICA.map(({ code, flag, name }) => (
                                  <option key={code} value={code}>{flag} {name} ({code})</option>
                                ))}
                              </optgroup>
                              <optgroup label="🌍 Popular Countries">
                                {POPULAR.map(({ code, flag, name }) => (
                                  <option key={code} value={code}>{flag} {name} ({code})</option>
                                ))}
                              </optgroup>
                            </select>
                            <input
                              type="tel"
                              className={styles.phoneInput}
                              placeholder="712345678"
                              value={contact.phone_number}
                              onChange={(e) => updateContact(i, 'phone_number', e.target.value)}
                            />
                          </div>
                          {form.contacts.length > 1 && (
                            <button
                              type="button"
                              className={styles.removeBtn}
                              onClick={() => removeContact(i)}
                              aria-label="Remove contact"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}

                      {form.contacts.length > VISIBLE_DEFAULT && (
                        <button
                          type="button"
                          className={styles.showMoreBtn}
                          onClick={() => setShowAll(v => !v)}
                        >
                          {showAll
                            ? <><ChevronUp size={14} /> Show less</>
                            : <><ChevronDown size={14} /> {hiddenCount} more contact{hiddenCount > 1 ? 's' : ''}</>
                          }
                        </button>
                      )}
                    </div>
                    <span className={styles.fieldHint}>Select country, enter number without leading zero</span>
                  </div>

                  <div className={styles.toggleRow}>
                    <div className={styles.toggleInfo}>
                      <span className={styles.toggleLabel}>Enable SMS Alerts</span>
                      <span className={styles.toggleDesc}>Send SMS notifications to the number above</span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={form.sms_enabled}
                      className={`${styles.toggle} ${form.sms_enabled ? styles.toggleOn : ''}`}
                      onClick={() => toggle('sms_enabled')}
                    >
                      <span className={styles.toggleThumb} />
                    </button>
                  </div>
                </div>

                {/* Summary card */}
                <div className={styles.summaryCard}>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Active Alert Types</span>
                    <span className={styles.summaryValue}>{activeCount} / {ALERT_TYPES.length}</span>
                  </div>
                  <div className={styles.summaryProgress}>
                    <div
                      className={styles.summaryFill}
                      style={{ width: `${(activeCount / ALERT_TYPES.length) * 100}%` }}
                    />
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>SMS Status</span>
                    <span
                      className={styles.summaryBadge}
                      style={{
                        background: form.sms_enabled ? '#f0fdf4' : '#f9fafb',
                        color:      form.sms_enabled ? '#16a34a' : '#6b7280',
                        borderColor: form.sms_enabled ? '#bbf7d0' : '#e5e7eb',
                      }}
                    >
                      <span
                        className={styles.summaryDot}
                        style={{ background: form.sms_enabled ? '#16a34a' : '#9ca3af' }}
                      />
                      {form.sms_enabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Right col ────────────────────────────── */}
              <div className={styles.col}>
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                    <Bell size={16} /> Alert Types
                  </h2>
                    <div className={styles.alertActions}>
                      <button type="button" className={styles.textBtn} onClick={() => setForm((p) => ({ ...p, pump_alerts: true, weather_alerts: true, low_water_alerts: true, sensor_failure_alerts: true }))}>
                        All
                      </button>
                      <span className={styles.divider}>·</span>
                      <button type="button" className={styles.textBtn} onClick={() => setForm((p) => ({ ...p, pump_alerts: false, weather_alerts: false, low_water_alerts: false, sensor_failure_alerts: false }))}>
                        None
                      </button>
                    </div>
                  </div>

                  <div className={styles.alertList}>
                    {ALERT_TYPES.map(({ key, Icon, label, desc }) => (
                      <label
                        key={key}
                        className={`${styles.alertRow} ${form[key] ? styles.alertRowOn : ''} ${!form.sms_enabled ? styles.alertRowMuted : ''}`}
                      >
                        <span className={styles.alertIcon}><Icon size={18} strokeWidth={1.8} /></span>
                        <span className={styles.alertText}>
                          <span className={styles.alertLabel}>{label}</span>
                          <span className={styles.alertDesc}>{desc}</span>
                        </span>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={form[key]}
                          onChange={() => toggle(key)}
                          disabled={!form.sms_enabled}
                        />
                        <span className={`${styles.checkmark} ${form[key] ? styles.checkmarkOn : ''}`}>
                          {form[key] && <span className={styles.checkmarkTick}>✓</span>}
                        </span>
                      </label>
                    ))}
                  </div>

                  {!form.sms_enabled && (
                    <div className={styles.disabledNote}>
                      <Lightbulb size={14} /> Enable SMS alerts above to configure alert types.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Footer ───────────────────────────────────── */}
            <div className={styles.formFooter}>
              {success && <div className={styles.successBanner}><CheckCircle2 size={15} /> {success}</div>}
              {error   && <div className={styles.errorBanner}><AlertCircle size={15} /> {error}</div>}
              <div className={styles.footerActions}>
                <button
                  type="button"
                  className={styles.resetBtn}
                  onClick={() => { setForm(INIT); setError(''); setSuccess(''); }}
                  disabled={saving}
                >
                  <RotateCcw size={14} /> Reset
                </button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? <><span className={styles.spinner} /> Saving…</> : <><Save size={14} /> Save Settings</>}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
