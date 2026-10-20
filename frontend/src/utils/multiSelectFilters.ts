/** 多选筛选统一使用逗号分隔参数；清空后不发送该条件。兼容旧单选值。 */
export function serializeFilterValues(value: unknown): string | undefined {
  const values = (Array.isArray(value) ? value : [value])
    .filter((item): item is string | number => typeof item === 'string' || typeof item === 'number')
    .map(item => String(item).trim())
    .filter(Boolean);
  return [...new Set(values)].join(',') || undefined;
}

/** Cascader 多选返回路径数组；每条路径末项代表所选品类（含其子类）。 */
export function serializeCategoryPaths(value: unknown): string | undefined {
  if (!Array.isArray(value)) return serializeFilterValues(value);
  if (!value.some(Array.isArray)) return serializeFilterValues(value.slice(-1));
  return serializeFilterValues(value.map(path => Array.isArray(path) ? path[path.length - 1] : path));
}
