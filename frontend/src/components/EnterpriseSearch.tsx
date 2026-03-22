import { useState, useRef, useCallback } from 'react';
import { AutoComplete, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { enterpriseApi } from '@/services/api';

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (value: string, enterprise: any) => void;
  onSearch?: (keyword: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

function EnterpriseSearch({ value, onChange, onSelect, onSearch, placeholder = '输入企业名称', style }: Props) {
  const [options, setOptions] = useState<any[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = useCallback((text: string) => {
    onChange?.(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!text || text.length < 1) {
      setOptions([]);
      return;
    }
    timerRef.current = setTimeout(async () => {
      try {
        const res = await enterpriseApi.getList({ page: 1, pageSize: 8, keyword: text });
        const list = res.data?.list || [];
        setOptions(list.map((e: any) => ({
          value: e.name,
          label: (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{e.name}</span>
              <span style={{ fontSize: 12, color: '#999' }}>{e.district || ''}</span>
            </div>
          ),
          enterprise: e,
        })));
      } catch {
        setOptions([]);
      }
    }, 300);
  }, [onChange]);

  const handleSelect = (val: string, option: any) => {
    onChange?.(val);
    onSelect?.(val, option.enterprise);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch?.(value || '');
    }
  };

  return (
    <AutoComplete
      value={value}
      options={options}
      onSearch={handleSearch}
      onSelect={handleSelect}
      style={{ width: 200, ...style }}
      allowClear
      onClear={() => onChange?.('')}
    >
      <Input
        placeholder={placeholder}
        prefix={<SearchOutlined style={{ color: '#8899B0' }} />}
        onKeyDown={handleKeyDown}
        style={{ borderRadius: 10, height: 40 }}
      />
    </AutoComplete>
  );
}

export default EnterpriseSearch;
