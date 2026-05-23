import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sector,
} from 'recharts';

import { chartColors, demoStatusData } from './chartTheme';
import { useLanguage } from '../../i18n';

interface CaseStatusData {
  name: string;
  value: number;
  fill?: string;
}

interface Props {
  data: CaseStatusData[];
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;

  return (
    <g>
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="var(--app-text)" className="text-sm font-black font-display uppercase tracking-wider">
        {payload.name}
      </text>
      <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill={fill} className="text-xl font-black">
        {`${(percent * 100).toFixed(1)}%`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: 'drop-shadow(0px 0px 12px rgba(var(--app-accent-rgb), 0.3))' }}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 15}
        fill={fill}
        opacity={0.3}
      />
    </g>
  );
};

export const CaseStatusPieChart = ({ data }: Props) => {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);

  const chartData =
    data?.some((item) => item.value > 0)
      ? data.map(item => ({ ...item, name: t(item.name.toLowerCase()) || item.name }))
      : demoStatusData.map(item => ({ ...item, name: t(item.name.toLowerCase()) || item.name }));

  const total = chartData.reduce((acc, cur) => acc + cur.value, 0);

  return (
    <div className="w-full h-80 relative group">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            {...({
              activeIndex,
              activeShape: renderActiveShape,
              data: chartData,
              cx: "50%",
              cy: "50%",
              innerRadius: 70,
              outerRadius: 100,
              paddingAngle: 8,
              dataKey: "value",
              stroke: "none",
              onMouseEnter: (_: any, index: number) => setActiveIndex(index),
              animationBegin: 0,
              animationDuration: 1500,
            } as any)}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fill || chartColors[index % chartColors.length]}
                className="transition-all duration-500 hover:opacity-80"
              />
            ))}
          </Pie>
          <Tooltip 
             content={() => null} 
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)] transition-colors hover:text-[var(--app-accent)]">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Absolute center label for when not hovering? Actually active shape handles it now */}
      {!activeIndex && activeIndex !== 0 && (
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)] mb-1">{t('total')}</p>
            <p className="text-3xl font-black text-[var(--app-text)]">{total}</p>
         </div>
      )}
    </div>
  );
};