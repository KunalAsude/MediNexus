import RegisterForm from '@/components/forms/RegisterForm'
import { getUser } from '@/lib/actions/patient.actions'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Register = async ({ params :{userId}}:SearchParamProps) => {

    const user = await getUser(userId);

    return (
        <div className="flex h-screen max-h-screen">
      <section className="container remove-scrollbar">
        <div className="sub-container max-w-[860px] flex-1 flex-col py-10">
        <div className="flex flex-row align-middle">
          <img
          src="https://img.icons8.com/arcade/64/hospital.png"
          alt="MediNexus Logo"
          className="h-13 w-fit mr-2"
          />
          <div className="text-2xl font-bold flex items-center justify-center text-teal-300">MediNexus</div>
        </div>
        <RegisterForm user={user} />
        <p className="copyright py-12">© MediNexus 2025</p>
        </div>
      </section>
      <Image
        src="/assets/images/register-img.png"
        height={1000}
        width={1000}
        alt="patient"
        className="side-img max-w-[390px] h-screen"
      />
    </div>
    )
}

export default Register