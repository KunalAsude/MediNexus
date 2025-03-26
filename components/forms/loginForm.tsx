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
import { Loader2 } from "lucide-react"

export enum FormFieldTypes {
  INPUT = "input",
  TEXTAREA = "textarea",
  PHONE_INPUT = "phoneInput",
  DATE_PICKER = "datePicker",
  CHECKBOX = "checkbox",
  SELECT = "select",
  SKELETON = "skeleton",
}

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate a 3-second delay for authentication check
    const checkAuthentication = async () => {
      try {
        // Simulate network or storage retrieval delay
        await new Promise(resolve => setTimeout(resolve, 3000));

        const authToken = localStorage.getItem('authToken');
        if (authToken) {
          // Optional: Add a server-side validation of the token here if needed
          router.push('/');
        }
      } catch (error) {
        console.error("Authentication check failed", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, [router]);

  const form = useForm<z.infer<typeof UserFormValidation>>({
    resolver: zodResolver(UserFormValidation),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

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

      const registeredPatient = await getRegisteredPatient(newUser._id);

      // Save user details to localStorage
      localStorage.setItem('authToken', newUser._id);
      localStorage.setItem('userDetails', JSON.stringify({
        id: newUser._id,
        name: values.name,
        email: values.email,
        phone: values.phone,
      }));

      router.push('/');

      // Show success toast
      toast({
        title: "Success",
        description: "You've successfully signed in!",
      });

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

  // Show a loading spinner for 3 seconds while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
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

export default LoginForm;