"use server";

import { parseStringify } from "../utils";
import { InputFile } from "node-appwrite/file";
import connect from "../mongodb";
import User from "../modals/userModel";
import { ObjectId } from "mongoose";
import RegisteredPatient from "../modals/registerPatientModal";
import Hospital from "../modals/hospitalmodal";
import mongoose from "mongoose";
import doctorModal from "../modals/doctorModal";
import hospitalmodal from "../modals/hospitalmodal";


export const createUser = async (user: { name: string; email: string; phone: string }) => {
  try {
    await connect(); 

    const existingUser = await User.findOne({ email: user.email }).lean(); 
    if (existingUser) {
      return existingUser; 
    }

    // Create a new user
    const newUser = await User.create({
      name: user.name,
      email: user.email,
      phone: user.phone,
    });

    return JSON.parse(JSON.stringify(newUser)); 
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
};




export const getUser = async (userId: string) => {
  try {
    await connect(); 

    const user = await User.findById(userId).lean();

    if (!user) {
      throw new Error("User not found");
    }

    return JSON.parse(JSON.stringify(user)); 
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};



export const registerPatient = async ({
  identificationDocument,
  ...patient
}: RegisterUserParams) => {
  try {
    await connect(); 

    let fileUrl = null;

    // File upload logic can be implemented later
    // if (identificationDocument) {
    //   const fileBuffer = identificationDocument.get("blobFile") as Blob;
    //   const fileName = identificationDocument.get("fileName") as string;
    //   fileUrl = await uploadFileToStorage(fileBuffer, fileName);
    // }

    // Ensure primaryPhysician.id is properly converted to ObjectId
    // if (primaryPhysician && primaryPhysician.id) {
    //   primaryPhysician.id = new mongoose.Types.ObjectId(primaryPhysician.id);
    // }

    // Create new patient record in MongoDB
    const newPatient = await RegisteredPatient.create({
      identificationDocumentUrl: fileUrl,
      ...patient,
    });

    return JSON.parse(JSON.stringify(newPatient)); 
  } catch (error) {
    console.error("Error registering patient:", error);
    return null;
  }
};

export const getRegisteredPatient = async (userId: string) => {
  try {
   
    await connect();

    
    const patient = await RegisteredPatient.findOne({ userId }).lean(); 

    
    if (patient) {
      return JSON.parse(JSON.stringify(patient)); 
    } else {
      console.log("Patient not found.");
      return null; 
    }
  } catch (error) {
    console.error("Error fetching registered patient:", error);
    throw new Error("Unable to fetch registered patient data");
  }
};



 // Ensure correct import

export const getHospital = async (hospitalId: string) => {
  try {
    await connect();
  

    const objectId = new mongoose.Types.ObjectId(hospitalId); // Convert to ObjectId


    const hospital = await Hospital.findById(objectId).lean(); // Ensure correct model
    if (!hospital) throw new Error("Hospital not found");

    
    return JSON.parse(JSON.stringify(hospital));
  } catch (error) {
    console.error("Error fetching hospital:", error);
    return null;
  }
};

export const getDoctorsByHospital = async (hospitalId: string) => {
  try {
    await connect();
    

     // Convert to ObjectId

    const doctors = await doctorModal.find({ hospitalId: hospitalId }).lean(); // Find all doctors for this hospital
    if (!doctors.length) throw new Error("No doctors found for this hospital");

    return JSON.parse(JSON.stringify(doctors));
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return [];
  }
};


export const getAllHospitals = async () => {
  try {
    await connect(); // Connect to MongoDB
    const hospitals = await hospitalmodal.find({}); 
    return hospitals;
  } catch (error: any) {
    throw new Error("Failed to fetch hospitals from database");
  }
};

 // Import the Doctor model
 export const updateDoctorAvailability = async (
  doctorId: string,
  isActive: boolean,
  availableSlots: { startTime: Date; endTime: Date }[]
): Promise<{ success: boolean; doctor?: any; message?: string }> => {
  try {
    if (!doctorId || !Array.isArray(availableSlots) || availableSlots.length === 0) {
      throw new Error("Invalid input: doctorId and availableSlots are required.");
    }

    const formattedSlots = availableSlots.map(slot => {
      const startTime = new Date(slot.startTime);
      const endTime = new Date(slot.endTime);

      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        throw new Error("Invalid date format in availableSlots.");
      }

      return {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      };
    });

    await connect();

    const updatedDoctor = await doctorModal.findByIdAndUpdate(
      new mongoose.Types.ObjectId(doctorId),
      {
        status: isActive ? "active" : "inactive",
        availableSlots: formattedSlots.map(slot => ({
          startTime: new Date(slot.startTime),
          endTime: new Date(slot.endTime),
        })),
      },
      { new: true }
    );

    if (!updatedDoctor) {
      throw new Error("Doctor not found.");
    }

    return { success: true, doctor: JSON.parse(JSON.stringify(updatedDoctor)) };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};



