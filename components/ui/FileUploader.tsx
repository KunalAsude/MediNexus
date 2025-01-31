'use client'
import { convertFileToUrl } from '@/lib/utils'
import Image from 'next/image'
import React, {useCallback} from 'react'
import {useDropzone} from 'react-dropzone'

type FileUploaderProps = {
    files:File[] | undefined
    onChange:(files:File[])=>void
}

const FileUploader = ({files,onChange}:FileUploaderProps)=> {
  const onDrop = useCallback((acceptedFiles:File[]) => {
    onChange(acceptedFiles)
  }, [])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  return (
    <div {...getRootProps()} className='file-upload'>
        {files && files?.length>0 ? (
            <Image src={convertFileToUrl(files[0])} alt='uploaded file' width={1000} height={1000} className='max-h-[400px] overflow-hidden object-cover' />
        ):(
            <>
            <Image src='/assets/icons/upload.svg' alt='file upload' width={40} height={40} />
            <div className='file-upload_label'>
                <p className='text-14-regular'>
                    <span className='text-green-500'>
                        Click To Upload 
                    </span>
                    &nbsp;or Drag and Drop
                </p>
                <p>
                    SVG,PNG,JPG or GIF (max 800x400)
                </p>
            </div>
            </>
        )}
      <input {...getInputProps()} />
    </div>
  )
}

export default FileUploader