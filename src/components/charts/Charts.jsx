import React from 'react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  PieChart, Pie, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, PolarRadiusAxis
} from 'recharts';
import { CHART_COLORS } from '../../constants/colors';

// ─── Custom Theme-Aware Tooltip ───────────────────────────────────
const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-light-card dark:bg-dark-card rounded-xl p-3 shadow-card-md dark:shadow-card-md-dark border border-light-border dark:border-dark-border">
      <p className="text-xs text-light-text-muted dark:text-dark-text-muted mb-1.5 font-semibold">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs py-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-light-text-secondary dark:text-dark-text-secondary">{entry.name}:</span>
          <span className="text-light-text-primary dark:text-dark-text-primary font-bold">
            {formatter ? formatter(entry.value) : (typeof entry.value === 'number' ? entry.value.toLocaleString('en-IN') : entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

const axisStyle = { fill: '#8896A7', fontSize: 11, fontWeight: 500 };
const gridStyle = { stroke: 'rgba(136, 150, 167, 0.15)', strokeDasharray: '3 3' };

const ChartEmptyState = ({ height = 280, message = 'No metric data available for the selected period' }) => (
  <div
    className="flex flex-col items-center justify-center text-light-text-muted dark:text-dark-text-muted text-xs p-6 border border-dashed border-light-border dark:border-dark-border rounded-xl"
    style={{ height }}
  >
    <p className="font-medium text-center">{message}</p>
    <span className="text-[10px] mt-1 text-light-text-muted/70 dark:text-dark-text-muted/70">
      Recorded transactions will automatically display here
    </span>
  </div>
);

// ─── Area Chart ───────────────────────────────────────
export const AreaChartWidget = ({ data, keys, formatter, height = 280 }) => {
  const safeData = Array.isArray(data) ? data : [];
  const safeKeys = Array.isArray(keys) ? keys : [];

  if (safeData.length === 0 || safeKeys.length === 0) {
    return <ChartEmptyState height={height} message="No revenue trend records found for this period" />;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={safeData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
        <defs>
          {safeKeys.map((k, i) => (
            <linearGradient key={k.key} id={`grad-${k.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={k.color || CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.2} />
              <stop offset="100%" stopColor={k.color || CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.01} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid {...gridStyle} />
        <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={formatter} />
        <Tooltip content={<CustomTooltip formatter={formatter} />} />
        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
        {safeKeys.map((k, i) => (
          <Area
            key={k.key}
            type="monotone"
            dataKey={k.key}
            name={k.name}
            stroke={k.color || CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={2}
            fill={`url(#grad-${k.key})`}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

// ─── Line Chart ───────────────────────────────────────
export const LineChartWidget = ({ data, keys, formatter, height = 280 }) => {
  const safeData = Array.isArray(data) ? data : [];
  const safeKeys = Array.isArray(keys) ? keys : [];

  if (safeData.length === 0 || safeKeys.length === 0) {
    return <ChartEmptyState height={height} message="No growth trajectory data available" />;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={safeData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
        <CartesianGrid {...gridStyle} />
        <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={formatter} />
        <Tooltip content={<CustomTooltip formatter={formatter} />} />
        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
        {safeKeys.map((k, i) => (
          <Line
            key={k.key}
            type="monotone"
            dataKey={k.key}
            name={k.name}
            stroke={k.color || CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={2}
            dot={{ fill: k.color || CHART_COLORS[i % CHART_COLORS.length], strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

// ─── Bar Chart ────────────────────────────────────────
export const BarChartWidget = ({ data, keys, formatter, height = 280 }) => {
  const safeData = Array.isArray(data) ? data : [];
  const safeKeys = Array.isArray(keys) ? keys : [];

  if (safeData.length === 0 || safeKeys.length === 0) {
    return <ChartEmptyState height={height} message="No comparative quarterly metrics available" />;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={safeData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }} barGap={4}>
        <CartesianGrid {...gridStyle} />
        <XAxis dataKey={safeData[0]?.quarter ? 'quarter' : 'month'} tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={formatter} />
        <Tooltip content={<CustomTooltip formatter={formatter} />} />
        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
        {safeKeys.map((k, i) => (
          <Bar
            key={k.key}
            dataKey={k.key}
            name={k.name}
            fill={k.color || CHART_COLORS[i % CHART_COLORS.length]}
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

// ─── Pie Chart ────────────────────────────────────────
export const PieChartWidget = ({ data, formatter, height = 280 }) => {
  const safeData = Array.isArray(data) ? data : [];

  if (safeData.length === 0) {
    return <ChartEmptyState height={height} message="No distribution records found" />;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={safeData}
          cx="50%"
          cy="50%"
          outerRadius={95}
          dataKey="value"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value}%`}
        >
          {safeData.map((entry, i) => (
            <Cell key={i} fill={entry.color || CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip formatter={formatter} />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

// ─── Donut Chart ──────────────────────────────────────
export const DonutChartWidget = ({ data, centerLabel, centerValue, formatter, height = 280 }) => {
  const safeData = Array.isArray(data) ? data : [];

  if (safeData.length === 0) {
    return <ChartEmptyState height={height} message="No cost allocation entries in this range" />;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={safeData}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
        >
          {safeData.map((entry, i) => (
            <Cell key={i} fill={entry.color || CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip formatter={formatter} />} />
        {centerLabel && (
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
            <tspan x="50%" dy="-6" style={{ fill: 'currentColor', fontSize: '18px', fontWeight: 700 }}>{centerValue}</tspan>
            <tspan x="50%" dy="20" style={{ fill: '#8896A7', fontSize: '10px' }}>{centerLabel}</tspan>
          </text>
        )}
      </PieChart>
    </ResponsiveContainer>
  );
};

// ─── Radar Chart ──────────────────────────────────────
export const RadarChartWidget = ({ data, height = 280 }) => {
  const safeData = Array.isArray(data) ? data : [];

  if (safeData.length === 0) {
    return <ChartEmptyState height={height} message="No benchmark radar scores recorded" />;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={safeData} cx="50%" cy="50%" outerRadius="75%">
        <PolarGrid stroke="rgba(136, 150, 167, 0.2)" />
        <PolarAngleAxis dataKey="subject" tick={axisStyle} />
        <PolarRadiusAxis tick={false} axisLine={false} />
        <Radar name="Current" dataKey="A" stroke="#5278A6" fill="#5278A6" fillOpacity={0.2} strokeWidth={2} />
        <Radar name="Target" dataKey="B" stroke="#5A8065" fill="#5A8065" fillOpacity={0.15} strokeWidth={1.5} strokeDasharray="4 4" />
        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
};
