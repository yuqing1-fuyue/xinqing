// 简单的状态管理 - 企业级心理健康支持平台
import { api } from '../services/api';

class Store {
  constructor() {
    this.state = {
      user: null,
      isAuthenticated: !!localStorage.getItem('token'),
      moods: [],
      treehole: [],
      healthResources: [],
      chatHistory: []
    };
    this.listeners = [];
  }

  // 获取状态
  getState() {
    return this.state;
  }

  // 更新状态
  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  // 订阅状态变化
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // 通知所有监听器
  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // ============ 认证方法 ============

  async login(email, password) {
    try {
      const data = await api.login(email, password);
      this.setState({ 
        user: data.user, 
        isAuthenticated: true 
      });
      return data;
    } catch (error) {
      throw error;
    }
  }

  async register(userData) {
    try {
      const data = await api.register(userData);
      this.setState({ 
        user: data.user, 
        isAuthenticated: true 
      });
      return data;
    } catch (error) {
      throw error;
    }
  }

  logout() {
    api.logout();
    this.setState({ 
      user: null, 
      isAuthenticated: false,
      moods: [],
      treehole: [],
      chatHistory: []
    });
  }

  async fetchCurrentUser() {
    if (!this.state.isAuthenticated) return null;
    try {
      const data = await api.getCurrentUser();
      this.setState({ user: data.user });
      return data.user;
    } catch (error) {
      this.logout();
      return null;
    }
  }

  // ============ 心情打卡 ============

  async createMood(moodData) {
    const data = await api.createMood(moodData);
    await this.fetchMoods();
    return data;
  }

  async fetchMoods() {
    if (!this.state.isAuthenticated) return;
    try {
      const data = await api.getMoods();
      this.setState({ moods: data.moods });
    } catch (error) {
      console.error('获取心情记录失败:', error);
    }
  }

  // ============ 树洞 ============

  async fetchTreehole(page = 1) {
    try {
      const data = await api.getTreehole(page);
      this.setState({ treehole: data.posts });
    } catch (error) {
      console.error('获取树洞失败:', error);
    }
  }

  async createTreehole(content, isAnonymous) {
    const data = await api.createTreehole(content, isAnonymous);
    await this.fetchTreehole();
    return data;
  }

  // ============ 健康资源 ============

  async fetchHealthResources() {
    try {
      const data = await api.getRecommendedResources();
      this.setState({ healthResources: data.resources });
    } catch (error) {
      console.error('获取健康资源失败:', error);
    }
  }

  // ============ AI聊天 ============

  async sendMessage(content) {
    const data = await api.sendMessage(content);
    await this.fetchChatHistory();
    return data;
  }

  async fetchChatHistory() {
    if (!this.state.isAuthenticated) return;
    try {
      const data = await api.getChatHistory();
      this.setState({ chatHistory: data.history });
    } catch (error) {
      console.error('获取聊天历史失败:', error);
    }
  }
}

// 导出单例
export const store = new Store();
export default store;
