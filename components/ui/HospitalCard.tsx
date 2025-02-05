"use client";
import { Card, CardContent } from "@/components/ui/card";
import HospitalImageSlider from "./HospitalImageSlider";

export default function HospitalCard() {
  return (
    <Card className="col-span-full bg-teal-900/20 border-teal-400/10 overflow-hidden">
      <CardContent className="p-6">
        <HospitalImageSlider />
        <p className="text-gray-300 text-xl font-bold  mt-2">
          Delivering exceptional healthcare with cutting-edge technology and compassionate care.
        </p>
      </CardContent>
    </Card>
  );
}
