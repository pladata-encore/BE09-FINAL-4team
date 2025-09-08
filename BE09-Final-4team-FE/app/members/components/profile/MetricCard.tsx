import React from "react";

interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  bgClass?: string;
  icon?: React.ReactNode;
}

export default function MetricCard({ 
  label, 
  value, 
  bgClass = "bg-indigo-500", 
  icon 
}: MetricCardProps) {
  return (
    <div className={`rounded-xl shadow-lg p-4 flex flex-col items-start ${bgClass} text-white backdrop-blur-sm border border-white/20`}>
      <div className="flex items-center justify-between w-full mb-2">
        <div className="text-2xl font-extrabold leading-none">{value}</div>
        {icon && <div className="opacity-80">{icon}</div>}
      </div>
      <div className="text-xs opacity-90">{label}</div>
    </div>
  );
}
