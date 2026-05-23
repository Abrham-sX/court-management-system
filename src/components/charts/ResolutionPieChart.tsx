import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Sector,
  Legend,
} from 'recharts';
import { chartColors } from './chartTheme';
import { useLanguage } from '../../i18n';

interface Props {
  data: { filed: number; resolved: number };
}

const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    t,
  } = props;

  const ofTotalLabel = t?.('ofTotal') || 'of total';

  return (
    <g>
      <text
        x={cx}
        y={cy - 10}
        dy={8}
        textAnchor="middle"
        fill="var(--app-text)"
        className="text-xs font-black uppercase tracking-widest"
      >
        {payload.name}
      </text>
      <text
        x={cx}
        y={cy + 15}
        dy={8}
        textAnchor="middle"
        fill={fill}
        className="text-2xl font-black"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
      <text
        x={cx}
        y={cy + 35}
        dy={8}
        textAnchor="middle"
        fill="var(--app-muted)"
        className="text-[10px] font-bold"
      >
        {ofTotalLabel}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export const ResolutionPieChart = ({ data }: Props) => {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);

  const filedLabel = t('filedCases') || 'Filed';
  const resolvedLabel = t('resolvedCases') || 'Resolved';

  const chartData = [
    { name: filedLabel, value: data.filed },
    { name: resolvedLabel, value: data.resolved },
  ];

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            {...({
              activeIndex,
              activeShape: (props: any) => renderActiveShape({ ...props, t }),
              data: chartData,
              cx: '50%',
              cy: '50%',
              innerRadius: 65,
              outerRadius: 85,
              paddingAngle: 10,
              dataKey: 'value',
              stroke: 'none',
              onMouseEnter: (_: any, index: number) => setActiveIndex(index),
            } as any)}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
            ))}
          </Pie>
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)]">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};