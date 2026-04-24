import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from '../store';
import styles from './ProfilePage.module.css';

const AVATAR_OPTIONS = ['😀', '😊', '🌸', '🌻', '🍀', '⭐', '🎨', '📚', '🎵', '💪', '🌙', '❄️', '🔥', '💎', '🐱', '🦊', '🐰', '🌈', '☁️', '🏃'];

export default function ProfilePage() {
  const navigate = useNavigate();
  const [storeInstance, userState] = store.useStore();
  const [activeTab, setActiveTab] = useState('info');

  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('👤');
  const [displayId, setDisplayId] = useState('');
  const [saveInfoLoading, setSaveInfoLoading] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPwdChange, setConfirmPwdChange] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  const [msg, setMsg] = useState({ type: '', text: '' });
  let msgTimer = null;

  useEffect(() => {
    if (!userState.isAuthenticated) {
      navigate('/login');
      return;
    }
    if (userState.user) {
      setNickname(userState.user.nickname || '');
      setAvatar(userState.user.avatar || '👤');
      setDisplayId(userState.user.display_id || '');
    }
    return () => {
      if (msgTimer) clearTimeout(msgTimer);
    };
  }, [userState.isAuthenticated, navigate, userState.user]);

  const showMsg = (text, type) => {
    type = type || 'success';
    setMsg({ type: type, text: text });
    if (msgTimer) clearTimeout(msgTimer);
    msgTimer = setTimeout(function() {
      setMsg({ type: '', text: '' });
    }, 3000);
  };

  const handleSaveInfo = async function() {
    if (!nickname.trim()) {
      showMsg('昵称不能为空', 'error');
      return;
    }
    setSaveInfoLoading(true);
    try {
      await storeInstance.api.updateProfile({ nickname: nickname.trim(), avatar: avatar });
      await storeInstance.fetchCurrentUser();
      showMsg('个人信息更新成功！');
    } catch (err) {
      showMsg(err.message || '更新失败', 'error');
    }
    setSaveInfoLoading(false);
  };

  const handleChangePassword = async function() {
    if (!oldPassword || !newPassword || !confirmPwdChange) {
      showMsg('请填写所有密码字段', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showMsg('新密码至少6位', 'error');
      return;
    }
    if (newPassword !== confirmPwdChange) {
      showMsg('两次输入的新密码不一致', 'error');
      return;
    }
    setPwdLoading(true);
    try {
      await storeInstance.api.request('/users/password', {
        method: 'PUT',
        body: JSON.stringify({ oldPassword: oldPassword, newPassword: newPassword })
      });
      showMsg('密码修改成功！请重新登录。');
      setOldPassword('');
      setNewPassword('');
      setConfirmPwdChange('');
      setTimeout(function() {
        storeInstance.logout();
        navigate('/login');
      }, 2000);
    } catch (err) {
      showMsg(err.message || '修改失败，请确认原密码正确', 'error');
    }
    setPwdLoading(false);
  };

  var user = userState.user || {};

  return (
    <div className={styles.page}>
      <div className="page-container">
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span style={{ fontSize: 48 }}>{avatar}</span>
            <div>
              <h1 className={styles.title}>{nickname || user.username || '用户'}</h1>
              <p className={styles.subtitle}>{user.email} · 心晴同行成员</p>
            </div>
          </div>
        </div>

        {msg.text && (
          <div className={styles.msgBar + ' ' + (msg.type === 'error' ? styles.msgError : styles.msgSuccess)}>
            {msg.text}
          </div>
        )}

        <div className={styles.tabs}>
          <button className={styles.tab + ' ' + (activeTab === 'info' ? styles.tabActive : '')} onClick={() => setActiveTab('info')}>
            基本信息
          </button>
          <button className={styles.tab + ' ' + (activeTab === 'password' ? styles.tabActive : '')} onClick={() => setActiveTab('password')}>
            安全设置
          </button>
          <button className={styles.tab + ' ' + (activeTab === 'bind' ? styles.tabActive : '')} onClick={() => setActiveTab('bind')}>
            账号绑定
          </button>
        </div>

        {activeTab === 'info' && (
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>编辑个人资料</h3>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>头像</label>
              <div className={styles.avatarGrid}>
                {AVATAR_OPTIONS.map(function(a) {
                  return (
                    <button
                      key={a}
                      className={styles.avatarOption + ' ' + (avatar === a ? styles.avatarSelected : '')}
                      onClick={() => setAvatar(a)}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>用户名</label>
              <input
                className={styles.input}
                value={user.username || ''}
                disabled={true}
                style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
              />
              <span className={styles.fieldHint}>用户名不可更改</span>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>我的用户ID</label>
              <div className={styles.displayIdBox}>
                <span className={styles.displayIdValue}>{displayId || '加载中...'}</span>
                <button className={styles.copyBtn} onClick={function() {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(displayId);
                    showMsg('ID已复制到剪贴板');
                  } else {
                    var inp = document.createElement('input');
                    inp.value = displayId;
                    document.body.appendChild(inp);
                    inp.select();
                    document.execCommand('copy');
                    document.body.removeChild(inp);
                    showMsg('ID已复制到剪贴板');
                  }
                }}>复制</button>
              </div>
              <span className={styles.fieldHint}>分享给他人，他们可以通过此ID添加你为好友</span>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>昵称</label>
              <input
                className={styles.input}
                placeholder="请输入昵称"
                value={nickname}
                onChange={function(e) { setNickname(e.target.value); }}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>注册邮箱</label>
              <input
                className={styles.input}
                value={user.email || ''}
                disabled={true}
                style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>注册时间</label>
              <input
                className={styles.input}
                value={user.created_at ? new Date(user.created_at).toLocaleString('zh-CN') : '-'}
                disabled={true}
                style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
              />
            </div>

            <button
              className={'btn-primary ' + styles.saveBtn}
              onClick={handleSaveInfo}
              disabled={saveInfoLoading}
            >
              {saveInfoLoading ? '保存中...' : '保存修改'}
            </button>
          </div>
        )}

        {activeTab === 'password' && (
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>修改登录密码</h3>

            <div className={styles.securityNotice}>
              修改密码后需要重新登录，请确保您记得新密码。
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>当前密码</label>
              <input
                className={styles.input}
                type="password"
                placeholder="请输入当前密码"
                value={oldPassword}
                onChange={function(e) { setOldPassword(e.target.value); }}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>新密码（至少6位）</label>
              <input
                className={styles.input}
                type="password"
                placeholder="请输入新密码"
                value={newPassword}
                onChange={function(e) { setNewPassword(e.target.value); }}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>确认新密码</label>
              <input
                className={styles.input}
                type="password"
                placeholder="请再次输入新密码"
                value={confirmPwdChange}
                onChange={function(e) { setConfirmPwdChange(e.target.value); }}
              />
            </div>

            <button
              className={'btn-primary ' + styles.saveBtn}
              onClick={handleChangePassword}
              disabled={pwdLoading}
            >
              {pwdLoading ? '修改中...' : '确认修改密码'}
            </button>
          </div>
        )}

        {activeTab === 'bind' && (
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>账号绑定</h3>

            <div className={styles.bindCard}>
              <div className={styles.bindIcon}>✉️</div>
              <div className={styles.bindInfo}>
                <h4>邮箱</h4>
                <p>{user.email || '未绑定'} · 已作为主登录方式</p>
              </div>
              <span className={styles.bindStatus}>已绑定</span>
            </div>

            <div className={styles.bindCard}>
              <div className={styles.bindIcon}>📱</div>
              <div className={styles.bindInfo}>
                <h4>手机号</h4>
                <p>后续可用于快速登录和找回密码</p>
              </div>
              <span className={styles.bindStatus} style={{ color: '#999', background: '#f0f0f0' }}>待开放</span>
            </div>

            <div className={styles.bindCard}>
              <div className={styles.bindIcon}>📱</div>
              <div className={styles.bindInfo}>
                <h4>微信</h4>
                <p>绑定后可使用微信扫码登录</p>
              </div>
              <button className={styles.bindBtn}>立即绑定</button>
            </div>

            <div className={styles.bindCard}>
              <div className={styles.bindIcon}>💼</div>
              <div className={styles.bindInfo}>
                <h4>企业微信</h4>
                <p>企业用户专属快捷入口</p>
              </div>
              <button className={styles.bindBtn}>立即绑定</button>
            </div>

            <p style={{ color: '#999', fontSize: 13, marginTop: 16 }}>
              微信和企业微信绑定功能即将上线，敬请期待。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
