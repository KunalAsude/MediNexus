"use client"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"


import { ColumnDef } from "@tanstack/react-table"
import StatusBadge from "../ui/StatusBadge"
import { formatDateTime } from "@/lib/utils"
import { Doctors } from "@/constants"
import Image from "next/image"
import AppointmentModal from "../ui/AppointmentModal"
import { Appointment } from "@/types/appwrite.types"



export const columns: ColumnDef<Appointment>[] = [
    {
        header: 'ID',
        cell: ({ row }) => <p className="text-14-medium">{row.index + 1}</p>
    },
    {
        accessorKey: 'patient',
        header: 'Patient',
        cell: ({ row }) => <p className="text-14-medium">{row.original.patient.name}</p>

    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <div className="max-[50px]: flex justify-center">
                <StatusBadge
                    //@ts-ignore
                    status={row.original.status}
                />
            </div>
        )
    },
    {
        accessorKey: "schedule",
        header: "Appointment",
        cell: ({ row }) => (
            <p className="text-14-regular min-w-[100px]">
                {formatDateTime(row.original.schedule).dateTime}
            </p>
        )
    },
    {
        accessorKey: "primaryPhysician",
        header: "Doctor",
        cell: ({ row }) => {
            const doctor = Doctors.find((doc) => doc.name === row.original.primaryPhysician);

            return (
                <div className="flex items-center gap-5 justify-center">
                    <Image
                        src={doctor?.image!}
                        alt="doctor"
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                    />
                    <span className="text-sm font-medium">Dr. {doctor?.name}</span>
                </div>
            );
        },
    },
    {
        id: "actions",
        header: () => <div className="pl-4">Actions</div>,
        cell: ({ row: { original: data } }) => {
            return (
                <div className="flex gap-3 justify-center sm:ml-5 ">
                    <AppointmentModal
                        type='schedule'
                        patientId={data.patient.$id}
                        userId={data.userId}
                        appointment={data}

                    />


                    <AppointmentModal
                        type='cancel'
                        patientId={data.patient.$id}
                        userId={data.userId}
                        appointment={data}
                    />
                </div>
            )
        }
    },
]




























