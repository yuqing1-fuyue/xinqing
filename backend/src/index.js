require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// 导入监控
const { initSentry, getSentryRequestHandler, getSentryMiddleware } = require('./config/sentry');

// 初始化监控
initSentry();

// 导入路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const moodRoutes = require('./routes/moods');
const treeholeRoutes = require('./routes/treehole');
const healthRoutes = require('./routes/health');
const chatRoutes = require('./routes/chat');
const schoolsRoutes = require('./routes/schools');
const groupsRoutes = require('./routes/groups');
const groupMessageRoutes = require('./routes/groupMessages');
const messageRoutes = require('./routes/messages');
const careRoutes = require('./routes/cares');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS配置 - 分离部署：允许前端域名跨域
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',') 
  : (process.env.NODE_ENV === 'production' 
      ? ['https://新青前端.onrender.com']  // 替换成你前端的实际Render域名
      : ['http://localhost:5175', 'http://localhost:5176']);
  
app.use(cors({
  origin: corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

// 限流
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { error: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// 解析JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 压缩
app.use(compression());

// Sentry 请求处理（必须在其他路由之前）
app.use(getSentryRequestHandler());

// 日志
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// API路由（分离部署：纯API，不托管前端静态文件）
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/treehole', treeholeRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/schools', schoolsRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/groups', groupMessageRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/cares', careRoutes);
app.use('/api/admin', adminRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? '服务器错误' : err.message
  });
});

// Sentry 错误处理（必须在其他错误处理之后）
app.use(getSentryMiddleware());

app.listen(PORT, () => {
  console.log(`🚀 心晴同行后端服务运行在 http://localhost:${PORT}`);
});

module.exports = app;
