import React from 'react';
import { Modal, Form, AutoComplete, message } from 'antd';
import { dictionaryApi } from '@/services/api';
import { makeCustomDictionaryValue } from '../utils';
import request from '@/services/request';

interface ReasonModalProps {
  open: boolean;
  enterpriseId: number;
  reasonType: 'growth' | 'decline';
  editingReason: { index: number; value: string } | null;
  growthReasons: string[];
  declineReasons: string[];
  growthReasonSuggest: { value: string; label: string }[];
  declineReasonSuggest: { value: string; label: string }[];
  onLoadOptions: () => void;
  onClose: () => void;
  onSuccess: (growthReasons: string[], declineReasons: string[]) => void;
}

export default function ReasonModal({
  open,
  enterpriseId,
  reasonType,
  editingReason,
  growthReasons,
  declineReasons,
  growthReasonSuggest,
  declineReasonSuggest,
  onLoadOptions,
  onClose,
  onSuccess,
}: ReasonModalProps) {
  const [form] = Form.useForm();
  const [saving, setSaving] = React.useState(false);

  const handleOk = async () => {
    try {
      await form.validateFields();
    } catch {
      return;
    }
    const raw = form.getFieldValue('reason');
    const text = String(raw ?? '').trim();
    if (!text) {
      message.warning('请输入原因');
      return;
    }
    if (!editingReason && reasonType === 'growth' && growthReasons.includes(text)) {
      message.warning('该增长原因已在列表中');
      return;
    }
    if (!editingReason && reasonType === 'decline' && declineReasons.includes(text)) {
      message.warning('该下降原因已在列表中');
      return;
    }

    const category = reasonType === 'growth' ? 'growth_reason' : 'decline_reason';
    const suggestList = reasonType === 'growth' ? growthReasonSuggest : declineReasonSuggest;
    const isPreset = suggestList.some((o) => o.label === text);

    const doSave = async (addToDict: boolean) => {
      setSaving(true);
      try {
        if (addToDict) {
          await dictionaryApi.addOption(category, {
            value: makeCustomDictionaryValue(),
            label: text,
            sortOrder: 9000 + suggestList.length,
          });
          onLoadOptions();
        }

        let nextGrowth = [...growthReasons];
        let nextDecline = [...declineReasons];
        if (reasonType === 'growth') {
          if (editingReason) {
            nextGrowth = nextGrowth.map((r, i) => (i === editingReason.index ? text : r));
          } else {
            nextGrowth.push(text);
          }
        } else if (editingReason) {
          nextDecline = nextDecline.map((r, i) => (i === editingReason.index ? text : r));
        } else {
          nextDecline.push(text);
        }

        await request.put(`/enterprises/${enterpriseId}`, {
          growthReasons: nextGrowth,
          declineReasons: nextDecline,
        });
        message.success(
          editingReason ? '原因已更新' : addToDict ? '原因已保存，并加入永久预设' : '原因已保存'
        );
        onSuccess(nextGrowth, nextDecline);
        onClose();
        form.resetFields();
      } catch (e: any) {
        message.error(e?.message || '保存失败');
      } finally {
        setSaving(false);
      }
    };

    if (isPreset) {
      await doSave(false);
    } else {
      Modal.confirm({
        title: '新增原因',
        content: `「${text}」不在预设选项中，是否将其加为永久预设？加入后所有企业都可使用该选项。`,
        okText: '加为预设',
        cancelText: '仅本次使用',
        onOk: () => doSave(true),
        onCancel: () => doSave(false),
      });
    }
  };

  return (
    <Modal
      maskClosable={false}
      title={editingReason ? '编辑原因' : '添加原因'}
      open={open}
      confirmLoading={saving}
      onOk={handleOk}
      onCancel={() => { onClose(); form.resetFields(); }}
      okText="保存"
      cancelText="取消"
      width={440}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="reason"
          label={reasonType === 'growth' ? '增长原因' : '下降原因'}
          rules={[{ required: true, message: '请输入或选择原因' }]}
          extra="可从下拉选择预设项，也可直接输入自定义原因。"
        >
          <AutoComplete
            options={reasonType === 'growth' ? growthReasonSuggest : declineReasonSuggest}
            placeholder="选择或输入原因"
            allowClear
            style={{ width: '100%' }}
            filterOption={(inputValue, option) =>
              String(option?.label ?? '')
                .toLowerCase()
                .includes(String(inputValue).toLowerCase())
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
