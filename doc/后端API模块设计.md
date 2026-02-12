# 后端API模块设计文档

> 用于AI辅助开发，按模块逐步完成后端API开发
> 基于前端代码分析更新 | 版本：v2.0 | 更新日期：2026-02-03

---

## 技术栈

| 项 | 选型 |
|-----|------|
| 框架 | Node.js + Express / Python + FastAPI (待定) |
| 数据库 | MySQL 8.0+ |
| 认证 | JWT Token |
| 文档 | Swagger/OpenAPI |

---

## 环境配置

### 多环境说明

| 环境 | 配置文件 | NODE_ENV | 用途 |
|------|----------|----------|------|
| 开发/测试 | `.env` | development | 本地开发调试 |
| 线上正式 | `.env.production` | production | 生产环境部署 |

### 环境变量清单

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| NODE_ENV | 运行环境 | development / production |
| DB_HOST | 数据库地址 | localhost |
| DB_PORT | 数据库端口 | 3306 |
| DB_NAME | 数据库名称 | tricenter |
| DB_USER | 数据库用户名 | root |
| DB_PASSWORD | 数据库密码 | ****** |
| JWT_SECRET | JWT签名密钥 | 32位以上随机字符串 |
| JWT_EXPIRES_IN | Token过期时间 | 7d |
| PORT | 服务端口 | 3000 |
| CORS_ORIGIN | 允许跨域的前端地址 | http://localhost:5173 |

### 环境差异配置

| 配置项 | 开发环境 | 生产环境 |
|--------|----------|----------|
| 日志级别 | debug | info/warn |
| 错误详情 | 返回完整堆栈 | 仅返回错误消息 |
| CORS | 允许localhost | 仅允许正式域名 |
| JWT密钥 | 可用简单密钥 | 必须用强随机密钥 |

### 环境切换方式

```bash
# 开发环境（默认读取 .env）
npm run dev

# 生产环境（读取 .env.production）
NODE_ENV=production npm start
```

---

## 模块开发清单

| 序号 | 模块 | API数量 | 状态 | 备注 |
|------|------|---------|------|------|
| 1 | 用户认证 | 4 | ✅ 已完成 | 登录、权限基础 |
| 2 | 基础数据/数据字典 | 8 | ✅ 已完成 | 下拉选项、行业分类、产品品类 |
| 3 | 企业管理 | 12 | ✅ 基本完成 | 核心业务模块（10/12 API完成） |
| 4 | 企业产品管理 | 4 | ✅ 已完成 | 产品、品牌、专利 |
| 5 | 跟进记录 | 5 | ✅ 已完成 | 跟进管理 |
| 6 | 看板统计 | 5 | ✅ 已完成 | 首页数据展示 |
| 7 | 漏斗分析 | 3 | ✅ 已完成 | 漏斗转化分析 |

**总计: ~41个API（已完成约40个）**

---

## 模块1: 用户认证 (4个API)

### 1.1 用户登录
| 项 | 值 |
|-----|-----|
| 路径 | `POST /api/auth/login` |
| 请求 | `{ username: string, password: string }` |
| 响应 | `{ token: string, user: { id, username, role, name } }` |
| 说明 | 验证用户凭证，返回JWT Token |

### 1.2 用户登出
| 项 | 值 |
|-----|-----|
| 路径 | `POST /api/auth/logout` |
| 请求 | Header: `Authorization: Bearer <token>` |
| 响应 | `{ success: true }` |
| 说明 | 使Token失效（可选实现黑名单） |

### 1.3 获取当前用户
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/auth/me` |
| 请求 | Header: `Authorization: Bearer <token>` |
| 响应 | `{ id, username, role, name, permissions }` |
| 说明 | 获取当前登录用户信息 |

### 1.4 修改密码
| 项 | 值 |
|-----|-----|
| 路径 | `POST /api/auth/change-password` |
| 请求 | `{ oldPassword: string, newPassword: string }` |
| 响应 | `{ success: true }` |
| 说明 | 修改当前用户密码 |

**开发状态:** ✅ 已完成

---

## 模块2: 基础数据/数据字典 (8个API)

### 2.1 获取系统选项列表
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/options/:category` |
| 参数 | category: stage/district/staff_size/revenue/source/enterprise_type/trade_mode/follow_type等 |
| 响应 | `[{ id, value, label, color?, sort_order, is_enabled }]` |
| 说明 | 获取指定分类的系统选项，用于下拉选择器 |

