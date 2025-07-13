import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { fetchDashboardData } from "../../lib/api"; // Adjust path based on your project structure

export default function TotalCasesByReceiver() {
  const [data, setData] = useState([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const dashboard = await fetchDashboardData();
        const colors = ["#3B82F6", "#F97316", "#EC4899", "#10B981", "#8B5CF6"];

        const receiverData = (dashboard.receiverDetails || []).map((item: any, index: number) => ({
          name: item._id || "Unknown",
          value: item.count,
          color: colors[index % colors.length],
        }));

        setData(receiverData);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, color } = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: color,
            color: "white",
            padding: "4px 12px",
            borderRadius: "4px",
            fontSize: "16px",
            fontWeight: "500",
          }}
        >
          {name}
        </div>
      );
    }
    return null;
  };

  const handleMouseEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className="w-full h-full">
      <div className="h-64">
        {loading ? (
          <div className="flex justify-center items-center h-full text-gray-500">Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              barGap={0}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                hide={true}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                domain={[0, 'dataMax + 1']}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={false}
                position={{ y: 0 }}
              />
              <Bar
                dataKey="value"
                radius={[4, 4, 0, 0]}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fillOpacity={activeIndex === index ? 0.7 : 1}
                  />
                ))}
                <LabelList
                  dataKey="value"
                  position="top"
                  fill="#6B7280"
                  fontSize={12}
                  offset={10}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      {!loading && (
        <div className="text-right text-gray-400 text-sm mt-2">
          {data.length} Receiver{data.length !== 1 && "s"}
        </div>
      )}
    </div>
  );
}
