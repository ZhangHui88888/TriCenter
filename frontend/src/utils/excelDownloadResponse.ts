import type { AxiosResponse } from 'axios';

function headerContentTypeRaw(headers: AxiosResponse['headers']): string {
  if (!headers) return '';
  const lc = headers['content-type'];
  const cc = headers['Content-Type'];
  const v = lc ?? cc;
  if (typeof v === 'string') return v;
  if (Array.isArray(v) && typeof v[0] === 'string') return v[0];
  return '';
}

function primaryContentType(response: AxiosResponse): string {
  const raw = headerContentTypeRaw(response.headers);
  const first = raw.split(',')[0] ?? '';
  return first.split(';')[0].trim().toLowerCase();
}

function isZipPkMagic(buf: Uint8Array): boolean {
  return buf.length >= 4 && buf[0] === 0x50 && buf[1] === 0x4b;
}

/**
 * 将「responseType: 'blob'」的下载响应转为可保存的 .xlsx Blob。
 * 识别 JSON 业务错误与误返回的 HTML（常见于同域部署未反代 /api 时落到 index.html）。
 */
export async function toXlsxBlobFromResponse(response: AxiosResponse<Blob>): Promise<Blob> {
  const data = response.data;
  const blob = data instanceof Blob ? data : new Blob([data as unknown as ArrayBuffer]);

  const primary = primaryContentType(response);
  const typeSuggestsJson =
    primary.includes('application/json') || primary.includes('application/problem');

  const prefix = new Uint8Array(await blob.slice(0, 8).arrayBuffer());

  if (isZipPkMagic(prefix)) {
    return new Blob([blob], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  const text = await blob.text();
  const t = text.replace(/^\uFEFF/, '').trimStart();

  if (typeSuggestsJson || t.startsWith('{') || t.startsWith('[')) {
    try {
      const j = JSON.parse(text) as { message?: string; detail?: string; error?: string };
      throw new Error(j.message || j.detail || j.error || '接口返回 JSON 而非 Excel 文件');
    } catch (e: unknown) {
      if (e instanceof SyntaxError) {
        /* 非合法 JSON，继续按文本判断 */
      } else {
        throw e;
      }
    }
  }

  if (t.startsWith('<')) {
    throw new Error(
      '返回了网页而非 Excel：通常表示 /api 未指向后端（打包后同域访问时 Nginx 把 /api 回退到了首页）。请在站点 Nginx 增加 /api 反代到 Spring Boot（见 nginx/czcrop.top.conf），或构建时设置 VITE_API_BASE_URL（须含 /api，例如 https://api.你的域名/api）。'
    );
  }

  throw new Error(
    text.slice(0, 200) ||
      '返回内容不是 Excel（缺少 .xlsx 的 ZIP 文件头），请确认接口地址与登录态'
  );
}
