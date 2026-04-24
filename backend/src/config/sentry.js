/**
 * Sentry 监控配置 - 企业级心理健康支持平台
 * 支持错误追踪和性能监控
 */
const Sentry = require('@sentry/node');

// Sentry DSN - 从环境变量获取
// 可以从 https://sentry.io 获取 DSN
const SENTRY_DSN = process.env.SENTRY_DSN;

/**
 * 初始化 Sentry
 */
function initSentry() {
  if (!SENTRY_DSN) {
    console.log('⚠️ Sentry DSN 未配置，跳过监控初始化');
    console.log('   如需启用监控，请设置 SENTRY_DSN 环境变量');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    
    // 环境
    environment: process.env.NODE_ENV || 'development',
    
    // 发布版本
    release: process.env.APP_VERSION || '1.0.0',
    
    // 采样率 (0-1)
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // 过滤不需要捕获的错误
    ignoreErrors: [
      /Network Error/i,
      /Failed to fetch/i,
      /net::ERR/i,
    ],
    
    // 剥离敏感信息
    beforeSend(event) {
      // 移除请求中的敏感头
      if (event.request && event.request.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
      // 移除用户敏感信息
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      return event;
    },
    
    // 性能监控
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express(),
      new Sentry.Integrations.Sqlite(),
    ],
  });

  console.log('✅ Sentry 监控已启用');
}

/**
 * 获取 Sentry 错误处理器中间件
 */
function getSentryMiddleware() {
  if (!SENTRY_DSN) return (err, req, res, next) => next();
  return Sentry.Handlers.errorHandler();
}

/**
 * 获取 Sentry 请求处理器中间件
 */
function getSentryRequestHandler() {
  if (!SENTRY_DSN) return (req, res, next) => next();
  return Sentry.Handlers.requestHandler();
}

/**
 * 手动上报错误
 * @param {Error} error - 错误对象
 * @param {Object} context - 额外上下文
 */
function captureError(error, context = {}) {
  if (!SENTRY_DSN) return;
  
  Sentry.withScope((scope) => {
    // 添加上下文
    Object.keys(context).forEach(key => {
      scope.setExtra(key, context[key]);
    });
    
    // 设置标签
    scope.setTag('app', 'xinqing-platform');
    
    // 上报错误
    Sentry.captureException(error);
  });
}

/**
 * 记录信息事件
 * @param {string} message - 消息
 * @param {Object} context - 额外上下文
 */
function captureMessage(message, context = {}) {
  if (!SENTRY_DSN) return;
  
  Sentry.withScope((scope) => {
    Object.keys(context).forEach(key => {
      scope.setExtra(key, context[key]);
    });
    scope.setTag('app', 'xinqing-platform');
    Sentry.captureMessage(message, 'info');
  });
}

module.exports = {
  initSentry,
  getSentryMiddleware,
  getSentryRequestHandler,
  captureError,
  captureMessage,
  Sentry
};
