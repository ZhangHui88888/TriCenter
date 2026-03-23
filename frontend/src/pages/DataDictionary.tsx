import { useState, useMemo, useEffect } from 'react';
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
  Spin,
  Alert,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  SearchOutlined,
  ApartmentOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';
import { dictionaryCategories, type DictionaryItem, type DictionaryCategory } from '@/data/dictionaryData';
import { dimensions as personaDimensions } from '@/data/requirementsData';
import { optionsApi, dictionaryApi, requirementItemAdminApi, treeCategoryApi, type TreeCategoryItem } from '@/services/api';

const { Text } = Typography;

// BankDash 色系
const C = { blue: '#396AFF', teal: '#16DBCC', pink: '#FE5C73', yellow: '#FFBB38', purple: '#7B61FF', textDark: '#343C6A', textMuted: '#718EBF' };
const cardStyle = { borderRadius: 25, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' };

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

/** 数据字典「需求项与画像维度」行 */
interface RequirementAdminRow {
  id: string;
  name: string;
  phase: string;
  category: string;
  sortOrder?: number;
  dimensions?: Record<string, string[]>;
}

const TREE_CATEGORY_KEYS = ['_industry_categories', '_product_categories', '_requirement_categories'] as const;

/** API 响应 → 前端 CategoryTreeItem 映射 */
const mapApiToTreeItem = (item: TreeCategoryItem): CategoryTreeItem => ({
  id: item.id,
  parent_id: item.parentId ?? 0,
  name: item.name,
  level: item.level,
  path: item.path ?? '',
  sort_order: item.sortOrder ?? 0,
  is_enabled: item.isEnabled === 1,
});

function DataDictionary() {
  const [remoteFlatItems, setRemoteFlatItems] = useState<DictionaryItem[]>([]);
  const [flatLoading, setFlatLoading] = useState(false);
  const [categories] = useState<DictionaryCategory[]>(dictionaryCategories);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<DictionaryItem | null>(null);
  const [form] = Form.useForm();
  
  // 多级分类状态
  const [industryCategories, setIndustryCategories] = useState<CategoryTreeItem[]>([]);
  const [productCategories, setProductCategories] = useState<CategoryTreeItem[]>([]);
  const [requirementCategories, setRequirementCategories] = useState<CategoryTreeItem[]>([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const [treeModalVisible, setTreeModalVisible] = useState(false);
  const [editingTreeItem, setEditingTreeItem] = useState<CategoryTreeItem | null>(null);
  const [treeForm] = Form.useForm();
  const [currentTreeType, setCurrentTreeType] = useState<'industry' | 'product' | 'requirement'>('industry');

  const [requirementRows, setRequirementRows] = useState<RequirementAdminRow[]>([]);
  const [reqItemsLoading, setReqItemsLoading] = useState(false);
  const [reqDimensionModalOpen, setReqDimensionModalOpen] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<RequirementAdminRow | null>(null);
  const [reqDimensionSaving, setReqDimensionSaving] = useState(false);
  const [reqDimensionForm] = Form.useForm();

  const isTreeCategory = selectedCategory != null && TREE_CATEGORY_KEYS.includes(selectedCategory as typeof TREE_CATEGORY_KEYS[number]);
  const isRequirementItemsCategory = selectedCategory === '_requirement_items';
  const treeType =
    selectedCategory === '_industry_categories'
      ? 'industry'
      : selectedCategory === '_product_categories'
        ? 'product'
        : 'requirement';

  // 平面字典分类：从后端 system_options 加载
  useEffect(() => {
    if (!selectedCategory || isTreeCategory || isRequirementItemsCategory) {
      setRemoteFlatItems([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setFlatLoading(true);
      try {
        const res = await optionsApi.getOptions(selectedCategory);
        if (cancelled) return;
        const list = (res.data || []).map((o: any) => ({
          id: o.id,
          category: selectedCategory,
          value: o.value,
          label: o.label,
          color: o.color,
          sort_order: o.sortOrder ?? 0,
          is_enabled: o.isEnabled === 1,
          created_at: '—',
        })) as DictionaryItem[];
        setRemoteFlatItems(list);
      } catch {
        if (!cancelled) {
          message.error('加载字典选项失败');
          setRemoteFlatItems([]);
        }
      } finally {
        if (!cancelled) setFlatLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedCategory, isTreeCategory, isRequirementItemsCategory]);

  // 树形分类：从后端加载
  const loadTreeData = async (type: 'industry' | 'product' | 'requirement') => {
    setTreeLoading(true);
    try {
      const res = await treeCategoryApi.list(type);
      const items = ((res as any).data || []).map(mapApiToTreeItem);
      const setter = type === 'industry' ? setIndustryCategories
        : type === 'product' ? setProductCategories
        : setRequirementCategories;
      setter(items);
    } catch {
      message.error('加载分类数据失败');
    } finally {
      setTreeLoading(false);
    }
  };

  useEffect(() => {
    if (!isTreeCategory) return;
    loadTreeData(treeType);
  }, [selectedCategory, isTreeCategory]);

  // 需求项 + 画像维度（requirement_dimension_mapping）
  useEffect(() => {
    if (selectedCategory !== '_requirement_items') {
      setRequirementRows([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setReqItemsLoading(true);
      try {
        const res = (await requirementItemAdminApi.list()) as { data?: unknown[] };
        if (cancelled) return;
        const list = Array.isArray(res.data) ? res.data : [];
        setRequirementRows(
          list.map((item) => {
            const r = item as Record<string, unknown>;
            return {
              id: String(r.id ?? ''),
              name: String(r.name ?? ''),
              phase: String(r.phase ?? ''),
              category: String(r.category ?? ''),
              sortOrder: typeof r.sortOrder === 'number' ? r.sortOrder : undefined,
              dimensions:
                r.dimensions && typeof r.dimensions === 'object' && r.dimensions !== null
                  ? (r.dimensions as Record<string, string[]>)
                  : {},
            };
          }),
        );
      } catch {
        if (!cancelled) {
          message.error('加载需求项失败');
          setRequirementRows([]);
        }
      } finally {
        if (!cancelled) setReqItemsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedCategory]);

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
      {
        value: '_industry_categories',
        label: '行业分类 (多级)',
        desc: '企业主表 industry_id 关联，数据存储于 industry_categories 表',
        isTree: true,
      },
      {
        value: '_product_categories',
        label: '产品品类 (多级)',
        desc: '企业产品 category_id 关联，数据存储于 product_categories 表',
        isTree: true,
      },
      {
        value: '_requirement_categories',
        label: '需求管理 (多级)',
        desc: '需求阶段/分类/条目的多级管理，数据存储于 requirement_categories 表',
        isTree: true,
      },
      {
        value: '_requirement_items',
        label: '需求项与画像维度',
        desc: '每条标准需求可配置企业类型、目标模式等五维，写入 requirement_dimension_mapping，并参与企业列表「按需求筛选」',
        isTree: false,
      },
    );
    return options;
  }, [categories]);

  // 当前分类的数据
  const currentData = useMemo(() => {
    if (!selectedCategory || isTreeCategory || isRequirementItemsCategory) return [];
    return [...remoteFlatItems].sort((a, b) => a.sort_order - b.sort_order);
  }, [remoteFlatItems, selectedCategory, isTreeCategory, isRequirementItemsCategory]);

  // 当前分类信息
  const currentCategory = useMemo(() => {
    if (isRequirementItemsCategory) {
      return {
        key: '_requirement_items',
        name: '需求项与画像维度',
        description: '标准需求项（requirements 表）与五维画像的对应关系，落库 requirement_dimension_mapping',
      };
    }
    if (isTreeCategory) {
      if (selectedCategory === '_industry_categories') {
        return { key: '_industry_categories', name: '行业分类', description: '企业主表.industry_id' };
      } else if (selectedCategory === '_product_categories') {
        return { key: '_product_categories', name: '产品品类', description: '企业产品.category_id' };
      } else {
        return {
          key: '_requirement_categories',
          name: '需求管理',
          description: 'requirement_categories 表',
        };
      }
    }
    return categories.find(c => c.key === selectedCategory);
  }, [selectedCategory, categories, isTreeCategory, isRequirementItemsCategory]);

  // 是否需要颜色字段
  const needsColor = selectedCategory === 'stage';

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
  const handleDelete = async (id: number) => {
    if (!selectedCategory || isTreeCategory) return;
    try {
      await dictionaryApi.deleteOption(selectedCategory, id);
      message.success('删除成功');
      setRemoteFlatItems(prev => prev.filter(item => item.id !== id));
    } catch {
      message.error('删除失败');
    }
  };

  // 切换启用状态
  const handleToggleEnabled = async (record: DictionaryItem) => {
    if (!selectedCategory || isTreeCategory) return;
    try {
      await dictionaryApi.updateOption(selectedCategory, record.id, {
        isEnabled: record.is_enabled ? 0 : 1,
      });
      setRemoteFlatItems(prev =>
        prev.map(item =>
          item.id === record.id ? { ...item, is_enabled: !item.is_enabled } : item
        )
      );
      message.success(record.is_enabled ? '已禁用' : '已启用');
    } catch {
      message.error('更新状态失败');
    }
  };

  // 保存
  const handleSave = async () => {
    if (!selectedCategory || isTreeCategory) return;
    try {
      const values = await form.validateFields();
      const colorValue = values.color?.toHexString ? values.color.toHexString() : values.color;

      if (editingItem) {
        await dictionaryApi.updateOption(selectedCategory, editingItem.id, {
          label: values.label,
          color: needsColor ? colorValue : undefined,
          sortOrder: values.sort_order,
          isEnabled: values.is_enabled ? 1 : 0,
        });
        message.success('修改成功');
      } else {
        await dictionaryApi.addOption(selectedCategory, {
          value: values.value,
          label: values.label,
          color: needsColor ? colorValue : undefined,
          sortOrder: values.sort_order,
          isEnabled: values.is_enabled ? 1 : 0,
        });
        message.success('添加成功');
      }
      const res = await optionsApi.getOptions(selectedCategory);
      const list = (res.data || []).map((o: any) => ({
        id: o.id,
        category: selectedCategory,
        value: o.value,
        label: o.label,
        color: o.color,
        sort_order: o.sortOrder ?? 0,
        is_enabled: o.isEnabled === 1,
        created_at: '—',
      })) as DictionaryItem[];
      setRemoteFlatItems(list);
      setModalVisible(false);
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(error?.message || '保存失败');
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

  const handleDeleteTreeItem = async (id: number) => {
    try {
      await treeCategoryApi.delete(treeType, id);
      message.success('删除成功');
      await loadTreeData(treeType);
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || '删除失败');
    }
  };

  const handleSaveTreeItem = async () => {
    try {
      const values = await treeForm.validateFields();
      if (editingTreeItem) {
        await treeCategoryApi.update(currentTreeType, editingTreeItem.id, {
          name: values.name,
          sortOrder: values.sort_order,
          isEnabled: values.is_enabled,
        });
        message.success('修改成功');
      } else {
        await treeCategoryApi.create(currentTreeType, {
          parentId: values.parent_id ?? 0,
          name: values.name,
          sortOrder: values.sort_order,
          isEnabled: values.is_enabled,
        });
        message.success('添加成功');
      }
      setTreeModalVisible(false);
      await loadTreeData(currentTreeType);
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(error?.response?.data?.message || error?.message || '保存失败');
    }
  };

  const handleResetTreeToDefault = async () => {
    try {
      setTreeLoading(true);
      await treeCategoryApi.resetToDefault(treeType);
      message.success('已恢复默认数据');
      await loadTreeData(treeType);
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || '恢复失败');
    } finally {
      setTreeLoading(false);
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
          <Button type="link" size="small" onClick={() => void handleToggleEnabled(record)}>{record.is_enabled ? '禁用' : '启用'}</Button>
          <Popconfirm title="确定删除此选项吗？" onConfirm={() => void handleDelete(record.id)} okText="确定" cancelText="取消">
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
          <span style={{ color: item.is_enabled ? C.textDark : C.textMuted }}>{item.name}</span>
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

  const summarizeDimensions = (d?: Record<string, string[]>) => {
    if (!d || Object.keys(d).length === 0) return '—';
    const parts: string[] = [];
    personaDimensions.forEach((dim) => {
      const vals = d[dim.key];
      if (vals && vals.length) parts.push(`${dim.name} ${vals.length}项`);
    });
    return parts.length ? parts.join('；') : '—';
  };

  const openEditRequirementDimensions = (row: RequirementAdminRow) => {
    setEditingRequirement(row);
    const init: Record<string, unknown> = {};
    personaDimensions.forEach((d) => {
      const vals = row.dimensions?.[d.key];
      if (d.multiple) {
        init[d.key] = vals && vals.length ? [...vals] : [];
      } else {
        init[d.key] = vals && vals.length ? vals[0] : undefined;
      }
    });
    reqDimensionForm.setFieldsValue(init);
    setReqDimensionModalOpen(true);
  };

  const reloadRequirementRows = async () => {
    const res = (await requirementItemAdminApi.list()) as { data?: unknown[] };
    const list = Array.isArray(res.data) ? res.data : [];
    setRequirementRows(
      list.map((item) => {
        const r = item as Record<string, unknown>;
        return {
          id: String(r.id ?? ''),
          name: String(r.name ?? ''),
          phase: String(r.phase ?? ''),
          category: String(r.category ?? ''),
          sortOrder: typeof r.sortOrder === 'number' ? r.sortOrder : undefined,
          dimensions:
            r.dimensions && typeof r.dimensions === 'object' && r.dimensions !== null
              ? (r.dimensions as Record<string, string[]>)
              : {},
        };
      }),
    );
  };

  const handleSaveRequirementDimensions = async () => {
    if (!editingRequirement) return;
    try {
      const values = await reqDimensionForm.validateFields();
      const body: Record<string, string[]> = {};
      personaDimensions.forEach((d) => {
        const v = values[d.key];
        if (d.multiple) {
          body[d.key] = Array.isArray(v) ? v.filter((x: unknown) => x != null && x !== '') : [];
        } else {
          body[d.key] = v != null && v !== '' ? [String(v)] : [];
        }
      });
      setReqDimensionSaving(true);
      await requirementItemAdminApi.putDimensions(editingRequirement.id, body);
      message.success('画像维度已保存');
      setReqDimensionModalOpen(false);
      await reloadRequirementRows();
    } catch (e: unknown) {
      const err = e as { errorFields?: unknown; message?: string };
      if (err?.errorFields) return;
      message.error(err?.message || '保存失败');
    } finally {
      setReqDimensionSaving(false);
    }
  };

  const requirementItemColumns: ColumnsType<RequirementAdminRow> = [
    { title: '需求ID', dataIndex: 'id', width: 100, render: (t: string) => <Text code>{t}</Text> },
    { title: '名称', dataIndex: 'name', width: 220, ellipsis: true },
    { title: '阶段', dataIndex: 'phase', width: 200, ellipsis: true },
    { title: '分类', dataIndex: 'category', width: 140, ellipsis: true },
    {
      title: '画像维度配置',
      key: 'dims',
      ellipsis: true,
      render: (_, row) => <Text type="secondary">{summarizeDimensions(row.dimensions)}</Text>,
    },
    {
      title: '操作',
      key: 'act',
      width: 100,
      render: (_, row) => (
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditRequirementDimensions(row)}>
          编辑维度
        </Button>
      ),
    },
  ];

  return (
    <div style={{ background: '#F5F7FA', minHeight: '100%', padding: 24, fontFamily: 'Inter, sans-serif' }}>
      <Card
        title={
          <Space>
            <BookOutlined style={{ color: C.blue }} />
            <span style={{ fontWeight: 600, color: C.textDark }}>数据字典管理</span>
          </Space>
        }
        style={cardStyle}
        styles={{ body: { padding: '20px 24px' } }}
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
              styles={{ root: { borderRadius: 12, backgroundColor: '#F5F7FA' } }}
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
                    {option.data.isTree && <ApartmentOutlined style={{ color: C.purple }} />}
                    <span>{option.data.label}</span>
                  </Space>
                  <div><Text type="secondary" style={{ fontSize: 12 }}>{option.data.desc}</Text></div>
                </div>
              )}
            />
            {selectedCategory && !isTreeCategory && !isRequirementItemsCategory && (
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ background: C.blue, borderColor: C.blue, borderRadius: 12 }}>新增选项</Button>
            )}
          </Space>
        </div>

        {/* 分类信息 */}
        {currentCategory && (
          <div style={{ marginBottom: 16, padding: '12px 16px', background: '#F5F7FA', borderRadius: 12 }}>
            <Space direction="vertical" size={4}>
              <Space>
                {isTreeCategory && <ApartmentOutlined style={{ color: C.purple }} />}
                <Text strong style={{ fontSize: 15 }}>{currentCategory.name}</Text>
                {isTreeCategory && <Tag color="purple">多级分类</Tag>}
                {isTreeCategory && (
                  <Popconfirm title="确定恢复默认数据？当前数据将被清空并重置。" onConfirm={() => void handleResetTreeToDefault()} okText="确定恢复" cancelText="取消" okButtonProps={{ danger: true }}>
                    <Button size="small" icon={<UndoOutlined />} style={{ borderRadius: 8 }}>恢复默认</Button>
                  </Popconfirm>
                )}
                {isRequirementItemsCategory && <Tag color="blue">落库映射</Tag>}
              </Space>
              <Text type="secondary">使用位置：{currentCategory.description}</Text>
              {!isTreeCategory && !isRequirementItemsCategory && (
                <Text type="secondary">共 {currentData.length} 个选项</Text>
              )}
              {isRequirementItemsCategory && (
                <Text type="secondary">共 {requirementRows.length} 条标准需求</Text>
              )}
            </Space>
          </div>
        )}

        {isRequirementItemsCategory && (
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16, borderRadius: 12 }}
            message="与企业详情「企业画像维度选择」使用同一套维度键"
            description="勾选某企业类型（如生产型、工贸一体）时，会推荐此处为该类型勾选了对应维度的需求项。首启若映射表为空，后端会用当前代码中的默认关系自动种子一次，之后以本页保存为准。"
          />
        )}

        {/* 数据展示 */}
        {selectedCategory ? (
          isRequirementItemsCategory ? (
            <Spin spinning={reqItemsLoading}>
              <Table
                columns={requirementItemColumns}
                dataSource={requirementRows}
                rowKey="id"
                pagination={{ pageSize: 20, showSizeChanger: true }}
                size="middle"
                scroll={{ x: 900 }}
              />
            </Spin>
          ) : isTreeCategory ? (
            <Spin spinning={treeLoading}>
              <Tree
                treeData={treeDataWithActions}
                defaultExpandAll
                blockNode
                style={{ background: '#F5F7FA', padding: 16, borderRadius: 12 }}
              />
            </Spin>
          ) : (
            <Spin spinning={flatLoading}>
              <Table columns={columns} dataSource={currentData} rowKey="id" pagination={false} size="middle" />
            </Spin>
          )
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请先选择一个数据字典分类" style={{ padding: '60px 0' }} />
        )}
      </Card>

      {/* 选项编辑弹窗 */}
      <Modal title={editingItem ? '编辑选项' : '新增选项'} open={modalVisible} onOk={handleSave} onCancel={() => setModalVisible(false)} width={500} okButtonProps={{ style: { background: C.blue, borderColor: C.blue } }}>
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

      <Modal
        title={editingRequirement ? `编辑画像维度 — ${editingRequirement.id}` : '编辑画像维度'}
        open={reqDimensionModalOpen}
        onOk={() => void handleSaveRequirementDimensions()}
        onCancel={() => {
          setReqDimensionModalOpen(false);
          setEditingRequirement(null);
          reqDimensionForm.resetFields();
        }}
        width={720}
        confirmLoading={reqDimensionSaving}
        okText="保存"
        cancelText="取消"
        okButtonProps={{ style: { background: C.blue, borderColor: C.blue } }}
      >
        <div style={{ marginBottom: 12 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {editingRequirement?.name}
          </Text>
        </div>
        <Form form={reqDimensionForm} layout="vertical">
          <Row gutter={16}>
            {personaDimensions.map((dim) => (
              <Col span={dim.key === 'ecommerceExp' ? 24 : 12} key={dim.key}>
                <Form.Item
                  name={dim.key}
                  label={
                    <span>
                      {dim.name}
                      <Text type="secondary" style={{ fontSize: 12, marginLeft: 6 }}>
                        {dim.multiple ? '（可多选）' : '（单选）'}
                      </Text>
                    </span>
                  }
                >
                  <Select
                    mode={dim.multiple ? 'multiple' : undefined}
                    allowClear
                    placeholder={`请选择${dim.name}`}
                    options={dim.options.map((o) => ({
                      value: o.value,
                      label: o.description ? `${o.label} — ${o.description}` : o.label,
                    }))}
                    showSearch={dim.multiple}
                    optionFilterProp="label"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            ))}
          </Row>
        </Form>
      </Modal>

      {/* 多级分类编辑弹窗 */}
      <Modal title={editingTreeItem ? '编辑分类' : '新增子分类'} open={treeModalVisible} onOk={handleSaveTreeItem} onCancel={() => setTreeModalVisible(false)} width={500} okButtonProps={{ style: { background: C.blue, borderColor: C.blue } }}>
        <Form form={treeForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="parent_id"
            label="上级分类"
            extra={
              editingTreeItem
                ? '编辑时不支持调整上级。如需改变层级关系，请删除后重建。'
                : '新增时可选择上级；最多 3 级。'
            }
          >
            <TreeSelect
              treeData={buildTreeSelectData(
                currentTreeType === 'industry' ? industryCategories 
                : currentTreeType === 'product' ? productCategories 
                : requirementCategories
              )}
              placeholder="选择上级分类"
              treeDefaultExpandAll
              disabled={!!editingTreeItem}
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
