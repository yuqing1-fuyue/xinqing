import styles from './EmergencyPage.module.css';

const hotlines = [
  { name: '全国心理援助热线', phone: '400-161-9995', desc: '24 小时全天候，专业人员为你提供支持', icon: '🆘', urgent: true },
  { name: '北京心理危机研究与干预中心', phone: '010-82951332', desc: '专业心理危机干预服务', icon: '🏥', urgent: false },
  { name: '生命热线', phone: '400-821-1215', desc: '关爱生命，倾听心声', icon: '❤️', urgent: false },
  { name: '希望24热线', phone: '400-161-9995', desc: '面向全国的免费心理援助', icon: '🌟', urgent: false },
];

const resources = [
  { icon: '🧠', title: '识别危机信号', items: ['持续感到绝望或无助', '谈论死亡或自杀话题', '社交退缩、不愿与人接触', '突然的平静（可能已做决定）', '赠送个人物品、告别行为'] },
  { icon: '🤝', title: '如何帮助他人', items: ['认真倾听，不要评判', '直接询问是否需要帮助', '不要承诺保密（涉及安全时）', '陪伴在身边，不要让他独处', '帮助联系专业机构'] },
  { icon: '🛡️', title: '自我保护方法', items: ['接纳自己的情绪，不苛责', '建立安全的支持网络', '制定个人安全计划', '记录让你感到平静的事物', '定期进行心理健康自评'] },
];

const selfHelp = [
  { icon: '🌬️', title: '5分钟平复练习', desc: '缓慢深呼吸：吸气4秒→屏住7秒→呼气8秒，重复5次。专注于呼吸的节奏，让身体慢慢放松下来。' },
  { icon: '🌍', title: '5-4-3-2-1 接地法', desc: '找出5样看到的东西、4样能触摸的东西、3种听到的声音、2种闻到的气味、1种嘴里的味道。把注意力拉回当下。' },
  { icon: '📝', title: '情绪书写法', desc: '拿出纸笔，不加思考地写下此刻脑海中的一切。不需要逻辑通顺，只是把情绪倾倒出来。写完后可以撕掉。' },
];

export default function EmergencyPage() {
  return (
    <div className={styles.page}>
      <div className="page-container">
        {/* 头部 */}
        <div className={styles.header}>
          <span className={styles.headerIcon}>🆘</span>
          <div>
            <h1 className={styles.title}>紧急帮助</h1>
            <p className={styles.subtitle}>你不是一个人。无论何时，总有人愿意帮助你。</p>
          </div>
        </div>

        {/* 紧急热线 */}
        <div className={styles.hotlineSection}>
          <h2 className="section-title">24 小时危机热线</h2>
          {hotlines.map(h => (
            <div key={h.name} className={`${styles.hotlineCard} ${h.urgent ? styles.hotlineUrgent : ''}`}>
              <span className={styles.hotlineIcon}>{h.icon}</span>
              <div className={styles.hotlineInfo}>
                <h3 className={styles.hotlineName}>{h.name}</h3>
                <p className={styles.hotlineDesc}>{h.desc}</p>
              </div>
              <a className={styles.hotlinePhone} href={`tel:${h.phone}`}>{h.phone}</a>
            </div>
          ))}
        </div>

        {/* 紧急提示横幅 */}
        <div className={styles.banner}>
          <span className={styles.bannerIcon}>⚠️</span>
          <div>
            <p className={styles.bannerTitle}>如果你或身边的人正面临危险</p>
            <p className={styles.bannerText}>请立即拨打 <strong>120</strong>（急救）或 <strong>110</strong>（报警）。生命安全永远是第一位的。</p>
          </div>
        </div>

        {/* 自救方法 */}
        <div className={styles.selfHelp}>
          <h2 className="section-title">此刻可以做的事</h2>
          <div className={styles.selfHelpGrid}>
            {selfHelp.map(s => (
              <div key={s.title} className={styles.selfHelpCard}>
                <span className={styles.selfHelpIcon}>{s.icon}</span>
                <h3 className={styles.selfHelpTitle}>{s.title}</h3>
                <p className={styles.selfHelpDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 资源卡片 */}
        <div className={styles.resources}>
          <h2 className="section-title">了解更多</h2>
          <div className={styles.resourceGrid}>
            {resources.map(r => (
              <div key={r.title} className={styles.resourceCard}>
                <span className={styles.resourceIcon}>{r.icon}</span>
                <h3 className={styles.resourceTitle}>{r.title}</h3>
                <ul className={styles.resourceList}>
                  {r.items.map(it => <li key={it}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 底部温暖语 */}
        <div className={styles.footer}>
          <p>💚 每一个生命都值得被温柔以待。如果你正在经历困难，请一定不要独自承受。</p>
        </div>
      </div>
    </div>
  );
}
