// components/GaugeChart.tsx
import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsMore from 'highcharts/highcharts-more';

// Inicializa el módulo adicional de Highcharts
HighchartsMore(Highcharts);

const GaugeChart: React.FC = () => {
  const options: Highcharts.Options = {
    chart: {
      type: 'gauge',
      height: '60%',
    },
    title: {
      text: 'Velocímetro Genérico',
    },
    pane: {
      startAngle: -150,
      endAngle: 150,
      background: [{
        backgroundColor: '#EEE',
        borderWidth: 0,
        outerRadius: '109%',
        innerRadius: '100%',
      }]
    },
    yAxis: {
      min: 0,
      max: 200,
      title: {
        text: 'km/h',
      },
      plotBands: [{
        from: 0,
        to: 90,
        color: '#55BF3B' // verde
      }, {
        from: 90,
        to: 130,
        color: '#DDDF0D' // amarillo
      }, {
        from: 130,
        to: 200,
        color: '#DF5353' // rojo
      }]
    },
    series: [{
      name: 'Velocidad',
      data: [120],
      tooltip: {
        valueSuffix: ' km/h'
      },
      type: 'gauge'
    }]
  };

  return (
    <div style={{ width: '100%', maxWidth: 500, margin: '0 auto' }}>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
    </div>
  );
};

export default GaugeChart;
