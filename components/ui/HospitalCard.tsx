"use client";
import { Card, CardContent } from "@/components/ui/card";
import HospitalImageSlider from "./HospitalImageSlider";

export default function HospitalCard() {
  return (
    <Card className="col-span-10 bg-teal-900/20 border-teal-400/10 overflow-hidden">
      <CardContent className="p-6">
        <HospitalImageSlider />
      </CardContent>
    </Card>
  );
}
