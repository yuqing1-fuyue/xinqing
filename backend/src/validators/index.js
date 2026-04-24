/**
 * 表单验证规则
 */
const { body, validationResult } = require('express-validator');

// 注册验证规则
const registerRules = [
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码至少6个字符'),
  body('username')
    .isLength({ min: 2, max: 20 })
    .withMessage('用户名2-20个字符')
    .trim(),
];

// 登录验证规则
const loginRules = [
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('密码不能为空'),
];

// 心情记录验证（支持愤怒心情，1-10评分）
const moodRules = [
  body('mood')
    .isIn(['happy', 'calm', 'sad', 'anxious', 'neutral', 'angry'])
    .withMessage('无效的心情类型'),
  body('score')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('分数范围1-10'),
];

// 树洞验证
const treeholeRules = [
  body('content')
    .isLength({ min: 5, max: 2000 })
    .withMessage('内容5-2000个字符')
    .trim(),
];

// 评论验证
const commentRules = [
  body('content')
    .isLength({ min: 1, max: 500 })
    .withMessage('评论1-500个字符')
    .trim(),
];

// 验证结果处理
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: errors.array()[0].msg 
    });
  }
  next();
};

module.exports = {
  registerRules,
  loginRules,
  moodRules,
  treeholeRules,
  commentRules,
  handleValidation,
};
