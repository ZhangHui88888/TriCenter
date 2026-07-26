import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { EditOutlined, KeyOutlined, PlusOutlined, TeamOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { adminUserApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import type { AdminUser, AdminUserFormValues, CityInfo } from '@/types/auth';

const { Title, Text } = Typography;

const roleOptions = [
  { label: '系统管理员', value: 'admin' },
  { label: '业务经理', value: 'manager' },
  { label: '普通用户', value: 'user' },
];

const roleLabels: Record<string, string> = {
  admin: '系统管理员',
  manager: '业务经理',
  user: '普通用户',
};

export default function UserManagement() {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [cities, setCities] = useState<CityInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [resetting, setResetting] = useState<AdminUser | null>(null);
  const [form] = Form.useForm<AdminUserFormValues>();
  const [passwordForm] = Form.useForm<{ newPassword: string }>();

  const loadData = async () => {
    setLoading(true);
    try {
      const [userResponse, cityResponse] = await Promise.all([
        adminUserApi.getList(),
        adminUserApi.getCities(),
      ]);
      setUsers(userResponse.data as AdminUser[]);
      setCities(cityResponse.data as CityInfo[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ role: 'user', status: 1, cityIds: [] });
    setEditorOpen(true);
  };

  const openEdit = (user: AdminUser) => {
    setEditing(user);
    form.setFieldsValue({
      name: user.name,
      role: user.role,
      phone: user.phone,
      email: user.email,
      status: user.status,
      cityIds: user.cityIds,
    });
    setEditorOpen(true);
  };

  const saveUser = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editing) {
        await adminUserApi.update(editing.id, values);
        message.success('用户信息与城市权限已更新');
      } else {
        await adminUserApi.create(values);
        message.success('用户已创建');
      }
      setEditorOpen(false);
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  const resetPassword = async () => {
    if (!resetting) return;
    const { newPassword } = await passwordForm.validateFields();
    setSaving(true);
    try {
      await adminUserApi.resetPassword(resetting.id, newPassword);
      message.success(`已重置 ${resetting.username} 的密码`);
      setResetting(null);
      passwordForm.resetFields();
    } finally {
      setSaving(false);
    }
  };

  const cityOptions = useMemo(
    () => cities.map((city) => ({ label: city.name, value: city.id })),
    [cities],
  );

  const columns: ColumnsType<AdminUser> = [
    {
      title: '账号',
      dataIndex: 'username',
      render: (value, row) => (
        <Space direction="vertical" size={0}>
          <Text strong>{value}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{row.name}</Text>
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      render: (role: string) => <Tag color={role === 'admin' ? 'blue' : role === 'manager' ? 'cyan' : 'default'}>{roleLabels[role] || role}</Tag>,
    },
    {
      title: '城市权限',
      dataIndex: 'cities',
      render: (items: CityInfo[]) => <Space wrap>{items.map((city) => <Tag key={city.id}>{city.name}</Tag>)}</Space>,
    },
    {
      title: '联系方式',
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Text>{row.phone || '-'}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{row.email || '-'}</Text>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (status: number) => <Tag color={status === 1 ? 'success' : 'default'}>{status === 1 ? '启用' : '停用'}</Tag>,
    },
    {
      title: '操作',
      width: 190,
      render: (_, row) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(row)}>编辑</Button>
          <Button
            type="link"
            icon={<KeyOutlined />}
            onClick={() => {
              passwordForm.resetFields();
              setResetting(row);
            }}
          >
            重置密码
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ borderRadius: 20, border: 'none', marginBottom: 20 }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <TeamOutlined style={{ fontSize: 26, color: '#396AFF' }} />
            <div>
              <Title level={3} style={{ margin: 0 }}>用户与城市权限</Title>
              <Text type="secondary">管理员维护账号、角色与可访问城市；用户名全局唯一。</Text>
            </div>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增用户</Button>
        </Space>
      </Card>

      <Card style={{ borderRadius: 20, border: 'none' }}>
        <Table rowKey="id" columns={columns} dataSource={users} loading={loading} pagination={false} />
      </Card>

      <Modal
        title={editing ? `编辑用户：${editing.username}` : '新增用户'}
        open={editorOpen}
        confirmLoading={saving}
        onOk={() => void saveUser()}
        onCancel={() => setEditorOpen(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" preserve={false}>
          {!editing && (
            <>
              <Form.Item name="username" label="用户名" rules={[{ required: true }, { max: 50 }]}>
                <Input autoComplete="off" />
              </Form.Item>
              <Form.Item name="password" label="初始密码" rules={[{ required: true }, { min: 6, max: 72 }]}>
                <Input.Password autoComplete="new-password" />
              </Form.Item>
            </>
          )}
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true }]}><Select options={roleOptions} /></Form.Item>
          <Space size={12} style={{ width: '100%' }}>
            <Form.Item name="phone" label="手机号" style={{ flex: 1 }}><Input /></Form.Item>
            <Form.Item name="email" label="邮箱" rules={[{ type: 'email' }]} style={{ flex: 1 }}><Input /></Form.Item>
          </Space>
          <Form.Item name="cityIds" label="城市权限" rules={[{ required: true, type: 'array', min: 1, message: '至少选择一个城市' }]}>
            <Select mode="multiple" options={cityOptions} placeholder="请选择城市" />
          </Form.Item>
          <Form.Item name="status" label="账号状态" rules={[{ required: true }]}>
            <Select
              disabled={editing?.id === currentUserId}
              options={[{ label: '启用', value: 1 }, { label: '停用', value: 0 }]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`重置密码：${resetting?.username || ''}`}
        open={Boolean(resetting)}
        confirmLoading={saving}
        onOk={() => void resetPassword()}
        onCancel={() => setResetting(null)}
        okText="确认重置"
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item name="newPassword" label="新密码" rules={[{ required: true }, { min: 6, max: 72 }]}>
            <Input.Password autoComplete="new-password" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
