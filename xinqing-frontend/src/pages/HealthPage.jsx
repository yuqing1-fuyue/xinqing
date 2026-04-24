import { useState, useMemo } from 'react';
import styles from './HealthPage.module.css';

const dims = [
  { key: 'sleep', label: '睡眠质量', icon: '😴' },
  { key: 'exercise', label: '运动活力', icon: '🏃' },
  { key: 'diet', label: '饮食均衡', icon: '🥗' },
  { key: 'social', label: '社交互动', icon: '👥' },
  { key: 'stress', label: '压力管理', icon: '🧘' },
  { key: 'emotion', label: '情绪状态', icon: '💝' },
];

const qs = {
  sleep: ['我每晚能睡到 7-8 小时', '入睡通常不会很困难', '早上醒来感觉精神饱满', '睡眠质量稳定很少失眠'],
  exercise: ['每周至少运动 3 次', '每次运动能持续 30 分钟', '运动后感觉精力充沛', '有规律的运动习惯'],
  diet: ['每天按时吃三餐', '饮食包含蔬菜水果', '控制零食和垃圾食品', '每天喝足够的水'],
  social: ['有可以倾诉心事的朋友', '经常与家人朋友联系', '愿意参加社交活动', '在人际交往中感到自在'],
  stress: ['能识别自己的压力来源', '有有效的减压方法', '面对困难时能保持冷静', '工作生活能较好平衡'],
  emotion: ['大多数时候心情积极', '能表达和接纳自己的情绪', '面对挫折能较快恢复', '对未来保持乐观态度'],
};

const tips = [
  { title: '改善睡眠', icon: '🌙', items: ['建立固定作息时间表', '睡前1小时远离电子屏幕', '保持卧室温度18-22°C', '尝试睡前冥想或深呼吸'] },
  { title: '运动增强韧性', icon: '🏃', items: ['从每天散步15分钟开始', '尝试瑜伽或太极', '找运动伙伴互相激励', '记录运动的积极感受'] },
  { title: '压力管理', icon: '🧘', items: ['学习4-7-8呼吸法', '每天安排10分钟独处', '练习正念冥想', '合理规划避免过度承诺'] },
  { title: '营养与心理', icon: '🥗', items: ['增加Omega-3食物', '适量摄入坚果全谷物', '减少咖啡因和糖分', '保持充足水分摄入'] },
];

function si(s) {
  if (s >= 85) return { l: '优秀', c: '#76C9B0', d: '继续保持，你做得很好！' };
  if (s >= 70) return { l: '良好', c: '#FF8C69', d: '还不错，还有提升空间。' };
  if (s >= 50) return { l: '一般', c: '#F4A261', d: '需要注意，建议关注改善。' };
  return { l: '待改善', c: '#E0724F', d: '建议寻求专业指导。' };
}

