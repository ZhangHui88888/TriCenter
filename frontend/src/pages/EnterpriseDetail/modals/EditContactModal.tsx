import { useState, useEffect } from 'react';
import { Modal, Card, Row, Col, Input, Button, Space, Typography, message } from 'antd';
import { StarFilled, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { contactApi } from '@/services/api';

const { Text } = Typography;

interface ContactItem {
  id?: number;
  name: string;
  phone: string;
  position: string;
  isPrimary: boolean;
  email: string;
  wechat: string;
  remark: string;
}

interface EditContactModalProps {
  open: boolean;
  enterpriseId: number;
  initialContacts: any[];
  onClose: () => void;
  onSuccess: (contacts: any[]) => void;
}

export default function EditContactModal({
  open,
  enterpriseId,
  initialContacts,
  onClose,
  onSuccess,
}: EditContactModalProps) {
  const [contacts, setContacts] = useState<ContactItem[]>([]);

  useEffect(() => {
    if (open) {
      setContacts(
        (initialContacts || []).map((c: any) => ({
          id: c.id,
          name: c.name || '',
          phone: c.phone || '',
          position: c.position || '',
          isPrimary: c.is_primary || c.isPrimary || false,
          email: c.email || '',
          wechat: c.wechat || '',
          remark: c.remark || '',
        }))
      );
    }
  }, [open, initialContacts]);

  const handleFieldChange = (index: number, field: string, value: any) => {
    setContacts(prev => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  };

  const handleAdd = () => {
    setContacts(prev => [...prev, { name: '', phone: '', position: '', isPrimary: false, email: '', wechat: '', remark: '' }]);
  };

  const handleRemove = (index: number) => {
    setContacts(prev => prev.filter((_, i) => i !== index));
  };

  const handleOk = async () => {
    const invalid = contacts.some(c => !c.name?.trim() || !c.phone?.trim());
    if (invalid) {
      message.warning('请填写所有联系人的姓名和电话');
      return;
    }
    try {
      await contactApi.update(enterpriseId, contacts);
      onSuccess(
        contacts.map(c => ({ ...c, is_primary: c.isPrimary }))
      );
      message.success('联系人信息更新成功');
      onClose();
    } catch (error: any) {
      message.error(error.message || '更新失败');
    }
  };

  return (
    <Modal
      maskClosable={false}
      title="编辑联系人信息"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="保存"
      cancelText="取消"
      width={720}
    >
      <div style={{ marginTop: 16, maxHeight: 500, overflowY: 'auto', paddingRight: 4 }}>
        {contacts.map((contact, index) => (
          <Card
            key={index}
            size="small"
            style={{
              marginBottom: 12,
              borderRadius: 10,
              border: contact.isPrimary ? '1px solid rgba(102,126,234,0.3)' : '1px solid #f0f0f0',
              background: contact.isPrimary ? 'linear-gradient(135deg, rgba(102,126,234,0.04) 0%, rgba(118,75,162,0.02) 100%)' : '#fff',
            }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{`联系人 ${index + 1}`}</span>
                {contact.isPrimary && (
                  <span style={{ padding: '2px 8px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', borderRadius: 10, fontSize: 11, fontWeight: 500 }}>
                    <StarFilled style={{ marginRight: 3, fontSize: 10 }} />主要
                  </span>
                )}
              </div>
            }
            extra={
              <Space size={4}>
                {!contact.isPrimary && (
                  <Button
                    type="link"
                    size="small"
                    onClick={() => setContacts(prev => prev.map((c, i) => ({ ...c, isPrimary: i === index })))}
                  >
                    设为主要
                  </Button>
                )}
                {contacts.length > 1 && (
                  <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => handleRemove(index)}>
                    删除
                  </Button>
                )}
              </Space>
            }
          >
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>姓名 <span style={{ color: '#ff4d4f' }}>*</span></Text>
                  <Input value={contact.name} placeholder="请输入姓名" onChange={(e) => handleFieldChange(index, 'name', e.target.value)} />
                </div>
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>电话 <span style={{ color: '#ff4d4f' }}>*</span></Text>
                  <Input value={contact.phone} placeholder="请输入电话" onChange={(e) => handleFieldChange(index, 'phone', e.target.value)} />
                </div>
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>职位</Text>
                  <Input value={contact.position} placeholder="请输入职位" onChange={(e) => handleFieldChange(index, 'position', e.target.value)} />
                </div>
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>邮箱</Text>
                  <Input value={contact.email} placeholder="请输入邮箱" onChange={(e) => handleFieldChange(index, 'email', e.target.value)} />
                </div>
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>微信</Text>
                  <Input value={contact.wechat} placeholder="请输入微信号" onChange={(e) => handleFieldChange(index, 'wechat', e.target.value)} />
                </div>
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>备注</Text>
                  <Input value={contact.remark} placeholder="请输入备注" onChange={(e) => handleFieldChange(index, 'remark', e.target.value)} />
                </div>
              </Col>
            </Row>
          </Card>
        ))}
        <Button type="dashed" block icon={<PlusOutlined />} onClick={handleAdd}>添加联系人</Button>
      </div>
    </Modal>
  );
}
