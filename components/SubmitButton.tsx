import React from 'react';
import { Button } from './ui/button';
import Image from 'next/image';
import Loader from './ui/Loader';
import { useToast } from '@/hooks/use-toast';

interface ButtonProps {
  isLoading: boolean;
  className?: string;
  children: React.ReactNode;
}

const SubmitButton = ({ isLoading, className, children }: ButtonProps) => {
  const { toast } = useToast(); 

  const handleClick = () => {
    
  //   const { id, dismiss } = toast({
  //     title: "Processing Your Request !!",
  //     description: "Please Wait While We Process Your Request...",
  //     variant: "default", 
  // })

  // setTimeout(() => {
  //     dismiss() 
  // }, 3000)


  };

  return (
    <Button
      type="submit"
      disabled={isLoading}
      className={className || 'shad-primary-btn w-full bg-[linear-gradient(to_right,#064E4C,#024632,#013220)] border-2 border-cyan-900'}
      onClick={handleClick}
    >
      {isLoading ? (
        <div className="flex items-center gap-4">
          <Loader />
          Loading...
        </div>
      ) : (
        <>{children}</>
      )}
    </Button>
  );
}

export default SubmitButton;
