// @ts-nocheck
import { useEffect, useState } from 'react';
import { Upload, Typography, message } from 'antd';
import type { UploadFile } from 'antd';
import { PaperClipOutlined } from '@ant-design/icons';
import { cooperationUploadApi } from '@/services/api';

const { Text, Link } = Typography;

export type AttachmentMeta = {
  storedFileName: string;
  originalName: string;
  contentType?: string;
  size?: number;
  uploadedAt?: string;
};

export function normalizeAttachmentList(raw: unknown): AttachmentMeta[] {
  if (raw == null) return [];
  if (typeof raw === 'string') {
    const t = raw.trim();
    if (!t || t === 'null') return [];
    try {
      return normalizeAttachmentList(JSON.parse(t));
    } catch {
      return [];
    }
  }
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x) => {
      if (!x || typeof x !== 'object') return null;
      const o = x as Record<string, unknown>;
      const stored = o.storedFileName ?? o.stored_file_name;
      const name = o.originalName ?? o.original_name;
      if (typeof stored !== 'string' || !stored) return null;
      const ct = o.contentType ?? o.content_type;
      const sz = o.size;
      const at = o.uploadedAt ?? o.uploaded_at;
      return {
        storedFileName: stored,
        originalName: typeof name === 'string' ? name : stored,
        contentType: typeof ct === 'string' ? ct : undefined,
        size: typeof sz === 'number' ? sz : typeof sz === 'string' && sz !== '' ? Number(sz) : undefined,
        uploadedAt: typeof at === 'string' ? at : undefined,
      } as AttachmentMeta;
    })
    .filter(Boolean);
}

function toUploadFiles(metas: AttachmentMeta[]): UploadFile[] {
  return metas.map((m) => ({
    uid: m.storedFileName,
    name: m.originalName || m.storedFileName,
    status: 'done' as const,
    response: m,
  }));
}

interface CooperationAttachmentsEditorProps {
  initialMetas: AttachmentMeta[];
  onChange: (next: AttachmentMeta[]) => void;
}

export default function CooperationAttachmentsEditor({ initialMetas, onChange }: CooperationAttachmentsEditorProps) {
  const [fileList, setFileList] = useState<UploadFile[]>(() => toUploadFiles(initialMetas));

  useEffect(() => {
    onChange(initialMetas);
  }, []);

  return (
    <>
      <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>
        支持 PDF、Office 文档、压缩包及常见图片（jpg/png/webp/gif 等），单文件不超过 30MB
      </Text>
      <Upload
        multiple
        fileList={fileList}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z,.txt,.csv,image/*"
        showUploadList={{ showPreviewIcon: false }}
        customRequest={async (options) => {
          const { file, onSuccess, onError } = options;
          try {
            const res = await cooperationUploadApi.uploadAttachment(file as File);
            const data = res.data;
            if (!data?.storedFileName) throw new Error('empty');
            onSuccess?.(data, file as any);
          } catch {
            message.error('上传失败');
            onError?.(new Error('upload failed'));
          }
        }}
        onChange={({ fileList: fl }) => {
          setFileList(fl);
          const metas = fl
            .filter((f) => f.status === 'done' && f.response)
            .map((f) => {
              const r = f.response;
              return {
                storedFileName: r.storedFileName,
                originalName: r.originalName || f.name,
                contentType: r.contentType,
                size: r.size,
                uploadedAt: r.uploadedAt,
              } as AttachmentMeta;
            });
          onChange(metas);
        }}
      >
        <Link style={{ fontSize: 14 }}>
          <PaperClipOutlined /> 选择文件或图片
        </Link>
      </Upload>
    </>
  );
}
