import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { store } from '../store';
import styles from './RegisterPage.module.css';

function getPasswordStrength(pwd) {
  if (!pwd) return { level: 0, text: '', color: '' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^a-zA-Z0-9]/.test(pwd)) score++;
  if (score <= 1) return { level: 1, text: '弱', color: '#E74C3C' };
  if (score <= 2) return { level: 2, text: '一般', color: '#F4A261' };
  if (score <= 3) return { level: 3, text: '较强', color: '#FF8C69' };
  return { level: 4, text: '强', color: '#76C9B0' };
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nickname: '', email: '', phone: '', password: '', confirmPwd: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const strength = getPasswordStrength(form.password);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = '请输入姓名';
    else if (form.name.trim().length < 2) e.name = '姓名至少 2 个字符';
    if (!form.email.trim()) e.email = '请输入邮箱';
    else if (!/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(form.email)) e.email = '邮箱格式不正确';
    if (!form.phone.trim()) e.phone = '请输入手机号';
    else if (!/^1\d{10}$/.test(form.phone)) e.phone = '手机号格式不正确';
    if (!form.password) e.password = '请设置密码';
    else if (form.password.length < 8) e.password = '密码至少 8 位';
    if (!form.confirmPwd) e.confirmPwd = '请确认密码';
    else if (form.password !== form.confirmPwd) e.confirmPwd = '两次密码不一致';
    if (!agreed) e.agreed = '请阅读并同意用户协议';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await store.register({
        username: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        nickname: form.name.trim()
      });
      navigate('/');
    } catch (err) {
      setErrors({ submit: err.message || '注册失败，请重试' });
    } finally {
      setLoading(false);
    }
  };

  const setField = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => { const n = { ...p }; delete n[k]; return n; });
  };

  return (
    <div className={styles.page}>
      <div className="page-container">
        <div className={styles.wrapper}>
          {/* 左侧品牌 */}
          <div className={styles.brand}>
            <span className={styles.brandIcon}>🌟</span>
            <h1 className={styles.brandTitle}>加入心晴同行</h1>
            <p className={styles.brandDesc}>开启你的心理健康关怀之旅</p>
            <div className={styles.brandSteps}>
              <div className={styles.bsItem}>
                <span className={styles.bsNum}>1</span>
                <span>填写注册信息</span>
              </div>
              <div className={styles.bsItem}>
                <span className={styles.bsNum}>2</span>
                <span>完成心理测评</span>
              </div>
              <div className={styles.bsItem}>
                <span className={styles.bsNum}>3</span>
                <span>获得个性化方案</span>
              </div>
            </div>
          </div>

          {/* 右侧表单 */}
          <div className={styles.formSide}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>创建账号</h2>
              <p className={styles.formSub}>只需 1 分钟，即刻开始</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              {/* 姓名 + 手机号 */}
              <div className={styles.row}>
                <div className={`${styles.field} ${styles.fieldHalf}`}>
                  <label className={styles.label}>姓名 *</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>👤</span>
                    <input className={`${styles.input} ${errors.name ? styles.inputErr : ''}`}
                      type="text" placeholder="真实姓名" value={form.name}
                      onChange={e => setField('name', e.target.value)} />
                  </div>
                  {errors.name && <span className={styles.errMsg}>{errors.name}</span>}
                </div>
                <div className={`${styles.field} ${styles.fieldHalf}`}>
                  <label className={styles.label}>手机号 *</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>📱</span>
                    <input className={`${styles.input} ${errors.phone ? styles.inputErr : ''}`}
                      type="tel" placeholder="11 位手机号" value={form.phone}
                      onChange={e => setField('phone', e.target.value)} maxLength={11} />
                  </div>
                  {errors.phone && <span className={styles.errMsg}>{errors.phone}</span>}
                </div>
              </div>

              {/* 邮箱 */}
              <div className={styles.field}>
                <label className={styles.label}>邮箱 *</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>✉️</span>
                  <input className={`${styles.input} ${errors.email ? styles.inputErr : ''}`}
                    type="email" placeholder="工作或个人邮箱" value={form.email}
                    onChange={e => setField('email', e.target.value)} />
                </div>
                {errors.email && <span className={styles.errMsg}>{errors.email}</span>}
              </div>

              {/* 密码 */}
              <div className={styles.field}>
                <label className={styles.label}>设置密码 *</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>🔒</span>
                  <input className={`${styles.input} ${errors.password ? styles.inputErr : ''}`}
                    type={showPwd ? 'text' : 'password'} placeholder="至少 8 位，建议含字母和数字"
                    value={form.password} onChange={e => setField('password', e.target.value)} />
                  <button type="button" className={styles.togglePwd} onClick={() => setShowPwd(p => !p)}>
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                </div>
                {form.password && (
                  <div className={styles.strength}>
                    <div className={styles.strengthBars}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`${styles.strengthBar} ${i <= strength.level ? styles.strengthActive : ''}`}
                          style={i <= strength.level ? { background: strength.color } : {}} />
                      ))}
                    </div>
                    <span className={styles.strengthText} style={{ color: strength.color }}>
                      密码强度：{strength.text}
                    </span>
                  </div>
                )}
                {errors.password && <span className={styles.errMsg}>{errors.password}</span>}
              </div>

              {/* 确认密码 */}
              <div className={styles.field}>
                <label className={styles.label}>确认密码 *</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>🔒</span>
                  <input className={`${styles.input} ${errors.confirmPwd ? styles.inputErr : ''}`}
                    type={showConfirm ? 'text' : 'password'} placeholder="再次输入密码"
                    value={form.confirmPwd} onChange={e => setField('confirmPwd', e.target.value)} />
                  <button type="button" className={styles.togglePwd} onClick={() => setShowConfirm(p => !p)}>
                    {showConfirm ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.confirmPwd && <span className={styles.errMsg}>{errors.confirmPwd}</span>}
              </div>

              {/* 协议 */}
              <label className={styles.agreement}>
                <input type="checkbox" checked={agreed} onChange={e => { setAgreed(e.target.checked); if (errors.agreed) setErrors(p => { const n = { ...p }; delete n.agreed; return n; }); }} />
                <span>我已阅读并同意 <a href="#" className={styles.link}>用户协议</a> 和 <a href="#" className={styles.link}>隐私政策</a></span>
              </label>
              {errors.agreed && <span className={styles.errMsg}>{errors.agreed}</span>}

              <button className={`btn-primary ${styles.submitBtn}`} type="submit" disabled={loading}>
                {loading ? <span className={styles.spinner} /> : '注 册'}
              </button>
            </form>

            <p className={styles.bottom}>
              已有账号？<Link to="/login" className={styles.link}>去登录</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
