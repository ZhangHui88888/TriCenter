/**
 * 销售目标国数据
 * 使用 ISO 3166-1 alpha-2 国家代码
 * 按区域分组，便于筛选和展示
 */

export interface Country {
  value: string;  // ISO 3166-1 alpha-2 代码
  label: string;  // 中文名称
  region: string; // 所属区域代码，关联 system_options.region
}

export const COUNTRIES: Country[] = [
  // ==================== 北美 (north_america) ====================
  { value: 'US', label: '美国', region: 'north_america' },
  { value: 'CA', label: '加拿大', region: 'north_america' },
  { value: 'MX', label: '墨西哥', region: 'north_america' },
  { value: 'GT', label: '危地马拉', region: 'north_america' },
  { value: 'CU', label: '古巴', region: 'north_america' },
  { value: 'HT', label: '海地', region: 'north_america' },
  { value: 'DO', label: '多米尼加', region: 'north_america' },
  { value: 'HN', label: '洪都拉斯', region: 'north_america' },
  { value: 'NI', label: '尼加拉瓜', region: 'north_america' },
  { value: 'SV', label: '萨尔瓦多', region: 'north_america' },
  { value: 'CR', label: '哥斯达黎加', region: 'north_america' },
  { value: 'PA', label: '巴拿马', region: 'north_america' },
  { value: 'JM', label: '牙买加', region: 'north_america' },
  { value: 'TT', label: '特立尼达和多巴哥', region: 'north_america' },
  { value: 'BZ', label: '伯利兹', region: 'north_america' },
  { value: 'BS', label: '巴哈马', region: 'north_america' },
  { value: 'BB', label: '巴巴多斯', region: 'north_america' },
  { value: 'PR', label: '波多黎各', region: 'north_america' },

  // ==================== 南美 (south_america) ====================
  { value: 'BR', label: '巴西', region: 'south_america' },
  { value: 'AR', label: '阿根廷', region: 'south_america' },
  { value: 'CO', label: '哥伦比亚', region: 'south_america' },
  { value: 'PE', label: '秘鲁', region: 'south_america' },
  { value: 'VE', label: '委内瑞拉', region: 'south_america' },
  { value: 'CL', label: '智利', region: 'south_america' },
  { value: 'EC', label: '厄瓜多尔', region: 'south_america' },
  { value: 'BO', label: '玻利维亚', region: 'south_america' },
  { value: 'PY', label: '巴拉圭', region: 'south_america' },
  { value: 'UY', label: '乌拉圭', region: 'south_america' },
  { value: 'GY', label: '圭亚那', region: 'south_america' },
  { value: 'SR', label: '苏里南', region: 'south_america' },
  { value: 'GF', label: '法属圭亚那', region: 'south_america' },

  // ==================== 欧洲 (europe) ====================
  // 西欧
  { value: 'GB', label: '英国', region: 'europe' },
  { value: 'DE', label: '德国', region: 'europe' },
  { value: 'FR', label: '法国', region: 'europe' },
  { value: 'IT', label: '意大利', region: 'europe' },
  { value: 'ES', label: '西班牙', region: 'europe' },
  { value: 'NL', label: '荷兰', region: 'europe' },
  { value: 'BE', label: '比利时', region: 'europe' },
  { value: 'PT', label: '葡萄牙', region: 'europe' },
  { value: 'IE', label: '爱尔兰', region: 'europe' },
  { value: 'AT', label: '奥地利', region: 'europe' },
  { value: 'CH', label: '瑞士', region: 'europe' },
  { value: 'LU', label: '卢森堡', region: 'europe' },
  { value: 'MC', label: '摩纳哥', region: 'europe' },
  { value: 'LI', label: '列支敦士登', region: 'europe' },
  { value: 'AD', label: '安道尔', region: 'europe' },
  { value: 'MT', label: '马耳他', region: 'europe' },
  // 北欧
  { value: 'SE', label: '瑞典', region: 'europe' },
  { value: 'NO', label: '挪威', region: 'europe' },
  { value: 'DK', label: '丹麦', region: 'europe' },
  { value: 'FI', label: '芬兰', region: 'europe' },
  { value: 'IS', label: '冰岛', region: 'europe' },
  // 中欧
  { value: 'PL', label: '波兰', region: 'europe' },
  { value: 'CZ', label: '捷克', region: 'europe' },
  { value: 'SK', label: '斯洛伐克', region: 'europe' },
  { value: 'HU', label: '匈牙利', region: 'europe' },
  { value: 'SI', label: '斯洛文尼亚', region: 'europe' },
  // 东欧
  { value: 'RU', label: '俄罗斯', region: 'europe' },
  { value: 'UA', label: '乌克兰', region: 'europe' },
  { value: 'BY', label: '白俄罗斯', region: 'europe' },
  { value: 'MD', label: '摩尔多瓦', region: 'europe' },
  // 南欧及巴尔干
  { value: 'GR', label: '希腊', region: 'europe' },
  { value: 'RO', label: '罗马尼亚', region: 'europe' },
  { value: 'BG', label: '保加利亚', region: 'europe' },
  { value: 'RS', label: '塞尔维亚', region: 'europe' },
  { value: 'HR', label: '克罗地亚', region: 'europe' },
  { value: 'BA', label: '波黑', region: 'europe' },
  { value: 'ME', label: '黑山', region: 'europe' },
  { value: 'MK', label: '北马其顿', region: 'europe' },
  { value: 'AL', label: '阿尔巴尼亚', region: 'europe' },
  { value: 'XK', label: '科索沃', region: 'europe' },
  // 波罗的海
  { value: 'EE', label: '爱沙尼亚', region: 'europe' },
  { value: 'LV', label: '拉脱维亚', region: 'europe' },
  { value: 'LT', label: '立陶宛', region: 'europe' },
  // 高加索
  { value: 'GE', label: '格鲁吉亚', region: 'europe' },
  { value: 'AM', label: '亚美尼亚', region: 'europe' },
  { value: 'AZ', label: '阿塞拜疆', region: 'europe' },
  // 塞浦路斯
  { value: 'CY', label: '塞浦路斯', region: 'europe' },

  // ==================== 东亚 (east_asia) ====================
  { value: 'JP', label: '日本', region: 'east_asia' },
  { value: 'KR', label: '韩国', region: 'east_asia' },
  { value: 'KP', label: '朝鲜', region: 'east_asia' },
  { value: 'MN', label: '蒙古', region: 'east_asia' },
  { value: 'TW', label: '中国台湾', region: 'east_asia' },
  { value: 'HK', label: '中国香港', region: 'east_asia' },
  { value: 'MO', label: '中国澳门', region: 'east_asia' },

  // ==================== 东南亚 (southeast_asia) ====================
  { value: 'SG', label: '新加坡', region: 'southeast_asia' },
  { value: 'MY', label: '马来西亚', region: 'southeast_asia' },
  { value: 'TH', label: '泰国', region: 'southeast_asia' },
  { value: 'VN', label: '越南', region: 'southeast_asia' },
  { value: 'ID', label: '印度尼西亚', region: 'southeast_asia' },
  { value: 'PH', label: '菲律宾', region: 'southeast_asia' },
  { value: 'MM', label: '缅甸', region: 'southeast_asia' },
  { value: 'KH', label: '柬埔寨', region: 'southeast_asia' },
  { value: 'LA', label: '老挝', region: 'southeast_asia' },
  { value: 'BN', label: '文莱', region: 'southeast_asia' },
  { value: 'TL', label: '东帝汶', region: 'southeast_asia' },

  // ==================== 南亚 (south_asia) ====================
  { value: 'IN', label: '印度', region: 'south_asia' },
  { value: 'PK', label: '巴基斯坦', region: 'south_asia' },
  { value: 'BD', label: '孟加拉国', region: 'south_asia' },
  { value: 'LK', label: '斯里兰卡', region: 'south_asia' },
  { value: 'NP', label: '尼泊尔', region: 'south_asia' },
  { value: 'BT', label: '不丹', region: 'south_asia' },
  { value: 'MV', label: '马尔代夫', region: 'south_asia' },
  { value: 'AF', label: '阿富汗', region: 'south_asia' },

  // ==================== 中东 (middle_east) ====================
  { value: 'AE', label: '阿联酋', region: 'middle_east' },
  { value: 'SA', label: '沙特阿拉伯', region: 'middle_east' },
  { value: 'IL', label: '以色列', region: 'middle_east' },
  { value: 'TR', label: '土耳其', region: 'middle_east' },
  { value: 'IR', label: '伊朗', region: 'middle_east' },
  { value: 'IQ', label: '伊拉克', region: 'middle_east' },
  { value: 'QA', label: '卡塔尔', region: 'middle_east' },
  { value: 'KW', label: '科威特', region: 'middle_east' },
  { value: 'OM', label: '阿曼', region: 'middle_east' },
  { value: 'BH', label: '巴林', region: 'middle_east' },
  { value: 'JO', label: '约旦', region: 'middle_east' },
  { value: 'LB', label: '黎巴嫩', region: 'middle_east' },
  { value: 'SY', label: '叙利亚', region: 'middle_east' },
  { value: 'YE', label: '也门', region: 'middle_east' },
  { value: 'PS', label: '巴勒斯坦', region: 'middle_east' },
  // 中亚
  { value: 'KZ', label: '哈萨克斯坦', region: 'middle_east' },
  { value: 'UZ', label: '乌兹别克斯坦', region: 'middle_east' },
  { value: 'TM', label: '土库曼斯坦', region: 'middle_east' },
  { value: 'KG', label: '吉尔吉斯斯坦', region: 'middle_east' },
  { value: 'TJ', label: '塔吉克斯坦', region: 'middle_east' },

  // ==================== 非洲 (africa) ====================
  // 北非
  { value: 'EG', label: '埃及', region: 'africa' },
  { value: 'MA', label: '摩洛哥', region: 'africa' },
  { value: 'DZ', label: '阿尔及利亚', region: 'africa' },
  { value: 'TN', label: '突尼斯', region: 'africa' },
  { value: 'LY', label: '利比亚', region: 'africa' },
  { value: 'SD', label: '苏丹', region: 'africa' },
  // 西非
  { value: 'NG', label: '尼日利亚', region: 'africa' },
  { value: 'GH', label: '加纳', region: 'africa' },
  { value: 'CI', label: '科特迪瓦', region: 'africa' },
  { value: 'SN', label: '塞内加尔', region: 'africa' },
  { value: 'ML', label: '马里', region: 'africa' },
  { value: 'BF', label: '布基纳法索', region: 'africa' },
  { value: 'NE', label: '尼日尔', region: 'africa' },
  { value: 'GN', label: '几内亚', region: 'africa' },
  { value: 'BJ', label: '贝宁', region: 'africa' },
  { value: 'TG', label: '多哥', region: 'africa' },
  { value: 'SL', label: '塞拉利昂', region: 'africa' },
  { value: 'LR', label: '利比里亚', region: 'africa' },
  { value: 'MR', label: '毛里塔尼亚', region: 'africa' },
  { value: 'GM', label: '冈比亚', region: 'africa' },
  { value: 'GW', label: '几内亚比绍', region: 'africa' },
  { value: 'CV', label: '佛得角', region: 'africa' },
  // 东非
  { value: 'KE', label: '肯尼亚', region: 'africa' },
  { value: 'ET', label: '埃塞俄比亚', region: 'africa' },
  { value: 'TZ', label: '坦桑尼亚', region: 'africa' },
  { value: 'UG', label: '乌干达', region: 'africa' },
  { value: 'RW', label: '卢旺达', region: 'africa' },
  { value: 'BI', label: '布隆迪', region: 'africa' },
  { value: 'SO', label: '索马里', region: 'africa' },
  { value: 'DJ', label: '吉布提', region: 'africa' },
  { value: 'ER', label: '厄立特里亚', region: 'africa' },
  { value: 'SS', label: '南苏丹', region: 'africa' },
  { value: 'MU', label: '毛里求斯', region: 'africa' },
  { value: 'SC', label: '塞舌尔', region: 'africa' },
  { value: 'KM', label: '科摩罗', region: 'africa' },
  { value: 'MG', label: '马达加斯加', region: 'africa' },
  // 中非
  { value: 'CD', label: '刚果(金)', region: 'africa' },
  { value: 'CG', label: '刚果(布)', region: 'africa' },
  { value: 'CM', label: '喀麦隆', region: 'africa' },
  { value: 'AO', label: '安哥拉', region: 'africa' },
  { value: 'GA', label: '加蓬', region: 'africa' },
  { value: 'GQ', label: '赤道几内亚', region: 'africa' },
  { value: 'CF', label: '中非', region: 'africa' },
  { value: 'TD', label: '乍得', region: 'africa' },
  { value: 'ST', label: '圣多美和普林西比', region: 'africa' },
  // 南部非洲
  { value: 'ZA', label: '南非', region: 'africa' },
  { value: 'ZW', label: '津巴布韦', region: 'africa' },
  { value: 'ZM', label: '赞比亚', region: 'africa' },
  { value: 'BW', label: '博茨瓦纳', region: 'africa' },
  { value: 'NA', label: '纳米比亚', region: 'africa' },
  { value: 'MZ', label: '莫桑比克', region: 'africa' },
  { value: 'MW', label: '马拉维', region: 'africa' },
  { value: 'LS', label: '莱索托', region: 'africa' },
  { value: 'SZ', label: '斯威士兰', region: 'africa' },

  // ==================== 大洋洲 (oceania) ====================
  { value: 'AU', label: '澳大利亚', region: 'oceania' },
  { value: 'NZ', label: '新西兰', region: 'oceania' },
  { value: 'PG', label: '巴布亚新几内亚', region: 'oceania' },
  { value: 'FJ', label: '斐济', region: 'oceania' },
  { value: 'SB', label: '所罗门群岛', region: 'oceania' },
  { value: 'VU', label: '瓦努阿图', region: 'oceania' },
  { value: 'NC', label: '新喀里多尼亚', region: 'oceania' },
  { value: 'PF', label: '法属波利尼西亚', region: 'oceania' },
  { value: 'WS', label: '萨摩亚', region: 'oceania' },
  { value: 'GU', label: '关岛', region: 'oceania' },
  { value: 'TO', label: '汤加', region: 'oceania' },
  { value: 'FM', label: '密克罗尼西亚', region: 'oceania' },
  { value: 'KI', label: '基里巴斯', region: 'oceania' },
  { value: 'PW', label: '帕劳', region: 'oceania' },
  { value: 'MH', label: '马绍尔群岛', region: 'oceania' },
  { value: 'NR', label: '瑙鲁', region: 'oceania' },
  { value: 'TV', label: '图瓦卢', region: 'oceania' },
];

/**
 * 根据区域代码获取国家列表
 */
export const getCountriesByRegion = (regionCode: string): Country[] => {
  return COUNTRIES.filter(c => c.region === regionCode);
};

/**
 * 根据国家代码获取国家信息
 */
export const getCountryByCode = (code: string): Country | undefined => {
  return COUNTRIES.find(c => c.value === code);
};

/**
 * 根据国家代码获取国家名称
 */
export const getCountryLabel = (code: string): string => {
  return getCountryByCode(code)?.label || code;
};

/**
 * 获取国家选项列表（用于 Select 组件）
 */
export const getCountryOptions = () => {
  return COUNTRIES.map(c => ({ value: c.value, label: c.label }));
};

/**
 * 按区域分组的国家数据（用于级联选择器）
 */
export const getCountriesGroupedByRegion = () => {
  const regionMap: Record<string, Country[]> = {};
  COUNTRIES.forEach(country => {
    if (!regionMap[country.region]) {
      regionMap[country.region] = [];
    }
    regionMap[country.region].push(country);
  });
  return regionMap;
};
