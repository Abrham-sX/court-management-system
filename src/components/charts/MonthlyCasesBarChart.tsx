import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Label } from 'recharts';
import { chartColors, chartGrid, chartText, chartTooltipBg, chartTooltipBorder, demoMonthlyData } from './chartTheme';
import { useLanguage } from '../../i18n';

interface MonthlyData {
  month: string;
  cases: number;
}

interface Props {
  data: MonthlyData[];
}

export const MonthlyCasesBarChart = ({ data }: Props) => {
  const { t } = useLanguage();
  const chartData = (data?.some((item) => item.cases > 0) ? data : demoMonthlyData).map(item => ({
    ...item,
    month: t(item.month.toLowerCase()) || item.month
  }));

  const averageCases = Math.round(chartData.reduce((acc, curr) => acc + curr.cases, 0) / chartData.length);

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGrid} />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: chartText, fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: chartText, fontSize: 12 }}
          />
          <Tooltip 
            cursor={{ fill: 'var(--app-panel-soft)', radius: 8 }}
            contentStyle={{ 
              backgroundColor: chartTooltipBg, 
              borderColor: chartTooltipBorder, 
              borderRadius: '12px',
              border: '1px solid var(--app-border)',
              boxShadow: 'var(--app-shadow)',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          />
          
          <ReferenceLine 
            y={averageCases} 
            stroke="var(--app-accent)" 
            strokeDasharray="5 5" 
            strokeWidth={2}
          >
             <Label 
               value={`${t('average')}: ${averageCases}`} 
               position="top" 
               fill="var(--app-accent)" 
               className="text-[10px] font-black uppercase tracking-widest" 
             />
          </ReferenceLine>

          <Bar 
            dataKey="cases" 
            radius={[8, 8, 0, 0]} 
            barSize={32}
            animationDuration={1500}
          >
            {chartData.map((_, index) => (
               <Cell 
                 key={`cell-${index}`} 
                 fill={chartColors[index % chartColors.length]} 
                 fillOpacity={0.9} 
               />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
