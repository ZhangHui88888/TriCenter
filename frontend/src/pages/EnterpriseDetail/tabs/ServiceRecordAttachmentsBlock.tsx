// @ts-nocheck
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { Button, message } from 'antd';
import { FileOutlined } from '@ant-design/icons';
import { cooperationUploadApi } from '@/services/api';
import { normalizeAttachmentList, type AttachmentMeta } from '../components/CooperationAttachmentsEditor';

const RULE = '#e5e7eb';

function AttachmentItem({ att }: { att: AttachmentMeta }) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const isImg = (att.contentType || '').startsWith('image/');

  useEffect(() => {
    if (!isImg) return undefined;
    let created: string | undefined;
    let cancel = false;
    (async () => {
      try {
        const res = await cooperationUploadApi.downloadAttachment(att.storedFileName, att.originalName);
        const url = URL.createObjectURL(res.data);
        if (!cancel) {
          created = url;
          setImgUrl(url);
        }
      } catch {
        if (!cancel) setImgUrl(null);
      }
    })();
    return () => {
      cancel = true;
      if (created) URL.revokeObjectURL(created);
    };
  }, [att.storedFileName, att.originalName, att.contentType, isImg]);

  const download = async () => {
    try {
      const res = await cooperationUploadApi.downloadAttachment(att.storedFileName, att.originalName);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = att.originalName || 'download';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      message.error('下载失败');
    }
  };

  if (isImg && imgUrl) {
    return (
      <div style={{ display: 'inline-block', marginRight: 14, marginBottom: 14, verticalAlign: 'top' }}>
        <img
          src={imgUrl}
          alt={att.originalName}
          style={{ maxHeight: 140, maxWidth: 220, borderRadius: 8, border: `1px solid ${RULE}`, display: 'block', objectFit: 'cover' }}
        />
        <Button type="link" size="small" onClick={download} style={{ padding: '4px 0 0', height: 'auto', fontSize: 12 }}>
          下载 {att.originalName}
        </Button>
      </div>
    );
  }

  return (
    <Button
      type="default"
      size="small"
      icon={<FileOutlined />}
      onClick={download}
      style={{ borderRadius: 8, marginRight: 8, marginBottom: 8, borderColor: RULE }}
    >
      {att.originalName}
    </Button>
  );
}

export default function ServiceRecordAttachmentsBlock({
  raw,
  serifTitleStyle,
}: {
  raw: unknown;
  serifTitleStyle: CSSProperties;
}) {
  const list = normalizeAttachmentList(raw);
  if (list.length === 0) return null;
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={serifTitleStyle}>附件与图片</div>
      <div style={{ marginTop: 10 }}>
        {list.map((att) => (
          <AttachmentItem key={att.storedFileName} att={att} />
        ))}
      </div>
    </div>
  );
}
