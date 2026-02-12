import { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  message,
  Popconfirm,
  Typography,
  ColorPicker,
  Select,
  Empty,
  Tree,
  TreeSelect,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  SearchOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';
import { dictionaryData, dictionaryCategories, type DictionaryItem, type DictionaryCategory } from '@/data/dictionaryData';

const { Text } = Typography;

// 多级分类数据类型
interface CategoryTreeItem {
  id: number;
  parent_id: number;
  name: string;
  level: number;
  path: string;
  sort_order: number;
  is_enabled: boolean;
  children?: CategoryTreeItem[];
}

// 初始行业分类数据
const initialIndustryCategories: CategoryTreeItem[] = [
  { id: 1, parent_id: 0, name: '制造业', level: 1, path: '1', sort_order: 1, is_enabled: true },
  { id: 2, parent_id: 0, name: '贸易/零售', level: 1, path: '2', sort_order: 2, is_enabled: true },
  { id: 3, parent_id: 0, name: '服务业', level: 1, path: '3', sort_order: 3, is_enabled: true },
  { id: 10, parent_id: 1, name: '园艺制品', level: 2, path: '1/10', sort_order: 1, is_enabled: true },
  { id: 11, parent_id: 1, name: '电动工具', level: 2, path: '1/11', sort_order: 2, is_enabled: true },
  { id: 12, parent_id: 1, name: '汽车零部件', level: 2, path: '1/12', sort_order: 3, is_enabled: true },
  { id: 13, parent_id: 1, name: '家居建材', level: 2, path: '1/13', sort_order: 4, is_enabled: true },
  { id: 14, parent_id: 1, name: '机械设备', level: 2, path: '1/14', sort_order: 5, is_enabled: true },
  { id: 15, parent_id: 1, name: '纺织服装', level: 2, path: '1/15', sort_order: 6, is_enabled: true },
  { id: 16, parent_id: 1, name: '电子产品', level: 2, path: '1/16', sort_order: 7, is_enabled: true },
  { id: 160, parent_id: 16, name: '消费电子', level: 3, path: '1/16/160', sort_order: 1, is_enabled: true },
  { id: 161, parent_id: 16, name: '工业电子', level: 3, path: '1/16/161', sort_order: 2, is_enabled: true },
  { id: 162, parent_id: 16, name: '智能硬件', level: 3, path: '1/16/162', sort_order: 3, is_enabled: true },
];

// 初始产品品类数据
const initialProductCategories: CategoryTreeItem[] = [
  { id: 1, parent_id: 0, name: '园艺工具', level: 1, path: '1', sort_order: 1, is_enabled: true },
  { id: 2, parent_id: 0, name: '电动工具', level: 1, path: '2', sort_order: 2, is_enabled: true },
  { id: 3, parent_id: 0, name: '家居用品', level: 1, path: '3', sort_order: 3, is_enabled: true },
  { id: 4, parent_id: 0, name: '户外运动', level: 1, path: '4', sort_order: 4, is_enabled: true },
  { id: 5, parent_id: 0, name: '汽车配件', level: 1, path: '5', sort_order: 5, is_enabled: true },
  { id: 6, parent_id: 0, name: '电子产品', level: 1, path: '6', sort_order: 6, is_enabled: true },
  { id: 101, parent_id: 1, name: '园艺手工具', level: 2, path: '1/101', sort_order: 1, is_enabled: true },
  { id: 102, parent_id: 1, name: '园艺电动工具', level: 2, path: '1/102', sort_order: 2, is_enabled: true },
  { id: 103, parent_id: 1, name: '园艺装饰品', level: 2, path: '1/103', sort_order: 3, is_enabled: true },
  { id: 10101, parent_id: 101, name: '铲子', level: 3, path: '1/101/10101', sort_order: 1, is_enabled: true },
  { id: 10102, parent_id: 101, name: '剪刀', level: 3, path: '1/101/10102', sort_order: 2, is_enabled: true },
  { id: 10103, parent_id: 101, name: '耙子', level: 3, path: '1/101/10103', sort_order: 3, is_enabled: true },
  { id: 201, parent_id: 2, name: '电钻', level: 2, path: '2/201', sort_order: 1, is_enabled: true },
  { id: 202, parent_id: 2, name: '电锯', level: 2, path: '2/202', sort_order: 2, is_enabled: true },
  { id: 203, parent_id: 2, name: '角磨机', level: 2, path: '2/203', sort_order: 3, is_enabled: true },
];

// 初始需求管理数据（阶段 → 分类 → 需求项）
const initialRequirementCategories: CategoryTreeItem[] = [
  // 第一阶段
  { id: 1, parent_id: 0, name: '战略规划与资源准备', level: 1, path: '1', sort_order: 1, is_enabled: true },
  { id: 11, parent_id: 1, name: '品牌规划', level: 2, path: '1/11', sort_order: 1, is_enabled: true },
  { id: 111, parent_id: 11, name: '品牌定位与规划/设计', level: 3, path: '1/11/111', sort_order: 1, is_enabled: true },
  { id: 12, parent_id: 1, name: '市场洞察', level: 2, path: '1/12', sort_order: 2, is_enabled: true },
  { id: 121, parent_id: 12, name: '市场/IP洞察', level: 3, path: '1/12/121', sort_order: 1, is_enabled: true },
  { id: 13, parent_id: 1, name: '搭建营销体系', level: 2, path: '1/13', sort_order: 3, is_enabled: true },
  { id: 131, parent_id: 13, name: '用户旅程设计', level: 3, path: '1/13/131', sort_order: 1, is_enabled: true },
  { id: 132, parent_id: 13, name: '画像/要素/标签体系', level: 3, path: '1/13/132', sort_order: 2, is_enabled: true },
  { id: 133, parent_id: 13, name: '营销活动与节奏规划', level: 3, path: '1/13/133', sort_order: 3, is_enabled: true },
  { id: 14, parent_id: 1, name: '测品选品与前置认证评估', level: 2, path: '1/14', sort_order: 4, is_enabled: true },
  { id: 141, parent_id: 14, name: '平台测品、双轨选品', level: 3, path: '1/14/141', sort_order: 1, is_enabled: true },
  { id: 142, parent_id: 14, name: '海外认证可行性评估', level: 3, path: '1/14/142', sort_order: 2, is_enabled: true },
  { id: 15, parent_id: 1, name: '战略与预算', level: 2, path: '1/15', sort_order: 5, is_enabled: true },
  { id: 151, parent_id: 15, name: '出海路径规划', level: 3, path: '1/15/151', sort_order: 1, is_enabled: true },
  { id: 152, parent_id: 15, name: '营销战略与预算', level: 3, path: '1/15/152', sort_order: 2, is_enabled: true },
  { id: 16, parent_id: 1, name: '供应链与物流准备', level: 2, path: '1/16', sort_order: 6, is_enabled: true },
  { id: 161, parent_id: 16, name: '备货策略与库存预案', level: 3, path: '1/16/161', sort_order: 1, is_enabled: true },
  { id: 162, parent_id: 16, name: '物流渠道方案选型', level: 3, path: '1/16/162', sort_order: 2, is_enabled: true },
  { id: 17, parent_id: 1, name: '合规前置', level: 2, path: '1/17', sort_order: 7, is_enabled: true },
  { id: 171, parent_id: 17, name: '知识产权布局', level: 3, path: '1/17/171', sort_order: 1, is_enabled: true },
  { id: 172, parent_id: 17, name: '税务合规前置', level: 3, path: '1/17/172', sort_order: 2, is_enabled: true },
  { id: 18, parent_id: 1, name: '团队与组织准备', level: 2, path: '1/18', sort_order: 8, is_enabled: true },
  { id: 181, parent_id: 18, name: '组织架构设计', level: 3, path: '1/18/181', sort_order: 1, is_enabled: true },
  { id: 182, parent_id: 18, name: '人才招聘与培养', level: 3, path: '1/18/182', sort_order: 2, is_enabled: true },
  
  // 第二阶段
  { id: 2, parent_id: 0, name: '渠道搭建与商品上线', level: 1, path: '2', sort_order: 2, is_enabled: true },
  { id: 21, parent_id: 2, name: '渠道与店铺建设', level: 2, path: '2/21', sort_order: 1, is_enabled: true },
  { id: 211, parent_id: 21, name: '平台开店', level: 3, path: '2/21/211', sort_order: 1, is_enabled: true },
  { id: 212, parent_id: 21, name: '独立站建设', level: 3, path: '2/21/212', sort_order: 2, is_enabled: true },
  { id: 22, parent_id: 2, name: '商品内容与上架', level: 2, path: '2/22', sort_order: 2, is_enabled: true },
  { id: 221, parent_id: 22, name: 'Listing与素材生产', level: 3, path: '2/22/221', sort_order: 1, is_enabled: true },
  { id: 222, parent_id: 22, name: '合规材料与上架门槛', level: 3, path: '2/22/222', sort_order: 2, is_enabled: true },
  { id: 23, parent_id: 2, name: '达人/社媒/直播启动', level: 2, path: '2/23', sort_order: 3, is_enabled: true },
  { id: 231, parent_id: 23, name: '达人合作与结算', level: 3, path: '2/23/231', sort_order: 1, is_enabled: true },
  { id: 232, parent_id: 23, name: '直播间搭建与直播运营', level: 3, path: '2/23/232', sort_order: 2, is_enabled: true },
  { id: 24, parent_id: 2, name: '包装与样品管理', level: 2, path: '2/24', sort_order: 4, is_enabled: true },
  { id: 241, parent_id: 24, name: '外包装设计', level: 3, path: '2/24/241', sort_order: 1, is_enabled: true },
  { id: 242, parent_id: 24, name: '防损包装', level: 3, path: '2/24/242', sort_order: 2, is_enabled: true },
  
  // 第三阶段
  { id: 3, parent_id: 0, name: '营销推广与规模增长', level: 1, path: '3', sort_order: 3, is_enabled: true },
  { id: 31, parent_id: 3, name: '获客与投放', level: 2, path: '3/31', sort_order: 1, is_enabled: true },
  { id: 311, parent_id: 31, name: '流量推广与精准营销', level: 3, path: '3/31/311', sort_order: 1, is_enabled: true },
  { id: 312, parent_id: 31, name: '广告投放与优化', level: 3, path: '3/31/312', sort_order: 2, is_enabled: true },
  { id: 32, parent_id: 3, name: '订单、财务与收款', level: 2, path: '3/32', sort_order: 2, is_enabled: true },
  { id: 321, parent_id: 32, name: '跨境支付与资金管理', level: 3, path: '3/32/321', sort_order: 1, is_enabled: true },
  { id: 322, parent_id: 32, name: '出口退税与税务申报', level: 3, path: '3/32/322', sort_order: 2, is_enabled: true },
  { id: 33, parent_id: 3, name: '客服与售后', level: 2, path: '3/33', sort_order: 3, is_enabled: true },
  { id: 331, parent_id: 33, name: '知识库/智能客服', level: 3, path: '3/33/331', sort_order: 1, is_enabled: true },
  { id: 332, parent_id: 33, name: '退换货、维修、质保服务', level: 3, path: '3/33/332', sort_order: 2, is_enabled: true },
  { id: 34, parent_id: 3, name: '合规与风险的持续运营', level: 2, path: '3/34', sort_order: 4, is_enabled: true },
  { id: 341, parent_id: 34, name: '平台合规', level: 3, path: '3/34/341', sort_order: 1, is_enabled: true },
  { id: 342, parent_id: 34, name: '知识产权维护', level: 3, path: '3/34/342', sort_order: 2, is_enabled: true },
  
  // 第四阶段
  { id: 4, parent_id: 0, name: '品牌深耕与持续优化', level: 1, path: '4', sort_order: 4, is_enabled: true },
  { id: 41, parent_id: 4, name: '履约升级与交付体验', level: 2, path: '4/41', sort_order: 1, is_enabled: true },
  { id: 411, parent_id: 41, name: '报关/清关异常处理', level: 3, path: '4/41/411', sort_order: 1, is_enabled: true },
  { id: 412, parent_id: 41, name: '海外仓', level: 3, path: '4/41/412', sort_order: 2, is_enabled: true },
  { id: 42, parent_id: 4, name: '私域与会员运营', level: 2, path: '4/42', sort_order: 2, is_enabled: true },
  { id: 421, parent_id: 42, name: '合伙人转介、交叉销售、复购', level: 3, path: '4/42/421', sort_order: 1, is_enabled: true },
  { id: 43, parent_id: 4, name: '产品与品牌迭代', level: 2, path: '4/43', sort_order: 3, is_enabled: true },
  { id: 431, parent_id: 43, name: '产品迭代机制', level: 3, path: '4/43/431', sort_order: 1, is_enabled: true },
  { id: 432, parent_id: 43, name: '品牌推广与IP策略', level: 3, path: '4/43/432', sort_order: 2, is_enabled: true },
  { id: 44, parent_id: 4, name: '新品规划', level: 2, path: '4/44', sort_order: 4, is_enabled: true },
  { id: 441, parent_id: 44, name: '商品洞察', level: 3, path: '4/44/441', sort_order: 1, is_enabled: true },
  { id: 442, parent_id: 44, name: '产品定义', level: 3, path: '4/44/442', sort_order: 2, is_enabled: true },
];

function DataDictionary() {
  const [data, setData] = useState<DictionaryItem[]>(dictionaryData);
  const [categories] = useState<DictionaryCategory[]>(dictionaryCategories);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<DictionaryItem | null>(null);
  const [form] = Form.useForm();
  
  // 多级分类状态
  const [industryCategories, setIndustryCategories] = useState<CategoryTreeItem[]>(initialIndustryCategories);
  const [productCategories, setProductCategories] = useState<CategoryTreeItem[]>(initialProductCategories);
  const [requirementCategories, setRequirementCategories] = useState<CategoryTreeItem[]>(initialRequirementCategories);
  const [treeModalVisible, setTreeModalVisible] = useState(false);
  const [editingTreeItem, setEditingTreeItem] = useState<CategoryTreeItem | null>(null);
  const [treeForm] = Form.useForm();
  const [currentTreeType, setCurrentTreeType] = useState<'industry' | 'product' | 'requirement'>('industry');

  // 分类选项（包含多级分类的特殊标记）
  const categoryOptions = useMemo(() => {
    const options = categories.map(cat => ({
      value: cat.key,
      label: `${cat.name} (${cat.key})`,
      desc: cat.description,
      isTree: false,
    }));
    // 添加多级分类选项
    options.unshift(
      { value: '_industry_categories', label: '行业分类 (多级)', desc: '企业主表.industry_id - 支持多级分类管理', isTree: true },
      { value: '_product_categories', label: '产品品类 (多级)', desc: '企业产品.category_id - 支持多级分类管理', isTree: true },
      { value: '_requirement_categories', label: '需求管理 (多级)', desc: '需求主表.requirements - 阶段→分类→需求项', isTree: true },
    );
    return options;
  }, [categories]);

  // 判断是否为多级分类
  const isTreeCategory = selectedCategory?.startsWith('_');
  const treeType = selectedCategory === '_industry_categories' ? 'industry' 
    : selectedCategory === '_product_categories' ? 'product' 
    : 'requirement';

  // 当前分类的数据
  const currentData = useMemo(() => {
    if (!selectedCategory || isTreeCategory) return [];
    return data
      .filter(item => item.category === selectedCategory)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [data, selectedCategory, isTreeCategory]);

  // 当前分类信息
  const currentCategory = useMemo(() => {
    if (isTreeCategory) {
      if (selectedCategory === '_industry_categories') {
        return { key: '_industry_categories', name: '行业分类', description: '企业主表.industry_id' };
      } else if (selectedCategory === '_product_categories') {
        return { key: '_product_categories', name: '产品品类', description: '企业产品.category_id' };
      } else {
        return { key: '_requirement_categories', name: '需求管理', description: '需求主表 - 阶段→分类→需求项' };
      }
    }
    return categories.find(c => c.key === selectedCategory);
  }, [selectedCategory, categories, isTreeCategory]);

  // 是否需要颜色字段
  const needsColor = selectedCategory === 'stage';

  // 构建树形数据
  const buildTreeData = (items: CategoryTreeItem[]): DataNode[] => {
    const map = new Map<number, DataNode & { raw: CategoryTreeItem }>();
    const roots: (DataNode & { raw: CategoryTreeItem })[] = [];
    
    items.forEach(item => {
      map.set(item.id, {
        key: item.id,
        title: (
          <Space>
            <span style={{ color: item.is_enabled ? undefined : '#999' }}>{item.name}</span>
            {!item.is_enabled && <Tag color="default" style={{ fontSize: 10 }}>禁用</Tag>}
          </Space>
        ),
        children: [],
        raw: item,
      });
    });
    
    items.forEach(item => {
      const node = map.get(item.id)!;
      if (item.parent_id === 0) {
        roots.push(node);
      } else {
        const parent = map.get(item.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
        }
      }
    });
    
    return roots;
  };

  // 构建TreeSelect数据
  const buildTreeSelectData = (items: CategoryTreeItem[]): any[] => {
    const map = new Map<number, any>();
    const roots: any[] = [];
    
    // 添加根节点选项
    roots.push({ value: 0, title: '顶级分类', children: [] });
    
    items.forEach(item => {
      map.set(item.id, {
        value: item.id,
        title: item.name,
        children: [],
      });
    });
    
    items.forEach(item => {
      const node = map.get(item.id)!;
      if (item.parent_id === 0) {
        roots[0].children.push(node);
      } else {
        const parent = map.get(item.parent_id);
        if (parent) {
          parent.children.push(node);
        }
      }
    });
    
    return roots;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentTreeData = useMemo(() => {
    if (selectedCategory === '_industry_categories') {
      return buildTreeData(industryCategories);
    } else if (selectedCategory === '_product_categories') {
      return buildTreeData(productCategories);
    }
    return [];
  }, [selectedCategory, industryCategories, productCategories]);

  // 打开新增弹窗
  const handleAdd = () => {
    if (!selectedCategory) {
      message.warning('请先选择一个分类');
      return;
    }
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({
      category: selectedCategory,
      sort_order: currentData.length + 1,
      is_enabled: true,
    });
    setModalVisible(true);
  };

  // 打开编辑弹窗
  const handleEdit = (record: DictionaryItem) => {
    setEditingItem(record);
    form.setFieldsValue({
      ...record,
      color: record.color || undefined,
    });
    setModalVisible(true);
  };

  // 删除
  const handleDelete = (id: number) => {
    setData(prev => prev.filter(item => item.id !== id));
    message.success('删除成功');
  };

  // 切换启用状态
  const handleToggleEnabled = (record: DictionaryItem) => {
    setData(prev =>
      prev.map(item =>
        item.id === record.id ? { ...item, is_enabled: !item.is_enabled } : item
      )
    );
    message.success(record.is_enabled ? '已禁用' : '已启用');
  };

  // 保存
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const colorValue = values.color?.toHexString ? values.color.toHexString() : values.color;
      
      if (editingItem) {
        setData(prev =>
          prev.map(item =>
            item.id === editingItem.id
              ? { ...item, ...values, color: colorValue }
              : item
          )
        );
        message.success('修改成功');
      } else {
        const newId = Math.max(...data.map(d => d.id), 0) + 1;
        const newItem: DictionaryItem = {
          ...values,
          id: newId,
          color: colorValue,
          created_at: new Date().toISOString().split('T')[0],
        };
        setData(prev => [...prev, newItem]);
        message.success('添加成功');
      }
      setModalVisible(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // 多级分类操作
  const handleAddTreeItem = (parentId: number = 0) => {
    const items = treeType === 'industry' ? industryCategories 
      : treeType === 'product' ? productCategories 
      : requirementCategories;
    const parent = items.find(i => i.id === parentId);
    const level = parent ? parent.level + 1 : 1;
    
    if (level > 3) {
      message.warning('最多支持3级分类');
      return;
    }
    
    setCurrentTreeType(treeType);
    setEditingTreeItem(null);
    treeForm.resetFields();
    treeForm.setFieldsValue({
      parent_id: parentId,
      level,
      sort_order: 1,
      is_enabled: true,
    });
    setTreeModalVisible(true);
  };

  const handleEditTreeItem = (item: CategoryTreeItem) => {
    setCurrentTreeType(treeType);
    setEditingTreeItem(item);
    treeForm.setFieldsValue(item);
    setTreeModalVisible(true);
  };

  const handleDeleteTreeItem = (id: number) => {
    const setItems = treeType === 'industry' ? setIndustryCategories 
      : treeType === 'product' ? setProductCategories 
      : setRequirementCategories;
    const items = treeType === 'industry' ? industryCategories 
      : treeType === 'product' ? productCategories 
      : requirementCategories;
    
    // 检查是否有子分类
    const hasChildren = items.some(i => i.parent_id === id);
    if (hasChildren) {
      message.error('请先删除子分类');
      return;
    }
    
    setItems(prev => prev.filter(item => item.id !== id));
    message.success('删除成功');
  };

  const handleSaveTreeItem = async () => {
    try {
      const values = await treeForm.validateFields();
      const setItems = currentTreeType === 'industry' ? setIndustryCategories 
        : currentTreeType === 'product' ? setProductCategories 
        : setRequirementCategories;
      const items = currentTreeType === 'industry' ? industryCategories 
        : currentTreeType === 'product' ? productCategories 
        : requirementCategories;
      
      if (editingTreeItem) {
        setItems(prev =>
          prev.map(item =>
            item.id === editingTreeItem.id ? { ...item, ...values } : item
          )
        );
        message.success('修改成功');
      } else {
        const newId = Math.max(...items.map(d => d.id), 0) + 1;
        const parent = items.find(i => i.id === values.parent_id);
        const path = parent ? `${parent.path}/${newId}` : String(newId);
        
        const newItem: CategoryTreeItem = {
          ...values,
          id: newId,
          path,
        };
        setItems(prev => [...prev, newItem]);
        message.success('添加成功');
      }
      setTreeModalVisible(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const columns: ColumnsType<DictionaryItem> = [
    { title: '排序', dataIndex: 'sort_order', width: 70, align: 'center' },
    { title: '选项值', dataIndex: 'value', width: 150, render: (text: string) => <Text code>{text}</Text> },
    {
      title: '显示名称',
      dataIndex: 'label',
      width: 200,
      render: (text: string, record: DictionaryItem) => (
        <Space>
          {record.color && (
            <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2, backgroundColor: record.color }} />
          )}
          {text}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'is_enabled',
      width: 80,
      align: 'center',
      render: (enabled: boolean) => <Tag color={enabled ? 'success' : 'default'}>{enabled ? '启用' : '禁用'}</Tag>,
    },
    { title: '创建时间', dataIndex: 'created_at', width: 120 },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" size="small" onClick={() => handleToggleEnabled(record)}>{record.is_enabled ? '禁用' : '启用'}</Button>
          <Popconfirm title="确定删除此选项吗？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 渲染树节点标题（带操作按钮）
  const renderTreeTitle = (node: DataNode & { raw?: CategoryTreeItem }) => {
    const item = node.raw;
    if (!item) return node.title;
    
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: 8 }}>
        <Space>
          <span style={{ color: item.is_enabled ? undefined : '#999' }}>{item.name}</span>
          {!item.is_enabled && <Tag color="default" style={{ fontSize: 10 }}>禁用</Tag>}
          <Text type="secondary" style={{ fontSize: 12 }}>({item.level}级)</Text>
        </Space>
        <Space size="small" onClick={e => e.stopPropagation()}>
          {item.level < 3 && (
            <Button type="link" size="small" icon={<PlusOutlined />} onClick={() => handleAddTreeItem(item.id)}>
              添加子级
            </Button>
          )}
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditTreeItem(item)}>编辑</Button>
          <Popconfirm title="确定删除此分类吗？" onConfirm={() => handleDeleteTreeItem(item.id)} okText="确定" cancelText="取消">
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      </div>
    );
  };

  // 重新构建带操作的树数据
  const treeDataWithActions = useMemo(() => {
    const items = selectedCategory === '_industry_categories' ? industryCategories 
      : selectedCategory === '_product_categories' ? productCategories 
      : requirementCategories;
    const map = new Map<number, DataNode & { raw: CategoryTreeItem }>();
    const roots: (DataNode & { raw: CategoryTreeItem })[] = [];
    
    items.forEach(item => {
      const node = {
        key: item.id,
        title: null as any,
        children: [] as any[],
        raw: item,
      };
      node.title = renderTreeTitle(node);
      map.set(item.id, node);
    });
    
    items.forEach(item => {
      const node = map.get(item.id)!;
      if (item.parent_id === 0) {
        roots.push(node);
      } else {
        const parent = map.get(item.parent_id);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(node);
        }
      }
    });
    
    return roots;
  }, [selectedCategory, industryCategories, productCategories, requirementCategories]);

  return (
    <div>
      <Card
        title={
          <Space>
            <BookOutlined />
            <span>数据字典管理</span>
          </Space>
        }
      >
        {/* 搜索区域 */}
        <div style={{ marginBottom: 24 }}>
          <Space size="middle" align="center" wrap>
            <Text strong>选择分类：</Text>
            <Select
              showSearch
              allowClear
              style={{ width: 350 }}
              placeholder="请搜索或选择数据字典分类"
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={categoryOptions}
              optionFilterProp="label"
              suffixIcon={<SearchOutlined />}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase()) ||
                (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
              }
              optionRender={(option) => (
                <div>
                  <Space>
                    {option.data.isTree && <ApartmentOutlined style={{ color: '#667eea' }} />}
                    <span>{option.data.label}</span>
                  </Space>
                  <div><Text type="secondary" style={{ fontSize: 12 }}>{option.data.desc}</Text></div>
                </div>
              )}
            />
            {selectedCategory && !isTreeCategory && (
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增选项</Button>
            )}
          </Space>
        </div>

        {/* 分类信息 */}
        {currentCategory && (
          <div style={{ marginBottom: 16, padding: '12px 16px', background: '#f6f8fa', borderRadius: 8 }}>
            <Space direction="vertical" size={4}>
              <Space>
                {isTreeCategory && <ApartmentOutlined style={{ color: '#667eea' }} />}
                <Text strong style={{ fontSize: 15 }}>{currentCategory.name}</Text>
                {isTreeCategory && <Tag color="purple">多级分类</Tag>}
              </Space>
              <Text type="secondary">使用位置：{currentCategory.description}</Text>
              {!isTreeCategory && <Text type="secondary">共 {currentData.length} 个选项</Text>}
            </Space>
          </div>
        )}

        {/* 数据展示 */}
        {selectedCategory ? (
          isTreeCategory ? (
            <Tree
              treeData={treeDataWithActions}
              defaultExpandAll
              blockNode
              style={{ background: '#fafafa', padding: 16, borderRadius: 8 }}
            />
          ) : (
            <Table columns={columns} dataSource={currentData} rowKey="id" pagination={false} size="middle" />
          )
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请先选择一个数据字典分类" style={{ padding: '60px 0' }} />
        )}
      </Card>

      {/* 选项编辑弹窗 */}
      <Modal title={editingItem ? '编辑选项' : '新增选项'} open={modalVisible} onOk={handleSave} onCancel={() => setModalVisible(false)} width={500}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="category" hidden><Input /></Form.Item>
          <Form.Item name="value" label="选项值" rules={[{ required: true, message: '请输入选项值' }]} tooltip="用于程序内部标识，建议使用英文">
            <Input placeholder="如: option_value" disabled={!!editingItem} />
          </Form.Item>
          <Form.Item name="label" label="显示名称" rules={[{ required: true, message: '请输入显示名称' }]}>
            <Input placeholder="如: 选项名称" />
          </Form.Item>
          {needsColor && (
            <Form.Item name="color" label="颜色"><ColorPicker showText /></Form.Item>
          )}
          <Form.Item name="sort_order" label="排序" rules={[{ required: true, message: '请输入排序' }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="is_enabled" label="状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 多级分类编辑弹窗 */}
      <Modal title={editingTreeItem ? '编辑分类' : '新增子分类'} open={treeModalVisible} onOk={handleSaveTreeItem} onCancel={() => setTreeModalVisible(false)} width={500}>
        <Form form={treeForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="parent_id" label="上级分类">
            <TreeSelect
              treeData={buildTreeSelectData(
                currentTreeType === 'industry' ? industryCategories 
                : currentTreeType === 'product' ? productCategories 
                : requirementCategories
              )}
              placeholder="选择上级分类"
              treeDefaultExpandAll
              disabled
            />
          </Form.Item>
          <Form.Item name="name" label="分类名称" rules={[{ required: true, message: '请输入分类名称' }]}>
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item name="level" hidden><InputNumber /></Form.Item>
          <Form.Item name="sort_order" label="排序" rules={[{ required: true, message: '请输入排序' }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="is_enabled" label="状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default DataDictionary;
