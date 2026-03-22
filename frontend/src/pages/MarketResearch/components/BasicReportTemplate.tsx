import { forwardRef } from 'react';
import '../report.css';
import type { EnterpriseDetail } from '@/types';
import type { ReportAiData } from '../services/reportAiService';
import BasicReportHeader from './sections/BasicReportHeader';
import BasicChapters1to4 from './sections/BasicChapters1to4';
import BasicChapters5to8 from './sections/BasicChapters5to8';

interface BasicReportTemplateProps {
  enterprise?: EnterpriseDetail | null;
  aiData?: ReportAiData;
}

const BasicReportTemplate = forwardRef<HTMLDivElement, BasicReportTemplateProps>(
  ({ enterprise, aiData }, ref) => {
    return (
      <div ref={ref} className="report-wrapper">
        <BasicReportHeader enterprise={enterprise} />
        <BasicChapters1to4 enterprise={enterprise} aiData={aiData} />
        <BasicChapters5to8 enterprise={enterprise} aiData={aiData} />
      </div>
    );
  }
);

BasicReportTemplate.displayName = 'BasicReportTemplate';

export default BasicReportTemplate;