**数据字典分类说明:**
| category | 说明 | 使用位置 |
|----------|------|----------|
| stage | 漏斗阶段 | 企业主表.stage |
| district | 区域 | 企业主表.district |
| staff_size | 人员规模 | 企业主表.staff_size_id |
| revenue | 营收规模 | 企业主表.domestic_revenue_id, cross_border_revenue_id |
| source | 企业来源 | 企业主表.source_id |
| enterprise_type | 企业类型 | 企业主表.enterprise_type |
| trade_mode | 外贸模式 | 企业主表.trade_mode_id |
| trade_team_mode | 外贸业务团队模式 | 企业主表.trade_team_mode_id |
| cross_border_platform | 跨境平台 | 企业主表.cross_border_platforms |
| cross_border_logistics | 跨境物流模式 | 企业主表.cross_border_logistics |
| payment_settlement | 支付结算方式 | 企业主表.payment_settlement |
| region | 销售区域 | 企业产品.target_region_ids |
| certification | 产品认证 | 企业产品.certification_ids |
| automation_level | 自动化程度 | 企业产品.automation_level_id |
| logistics | 物流合作方 | 企业产品.logistics_partner_ids |
| follow_type | 跟进类型 | 跟进记录.follow_type |
| growth_reason | 增长原因 | 企业主表.growth_reasons |
| decline_reason | 下降原因 | 企业主表.decline_reasons |

### 2.2 获取行业分类树
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/options/industries` |
| 响应 | `[{ id, name, level, parent_id, children: [...] }]` |
| 说明 | 返回多级行业分类树结构，用于级联选择器（最多3级） |

**响应示例:**
```json
[
  {
    "id": 1,
    "name": "制造业",
    "level": 1,
    "children": [
      {
        "id": 5,
        "name": "机械设备",
        "level": 2,
        "children": [
          { "id": 12, "name": "电动工具", "level": 3 }
        ]
      }
    ]
  }
]
```

### 2.3 获取产品品类树
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/options/product-categories` |
| 响应 | `[{ id, name, level, parent_id, children: [...] }]` |
| 说明 | 返回多级产品品类树结构，用于级联选择器（最多3级） |

### 2.4 获取用户列表（对接人）
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/options/users` |
| 响应 | `[{ value: number, label: string }]` |
| 说明 | 用于企业对接人下拉选择 |

### 2.5 获取字典分类列表
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/dictionary/categories` |
| 响应 | `[{ category: string, label: string, count: number }]` |
| 说明 | 获取所有字典分类及各分类下选项数量（管理员功能） |

### 2.6 新增字典选项
| 项 | 值 |
|-----|-----|
| 路径 | `POST /api/dictionary/:category` |
| 请求 | `{ value: string, label: string, color?: string, sort_order?: number }` |
| 响应 | `{ id, value, label, ... }` |
| 说明 | 在指定分类下新增选项（管理员功能） |

### 2.7 更新字典选项
| 项 | 值 |
|-----|-----|
| 路径 | `PUT /api/dictionary/:category/:id` |
| 请求 | `{ label?: string, color?: string, sort_order?: number, is_enabled?: boolean }` |
| 响应 | `{ id, value, label, ... }` |
| 说明 | 更新选项信息，value不可修改（管理员功能） |

### 2.8 删除字典选项
| 项 | 值 |
|-----|-----|
| 路径 | `DELETE /api/dictionary/:category/:id` |
| 响应 | `{ success: true }` |
| 说明 | 删除选项，已被引用的选项不可删除，仅可禁用（管理员功能） |

**开发状态:** ✅ 已完成

---

## 模块3: 企业管理 (12个API)

