"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import CustomFormField from "../customFormField"
import SubmitButton from "../SubmitButton"
import { useState } from "react"
import { getAppointmentSchema } from "@/lib/Validation"
import { useRouter } from "next/navigation"
import { createUser } from "@/lib/actions/patient.actions"
import { Doctors } from "@/constants"
import { SelectItem } from "../ui/select"
import Image from "next/image"
import { createAppointment } from "@/lib/actions/appointment.actions"

export enum FormFieldTypes {
    INPUT = "input",
    TEXTAREA = "textarea",
    PHONE_INPUT = "phoneInput",
    DATE_PICKER = "datePicker",
    CHECKBOX = "checkbox",
    SELECT = "select",
    SKELETON = "skeleton",
}

const AppointmentForm = ({
    userId,
    patientId,
    type
}: {
    userId: string
    patientId: string
    type: 'create' | 'cancel' | 'schedule'
}) => {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const AppointmentFormValidation = getAppointmentSchema(type);

    const form = useForm<z.infer<typeof AppointmentFormValidation>>({
        resolver: zodResolver(AppointmentFormValidation),
        defaultValues: {
            primaryPhysician: "",
            schedule: new Date(),
            reason: "",
            note: "",
            cancellationReason: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof AppointmentFormValidation>) => {
        setIsLoading(true);

        let status;

        switch(type){
            case 'schedule':
                status = 'scheduled'
                break;
            case 'cancel':
                status = 'cancelled'
                break;
            case 'create':
                status = 'pending'
                break;
        }



        try {

            if(type === 'create' && patientId){
                const appointmentData = {
                    userId,
                    patient:patientId,
                    primaryPhysician: values.primaryPhysician,
                    schedule: new Date(values.schedule),
                    reason: values.reason!,
                    note: values.note,
                    status:status as Status
                }
                const appointment = await createAppointment(appointmentData)

                if(appointment){
                    form.reset()
                    router.push(`/patients/${userId}/new-appointment/success?appointmentId=${appointment.$id}`)
                }
            }

            
            
        } catch (error) {
            console.log(error);
        }

        setIsLoading(false);
    };

    let buttonlabel;

    switch(type){
        case 'create':
            buttonlabel = 'Book Appointment'
            break;
        case 'cancel':
            buttonlabel = 'Cancel Appointment'
            break;
        case 'schedule':
            buttonlabel = 'Schedule Appointment'
            break;
        default:
            buttonlabel = 'Book Appointment'
            break;
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
                <section className="mb-12 space-y-4">
                    <h1 className="text-xl font-bold">New Appointment</h1>
                    <p className="text-dark-700">Schedule Your New Appointment With Us</p>
                </section>

                {type !== 'cancel' && (
                    <>
                        <CustomFormField
                            fieldType={FormFieldTypes.SELECT}
                            control={form.control}
                            name="primaryPhysician"
                            label="Doctor"
                            placeholder="Select a Doctor"
                        >
                            {Doctors.map((doctor, i) => (
                                <SelectItem key={doctor.name + i} value={doctor.name}>
                                    <div className="flex cursor-pointer items-center gap-2">
                                        <Image
                                            src={doctor.image}
                                            width={32}
                                            height={32}
                                            alt="doctor"
                                            className="rounded-full border border-dark-500"
                                        />
                                        <p>{doctor.name}</p>
                                    </div>
                                </SelectItem>
                            ))}
                        </CustomFormField>

                        <CustomFormField
                            fieldType={FormFieldTypes.DATE_PICKER}
                            control={form.control}
                            name="schedule"
                            label="Expected Appointment Date"
                            placeholder="Select a Date"
                            showTimeSelect
                            dateFormat="MM/dd/yyyy - h:mm aa"
                        />

                        <div className="flex flex-col gap-6 xl:flex-row">
                            <CustomFormField
                                fieldType={FormFieldTypes.TEXTAREA}
                                control={form.control}
                                name="reason"
                                label="Reason for Appointment"
                                placeholder="Enter Reason"
                            />

                            <CustomFormField
                                fieldType={FormFieldTypes.TEXTAREA}
                                control={form.control}
                                name="note"
                                label="Notes"
                                placeholder="Enter Notes"
                            />

                        </div>
                    </>
                )}

                { type === 'cancel' && (
                    <CustomFormField
                        fieldType={FormFieldTypes.TEXTAREA}
                        control={form.control}
                        name="cancellationReason"
                        label="Reason for cancellation"
                        placeholder="Enter Reason for cancellation"
                    />
                )}


                <SubmitButton isLoading={isLoading} className={`${type==='cancel' ?'shad-danger-btn' : 'shad-primary-btn bg-[linear-gradient(to_right,#064E4C,#024632,#013220)] border-2 border-cyan-900'} w-full `}>
                   {buttonlabel}
                </SubmitButton>
            </form>
        </Form>
    )
}

export default AppointmentForm