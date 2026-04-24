import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { store } from '../store';
import styles from './HomePage.module.css';

/* ──────────────── 数据 ──────────────── */

const quickActions = [
  { icon: '🌤️', label: '心情打卡', desc: '记录今日心情', path: '/mood', color: '#FF8C69', bg: 'linear-gradient(135deg, #FFF5EE, #FFE4CC)' },
  { icon: '🌳', label: '心灵树洞', desc: '匿名倾诉心声', path: '/treehole', color: '#52B69A', bg: 'linear-gradient(135deg, #E8F8F5, #D5F5E3)' },
  { icon: '💪', label: '身心健康', desc: '全方位自评', path: '/health', color: '#F4A261', bg: 'linear-gradient(135deg, #FFF8E1, #FFE0B2)' },
  { icon: '🤖', label: 'AI 助手', desc: '智能心理陪伴', path: '/ai-assistant', color: '#7B9EA6', bg: 'linear-gradient(135deg, #E8F4F8, #D4EEF5)' },
  { icon: '🆘', label: '紧急帮助', desc: '24h 危机支持', path: '/emergency', color: '#E74C3C', bg: 'linear-gradient(135deg, #FDE8E8, #FCD4D4)' },
  { icon: '📊', label: '趋势报告', desc: '情绪数据洞察', path: '/mood', color: '#9B8EC4', bg: 'linear-gradient(135deg, #F0EBF8, #E4DCF0)' },
];

const coreFeatures = [
  {
    icon: '☀️',
    title: '心情追踪',
    subtitle: '每日情绪温度计',
    desc: '通过简单直观的打卡，记录每天的情绪波动。系统自动生成趋势图，帮你发现情绪的规律与周期，提前预警低落时段。',
    highlights: ['七维度情绪量表', '自动趋势分析', '低落预警提醒'],
    gradient: 'linear-gradient(135deg, #FFF5EE 0%, #FFE4CC 100%)',
    accent: '#FF8C69',
  },
  {
    icon: '🫧',
    title: '心灵树洞',
    subtitle: '安全倾诉空间',
    desc: '无需暴露身份，匿名分享内心故事。在温暖的社区中收获理解与支持，每一条心声都会被认真对待。',
    highlights: ['完全匿名保护', '互助社区氛围', '专业咨询师回复'],
    gradient: 'linear-gradient(135deg, #E8F8F5 0%, #D5F5E3 100%)',
    accent: '#52B69A',
  },
  {
    icon: '🌿',
    title: '身心健康',
    subtitle: '全方位自评体系',
    desc: '从睡眠质量到运动习惯，从社交活跃度到压力水平，多维度评估你的身心状态，生成个性化改善建议。',
    highlights: ['多维度雷达图', '个性化建议', '周期对比分析'],
    gradient: 'linear-gradient(135deg, #FFF8E1 0%, #FFE0B2 100%)',
    accent: '#F4A261',
  },
];

const testimonials = [
  {
    quote: '以前总觉得情绪低落是矫情，用了平台才知道，关注心理健康是每个人都应该做的事。',
    author: '小鱼',
    role: '市场部 · 入职2年',
    avatar: '🐟',
  },
  {
    quote: '树洞里看到别人的故事，发现自己不是一个人。那种被理解的感觉，比什么建议都管用。',
    author: '阿树',
    role: '技术部 · 入职3年',
    avatar: '🌳',
  },
  {
    quote: 'AI 助手凌晨三点还在陪我聊，虽然知道它是程序，但那一刻真的觉得很温暖。',
    author: '晚星',
    role: '设计部 · 入职1年',
    avatar: '⭐',
  },
];

const stats = [
  { value: 12860, label: '累计打卡次数', suffix: '+' },
  { value: 3240, label: '树洞倾诉心声', suffix: '+' },
  { value: 97, label: '用户满意度', suffix: '%' },
  { value: 24, label: '小时危机支持', suffix: 'h' },
];

/* ──────────────── 辅助组件 ──────────────── */

