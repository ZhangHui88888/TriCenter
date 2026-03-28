import { Modal, Select, Space, Badge, Typography } from 'antd';
import { FUNNEL_STAGES } from '../constants';

const { Text } = Typography;

interface StageChangeModalProps {
  open: boolean;
  selectedStage: string;
  onStageChange: (stage: string) => void;
  onOk: () => void;
  onClose: () => void;
}

export default function StageChangeModal({
  open,
  selectedStage,
  onStageChange,
  onOk,
  onClose,
}: StageChangeModalProps) {
  return (
    <Modal
      maskClosable={false}
      title="变更漏斗阶段"
      open={open}
      onOk={onOk}
      onCancel={onClose}
      okText="确认变更"
      cancelText="取消"
    >
      <div style={{ margin: '24px 0' }}>
        <Text style={{ marginBottom: 8, display: 'block' }}>选择新阶段:</Text>
        <Select
          style={{ width: '100%' }}
          value={selectedStage}
          onChange={onStageChange}
          options={FUNNEL_STAGES.map((s) => ({
            label: (
              <Space>
                <Badge color={s.color} />
                {s.name}
              </Space>
            ),
            value: s.code,
          }))}
        />
      </div>
    </Modal>
  );
}
