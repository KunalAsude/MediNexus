import PatientForm from "@/components/forms/PatientForm";
import { Button } from "@/components/ui/button";
import PasskeyModal from "@/components/ui/PasskeyModal";
import Image from "next/image";
import Link from "next/link";




const Home = ({ searchParams }: SearchParamProps) => {
  const isAdmin = searchParams?.admin === "true";
  
  return (
    

    
    <div className="flex h-screen max-h-screen">
      {isAdmin && <PasskeyModal/>}
      <section className="container remove-scroll-bar my-auto">
        <div className="sub-container max-w-[496px]">
        <div className="flex flex-row align-middle">
          <img
          src="https://img.icons8.com/arcade/64/hospital.png"
          alt="MediNexus Logo"
          className="h-13 w-fit mr-2"
          />
          <div className="text-2xl font-bold flex items-center justify-center text-teal-300">MediNexus</div>
        </div>
        <PatientForm />
        <div className="text-14-regular mt-20 flex justify-between">
          <p className="justify-items-end xl:text-left text-dark-600">© MediNexus 2025</p>
        </div>
        </div>
      </section>
      <Image
      src='/assets/images/onboarding-img.avif'
      height={1000}
      width={1000}
      alt="Onboarding Image"
      className="side-img max-w-[50%]"
      />
    </div>
  )
}

export default Home
