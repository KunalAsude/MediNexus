import { Loader2 } from "lucide-react";

const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-r from-[#003e34] to-[#012621] bg-opacity-80 z-50">
      <div className="relative flex flex-col items-center justify-center w-1/2 h-1/2">
        <div className="absolute w-36 h-36 rounded-full border-t-4 border-white border-solid animate-spin"></div>
        {/* <Loader2 className="relative w-20 h-20 text-white animate-pulse" /> */}
        <p className="text-white text-2xl font-semibold mt-60 animate-bounce">Loading...</p>
      </div>
    </div>
  );
};

export default Loader;
