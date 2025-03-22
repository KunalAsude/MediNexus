import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
  } from "@react-email/components";
  import { Font } from "@react-email/font";
  
  interface PrescriptionEmailProps {
    patientName: string;
    prescriptionId: string;
    prescriptionDate: string;
    doctorName: string;
  }
  
  export default function PrescriptionEmail({
    patientName,
    prescriptionId,
    prescriptionDate,
    doctorName,
  }: PrescriptionEmailProps) {
    return (
      <Html>
        <Head>
          <Font
            fontFamily="Roboto"
            fallbackFontFamily="Verdana"
            webFont={{
              url: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
              format: "woff2",
            }}
            fontWeight={400}
            fontStyle="normal"
          />
        </Head>
        <Preview>Your Medical Prescription from {doctorName}</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading as="h1" style={styles.heading}>
              Your Medical Prescription
            </Heading>
            
            <Section style={styles.section}>
              <Text style={styles.text}>
                Dear {patientName},
              </Text>
              
              <Text style={styles.text}>
                Your prescription (ID: {prescriptionId}) dated {prescriptionDate} has been prepared by Dr. {doctorName} and is attached to this email as a PDF document.
              </Text>
              
              <Text style={styles.text}>
                Please find your prescription details in the attached PDF. You can present this document at your pharmacy to collect your medications.
              </Text>
              
              <Text style={styles.text}>
                If you have any questions about your prescription or treatment plan, please contact your healthcare provider.
              </Text>
              
              <Text style={styles.text}>
                For your security, please verify that the prescription details match your consultation.
              </Text>
            </Section>
            
            <Text style={styles.footer}>
              This is an automated message. Please do not reply to this email.
            </Text>
          </Container>
        </Body>
      </Html>
    );
  }
  
  const styles = {
    body: {
      backgroundColor: "#f6f9fc",
      fontFamily: "Roboto, Verdana, sans-serif",
    },
    container: {
      margin: "0 auto",
      padding: "20px 0",
      maxWidth: "600px",
    },
    heading: {
      color: "#333",
      fontSize: "24px",
      fontWeight: "bold",
      textAlign: "center" as const,
      margin: "30px 0",
    },
    section: {
      backgroundColor: "#ffffff",
      padding: "30px",
      borderRadius: "5px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    text: {
      color: "#333",
      fontSize: "16px",
      lineHeight: "24px",
      marginBottom: "20px",
    },
    footer: {
      color: "#8898aa",
      fontSize: "12px",
      marginTop: "20px",
      textAlign: "center" as const,
    },
  };