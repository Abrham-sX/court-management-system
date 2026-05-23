import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { chartGrid, chartText, chartTooltipBg, chartTooltipBorder } from './chartTheme';
import { useLanguage } from '../../i18n';

interface TrendData {
  month: string;
  filed: number;
  resolved: number;
}

interface Props {
  data: TrendData[];
}

export const ResolutionTrendChart = ({ data }: Props) => {
  const { t } = useLanguage();

  // Helper to translate month names with fallback
  const translateMonth = (monthKey: string): string => {
    // Use the lowercase version as translation key
    const key = monthKey.toLowerCase();
    return t(key) || monthKey;
  };

  const chartData = data.map((item) => ({
    ...item,
    month: translateMonth(item.month),
  }));

  // Pre‑translate legend labels
  const filedLabel = t('filed') || 'Filed';
  const resolvedLabel = t('resolved') || 'Resolved';

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
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
            contentStyle={{
              backgroundColor: chartTooltipBg,
              borderColor: chartTooltipBorder,
              borderRadius: '12px',
              border: '1px solid var(--app-border)',
              boxShadow: 'var(--app-shadow)',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--app-muted)]">
                {value === 'filed' ? filedLabel : value === 'resolved' ? resolvedLabel : value}
              </span>
            )}
          />
          <Line
            type="monotone"
            dataKey="filed"
            stroke="var(--app-accent)"
            strokeWidth={3}
            dot={{ r: 4, fill: 'var(--app-accent)', strokeWidth: 2, stroke: 'var(--app-panel)' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
            animationDuration={2000}
            name={filedLabel}
          />
          <Line
            type="monotone"
            dataKey="resolved"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: 'var(--app-panel)' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
            animationDuration={2000}
            name={resolvedLabel}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};