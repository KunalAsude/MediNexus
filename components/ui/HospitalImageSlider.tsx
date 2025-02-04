"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import { motion } from "framer-motion";
import { hospitalImages } from "@/constants";

export default function HospitalImageSlider() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="rounded-lg overflow-hidden"
    >
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop
        className="w-full h-[60vh] rounded-lg"  // Increased height to 60vh
      >
        {hospitalImages.map((img, index) => (
          <SwiperSlide key={index}>
            <img
              src={img}
              alt={`Hospital ${index + 1}`}
              className="w-full h-full object-cover object-center shadow-lg"  // Ensures the image is centered and covers the space
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </motion.div>
  );
}
