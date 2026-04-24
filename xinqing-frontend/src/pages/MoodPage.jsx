import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from '../store';
import styles from './MoodPage.module.css';

const emotions = [
  { emoji: '😄', label: '开心', value: 5, color: '#FF8C69' },
  { emoji: '😊', label: '愉悦', value: 4, color: '#F4A261' },
  { emoji: '😐', label: '平静', value: 3, color: '#7B9EA6' },
  { emoji: '😔', label: '低落', value: 2, color: '#9B8EC4' },
  { emoji: '😢', label: '难过', value: 1, color: '#A0ADB9' },
  { emoji: '😤', label: '焦虑', value: 1.5, color: '#E0724F' },
  { emoji: '😴', label: '疲惫', value: 2, color: '#76C9B0' },
];

const tags = ['工作', '人际', '家庭', '健康', '睡眠', '运动', '学习', '其他'];

// 映射心情类型：中文标签 → 英文存储值
const moodMap = {
  '开心': 'happy',
  '愉悦': 'happy',
  '平静': 'calm',
  '低落': 'sad',
  '难过': 'sad',
  '焦虑': 'anxious',
  '疲惫': 'neutral'
};

// 反向映射：英文存储值 → 中文标签（用于API数据显示）
const reverseMoodMap = {
  'happy': '开心',
  'calm': '平静',
  'sad': '难过',
  'anxious': '焦虑',
  'neutral': '疲惫',
  'angry': '焦虑'
};

// 6种心情各自对应的关怀提示词
const careMessagesByMood = {
  '开心': '太棒了！看到你今天这么开心，我也跟着高兴起来。保持这份好心情，分享给身边的人吧！🎉',
  '愉悦': '美好的感觉值得珍藏！今天你的笑容一定很温暖。享受这惬意的时光吧～✨',
  '平静': '平静是一种难得的力量。内心的安宁比什么都珍贵，愿你一直保持这份从容。🍃',
  '低落': '亲爱的，感觉到你今天有些低落。请记住，低落不是软弱，是心灵在提醒你需要休息了。心晴小助手已给你发了私信，去看看吧。💝',
  '难过': '我看到了你的难过。想哭就哭出来吧，眼泪也是治愈的一部分。你不需要一直坚强，心晴小助手在私信里陪着你。🌙',
  '焦虑': '焦虑说明你在乎，但这不代表你必须一个人承担。深呼吸，慢慢来——你比自己想象的更强大。心晴小助手给你发了一条关怀消息哦～🌿',
  '疲惫': '累了吧？你已经做得很好了。休息不是偷懒，而是给自己充电。去喝杯水，伸个懒腰吧。💤',
};
function generateMockData() {
  const data = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (Math.random() > 0.25) {
      const e = emotions[Math.floor(Math.random() * emotions.length)];
      data.push({
        date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        emotion: e,
        note: ['今天过得不错', '有点压力但还好', '状态一般', '效率很高！', '想休息', '和同事聊天很开心', '加班有点累'][Math.floor(Math.random() * 7)],
        tags: [tags[Math.floor(Math.random() * tags.length)], tags[Math.floor(Math.random() * tags.length)]].filter((v, i, a) => a.indexOf(v) === i),
      });
    }
  }
  return data;
}

