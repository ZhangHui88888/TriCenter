import DashboardRanking from './dashboard/DashboardRanking';

export type DistributionItem = { name: string; count: number };
const typeAliases: Record<string, string> = {
  生产型: '工厂', 贸易型: '贸易商',
  供应链服务型: '服务商', 技术服务型: '服务商', 综合服务型: '服务商',
};

export default function DashboardDistributions({ districts, types }: {
  districts: DistributionItem[]; types: DistributionItem[];
}) {
  const groupedTypes = new Map<string, number>([
    ['工厂', 0], ['工贸一体', 0], ['贸易商', 0], ['服务商', 0],
  ]);
  types.forEach(item => {
    const name = typeAliases[item.name] || item.name;
    groupedTypes.set(name, (groupedTypes.get(name) || 0) + item.count);
  });
  return <>
    <DashboardRanking title="企业类型分布" subtitle="同类企业合并统计" separateUnknown
      data={Array.from(groupedTypes, ([name, count]) => ({ name, count }))}
      total={types.reduce((sum, item) => sum + item.count, 0)} />
    <DashboardRanking title="区域分布" subtitle="区县覆盖 · 按企业数排序" separateUnknown
      data={districts} total={districts.reduce((sum, item) => sum + item.count, 0)} />
  </>;
}
