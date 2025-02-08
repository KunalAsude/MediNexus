"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Building, Users, Stethoscope, Bed, Ambulance, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import HospitalCard from "@/components/ui/HospitalCard"
import { departments } from "@/constants"
import Image from "next/image"
import { getHospital } from "@/lib/actions/patient.actions"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
export interface Hospital {
  _id: string;
  name: string;
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  departments: string[];
  facilities: string[];
  ratings: {
    average: number;
    reviews: number;
  };
  image: string;
  description: string;
  status: string;
}

export default function HospitalDetails() {
  const { toast } = useToast();
  const [hospital, setHospital] = useState<Hospital | null>(
    () => JSON.parse(localStorage.getItem("hospital") || "null") // Load from localStorage
  );
  const hospitalId = useSelector((state: any) => state.hospital.selectedHospitalId);

  useEffect(() => {
    if (!hospitalId) return;

    const getHospitalDetails = async () => {
      try {
        const hospitalData = await getHospital(hospitalId);
        console.log(hospitalData);

        if (hospitalData) {
          setHospital(hospitalData);
          localStorage.setItem("hospital", JSON.stringify(hospitalData)); // Store in localStorage
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch hospital data." });
      }
    };

    getHospitalDetails();
  }, [hospitalId]);


  const handleLinkClick = (e: React.MouseEvent, featureName: string) => {
    e.preventDefault()
    toast({
      title: `${featureName} Under Construction`,
      description: `${featureName} is currently being built. Please check back later.`,
      variant: "destructive",
    })
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="admin-header mb-2 flex justify-between items-center px-4">
  {/* MediNexus Logo - Hidden on Extra-Small Screens */}
  <Link href="/dashboard" className="hidden sm:flex flex-row items-center cursor-pointer">
    <img
      src="https://img.icons8.com/arcade/64/hospital.png"
      alt="MediNexus Logo"
      height="100"
      width="100"
      className="h-10 w-auto"
    />
    <div className="text-lg font-bold text-teal-400 ml-2">MediNexus</div>
  </Link>

  {/* Back Button for Extra-Small Screens */}
  <Link
    href="/dashboard"
    className="flex sm:hidden items-center text-sm font-bold text-teal-400 hover:underline cursor-pointer"
  >
    <ArrowLeft className="h-8 w-8 sm:h-6 sm:w-6" />
  </Link>

  {/* Hospital Logo and Name - Adjust for Mobile Screens */}
  <div className="flex flex-row gap-4 sm:gap-1 items-center cursor-pointer">
    <Image
      src={hospital?.image || "https://img.icons8.com/arcade/64/hospital.png"}
      alt={hospital?.name || "Hospital"}
      width={100}
      height={100}
      className="h-16 w-16 sm:h-12 sm:w-12 md:h-10 md:w-10 rounded-lg object-cover"
    />
    <p className="text-lg sm:text-sm font-bold text-teal-400">{hospital?.name}</p>
  </div>
</header>






      {/* Main Content */}
      <main className="h-[calc(100vh-60px)] overflow-auto remove-scrollbar p-4">
        {/* Departments Section */}


        {/* Hospital Overview */}
        <section className="mb-8">
          <HospitalCard />
          <p className="text-gray-300 text-xl font-bold  mt-4">
            {hospital?.description}
          </p>
        </section>



        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">Key Departments</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospital?.departments?.map((dept, index) => (
              <Card
                key={index}
                className="bg-teal-900/20 border-teal-400/10 rounded-lg shadow-lg  hover:border-teal-400 hover:border-1 cursor-pointer "
              >
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-300 mb-4">{dept}</h3>
                  <p className="text-teal-200">
                    {/* You can add some description or additional info here for each department */}
                    Explore services, treatments, and specialists in {dept}.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">Key Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-teal-900/20 border-teal-400/10 rounded-lg shadow-lg hover:border-teal-400 hover:border-1 cursor-pointer">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-300 mb-4">500+ Beds</h3>
                <p className="text-teal-200">A large capacity to handle a wide range of patients and treatments.</p>
              </CardContent>
            </Card>
            <Card className="bg-teal-900/20 border-teal-400/10 rounded-lg shadow-lg hover:border-teal-400 hover:border-1 cursor-pointer">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-300 mb-4">1000+ Staff Members</h3>
                <p className="text-teal-200">Our dedicated medical staff ensures top-notch care at all times.</p>
              </CardContent>
            </Card>
            <Card className="bg-teal-900/20 border-teal-400/10 rounded-lg shadow-lg hover:border-teal-400 hover:border-1 cursor-pointer">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-300 mb-4">50+ Specialties</h3>
                <p className="text-teal-200">A variety of specialties to meet all your healthcare needs.</p>
              </CardContent>
            </Card>
            <Card className="bg-teal-900/20 border-teal-400/10 rounded-lg shadow-lg hover:border-teal-400 hover:border-1 cursor-pointer">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-300 mb-4">Ratings And Reviews</h3>
                <p className="text-teal-200">Average : {hospital?.ratings?.average}</p>
                <p className="text-teal-200">Reviews : {hospital?.ratings?.reviews}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">Facilities</h2>
          <Card className="bg-teal-900/20 border-teal-400/10">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-4">Facilities</h3>
              <ul className="space-y-2">
                {hospital?.facilities?.map((facility, index) => (
                  <li key={index} className="flex items-center text-teal-200">
                    <Building className="h-5 w-5 mr-2 text-teal-400" />
                    <span>{facility}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>


        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">Contact Information</h2>
          <Card className="bg-teal-900/20 border-teal-400/10">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-4">Contact Information</h3>
              <p className="text-teal-200">{hospital?.location?.address}</p>
              <p className="text-teal-200">{hospital?.location?.pincode}</p>
              <p className="text-teal-200">{hospital?.contact?.phone}</p>
              <p className="text-teal-200">{hospital?.contact?.email}</p>
              <p className="text-teal-200">{hospital?.contact?.website}</p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">Recent Achievements</h2>
          <Card className="bg-teal-900/20 border-teal-400/10">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-4">Recent Achievements</h3>
              <ul className="space-y-2">
                <li className="text-teal-200">• Awarded "Best Hospital" in the region</li>
                <li className="text-teal-200">• Successfully performed 1000+ heart surgeries</li>
                <li className="text-teal-200">• Introduced cutting-edge robotic surgery technology</li>
              </ul>
            </CardContent>
          </Card>
        </section>
        <footer className="bg-teal-900/20 text-center p-4 mt-auto">
          <div className="text-whitw">
            © MediNexus 2025
          </div>
        </footer>

      </main>
    </div>
  )
}
