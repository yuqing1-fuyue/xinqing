const http = require('http');

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? 'Bearer ' + token : ''
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
  // 注册
  const ts = Date.now();
  const email = 'debug_' + ts + '@test.com';
  const reg = await request('POST', '/auth/register', {
    username: 'debug_' + ts,
    email: email,
    password: 'Test123456',
    nickname: '调试用户'
  });
  console.log('注册:', reg.status, reg.data.user ? 'OK' : reg.data.error);
  const token = reg.data.token;
  
  // 测试心情
  console.log('\n测试心情提交:');
  const mood = await request('POST', '/moods', { mood: 'happy', score: 8, content: '测试心情' }, token);
  console.log('状态:', mood.status);
  console.log('响应:', JSON.stringify(mood.data));
  
  // 测试群组加入
  console.log('\n测试群组:');
  const create = await request('POST', '/groups', { name: '测试群组2', description: '测试' }, token);
  console.log('创建群组:', create.status, create.data);
  
  if (create.data.group) {
    const join = await request('POST', '/groups/' + create.data.group.id + '/join', null, token);
    console.log('加入群组:', join.status, join.data);
  }
}

test().catch(console.error);
