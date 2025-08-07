// src/components/ChartRenderer.tsx
import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export type DataPoint = {
  time: string;
  uptime: number;
  errors: number;
  alerts: number;
  incidents: number;
};

type ChartRenderProps = {
  data: DataPoint[];
  title: string;
  dataKeyX: keyof DataPoint;
  dataKeyY: keyof DataPoint;
  type: "line" | "bar"; // 👈 add this
};

const ChartRenderer: React.FC<ChartRenderProps> = ({
  data,
  title,
  dataKeyX,
  dataKeyY,
  type,
}) => {
  return (
    <div className="bg-gray-900 p-4 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {type === "line" ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dataKeyX} />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey={dataKeyY}
              stroke="#8884d8"
              strokeWidth={2}
            />
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dataKeyX} />
            <YAxis />
            <Tooltip />
            <Bar dataKey={dataKeyY} fill="#8884d8" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default ChartRenderer;
