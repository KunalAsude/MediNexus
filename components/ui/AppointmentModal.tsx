import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from './button'
import AppointmentForm from '../forms/Appointment'
import { Appointment } from '@/types/appwrite.types'



const AppointmentModal = ({
    type,
    patientId,
    userId,
    appointment
}: {
    type: 'schedule' | 'cancel',
    patientId: string
    userId: string
    appointment: Appointment


}) => {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <Button
                    variant="ghost"
                    className={`capitalize ${type === 'schedule' ? 'bg-teal-900 text-white' :
                            type === 'cancel' ? 'bg-red-900 text-white' :
                                'bg-gray-900 text-white'} 
                                shadow-xl hover:shadow-xl transition-all duration-100 
                                rounded-lg px-4 py-2 transform hover:scale-105`}
                >
                    {type}
                </Button>
            </DialogTrigger>


            <DialogContent className='shad-dialog sm:max-w-md bg-[linear-gradient(135deg,#042F2E,#012621)]'>
                <DialogHeader className='mb-4 space-y-3'>
                    <DialogTitle className='capitalize'>{type} Appointment</DialogTitle>
                    <DialogDescription>
                        Please fill in the following details to {type} an appointment
                    </DialogDescription>
                </DialogHeader>
                <AppointmentForm
                    userId={userId}
                    patientId={patientId}
                    type={type}
                    appointment={appointment}
                    setOpen={setOpen}
                />
            </DialogContent>
        </Dialog>

    )
}

export default AppointmentModal