### 3.1 企业列表
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/enterprises` |
| 参数 | `?keyword=&stage=&district=&industry=&enterprise_type=&employee_scale=&source=&has_crossborder=&transformation_willingness=&main_platforms=&page=1&pageSize=10` |
| 响应 | `{ list: Enterprise[], total: number, page: number, pageSize: number }` |
| 说明 | 支持搜索、多条件筛选、分页 |

**筛选参数说明:**
| 参数 | 类型 | 说明 |
|------|------|------|
| keyword | string | 企业名称模糊搜索 |
| stage | string | 漏斗阶段代码 |
| district | string | 所属区域 |
| industry | string | 所属行业 |
| enterprise_type | string | 企业类型 |
| employee_scale | string | 人员规模 |
| source | string | 企业来源 |
| has_crossborder | boolean | 是否开展跨境电商 |
| transformation_willingness | string | 跨境转型意愿 |
| main_platforms | string | 跨境平台（逗号分隔） |

**列表响应字段:**
```typescript
interface EnterpriseListItem {
  id: number;
  enterprise_name: string;
  district: string;
  industry: string;
  enterprise_type: string;
  funnel_stage: string;
  contacts: { name: string; phone: string; is_primary: boolean }[];
  has_crossborder: boolean;
  main_platforms: string;
  target_markets: string;
  created_at: string;
}
```

### 3.2 企业详情
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/enterprises/:id` |
| 响应 | 完整企业信息对象（包含所有标签页数据） |
| 说明 | 获取单个企业的完整信息 |

**详情响应字段:**
```typescript
interface EnterpriseDetail {
  // 基本信息
  id: number;
  enterprise_name: string;
  unified_credit_code: string;
  province: string;
  city: string;
  district: string;
  detailed_address: string;
  industry_id: number;
  industry: string; // 行业名称（关联查询）
  enterprise_type: string;
  staff_size_id: number;
  website: string;
  domestic_revenue_id: number;
  cross_border_revenue_id: number;
  source_id: number;
  funnel_stage: string;
  
  // 联系人列表
  contacts: Contact[];
  
  // 品牌信息
  has_own_brand: boolean;
  brand_names: string[];
  
  // 外贸信息
  target_region_ids: number[];
  target_country_ids: string[];
  trade_mode_id: number;
  has_import_export_license: boolean;
  customs_declaration_mode: string;
  trade_team_mode_id: number;
  trade_team_size: number;
  has_domestic_ecommerce: boolean;
  
  // 外贸业绩
  last_year_revenue: number;
  year_before_last_revenue: number;
  market_changes: { up: MarketChange[], down: MarketChange[] };
  mode_changes: { up: ModeChange[], down: ModeChange[] };
  category_changes: { up: CategoryChange[], down: CategoryChange[] };
  growth_reasons: string[];
  decline_reasons: string[];
  
  // 跨境电商信息
  has_cross_border: boolean;
  cross_border_ratio: string;
  cross_border_logistics: string;
  payment_settlement: string;
  cross_border_team_size: number;
  using_erp: boolean;
  transformation_willingness: string;
  investment_willingness: string;
  cross_border_platforms: number[];
  target_markets: { market: string; percentage: number }[];
  
  // 合作评估
  service_cooperation_rating: number;
  investment_cooperation_rating: number;
  incubation_cooperation_rating: number;
  brand_cooperation_rating: number;
  training_cooperation_rating: number;
  overall_cooperation_rating: number;
  benchmark_possibility: number;
  
  // 其他信息
  additional_notes: string;
  has_policy_support: boolean;
  enjoyed_policies: string[];
  competition_position: string;
  competition_description: string;
  pain_points: string;
  tricenter_demands: string[];
  tricenter_concerns: string;
  
  // 产品列表
  products: EnterpriseProduct[];
  
  // 专利列表
  patents: EnterprisePatent[];
  
  // 跟进记录
  follow_up_records: FollowUpRecord[];
  
  // 时间戳
  created_at: string;
  updated_at: string;
}
```

### 3.3 新增企业
| 项 | 值 |
|-----|-----|
| 路径 | `POST /api/enterprises` |
| 请求 | 企业基本信息对象（所有字段可选） |
| 响应 | `{ id, ...createdData }` |
| 说明 | 创建新企业记录。支持空白企业创建（不传任何参数），系统自动生成默认名称 |

**请求体:**
```typescript
interface CreateEnterpriseRequest {
  name?: string;                    // 企业名称，不传则自动生成"新建企业_时间戳"
  creditCode?: string;              // 统一社会信用代码
  province?: string;                // 省份
  city?: string;                    // 城市
  district?: string;                // 区域
  address?: string;                 // 详细地址
  industryId?: number;              // 行业ID
  enterpriseType?: string;          // 企业类型
  staffSizeId?: number;             // 人员规模ID
  domesticRevenueId?: number;       // 国内营收ID
  crossBorderRevenueId?: number;    // 跨境营收ID
  sourceId?: number;                // 来源ID
  website?: string;                 // 官网
  // 主要联系人（可选，需同时提供姓名和电话才会创建）
  contactName?: string;             // 联系人姓名
  contactPhone?: string;            // 联系人电话
  contactPosition?: string;         // 联系人职位
}
```

