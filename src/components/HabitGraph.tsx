import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface HabitGraphProps {
  data: Array<{
    date: string;
    completed: number;
  }>;
  color?: string;
  height?: string | number;
  width?: string | number;
  maxValue?: number;
}

const HabitGraph = ({ 
  data, 
  color = "#8884d8", 
  height = "200px", 
  width = "100%",
  maxValue
}: HabitGraphProps) => {
  // Calculate the maximum value from data or use provided maxValue
  const yMax = maxValue || (data?.length ? Math.max(...data.map(d => d.completed), 5) : 5);

  return (
    <div style={{ height, width }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <XAxis 
            dataKey="date"
            tickMargin={5}
          />
          <YAxis 
            allowDecimals={false}
            domain={[0, maxValue]}
            tickCount={maxValue ? maxValue + 1 : 6}
            minTickGap={1}
          />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="completed" 
            stroke={color} 
            strokeWidth={2}
            dot={{ fill: color }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HabitGraph; 