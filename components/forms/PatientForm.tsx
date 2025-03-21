"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import CustomFormField from "../customFormField"
import SubmitButton from "../SubmitButton"
import { useState, useEffect } from "react"
import { UserFormValidation } from "@/lib/Validation"
import { useRouter } from "next/navigation"
import { createUser, getRegisteredPatient } from "@/lib/actions/patient.actions"
import { toast } from "@/hooks/use-toast"

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
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStorage, setIsCheckingStorage] = useState(true);
  const router = useRouter();

  const form = useForm<z.infer<typeof UserFormValidation>>({
    resolver: zodResolver(UserFormValidation),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  // Check localStorage for existing user data on component mount
  useEffect(() => {
    const checkExistingUser = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const userDetails = localStorage.getItem('userDetails');
        
        if (authToken && userDetails) {
          const user = JSON.parse(userDetails);
          
          // Check if the user is already registered
          const registeredPatient = await getRegisteredPatient(user.id);
          
          if (registeredPatient) {
            toast({
              title: "Welcome Back!",
              description: "Redirecting to your appointment page...",
            });
            router.push(`/patients/${user.id}/new-appointment`);
          } else {
            router.push(`/patients/${user.id}/register`);
          }
          return;
        }
      } catch (error) {
        console.error("Error checking existing user:", error);
      } finally {
        setIsCheckingStorage(false);
      }
    };
    
    checkExistingUser();
  }, [router]);

  const onSubmit = async (values: z.infer<typeof UserFormValidation>) => {
    setIsLoading(true);

    try {
      const user = {
        name: values.name,
        email: values.email,
        phone: values.phone,
      };

      // Create new user
      const newUser = await createUser(user);

      if (!newUser) {
        toast({
          title: "Error",
          description: "User with the same email already exists",
          variant: "destructive",
        });
        return;
      }

      // Save user details to localStorage
      localStorage.setItem('authToken', newUser._id);
      localStorage.setItem('userDetails', JSON.stringify({
        id: newUser._id,
        name: values.name,
        email: values.email,
        phone: values.phone,
      }));

      const registeredPatient = await getRegisteredPatient(newUser._id);

      if (registeredPatient) {
        toast({
          title: "Welcome Back!",
          description: "Redirecting to your appointment page...",
        });
        router.push(`/patients/${newUser._id}/new-appointment`);
      } else {
        router.push(`/patients/${newUser._id}/register`);
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "An error occurred while creating the user.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Don't render the form while checking localStorage
  if (isCheckingStorage) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <p className="text-dark-700">Checking your information...</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
        <section className="mb-12 space-y-4">
          <h1 className="text-xl font-bold">Hi There 👋</h1>
          <p className="text-dark-700">Sign In With Your Credentials</p>
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