"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLoader } from "@/components/ui/LoaderContext";
import Loader from "@/components/ui/Loader"; // Import the loader component

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoading, setLoading } = useLoader();

  useEffect(() => {
    // Set loading to true when the pathname changes
    setLoading(true);

    // Simulate loading completion after a short delay (you can adjust this)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Adjust the timeout as needed

    // Cleanup function to clear the timer
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {isLoading && <Loader />} 
      {children}
    </>
  );
}