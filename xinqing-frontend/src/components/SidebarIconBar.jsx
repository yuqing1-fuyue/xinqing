import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './SidebarIconBar.module.css';

const navItems = [
  { icon: '🏠', label: '首页', path: '/' },
  { icon: '🌤️', label: '心情打卡', path: '/mood' },
  { icon: '🌳', label: '心灵树洞', path: '/treehole' },
  { icon: '💪', label: '身心健康', path: '/health' },
  { icon: '🤖', label: 'AI 助手', path: '/ai-assistant' },
  { icon: '🆘', label: '紧急帮助', path: '/emergency' },
];

export default function SidebarIconBar() {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(true);
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY > 200;
      setVisible(scrolled);
      const nearBottom = (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 200);
      setAtBottom(nearBottom);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 登录/注册页不显示侧边栏
  if (location.pathname === '/login' || location.pathname === '/register') return null;

  return (
    <div
      className={`${styles.bar} ${visible ? styles.visible : styles.hidden} ${expanded ? styles.expanded : ''} ${atBottom ? styles.atBottom : ''}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {navItems.map(item => {
        const active = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`${styles.item} ${active ? styles.active : ''}`}
            title={item.label}
          >
            <span className={styles.icon}>{item.icon}</span>
            {expanded && <span className={styles.label}>{item.label}</span>}
            {active && <span className={styles.dot} />}
          </Link>
        );
      })}
    </div>
  );
}
