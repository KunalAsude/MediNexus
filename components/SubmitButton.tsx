import React from 'react'
import { Button } from './ui/button'
import Image from 'next/image'

interface ButtonProps {
  isLoading: boolean
  className?: string
  children: React.ReactNode
}

const SubmitButton = ({ isLoading, className, children }: ButtonProps) => {
  return (
    <Button
      type="submit"
      disabled={isLoading}
      className={className || 'shad-primary-btn w-full bg-[linear-gradient(to_right,#064E4C,#024632,#013220)] border-2 border-cyan-900'}
    >
      {isLoading ? (
        <div className='flex items-center gap-4'>
          <Image
            src='/assets/icons/loader.svg'
            alt='loader'
            width={24}
            height={24}
            className='animate-spin'
          />
          Loading...

        </div>
      ) : (
        <>{children}</>
      )}
    </Button>
  )
}

export default SubmitButton