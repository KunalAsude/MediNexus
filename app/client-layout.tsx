"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLoader } from "@/components/ui/LoaderContext";
import Loader from "@/components/ui/Loader"; 
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/redux/provider";
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "@/redux/store";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoading, setLoading } = useLoader();

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); 

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <Providers> 
      <PersistGate loading={null} persistor={persistor}>
        {isLoading && <Loader />} 
        {children}
        <Toaster />
      </PersistGate>
    </Providers>
  );
}
