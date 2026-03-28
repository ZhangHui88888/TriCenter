import { useState, useEffect } from 'react';
import { Modal, Form, Select, Input, Cascader, message } from 'antd';
import request from '@/services/request';

const COUNTRY_OPTIONS = [
  { label: '美国', value: '美国' }, { label: '加拿大', value: '加拿大' },
  { label: '英国', value: '英国' }, { label: '德国', value: '德国' },
  { label: '法国', value: '法国' }, { label: '日本', value: '日本' },
  { label: '韩国', value: '韩国' }, { label: '澳大利亚', value: '澳大利亚' },
  { label: '新加坡', value: '新加坡' }, { label: '马来西亚', value: '马来西亚' },
  { label: '泰国', value: '泰国' }, { label: '越南', value: '越南' },
  { label: '印度', value: '印度' }, { label: '阿联酋', value: '阿联酋' },
];

const REGION_OPTIONS = [
  { label: '北美', value: '北美' }, { label: '欧洲', value: '欧洲' },
  { label: '东南亚', value: '东南亚' }, { label: '东亚', value: '东亚' },
  { label: '南亚', value: '南亚' }, { label: '中东', value: '中东' },
  { label: '非洲', value: '非洲' }, { label: '南美', value: '南美' },
  { label: '大洋洲', value: '大洋洲' },
];

const CATEGORY_OPTIONS = [
  {
    value: 1, label: '园艺工具',
    children: [
      { value: 101, label: '园艺手工具', children: [
        { value: 10101, label: '铲子' }, { value: 10102, label: '剪刀' },
        { value: 10103, label: '耙子' }, { value: 10104, label: '锄头' },
      ]},
      { value: 102, label: '园艺电动工具' }, { value: 103, label: '园艺装饰品' },
      { value: 104, label: '花盆花器' }, { value: 105, label: '灌溉设备' },
    ],
  },
  {
    value: 2, label: '电动工具',
    children: [
      { value: 201, label: '电钻' }, { value: 202, label: '电锯' },
      { value: 203, label: '角磨机' }, { value: 204, label: '电动扳手' },
      { value: 205, label: '抛光机' },
    ],
  },
  {
    value: 3, label: '家居用品',
    children: [
      { value: 301, label: '厨房用品' }, { value: 302, label: '卫浴用品' },
      { value: 303, label: '收纳整理' }, { value: 304, label: '家居装饰' },
      { value: 305, label: '清洁用品' },
    ],
  },
  {
    value: 4, label: '户外运动',
    children: [
      { value: 401, label: '露营装备' }, { value: 402, label: '运动器材' },
      { value: 403, label: '户外服装' }, { value: 404, label: '登山装备' },
    ],
  },
  {
    value: 6, label: '电子产品',
    children: [
      { value: 601, label: '消费电子' }, { value: 602, label: '智能硬件' },
      { value: 603, label: '电子配件' }, { value: 604, label: '照明产品' },
    ],
  },
];

function findCategoryPath(options: any[], targetPath: any[], currentPath: string[] = []): string | null {
  for (const option of options) {
    const newPath = [...currentPath, option.label];
    if (option.value === targetPath[targetPath.length - 1]) return newPath.join(' > ');
    if (option.children) {
      const result = findCategoryPath(option.children, targetPath, newPath);
      if (result) return result;
    }
  }
  return null;
}

interface TradeChangeModalProps {
  open: boolean;
  enterpriseId: number;
  changeType: 'market' | 'mode' | 'category';
  changeDirection: 'up' | 'down';
  editingItem: { name: string; rate: string } | null;
  marketChanges: { up: any[]; down: any[] };
  modeChanges: { up: any[]; down: any[] };
  categoryChanges: { up: any[]; down: any[] };
  onClose: () => void;
  onSuccess: (
    nextMarket: { up: any[]; down: any[] },
    nextMode: { up: any[]; down: any[] },
    nextCategory: { up: any[]; down: any[] },
  ) => void;
}

