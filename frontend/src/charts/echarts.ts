import * as echarts from 'echarts/core';
import { BarChart, EffectScatterChart, LineChart, LinesChart, PieChart } from 'echarts/charts';
import {
  DataZoomComponent,
  GeoComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  EffectScatterChart,
  LineChart,
  LinesChart,
  PieChart,
  DataZoomComponent,
  GeoComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  VisualMapComponent,
  CanvasRenderer,
]);

export { echarts };
