import { Button } from '@/components/ui/button';
import { Doctors } from '@/constants';
import { getAppointment } from '@/lib/actions/appointment.actions';
import { formatDateTime } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { ArrowLeft } from 'lucide-react';

const Success = async ({ params: { userId }, searchParams }: SearchParamProps) => {
    const appointmentId = (searchParams?.appointmentId as string) || '';
    const appointment = await getAppointment(appointmentId);
    const doctor = Doctors.find((doc) => doc.name === appointment.primaryPhysician);

    return (
        <div className="flex h-screen max-h-screen px-[5%] items-center justify-center relative">
            {/* Fancy Back Button */}
            <Button
                variant="outline"
                className="shad-primary-btn bg-[linear-gradient(to_right,#064E4C,#024632,#013220)] border-2 border-cyan-900 mt-4 absolute top-4 left-4 sm:left-1 sm:top-1 flex items-center gap-2 sm:gap-0"
                asChild
            >
                <Link href="/" className="flex items-center">
                    <div className='flex gap-2 justify-center items-center'>
                    <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="hidden sm:block">Back to Dashboard</span>
                    </div> 
                </Link>
            </Button>


            {/* Success Section */}
            <div className="success-img flex flex-col items-center">
                {/* Logo */}
                <div className="flex flex-row align-middle">
                    <img
                        src="https://img.icons8.com/arcade/64/hospital.png"
                        alt="MediNexus Logo"
                        className="h-15 w-fit"
                    />
                    <div className="text-2xl font-bold flex items-center justify-center text-teal-300">
                        MediNexus
                    </div>
                </div>

                {/* Success Animation */}
                <section className="flex flex-col items-center">
                    <Image src="/assets/gifs/success.gif" alt="success" width={300} height={280} />
                    <h2 className="header mb-6 max-w-[600px] text-center">
                        Your <span className="text-teal-300">Appointment Request</span> has been received
                        successfully !!!
                    </h2>
                    <p className="text-center">We'll get back to you shortly with the appointment details.</p>
                </section>

                {/* Appointment Details */}
                <section className="request-details">
                    <p>Appointment Details :</p>
                    <div className="flex items-center gap-6">
                        <Image src={doctor?.image!} alt="doctor" width={40} height={40} />
                        <p className="whitespace-nowrap">Dr. {doctor?.name}</p>
                    </div>
                    <div className="flex gap-2">
                        <Image src="/assets/icons/calendar.svg" height={24} width={24} alt="calender" />
                        <p>{formatDateTime(appointment.schedule).dateTime}</p>
                    </div>
                </section>

                {/* New Appointment Button */}
                <Button
                    variant="outline"
                    className="shad-primary-btn bg-[linear-gradient(to_right,#064E4C,#024632,#013220)] border-2 border-cyan-900 mt-4"
                    asChild
                >
                    <Link href={`/patients/${userId}/new-appointment`}>New Appointment</Link>
                </Button>

                {/* Footer */}
                <p className="copyright mt-4">© MediNexus 2025</p>
            </div>
        </div>
    );
};

export default Success;
