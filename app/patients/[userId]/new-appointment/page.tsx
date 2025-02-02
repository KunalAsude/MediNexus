import AppointmentForm from "@/components/forms/Appointment";
import PatientForm from "@/components/forms/PatientForm";
import { Button } from "@/components/ui/button";
import { getPatient } from "@/lib/actions/patient.actions";
import Image from "next/image";
import Link from "next/link";


export default async function NewAppointment({params:{userId}}:SearchParamProps) {

    const patient = await getPatient(userId);
  return (
    <div className="flex h-screen max-h-screen">
        <Image
      src='/assets/images/appointment2.jpg'
      height={1000}
      width={1000}
      alt="Appointment Image"
      className="side-img max-w-[450px] bg-bottom p-4 rounded-3xl "
      />
      <section className="container remove-scroll-bar my-auto">
        <div className="sub-container max-w-[860px] flex-1 justify-between">
        <div className="flex flex-row align-middle">
          <img
          src="https://img.icons8.com/arcade/64/hospital.png"
          alt="MediNexus Logo"
          className="h-13 w-fit mr-2"
          />
          <div className="text-2xl font-bold flex items-center justify-center text-teal-300">MediNexus</div>
        </div>
        <AppointmentForm
        type='create'
        patientId={patient?.$id}
        userId={userId}
        />
          <p className="copyright mt-10 py-12">© MediNexus 2025</p>
        </div>
      </section>
      
    </div>
  )
}
