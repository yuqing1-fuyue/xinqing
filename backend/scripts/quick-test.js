const http = require('http');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjM4LCJlbWFpbCI6InRlc3RfYXBpQHRlc3QuY29tIiwidXNlcm5hbWUiOiJ0ZXN0X2FwaV91c2VyIiwiaWF0IjoxNzc2ODQwMzE3LCJleHAiOjE3Nzc0NDUxMTd9.m_ACr-66LL_o1bNl5S0uWEjlHm-4CHXLBguHQjfBjiQ';

function post(path, data) {
  return new Promise((resolve) => {
    const body = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api${path}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = http.request(options, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(d) }));
    });
    req.write(body);
    req.end();
  });
}

async function test() {
  console.log('=== 测试所有心情类型 (score=3) ===\n');
  
  const moods = ['happy', 'calm', 'sad', 'anxious', 'neutral', 'angry'];
  let passed = 0;
  
  for (const mood of moods) {
    const res = await post('/moods', { mood, score: 3, content: `测试${mood}` });
    const ok = res.status === 201;
    if (ok) passed++;
    const care = res.data.careMessage ? ' [关怀触发✓]' : '';
    console.log(`${ok ? '✅' : '❌'} ${mood.padEnd(7)} score=3${care}`);
    if (!ok) console.log(`   错误: ${res.data.error}`);
  }
  
  console.log(`\n📊 结果: ${passed}/${moods.length} 通过`);
  
  // 测试分数边界
  console.log('\n=== 测试分数边界 ===\n');
  const scores = [1, 2, 3, 4, 5, 8, 10];
  for (const score of scores) {
    const res = await post('/moods', { mood: 'happy', score, content: `测试score=${score}` });
    const ok = res.status === 201;
    const care = res.data.careMessage ? ' [关怀✓]' : '';
    console.log(`${ok ? '✅' : '❌'} happy score=${String(score).padStart(2)}${care}`);
    if (!ok) console.log(`   错误: ${res.data.error}`);
  }
  
  // 测试私信功能
  console.log('\n=== 测试私信功能 ===\n');
  const usersRes = await fetch('http://localhost:3000/api/messages/users', {
    headers: { 'Authorization': `Bearer ${TOKEN}` }
  }).then(r => r.json());
  const bot = usersRes.users?.find(u => u.role === 'bot');
  if (bot) {
    console.log(`✅ 心晴小助手: ${bot.nickname} (ID: ${bot.id})`);
    
    const msgRes = await post('/messages', { receiverId: bot.id, content: '你好！' });
    console.log(`${msgRes.status === 201 ? '✅' : '❌'} 发送消息: ${msgRes.data.message?.id || msgRes.data.error}`);
  } else {
    console.log('❌ 心晴小助手未找到');
  }
}

test();
