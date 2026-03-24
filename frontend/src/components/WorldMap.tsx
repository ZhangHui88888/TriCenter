import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const REGION_COORDS: Record<string, [number, number]> = {
  '北美': [-100, 40],
  '欧洲': [10, 50],
  '东南亚': [110, 5],
  '中东': [45, 28],
  '南美': [-60, -15],
  '日韩': [130, 37],
  '澳新': [145, -28],
  '非洲': [20, 0],
  /** 与字典 region 类目一致（tricenter_schema 种子） */
  '东亚': [128, 38],
  '南亚': [78, 22],
  '大洋洲': [160, -22],
  '俄罗斯': [90, 60],
  '中亚': [65, 42],
  '美国': [-98, 38],
  '加拿大': [-106, 56],
  '英国': [-1, 53],
  '德国': [10, 51],
  '法国': [2, 47],
  '意大利': [12, 42],
  '西班牙': [-4, 40],
  '荷兰': [5, 52],
  '日本': [138, 36],
  '韩国': [127, 36],
  '澳大利亚': [134, -25],
  '新西兰': [174, -41],
  '巴西': [-51, -14],
  '印度': [78, 22],
  '泰国': [100, 15],
  '越南': [106, 16],
  '马来西亚': [102, 4],
  '印度尼西亚': [117, -2],
  '菲律宾': [122, 13],
  '新加坡': [104, 1],
  '沙特阿拉伯': [45, 24],
  '阿联酋': [54, 24],
  '土耳其': [35, 39],
  '墨西哥': [-102, 23],
  '波兰': [20, 52],
  '南非': [25, -29],
  '埃及': [30, 27],
  '尼日利亚': [8, 10],
  '阿根廷': [-64, -34],
  '智利': [-71, -33],
  '哥伦比亚': [-74, 4],
};

const CHANGZHOU: [number, number] = [119.95, 31.77];

interface Props {
  data: { name: string; count: number }[];
  style?: React.CSSProperties;
}

/** 全局只拉取、注册一次地图，避免多次 init 与并发 fetch 竞态 */
let worldMapReadyPromise: Promise<void> | null = null;

function ensureWorldMapRegistered(): Promise<void> {
  if (!worldMapReadyPromise) {
    worldMapReadyPromise = fetch('/world.json')
      .then((res) => res.json())
      .then((mapJson) => {
        echarts.registerMap('world', mapJson);
      });
  }
  return worldMapReadyPromise;
}

/** 供父组件做 remount key，与内部渲染数据一致 */
export function worldMapDataKey(rows: { name: string; count: number }[]): string {
  return rows.map((d) => `${d.name}:${d.count}`).join('|');
}

function WorldMap({ data, style }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const dataSig = worldMapDataKey(data);

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;

    let cancelled = false;
    let resizeHandler: (() => void) | null = null;

    const teardown = () => {
      if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
        resizeHandler = null;
      }
      // 必须按 DOM 销毁：init 可能产生实例而 ref 未同步，残留实例会导致「叠多层点」
      echarts.dispose(el);
    };

    const run = async () => {
      await ensureWorldMapRegistered();
      if (cancelled || !chartRef.current) return;

      teardown();

      if (cancelled || !chartRef.current) return;

      const dom = chartRef.current;
      const chart = echarts.init(dom);

      const scatterData = data
        .filter((d) => REGION_COORDS[d.name])
        .map((d) => ({
          name: d.name,
          value: [...REGION_COORDS[d.name], d.count] as [number, number, number],
        }));

      const flyLines = scatterData.map((d) => ({
        fromName: '常州',
        toName: d.name,
        coords: [CHANGZHOU, [d.value[0], d.value[1]]],
      }));

      const maxCount = Math.max(...data.map((d) => d.count), 1);

      chart.setOption(
        {
          backgroundColor: 'transparent',
          tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(10,13,16,0.9)',
            borderColor: '#3A4560',
            textStyle: { color: '#CED8E1', fontSize: 13 },
            formatter: (params: any) => {
              if (params.seriesType === 'effectScatter') {
                return `<b>${params.name}</b><br/>企业客户: ${params.value[2]} 家`;
              }
              if (params.seriesType === 'lines') {
                return `常州 → ${params.data.toName}`;
              }
              return params.name;
            },
          },
          geo: {
            map: 'world',
            roam: true,
            zoom: 1.2,
            center: [60, 25],
            scaleLimit: { min: 1, max: 8 },
            silent: false,
            itemStyle: {
              areaColor: '#151A22',
              borderColor: '#2A3345',
              borderWidth: 0.5,
            },
            emphasis: {
              itemStyle: {
                areaColor: '#1C2535',
                borderColor: '#4361EE',
              },
              label: { show: false },
            },
            label: { show: false },
          },
          series: [
            {
              name: '飞线',
              type: 'lines',
              coordinateSystem: 'geo',
              zlevel: 1,
              effect: {
                show: true,
                period: 4,
                trailLength: 0.4,
                symbol: 'arrow',
                symbolSize: 5,
                color: '#00FAFF',
              },
              lineStyle: {
                color: '#4361EE',
                width: 1.2,
                opacity: 0.4,
                curveness: 0.3,
              },
              data: flyLines,
            },
            {
              name: '客户分布',
              type: 'effectScatter',
              coordinateSystem: 'geo',
              zlevel: 2,
              rippleEffect: {
                brushType: 'stroke',
                period: 3,
                scale: 4,
              },
              symbol: 'circle',
              symbolSize: (val: number[]) => Math.max(8, (val[2] / maxCount) * 28),
              itemStyle: {
                color: '#00FAFF',
                shadowBlur: 12,
                shadowColor: 'rgba(0,250,255,0.5)',
              },
              data: scatterData,
            },
            {
              name: '常州',
              type: 'effectScatter',
              coordinateSystem: 'geo',
              zlevel: 3,
              rippleEffect: {
                brushType: 'stroke',
                period: 2.5,
                scale: 6,
              },
              symbol: 'circle',
              symbolSize: 14,
              itemStyle: {
                color: '#F72585',
                shadowBlur: 16,
                shadowColor: 'rgba(247,37,133,0.6)',
              },
              label: {
                show: true,
                formatter: '常州',
                position: 'right',
                color: '#F72585',
                fontSize: 13,
                fontWeight: 600,
              },
              data: [{ name: '常州', value: [...CHANGZHOU, 0] }],
            },
          ],
        },
        { notMerge: true },
      );

      if (cancelled) {
        echarts.dispose(dom);
        return;
      }

      resizeHandler = () => {
        const inst = echarts.getInstanceByDom(dom);
        inst?.resize();
      };
      window.addEventListener('resize', resizeHandler);
    };

    void run();

    return () => {
      cancelled = true;
      teardown();
    };
  }, [dataSig, data]);

  return <div ref={chartRef} style={{ width: '100%', height: 450, ...style }} />;
}

export default WorldMap;
