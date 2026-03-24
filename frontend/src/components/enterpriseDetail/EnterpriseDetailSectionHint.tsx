import { Button, Popover } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { ENTERPRISE_DETAIL_SECTION_HINTS } from './sectionHints';

type Props = Readonly<{
  /** 与 sectionHints.ts 中键一致 */
  sectionKey: string;
}>;

/**
 * 企业详情页板块级说明：点击问号查看填写目的与操作提示
 */
export function EnterpriseDetailSectionHint({ sectionKey }: Props) {
  const content = ENTERPRISE_DETAIL_SECTION_HINTS[sectionKey];
  if (!content) return null;

  return (
    <Popover
      content={
        <div style={{ maxWidth: 340, lineHeight: 1.65, fontSize: 13, color: 'rgba(0,0,0,0.88)' }}>
          {content}
        </div>
      }
      trigger="click"
      placement="topLeft"
    >
      <Button
        type="text"
        size="small"
        icon={<QuestionCircleOutlined />}
        aria-label="板块说明"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '0 4px', height: 22, minWidth: 22, color: '#94a3b8' }}
      />
    </Popover>
  );
}

/** 与详情页 Card 标题字号一致的标题 + 问号 */
export function enterpriseDetailCardTitle(label: string, sectionKey: string) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      <span style={{ fontWeight: 600, fontSize: 15 }}>{label}</span>
      <EnterpriseDetailSectionHint sectionKey={sectionKey} />
    </span>
  );
}
