import { jsPDF } from "jspdf"

/**
 * Prescription data interface for better type safety
 */
interface PrescriptionData {
  _id?: string
  createdAt: string | Date
  patientName: string
  patientId?: string
  patientAge?: string
  patientEmail?: string
  patientAddress?: string
  patientContactNumber?: string
  doctorName?: string
  doctorId?: string
  doctorContactNumber?: string
  clinicName?: string
  clinicAddress?: string
  clinicEmail?: string
  clinicWebsite?: string
  prescriptionNumber?: string
  diagnosis?: string
  prescriptions: {
    medication: string
    dosage: string
    frequency: string
    duration?: string
    quantity?: string
    instructions: string
  }[]
  notes?: string
}

/**
 * Generates a PDF from prescription data
 * @param data The prescription data
 * @returns A promise that resolves to the PDF as a base64 string
 */
export const generatePrescriptionPDF = async (data: PrescriptionData): Promise<string> => {
  // Set default ID if not provided
  if (!data._id) {
    data._id = `PRE${new Date().getTime().toString().substring(5)}`
  }

  // Validate that prescriptionData exists and has the required fields
  if (!data) {
    console.error("Prescription data is undefined or null")
    throw new Error("Cannot generate PDF: Prescription data is missing")
  }

  // Check for required fields
  if (!data.createdAt || !data.patientName || !data.prescriptions) {
    console.error("Prescription data is missing required fields", data)
    throw new Error("Cannot generate PDF: Prescription data is incomplete")
  }

  try {
    // Create new jsPDF instance
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height

    // Set clinic name and details - Header with blue background
    doc.setFillColor(19, 78, 74);
    // Light blue color similar to the image
    doc.rect(0, 0, pageWidth, 35, "F")

    // Add medical logo
    // Since we can't directly load external images in jsPDF, we'd need to include it as base64
    // We'll add placeholder text for now
    const logoWidth = 20
    const logoHeight = 20
    const logoX = 15
    const logoY = 8

    // Add MEDINEXUS text as logo
    doc.setTextColor(255, 255, 255) // White text
    doc.setFontSize(26)
    doc.setFont("helvetica", "bold")
    doc.text("MEDINEXUS", pageWidth / 2, 20, { align: "center" })

    // Add placeholder text for logo
    doc.setFontSize(8)
    // doc.text("[MEDICAL LOGO]", logoX + logoWidth/2, logoY + logoHeight + 2, { align: "center" })

    // Add clinic address and contact below the clinic name - Using Nashik address
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    const clinicAddress = data.clinicAddress || "123 Medical Center, Nashik Road, Nashik, Maharashtra 422101"
    doc.text(clinicAddress, pageWidth / 2, 27, { align: "center" })

    const contactInfo = `${data.clinicEmail || "contact@medinexus.in"} / ${data.clinicWebsite || "www.medinexus.in"}`
    doc.text(contactInfo, pageWidth / 2, 32, { align: "center" })

    // Reset text color to black for the rest of the document
    doc.setTextColor(0, 0, 0)

    // Add horizontal divider line
    doc.setDrawColor(170, 170, 170)
    doc.setLineWidth(0.5)
    doc.line(15, 50, pageWidth - 15, 50)

    // Layout with adjusted positioning
    const leftMargin = 15
    const rightMargin = pageWidth - 15
    
    // ===== DOCTOR DETAILS (LEFT SIDE) =====
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text(`Dr. ${data.doctorName || "Alok Verma"}`, leftMargin, 60)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("Medical Physician", leftMargin, 67)
    // Indian phone number format
    doc.text(`${data.doctorContactNumber || "+91 98765-43210"}`, leftMargin, 74)

    // Format the date as DD/MM/YYYY (Indian format)
    const date = new Date(data.createdAt)
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
    
    // ===== PATIENT DETAILS (RIGHT SIDE) =====
    // Patient info
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("Patient:", rightMargin - 80, 60)
    doc.setFont("helvetica", "normal")
    doc.text(`${data.patientName || "Kunal"}`, rightMargin - 50, 60)
    
    // Date with patient details
    doc.setFont("helvetica", "bold")
    doc.text("Date:", rightMargin - 80, 67)
    doc.setFont("helvetica", "normal")
    doc.text(formattedDate, rightMargin - 50, 67)
    
    // Age
    doc.setFont("helvetica", "bold")
    doc.text("Age:", rightMargin - 80, 74)
    doc.setFont("helvetica", "normal")
    doc.text(`${data.patientAge || "20"}`, rightMargin - 50, 74)
    
    // Address
    doc.setFont("helvetica", "bold")
    doc.text("Address:", rightMargin - 80, 81)
    doc.setFont("helvetica", "normal")
    // Indian address format
    doc.text(`${data.patientAddress || "42 Gandhi Road, Nashik, MH"}`, rightMargin - 50, 81)
    
    // Contact
    doc.setFont("helvetica", "bold")
    doc.text("Contact:", rightMargin - 80, 88)
    doc.setFont("helvetica", "normal")
    doc.text(`${data.patientContactNumber || "+91 95555-12345"}`, rightMargin - 50, 88)
    
    // Prescription number
    doc.setFont("helvetica", "bold")
    doc.text("Prescription no.:", rightMargin - 80, 95)
    doc.setFont("helvetica", "normal")
    let prescriptionNumber = data.prescriptionNumber || data._id
    if (prescriptionNumber.length > 12) {
      prescriptionNumber = prescriptionNumber.substring(0, 12)
    }
    doc.text(prescriptionNumber, rightMargin - 50, 95)

    // Add another horizontal divider line - adjusted position
    doc.line(15, 110, pageWidth - 15, 110)

    // Add diagnosis if available - adjusted position
    let yPosition = 120
    doc.setFont("helvetica", "bold")
    doc.text("Diagnosis:", leftMargin, yPosition)
    doc.setFont("helvetica", "normal")
    doc.text(`${data.diagnosis || "General checkup"}`, leftMargin + 30, yPosition)
    
    yPosition += 15

    // Add medications section with proper headers
    doc.setFont("helvetica", "bold")
    doc.text("PRESCRIBED MEDICATIONS", leftMargin, yPosition)
    yPosition += 10

    // Vertical layout with one field below another
    if (Array.isArray(data.prescriptions) && data.prescriptions.length > 0) {
      data.prescriptions.forEach((med, index) => {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(9)
        
        // Set background for entire medication block
        const medicationBlockHeight = 70; // Height for entire medication block
        if (index % 2 === 0) {
          doc.setFillColor(248, 248, 248)
          doc.rect(leftMargin, yPosition, pageWidth - 30, medicationBlockHeight, "F")
        }
        
        // Medication
        doc.text("Medication:", leftMargin + 5, yPosition + 7)
        doc.setFont("helvetica", "normal")
        doc.text(med.medication || "Paracetamol", leftMargin + 35, yPosition + 7)
        
        // Dosage
        doc.setFont("helvetica", "bold")
        doc.text("Dosage:", leftMargin + 5, yPosition + 17)
        doc.setFont("helvetica", "normal")
        doc.text(med.dosage || "500mg", leftMargin + 35, yPosition + 17)
        
        // Frequency
        doc.setFont("helvetica", "bold")
        doc.text("Frequency:", leftMargin + 5, yPosition + 27)
        doc.setFont("helvetica", "normal")
        doc.text(med.frequency || "Twice daily", leftMargin + 35, yPosition + 27)
        
        // Duration
        doc.setFont("helvetica", "bold")
        doc.text("Duration:", leftMargin + 5, yPosition + 37)
        doc.setFont("helvetica", "normal")
        doc.text(med.duration || "7 days", leftMargin + 35, yPosition + 37)
        
        // Quantity
        doc.setFont("helvetica", "bold")
        doc.text("Quantity:", leftMargin + 5, yPosition + 47)
        doc.setFont("helvetica", "normal")
        doc.text(med.quantity || "14 tablets", leftMargin + 35, yPosition + 47)
        
        // Instructions
        doc.setFont("helvetica", "bold")
        doc.text("Instructions:", leftMargin + 5, yPosition + 57)
        doc.setFont("helvetica", "normal")
        doc.text(med.instructions || "Take after meals with water", leftMargin + 35, yPosition + 57)
        
        yPosition += medicationBlockHeight + 10 // Space between medications
      })
    } else {
      doc.setFont("helvetica", "italic")
      doc.text("No medications prescribed", leftMargin + 2, yPosition + 7)
      yPosition += 10
    }

    // Notes section - positioned at the bottom just above footer
    const footerHeight = 15
    const notesSectionY = pageHeight - footerHeight - 20;
    
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text("Notes:", leftMargin, notesSectionY)
    
    doc.setFont("helvetica", "normal")
    doc.text(data.notes || "Take plenty of rest and fluids.", leftMargin + 20, notesSectionY)

    // Add footer with blue background
    doc.setFillColor(19, 78, 74)
    doc.rect(0, pageHeight - footerHeight, pageWidth, footerHeight, "F")

    // Add contact info in footer - with Indian phone number
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)

    // Phone number on the left side
    doc.text(`+91 98765-43210`, 15, pageHeight - 5)

    // Copyright info in the center
    const copyrightText = "© 2025 Medinexus. All rights reserved."
    doc.text(copyrightText, pageWidth / 2, pageHeight - 5, { align: "center" })

    // Email on the right side - properly aligned
    const emailText = "contact@medinexus.in"
    const emailWidth = (doc.getStringUnitWidth(emailText) * doc.getFontSize()) / doc.internal.scaleFactor
    doc.text(emailText, pageWidth - emailWidth - 15, pageHeight - 5)

    // Generate a filename
    const filename = `prescription_${data._id}.pdf`

    // Save the PDF
    doc.save(filename)

    // Convert PDF to base64 string for email attachment or other uses
    const pdfBase64 = doc.output("datauristring")
    return pdfBase64
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw new Error("Failed to generate PDF")
  }
}

// Example usage with sample data for Indian context
const samplePrescriptionData: PrescriptionData = {
  _id: "67deb98c06e2",
  createdAt: new Date("3/22/2025"),
  patientName: "Kunal",
  patientId: "67a86da6204e7cb7509b9687",
  patientAge: "20",
  patientAddress: "42 Gandhi Road, Nashik, MH",
  patientContactNumber: "+91 95555-12345",
  doctorName: "Alok Verma",
  doctorContactNumber: "+91 98765-43210",
  clinicName: "Medinexus Health Center",
  clinicAddress: "123 Medical Center, Nashik Road, Nashik, Maharashtra 422101",
  clinicEmail: "contact@medinexus.in", 
  clinicWebsite: "www.medinexus.in",
  prescriptionNumber: "67deb98c06e2",
  diagnosis: "General checkup",
  prescriptions: [
    {
      medication: "Paracetamol",
      dosage: "500mg",
      frequency: "Twice daily",
      duration: "7 days",
      quantity: "14 tablets",
      instructions: "Take after meals with water",
    }
  ],
  notes: "Take plenty of rest and fluids.",
}