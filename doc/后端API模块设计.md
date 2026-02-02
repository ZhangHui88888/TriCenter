# 后端API模块设计文档

> 用于AI辅助开发，按模块逐步完成后端API开发

---

## 技术栈

| 项 | 选型 |
|-----|------|
| 框架 | Node.js + Express / Python + FastAPI (待定) |
| 数据库 | MySQL / PostgreSQL |
| 认证 | JWT Token |
| 文档 | Swagger/OpenAPI |

---

## 模块开发清单

| 序号 | 模块 | API数量 | 状态 | 备注 |
|------|------|---------|------|------|
| 1 | 用户认证 | 4 | ⬜ 待开发 | 登录、权限基础 |
| 2 | 基础数据 | 3 | ⬜ 待开发 | 下拉选项数据 |
| 3 | 企业管理 | 10 | ⬜ 待开发 | 核心业务模块 |
| 4 | 跟进记录 | 5 | ⬜ 待开发 | 跟进管理 |
| 5 | 看板统计 | 5 | ⬜ 待开发 | 首页数据展示 |

**总计: ~27个API**

---

## 模块1: 用户认证 (4个API)

### 1.1 用户登录
| 项 | 值 |
|-----|-----|
| 路径 | `POST /api/auth/login` |
| 请求 | `{ username, password }` |
| 响应 | `{ token, user: { id, username, role, name } }` |
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
| 路径 | `PUT /api/auth/password` |
| 请求 | `{ oldPassword, newPassword }` |
| 响应 | `{ success: true }` |
| 说明 | 修改当前用户密码 |

**开发状态:** ⬜ 待开发

---

## 模块2: 基础数据 (3个API)

### 2.1 获取区列表
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/options/districts` |
| 响应 | `[{ value: "wujin", label: "武进区" }, ...]` |
| 说明 | 下拉选项：武进区/新北区/天宁区/钟楼区/经开区/金坛区/溧阳市 |

### 2.2 获取行业分类树
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/options/industries` |
| 响应 | `[{ id, name, level, children: [...] }, ...]` |
| 说明 | 返回多级行业分类树结构，用于级联选择器 |

### 2.3 获取用户列表（对接人）
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/options/users` |
| 响应 | `[{ value: 1, label: "张三" }, ...]` |
| 说明 | 用于企业对接人下拉选择 |

**开发状态:** ⬜ 待开发

---

## 模块3: 企业管理 (10个API)

### 3.1 企业列表
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/enterprises` |
| 参数 | `?keyword=&stage=&district=&industryId=&page=1&pageSize=10` |
| 响应 | `{ list: [...], total, page, pageSize }` |
| 说明 | 支持搜索、筛选、分页 |

### 3.2 企业详情
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/enterprises/:id` |
| 响应 | 完整企业信息对象（包含所有标签页数据） |
| 说明 | 获取单个企业的完整信息。**注**: 竞争对手和风险信息暂用Mock数据，不从后端获取 |

### 3.3 新增企业
| 项 | 值 |
|-----|-----|
| 路径 | `POST /api/enterprises` |
| 请求 | 企业基本信息对象 |
| 响应 | `{ id, ...createdData }` |
| 说明 | 创建新企业记录 |

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
| 说明 | 软删除企业记录 |

### 3.6 变更漏斗阶段
| 项 | 值 |
|-----|-----|
| 路径 | `PUT /api/enterprises/:id/stage` |
| 请求 | `{ stage: "HAS_DEMAND", reason: "变更原因" }` |
| 响应 | `{ success: true, newStage }` |
| 说明 | 变更企业漏斗阶段，同时记录变更日志 |

### 3.7 批量导入
| 项 | 值 |
|-----|-----|
| 路径 | `POST /api/enterprises/import` |
| 请求 | `multipart/form-data` 包含Excel文件 |
| 响应 | `{ success: number, failed: number, errors: [] }` |
| 说明 | 批量导入企业数据 |

### 3.8 导出企业
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/enterprises/export` |
| 参数 | `?stage=&district=&industryId=` (筛选条件) |
| 响应 | Excel文件流 |
| 说明 | 导出企业列表为Excel |

### 3.9 获取导入模板
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/enterprises/template` |
| 响应 | Excel模板文件流 |
| 说明 | 下载批量导入模板 |

### 3.10 企业数据分析
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/enterprises/analysis` |
| 参数 | `?district=&industryId=&dateRange=` |
| 响应 | `{ stageDistribution, districtDistribution, industryDistribution, conversionRate }` |
| 说明 | 企业数据统计分析（漏斗、转化率等） |

**开发状态:** ⬜ 待开发

---

