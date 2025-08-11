import 'chart.js/auto';
import { Chart } from 'react-chartjs-2';

export function DonutChart({ data, options }) {

  options.responsive = true;
  options.maintainAspectRatio = false;
  options.scales.x.ticks.display = false; 
  options.scales.y.ticks.display = false;
  options.scales.x.display = false;
  options.scales.y.display = false;

  return <Chart type='doughnut' data={ data } options={ options } />

}
