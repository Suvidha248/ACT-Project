// src/pages/AnalyticsTab.tsx
import React from "react";
import ChartRenderer from "../components/ChartRenderer";
import { atlantaDeviceData } from "../data/atlantaDeviceData";

const AnalyticsTab: React.FC = () => {
  return (
    <div className="p-4 space-y-8">
      <h2 className="text-xl font-bold">Analytics Dashboard</h2>
      <ChartRenderer
        data={atlantaDeviceData}
        type="line"
        title="Device Uptime % (Atlanta)"
        dataKeyX="time"
        dataKeyY="uptime"
      />
      {/* Repeat for other charts */}
    </div>
  );
};

export default AnalyticsTab;