## 模块4: 跟进记录 (5个API)

### 4.1 跟进记录列表
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/follow-ups` |
| 参数 | `?keyword=&type=&enterpriseId=&page=1&pageSize=10` |
| 响应 | `{ list: [...], total, page, pageSize }` |
| 说明 | 支持按企业筛选、按类型筛选 |

### 4.2 新增跟进记录
| 项 | 值 |
|-----|-----|
| 路径 | `POST /api/follow-ups` |
| 请求 | `{ enterpriseId, type, date, content, status, nextPlan, newStage? }` |
| 响应 | `{ id, ...createdData }` |
| 说明 | 新增跟进记录，可选同时变更阶段 |

### 4.3 编辑跟进记录
| 项 | 值 |
|-----|-----|
| 路径 | `PUT /api/follow-ups/:id` |
| 请求 | 跟进记录对象 |
| 响应 | `{ id, ...updatedData }` |
| 说明 | 更新跟进记录 |

### 4.4 删除跟进记录
| 项 | 值 |
|-----|-----|
| 路径 | `DELETE /api/follow-ups/:id` |
| 响应 | `{ success: true }` |
| 说明 | 删除跟进记录 |

### 4.5 跟进统计
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/follow-ups/stats` |
| 响应 | `{ thisMonth, thisWeek, today, pendingCount }` |
| 说明 | 跟进记录统计数据 |

**开发状态:** ⬜ 待开发

---

## 模块5: 看板统计 (5个API)

### 5.1 汇总统计
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/dashboard/summary` |
| 响应 | `{ total, potential, hasDemand, signed, settled, monthlyChanges }` |
| 说明 | 统计卡片数据 |

### 5.2 漏斗阶段分布
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/dashboard/funnel` |
| 响应 | `[{ stage, label, count, color }, ...]` |
| 说明 | 漏斗各阶段企业数量 |

### 5.3 区域分布
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/dashboard/region-distribution` |
| 响应 | `[{ region, count }, ...]` |
| 说明 | 各区域企业数量分布 |

### 5.4 行业分布
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/dashboard/industry-distribution` |
| 响应 | `[{ industry, count, percentage }, ...]` |
| 说明 | 各行业企业数量及占比 |

### 5.5 待跟进提醒
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/dashboard/reminders` |
| 响应 | `{ overdue30Days, needFollowThisWeek, list: [...] }` |
| 说明 | 超过30天未跟进、本周需回访企业 |

**开发状态:** ⬜ 待开发

---

## 模块6: 数据字典管理 (5个API)

> **权限要求**: 仅管理员可操作

### 6.1 获取字典分类列表
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/dictionary/categories` |
| 响应 | `[{ category, label, count }, ...]` |
| 说明 | 获取所有字典分类及各分类下选项数量 |

### 6.2 获取分类下选项列表
| 项 | 值 |
|-----|-----|
| 路径 | `GET /api/dictionary/:category` |
| 响应 | `[{ id, value, label, color, sortOrder, isEnabled }, ...]` |
| 说明 | 获取指定分类下的所有选项 |

### 6.3 新增选项
| 项 | 值 |
|-----|-----|
| 路径 | `POST /api/dictionary/:category` |
| 请求 | `{ value, label, color?, sortOrder? }` |
| 响应 | `{ id, value, label, ... }` |
| 说明 | 在指定分类下新增选项 |

### 6.4 更新选项
| 项 | 值 |
|-----|-----|
| 路径 | `PUT /api/dictionary/:category/:id` |
| 请求 | `{ label?, color?, sortOrder?, isEnabled? }` |
| 响应 | `{ id, value, label, ... }` |
| 说明 | 更新选项信息（value不可修改） |

### 6.5 删除选项
| 项 | 值 |
|-----|-----|
| 路径 | `DELETE /api/dictionary/:category/:id` |
| 响应 | `{ success: true }` |
| 说明 | 删除选项（已被引用的选项不可删除，仅可禁用） |

**开发状态:** ⬜ 待开发

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

### 错误响应
```json
{
  "code": 400,
  "message": "错误描述",
  "errors": [ ... ]
}
```

### HTTP状态码
| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 开发顺序建议

1. **模块1: 用户认证** - 基础依赖，优先完成
2. **模块2: 基础数据** - 简单，为其他模块提供选项数据
3. **模块6: 数据字典管理** - 管理后台，支持动态配置选项
4. **模块3: 企业管理** - 核心业务，工作量最大
5. **模块4: 跟进记录** - 依赖企业模块
6. **模块5: 看板统计** - 聚合查询，最后完成

---

*文档版本：v1.0 | 更新日期：2026-01-30*
