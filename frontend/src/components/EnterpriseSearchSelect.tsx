import { useEffect, useMemo, useRef, useState } from 'react';
import { Select, Spin, type SelectProps } from 'antd';
import { enterpriseApi } from '@/services/api';

type Option = { label: string; value: number };

/** 后端分页上限为 100，企业数量远超此值，因此按关键字远程搜索而不是一次拉全量 */
const SEARCH_PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 300;

type EnterpriseSearchSelectProps = Omit<SelectProps<number>, 'options' | 'showSearch' | 'filterOption' | 'onSearch'> & {
  /** 当前值不在搜索结果里时（如编辑已有记录）用于显示名称 */
  selectedOption?: Option;
};

export default function EnterpriseSearchSelect({ selectedOption, onChange, ...selectProps }: EnterpriseSearchSelectProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [picked, setPicked] = useState<Option>();
  const [loading, setLoading] = useState(false);
  const requestSeq = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const search = (keyword: string) => {
    const seq = ++requestSeq.current;
    setLoading(true);
    enterpriseApi.getList({ page: 1, pageSize: SEARCH_PAGE_SIZE, keyword: keyword.trim() || undefined })
      .then(res => {
        if (seq !== requestSeq.current) return;
        setOptions((res.data?.list || []).map((e: { id: number; name: string }) => ({ label: e.name, value: e.id })));
      })
      .catch(() => {
        if (seq === requestSeq.current) setOptions([]);
      })
      .finally(() => {
        if (seq === requestSeq.current) setLoading(false);
      });
  };

  useEffect(() => {
    search('');
    return () => clearTimeout(timer.current);
  }, []);

  const handleSearch = (keyword: string) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => search(keyword), SEARCH_DEBOUNCE_MS);
  };

  // 新一轮搜索结果可能不含已选企业，保留其名称避免回显成数字 ID
  const mergedOptions = useMemo(() => {
    const extras = [selectedOption, picked].filter(
      (o): o is Option => o != null && !options.some(x => x.value === o.value),
    );
    const unique = extras.filter((o, i) => extras.findIndex(x => x.value === o.value) === i);
    return [...unique, ...options];
  }, [options, selectedOption, picked]);

  const handleChange: SelectProps<number>['onChange'] = (value, option) => {
    setPicked(mergedOptions.find(o => o.value === value));
    onChange?.(value, option);
  };

  return (
    <Select<number>
      {...selectProps}
      onChange={handleChange}
      showSearch
      filterOption={false}
      onSearch={handleSearch}
      options={mergedOptions}
      notFoundContent={loading ? <Spin size="small" /> : '无匹配企业'}
    />
  );
}
