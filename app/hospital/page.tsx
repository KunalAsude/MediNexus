"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Building, Users, Stethoscope, Bed, Ambulance, Clock } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import HospitalCard from "@/components/ui/HospitalCard"
import { departments } from "@/constants"
import Image from "next/image"

export default function HospitalDetails() {
  const { toast } = useToast()

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
      <header className="admin-header mb-3">
        <Link href="/" className="cursor-pointer">
          <div className="flex flex-row align-middle">
            <img
              src="https://img.icons8.com/arcade/64/hospital.png"
              alt="MediNexus Logo"
              height="100px"
              width="100px"
              className="h-10 w-fit"
            />
            <div className="text-lg font-bold flex items-center justify-center text-teal-400">MediNexus</div>
          </div>
        </Link>
        <div className="flex flex-row gap-2 align-middle justify-center items-center cursor-pointer">
          <Image
          src='/assets/images/cityline.webp'
          alt="Cityline Hospital"
          width={100}
          height={100}
          className="h-12 w-fit rounded-lg"
          />
        <p className="text-xl font-bold flex items-center justify-center text-teal-400">Cityline Hospital</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-60px)] overflow-auto remove-scrollbar p-4">
        {/* Departments Section */}


        {/* Hospital Overview */}
        <section className="mb-8">
          <HospitalCard />
        </section>



        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">Key Departments</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, index) => (
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
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">Facilities</h2>
          <Card className="bg-teal-900/20 border-teal-400/10">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-4">Facilities</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-teal-200">
                  <Building className="h-5 w-5 mr-2 text-teal-400" />
                  <span>Modern Infrastructure</span>
                </li>
                <li className="flex items-center text-teal-200">
                  <Ambulance className="h-5 w-5 mr-2 text-teal-400" />
                  <span>24/7 Emergency Services</span>
                </li>
                <li className="flex items-center text-teal-200">
                  <Clock className="h-5 w-5 mr-2 text-teal-400" />
                  <span>Round-the-clock Care</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">Contact Information</h2>
          <Card className="bg-teal-900/20 border-teal-400/10">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-4">Contact Information</h3>
              <p className="text-teal-200">Medical Center Drive</p>
              <p className="text-teal-200">Nashik,MH 12345</p>
              <p className="text-teal-200">Phone: (+91) 123-4567</p>
              <p className="text-teal-200">Email: info@citylinehospital.com</p>
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
