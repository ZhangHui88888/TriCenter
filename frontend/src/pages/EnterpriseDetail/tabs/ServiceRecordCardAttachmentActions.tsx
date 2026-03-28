// @ts-nocheck
import type { CSSProperties, MouseEvent } from 'react';
import { useRef, useState } from 'react';
import { App, Button, Dropdown, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { UploadOutlined, DownloadOutlined, LoadingOutlined } from '@ant-design/icons';
import { cooperationUploadApi, serviceRecordApi } from '@/services/api';
import { normalizeAttachmentList, type AttachmentMeta } from '../components/CooperationAttachmentsEditor';
import {
  buildServiceRecordUpdateBody,
  SERVICE_RECORD_FILE_ACCEPT,
  SERVICE_RECORD_MAX_FILE_SIZE_BYTES,
} from './serviceRecordUpdatePayload';

const BTN_UPLOAD: CSSProperties = {
  borderRadius: 10,
  background: '#fff',
  border: '1px solid #e5e7eb',
  color: '#111827',
  height: 34,
  padding: '0 14px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontWeight: 500,
  fontSize: 13,
};

const UPLOAD_MSG_KEY = 'cooperation-record-upload';

const { Text } = Typography;

/** 隐藏但仍可被 <label> 关联触发，避免 display:none + 程序 click */
const VISUALLY_HIDDEN_INPUT: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
};

const BTN_DOWNLOAD: CSSProperties = {
  borderRadius: 10,
  background: '#111827',
  border: 'none',
  color: '#fff',
  height: 34,
  padding: '0 14px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontWeight: 500,
  fontSize: 13,
};

function parseUploadResultToMeta(res: any, fallbackFileName: string): AttachmentMeta | null {
  const d = res?.data;
  if (!d || typeof d !== 'object') return null;
  const stored = d.storedFileName ?? d.stored_file_name;
  if (typeof stored !== 'string' || !stored) return null;
  const original = d.originalName ?? d.original_name;
  const contentType = d.contentType ?? d.content_type;
  const uploadedAt = d.uploadedAt ?? d.uploaded_at;
  const size = d.size;
  return {
    storedFileName: stored,
    originalName: typeof original === 'string' && original ? original : fallbackFileName,
    contentType: typeof contentType === 'string' ? contentType : undefined,
    size: typeof size === 'number' ? size : undefined,
    uploadedAt: typeof uploadedAt === 'string' ? uploadedAt : undefined,
  };
}

export interface ServiceRecordCardAttachmentActionsProps {
  readonly enterpriseId: number | undefined;
  readonly record: any;
  readonly mergeServiceRecordInState?: (updated: any) => void;
  readonly onAttachmentsChange?: () => void;
}

