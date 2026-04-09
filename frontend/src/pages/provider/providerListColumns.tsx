import { Button, Space, Tag } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { ProviderListItem } from '@/types';
import { getRequirementNames } from './constants';

type ProviderListColumnActions = {
  onView: (record: ProviderListItem) => void;
  onDelete: (record: ProviderListItem) => void;
};

export function createProviderColumns({
  onView,
  onDelete,
}: ProviderListColumnActions): ColumnsType<ProviderListItem> {
  return [
    {
      title: '服务商名称',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      ellipsis: true,
      render: (text: string, record) => {
        const sublineText = record.primaryContactPhone || '暂无联系方式';
        return (
          <div
            style={{
              minHeight: 48,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            <div
              className="enterprise-list-name-link"
              role="link"
              tabIndex={0}
              onClick={() => onView(record)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onView(record);
                }
              }}
              title={text}
            >
              {text}
            </div>
            <div
              style={{
                fontSize: 13,
                lineHeight: '22px',
                minHeight: 22,
                color: '#8c8c8c',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                minWidth: 0,
              }}
              title={sublineText}
            >
              <span
                style={{
                  display: 'inline-block',
                  flexShrink: 0,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#16DBCC',
                }}
                aria-hidden
              />
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                }}
              >
                {sublineText}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: '服务分类',
      key: 'serviceCategories',
      width: 220,
      render: (_: unknown, record) => {
        const names = getRequirementNames(record.capabilityRequirementIds);
        if (names.length === 0) {
          return '-';
        }
        return (
          <Space size={[4, 4]} wrap>
            {names.slice(0, 3).map((item) => (
              <Tag key={item} color="blue">{item}</Tag>
            ))}
            {names.length > 3 ? <Tag>{`+${names.length - 3}`}</Tag> : null}
          </Space>
        );
      },
    },
    {
      title: '所属区域',
      dataIndex: 'district',
      key: 'district',
      width: 100,
      render: (text?: string) => text || '-',
    },
    {
      title: '主要联系人',
      key: 'contact',
      width: 150,
      render: (_: unknown, record) => (
        <div>
          <div>{record.primaryContactName || '-'}</div>
          {record.primaryContactPhone && <div style={{ fontSize: 12, color: '#999' }}>{record.primaryContactPhone}</div>}
        </div>
      ),
    },
    {
      title: '服务次数',
      dataIndex: 'totalServiceCount',
      key: 'totalServiceCount',
      width: 90,
      align: 'center',
      render: (value?: number | null) => value ?? '-',
    },
    {
      title: '服务企业数',
      dataIndex: 'totalServedEnterprises',
      key: 'totalServedEnterprises',
      width: 100,
      align: 'center',
      render: (value?: number | null) => value ?? '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record) => (
        <Space>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => onDelete(record)} />
        </Space>
      ),
    },
  ];
}
