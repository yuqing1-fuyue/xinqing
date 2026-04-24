// API 服务层
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  get token() {
    return localStorage.getItem('token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.token || localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: { ...this.getHeaders(), ...options.headers }
    };

    try {
      const response = await fetch(url, config);
      
      // 检查网络错误
      if (!response.ok && response.status === 0) {
        throw new Error('网络连接失败，请检查网络或服务器是否运行');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `请求失败 (${response.status})`);
      }
      
      return data;
    } catch (error) {
      console.error('API请求错误:', error);
      // 保留原始错误信息
      throw error;
    }
  }

  // 认证
  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    this.setToken(data.token);
    return data;
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(data.token);
    return data;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // 用户
  async updateProfile(data) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // 心情
  async createMood(moodData) {
    return this.request('/moods', {
      method: 'POST',
      body: JSON.stringify(moodData)
    });
  }

  async getMoods(limit = 30) {
    return this.request(`/moods?limit=${limit}`);
  }

  // 树洞
  async getTreehole(page = 1, limit = 20) {
    return this.request(`/treehole?page=${page}&limit=${limit}`);
  }

  async createTreehole(content, isAnonymous = false, categoryId = null, schoolId = null, groupId = null) {
    return this.request('/treehole', {
      method: 'POST',
      body: JSON.stringify({ 
        content, 
        isAnonymous,
        categoryId,
        schoolId,
        groupId
      })
    });
  }

  // 健康资源
  async getRecommendedResources() {
    return this.request('/health/recommended');
  }

  async searchResources(query) {
    return this.request(`/health/search?q=${encodeURIComponent(query)}`);
  }

  async getResources() {
    return this.request('/health/resources');
  }

  // AI聊天
  async sendMessage(content) {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  }

  async getChatHistory(limit = 50) {
    return this.request(`/chat/history?limit=${limit}`);
  }

  // ============ 树洞分类 ============
  async getCategories() {
    return this.request('/treehole/categories');
  }

  // ============ 树洞评论 ============
  async getComments(postId) {
    return this.request(`/treehole/${postId}/comments`);
  }

  async createComment(postId, content, isAnonymous = true) {
    return this.request(`/treehole/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content, isAnonymous })
    });
  }

  // ============ 学校 ============
  async getSchools(limit = 200) {
    return this.request(`/schools?limit=${limit}`);
  }

  async searchSchools(keyword) {
    return this.request(`/schools/search/${encodeURIComponent(keyword)}`);
  }

  // ============ 群组 ============
  async getGroups(schoolId = null) {
    const url = schoolId ? `/groups?schoolId=${schoolId}` : '/groups';
    return this.request(url);
  }

  async getMyGroups() {
    return this.request('/groups/mine');
  }

  async createGroup(data) {
    return this.request('/groups', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async joinGroup(groupId) {
    return this.request(`/groups/${groupId}/join`, { method: 'POST' });
  }

  async leaveGroup(groupId) {
    return this.request(`/groups/${groupId}/leave`, { method: 'POST' });
  }

  // ============ 群组聊天 ============
  async getGroupMessages(groupId, limit = 100) {
    return this.request(`/groups/${groupId}/messages?limit=${limit}`);
  }

  async sendGroupMessage(groupId, content, replyTo = null) {
    return this.request(`/groups/${groupId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, replyTo })
    });
  }

  async getRecentGroupMessages(groupId, sinceId = 0, limit = 50) {
    return this.request(`/groups/${groupId}/messages/recent?sinceId=${sinceId}&limit=${limit}`);
  }

  // ============ 私信 ============
  async getConversations() {
    return this.request('/messages/conversations');
  }

  async getConversation(userId) {
    return this.request(`/messages/conversation/${userId}`);
  }

  async sendMessage(receiverId, content, isAnonymous = false) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content, isAnonymous })
    });
  }

  async getUnreadCount() {
    return this.request('/messages/unread');
  }

  async markAsRead(userId) {
    return this.request(`/messages/read/${userId}`, { method: 'PUT' });
  }

  async getUsers() {
    return this.request('/messages/users');
  }

  // ============ 用户ID系统 ============
  async getMyDisplayId() {
    return this.request('/users/my-id');
  }

  async searchUserByDisplayId(displayId) {
    return this.request('/users/search/' + displayId);
  }

  async searchGroupByCode(groupCode) {
    return this.request('/groups/search/' + groupCode);
  }

  // ============ 管理后台 ============
  getDashboard() { return this.request('/admin/dashboard'); }
  getUsers(page, limit, search) {
    var qs = 'page=' + (page || 1) + '&limit=' + (limit || 20);
    if (search) qs += '&search=' + encodeURIComponent(search);
    return this.request('/admin/users?' + qs);
  }
  getUserDetail(id) { return this.request('/admin/users/' + id); }
  updateUser(id, data) { return this.request('/admin/users/' + id, { method: 'PUT', body: JSON.stringify(data) }); }
  deleteUser(id) { return this.request('/admin/users/' + id, { method: 'DELETE' }); }
  resetUserPassword(id, newPassword) { return this.request('/admin/users/' + id + '/reset-password', { method: 'PUT', body: JSON.stringify({ newPassword }) }); }
  getPosts(page, limit) { return this.request('/admin/posts?page=' + (page || 1) + '&limit=' + (limit || 20)); }
  deletePost(id) { return this.request('/admin/posts/' + id, { method: 'DELETE' }); }
  getComments(page, limit) { return this.request('/admin/comments?page=' + (page || 1) + '&limit=' + (limit || 30)); }
  deleteComment(id) { return this.request('/admin/comments/' + id, { method: 'DELETE' }); }
  getAllGroups() { return this.request('/admin/groups'); }
  deleteGroup(id) { return this.request('/admin/groups/' + id, { method: 'DELETE' }); }

  // ============ 关怀消息 ============
  async getCares() {
    return this.request('/cares');
  }

  async getCareUnreadCount() {
    return this.request('/cares/unread');
  }
}

export const api = new ApiService();
export default api;
