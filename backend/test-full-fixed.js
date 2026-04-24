/**
 * 全功能测试脚本 - 心晴同行
 */
const http = require('http');

const BASE_URL = 'http://localhost:3000/api';

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': 'Bearer ' + token })
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test() {
  console.log('='.repeat(50));
  console.log('心晴同行 - 全功能测试');
  console.log('='.repeat(50));
  
  let user1Token, user2Token, user1Id, user2Id;
  
  // 1. 测试健康检查
  console.log('\n📋 1. 健康检查');
  const health = await request('GET', '/health');
  console.log(`   状态: ${health.status === 200 ? '✅' : '❌'} ${health.status}`);
  
  // 2. 创建测试用户1
  console.log('\n👤 2. 创建测试用户1');
  const email1 = 'test1_' + Date.now() + '@test.com';
  const reg1 = await request('POST', '/auth/register', {
    username: 'user1_' + Date.now(),
    email: email1,
    password: 'Test123456',
    nickname: '测试用户1号'
  });
  user1Token = reg1.data.token;
  user1Id = reg1.data.user?.id;
  console.log(`   注册: ${reg1.status === 201 ? '✅' : '❌'} ${reg1.status}`);
  console.log(`   用户ID: ${user1Id}`);
  
  // 3. 创建测试用户2
  console.log('\n👤 3. 创建测试用户2');
  const email2 = 'test2_' + Date.now() + '@test.com';
  const reg2 = await request('POST', '/auth/register', {
    username: 'user2_' + Date.now(),
    email: email2,
    password: 'Test123456',
    nickname: '测试用户2号'
  });
  user2Token = reg2.data.token;
  user2Id = reg2.data.user?.id;
  console.log(`   注册: ${reg2.status === 201 ? '✅' : '❌'} ${reg2.status}`);
  console.log(`   用户ID: ${user2Id}`);
  
  // 4. 测试心情打卡（所有心情类型）
  console.log('\n😊 4. 心情打卡测试');
  const moods = ['happy', 'calm', 'neutral', 'anxious', 'sad', 'angry'];
  for (const mood of moods) {
    const score = Math.floor(Math.random() * 10) + 1;
    const result = await request('POST', '/moods', { mood, score, content: '测试心情' }, user1Token);
    const status = result.status === 201 ? '✅' : '❌';
    console.log(`   ${mood} (${score}分): ${status} ${result.status} ${result.data.message || ''}`);
  }
  
  // 5. 获取心情记录
  console.log('\n📊 5. 获取心情记录');
  const moodsList = await request('GET', '/moods', null, user1Token);
  console.log(`   记录数: ${moodsList.data.moods?.length || 0} ${moodsList.status === 200 ? '✅' : '❌'}`);
  
  // 6. 获取用户列表（私信）
  console.log('\n💬 6. 用户列表测试');
  const users = await request('GET', '/messages/users', null, user1Token);
  console.log(`   用户数: ${users.data.users?.length || 0} ${users.status === 200 ? '✅' : '❌'}`);
  if (users.data.users?.length > 0) {
    const bot = users.data.users.find(u => u.nickname === '心晴小助手');
    console.log(`   心晴小助手: ${bot ? '✅ 可见' : '❌ 不可见'}`);
    users.data.users.forEach(u => {
      console.log(`   - ${u.nickname || u.username} (${u.role})`);
    });
  }
  
  // 7. 发送私信
  console.log('\n📩 8. 发送私信');
  const msg = await request('POST', '/messages', {
    receiverId: user2Id,
    content: '这是一条测试私信'
  }, user1Token);
  console.log(`   发送: ${msg.status === 201 ? '✅' : '❌'} ${msg.status}`);
  
  // 8. 获取对话
  const convs = await request('GET', '/messages/conversations', null, user1Token);
  console.log(`   对话列表: ${convs.status === 200 ? '✅' : '❌'} ${convs.data.conversations?.length || 0}条`);
  
  // 9. 树洞测试
  console.log('\n🌳 9. 树洞测试');
  const treehole = await request('POST', '/treehole', {
    content: '这是测试树洞内容，要超过10个字才行的'
  }, user1Token);
  console.log(`   发布: ${treehole.status === 201 ? '✅' : '❌'} ${treehole.status} ${treehole.data.message || ''}`);
  
  // 10. 获取树洞列表
  const posts = await request('GET', '/treehole');
  console.log(`   列表: ${posts.status === 200 ? '✅' : '❌'} ${posts.data.posts?.length || 0}条`);
  if (posts.data.posts?.length > 0) {
    const firstPost = posts.data.posts[0];
    const contentOk = firstPost.content && firstPost.content.length > 5 && !firstPost.content.includes(':');
    console.log(`   内容解密: ${contentOk ? '✅' : '❌'} "${firstPost.content?.substring(0, 30)}..."`);
  }
  
  // 11. 群组测试
  console.log('\n👥 10. 群组测试');
  const createGroup = await request('POST', '/groups', {
    name: '测试群组',
    description: '这是一个测试群组'
  }, user1Token);
  console.log(`   创建: ${createGroup.status === 201 ? '✅' : '❌'} ${createGroup.status}`);
  const groupId = createGroup.data.group?.id;
  
  // 12. 加入群组
  if (groupId) {
    const join = await request('POST', `/groups/${groupId}/join`, null, user2Token);
    console.log(`   加入: ${join.status === 200 ? '✅' : '❌'} ${join.status}`);
    
    // 13. 发送群消息
    const gmsg = await request('POST', `/groups/${groupId}/messages`, {
      content: '群消息测试'
    }, user2Token);
    console.log(`   发消息: ${gmsg.status === 201 ? '✅' : '❌'} ${gmsg.status}`);
    
    // 14. 获取群消息
    const gmsgs = await request('GET', `/groups/${groupId}/messages`);
    console.log(`   消息列表: ${gmsgs.status === 200 ? '✅' : '❌'} ${gmsgs.data.messages?.length || 0}条`);
  }
  
  // 15. 获取关怀消息
  console.log('\n🌸 11. 关怀消息');
  const cares = await request('GET', '/cares', null, user1Token);
  console.log(`   关怀消息: ${cares.status === 200 ? '✅' : '❌'} ${cares.data.cares?.length || 0}条`);
  
  // 16. AI聊天
  console.log('\n🤖 12. AI聊天');
  const chat = await request('POST', '/chat', {
    content: '你好'
  }, user1Token);
  console.log(`   发送: ${chat.status === 200 ? '✅' : '❌'} ${chat.status}`);
  
  // 17. 获取聊天历史
  const history = await request('GET', '/chat/history', null, user1Token);
  console.log(`   历史: ${history.status === 200 ? '✅' : '❌'} ${history.data.history?.length || 0}条`);
  
  console.log('\n' + '='.repeat(50));
  console.log('测试完成！');
  console.log('='.repeat(50));
}

test().catch(console.error);
