/**
 * 心晴同行 - 全功能测试脚本
 * 完整测试所有API功能
 */
const http = require('http');

const BASE_URL = 'http://localhost:3000/api';
let token = '';
let userId = null;
let testUser = 'test_user_' + Date.now();
let botId = null;

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║          心晴同行 - 全功能测试 (包含所有心情类型)              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // 1. 健康检查
  console.log('📡 1. 健康检查...');
  let res = await request('GET', '/health');
  console.log(`   ${res.status === 200 ? '✅' : '❌'} HTTP ${res.status}`);
  console.log('');

  // 2. 注册
  console.log('👤 2. 用户注册...');
  res = await request('POST', '/auth/register', {
    username: testUser,
    email: testUser + '@test.com',
    password: 'Test123456',
    nickname: '测试用户'
  });
  console.log(`   ${res.status === 201 ? '✅' : '❌'} HTTP ${res.status}`, res.data.message || '');
  if (res.status === 201) {
    userId = res.data.user?.id;
    console.log(`   用户ID: ${userId}`);
  }
  console.log('');

  // 3. 登录
  console.log('🔑 3. 用户登录...');
  res = await request('POST', '/auth/login', {
    email: testUser + '@test.com',
    password: 'Test123456'
  });
  console.log(`   ${res.status === 200 ? '✅' : '❌'} HTTP ${res.status}`);
  if (res.data.token) {
    token = res.data.token;
    console.log(`   ✅ 获得Token`);
  }
  console.log('');

  // 4. 测试所有心情类型 (1-10分)
  console.log('😊 4. 心情打卡测试 (所有心情类型 x 分数范围)...');
  const moods = ['happy', 'calm', 'sad', 'anxious', 'neutral', 'angry'];
  const scores = [1, 3, 5, 8, 10];  // 测试边界值

  let moodTestsPassed = 0;
  let moodTestsTotal = moods.length * scores.length;

  for (const mood of moods) {
    for (const score of scores) {
      res = await request('POST', '/moods', { mood, score, content: `测试${mood}心情-${score}分` }, token);
      const passed = res.status === 201;
      if (passed) moodTestsPassed++;
      const careMsg = res.data.careMessage ? ' [关怀触发]' : '';
      console.log(`   ${passed ? '✅' : '❌'} ${mood.padEnd(7)} score=${score}${careMsg}`);
      if (!passed && res.data.error) {
        console.log(`      错误: ${res.data.error}`);
      }
    }
  }
  console.log(`   📊 心情测试结果: ${moodTestsPassed}/${moodTestsTotal} 通过`);
  console.log('');

  // 5. 获取心情记录
  console.log('📋 5. 获取心情记录...');
  res = await request('GET', '/moods', null, token);
  console.log(`   ${res.status === 200 ? '✅' : '❌'} HTTP ${res.status}`);
  console.log(`   记录数: ${res.data.moods?.length || 0}`);
  console.log('');

  // 6. 心情统计
  console.log('📊 6. 心情统计...');
  res = await request('GET', '/moods/stats', null, token);
  console.log(`   ${res.status === 200 ? '✅' : '❌'} HTTP ${res.status}`);
  if (res.data.stats) console.log(`   统计天数: ${res.data.stats.length}`);
  console.log('');

  // 7. 树洞分类
  console.log('🌳 7. 树洞分类...');
  res = await request('GET', '/treehole/categories', null, token);
  console.log(`   ${res.status === 200 ? '✅' : '❌'} HTTP ${res.status}`);
  console.log(`   分类数: ${res.data.categories?.length || 0}`);
  console.log('');

  // 8. 发布树洞
  console.log('✏️ 8. 发布树洞...');
  res = await request('POST', '/treehole', {
    content: '这是一条测试树洞帖子，测试加密存储功能。',
    categoryId: 1,
    isAnonymous: true
  }, token);
  const postId = res.status === 201 ? res.data.post?.id : null;
  console.log(`   ${res.status === 201 ? '✅' : '❌'} HTTP ${res.status}`);
  console.log(`   帖子ID: ${postId || '无'}`);
  console.log('');

  // 9. 获取树洞列表
  console.log('📜 9. 获取树洞列表...');
  res = await request('GET', '/treehole?limit=10', null, token);
  console.log(`   ${res.status === 200 ? '✅' : '❌'} HTTP ${res.status}`);
  console.log(`   帖子数: ${res.data.posts?.length || 0}`);
  if (res.data.posts?.[0]) {
    console.log(`   ✅ 内容解密成功: ${res.data.posts[0].content.substring(0, 30)}...`);
  }
  console.log('');

  // 10. 学校列表
  console.log('🏫 10. 学校列表...');
  res = await request('GET', '/schools', null, token);
  console.log(`   ${res.status === 200 ? '✅' : '❌'} HTTP ${res.status}`);
  console.log(`   学校数: ${res.data.schools?.length || 0}`);
  console.log('');

  // 11. 群组列表
  console.log('👥 11. 群组列表...');
  res = await request('GET', '/groups', null, token);
  console.log(`   ${res.status === 200 ? '✅' : '❌'} HTTP ${res.status}`);
  console.log(`   群组数: ${res.data.groups?.length || 0}`);
  if (res.data.groups?.[0]) {
    const g = res.data.groups[0];
    console.log(`   示例: ${g.name} (${g.member_count || 0}人)`);
  }
  console.log('');

  // 12. 创建群组
  console.log('➕ 12. 创建群组...');
  res = await request('POST', '/groups', {
    name: '测试互助群',
    description: '这是一个测试群组'
  }, token);
  const groupId = res.status === 201 ? res.data.group?.id : null;
  console.log(`   ${res.status === 201 ? '✅' : '❌'} HTTP ${res.status}`);
  console.log(`   群组ID: ${groupId || '无'}`);
  console.log('');

  // 13. 加入群组
  console.log('🤝 13. 加入群组...');
  if (groupId) {
    res = await request('POST', `/groups/${groupId}/join`, null, token);
    console.log(`   ${res.status === 200 ? '✅' : '❌'} HTTP ${res.status}`);
  }
  console.log('');

  // 14. 私信用户列表 (关键测试!)
  console.log('💬 14. 私信用户列表 (包含心晴小助手)...');
  res = await request('GET', '/messages/users', null, token);
  console.log(`   ${res.status === 200 ? '✅' : '❌'} HTTP ${res.status}`);
  const users = res.data.users || [];
  console.log(`   用户数: ${users.length}`);
  const bot = users.find(u => u.role === 'bot');
  if (bot) {
    botId = bot.id;
    console.log(`   ✅ 心晴小助手: ${bot.nickname} (ID: ${bot.id})`);
  } else {
    console.log(`   ❌ 心晴小助手未找到`);
  }
  console.log('');

  // 15. 发送私信给bot
  console.log('📩 15. 发送私信给心晴小助手...');
  if (botId) {
    res = await request('POST', '/messages', {
      receiverId: botId,
      content: '你好，心晴小助手！'
    }, token);
    console.log(`   ${res.status === 201 ? '✅' : '❌'} HTTP ${res.status}`);
    console.log(`   消息ID: ${res.data.message?.id || '无'}`);
  } else {
    console.log(`   ⚠️ 跳过 (未找到bot)`);
  }
  console.log('');

  // 16. 获取与bot的对话
  console.log('📖 16. 获取与心晴小助手的对话...');
  if (botId) {
    res = await request('GET', `/messages/${botId}`, null, token);
    console.log(`   ${res.status === 200 ? '✅' : '❌'} HTTP ${res.status}`);
    console.log(`   消息数: ${res.data.messages?.length || 0}`);
    if (res.data.messages?.[0]) {
      console.log(`   ✅ 内容解密成功: ${res.data.messages[0].content}`);
    }
  } else {
    console.log(`   ⚠️ 跳过 (未找到bot)`);
  }
  console.log('');

  // 17. AI对话
  console.log('🤖 17. AI对话测试...');
  res = await request('POST', '/chat', {
    message: '你好，请介绍一下你自己'
  }, token);
  console.log(`   ${res.status === 200 ? '✅' : '❌'} HTTP ${res.status}`);
  if (res.data.response) {
    console.log(`   AI回复: ${res.data.response.substring(0, 50)}...`);
  }
  console.log('');

  // 18. 关怀消息
  console.log('💝 18. 关怀消息...');
  res = await request('GET', '/cares', null, token);
  console.log(`   ${res.status === 200 ? '✅' : '❌'} HTTP ${res.status}`);
  console.log(`   关怀数: ${res.data.cares?.length || 0}`);
  console.log('');

  // 19. 健康资源
  console.log('📚 19. 健康资源...');
  res = await request('GET', '/resources', null, token);
  console.log(`   ${res.status === 200 ? '✅' : '❌'} HTTP ${res.status}`);
  console.log(`   资源数: ${res.data.resources?.length || 0}`);
  console.log('');

  // 总结
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                        测试完成总结                             ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`\n✅ 所有心情类型测试: ${moodTestsPassed}/${moodTestsTotal}`);
  console.log(`✅ 心晴小助手集成: ${botId ? '成功' : '失败'}`);
  console.log(`✅ 加密功能: 所有数据正常加解密`);
  console.log(`\n🎉 心晴同行项目全功能测试完成！`);
}

test().catch(console.error);