export default function ServiceRecordCardAttachmentActions({
  enterpriseId,
  record: r,
  mergeServiceRecordInState,
  onAttachmentsChange,
}: ServiceRecordCardAttachmentActionsProps) {
  const { message } = App.useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  /** 行内兜底：不依赖全局 message 挂载是否成功 */
  const [inlineHint, setInlineHint] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const attachmentMetas = normalizeAttachmentList(r.attachments);

  const entId = enterpriseId != null && enterpriseId !== '' ? Number(enterpriseId) : Number.NaN;
  const recordId = r?.id ?? r?.serviceId ?? r?.service_id;
  const canUpload = Number.isFinite(entId) && entId > 0 && recordId != null && recordId !== '';
  let uploadBlockTitle: string | undefined;
  if (!Number.isFinite(entId) || entId <= 0) {
    uploadBlockTitle = '企业未加载完成，请刷新页面';
  } else if (recordId == null || recordId === '') {
    uploadBlockTitle = '本条记录缺少 ID，无法上传';
  }

  const downloadOne = async (storedFileName: string, originalName: string) => {
    try {
      const res = await cooperationUploadApi.downloadAttachment(storedFileName, originalName);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalName || 'download';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      message.error('下载失败');
    }
  };

  const downloadMenuItems: MenuProps['items'] =
    attachmentMetas.length === 0
      ? [{ key: '_empty', label: '暂无附件', disabled: true }]
      : attachmentMetas.map((att) => ({
          key: att.storedFileName,
          label: att.originalName || att.storedFileName,
          onClick: () => void downloadOne(att.storedFileName, att.originalName),
        }));

  const openNativeFilePicker = (e: MouseEvent<HTMLButtonElement>) => {
    if (!canUpload || uploading) {
      e.preventDefault();
      setInlineHint({
        type: 'err',
        text: uploadBlockTitle || '当前无法上传',
      });
      return;
    }

    try {
      setInlineHint({ type: 'ok', text: '正在打开文件选择窗口…' });
      const input = fileInputRef.current;
      if (!input) {
        setInlineHint({ type: 'err', text: '文件选择控件未就绪，请刷新页面后重试。' });
        return;
      }
      const anyInput = input as HTMLInputElement & { showPicker?: () => void };
      if (typeof anyInput.showPicker === 'function') anyInput.showPicker();
      else input.click();
    } catch {
      setInlineHint({ type: 'err', text: '打开文件选择窗口失败，请刷新页面后重试。' });
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    /**
     * 先复制成普通数组，再清空 input.value。
     * 某些浏览器里 input.files 是 live FileList，先清空会导致 length 变 0，从而完全不发请求。
     */
    const selectedFiles = Array.from(input.files ?? []);
    input.value = '';
    if (selectedFiles.length === 0 || !canUpload) {
      if (selectedFiles.length > 0 && !canUpload) {
        setInlineHint({
          type: 'err',
          text: uploadBlockTitle || '当前无法上传（企业或记录信息不完整）',
        });
      }
      return;
    }

    const oversizedFiles = selectedFiles.filter((file) => file.size > SERVICE_RECORD_MAX_FILE_SIZE_BYTES);
    if (oversizedFiles.length > 0) {
      const names = oversizedFiles.map((file) => file.name).join('、');
      const errText = `以下文件超过 30MB，无法上传：${names}`;
      message.error(errText);
      setInlineHint({ type: 'err', text: errText });
      return;
    }

    const n = selectedFiles.length;
    setUploading(true);
    setInlineHint({
      type: 'ok',
      text: `已选择 ${n} 个文件，正在上传并保存到本条记录…`,
    });
    try {
      message.loading({ content: '正在上传并保存附件…', key: UPLOAD_MSG_KEY, duration: 0 });
    } catch {
      /* message 不可用时仅依赖行内提示 */
    }
    const newMetas: AttachmentMeta[] = [];
    const uploadErrors: string[] = [];
    try {
      setInlineHint({
        type: 'ok',
        text: `已选择 ${n} 个文件，正在发起上传请求（POST /api/upload/cooperation-attachment）…`,
      });
      for (const file of selectedFiles) {
        try {
          console.info('[attachment-upload] start', { name: file.name, size: file.size, type: file.type });
          const res = await cooperationUploadApi.uploadAttachment(file);
          const meta = parseUploadResultToMeta(res, file.name);
          if (meta) newMetas.push(meta);
          else {
            const w = `${file.name} 上传返回异常，未拿到文件标识`;
            uploadErrors.push(w);
            setInlineHint({ type: 'err', text: w });
          }
        } catch (error: any) {
          const detail = error?.response?.data?.message || error?.message || '上传失败';
          const errText = `${file.name} 上传失败：${detail}`;
          uploadErrors.push(errText);
          console.error('[attachment-upload] failed', {
            name: file.name,
            detail,
            status: error?.response?.status,
            data: error?.response?.data,
          });
          setInlineHint({ type: 'err', text: errText });
        }
      }
      if (newMetas.length === 0) {
        message.destroy(UPLOAD_MSG_KEY);
        const firstError = uploadErrors[0];
        const w = firstError || '没有文件上传成功，请检查登录状态、文件大小（≤30MB）或稍后重试';
        setInlineHint({ type: 'err', text: w });
        return;
      }

      const merged = [...normalizeAttachmentList(r.attachments), ...newMetas];
      const putRes = await serviceRecordApi.update(
        entId,
        Number(recordId),
        buildServiceRecordUpdateBody(r, merged),
        { skipGlobalErrorToast: true },
      );
      if (putRes?.data) mergeServiceRecordInState?.(putRes.data);
      message.destroy(UPLOAD_MSG_KEY);
      const names = newMetas.map((m) => m.originalName).join('、');
      const namesSuffix = names ? `：${names}` : '';
      const okText = `已保存 ${newMetas.length} 个附件${namesSuffix}`;
      setInlineHint({ type: 'ok', text: okText });
      onAttachmentsChange?.();
    } catch (error: unknown) {
      message.destroy(UPLOAD_MSG_KEY);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const detail = err?.response?.data?.message || err?.message || '请稍后重试';
      setInlineHint({
        type: 'err',
        text: `保存附件失败：${detail}`,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginTop: 14 }}>
      {(!canUpload || inlineHint) && (
        <div style={{ width: '100%', marginBottom: 10 }}>
          {!canUpload && (
            <Text type="danger" style={{ fontSize: 13, display: 'block', lineHeight: 1.55, marginBottom: inlineHint ? 4 : 0 }}>
              当前不可上传：{uploadBlockTitle}
            </Text>
          )}
          {inlineHint && (
            <Text
              type={inlineHint.type === 'ok' ? 'success' : 'danger'}
              style={{ fontSize: 13, display: 'block', lineHeight: 1.55 }}
            >
              {inlineHint.text}
            </Text>
          )}
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={SERVICE_RECORD_FILE_ACCEPT}
          disabled={!canUpload || uploading}
          aria-label="选择要上传的附件"
          onChange={handleFileInputChange}
          style={VISUALLY_HIDDEN_INPUT}
        />
        <button
          type="button"
          title={uploadBlockTitle}
          onClick={openNativeFilePicker}
          style={{
            ...BTN_UPLOAD,
            cursor: canUpload && !uploading ? 'pointer' : 'not-allowed',
            opacity: canUpload && !uploading ? 1 : 0.55,
            userSelect: 'none',
            appearance: 'none',
            WebkitAppearance: 'none',
            outline: 'none',
          }}
        >
          {uploading ? <LoadingOutlined /> : <UploadOutlined />}
          <span style={{ marginLeft: 2 }}>上传附件</span>
        </button>
      <Dropdown
        menu={{ items: downloadMenuItems }}
        trigger={['hover']}
        placement="bottomLeft"
        mouseEnterDelay={0.15}
        mouseLeaveDelay={0.2}
      >
        <Button type="text" style={BTN_DOWNLOAD} icon={<DownloadOutlined />}>
          下载附件{attachmentMetas.length > 0 ? `（${attachmentMetas.length}）` : ''}
        </Button>
      </Dropdown>
      </div>
    </div>
  );
}
