/**
 * 敏感词过滤工具
 * 使用 Trie 树算法实现高效敏感词检测
 */

class SensitiveFilter {
  constructor() {
    this.tree = {};
    this.init();
  }

  init() {
    // 基础敏感词库（可根据需要扩展）
    const words = [
      '自杀', '杀人', '毒品', '赌博', '诈骗', '暴力', '色情', '低俗',
      '反动', '分裂', '恐怖', '邪教', '贿赂', '贪污', '走私'
    ];
    words.forEach(w => this.addWord(w));
  }

  addWord(word) {
    let node = this.tree;
    for (const char of word) {
      if (!node[char]) node[char] = {};
      node = node[char];
    }
    node['isEnd'] = true;
  }

  filter(text) {
    if (!text) return { filtered: text, hasSensitive: false, words: [] };
    
    const found = [];
    let result = '';
    let i = 0;
    
    while (i < text.length) {
      let node = this.tree;
      let j = i;
      let matchEnd = -1;
      
      while (j < text.length && node[text[j]]) {
        node = node[text[j]];
        if (node.isEnd) matchEnd = j;
        j++;
      }
      
      if (matchEnd >= 0) {
        found.push(text.substring(i, matchEnd + 1));
        result += text.substring(i, matchEnd) + '*'.repeat(matchEnd - i + 1);
        i = matchEnd + 1;
      } else {
        result += text[i];
        i++;
      }
    }
    
    return { filtered: result, hasSensitive: found.length > 0, words: found };
  }

  check(text) {
    if (!text) return false;
    const result = this.filter(text);
    return result.hasSensitive;
  }
}

const filter = new SensitiveFilter();

module.exports = { SensitiveFilter, filter };
