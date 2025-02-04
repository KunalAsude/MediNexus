'use client'
import React, { useState } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { encryptKey } from '@/lib/utils'

const PasskeyModal = () => {
    const [open, setOpen] = useState(true)
    const [passkey, setPasskey] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()
    const { toast } = useToast()

    const closeModal = () => {
        setOpen(false)
        router.push('/')
    }

    const validatePasskey = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()

        if (passkey === process.env.NEXT_PUBLIC_ADMIN_PASSKEY) {
            const encryptedKey = encryptKey(passkey)
            localStorage.setItem('accessKey', encryptedKey)
            router.push('/admin')

            // Show success toast message
            const { id, dismiss } = toast({
                title: "Welcome Back, Admin!",
                description: "Manage your appointments and patients...",
                variant: "default", // Success toast
            })

            setTimeout(() => {
                dismiss() 
            }, 3000)

            setOpen(false)
        } else {
            setError('Invalid Passkey')

            // Show error toast message
            const { id, dismiss } = toast({
                title: "Invalid Passkey",
                description: "The passkey you entered is incorrect. Please try again.",
                variant: "destructive", // Error toast
            })
            setTimeout(() => {
                dismiss() // Dismiss the toast
            }, 3000)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent className='shad-alert-dialog'>
                <AlertDialogHeader>
                    <AlertDialogTitle className='flex items-start justify-between'>
                        Access Admin Panel
                        <Image
                            src='/assets/icons/close.svg'
                            height={20}
                            width={20}
                            alt='close'
                            onClick={() => closeModal()}
                            className="cursor-pointer "
                        />
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        To Access The Admin Panel, Enter Your Passkey.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div>
                    <InputOTP maxLength={6} value={passkey} onChange={(value) => setPasskey(value)} >
                        <InputOTPGroup className='shad-otp'>
                            <InputOTPSlot className='shad-otp-slot' index={0} />
                            <InputOTPSlot className='shad-otp-slot' index={1} />
                            <InputOTPSlot className='shad-otp-slot' index={2} />
                            <InputOTPSlot className='shad-otp-slot' index={3} />
                            <InputOTPSlot className='shad-otp-slot' index={4} />
                            <InputOTPSlot className='shad-otp-slot' index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                    {error && <p className='shad-error text-14-regular mt-4 flex justify-center'>
                        {error}
                    </p>}
                </div>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={(e) => validatePasskey(e)} className='shad-primary-btn w-full bg-[linear-gradient(to_right,#064E4C,#024632,#013220)] border-2 border-cyan-900'>
                        Submit Passkey
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default PasskeyModal
