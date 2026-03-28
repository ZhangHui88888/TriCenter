import { useEffect } from 'react';
import { Modal, Form, Row, Col, Select, DatePicker, Input, message } from 'antd';
import dayjs from 'dayjs';
import { FOLLOW_UP_TYPES } from '@/utils/constants';
import { enterpriseApi } from '@/services/api';
import { FUNNEL_STAGES } from '../constants';
import request from '@/services/request';

interface FollowUpRecord {
  id: number;
  follow_up_type?: string;
  follow_up_date?: string;
  content?: string;
  overall_status?: string;
  next_step?: string;
  stage_after?: string;
}

interface FollowUpModalProps {
  open: boolean;
  enterpriseId: number;
  editingRecord: FollowUpRecord | null;
  onClose: () => void;
  onSuccess: (stageChanged?: { stage: string; stageName: string; stageColor: string }) => void;
}

export default function FollowUpModal({
  open,
  enterpriseId,
  editingRecord,
  onClose,
  onSuccess,
}: FollowUpModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && editingRecord) {
      form.setFieldsValue({
        follow_up_type: editingRecord.follow_up_type,
        follow_up_date: editingRecord.follow_up_date ? dayjs(editingRecord.follow_up_date) : null,
        content: editingRecord.content,
        overall_status: editingRecord.overall_status,
        next_step: editingRecord.next_step,
        stage_after: editingRecord.stage_after,
      });
    } else if (!open) {
      form.resetFields();
    }
  }, [open, editingRecord, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingRecord) {
        await request.put(`/follow-ups/${editingRecord.id}`, {
          followType: values.follow_up_type,
          followDate: values.follow_up_date?.format('YYYY-MM-DD'),
          content: values.content,
          status: values.overall_status,
          nextPlan: values.next_step,
        });
        message.success('跟进记录更新成功');
        onSuccess();
      } else {
        await request.post('/follow-ups', {
          enterpriseId,
          followType: values.follow_up_type,
          followDate: values.follow_up_date?.format('YYYY-MM-DD'),
          content: values.content,
          status: values.overall_status,
          nextPlan: values.next_step,
          stageAfter: values.stage_after,
        });
        message.success('跟进记录添加成功');
        if (values.stage_after) {
          const d = await enterpriseApi.getDetail(enterpriseId);
          if (d.data?.stage) {
            onSuccess({ stage: d.data.stage, stageName: d.data.stageName, stageColor: d.data.stageColor });
          } else {
            onSuccess();
          }
        } else {
          onSuccess();
        }
      }
      onClose();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.message || '操作失败');
    }
  };

  return (
    <Modal
      maskClosable={false}
      title={editingRecord ? '编辑跟进记录' : '添加跟进记录'}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="保存"
      cancelText="取消"
      width={600}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="follow_up_type" label="跟进类型" rules={[{ required: true, message: '请选择跟进类型' }]}>
              <Select placeholder="请选择" options={FOLLOW_UP_TYPES.map((t: string) => ({ label: t, value: t }))} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="follow_up_date" label="跟进日期" rules={[{ required: true, message: '请选择跟进日期' }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="content" label="跟进内容" rules={[{ required: true, message: '请输入跟进内容' }]}>
              <Input.TextArea rows={4} placeholder="请输入跟进内容..." />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="overall_status" label="整体状态">
              <Input placeholder="如：积极配合、观望中等" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="stage_after" label="变更阶段">
              <Select
                placeholder="如无变化可不选"
                allowClear
                options={FUNNEL_STAGES.map((s) => ({ label: s.name, value: s.code }))}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="next_step" label="下一步计划">
              <Input placeholder="请输入下一步计划..." />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
