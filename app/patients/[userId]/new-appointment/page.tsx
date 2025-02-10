"use client";

import { useEffect, useState } from "react";
import AppointmentForm from "@/components/forms/Appointment";
import { Card, CardContent } from "@/components/ui/card";
import { getDoctorsByHospital, getRegisteredPatient } from "@/lib/actions/patient.actions";
import { Star, Search } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useSelector } from "react-redux";

export default function NewAppointment({ params }: { params: { userId: string } }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(params.userId || null);
  const hospitalId = useSelector((state: any) => state.hospital.selectedHospitalId);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isSmallLoading, setIsSmallLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  // Store userId in local storage and retrieve it when needed
  useEffect(() => {
    if (params.userId) {
      localStorage.setItem("userId", params.userId);
      setUserId(params.userId);
    } else {
      const storedUserId = localStorage.getItem("userId");
      if (storedUserId) setUserId(storedUserId);
    }
  }, [params.userId]);

  // Fetch patient details
  useEffect(() => {
    if (!userId) return;

    const getPatient = async () => {
      try {
        setLoading(true);
        const patientData = await getRegisteredPatient(userId);
        console.log("Registered Patient:", patientData);
        setPatient(patientData);
      } catch (error) {
        console.error("Error fetching patient:", error);
      } finally {
        setLoading(false);
      }
    };

    getPatient();
  }, [userId]);

  // Store hospitalId in local storage and retrieve it when needed
  useEffect(() => {
    if (hospitalId) {
      localStorage.setItem("hospitalId", hospitalId);
    }
  }, [hospitalId]);

  useEffect(() => {
    const storedHospitalId = localStorage.getItem("hospitalId");
    if (!hospitalId && storedHospitalId) {
      setDoctors([]); // Reset doctors before fetching
      fetchDoctors(storedHospitalId);
    } else if (hospitalId) {
      fetchDoctors(hospitalId);
    }
  }, [hospitalId]);

  const fetchDoctors = async (id: string) => {
    setIsSmallLoading(true);
    try {
      const fetchedDoctors = await getDoctorsByHospital(id);
      setDoctors(fetchedDoctors);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setIsSmallLoading(false);
    }
  };

  // Filter doctors based on search term
  const filteredDoctors = doctors.filter((doctor) =>
    `${doctor.name} ${doctor.specialization} ${doctor.hospital}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row h-screen max-h-screen w-full bg-[linear-gradient(to_right,#012621,#002A1C)]">
      {/* Sidebar - Doctor List */}
      <div className="hidden lg:block w-full lg:w-2/5 xl:w-1/3 p-4 sm:p-6 overflow-y-auto bg-[linear-gradient(to_right,#042F2E)] custom-scrollbar border-b lg:border-b-0 lg:border-r border-teal-900/30">
        <div className="mb-7">
          <div className="flex items-center mb-5 sm:mb-7">
            <img
              src="https://img.icons8.com/arcade/64/hospital.png"
              alt="MediNexus Logo"
              className="h-8 sm:h-10 w-auto mr-3"
            />
            <h1 className="text-xl sm:text-2xl font-bold text-teal-300">MediNexus</h1>
          </div>
          <h2 className="text-sm sm:text-sm mt-4 font-semibold text-teal-100 mb-1">Choose Your Physician</h2>
          <div className="relative mb-5 mt-8">
            <Input
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 sm:h-11 shad-input border rounded-lg px-4"
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-teal-400/50" size={20} />
          </div>
        </div>

        {/* Doctor List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <Card
                key={doctor.id}
                className="bg-teal-900/20 border-teal-400/10 hover:bg-teal-900/30 transition-all hover:scale-[1.02] "
                onClick={() => {
                  setSelectedDoctor(doctor);
                }}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-5">
                    <div className="relative w-16 h-12 sm:w-15 sm:h-12  mr-3 sm:mr-4">
                      <Image
                        src={doctor?.image || "/placeholder.svg"}
                        alt="Doctor"
                        width={80}
                        height={80}
                        className="rounded-xl object-fit w-full h-full border-2 border-teal-700 shadow-md"
                      />
                      <div className="absolute -top-1 -right-1 bg-teal-900/90 px-1.5 py-0.5 rounded-full flex items-center">
                        <Star className="h-3 w-3 text-yellow-400 mr-1" fill="currentColor" />
                        <span className="text-white text-xs font-medium">{doctor?.ratings_average}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between w-full">
                    <div>
                      <p className="text-teal-300 font-semibold">{doctor?.name}</p>
                      <p className="text-sm text-white">{doctor?.specialization}</p>
                      
                    </div>
                    <div>
                    <p className="text-sm text-white">{doctor?.experience} years Experience</p>
                      <p
                        className={`text-sm ${doctor?.status === "active" ? "text-green-400" : "text-red-400"
                          }`}
                      >
                        {doctor?.status}
                      </p>
                    </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-teal-400/60 text-center text-sm">No doctors found.</p>
          )}
        </div>
      </div>

      {/* Right Section - Appointment Form */}
      <div className="lg:w-3/5 xl:w-2/3 p-8 overflow-y-auto custom-scrollbar bg-[#012621]/70 backdrop-blur-lg">
        <h2 className="text-3xl font-semibold text-teal-100 mb-8">Book an Appointment</h2>

        {/* Show loading or patient details */}
        {loading ? (
          <p className="text-teal-300">Loading patient details...</p>
        ) : patient ? (
          <AppointmentForm type="create" patientId={patient._id} patientName={patient.name} userId={userId || ""} />
        ) : (
          <p className="text-red-400">No patient data found.</p>
        )}
      </div>
    </div>
  );
}