export default function TradeChangeModal({
  open,
  enterpriseId,
  changeType,
  changeDirection,
  editingItem,
  marketChanges,
  modeChanges,
  categoryChanges,
  onClose,
  onSuccess,
}: TradeChangeModalProps) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && editingItem) {
      const rateVal = String(editingItem.rate ?? '').replace(/%$/, '');
      form.setFieldsValue({ ...editingItem, rate: rateVal });
    }
    if (!open) form.resetFields();
  }, [open, editingItem, form]);

  const handleOk = async () => {
    let values: any;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    let nextM = marketChanges;
    let nextMo = modeChanges;
    let nextC = categoryChanges;
    const dir = changeDirection;
    const rateRaw = String(values.rate ?? '').trim();
    const rateNormalized = rateRaw.endsWith('%') ? rateRaw : `${rateRaw}%`;

    if (changeType === 'market') {
      const newItem = { type: values.type || 'region', name: values.name, rate: rateNormalized };
      if (editingItem) {
        nextM = { ...marketChanges, [dir]: marketChanges[dir].map((item) => item.name === editingItem.name ? newItem : item) };
      } else {
        nextM = { ...marketChanges, [dir]: [...marketChanges[dir], newItem] };
      }
    } else if (changeType === 'mode') {
      const newItem = { name: values.name, rate: rateNormalized };
      if (editingItem) {
        nextMo = { ...modeChanges, [dir]: modeChanges[dir].map((item) => item.name === editingItem.name ? newItem : item) };
      } else {
        nextMo = { ...modeChanges, [dir]: [...modeChanges[dir], newItem] };
      }
    } else {
      let categoryName = '';
      if (values.category) {
        categoryName = findCategoryPath(CATEGORY_OPTIONS, values.category) || '未知品类';
      }
      const newItem = { name: categoryName, rate: rateNormalized };
      if (editingItem) {
        nextC = { ...categoryChanges, [dir]: categoryChanges[dir].map((item) => item.name === editingItem.name ? newItem : item) };
      } else {
        nextC = { ...categoryChanges, [dir]: [...categoryChanges[dir], newItem] };
      }
    }

    setSaving(true);
    try {
      await request.put(`/enterprises/${enterpriseId}`, {
        marketChanges: nextM, modeChanges: nextMo, categoryChanges: nextC,
      });
      message.success(editingItem ? '修改成功' : '添加成功');
      onSuccess(nextM, nextMo, nextC);
      onClose();
    } catch (e: any) {
      message.error(e?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      maskClosable={false}
      title={editingItem ? '编辑' : '添加'}
      open={open}
      confirmLoading={saving}
      onOk={handleOk}
      onCancel={onClose}
      okText="保存"
      cancelText="取消"
      width={400}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        {changeType === 'market' ? (
          <>
            <Form.Item name="type" label="市场类型" rules={[{ required: true, message: '请选择市场类型' }]} initialValue="region">
              <Select placeholder="请选择市场类型" options={[{ label: '区域', value: 'region' }, { label: '国家', value: 'country' }]} />
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.type !== cur.type}>
              {({ getFieldValue }) => (
                <Form.Item name="name" label={getFieldValue('type') === 'country' ? '国家' : '区域'} rules={[{ required: true, message: '请选择' }]}>
                  <Select
                    placeholder={getFieldValue('type') === 'country' ? '请选择国家' : '请选择区域'}
                    options={getFieldValue('type') === 'country' ? COUNTRY_OPTIONS : REGION_OPTIONS}
                  />
                </Form.Item>
              )}
            </Form.Item>
          </>
        ) : changeType === 'category' ? (
          <Form.Item name="category" label="产品品类" rules={[{ required: true, message: '请选择品类' }]}>
            <Cascader
              placeholder="请选择产品品类"
              options={CATEGORY_OPTIONS}
              showSearch
              displayRender={(labels) => labels.join(' > ')}
            />
          </Form.Item>
        ) : (
          <Form.Item name="name" label="模式名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="请输入名称" />
          </Form.Item>
        )}
        <Form.Item name="rate" label="变化率" rules={[{ required: true, message: '请输入变化率' }]}>
          <Input placeholder={changeDirection === 'up' ? '例如: +25' : '例如: -8'} addonAfter="%" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
