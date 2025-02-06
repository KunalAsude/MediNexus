"use server";

import { parseStringify } from "../utils";
import { InputFile } from "node-appwrite/file";
import connect from "../mongodb";
import User from "../modals/userModel";
import { ObjectId } from "mongoose";
import RegisteredPatient from "../modals/registerPatientModal";


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
