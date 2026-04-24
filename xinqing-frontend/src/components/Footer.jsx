import { Link, useLocation } from 'react-router-dom';
import styles from './Footer.module.css';

const footerLinks = [
  {
    icon: '🌤️',
    title: '心情打卡',
    desc: '记录每日情绪变化，追踪心情趋势',
    path: '/mood',
    color: '#FF8C69',
  },
  {
    icon: '🌳',
    title: '心灵树洞',
    desc: '匿名倾诉心声，收获温暖回应',
    path: '/treehole',
    color: '#52B69A',
  },
  {
    icon: '💪',
    title: '身心健康',
    desc: '全面自评身心状态，获取专属建议',
    path: '/health',
    color: '#F4A261',
  },
  {
    icon: '🤖',
    title: 'AI 心理助手',
    desc: '智能陪伴对话，随时倾听你的心声',
    path: '/ai-assistant',
    color: '#7B9EA6',
  },
  {
    icon: '🆘',
    title: '紧急帮助',
    desc: '24 小时危机热线与专业资源',
    path: '/emergency',
    color: '#E74C3C',
  },
];

const navCols = [
  {
    title: '核心功能',
    links: [
      { label: '心情打卡', path: '/mood' },
      { label: '心灵树洞', path: '/treehole' },
      { label: '身心健康', path: '/health' },
    ],
  },
  {
    title: '更多服务',
    links: [
      { label: 'AI 心理助手', path: '/ai-assistant' },
      { label: '紧急帮助', path: '/emergency' },
      { label: '趋势报告', path: '/mood' },
    ],
  },
  {
    title: '关于我们',
    links: [
      { label: '平台介绍', path: '/' },
      { label: '使用指南', path: '/' },
      { label: '隐私政策', path: '/' },
    ],
  },
];

export default function Footer() {
  const location = useLocation();
  const hideOn = ['/login', '/register', '/ai-assistant'];
  if (hideOn.includes(location.pathname)) return null;

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* 功能展示区 */}
        <div className={styles.features}>
          {footerLinks.map(item => (
            <Link to={item.path} key={item.title} className={styles.featureCard}>
              <span className={styles.featureIcon} style={{ background: `${item.color}15` }}>{item.icon}</span>
              <div className={styles.featureText}>
                <h4 className={styles.featureTitle} style={{ color: item.color }}>{item.title}</h4>
                <p className={styles.featureDesc}>{item.desc}</p>
              </div>
              <span className={styles.featureArrow} style={{ color: item.color }}>→</span>
            </Link>
          ))}
        </div>

        {/* 分隔 */}
        <div className={styles.divider} />

        {/* 导航链接 */}
        <div className={styles.navGrid}>
          {navCols.map(col => (
            <div key={col.title}>
              <h4 className={styles.colTitle}>{col.title}</h4>
              <ul className={styles.colList}>
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link to={link.path} className={styles.colLink}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h4 className={styles.colTitle}>联系方式</h4>
            <ul className={styles.colList}>
              <li><span className={styles.colLink}>📧 support@xinqing.com</span></li>
              <li><span className={styles.colLink}>📞 400-161-9995</span></li>
              <li><span className={styles.colLink}>💬 在线客服</span></li>
            </ul>
          </div>
        </div>

        {/* 品牌栏 */}
        <div className={styles.bottom}>
          <div className={styles.brand}>
            <span className={styles.brandLogo}>🌤️ 心晴同行</span>
            <span className={styles.brandTag}>你的心理健康伙伴</span>
          </div>
          <p className={styles.copy}>© 2026 心晴同行. 用温暖守护每一颗心.</p>
        </div>
      </div>
    </footer>
  );
}