**使用场景:**
1. **空白企业创建**: 前端点击"新增企业"按钮，直接发送空对象 `{}`，创建后跳转到详情页逐步填写
2. **完整信息创建**: 批量导入或表单提交时传入完整信息

### 3.4 编辑企业
| 项 | 值 |
|-----|-----|
| 路径 | `PUT /api/enterprises/:id` |
| 请求 | 企业信息对象（部分或全部字段） |
| 响应 | `{ id, ...updatedData }` |
| 说明 | 更新企业信息 |

### 3.5 删除企业
| 项 | 值 |
|-----|-----|
| 路径 | `DELETE /api/enterprises/:id` |
| 响应 | `{ success: true }` |
| 说明 | 软删除企业记录（设置is_deleted=1） |

### 3.6 变更漏斗阶段
| 项 | 值 |
|-----|-----|
| 路径 | `PATCH /api/enterprises/:id/stage` |
| 请求 | `{ stage: string, reason?: string }` |
| 响应 | `{ success: true, newStage: string }` |
| 说明 | 变更企业漏斗阶段，同时记录变更日志到stage_change_logs表 |

**漏斗阶段代码:**
| code | name | color |
|------|------|-------|
| POTENTIAL | 潜在企业 | #94a3b8 |
| NO_DEMAND | 无明确需求 | #fbbf24 |
| NO_INTENTION | 没有合作意向 | #ef4444 |
| HAS_DEMAND | 有明确需求 | #3b82f6 |
| SIGNED | 已签约 | #8b5cf6 |
| SETTLED | 已入驻 | #10b981 |
| INCUBATING | 重点孵化 | #f97316 |

### 3.7 批量导入
| 项 | 值 |
|-----|-----|
| 路径 | `POST /api/enterprises/import` |
| 请求 | `multipart/form-data` 包含Excel文件 |
| 响应 | `{ success: number, failed: number, errors: { row: number, message: string }[] }` |
| 说明 | 批量导入企业数据 |

### 3.8 导出企业
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/enterprises/export` |
| 参数 | `?stage=&district=&industry=` (筛选条件) |
| 响应 | Excel文件流 (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet) |
| 说明 | 导出企业列表为Excel |

### 3.9 获取导入模板
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/enterprises/template` |
| 响应 | Excel模板文件流 |
| 说明 | 下载批量导入模板 |

### 3.10 获取企业跟进记录
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/enterprises/:id/follow-ups` |
| 响应 | `FollowUpRecord[]` |
| 说明 | 获取指定企业的所有跟进记录 |

### 3.11 更新企业联系人
| 项 | 值 |
|-----|-----|
| 路径 | `PUT /api/enterprises/:id/contacts` |
| 请求 | `{ contacts: Contact[] }` |
| 响应 | `{ success: true, contacts: Contact[] }` |
| 说明 | 批量更新企业联系人（全量替换） |

**联系人结构:**
```typescript
interface Contact {
  id?: number;
  name: string;
  phone: string;
  position?: string;
  is_primary: boolean;
  email?: string;
  wechat?: string;
  remark?: string;
}
```

### 3.12 企业数据分析
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/enterprises/analysis` |
| 参数 | `?district=&industry=&stage=` |
| 响应 | 见下方 |
| 说明 | 基于筛选条件的企业数据统计分析 |

**响应结构:**
```typescript
interface EnterpriseAnalysis {
  // 阶段分布
  stageDistribution: { stage: string, name: string, count: number, color: string }[];
  // 关键指标
  totalCount: number;
  overallConversionRate: number; // 整体转化率
  settlementRate: number; // 入驻转化率
  // 平台分布
  platformDistribution: { name: string, count: number }[];
  // 市场分布
  marketDistribution: { name: string, count: number }[];
  // 阶段转化率
  conversionRates: { from: string, to: string, rate: number }[];
}
```

**开发状态:** ✅ 基本完成（10/12 API） 企业产品管理 (4个API)

