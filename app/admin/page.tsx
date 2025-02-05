"use client"; // Ensure this is client-side

import { useEffect, useState } from "react";
import { columns } from '@/components/table/columns';
import { DataTable } from '@/components/table/DataTable';
import StatCard from '@/components/ui/StatCard';
import { getRecentAppointmentList } from '@/lib/actions/appointment.actions';
import Link from 'next/link';
import Loader from "@/components/ui/Loader";
import { Button } from "@/components/ui/button";

const Admin = () => {
  const [appointments, setAppointments] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {

    const fetchAppointments = async () => {
      setLoading(true);
      const data = await getRecentAppointmentList();
      setAppointments(data);
      setLoading(false);
    };

    fetchAppointments();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className='flex mx-auto max-w-full flex-col space-y-14'>
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
      <main className='admin-main remove-scrollbar'>
        <section className='w-full flex justify-between items-center'>
          <div className='space-y-2'>
            <h1 className='text-2xl font-bold'>Welcome Admin</h1>
            <p className='text-dark-700'>Start The Day With Managing New Appointments...</p>
          </div>
          <Button
            variant="outline"
            className="max-w-fit bg-teal-800 border-teal-800 hover:bg-teal-900 text-white py-3 rounded-md 
                         transition-colors duration-200 font-medium"
            onClick={() => window.location.reload()}
          >
            <span className="text-sm font-semibold">Refresh Data</span>
          </Button>

        </section>


        <section className='admin-stat remove-scrollbar'>
          <StatCard
            type='appointments'
            count={appointments.scheduledCount}
            label='Scheduled Appointments'
            icon='/assets/icons/appointments.svg'
          />
          <StatCard
            type='pending'
            count={appointments.pendingCount}
            label='Pending Appointments'
            icon='/assets/icons/pending.svg'
          />
          <StatCard
            type='appointments'
            count={appointments.cancelledCount}
            label='Cancelled Appointments'
            icon='/assets/icons/cancelled.svg'
          />
        </section>
        <DataTable
          columns={columns}
          data={appointments.documents}
        />
      </main>
    </div>
  );
};

export default Admin;
