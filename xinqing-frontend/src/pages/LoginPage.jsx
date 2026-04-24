import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { store } from '../store';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ 
    email: '', 
    password: '',
    username: '',
    nickname: '',
    confirmPassword: '',
    phone: ''
  });
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  // 登录方式切换：email 或 phone
  const [loginMethod, setLoginMethod] = useState('email');

  const validate = () => {
    const e = {};
    // 登录模式下验证
    if (!isRegister) {
      if (loginMethod === 'email') {
        if (!form.email.trim()) {
          e.email = '请输入邮箱';
        } else if (!/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(form.email)) {
          e.email = '请输入有效的邮箱';
        }
      } else {
        if (!form.phone.trim()) {
          e.phone = '请输入手机号';
        } else if (!/^1\d{10}$/.test(form.phone)) {
          e.phone = '请输入有效的手机号';
        }
      }
    } else {
      // 注册模式：用户名必填
      if (!form.username.trim()) {
        e.username = '请输入用户名';
      } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
        e.username = '用户名只能包含字母、数字、下划线';
      }
      // 注册时邮箱或手机号至少填一个
      if (!form.email.trim() && !form.phone.trim()) {
        e.email = '请填写邮箱或手机号（至少填一个）';
      }
      if (form.email && !/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(form.email)) {
        e.email = '请输入有效的邮箱格式';
      }
      if (form.phone && !/^1\d{10}$/.test(form.phone)) {
        e.phone = '请输入有效的手机号';
      }
      if (form.password !== form.confirmPassword) {
        e.confirmPassword = '两次密码不一致';
      }
    }
    if (!form.password) {
      e.password = '请输入密码';
    } else if (form.password.length < 6) {
      e.password = '密码至少 6 位';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    try {
      if (isRegister) {
        // 注册时使用邮箱或手机号作为登录凭证
        const registerEmail = form.email.trim() || `${form.phone.trim()}@xinqing.local`;
        await store.register({
          username: form.username,
          email: registerEmail,
          password: form.password,
          nickname: form.nickname || form.username
        });
      } else {
        // 根据登录方式选择凭证
        const loginCredential = loginMethod === 'email' ? form.email : `${form.phone}@xinqing.local`;
        await store.login(loginCredential, form.password);
      }
      navigate('/');
    } catch (err) {
      setErrors({ submit: err.message || '操作失败，请重试' });
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
            <span className={styles.brandIcon}>🌤️</span>
            <h1 className={styles.brandTitle}>心晴同行</h1>
            <p className={styles.brandDesc}>让每一天都有好心情</p>
            <div className={styles.brandFeatures}>
              <div className={styles.bfItem}><span>🌤️</span> 每日心情打卡</div>
              <div className={styles.bfItem}><span>🤖</span> AI 心理陪伴</div>
              <div className={styles.bfItem}><span>🌳</span> 匿名树洞倾诉</div>
              <div className={styles.bfItem}><span>💪</span> 身心健康评估</div>
            </div>
          </div>

          {/* 右侧表单 */}
          <div className={styles.formSide}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>{isRegister ? '注册账号' : '欢迎回来'}</h2>
              <p className={styles.formSub}>{isRegister ? '开启你的心理健康之旅' : '登录你的账号，继续心理健康之旅'}</p>
            </div>

            {errors.submit && (
              <div className={styles.submitError}>{errors.submit}</div>
            )}

            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              {/* 登录方式：邮箱或手机号 */}
              {!isRegister && (
                <div className={styles.field}>
                  <label className={styles.label}>{loginMethod === 'email' ? '邮箱' : '手机号'}</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>{loginMethod === 'email' ? '✉️' : '📱'}</span>
                    <input
                      className={`${styles.input} ${(loginMethod === 'email' ? errors.email : errors.phone) ? styles.inputErr : ''}`}
                      type={loginMethod === 'email' ? 'email' : 'tel'}
                      placeholder={loginMethod === 'email' ? '请输入邮箱' : '请输入手机号'}
                      value={loginMethod === 'email' ? form.email : form.phone}
                      onChange={e => setField(loginMethod === 'email' ? 'email' : 'phone', e.target.value)}
                      autoComplete={loginMethod === 'email' ? 'email' : 'tel'}
                      maxLength={loginMethod === 'phone' ? 11 : undefined}
                    />
                  </div>
                  {loginMethod === 'email' && errors.email && <span className={styles.errMsg}>{errors.email}</span>}
                  {loginMethod === 'phone' && errors.phone && <span className={styles.errMsg}>{errors.phone}</span>}
                  <div style={{ textAlign: 'right', marginTop: 6 }}>
                    <button type="button" onClick={() => { setLoginMethod(p => p === 'email' ? 'phone' : 'email'); setErrors({}); }} style={{ background: 'none', border: 'none', color: '#FF8C69', cursor: 'pointer', fontSize: 13, padding: 0 }}>
                      {loginMethod === 'email' ? '使用手机号登录 →' : '使用邮箱登录 →'}
                    </button>
                  </div>
                </div>
              )}

              {isRegister && (
                <>
                  <div className={styles.field}>
                    <label className={styles.label}>用户名</label>
                    <div className={styles.inputWrap}>
                      <span className={styles.inputIcon}>👤</span>
                      <input
                        className={`${styles.input} ${errors.username ? styles.inputErr : ''}`}
                        type="text"
                        placeholder="请输入用户名"
                        value={form.username}
                        onChange={e => setField('username', e.target.value)}
                      />
                    </div>
                    {errors.username && <span className={styles.errMsg}>{errors.username}</span>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>昵称（选填）</label>
                    <div className={styles.inputWrap}>
                      <span className={styles.inputIcon}>✨</span>
                      <input
                        className={styles.input}
                        type="text"
                        placeholder="请输入昵称"
                        value={form.nickname}
                        onChange={e => setField('nickname', e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* 注册模式下的邮箱和手机号 */}
              {isRegister && (
                <>
                  <div className={styles.field}>
                    <label className={styles.label}>邮箱（选填，与手机号二选一）</label>
                    <div className={styles.inputWrap}>
                      <span className={styles.inputIcon}>✉️</span>
                      <input
                        className={`${styles.input} ${errors.email ? styles.inputErr : ''}`}
                        type="email"
                        placeholder="请输入邮箱"
                        value={form.email}
                        onChange={e => setField('email', e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                    {errors.email && <span className={styles.errMsg}>{errors.email}</span>}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>手机号（选填，与邮箱二选一）</label>
                    <div className={styles.inputWrap}>
                      <span className={styles.inputIcon}>📱</span>
                      <input
                        className={`${styles.input} ${errors.phone ? styles.inputErr : ''}`}
                        type="tel"
                        placeholder="11位手机号"
                        value={form.phone}
                        onChange={e => setField('phone', e.target.value)}
                        maxLength={11}
                      />
                    </div>
                    {errors.phone && <span className={styles.errMsg}>{errors.phone}</span>}
                  </div>
                </>
              )}

              <div className={styles.field}>
                <label className={styles.label}>密码</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>🔒</span>
                  <input
                    className={`${styles.input} ${errors.password ? styles.inputErr : ''}`}
                    type={showPwd ? 'text' : 'password'}
                    placeholder="请输入密码"
                    value={form.password}
                    onChange={e => setField('password', e.target.value)}
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                  />
                  <button type="button" className={styles.togglePwd} onClick={() => setShowPwd(p => !p)}>
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.password && <span className={styles.errMsg}>{errors.password}</span>}
              </div>

              {isRegister && (
                <div className={styles.field}>
                  <label className={styles.label}>确认密码</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>🔒</span>
                    <input
                      className={`${styles.input} ${errors.confirmPassword ? styles.inputErr : ''}`}
                      type={showPwd ? 'text' : 'password'}
                      placeholder="请再次输入密码"
                      value={form.confirmPassword}
                      onChange={e => setField('confirmPassword', e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                  {errors.confirmPassword && <span className={styles.errMsg}>{errors.confirmPassword}</span>}
                </div>
              )}

              {!isRegister && (
                <div className={styles.formExtra}>
                  <label className={styles.remember}>
                    <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                    <span>记住我</span>
                  </label>
                  <a className={styles.forgot} href="#">忘记密码？</a>
                </div>
              )}

              <button className={`btn-primary ${styles.submitBtn}`} type="submit" disabled={loading}>
                {loading ? <span className={styles.spinner} /> : (isRegister ? '注 册' : '登 录')}
              </button>
            </form>

            {/* 第三方登录入口已移除 */}

            <p className={styles.bottom}>
              {isRegister ? (
                <>已有账号？<Link to="/login" className={styles.link} onClick={() => setIsRegister(false)}>立即登录</Link></>
              ) : (
                <>还没有账号？<Link to="/register" className={styles.link} onClick={() => setIsRegister(true)}>立即注册</Link></>
              )}
            </p>


          </div>
        </div>
      </div>
    </div>
  );
}