### 4.1 添加企业产品
| 项 | 值 |
|-----|-----|
| 路径 | `POST /api/enterprises/:enterpriseId/products` |
| 请求 | 产品信息对象 |
| 响应 | `{ id, ...createdData }` |
| 说明 | 为企业添加产品 |

**请求体:**
```typescript
interface CreateProductRequest {
  name: string;
  category_id: number;
  certification_ids?: number[];
  target_region_ids?: number[];
  target_country_ids?: string[];
  annual_sales?: string;
  local_procurement_ratio?: string;
  automation_level_id?: number;
  annual_capacity?: string;
  logistics_partner_ids?: number[];
}
```

### 4.2 更新企业产品
| 项 | 值 |
|-----|-----|
| 路径 | `PUT /api/enterprises/:enterpriseId/products/:productId` |
| 请求 | 产品信息对象 |
| 响应 | `{ id, ...updatedData }` |
| 说明 | 更新产品信息 |

### 4.3 删除企业产品
| 项 | 值 |
|-----|-----|
| 路径 | `DELETE /api/enterprises/:enterpriseId/products/:productId` |
| 响应 | `{ success: true }` |
| 说明 | 删除产品 |

### 4.4 管理企业专利
| 项 | 值 |
|-----|-----|
| 路径 | `POST/PUT/DELETE /api/enterprises/:enterpriseId/patents` |
| 请求 | `{ name: string, patent_no: string }` |
| 响应 | 对应操作结果 |
| 说明 | 专利的增删改操作 |

**开发状态:** ✅ 已完成

---

## 模块5: 跟进记录 (5个API)

### 5.1 跟进记录列表
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/follow-ups` |
| 参数 | `?keyword=&type=&enterpriseId=&page=1&pageSize=10` |
| 响应 | `{ list: FollowUpRecord[], total: number, page: number, pageSize: number }` |
| 说明 | 支持按企业筛选、按类型筛选、关键词搜索 |

**跟进记录结构:**
```typescript
interface FollowUpRecord {
  id: number;
  enterprise_id: number;
  enterprise_name: string;
  follow_up_date: string;
  follow_up_person: string;
  follow_up_type: string; // 电话/视频/拜访/会议
  content: string;
  overall_status?: string;
  next_step?: string;
  stage_before?: string;
  stage_after?: string;
  service_provider?: string; // 合作服务商（签约后填写）
  created_at: string;
}
```

### 5.2 新增跟进记录
| 项 | 值 |
|-----|-----|
| 路径 | `POST /api/follow-ups` |
| 请求 | `{ enterprise_id, follow_up_type, follow_up_date, content, overall_status?, next_step?, stage_after?, service_provider? }` |
| 响应 | `{ id, ...createdData }` |
| 说明 | 新增跟进记录，可选同时变更阶段（自动记录stage_before） |

### 5.3 编辑跟进记录
| 项 | 值 |
|-----|-----|
| 路径 | `PUT /api/follow-ups/:id` |
| 请求 | 跟进记录对象 |
| 响应 | `{ id, ...updatedData }` |
| 说明 | 更新跟进记录 |

### 5.4 删除跟进记录
| 项 | 值 |
|-----|-----|
| 路径 | `DELETE /api/follow-ups/:id` |
| 响应 | `{ success: true }` |
| 说明 | 删除跟进记录 |

### 5.5 跟进统计
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/follow-ups/stats` |
| 响应 | `{ monthlyCount, weeklyCount, dailyCount, pendingCount }` |
| 说明 | 跟进记录统计数据（本月/本周/今日/待跟进） |

**开发状态:** ✅ 已完成

---

## 模块6: 看板统计 (5个API)

### 6.1 统计概览
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/dashboard/overview` |
| 响应 | 见下方 |
| 说明 | 首页统计卡片数据 |

**响应结构:**
```typescript
interface DashboardOverview {
  totalEnterprises: number;      // 企业总数
  potentialCount: number;        // 潜在企业数
  hasDemandCount: number;        // 有明确需求数
  signedSettledCount: number;    // 已签约入驻数
  monthlyChange: {
    total: number;               // 本月新增总数
    potential: number;           // 本月新增潜在
    hasDemand: number;           // 本月新增有需求
    signedSettled: number;       // 本月新增签约入驻
  };
}
```

### 6.2 漏斗阶段分布
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/dashboard/funnel` |
| 响应 | `[{ stage: string, name: string, count: number, color: string }]` |
| 说明 | 漏斗各阶段企业数量 |