function AnimatedNumber({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

// 每个 FeatureNarrative 条目独立使用 IntersectionObserver（不在 map 内调用 Hook）
function FeatureRevealItem({ feat, reversed, index, children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`${styles.narrative} ${reversed ? styles.narrativeReverse : ''} ${visible ? styles.narrativeVisible : ''}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {children}
    </div>
  );
}

/* ──────────────── 首页主组件 ──────────────── */

export default function HomePage() {
  const navigate = useNavigate();
  const [userState, setUserState] = useState(store.getState());
  const [carouselIdx, setCarouselIdx] = useState(0);
  const carouselTimer = useRef(null);

  useEffect(() => {
    const unsubscribe = store.subscribe(setUserState);
    store.fetchCurrentUser();
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    store.logout();
    navigate('/');
  };

  // 自动轮播：每 4 秒切换
  useEffect(() => {
    carouselTimer.current = setInterval(() => {
      setCarouselIdx(prev => (prev + 1) % quickActions.length);
    }, 4000);
    return () => clearInterval(carouselTimer.current);
  }, []);

  const goCarousel = (idx) => {
    setCarouselIdx(idx);
    clearInterval(carouselTimer.current);
    carouselTimer.current = setInterval(() => {
      setCarouselIdx(prev => (prev + 1) % quickActions.length);
    }, 4000);
  };

  return (
    <div className={styles.home}>
      {/* ══════ 顶部导航 ══════ */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link to="/" className={styles.navBrand}>
            <span className={styles.navLogo}>🌤️</span>
            <span>心晴同行</span>
          </Link>
          <div className={styles.navLinks}>
            {userState.isAuthenticated ? (
              <>
                <span className={styles.navUser}>欢迎，{userState.user?.nickname || userState.user?.username}</span>
                <button onClick={handleLogout} className={styles.navBtn}>退出</button>
              </>
            ) : (
              <>
                <Link to="/login" className={styles.navLink}>登录</Link>
                <Link to="/login" className={styles.navBtn}>注册</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ══════ Hero 全宽横幅 ══════ */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>心理健康 · 企业关怀</div>
          <h1 className={styles.heroTitle}>
            心晴同行
            <span className={styles.heroTitleSub}>你的专属心理关怀伙伴</span>
          </h1>
          <p className={styles.heroDesc}>
            在繁忙的工作中，别忘了照顾内心的自己。记录心情、倾诉心声、获取专业支持——
            我们始终在这里，陪你度过每一个需要温暖的时刻。
          </p>
          <div className={styles.heroActions}>
            <Link to="/mood" className="btn-primary">
              开始今日打卡
            </Link>
            <Link to="/treehole" className="btn-secondary">
              去树洞逛逛 →
            </Link>
          </div>
          <div className={styles.heroDecor}>
            <span className={styles.heroDecorItem} style={{ '--delay': '0s', '--size': '180px' }}>🌤️</span>
            <span className={styles.heroDecorItem} style={{ '--delay': '1s', '--size': '120px' }}>🌱</span>
            <span className={styles.heroDecorItem} style={{ '--delay': '2s', '--size': '100px' }}>🫧</span>
          </div>
        </div>
      </section>

      {/* ══════ 快捷功能 · 水平轮播 ══════ */}
      <section className={styles.quickSection}>
        <div className="page-container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 8 }}>快捷入口</h2>
          <p className="section-subtitle" style={{ textAlign: 'center', marginBottom: 32 }}>点击即可进入，发现属于你的心灵空间</p>
          <div className={styles.carouselWrapper}>
            <button className={styles.carouselArrow} style={{ left: 8 }} onClick={() => goCarousel((carouselIdx - 1 + quickActions.length) % quickActions.length)}>‹</button>
            <div className={styles.carouselTrack}>
              <div
                className={styles.carouselInner}
                style={{ transform: `translateX(-${carouselIdx * 25}%)` }}
              >
                {quickActions.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={styles.quickItem}
                    style={{ '--accent': item.color, background: item.bg }}
                  >
                    <span className={styles.quickIcon}>{item.icon}</span>
                    <span className={styles.quickLabel}>{item.label}</span>
                    <span className={styles.quickDesc}>{item.desc}</span>
                    <span className={styles.quickArrow}>→</span>
                  </Link>
                ))}
              </div>
            </div>
            <button className={styles.carouselArrow} style={{ right: 8 }} onClick={() => goCarousel((carouselIdx + 1) % quickActions.length)}>›</button>
          </div>
          <div className={styles.carouselDots}>
            {quickActions.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === carouselIdx ? styles.dotActive : ''}`}
                onClick={() => goCarousel(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════ 核心功能 · 叙事流（左右交替横幅） ══════ */}
      <section className={styles.featuresSection}>
        <div className="page-container">
          <h2 className="section-title gradient-text" style={{ textAlign: 'center', marginBottom: 48 }}>
            用心打造的核心功能
          </h2>
          {coreFeatures.map((feat, i) => {
            const isEven = i % 2 === 0;
            return (
              <FeatureRevealItem
                key={feat.title}
                feat={feat}
                reversed={!isEven}
                index={i}
              >
                <NarrativeContent feat={feat} />
              </FeatureRevealItem>
            );
          })}
        </div>
      </section>

      {/* ══════ 数据统计 · 全宽仪表条 ══════ */}
      <section className={styles.statsSection}>
        <div className="page-container">
          <div className={styles.statsGrid}>
            {stats.map((s) => (
              <div key={s.label} className={styles.statItem}>
                <span className={styles.statValue}>
                  <AnimatedNumber target={s.value} />
                  {s.suffix}
                </span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ 用户心声 · 引用式大字排版 ══════ */}
      <section className={styles.testimonialSection}>
        <div className="page-container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 48 }}>
            他们这样说
          </h2>
          <div className={styles.testimonialList}>
            {testimonials.map((t, i) => {
              const [ref, visible] = useScrollReveal();
              return (
                <div
                  key={i}
                  ref={ref}
                  className={`${styles.testimonial} ${visible ? styles.testimonialVisible : ''}`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  <div className={styles.testimonialQuote}>"</div>
                  <p className={styles.testimonialText}>{t.quote}</p>
                  <div className={styles.testimonialMeta}>
                    <span className={styles.testimonialAvatar}>{t.avatar}</span>
                    <div>
                      <div className={styles.testimonialAuthor}>{t.author}</div>
                      <div className={styles.testimonialRole}>{t.role}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════ CTA 号召区 ══════ */}
      <section className={styles.ctaSection}>
        <div className="page-container">
          <div className={styles.ctaInner}>
            <h2 className={styles.ctaTitle}>今天，给自己一分钟</h2>
            <p className={styles.ctaDesc}>
              打卡记录心情，关注自己的内心世界。你的每一次记录，都是对自己的温柔。
            </p>
            <Link to="/mood" className="btn-primary" style={{ fontSize: 16, padding: '14px 36px' }}>
              立即开始 →
            </Link>
          </div>
        </div>
      </section>

      {/* 底部留白 */}
      <div style={{ height: 40 }} />
    </div>
  );
}

/* ──────────────── 叙事流条目 ──────────────── */

const FeatureNarrative = React.forwardRef(({ feat, reversed, visible, index }, ref) => {
  return (
    <div
      ref={ref}
      className={`${styles.narrative} ${reversed ? styles.narrativeReverse : ''} ${visible ? styles.narrativeVisible : ''}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className={styles.narrativeContent}>
        <div className={styles.narrativeIcon}>{feat.icon}</div>
        <span className={styles.narrativeSubtitle}>{feat.subtitle}</span>
        <h3 className={styles.narrativeTitle} style={{ color: feat.accent }}>
          {feat.title}
        </h3>
        <p className={styles.narrativeDesc}>{feat.desc}</p>
        <ul className={styles.narrativeHighlights}>
          {feat.highlights.map((h) => (
            <li key={h}>
              <span className={styles.highlightDot} style={{ background: feat.accent }} />
              {h}
            </li>
          ))}
        </ul>
      </div>
      <div
        className={styles.narrativeVisual}
        style={{ background: feat.gradient }}
      >
        <div className={styles.narrativeVisualInner}>
          {/* 模拟界面截图 */}
          <div className={styles.mockupWindow}>
            <div className={styles.mockupBar}>
              <span /><span /><span />
            </div>
            <div className={styles.mockupBody}>
              <div className={styles.mockupChart}>
                {[65, 40, 78, 55, 90, 72, 85].map((v, i) => (
                  <div key={i} className={styles.mockupBarCol}>
                    <div
                      className={styles.mockupBarFill}
                      style={{
                        height: `${v}%`,
                        background: feat.accent,
                        opacity: 0.5 + (v / 200),
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className={styles.mockupLines}>
                <div className={styles.mockupLine} style={{ width: '70%' }} />
                <div className={styles.mockupLine} style={{ width: '50%' }} />
                <div className={styles.mockupLine} style={{ width: '85%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// NarrativeContent: 渲染叙事条目内容（由 FeatureRevealItem 包裹）
function NarrativeContent({ feat }) {
  return (
    <>
      <div className={styles.narrativeContent}>
        <div className={styles.narrativeIcon}>{feat.icon}</div>
        <span className={styles.narrativeSubtitle}>{feat.subtitle}</span>
        <h3 className={styles.narrativeTitle} style={{ color: feat.accent }}>
          {feat.title}
        </h3>
        <p className={styles.narrativeDesc}>{feat.desc}</p>
        <ul className={styles.narrativeHighlights}>
          {feat.highlights.map((h) => (
            <li key={h}>
              <span className={styles.highlightDot} style={{ background: feat.accent }} />
              {h}
            </li>
          ))}
        </ul>
      </div>
      <div
        className={styles.narrativeVisual}
        style={{ background: feat.gradient }}
      >
        <div className={styles.narrativeVisualInner}>
          <div className={styles.mockupWindow}>
            <div className={styles.mockupBar}>
              <span /><span /><span />
            </div>
            <div className={styles.mockupBody}>
              <div className={styles.mockupChart}>
                {[65, 40, 78, 55, 90, 72, 85].map((v, i) => (
                  <div key={i} className={styles.mockupBarCol}>
                    <div
                      className={styles.mockupBarFill}
                      style={{
                        height: `${v}%`,
                        background: feat.accent,
                        opacity: 0.5 + (v / 200),
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className={styles.mockupLines}>
                <div className={styles.mockupLine} style={{ width: '70%' }} />
                <div className={styles.mockupLine} style={{ width: '50%' }} />
                <div className={styles.mockupLine} style={{ width: '85%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
