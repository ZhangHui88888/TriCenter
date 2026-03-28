/** Tabs 文案 + data-tour，供顶栏 Tour 逐标签高亮 */
export function enterpriseDetailTabLabel(text: string, tourKey: string) {
  return <span data-tour={`enterprise-detail-tab-${tourKey}`}>{text}</span>;
}
