import { jsPDF } from "jspdf";

/**
 * Prescription data interface for better type safety
 */
export interface PrescriptionData {
  _id?: string;
  createdAt: string | Date;
  patientName: string;
  patientId?: string;
  patientEmail?: string;
  doctorName?: string;
  doctorId?: string;
  prescriptions: {
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: string;
    instructions: string;
  }[];
  notes?: string;
}

/**
 * Generates a prescription PDF, triggers download and returns it as a base64 string
 * @param prescriptionData The prescription data object
 * @returns Promise resolving to a base64 string of the PDF
 */
export const generatePrescriptionPDF = async (prescriptionData: PrescriptionData): Promise<string> => {
  // Validate that prescriptionData exists and has the required fields
  if (!prescriptionData) {
    console.error("Prescription data is undefined or null");
    throw new Error("Cannot generate PDF: Prescription data is missing");
  }

  // Check for required fields
  if (!prescriptionData.createdAt || !prescriptionData.patientName || !prescriptionData.prescriptions) {
    console.error("Prescription data is missing required fields", prescriptionData);
    throw new Error("Cannot generate PDF: Prescription data is incomplete");
  }

  try {
    // Create new jsPDF instance
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Add header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Medical Prescription", pageWidth / 2, 20, { align: "center" });
    
    // Add date
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const prescriptionDate = new Date(prescriptionData.createdAt).toLocaleDateString();
    doc.text(`Date: ${prescriptionDate}`, 20, 35);
    
    // Add patient details
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Patient Details", 20, 45);
    doc.setFont("helvetica", "normal");
    doc.text(`Patient Name: ${prescriptionData.patientName || "Not specified"}`, 20, 52);
    doc.text(`Patient ID: ${prescriptionData.patientId || "Not specified"}`, 20, 59);
    
    // Add doctor details
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Doctor Details", 20, 70);
    doc.setFont("helvetica", "normal");
    doc.text(`Doctor Name: ${prescriptionData.doctorName || "Not specified"}`, 20, 77);
    
    // Add medications header
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Prescribed Medications", 20, 90);
    
    // Add table headers
    const tableHeaders = ["Medication", "Dosage", "Frequency", "Duration", "Quantity", "Instructions"];
    doc.setFontSize(10);
    let yPosition = 100;
    const columnWidth = 30;
    let xPosition = 20;
    
    tableHeaders.forEach((header) => {
      doc.setFont("helvetica", "bold");
      doc.text(header, xPosition, yPosition);
      xPosition += columnWidth;
    });
    
    // Add medications
    yPosition += 10;
    
    if (Array.isArray(prescriptionData.prescriptions) && prescriptionData.prescriptions.length > 0) {
      prescriptionData.prescriptions.forEach((medication) => {
        xPosition = 20;
        doc.setFont("helvetica", "normal");
        doc.text(medication.medication || "N/A", xPosition, yPosition);
        xPosition += columnWidth;
        doc.text(medication.dosage || "N/A", xPosition, yPosition);
        xPosition += columnWidth;
        doc.text(`${medication.frequency || "N/A"} times daily`, xPosition, yPosition);
        xPosition += columnWidth;
        doc.text(`${medication.duration || "N/A"} days`, xPosition, yPosition);
        xPosition += columnWidth;
        doc.text(medication.quantity || "N/A", xPosition, yPosition);
        xPosition += columnWidth;
        doc.text(medication.instructions || "N/A", xPosition, yPosition);
        
        yPosition += 10;
      });
    } else {
      xPosition = 20;
      doc.setFont("helvetica", "italic");
      doc.text("No medications prescribed", xPosition, yPosition);
    }
    
    // Add notes if any
    if (prescriptionData.notes && prescriptionData.notes.trim() !== "") {
      yPosition += 5;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Additional Notes:", 20, yPosition);
      yPosition += 7;
      doc.setFont("helvetica", "normal");
      doc.text(prescriptionData.notes, 20, yPosition);
    }
    
    // Add footer with signature area
    const footerPosition = doc.internal.pageSize.height - 30;
    doc.setFontSize(10);
    doc.text("Doctor's Signature: ___________________", 20, footerPosition);
    
    // Generate a filename
    const filename = `prescription_${prescriptionData._id || new Date().getTime()}.pdf`;
    
    // Trigger download automatically
    doc.save(filename);
    
    // Convert PDF to base64 string for email attachment
    const pdfBase64 = doc.output('datauristring');
    return pdfBase64;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
};

/**
 * Sends prescription PDF to patient via email using Resend
 * @param prescriptionData The prescription data
 * @param patientEmail The patient's email address
 * @param doctorName The doctor's name
 * @returns Promise resolving to success status
 */
export const emailPrescriptionToPatient = async (
  prescriptionData: PrescriptionData, 
  patientEmail: string,
  doctorName?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Make sure doctorName is included in the prescription data
    const updatedPrescriptionData = {
      ...prescriptionData,
      doctorName: doctorName || prescriptionData.doctorName
    };
    console.log("updatedPrescritption -",updatedPrescriptionData)
    
    // Generate PDF as base64 (this will also trigger the download)
    const pdfBase64 = await generatePrescriptionPDF(updatedPrescriptionData);
    
    // Extract the base64 content (remove data:application/pdf;base64, prefix)
    const pdfParts = pdfBase64.split(',');
    const pdfContent = pdfParts.length > 1 ? pdfParts[1] : pdfBase64;
    
    // Send PDF to your email API endpoint
    const response = await fetch('/api/send-prescription-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: updatedPrescriptionData?.patientEmail,
        subject: `Your Medical Prescription !!!`,
        patientName: prescriptionData.patientName,
        prescriptionId: updatedPrescriptionData?._id,
        doctorName: updatedPrescriptionData.doctorName,
        attachments: [
          {
            filename: `prescription_${prescriptionData._id || new Date().getTime()}.pdf`,
            content: pdfContent,
            encoding: 'base64',
            contentType: 'application/pdf',
          }
        ]
      }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to send email');
    }
    
    return { success: true, message: 'Prescription sent successfully via email' };
  } catch (error) {
    console.error('Error sending prescription email:', error);
    return { success: false, message: error.message || 'Failed to send prescription email' };
  }
};