### 6.3 区域分布
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/dashboard/districts` |
| 响应 | `[{ name: string, count: number }]` |
| 说明 | 各区域企业数量分布 |

### 6.4 行业分布
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/dashboard/industries` |
| 响应 | `[{ name: string, count: number, percentage: number }]` |
| 说明 | 各行业企业数量及占比 |

### 6.5 待跟进提醒
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/dashboard/pending-follow-ups` |
| 响应 | 见下方 |
| 说明 | 超过30天未跟进、本周需回访企业 |

**响应结构:**
```typescript
interface PendingFollowUps {
  overdue30Days: number;         // 超过30天未跟进企业数
  needFollowThisWeek: number;    // 本周需回访企业数
  overdueList: {
    id: number;
    name: string;
    lastFollowUp: string;
    days: number;
  }[];
  weeklyList: {
    id: number;
    name: string;
    nextFollowUp: string;
    type: string;
  }[];
}
```

**开发状态:** ✅ 已完成

---

## 模块7: 漏斗分析 (3个API)

### 7.1 漏斗数据
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/funnel/data` |
| 响应 | `[{ stage: string, name: string, count: number, color: string }]` |
| 说明 | 漏斗各阶段企业数量（与dashboard/funnel相同） |

### 7.2 转化率数据
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/funnel/conversion` |
| 响应 | `[{ from: string, to: string, count: number, rate: number }]` |
| 说明 | 各阶段间的转化数量和转化率 |

**转化路径:**
- 潜在企业 → 有明确需求
- 潜在企业 → 无明确需求
- 无明确需求 → 有明确需求
- 无明确需求 → 没有合作意向
- 有明确需求 → 已签约
- 已签约 → 已入驻
- 已入驻 → 重点孵化

### 7.3 趋势数据
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/funnel/trend` |
| 参数 | `?startDate=&endDate=` |
| 响应 | `[{ month: string, potential: number, hasDemand: number, signed: number, settled: number }]` |
| 说明 | 各阶段企业数量的月度趋势 |

**开发状态:** ✅ 已完成

---

## 通用响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

### 分页响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [...],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "错误描述",
  "errors": [
    { "field": "enterprise_name", "message": "企业名称不能为空" }
  ]
}
```

### HTTP状态码
| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（Token无效或过期） |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 开发顺序建议（推荐按此顺序开发）

### 第一阶段：基础设施（必须先完成）

| 顺序 | 模块 | 预计工时 | 依赖 | 说明 |
|------|------|----------|------|------|
| 1 | 数据库初始化 | 2h | 无 | 执行SQL脚本创建表结构和初始数据 |
| 2 | 模块1: 用户认证 | 4h | 数据库 | JWT认证是所有API的前置条件 |
| 3 | 模块2: 基础数据/数据字典 | 4h | 数据库 | 为其他模块提供下拉选项数据 |

### 第二阶段：核心业务（主要功能）

| 顺序 | 模块 | 预计工时 | 依赖 | 说明 |
|------|------|----------|------|------|
| 4 | 模块3: 企业管理（基础CRUD） | 8h | 模块1,2 | 先完成列表、详情、新增、编辑、删除 |
| 5 | 模块3: 企业管理（高级功能） | 4h | 模块3基础 | 阶段变更、联系人管理、导入导出 |
| 6 | 模块4: 企业产品管理 | 3h | 模块3 | 产品、专利的CRUD |
| 7 | 模块5: 跟进记录 | 4h | 模块3 | 跟进记录CRUD和统计 |

### 第三阶段：数据分析（统计报表）

| 顺序 | 模块 | 预计工时 | 依赖 | 说明 |
|------|------|----------|------|------|
| 8 | 模块6: 看板统计 | 3h | 模块3,5 | 首页Dashboard数据 |
| 9 | 模块7: 漏斗分析 | 2h | 模块3 | 转化率和趋势分析 |
| 10 | 模块3: 企业数据分析 | 2h | 模块3 | 企业列表页的数据分析功能 |

### 开发检查清单

```
□ 第一阶段
  □ 1. 执行 sql/01_create_tables.sql
  □ 2. 执行 sql/02_init_system_options.sql
  □ 3. 执行 sql/03_init_industry.sql
  □ 4. 执行 sql/04_init_product_category.sql
  □ 5. 完成用户认证模块（登录/登出/获取用户/修改密码）
  □ 6. 完成基础数据模块（选项列表/行业树/产品品类树/用户列表）
  □ 7. 完成数据字典管理（分类列表/增删改查）

