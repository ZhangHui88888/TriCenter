import React from 'react';
import { ArrowRightOutlined, RiseOutlined, FallOutlined } from '@ant-design/icons';

interface StageInfo {
  name: string;
  color: string;
}

interface StageChangeIndicatorProps {
  stageBefore: StageInfo;
  stageAfter: StageInfo;
  isUpgrade?: boolean; // 是否为升级（阶段推进）
}

// 阶段顺序映射，用于判断升级/降级
const stageOrder: Record<string, number> = {
  '潜在企业': 1,
  '有明确需求': 2,
  '已对接': 3,
  '已签约': 4,
  '已落地': 5,
};

const StageChangeIndicator: React.FC<StageChangeIndicatorProps> = ({
  stageBefore,
  stageAfter,
}) => {
  // 判断是升级还是降级
  const beforeOrder = stageOrder[stageBefore.name] || 0;
  const afterOrder = stageOrder[stageAfter.name] || 0;
  const isUpgrade = afterOrder > beforeOrder;

  // 根据升级/降级选择主题色
  const themeColor = isUpgrade ? '#52c41a' : '#faad14';
  const gradientColors = isUpgrade 
    ? ['#52c41a', '#73d13d', '#95de64'] 
    : ['#faad14', '#ffc53d', '#ffd666'];

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        borderRadius: 20,
        background: `linear-gradient(135deg, ${isUpgrade ? 'rgba(82,196,26,0.08)' : 'rgba(250,173,20,0.08)'} 0%, rgba(255,255,255,0.9) 100%)`,
        border: `1px solid ${isUpgrade ? 'rgba(82,196,26,0.2)' : 'rgba(250,173,20,0.2)'}`,
      }}
    >
      {/* 起始阶段 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 10px',
          borderRadius: 12,
          background: `linear-gradient(135deg, ${stageBefore.color}15 0%, ${stageBefore.color}08 100%)`,
          border: `1px solid ${stageBefore.color}30`,
          fontSize: 12,
          fontWeight: 500,
          color: stageBefore.color,
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: stageBefore.color,
            opacity: 0.6,
          }}
        />
        {stageBefore.name}
      </div>

      {/* 箭头指示器 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: '4px 8px',
          borderRadius: 10,
          background: `linear-gradient(90deg, ${gradientColors[0]}20, ${gradientColors[1]}30, ${gradientColors[2]}20)`,
        }}
      >
        {isUpgrade ? (
          <RiseOutlined
            style={{
              fontSize: 14,
              color: themeColor,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        ) : (
          <FallOutlined
            style={{
              fontSize: 14,
              color: themeColor,
            }}
          />
        )}
        <ArrowRightOutlined
          style={{
            fontSize: 12,
            color: themeColor,
          }}
        />
      </div>

      {/* 目标阶段 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 10px',
          borderRadius: 12,
          background: `linear-gradient(135deg, ${stageAfter.color}25 0%, ${stageAfter.color}15 100%)`,
          border: `1px solid ${stageAfter.color}50`,
          fontSize: 12,
          fontWeight: 600,
          color: stageAfter.color,
          whiteSpace: 'nowrap',
          boxShadow: `0 2px 8px ${stageAfter.color}20`,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: stageAfter.color,
          }}
        />
        {stageAfter.name}
      </div>
    </div>
  );
};

export default StageChangeIndicator;
