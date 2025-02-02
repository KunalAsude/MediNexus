"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import CustomFormField from "../customFormField"
import SubmitButton from "../SubmitButton"
import { useState } from "react"
import { UserFormValidation } from "@/lib/Validation"
import { useRouter } from "next/navigation"
import { createUser } from "@/lib/actions/patient.actions"

export enum FormFieldTypes {
  INPUT = "input",
  TEXTAREA = "textarea",
  PHONE_INPUT = "phoneInput",
  DATE_PICKER = "datePicker",
  CHECKBOX = "checkbox",
  SELECT = "select",
  SKELETON = "skeleton",
}



const PatientForm = () => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof UserFormValidation>>({
    resolver: zodResolver(UserFormValidation),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof UserFormValidation>) => {
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
        <section className="mb-12 space-y-4">
          <h1 className="text-xl font-bold">Hi There 👋</h1>
          <p className="text-dark-700">Schedule Your First Appointment With Us</p>
        </section>
        <CustomFormField 
        fieldType={FormFieldTypes.INPUT}
        control={form.control}
        name='name'
        label="Full Name"
        placeholder="Enter Your Full Name"
        iconSrc='assets/icons/user.svg'
        iconAlt='user'
        />
        <CustomFormField 
        fieldType={FormFieldTypes.INPUT}
        control={form.control}
        name='email'
        label="Email"
        placeholder="example@gmail.com"
        iconSrc='assets/icons/email.svg'
        iconAlt='email'
        />
        <CustomFormField 
        fieldType={FormFieldTypes.PHONE_INPUT}
        control={form.control}
        name='phone'
        label="Phone Number"
        placeholder="Enter Your Phone Number"
        />
        <SubmitButton isLoading={isLoading}>
          Get Started
        </SubmitButton>
      </form>
    </Form>
  )
}

export default PatientForm