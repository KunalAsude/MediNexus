"use client";
import { Card, CardContent } from "@/components/ui/card";
import HospitalImageSlider from "./HospitalImageSlider";

export default function HospitalCard() {
  return (
    <Card className="col-span-full bg-teal-900/20 border-teal-400/10 overflow-hidden">
      <CardContent className="p-6">
        <p className="text-gray-300 text-xl font-bold mb-4">
          Delivering exceptional healthcare with cutting-edge technology and compassionate care.
        </p>

        <HospitalImageSlider />
      </CardContent>
    </Card>
  );
}
