import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CareerChartProps {
  salaryData: {
    role: string;
    years: number[];
    salaries: number[];
  }[];
}

export function CareerChart({ salaryData }: CareerChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Salary Progression Comparison',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };

  const data = {
    labels: salaryData[0]?.years.map(year => `Year ${year}`) || [],
    datasets: salaryData.map((roleData, index) => ({
      label: roleData.role,
      data: roleData.salaries,
      borderColor: index === 0 ? '#1976D2' : '#388E3C',
      backgroundColor: index === 0 ? 'rgba(25, 118, 210, 0.1)' : 'rgba(56, 142, 60, 0.1)',
      tension: 0.1,
    })),
  };

  return (
    <div className="h-64">
      <Line options={options} data={data} />
    </div>
  );
}
