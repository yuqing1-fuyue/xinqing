// API 服务层 - 企业级心理健康支持平台

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // 实时获取token
  get token() {
    return localStorage.getItem('token');
  }

  // 设置认证Token
  setToken(token) {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  // 获取请求头 - 实时读取token
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    const token = this.token;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // 通用请求方法
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // 统一返回格式：检查 message 或 success 字段
      if (!response.ok) {
        throw new Error(data.error || data.message || '请求失败');
      }

      // 返回 data，附加 success 标志
      return { ...data, success: true };
    } catch (error) {
      console.error('API请求错误:', error);
      throw error;
    }
  }

  // ============ 认证相关 ============

  // 注册
  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    this.setToken(data.token);
    return data;
  }

  // 登录
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(data.token);
    return data;
  }

  // 获取当前用户
  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // 登出
  logout() {
    this.setToken(null);
  }

  // ============ 用户相关 ============

  // 获取用户信息
  async getUser(id) {
    return this.request(`/users/${id}`);
  }

  // 更新用户资料
  async updateProfile(data) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // 修改密码
  async changePassword(oldPassword, newPassword) {
    return this.request('/users/password', {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, newPassword })
    });
  }

  // ============ 心情打卡 ============

  // 创建心情打卡
  async createMood(moodData) {
    return this.request('/moods', {
      method: 'POST',
      body: JSON.stringify(moodData)
    });
  }

  // 获取心情记录
  async getMoods(limit = 30) {
    return this.request(`/moods?limit=${limit}`);
  }

  // 获取心情统计
  async getMoodStats(days = 30) {
    return this.request(`/moods/stats?days=${days}`);
  }

  // 获取心情趋势
  async getMoodTrend(days = 7) {
    return this.request(`/moods/trend?days=${days}`);
  }

  // ============ 树洞 ============

  // 获取树洞列表
  async getTreehole(page = 1, limit = 20) {
    return this.request(`/treehole?page=${page}&limit=${limit}`);
  }

  // 发布树洞
  async createTreehole(content, isAnonymous = false) {
    return this.request('/treehole', {
      method: 'POST',
      body: JSON.stringify({ content, isAnonymous })
    });
  }

  // 获取树洞详情
  async getTreeholeDetail(id) {
    return this.request(`/treehole/${id}`);
  }

  // 添加评论
  async addComment(treeholeId, content) {
    return this.request(`/treehole/${treeholeId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  }

  // ============ 健康资源 ============

  // 获取分类
  async getHealthCategories() {
    return this.request('/health/categories');
  }

  // 获取资源列表
  async getHealthResources(category) {
    const url = category 
      ? `/health?category=${category}` 
      : '/health';
    return this.request(url);
  }

  // 获取推荐资源
  async getRecommendedResources() {
    return this.request('/health/recommended');
  }

  // ============ AI聊天 ============

  // 发送消息
  async sendMessage(content) {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  }

  // 获取聊天历史
  async getChatHistory(limit = 50) {
    return this.request(`/chat/history?limit=${limit}`);
  }

  // 清除聊天历史
  async clearChatHistory() {
    return this.request('/chat/history', { method: 'DELETE' });
  }
}

// 导出单例
export const api = new ApiService();
export default api;
