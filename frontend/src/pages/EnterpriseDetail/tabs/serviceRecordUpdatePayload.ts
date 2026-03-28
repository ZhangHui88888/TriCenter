import type { AttachmentMeta } from '../components/CooperationAttachmentsEditor';
import { calcFeasibilityScore, calcProjectLevel } from '../constants';

/** 与 CooperationAttachmentsEditor 一致 */
export const SERVICE_RECORD_FILE_ACCEPT =
  '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z,.txt,.csv,image/*';

/** 后端 application.yml 当前限制：单文件 30MB */
export const SERVICE_RECORD_MAX_FILE_SIZE_BYTES = 30 * 1024 * 1024;

export function attachmentsToApiList(metas: AttachmentMeta[]) {
  return metas.map((m) => {
    const o: Record<string, unknown> = {
      storedFileName: m.storedFileName,
      originalName: m.originalName,
    };
    if (m.contentType) o.contentType = m.contentType;
    if (m.size != null) o.size = m.size;
    if (m.uploadedAt) o.uploadedAt = m.uploadedAt;
    return o;
  });
}

/**
 * 后端 update 对 description/result 等字段会整字段赋值，不能只传 attachments，需带齐当前记录字段以免被清空。
 */
export function buildServiceRecordUpdateBody(r: any, attachmentMetas: AttachmentMeta[]) {
  return {
    serviceType: r.serviceType,
    serviceName: r.serviceName,
    serviceDate: r.serviceDate,
    status: r.status,
    providerId: r.providerId ?? null,
    responsibleId: r.responsibleId ?? null,
    contractNo: r.contractNo ?? null,
    description: r.description ?? null,
    result: r.result ?? null,
    assessmentData: r.assessmentData ?? null,
    feasibilityScore: r.feasibilityScore ?? null,
    projectLevel: r.projectLevel ?? null,
    benchmarkPossibility: r.benchmarkPossibility ?? null,
    stageFrom: r.stageFrom ?? null,
    stageTo: r.stageTo ?? null,
    attachments: attachmentsToApiList(attachmentMetas),
  };
}

/** 修改某一维星级后生成完整 PUT 体（与其余字段一并提交，避免后端清空） */
export function buildServiceRecordUpdateBodyWithAssessmentPatch(
  r: any,
  dimensionKey: string,
  value: number,
  attachmentMetas: AttachmentMeta[],
) {
  const base: Record<string, number> = r.assessmentData ? { ...r.assessmentData } : {};
  if (value) base[dimensionKey] = value;
  else delete base[dimensionKey];
  const hasScores = Object.values(base).some((v) => (Number(v) || 0) > 0);
  const assessmentData = hasScores ? base : null;
  let feasibilityScore: number | null = null;
  let projectLevel: string | null = null;
  if (assessmentData) {
    feasibilityScore = calcFeasibilityScore(assessmentData);
    projectLevel = calcProjectLevel(feasibilityScore);
  }
  return buildServiceRecordUpdateBody(
    { ...r, assessmentData, feasibilityScore, projectLevel },
    attachmentMetas,
  );
}
