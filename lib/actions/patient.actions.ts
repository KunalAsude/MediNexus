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


export const updateDoctorAvailability = async (
  doctor,
  isActive,
  availableSlots = [], // Kept for backward compatibility
  weeklyAvailability
) => {
  try {
    console.log("Updating doctor availability...");
    
    if (!doctor) {
      throw new Error("Invalid doctor information");
    }

    if (!weeklyAvailability || typeof weeklyAvailability !== "object") {
      throw new Error("Invalid weeklyAvailability format");
    }

    const doctorId = doctor._id || doctor; // Ensure proper doctor ID

    const formattedWeeklyAvailability = {};
    const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

    daysOfWeek.forEach((day) => {
      if (!weeklyAvailability[day] || !Array.isArray(weeklyAvailability[day])) {
        formattedWeeklyAvailability[day] = [];
        return;
      }

      formattedWeeklyAvailability[day] = weeklyAvailability[day].map((slot) => {
        const formatTime = (time) => {
          if (time instanceof Date) {
            return time.toISOString().substring(11, 16); // Extract HH:MM
          }
          return time; // Assume it's already a valid string
        };

        return {
          startTime: formatTime(slot.startTime),
          endTime: formatTime(slot.endTime),
        };
      });
    });

    // Ensure database connection
    await connect();

    // Prepare the update object with $set
    const updateData = {
      $set: {
        status: isActive ? "active" : "inactive",
        weeklyAvailability: formattedWeeklyAvailability,
      },
    };

    // Update the doctor document
    const updatedDoctor = await doctorModal.findByIdAndUpdate(
      new mongoose.Types.ObjectId(doctorId),
      updateData,
      { new: true, runValidators: true } // Ensures validation is applied
    );

    if (!updatedDoctor) {
      throw new Error("Doctor not found");
    }

    return {
      success: true,
      doctor: updatedDoctor.toObject(),
    };
  } catch (error) {
    console.error("Error updating doctor availability:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};


export const getDoctorById = async (doctorId: object) => {
  try {
    if (!doctorId) {
      throw new Error("Doctor ID is required");
    }
    console.log("Doctor ID:", doctorId);

    await connect(); // Ensure database connection

    const doctor = await doctorModal.findById(new mongoose.Types.ObjectId(doctorId));

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    return JSON.parse(JSON.stringify(doctor)); // Convert to plain object
  } catch (error) {
    console.error("Error fetching doctor by ID:", error);
    return null;
  }
};

export const getAllDoctors = async () => {
  try {
    await connect();
    
    const doctors = await doctorModal.find({}).lean(); 
    
    return JSON.parse(JSON.stringify(doctors)); 
  } catch (error) {
    console.error("Error fetching all doctors:", error);
    throw new Error("Failed to fetch doctors from database");
  }
};

