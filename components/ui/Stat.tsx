'use client'
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <Card className="bg-teal-900/20 border-0 border-teal-400/10">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="text-teal-400">{icon}</div>
          {trend && (
            <div className={`text-sm ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}%
            </div>
          )}
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-medium text-teal-50">{title}</h3>
          <p className="text-2xl font-bold text-teal-300">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}