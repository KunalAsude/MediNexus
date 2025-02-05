'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { encryptKey } from '@/lib/utils';
import { Lock, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const PasskeyModal = () => {
  const [open, setOpen] = useState(true);
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const closeModal = () => {
    setOpen(false);
    router.push('/');
  };

  const validatePasskey = (e: React.FormEvent) => {
    e.preventDefault();

    if (passkey === process.env.NEXT_PUBLIC_ADMIN_PASSKEY) {
      const encryptedKey = encryptKey(passkey);
      localStorage.setItem('accessKey', encryptedKey);
      router.push('/admin');
      
      toast({
        title: 'Welcome Back, Admin!',
        description: 'Manage your appointments and patients...',
        variant: 'default',
        duration: 2000,
      });
    } else {
      setError('Invalid Passkey');
      toast({
        title: 'Invalid Passkey',
        description: 'The passkey you entered is incorrect. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="bg-[linear-gradient(135deg,#042F2E,#012621)] border border-teal-800/30 shadow-2xl rounded-lg w-[90%] max-w-md p-6">
        <div className="flex justify-between items-center mb-2">
          <Lock className="text-teal-400 w-5 h-5" />
          <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <AlertDialogHeader className="mb-6">
          <AlertDialogTitle className="text-2xl font-semibold text-white">
            Admin Access
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400 mt-2">
            Enter your passkey to continue
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-6">
          <div className="relative">
            <input
              type="password"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              maxLength={6}
              className="w-full px-4 py-3 bg-teal-950/50 text-white text-center text-lg border border-teal-800/50 rounded-md 
                         focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 
                         placeholder:text-gray-500 transition-all"
              placeholder="••••••"
            />
            {error && (
              <p className="absolute -bottom-6 left-0 w-full text-sm text-red-400 text-center">
                {error}
              </p>
            )}
          </div>

          <AlertDialogFooter className="mt-8">
            <AlertDialogAction
              onClick={validatePasskey}
              className="w-full bg-teal-800 hover:bg-teal-900 text-white py-3 rounded-md 
                         transition-colors duration-200 font-medium"
            >
              Authenticate
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PasskeyModal;