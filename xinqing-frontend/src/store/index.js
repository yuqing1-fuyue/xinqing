// 状态管理
import { useState, useEffect } from 'react';
import { api } from '../services/api';

class Store {
  constructor() {
    this.state = {
      user: null,
      isAuthenticated: !!localStorage.getItem('token'),
      moods: [],
      treehole: [],
      chatHistory: [],
      categories: [],
      schools: [],
      groups: [],
      conversations: [],
      cares: [],
      unreadCount: 0
    };
    this.listeners = [];
    this.api = api;
  }

  getState() {
    return this.state;
  }

  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  useStore() {
    const [state, setState] = useState(this.state);
    useEffect(() => {
      const unsubscribe = this.subscribe(setState);
      return unsubscribe;
    }, []);
    return [this, state];
  }

  async login(email, password) {
    const data = await api.login(email, password);
    this.setState({ user: data.user, isAuthenticated: true });
    return data;
  }

  async register(userData) {
    const data = await api.register(userData);
    this.setState({ user: data.user, isAuthenticated: true });
    return data;
  }

  logout() {
    api.logout();
    this.setState({ user: null, isAuthenticated: false, moods: [], treehole: [], chatHistory: [] });
  }

  async fetchCurrentUser() {
    if (!this.state.isAuthenticated) return null;
    try {
      const data = await api.getCurrentUser();
      this.setState({ user: data.user });
      return data.user;
    } catch {
      this.logout();
      return null;
    }
  }

  async createMood(moodData) {
    await api.createMood(moodData);
    await this.fetchMoods();
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

  async fetchTreehole(page = 1, categoryId = null) {
    try {
      const url = categoryId ? `/treehole?page=${page}&categoryId=${categoryId}` : `/treehole?page=${page}`;
      const data = await api.request(url);
      this.setState({ treehole: data.posts });
      return data.posts; // 返回posts供页面使用
    } catch (error) {
      console.error('获取树洞失败:', error);
      return [];
    }
  }

  async createTreehole(content, isAnonymous, categoryId = null, schoolId = null, groupId = null) {
    await api.createTreehole(content, isAnonymous, categoryId, schoolId, groupId);
    await this.fetchTreehole();
  }

  // 分类
  async fetchCategories() {
    try {
      const data = await api.getCategories();
      this.setState({ categories: data.categories });
      return data.categories;
    } catch (error) {
      console.error('获取分类失败:', error);
      return [];
    }
  }

  // 学校
  async fetchSchools() {
    try {
      const data = await api.getSchools();
      this.setState({ schools: data.schools });
      return data.schools;
    } catch (error) {
      console.error('获取学校失败:', error);
      return [];
    }
  }

  async searchSchools(keyword) {
    try {
      const data = await api.searchSchools(keyword);
      return data.schools;
    } catch (error) {
      return [];
    }
  }

  // 群组
  async fetchGroups(schoolId = null) {
    try {
      const data = await api.getGroups(schoolId);
      this.setState({ groups: data.groups });
      return data.groups;
    } catch (error) {
      console.error('获取群组失败:', error);
      return [];
    }
  }

  async fetchMyGroups() {
    try {
      const data = await api.getMyGroups();
      return data.groups || [];
    } catch (error) {
      console.error('获取我的群组失败:', error);
      return [];
    }
  }

  async createGroup(groupData) {
    return await api.createGroup(groupData);
  }

  async joinGroup(groupId) {
    return await api.joinGroup(groupId);
  }

  async leaveGroup(groupId) {
    return await api.leaveGroup(groupId);
  }

  // 群聊消息
  async fetchGroupMessages(groupId) {
    try {
      const data = await api.getGroupMessages(groupId);
      return data.messages;
    } catch (error) {
      console.error('获取群消息失败:', error);
      return [];
    }
  }

  async sendGroupMessage(groupId, content, replyTo = null) {
    return await api.sendGroupMessage(groupId, content, replyTo);
  }

  // 评论
  async fetchComments(postId) {
    try {
      const data = await api.getComments(postId);
      return data.comments;
    } catch (error) {
      console.error('获取评论失败:', error);
      return [];
    }
  }

  async createComment(postId, content, isAnonymous = true) {
    return await api.createComment(postId, content, isAnonymous);
  }

  async sendMessage(content) {
    return await api.sendMessage(content);
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

  // ============ 私信 ============
  async fetchConversations() {
    try {
      const data = await api.getConversations();
      this.setState({ conversations: data.conversations || [] });
      return data.conversations || [];
    } catch (error) {
      console.error('获取对话列表失败:', error);
      return [];
    }
  }

  async fetchConversation(userId) {
    try {
      const data = await api.getConversation(userId);
      return data.messages || [];
    } catch (error) {
      console.error('获取对话失败:', error);
      return [];
    }
  }

  async sendPrivateMessage(receiverId, content, isAnonymous = false) {
    return await api.sendMessage(receiverId, content, isAnonymous);
  }

  async fetchCares() {
    try {
      const data = await api.getCares();
      this.setState({ cares: data.cares || [] });
      return data.cares || [];
    } catch (error) {
      console.error('获取关怀消息失败:', error);
      return [];
    }
  }

  async fetchUnreadCount() {
    try {
      const data = await api.getUnreadCount();
      this.setState({ unreadCount: data.unreadCount || 0 });
      return data.unreadCount || 0;
    } catch (error) {
      return 0;
    }
  }
}

export const store = new Store();
export default store;