export default function HealthPage() {
  const [phase, setPhase] = useState(0);
  const [curDim, setCurDim] = useState(0);
  const [ans, setAns] = useState({});
  const [resultShown, setResultShown] = useState(false);

  const handleAns = (dk, qi, v) => {
    setAns(p => ({ ...p, [dk]: { ...p[dk], [qi]: v } }));
  };

  const dimScores = useMemo(() => {
    const r = {};
    dims.forEach(({ key }) => {
      const a = ans[key] || {};
      const vals = Object.values(a);
      if (vals.length) r[key] = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 25);
    });
    return r;
  }, [ans]);

  const total = useMemo(() => {
    const v = Object.values(dimScores);
    return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : 0;
  }, [dimScores]);

  const doneCount = Object.values(ans).filter(v => Object.keys(v).length === 4).length;

  const curAnswers = ans[dims[curDim].key] || {};

  const goNext = () => {
    if (curDim < dims.length - 1) { setCurDim(p => p + 1); }
    else { setResultShown(true); setPhase(2); }
  };
  const goPrev = () => { if (curDim > 0) setCurDim(p => p - 1); };

  // 雷达图
  const radarData = useMemo(() => {
    const cx = 150, cy = 150, r = 100;
    const step = (Math.PI * 2) / dims.length;
    const start = -Math.PI / 2;
    const grids = [0.2, 0.4, 0.6, 0.8, 1.0].map(lv =>
      dims.map((_, i) => {
        const a = start + i * step;
        return `${cx + Math.cos(a) * r * lv},${cy + Math.sin(a) * r * lv}`;
      }).join(' ')
    );
    const labelPts = dims.map((_, i) => {
      const a = start + i * step;
      return { x: cx + Math.cos(a) * (r + 24), y: cy + Math.sin(a) * (r + 24), label: dims[i].label };
    });
    const dataPts = dims.map(({ key }, i) => {
      const a = start + i * step;
      const v = dimScores[key] || 0;
      return `${cx + Math.cos(a) * (v / 100) * r},${cy + Math.sin(a) * (v / 100) * r}`;
    }).join(' ');
    return { grids, labelPts, dataPts };
  }, [dimScores]);

  const ts = si(total);

  // ═══════ 首页 ═══════
  if (phase === 0) return (
    <div className={styles.page}>
      <div className="page-container">
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.hIcon}>💪</span>
            <div>
              <h1 className={styles.hTitle}>身心健康评估</h1>
              <p className={styles.hSub}>全面评估身心状态，获取个性化改善建议</p>
            </div>
          </div>
        </div>
        <div className={styles.intro}>
          <div className={styles.introCard}>
            <span className={styles.introIcon}>📋</span>
            <div>
              <h3>6 大维度 · 24 道题目</h3>
              <p>涵盖睡眠、运动、饮食、社交、压力、情绪</p>
            </div>
          </div>
          <div className={styles.introCard}>
            <span className={styles.introIcon}>⏱️</span>
            <div>
              <h3>仅需 3-5 分钟</h3>
              <p>根据直觉作答，无需过度思考</p>
            </div>
          </div>
          <div className={styles.introCard}>
            <span className={styles.introIcon}>📊</span>
            <div>
              <h3>即时生成报告</h3>
              <p>雷达图可视化 + 专属改善建议</p>
            </div>
          </div>
        </div>
        <div className={styles.dimPreview}>
          {dims.map(d => (
            <div key={d.key} className={styles.dimItem}>
              <span>{d.icon}</span><span>{d.label}</span>
            </div>
          ))}
        </div>
        <button className="btn-primary" style={{ marginTop: 32, padding: '16px 48px', fontSize: 16 }} onClick={() => setPhase(1)}>
          开始评估
        </button>
      </div>
    </div>
  );

  // ═══════ 评估中 ═══════
  if (phase === 1 && !resultShown) {
    const dim = dims[curDim];
    const questions = qs[dim.key];
    return (
      <div className={styles.page}>
        <div className="page-container" style={{ maxWidth: 640 }}>
          {/* 进度条 */}
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${((doneCount) / dims.length) * 100}%` }} />
          </div>
          <p className={styles.progressText}>第 {curDim + 1} / {dims.length} 部分 · {dim.label}</p>

          <div className={styles.quizPanel}>
            <div className={styles.quizHeader}>
              <span className={styles.quizIcon}>{dim.icon}</span>
              <h2>{dim.label}</h2>
            </div>
            <div className={styles.quizList}>
              {questions.map((q, qi) => (
                <div key={qi} className={styles.quizQ}>
                  <p className={styles.quizQText}>{q}</p>
                  <div className={styles.quizOpts}>
                    {[1, 2, 3, 4].map(v => (
                      <button key={v} className={`${styles.quizOpt} ${curAnswers[qi] === v ? styles.quizOptSel : ''}`}
                        onClick={() => handleAns(dim.key, qi, v)}>
                        {['很不认同', '不太认同', '比较认同', '非常认同'][v - 1]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.quizNav}>
            <button className="btn-secondary" onClick={goPrev} disabled={curDim === 0} style={{ opacity: curDim === 0 ? 0.4 : 1 }}>
              ← 上一部分
            </button>
            <button className="btn-primary" onClick={goNext}>
              {curDim === dims.length - 1 ? '查看结果' : '下一部分 →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════ 结果页 ═══════
  return (
    <div className={styles.page}>
      <div className="page-container">
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.hIcon}>📊</span>
            <div>
              <h1 className={styles.hTitle}>评估报告</h1>
              <p className={styles.hSub}>基于你的回答生成的身心健康分析</p>
            </div>
          </div>
          <button className="btn-secondary" onClick={() => { setPhase(0); setCurDim(0); setAns({}); setResultShown(false); }}>
            重新评估
          </button>
        </div>

        {/* 总分 */}
        <div className={styles.totalCard} style={{ borderColor: ts.c }}>
          <div className={styles.totalCircle} style={{ background: `conic-gradient(${ts.c} ${total * 3.6}deg, #f0f0f0 0)` }}>
            <div className={styles.totalInner}>
              <span className={styles.totalNum}>{total}</span>
              <span className={styles.totalLabel}>综合评分</span>
            </div>
          </div>
          <div className={styles.totalInfo}>
            <span className={styles.totalLevel} style={{ color: ts.c }}>{ts.l}</span>
            <p className={styles.totalDesc}>{ts.d}</p>
          </div>
        </div>

        {/* 雷达图 + 分数 */}
        <div className={styles.resultGrid}>
          <div className={styles.radarBox}>
            <h3>维度分析</h3>
            <svg viewBox="0 0 300 300" className={styles.radarSvg}>
              {radarData.grids.map((pts, i) => (
                <polygon key={i} points={pts} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
              ))}
              {dims.map((_, i) => {
                const step = (Math.PI * 2) / dims.length;
                const start = -Math.PI / 2;
                const a = start + i * step;
                return <line key={i} x1={150} y1={150} x2={150 + Math.cos(a) * 100} y2={150 + Math.sin(a) * 100} stroke="rgba(0,0,0,0.04)" />;
              })}
              {radarData.dataPts && (
                <polygon points={radarData.dataPts} fill="rgba(255,140,105,0.15)" stroke="#FF8C69" strokeWidth="2" />
              )}
              {radarData.labelPts.map((pt, i) => (
                <text key={i} x={pt.x} y={pt.y} textAnchor="middle" dominantBaseline="middle" className={styles.radarLabel}>
                  {pt.label}
                </text>
              ))}
            </svg>
          </div>
          <div className={styles.scoreList}>
            {dims.map(({ key, label, icon }) => {
              const s = dimScores[key] || 0;
              const info = si(s);
              return (
                <div key={key} className={styles.scoreRow}>
                  <span className={styles.scoreIcon}>{icon}</span>
                  <span className={styles.scoreName}>{label}</span>
                  <div className={styles.scoreBarBg}>
                    <div className={styles.scoreBarFill} style={{ width: `${s}%`, background: info.c }} />
                  </div>
                  <span className={styles.scoreVal} style={{ color: info.c }}>{s}</span>
                  <span className={styles.scoreTag} style={{ background: info.c + '18', color: info.c }}>{info.l}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 改善建议 */}
        <div className={styles.tipsSection}>
          <h2 className="section-title" style={{ marginBottom: 24 }}>改善建议</h2>
          <div className={styles.tipsGrid}>
            {tips.map(t => (
              <div key={t.title} className={styles.tipCard}>
                <span className={styles.tipIcon}>{t.icon}</span>
                <h3 className={styles.tipTitle}>{t.title}</h3>
                <ul className={styles.tipList}>
                  {t.items.map(it => <li key={it}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
