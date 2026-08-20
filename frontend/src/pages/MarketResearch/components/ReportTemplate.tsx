import { forwardRef } from 'react';
import '../report.css';
import type { EnterpriseDetail } from '@/types';
import ReportHeader from './sections/ReportHeader';
import Chapters1to4 from './sections/Chapters1to4';
import Chapter5 from './sections/Chapter5';
import Chapters6to9 from './sections/Chapters6to9';
import Chapters10to13 from './sections/Chapters10to13';
import ReportAppendix from './sections/ReportAppendix';
import DeepAiAnalysis from './sections/DeepAiAnalysis';
import type { ReportAiData } from '../services/reportAiService';

interface ReportTemplateProps {
  enterprise?: EnterpriseDetail | null;
  aiData?: ReportAiData;
}

const ReportTemplate = forwardRef<HTMLDivElement, ReportTemplateProps>(
  ({ enterprise, aiData }, ref) => {
    return (
      <div ref={ref} className="report-wrapper">
        <ReportHeader enterprise={enterprise} />
        <Chapters1to4 enterprise={enterprise} />
        <DeepAiAnalysis aiData={aiData} />
        <Chapter5 />
        <Chapters6to9 />
        <Chapters10to13 />
        <ReportAppendix />
      </div>
    );
  }
);

ReportTemplate.displayName = 'ReportTemplate';

export default ReportTemplate;
