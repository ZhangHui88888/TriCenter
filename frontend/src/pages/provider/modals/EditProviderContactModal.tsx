import { useEffect, useState } from 'react';
import { Button, Card, Col, Input, Modal, Row, Space, Typography, message } from 'antd';
import { DeleteOutlined, PlusOutlined, StarFilled } from '@ant-design/icons';
import { providerApi } from '@/services/api';
import type { ProviderDetail, ProviderEditableContact } from '@/types';
import { buildProviderUpdatePayload, normalizeProviderContacts } from '../utils';

const { Text } = Typography;

type EditProviderContactModalProps = {
  open: boolean;
  provider: ProviderDetail | null;
  onClose: () => void;
  onSuccess: (provider: ProviderDetail) => void;
};

export default function EditProviderContactModal({
  open,
  provider,
  onClose,
  onSuccess,
}: EditProviderContactModalProps) {
  const [contacts, setContacts] = useState<ProviderEditableContact[]>([]);

  useEffect(() => {
    if (open) {
      setContacts(normalizeProviderContacts(provider?.contacts));
    }
  }, [open, provider]);

  const handleFieldChange = (index: number, field: keyof ProviderEditableContact, value: string | boolean) => {
    setContacts((prev) => prev.map((contact, currentIndex) => (
      currentIndex === index ? { ...contact, [field]: value } : contact
    )));
  };

  const handleAdd = () => {
    setContacts((prev) => [
      ...prev,
      {
        name: '',
        phone: '',
        position: '',
        isPrimary: prev.length === 0,
        email: '',
        wechat: '',
        remark: '',
      },
    ]);
  };

  const handleRemove = (index: number) => {
    setContacts((prev) => {
      const next = prev.filter((_, currentIndex) => currentIndex !== index);
      if (next.length > 0 && !next.some((item) => item.isPrimary)) {
        next[0] = { ...next[0], isPrimary: true };
      }
      return next;
    });
  };

  const handleOk = async () => {
    if (!provider) {
      return;
    }

    const hasInvalidContact = contacts.some((contact) => !contact.name.trim() || !contact.phone.trim());
    if (hasInvalidContact) {
      message.warning('请填写所有联系人的姓名和电话');
      return;
    }

    try {
      const payload = buildProviderUpdatePayload(provider, {
        contacts: contacts.map((contact, index) => ({
          id: contact.id,
          name: contact.name.trim(),
          phone: contact.phone.trim(),
          position: contact.position?.trim() || '',
          isPrimary: contact.isPrimary || (!contacts.some((item) => item.isPrimary) && index === 0),
          email: contact.email?.trim() || '',
          wechat: contact.wechat?.trim() || '',
          remark: contact.remark?.trim() || '',
        })),
      });
      await providerApi.update(provider.id, payload);
      const response = await providerApi.getDetail(provider.id);
      onSuccess(response?.data ?? response);
      message.success('联系人信息更新成功');
      onClose();
    } catch (error: any) {
      message.error(error?.message || '更新失败');
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
            key={contact.id ?? index}
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
                    onClick={() => setContacts((prev) => prev.map((item, currentIndex) => ({ ...item, isPrimary: currentIndex === index })))}
                  >
                    设为主要
                  </Button>
                )}
                <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => handleRemove(index)}>
                  删除
                </Button>
              </Space>
            }
          >
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>姓名 <span style={{ color: '#ff4d4f' }}>*</span></Text>
                  <Input value={contact.name} placeholder="请输入姓名" onChange={(event) => handleFieldChange(index, 'name', event.target.value)} />
                </div>
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>电话 <span style={{ color: '#ff4d4f' }}>*</span></Text>
                  <Input value={contact.phone} placeholder="请输入电话" onChange={(event) => handleFieldChange(index, 'phone', event.target.value)} />
                </div>
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>职位</Text>
                  <Input value={contact.position} placeholder="请输入职位" onChange={(event) => handleFieldChange(index, 'position', event.target.value)} />
                </div>
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>邮箱</Text>
                  <Input value={contact.email} placeholder="请输入邮箱" onChange={(event) => handleFieldChange(index, 'email', event.target.value)} />
                </div>
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>微信</Text>
                  <Input value={contact.wechat} placeholder="请输入微信号" onChange={(event) => handleFieldChange(index, 'wechat', event.target.value)} />
                </div>
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>备注</Text>
                  <Input value={contact.remark} placeholder="请输入备注" onChange={(event) => handleFieldChange(index, 'remark', event.target.value)} />
                </div>
              </Col>
            </Row>
          </Card>
        ))}
        <Button type="dashed" block icon={<PlusOutlined />} onClick={handleAdd}>
          添加联系人
        </Button>
      </div>
    </Modal>
  );
}
