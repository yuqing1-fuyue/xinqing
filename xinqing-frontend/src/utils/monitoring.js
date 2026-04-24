/**
 * 前端监控模块 - 企业级心理健康支持平台
 * 支持错误追踪和性能监控
 */

const Monitoring = {
  // 配置
  config: {
    apiUrl: import.meta.env.VITE_MONITORING_API || '',
    enableConsole: import.meta.env.VITE_ENABLE_MONITORING === 'true',
    sampleRate: import.meta.env.VITE_MONITOR_SAMPLE_RATE || 0.1,
  },

  // 是否启用
  isEnabled() {
    return this.config.enableConsole || this.config.apiUrl;
  },

  // 上报错误
  captureError(error, context = {}) {
    if (!this.isEnabled()) return;
    
    const errorInfo = {
      type: 'error',
      message: error.message || String(error),
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      context,
    };

    this.send(errorInfo);
  },

  // 上报警告
  captureWarning(message, context = {}) {
    if (!this.isEnabled()) return;

    const warningInfo = {
      type: 'warning',
      message: String(message),
      url: window.location.href,
      timestamp: new Date().toISOString(),
      context,
    };

    this.send(warningInfo);
  },

  // 上报性能指标
  capturePerformance() {
    if (!this.isEnabled()) return;

    const perf = performance.getEntriesByType('navigation')[0];
    if (!perf) return;

    const perfInfo = {
      type: 'performance',
      url: window.location.href,
      timestamp: new Date().toISOString(),
      metrics: {
        // 页面加载时间
        domContentLoaded: perf.domContentLoadedEventEnd - perf.navigationStart,
        loadComplete: perf.loadEventEnd - perf.navigationStart,
        // 首屏渲染
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
        // 网络
        dns: perf.domainLookupEnd - perf.domainLookupStart,
        tcp: perf.connectEnd - perf.connectStart,
        ttfb: perf.responseStart - perf.requestStart,
      },
    };

    this.send(perfInfo);
  },

  // 发送数据
  async send(data) {
    // 采样
    if (Math.random() > this.config.sampleRate) return;

    // 发送到 API
    if (this.config.apiUrl) {
      try {
        await fetch(this.config.apiUrl + '/api/monitoring', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } catch (e) {
        console.warn('监控数据发送失败:', e);
      }
    }

    // 控制台输出
    if (this.config.enableConsole) {
      console.group(`[监控] ${data.type}`);
      console.log(data);
      console.groupEnd();
    }
  },

  // 初始化
  init() {
    if (!this.isEnabled()) return;

    // 全局错误处理
    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // 未处理的 Promise 拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(event.reason || new Error('Unhandled Promise Rejection'), {
        type: 'unhandledrejection',
      });
    });

    // 页面加载完成时上报性能
    window.addEventListener('load', () => {
      setTimeout(() => this.capturePerformance(), 1000);
    });

    // 路由变化时上报性能
    if (window.history && window.history.pushState) {
      const originalPushState = window.history.pushState;
      window.history.pushState = (...args) => {
        originalPushState.apply(window.history, args);
        setTimeout(() => this.capturePerformance(), 100);
      };
    }

    console.log('[监控] 前端监控已初始化');
  },
};

// 自动初始化
Monitoring.init();

export default Monitoring;