export default function MoodPage() {
  const navigate = useNavigate();
  const [storeInstance, userState] = store.useStore();
  const [records, setRecords] = useState(() => generateMockData());
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [note, setNote] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCareMessage, setShowCareMessage] = useState(false);
  const [careMessage, setCareMessage] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tab, setTab] = useState('checkin');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userState.isAuthenticated) {
      navigate('/login');
      return;
    }
    // 从API加载真实数据
    storeInstance.fetchMoods().then(() => {
      const moods = storeInstance.getState().moods;
      if (moods && moods.length > 0) {
        // 转换API数据为组件格式（用反向映射：英文→中文标签→emotion对象）
        const converted = moods.slice(0, 30).map(m => {
          const label = reverseMoodMap[m.mood] || '平静';
          return {
            date: m.created_at ? new Date(m.created_at).toISOString().split('T')[0] : '',
            emotion: emotions.find(e => e.label === label) || emotions[2],
            note: m.content || '',
            tags: m.tags || []
          };
        }).filter(r => r.date); // 过滤掉无效日期
        setRecords(converted);
      }
    });
  }, [userState.isAuthenticated, navigate, storeInstance]);

  const handleTagClick = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleCheckin = async () => {
    if (!selectedEmotion) return;
    
    if (!userState.isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const moodScore = selectedEmotion.value * 2;
      await storeInstance.createMood({
        mood: moodMap[selectedEmotion.label] || 'neutral',
        score: moodScore,
        content: note,
        tags: selectedTags
      });
      
      // 根据不同心情显示对应的关怀提示
      const moodLabel = selectedEmotion.label;
      const needsCare = ['低落', '难过', '焦虑'].includes(moodLabel);
      setCareMessage(careMessagesByMood[moodLabel] || careMessagesByMood['平静']);
      setShowCareMessage(true);
      if (!needsCare) {
        // 好心情时提示较短，自动关闭更快
        setTimeout(() => setShowCareMessage(false), 4000);
      } else {
        // 不好的心情保持更长时间，引导用户查看私信
        setTimeout(() => setShowCareMessage(false), 8000);
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedEmotion(null);
        setNote('');
        setSelectedTags([]);
      }, 2000);
      
      // 刷新记录
      await storeInstance.fetchMoods();
      const moods = storeInstance.getState().moods;
      if (moods && moods.length > 0) {
        const converted = moods.slice(0, 30).map(m => {
          const label = reverseMoodMap[m.mood] || '平静';
          return {
            date: m.created_at ? new Date(m.created_at).toISOString().split('T')[0] : '',
            emotion: emotions.find(e => e.label === label) || emotions[2],
            note: m.content || '',
            tags: m.tags || []
          };
        }).filter(r => r.date);
        setRecords(converted);
      }
    } catch (error) {
      alert('打卡失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 日历数据
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const record = records.find(r => r.date === dateStr);
      days.push({ day: i, record });
    }
    return days;
  }, [currentMonth, records]);

  // 趋势图数据（最近14天）
  const trendData = useMemo(() => {
    const today = new Date();
    const data = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const record = records.find(r => r.date === dateStr);
      data.push({
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        value: record ? record.emotion.value : 0,
        hasData: !!record,
      });
    }
    return data;
  }, [records]);

  const maxValue = 5;
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className={styles.page}>
      <div className="page-container">
        {/* 页面头部 */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>🌤️</span>
            <div>
              <h1 className={styles.title}>心情打卡</h1>
              <p className={styles.subtitle}>记录每一天的情绪，看见内心的变化</p>
            </div>
          </div>
          <div className={styles.stats}>
            <div className={styles.statChip}>
              <span className={styles.statNum}>{records.length}</span>
              <span>本月打卡</span>
            </div>
            <div className={styles.statChip}>
              <span className={styles.statNum}>{records.filter(r => r.emotion.value >= 4).length}</span>
              <span>开心天数</span>
            </div>
          </div>
        </div>

        {/* Tab 切换 */}
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'checkin' ? styles.tabActive : ''}`} onClick={() => setTab('checkin')}>
            📝 今日打卡
          </button>
          <button className={`${styles.tab} ${tab === 'calendar' ? styles.tabActive : ''}`} onClick={() => setTab('calendar')}>
            📅 打卡日历
          </button>
          <button className={`${styles.tab} ${tab === 'trend' ? styles.tabActive : ''}`} onClick={() => setTab('trend')}>
            📊 情绪趋势
          </button>
        </div>

        {/* 打卡面板 */}
        {tab === 'checkin' && (
          <div className={styles.checkinPanel}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>今天心情怎么样？</h3>
              <div className={styles.emotionGrid}>
                {emotions.map(e => (
                  <button
                    key={e.label}
                    className={`${styles.emotionBtn} ${selectedEmotion?.label === e.label ? styles.emotionSelected : ''}`}
                    style={{ '--ec': e.color }}
                    onClick={() => setSelectedEmotion(e)}
                  >
                    <span className={styles.emotionEmoji}>{e.emoji}</span>
                    <span className={styles.emotionLabel}>{e.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>想说点什么？</h3>
              <textarea
                className={styles.noteInput}
                placeholder="记录此刻的想法，可以是一句话，也可以是一段话..."
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
              />
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>相关标签</h3>
              <div className={styles.tagList}>
                {tags.map(tag => (
                  <button
                    key={tag}
                    className={`${styles.tagBtn} ${selectedTags.includes(tag) ? styles.tagBtnActive : ''}`}
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <button
              className={`btn-primary ${styles.submitBtn} ${!selectedEmotion ? styles.submitDisabled : ''}`}
              onClick={handleCheckin}
              disabled={!selectedEmotion}
            >
              {showSuccess ? '✅ 打卡成功！' : '完成打卡'}
            </button>
          </div>
        )}

        {/* 日历面板 */}
        {tab === 'calendar' && (
          <div className={styles.calendarPanel}>
            <div className={styles.calendarHeader}>
              <button className={styles.calNav} onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>◀</button>
              <span className={styles.calTitle}>{currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月</span>
              <button className={styles.calNav} onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>▶</button>
            </div>
            <div className={styles.calWeekdays}>
              {weekDays.map(w => <span key={w} className={styles.calWeekday}>{w}</span>)}
            </div>
            <div className={styles.calGrid}>
              {calendarDays.map((d, i) => (
                <div key={i} className={`${styles.calDay} ${d?.record ? styles.calDayHasRecord : ''} ${!d ? styles.calDayEmpty : ''}`}>
                  {d && (
                    <>
                      <span className={styles.calDayNum}>{d.day}</span>
                      {d.record && (
                        <span className={styles.calDayEmoji}>{d.record.emotion.emoji}</span>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {records.length > 0 && (
              <div className={styles.recentRecords}>
                <h3 className={styles.sectionTitle}>最近打卡记录</h3>
                <div className={styles.recordList}>
                  {records.slice(-5).reverse().map((r, i) => (
                    <div key={i} className={styles.recordItem}>
                      <span className={styles.recordEmoji}>{r.emotion.emoji}</span>
                      <div className={styles.recordInfo}>
                        <span className={styles.recordDate}>{r.date}</span>
                        <span className={styles.recordNote}>{r.note}</span>
                        {r.tags.length > 0 && (
                          <div className={styles.recordTags}>
                            {r.tags.map(t => <span key={t} className={styles.recordTag}>{t}</span>)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 趋势面板 */}
        {tab === 'trend' && (
          <div className={styles.trendPanel}>
            <div className={styles.trendChart}>
              <h3 className={styles.sectionTitle}>近 14 天情绪趋势</h3>
              <div className={styles.chartArea}>
                <div className={styles.yAxis}>
                  <span>😄</span><span>😊</span><span>😐</span><span>😔</span><span>😢</span>
                </div>
                <div className={styles.chartBody}>
                  <div className={styles.gridLines}>
                    {[1, 2, 3, 4, 5].map(v => (
                      <div key={v} className={styles.gridLine} style={{ bottom: `${(v - 1) / (maxValue - 1) * 100}%` }} />
                    ))}
                  </div>
                  <svg className={styles.trendSvg} viewBox="0 0 560 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF8C69" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#FF8C69" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    {trendData.some(d => d.hasData) && (
                      <>
                        <path
                          d={trendData.map((d, i) => {
                            const x = (i / (trendData.length - 1)) * 560;
                            const y = d.hasData ? 200 - ((d.value - 1) / (maxValue - 1)) * 180 - 10 : null;
                            return y !== null ? `${i === 0 ? 'M' : 'L'}${x},${y}` : '';
                          }).filter(Boolean).join(' ')}
                          fill="none"
                          stroke="#FF8C69"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d={[trendData.map((d, i) => {
                            const x = (i / (trendData.length - 1)) * 560;
                            const y = d.hasData ? 200 - ((d.value - 1) / (maxValue - 1)) * 180 - 10 : null;
                            return y !== null ? `${i === 0 ? 'M' : 'L'}${x},${y}` : '';
                          }).filter(Boolean).join(' '), 'L560,200 L0,200 Z'].join(' ')}
                          fill="url(#trendGrad)"
                        />
                        {trendData.filter(d => d.hasData).map((d, i) => {
                          const allIdx = trendData.indexOf(d);
                          const x = (allIdx / (trendData.length - 1)) * 560;
                          const y = 200 - ((d.value - 1) / (maxValue - 1)) * 180 - 10;
                          return (
                            <g key={i}>
                              <circle cx={x} cy={y} r="5" fill="#FF8C69" />
                              <circle cx={x} cy={y} r="8" fill="#FF8C69" opacity="0.2" />
                            </g>
                          );
                        })}
                      </>
                    )}
                  </svg>
                  <div className={styles.xLabels}>
                    {trendData.map((d, i) => (
                      <span key={i} className={styles.xLabel}>{d.label}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 情绪分布 */}
            <div className={styles.distribution}>
              <h3 className={styles.sectionTitle}>情绪分布统计</h3>
              <div className={styles.distBars}>
                {emotions.map(e => {
                  const count = records.filter(r => r.emotion.label === e.label).length;
                  const pct = records.length > 0 ? (count / records.length * 100) : 0;
                  return (
                    <div key={e.label} className={styles.distRow}>
                      <span className={styles.distEmoji}>{e.emoji}</span>
                      <span className={styles.distName}>{e.label}</span>
                      <div className={styles.distBarBg}>
                        <div className={styles.distBarFill} style={{ width: `${pct}%`, background: e.color }} />
                      </div>
                      <span className={styles.distCount}>{count}次</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 关怀消息弹窗 */}
      {showCareMessage && (
        <div className={styles.careOverlay} onClick={() => setShowCareMessage(false)}>
          <div className={styles.careCard} onClick={e => e.stopPropagation()}>
            <div className={styles.careIcon}>🌸</div>
            <h3 className={styles.careTitle}>心晴小助手关怀你</h3>
            <p className={styles.careMessage}>{careMessage}</p>
            {['低落', '难过', ' anxiety'].includes(selectedEmotion?.label) && (
              <p className={styles.careTip} style={{ textAlign: 'center', fontSize: '13px', color: '#999', marginTop: 8 }}>
                💬 心晴小助手已向你发送了私信关怀，请前往私信查看
              </p>
            )}
            <button className={styles.careClose} onClick={() => setShowCareMessage(false)}>
              我知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
