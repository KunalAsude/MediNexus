"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { encryptKey } from "@/lib/utils";
import { Lock, X, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getDoctorsByHospital } from "@/lib/actions/patient.actions";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedDoctor } from "@/redux/slice/doctorSlice";
import { RootState, AppDispatch } from "@/redux/store";

interface Doctor {
  id: string;
  name: string;
}

const PasskeyModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [isOpen, setIsOpen] = useState(open);
  const [passkey, setPasskey] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetchedDoctors, setHasFetchedDoctors] = useState(false); // Track if doctors have been fetched
  const selectedDoctor = useSelector((state: RootState) => state.doctor.selectedDoctor);
  const router = useRouter();
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const [localDoctor, setLocalDoctor] = useState("");
  const hospitalId = useSelector((state: any) => state.hospital.selectedHospitalId);

  // Save hospitalId to localStorage whenever it changes
  useEffect(() => {
    if (hospitalId) {
      localStorage.setItem("hospitalId", hospitalId);
    }
  }, [hospitalId]);

  // Fetch doctors when modal opens and doctors haven't been fetched yet
  useEffect(() => {
    if (open && !hasFetchedDoctors && hospitalId) {
      fetchDoctors();
    }
  }, [open, hasFetchedDoctors, hospitalId]);

  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching doctors for hospitalId:", hospitalId);
      const doctorsData = await getDoctorsByHospital(hospitalId);
      console.log(doctorsData);

      const formattedDoctors = doctorsData.map((doc: any) => ({
        id: doc._id,
        name: doc.name,
      }));

      setDoctors(formattedDoctors);
      localStorage.setItem("doctors", JSON.stringify(formattedDoctors)); // Save to localStorage
      setHasFetchedDoctors(true); // Mark doctors as fetched
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setPasskey("");
    setLocalDoctor("");
    setError("");
    onClose();
  };

  const validatePasskey = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDoctor) {
      setError("Please select a doctor.");
      return;
    }

    if (passkey === process.env.NEXT_PUBLIC_ADMIN_PASSKEY) {
      const encryptedKey = encryptKey(passkey);
      localStorage.setItem("accessKey", encryptedKey);

      const doctorName = doctors.find((d) => d.id === selectedDoctor)?.name || "Doctor";

      router.push("/admin");

      toast({
        title: "Welcome Back, Admin!",
        description: `Managing appointments for ${doctorName}...`,
        variant: "default",
        duration: 2000,
      });
    } else {
      setError("Invalid Passkey");
      toast({
        title: "Invalid Passkey",
        description: "The passkey you entered is incorrect. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDocId = e.target.value;
    setLocalDoctor(selectedDocId);
    dispatch(setSelectedDoctor(selectedDocId));
  };

  return (
    <AlertDialog open={open} onOpenChange={setIsOpen}>
      <AlertDialogContent className="bg-[linear-gradient(135deg,#042F2E,#012621)] border-teal-800/30 shadow-2xl rounded-lg w-[90%] max-w-md p-6">
        <div className="flex justify-between items-center mb-2">
          <Lock className="text-teal-400 w-5 h-5" />
          <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <AlertDialogHeader className="mb-6">
          <AlertDialogTitle className="text-2xl font-semibold text-white">Admin Access</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400 mt-2">
            Enter your passkey and select a doctor to continue.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-6">
          {/* Select Doctor Dropdown */}
          <div>
            {isLoading ? (
              <div className="flex justify-center items-center">
                <Loader2 className="w-6 h-6 animate-spin text-teal-400" />
              </div>
            ) : (
              <select
                value={localDoctor}
                onChange={handleDoctorChange}
                className="w-full px-4 py-3 bg-teal-950 text-white border border-teal-800/50 rounded-md 
                          focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 
                          appearance-none transition-all"
              >
                <option value="">Select a Doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            )}

            {error && !selectedDoctor && <p className="text-sm text-red-400 mt-1">{error}</p>}
          </div>

          {/* Passkey Input */}
          <div className="relative">
            <input
              type="password"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              maxLength={6}
              className="w-full px-4 py-3 bg-teal-950/50 text-white text-center text-lg border border-teal-800/50 rounded-md 
                         focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 
                         placeholder:text-gray-500 transition-all"
              placeholder="••••••"
            />
            {error && selectedDoctor && (
              <p className="absolute -bottom-6 left-0 w-full text-sm text-red-400 text-center">{error}</p>
            )}
          </div>

          <AlertDialogFooter className="mt-8">
            <AlertDialogAction
              onClick={validatePasskey}
              className="w-full bg-teal-800 hover:bg-teal-900 text-white py-3 rounded-md 
                         transition-colors duration-200 font-medium"
            >
              Authenticate
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PasskeyModal;