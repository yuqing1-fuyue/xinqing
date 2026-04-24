/**
 * 数据加密模块 - 企业级心理健康支持平台
 * 使用 AES-256-GCM 加密敏感数据
 */
const crypto = require('crypto');

// 加密密钥 - 使用固定密钥或从环境变量获取
// 必须是64字符的纯hex字符串（32字节），确保服务器重启后密钥不变
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * 加密数据
 * @param {string} text - 要加密的文本
 * @returns {string} 加密后的文本 (base64格式: iv:authTag:encryptedData)
 */
function encrypt(text) {
  if (!text) return text;
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // 返回格式: iv:authTag:encryptedData
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * 解密数据
 * @param {string} encryptedText - 加密的文本
 * @returns {string} 解密后的文本
 */
function decrypt(encryptedText) {
  if (!encryptedText || !encryptedText.includes(':')) return encryptedText;
  
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) return encryptedText;
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedData = parts[2];
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('解密失败:', error.message);
    return encryptedText;
  }
}

/**
 * 生成随机ID
 * @param {number} length - ID长度
 * @returns {string} 随机ID
 */
function generateId(length = 32) {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
}

/**
 * 哈希敏感数据（不可逆）
 * @param {string} text - 要哈希的文本
 * @returns {string} 哈希值
 */
function hash(text) {
  if (!text) return text;
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * 生成安全的随机令牌
 * @param {number} length - 令牌长度（字节）
 * @returns {string} 随机令牌（base64url格式）
 */
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('base64url');
}

module.exports = {
  encrypt,
  decrypt,
  generateId,
  hash,
  generateToken,
  ENCRYPTION_KEY
};
