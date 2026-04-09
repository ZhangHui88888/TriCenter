import { Row, Col, Typography } from 'antd';
import type { RequirementStatFilterKey, RequirementStatItem } from './types';

const { Text } = Typography;

interface RequirementOverviewStatsProps {
  items: RequirementStatItem[];
  activeFilters: RequirementStatFilterKey[];
  onToggle: (key: RequirementStatFilterKey) => void;
}

export default function RequirementOverviewStats({
  items,
  activeFilters,
  onToggle,
}: RequirementOverviewStatsProps) {
  return (
    <Row gutter={16}>
      {items.map((item) => {
        const isSummaryCard = item.key === 'all';
        const isActive = activeFilters.includes(item.key);
        return (
          <Col span={6} key={item.key}>
            {isSummaryCard ? (
              <div
                className="requirement-stat-card requirement-stat-card--summary"
                style={{
                  ['--stat-color' as string]: item.color,
                  ['--stat-bg' as string]: item.bg,
                  ['--stat-border' as string]: item.border,
                }}
              >
                <div className="requirement-stat-card__content">
                  <div className="requirement-stat-card__value">{item.value}</div>
                  <Text type="secondary" className="requirement-stat-card__label">{item.label}</Text>
                </div>
                <div className="requirement-stat-card__indicator requirement-stat-card__indicator--placeholder">
                  占位
                </div>
              </div>
            ) : (
              <button
                type="button"
                className={`requirement-stat-card${isActive ? ' requirement-stat-card--active' : ''}`}
                style={{
                  ['--stat-color' as string]: item.color,
                  ['--stat-bg' as string]: item.bg,
                  ['--stat-border' as string]: item.border,
                }}
                onClick={() => onToggle(item.key)}
              >
                <div className="requirement-stat-card__content">
                  <div className="requirement-stat-card__value">{item.value}</div>
                  <Text type="secondary" className="requirement-stat-card__label">{item.label}</Text>
                </div>
                <div className="requirement-stat-card__indicator">
                  {isActive ? '显示中' : '点击筛选'}
                </div>
              </button>
            )}
          </Col>
        );
      })}
    </Row>
  );
}
