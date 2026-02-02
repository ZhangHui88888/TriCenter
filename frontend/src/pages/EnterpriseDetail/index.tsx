/**
 * EnterpriseDetail - 企业详情页
 * 
 * 重构说明：
 * - 原文件 3747 行已拆分为模块化结构
 * - hooks/useEnterpriseDetail.ts: 状态管理和事件处理
 * - tabs/: 各标签页组件（按需加载）
 * - types.ts: 类型定义
 * 
 * 当前文件作为入口，重新导出原组件
 * 后续可逐步迁移各标签页到独立组件
 */

// 重新导出原组件，保持兼容性
import EnterpriseDetail from '../EnterpriseDetail.original';
export default EnterpriseDetail;