□ 第二阶段
  □ 8. 企业列表API（含筛选、分页）
  □ 9. 企业详情API
  □ 10. 企业新增API
  □ 11. 企业编辑API
  □ 12. 企业删除API
  □ 13. 企业阶段变更API
  □ 14. 企业联系人管理API
  □ 15. 企业导入/导出API
  □ 16. 企业产品CRUD API
  □ 17. 企业专利CRUD API
  □ 18. 跟进记录CRUD API
  □ 19. 跟进统计API

□ 第三阶段
  □ 20. Dashboard概览API
  □ 21. Dashboard漏斗分布API
  □ 22. Dashboard区域分布API
  □ 23. Dashboard行业分布API
  □ 24. Dashboard待跟进提醒API
  □ 25. 漏斗数据API
  □ 26. 转化率API
  □ 27. 趋势数据API
  □ 28. 企业数据分析API
```

### 总预计工时：约36小时（4-5个工作日）

---

## 数据库表与API对应关系

| 表名 | 主要API |
|------|---------|
| users | 模块1: 用户认证 |
| system_options | 模块2: 基础数据 |
| industry_categories | 模块2: 行业分类 |
| product_categories | 模块2: 产品品类 |
| enterprises | 模块3: 企业管理 |
| enterprise_contacts | 模块3: 联系人管理 |
| enterprise_products | 模块4: 产品管理 |
| enterprise_patents | 模块4: 专利管理 |
| follow_up_records | 模块5: 跟进记录 |
| stage_change_logs | 模块3: 阶段变更（自动记录） |

---

## 前端API调用参考

前端API服务文件位置: `frontend/src/services/api.ts`

```typescript
// 企业管理 API
enterpriseApi.getList(params)      // GET /api/enterprises
enterpriseApi.getDetail(id)        // GET /api/enterprises/:id
enterpriseApi.create(data)         // POST /api/enterprises
enterpriseApi.update(id, data)     // PUT /api/enterprises/:id
enterpriseApi.delete(id)           // DELETE /api/enterprises/:id
enterpriseApi.updateStage(id, stage) // PATCH /api/enterprises/:id/stage
enterpriseApi.import(file)         // POST /api/enterprises/import
enterpriseApi.export(params)       // GET /api/enterprises/export

// 跟进记录 API
followUpApi.getList(params)        // GET /api/follow-ups
followUpApi.getByEnterprise(id)    // GET /api/enterprises/:id/follow-ups
followUpApi.create(data)           // POST /api/follow-ups
followUpApi.update(id, data)       // PUT /api/follow-ups/:id
followUpApi.delete(id)             // DELETE /api/follow-ups/:id

// 看板统计 API
dashboardApi.getOverview()         // GET /api/dashboard/overview
dashboardApi.getFunnelStats()      // GET /api/dashboard/funnel
dashboardApi.getDistrictStats()    // GET /api/dashboard/districts
dashboardApi.getIndustryStats()    // GET /api/dashboard/industries
dashboardApi.getPendingFollowUps() // GET /api/dashboard/pending-follow-ups

// 漏斗分析 API
funnelApi.getData()                // GET /api/funnel/data
funnelApi.getConversionRates()     // GET /api/funnel/conversion
funnelApi.getTrend(params)         // GET /api/funnel/trend

// 用户认证 API
authApi.login(data)                // POST /api/auth/login
authApi.logout()                   // POST /api/auth/logout
authApi.getCurrentUser()           // GET /api/auth/me
authApi.changePassword(data)       // POST /api/auth/change-password
```

---

## 注意事项

1. **销售目标国数据**: 由前端硬编码管理，详见 `frontend/src/data/countries.ts`
2. **竞争对手和风险信息**: 暂用Mock数据，不从后端获取
3. **需求管理**: 需求相关表（requirements, enterprise_requirements等）暂不开发API
4. **文件上传**: 导入功能需要支持Excel文件解析（推荐使用xlsx库）
5. **数据校验**: 统一社会信用代码需要18位格式校验

---

*文档版本：v2.0 | 更新日期：2026-02-03 | 基于前端代码分析更新*
