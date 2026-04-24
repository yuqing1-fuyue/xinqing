/**
 * 数据库种子脚本
 * 初始化学校数据
 */
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'xinqing.db');
const db = new Database(DB_PATH);

// 学校数据
const schools = [
  // 北京
  { name: '北京大学', province: '北京', city: '北京市', type: 'university' },
  { name: '清华大学', province: '北京', city: '北京市', type: 'university' },
  { name: '中国人民大学', province: '北京', city: '北京市', type: 'university' },
  { name: '北京师范大学', province: '北京', city: '北京市', type: 'university' },
  { name: '北京航空航天大学', province: '北京', city: '北京市', type: 'university' },
  { name: '北京理工大学', province: '北京', city: '北京市', type: 'university' },
  { name: '中国农业大学', province: '北京', city: '北京市', type: 'university' },
  { name: '北京邮电大学', province: '北京', city: '北京市', type: 'university' },
  { name: '北京外国语大学', province: '北京', city: '北京市', type: 'university' },
  { name: '北京交通大学', province: '北京', city: '北京市', type: 'university' },
  { name: '北京科技大学', province: '北京', city: '北京市', type: 'university' },
  { name: '北京工业大学', province: '北京', city: '北京市', type: 'university' },
  // 上海
  { name: '复旦大学', province: '上海', city: '上海市', type: 'university' },
  { name: '上海交通大学', province: '上海', city: '上海市', type: 'university' },
  { name: '同济大学', province: '上海', city: '上海市', type: 'university' },
  { name: '华东师范大学', province: '上海', city: '上海市', type: 'university' },
  { name: '上海财经大学', province: '上海', city: '上海市', type: 'university' },
  { name: '华东理工大学', province: '上海', city: '上海市', type: 'university' },
  { name: '上海大学', province: '上海', city: '上海市', type: 'university' },
  { name: '上海外国语大学', province: '上海', city: '上海市', type: 'university' },
  { name: '东华大学', province: '上海', city: '上海市', type: 'university' },
  // 广东
  { name: '中山大学', province: '广东', city: '广州市', type: 'university' },
  { name: '华南理工大学', province: '广东', city: '广州市', type: 'university' },
  { name: '暨南大学', province: '广东', city: '广州市', type: 'university' },
  { name: '华南师范大学', province: '广东', city: '广州市', type: 'university' },
  { name: '深圳大学', province: '广东', city: '深圳市', type: 'university' },
  { name: '南方科技大学', province: '广东', city: '深圳市', type: 'university' },
  { name: '广州大学', province: '广东', city: '广州市', type: 'university' },
  { name: '广东外语外贸大学', province: '广东', city: '广州市', type: 'university' },
  // 浙江
  { name: '浙江大学', province: '浙江', city: '杭州市', type: 'university' },
  { name: '浙江工业大学', province: '浙江', city: '杭州市', type: 'university' },
  { name: '浙江师范大学', province: '浙江', city: '金华市', type: 'university' },
  { name: '宁波大学', province: '浙江', city: '宁波市', type: 'university' },
  { name: '杭州电子科技大学', province: '浙江', city: '杭州市', type: 'university' },
  { name: '温州医科大学', province: '浙江', city: '温州市', type: 'university' },
  // 江苏
  { name: '南京大学', province: '江苏', city: '南京市', type: 'university' },
  { name: '东南大学', province: '江苏', city: '南京市', type: 'university' },
  { name: '南京航空航天大学', province: '江苏', city: '南京市', type: 'university' },
  { name: '南京理工大学', province: '江苏', city: '南京市', type: 'university' },
  { name: '苏州大学', province: '江苏', city: '苏州市', type: 'university' },
  { name: '南京师范大学', province: '江苏', city: '南京市', type: 'university' },
  { name: '江南大学', province: '江苏', city: '无锡市', type: 'university' },
  { name: '中国矿业大学', province: '江苏', city: '徐州市', type: 'university' },
  // 湖北
  { name: '武汉大学', province: '湖北', city: '武汉市', type: 'university' },
  { name: '华中科技大学', province: '湖北', city: '武汉市', type: 'university' },
  { name: '中南财经政法大学', province: '湖北', city: '武汉市', type: 'university' },
  { name: '华中师范大学', province: '湖北', city: '武汉市', type: 'university' },
  { name: '武汉理工大学', province: '湖北', city: '武汉市', type: 'university' },
  { name: '华中农业大学', province: '湖北', city: '武汉市', type: 'university' },
  { name: '中南民族大学', province: '湖北', city: '武汉市', type: 'university' },
  // 四川
  { name: '四川大学', province: '四川', city: '成都市', type: 'university' },
  { name: '电子科技大学', province: '四川', city: '成都市', type: 'university' },
  { name: '西南交通大学', province: '四川', city: '成都市', type: 'university' },
  { name: '四川农业大学', province: '四川', city: '雅安市', type: 'university' },
  { name: '四川师范大学', province: '四川', city: '成都市', type: 'university' },
  { name: '西南财经大学', province: '四川', city: '成都市', type: 'university' },
  { name: '成都理工大学', province: '四川', city: '成都市', type: 'university' },
  // 陕西
  { name: '西安交通大学', province: '陕西', city: '西安市', type: 'university' },
  { name: '西北工业大学', province: '陕西', city: '西安市', type: 'university' },
  { name: '西安电子科技大学', province: '陕西', city: '西安市', type: 'university' },
  { name: '西北大学', province: '陕西', city: '西安市', type: 'university' },
  { name: '陕西师范大学', province: '陕西', city: '西安市', type: 'university' },
  { name: '长安大学', province: '陕西', city: '西安市', type: 'university' },
  // 湖南
  { name: '中南大学', province: '湖南', city: '长沙市', type: 'university' },
  { name: '湖南大学', province: '湖南', city: '长沙市', type: 'university' },
  { name: '湖南师范大学', province: '湖南', city: '长沙市', type: 'university' },
  { name: '国防科技大学', province: '湖南', city: '长沙市', type: 'university' },
  { name: '湘潭大学', province: '湖南', city: '湘潭市', type: 'university' },
  // 山东
  { name: '山东大学', province: '山东', city: '济南市', type: 'university' },
  { name: '中国海洋大学', province: '山东', city: '青岛市', type: 'university' },
  { name: '中国石油大学（华东）', province: '山东', city: '青岛市', type: 'university' },
  { name: '山东师范大学', province: '山东', city: '济南市', type: 'university' },
  { name: '青岛大学', province: '山东', city: '青岛市', type: 'university' },
  // 河南
  { name: '郑州大学', province: '河南', city: '郑州市', type: 'university' },
  { name: '河南大学', province: '河南', city: '开封市', type: 'university' },
  { name: '河南师范大学', province: '河南', city: '新乡市', type: 'university' },
  // 安徽
  { name: '中国科学技术大学', province: '安徽', city: '合肥市', type: 'university' },
  { name: '安徽大学', province: '安徽', city: '合肥市', type: 'university' },
  { name: '合肥工业大学', province: '安徽', city: '合肥市', type: 'university' },
  { name: '安徽师范大学', province: '安徽', city: '芜湖市', type: 'university' },
  // 福建
  { name: '厦门大学', province: '福建', city: '厦门市', type: 'university' },
  { name: '福州大学', province: '福建', city: '福州市', type: 'university' },
  { name: '福建师范大学', province: '福建', city: '福州市', type: 'university' },
  { name: '华侨大学', province: '福建', city: '泉州市', type: 'university' },
  // 重庆
  { name: '重庆大学', province: '重庆', city: '重庆市', type: 'university' },
  { name: '西南大学', province: '重庆', city: '重庆市', type: 'university' },
  { name: '重庆师范大学', province: '重庆', city: '重庆市', type: 'university' },
  { name: '重庆医科大学', province: '重庆', city: '重庆市', type: 'university' },
  // 天津
  { name: '南开大学', province: '天津', city: '天津市', type: 'university' },
  { name: '天津大学', province: '天津', city: '天津市', type: 'university' },
  { name: '天津医科大学', province: '天津', city: '天津市', type: 'university' },
  { name: '天津师范大学', province: '天津', city: '天津市', type: 'university' },
  // 辽宁
  { name: '大连理工大学', province: '辽宁', city: '大连市', type: 'university' },
  { name: '东北大学', province: '辽宁', city: '沈阳市', type: 'university' },
  { name: '辽宁大学', province: '辽宁', city: '沈阳市', type: 'university' },
  { name: '大连海事大学', province: '辽宁', city: '大连市', type: 'university' },
  // 吉林
  { name: '吉林大学', province: '吉林', city: '长春市', type: 'university' },
  { name: '东北师范大学', province: '吉林', city: '长春市', type: 'university' },
  { name: '延边大学', province: '吉林', city: '延边市', type: 'university' },
  // 黑龙江
  { name: '哈尔滨工业大学', province: '黑龙江', city: '哈尔滨市', type: 'university' },
  { name: '哈尔滨工程大学', province: '黑龙江', city: '哈尔滨市', type: 'university' },
  { name: '东北林业大学', province: '黑龙江', city: '哈尔滨市', type: 'university' },
  { name: '东北农业大学', province: '黑龙江', city: '哈尔滨市', type: 'university' },
  { name: '黑龙江大学', province: '黑龙江', city: '哈尔滨市', type: 'university' },
  // 江西
  { name: '南昌大学', province: '江西', city: '南昌市', type: 'university' },
  { name: '江西师范大学', province: '江西', city: '南昌市', type: 'university' },
  { name: '江西财经大学', province: '江西', city: '南昌市', type: 'university' },
  // 山西
  { name: '太原理工大学', province: '山西', city: '太原市', type: 'university' },
  { name: '山西大学', province: '山西', city: '太原市', type: 'university' },
  { name: '中北大学', province: '山西', city: '太原市', type: 'university' },
  // 河北
  { name: '河北工业大学', province: '河北', city: '天津市', type: 'university' },
  { name: '燕山大学', province: '河北', city: '秦皇岛市', type: 'university' },
  { name: '河北大学', province: '河北', city: '保定市', type: 'university' },
  { name: '河北师范大学', province: '河北', city: '石家庄市', type: 'university' },
  // 云南
  { name: '云南大学', province: '云南', city: '昆明市', type: 'university' },
  { name: '昆明理工大学', province: '云南', city: '昆明市', type: 'university' },
  { name: '云南师范大学', province: '云南', city: '昆明市', type: 'university' },
  { name: '云南民族大学', province: '云南', city: '昆明市', type: 'university' },
  // 贵州
  { name: '贵州大学', province: '贵州', city: '贵阳市', type: 'university' },
  { name: '贵州师范大学', province: '贵州', city: '贵阳市', type: 'university' },
  { name: '贵州医科大学', province: '贵州', city: '贵阳市', type: 'university' },
  // 广西
  { name: '广西大学', province: '广西', city: '南宁市', type: 'university' },
  { name: '广西师范大学', province: '广西', city: '桂林市', type: 'university' },
  { name: '桂林电子科技大学', province: '广西', city: '桂林市', type: 'university' },
  { name: '广西医科大学', province: '广西', city: '南宁市', type: 'university' },
  // 内蒙古
  { name: '内蒙古大学', province: '内蒙古', city: '呼和浩特市', type: 'university' },
  { name: '内蒙古工业大学', province: '内蒙古', city: '呼和浩特市', type: 'university' },
  { name: '内蒙古师范大学', province: '内蒙古', city: '呼和浩特市', type: 'university' },
  // 甘肃
  { name: '兰州大学', province: '甘肃', city: '兰州市', type: 'university' },
  { name: '西北师范大学', province: '甘肃', city: '兰州市', type: 'university' },
  { name: '兰州交通大学', province: '甘肃', city: '兰州市', type: 'university' },
  // 新疆
  { name: '新疆大学', province: '新疆', city: '乌鲁木齐市', type: 'university' },
  { name: '石河子大学', province: '新疆', city: '石河子市', type: 'university' },
  { name: '新疆医科大学', province: '新疆', city: '乌鲁木齐市', type: 'university' },
  // 海南
  { name: '海南大学', province: '海南', city: '海口市', type: 'university' },
  { name: '海南师范大学', province: '海南', city: '海口市', type: 'university' },
  { name: '海南医学院', province: '海南', city: '海口市', type: 'university' },
  // 宁夏
  { name: '宁夏大学', province: '宁夏', city: '银川市', type: 'university' },
  { name: '宁夏医科大学', province: '宁夏', city: '银川市', type: 'university' },
  // 青海
  { name: '青海大学', province: '青海', city: '西宁市', type: 'university' },
  { name: '青海师范大学', province: '青海', city: '西宁市', type: 'university' },
  // 西藏
  { name: '西藏大学', province: '西藏', city: '拉萨市', type: 'university' },
  { name: '西藏民族大学', province: '西藏', city: '咸阳市', type: 'university' },
];

function seed() {
  console.log('开始初始化学校数据...');
  
  const count = db.prepare('SELECT COUNT(*) as c FROM schools').get();
  if (count.c > 0) {
    console.log(`学校表已有 ${count.c} 条数据，跳过初始化`);
    return;
  }
  
  const insert = db.prepare('INSERT INTO schools (name, province, city, type) VALUES (?, ?, ?, ?)');
  const insertMany = db.transaction((schools) => {
    for (const school of schools) {
      insert.run(school.name, school.province, school.city, school.type);
    }
  });
  
  insertMany(schools);
  console.log(`成功插入 ${schools.length} 所学校`);
}

seed();
