import { RobotOutlined } from '@ant-design/icons';
import type { ReportAiData } from '../../services/reportAiService';

interface DeepAiAnalysisProps {
  aiData?: ReportAiData;
}

const SECTIONS = [
  ['marketOverview', '市场环境综述'],
  ['buyerProfile', '目标买家画像'],
  ['industryTrends', '行业趋势'],
  ['competition', '竞争格局'],
  ['risks', '风险研判'],
  ['recommendations', '行动建议'],
] as const;

function DeepAiAnalysis({ aiData }: DeepAiAnalysisProps) {
  if (!aiData || !SECTIONS.some(([key]) => aiData[key])) return null;

  return (
    <section aria-labelledby="deep-ai-analysis-title">
      <h2 id="deep-ai-analysis-title"><RobotOutlined /> AI 深度分析摘要</h2>
      {SECTIONS.map(([key, title]) => (
        <div key={key}>
          <h3>{title}</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{aiData[key] || '待调研'}</p>
        </div>
      ))}
      <hr />
    </section>
  );
}

export default DeepAiAnalysis;
