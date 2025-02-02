import StatCard from '@/components/ui/StatCard'
import Link from 'next/link'
import React from 'react'

const Admin = () => {
    return (
        <div className='flex mx-auto max-w-7xl flex-col space-y-14'>
            <header className='admin-header'>
                <Link href='/' className='cursor-pointer'>
                    <div className="flex flex-row align-middle">
                        <img
                            src="https://img.icons8.com/arcade/64/hospital.png"
                            alt="MediNexus Logo"
                            height='100px'
                            width='100px'
                            className="h-10 w-fit"
                        />
                        <div className="text-lg font-bold flex items-center justify-center text-teal-500">MediNexus</div>
                    </div>    
                </Link>
                <p className='text-sm font-bold flex items-center justify-center text-teal-500'>Admin Dashboard</p>
            </header>
            <main className='admin-main'>
                <section className='w-full space-y-4'>
                    <h1 className='header'>Welcome Admin</h1>
                    <p className='text-dark-700'> Start The Day With Managing New Appointments...</p>
                </section>

                <section className='admin-stat'>
                    <StatCard
                    type='appointments'
                    count={10}
                    label='Scheduled Appointments'
                    icon='/assets/icons/appointments.svg'
                    />
                    <StatCard
                    type='pending'
                    count={20}
                    label='Pending Appointments'
                    icon='/assets/icons/pending.svg'
                    />
                    <StatCard
                    type='appointments'
                    count={2}
                    label='Cancled Appointments'
                    icon='/assets/icons/cancelled.svg'
                    />
                </section>
            </main>
        </div>
    )
}

export default Admin