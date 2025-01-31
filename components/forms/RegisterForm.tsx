"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl } from "@/components/ui/form"
import CustomFormField from "../customFormField"
import SubmitButton from "../SubmitButton"
import { useState } from "react"
import { userFormValidation } from "@/lib/Validation"
import { useRouter } from "next/navigation"
import { createUser } from "@/lib/actions/patient.actions"
import { FormFieldTypes } from "./PatientForm"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Doctors, GenderOptions, IdentificationTypes } from "@/constants"
import { Label } from "../ui/label"
import Image from "next/image"
import { SelectItem } from "../ui/select"
import FileUploader from "../ui/FileUploader"



const RegisterForm = ({ user }: { user: User }) => {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const form = useForm<z.infer<typeof userFormValidation>>({
        resolver: zodResolver(userFormValidation),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof userFormValidation>) => {
        setIsLoading(true);

        try {
            const user = {
                name: values.name,
                email: values.email,
                phone: values.phone,
            };
            const newUser = await createUser(user);
            console.log(newUser)
            if (newUser) {
                router.push(`/patients/${newUser.$id}/register`);
            }
        } catch (error) {
            console.log(error);
        }

        setIsLoading(false);
    };
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12 flex-1">
                <section className="space-y-4">
                    <h1 className="header">Welcome 👋</h1>
                    <p className="text-dark-700">Let us know a bit more about you...</p>
                </section>
                <section className="space-y-6">
                    <div className="mb-9 space-y-1">
                        <h2 className="sub-header">Personal Information</h2>
                    </div>
                </section>
                <CustomFormField
                    fieldType={FormFieldTypes.INPUT}
                    control={form.control}
                    name='name'
                    label="Full Name"
                    placeholder="Enter Your Full Name"
                    iconSrc='/assets/icons/user.svg'
                    iconAlt='user'
                />

                <div className="flex flex-col gap-6 xl:flex-row">
                    <CustomFormField
                        fieldType={FormFieldTypes.INPUT}
                        control={form.control}
                        name='email'
                        label="Email"
                        placeholder="example@gmail.com"
                        iconSrc='/assets/icons/email.svg'
                        iconAlt='email'
                    />
                    <CustomFormField
                        fieldType={FormFieldTypes.PHONE_INPUT}
                        control={form.control}
                        name='phone'
                        label="Phone Number"
                        placeholder="Enter Your Phone Number"
                    />
                </div>

                <div className="flex flex-col gap-6 xl:flex-row">
                    <CustomFormField
                        fieldType={FormFieldTypes.DATE_PICKER}
                        control={form.control}
                        name='birthDate'
                        label="Date of Birth"

                    />
                    <CustomFormField
                        fieldType={FormFieldTypes.SKELETON}
                        control={form.control}
                        name="gender"
                        label="Gender"
                        renderSkeleton={(field) => (
                            <FormControl>
                                <RadioGroup
                                    className="flex h-11 gap-6 xl:justify-between"
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    {GenderOptions.map((option, i) => (
                                        <div key={option + i} className="radio-group">
                                            <RadioGroupItem value={option} id={option} />
                                            <Label htmlFor={option} className="cursor-pointer">
                                                {option}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                        )}
                    />
                </div>
            <div className="flex flex-col gap-6 xl:flex-row">
                <CustomFormField
                    fieldType={FormFieldTypes.INPUT}
                    control={form.control}
                    name='address'
                    label="Address"
                    placeholder="Enter Your Address"

                />
                <CustomFormField
                    fieldType={FormFieldTypes.INPUT}
                    control={form.control}
                    name='occupation'
                    label="Occupation"
                    placeholder="Enter Your Occupation"
                />
            </div>
            <div className="flex flex-col gap-6 xl:flex-row">
                <CustomFormField
                    fieldType={FormFieldTypes.INPUT}
                    control={form.control}
                    name='emergencyContactName'
                    label="Emergency Contact Name"
                    placeholder="Guardian Name"
                    iconSrc='/assets/icons/user.svg'
                    iconAlt='user'
                />
                <CustomFormField
                    fieldType={FormFieldTypes.PHONE_INPUT}
                    control={form.control}
                    name='emergencyContactNumber'
                    label="Emergency Contact Number"
                    placeholder="Emergency Contact Number"
                />
            </div>
            <section className="space-y-6">
                <div className="mb-9 space-y-1">
                    <h2 className="sub-header">Medical Information</h2>
                </div>
            </section>
            <CustomFormField
                fieldType={FormFieldTypes.SELECT}
                control={form.control}
                name="primaryPhysician"
                label="Primary care physician"
                placeholder="Select a physician"
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
            <div className="flex flex-col gap-6 xl:flex-row">
                <CustomFormField
                    fieldType={FormFieldTypes.INPUT}
                    control={form.control}
                    name='insuranceProvider'
                    label="Insurance Provider"
                    placeholder="Insurance Provider"

                />
                <CustomFormField
                    fieldType={FormFieldTypes.INPUT}
                    control={form.control}
                    name='insurancePolicyNumber'
                    label="Insurance Policy Number"
                    placeholder="Insurance Policy Number"
                />
            </div>
            <div className="flex flex-col gap-6 xl:flex-row">
                <CustomFormField
                    fieldType={FormFieldTypes.TEXTAREA}
                    control={form.control}
                    name='allergies'
                    label="Allergies (if any)"
                    placeholder="Enter Your Allergies"

                />
                <CustomFormField
                    fieldType={FormFieldTypes.TEXTAREA}
                    control={form.control}
                    name='currentMedication'
                    label="Current Medication"
                    placeholder="Aspirin, Ibuprofen, etc."
                />
            </div>
            <div className="flex flex-col gap-6 xl:flex-row">
                <CustomFormField
                    fieldType={FormFieldTypes.TEXTAREA}
                    control={form.control}
                    name='familyMedicalHistory'
                    label="Family Medical History"
                    placeholder="Enter Your Family Medical History"

                />
                <CustomFormField
                    fieldType={FormFieldTypes.TEXTAREA}
                    control={form.control}
                    name='pastMedicalHistory'
                    label="Past Medical History"
                    placeholder="Enter Your Past Medical History"
                />
            </div>
            <section className="space-y-6">
                <div className="mb-9 space-y-1">
                    <h2 className="sub-header">Identification and Verification</h2>
                </div>
            </section>

            <CustomFormField
                fieldType={FormFieldTypes.SELECT}
                control={form.control}
                name="identificationType"
                label="Identification Type"
                placeholder="Select an identification type"
            >
                {IdentificationTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                        {type}
                    </SelectItem>
                ))}
            </CustomFormField>
            <CustomFormField
                fieldType={FormFieldTypes.INPUT}
                control={form.control}
                name='identificationNumber'
                label="Identification Number"
                placeholder="Enter Identification Number"

            />

            <CustomFormField
                fieldType={FormFieldTypes.SKELETON}
                control={form.control}
                name='idendificationDocument'
                label="Scanned Identification Document"
                renderSkeleton={(field) => (
                    <FormControl>
                        <FileUploader
                            files={field.value}
                            onChange={field.onChange}
                        />
                    </FormControl>
                )}
            />
            <section className="space-y-6">
                <div className="mb-9 space-y-1">
                    <h2 className="sub-header">Consent And Privacy</h2>
                </div>
            </section>

            <CustomFormField
                fieldType={FormFieldTypes.CHECKBOX}
                control={form.control}
                name='treatmentConsent'
                label='I agree to receive treatment '
            />
            <CustomFormField
                fieldType={FormFieldTypes.CHECKBOX}
                control={form.control}
                name='disclosureConsent'
                label='I agree to the disclosure of my medical information to the healthcare provider'
            />
            <CustomFormField
                fieldType={FormFieldTypes.CHECKBOX}
                control={form.control}
                name='privacyConsent'
                label='I agree to the privacy policy'
            />

            <SubmitButton isLoading={isLoading}>
                Get Started
            </SubmitButton>
        </form>
        </Form >
    )
}

export default RegisterForm