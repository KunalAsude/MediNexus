import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Heading,
  Section,
  Img,
  Link,
  Hr,
  Button,
  Preview,
} from "@react-email/components";

interface AppointmentEmailProps {
  name: string;
  appointmentDate: string;
  reason: string;
  doctorName: string;
  type: "schedule" | "cancel";
  meetingId?: string;
  isDoctor?: boolean;
}

export const AppointmentEmail: React.FC<AppointmentEmailProps> = ({
  name,
  appointmentDate,
  reason,
  doctorName,
  type,
  meetingId,
  isDoctor = false,
}) => {
  const isScheduled = type === "schedule";
  const formattedDate = new Date(appointmentDate).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata', 
  });
  
  
  // Color theme
  const colors = {
    primary: "#0369a1",
    secondary: "#f0f9ff",
    accent: isScheduled ? "#059669" : "#dc2626",
    text: "#334155",
    light: "#f8fafc",
    border: "#e2e8f0",
  };

  return (
    <Html>
      <Head>
        <title>{isScheduled ? "Appointment Scheduled" : "Appointment Canceled"}</title>
        <Preview>
          {isScheduled 
            ? `Your appointment with ${doctorName} is confirmed for ${formattedDate}`
            : `Your appointment with ${doctorName} on ${formattedDate} has been canceled`}
        </Preview>
      </Head>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Img
              src="https://img.icons8.com/arcade/64/hospital.png"
              alt="MediNexus Logo"
              width="100"
              height="50"
              style={styles.logo}
            />
          </Section>

          {/* Status Banner */}
          <Section style={{
            ...styles.statusBanner,
            backgroundColor: isScheduled ? colors.accent : colors.accent,
          }}>
            <Heading style={styles.statusHeading}>
              {isScheduled ? "Appointment Confirmed" : "Appointment Canceled"}
            </Heading>
          </Section>

          {/* Main Content */}
          <Section style={styles.content}>
            <Text style={styles.greeting}>Dear {name},</Text>

            {isScheduled ? (
              <>
                <Text style={styles.mainText}>
                  {isDoctor
                    ? `An appointment with ${doctorName} has been scheduled.`
                    : `Your appointment with ${doctorName} has been successfully scheduled.`}
                </Text>

                {/* Appointment Details */}
                <Section style={styles.detailsCard}>
                  <Text style={styles.detailsTitle}>Appointment Details</Text>
                  
                  <Section style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Date & Time:</Text>
                    <Text style={styles.detailsValue}>{formattedDate}</Text>
                  </Section>
                  
                  <Section style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Provider:</Text>
                    <Text style={styles.detailsValue}> {doctorName}</Text>
                  </Section>
                  
                  <Section style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Reason:</Text>
                    <Text style={styles.detailsValue}>{reason}</Text>
                  </Section>

                  {meetingId && (
                    <Section style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>Meeting ID:</Text>
                      <Text style={styles.detailsValue}>{meetingId}</Text>
                    </Section>
                  )}
                </Section>

                <Text style={{...styles.instructionsText, marginTop: "20px"}}>
                  {isDoctor
                    ? "Please ensure you're available at the scheduled time."
                    : "Please arrive 5 minutes before your appointment time. Don't forget to bring any relevant medical records or test results."}
                </Text>

                {!isDoctor && (
                  <Section style={styles.buttonContainer}>
                    <Button style={styles.button} href="https://medinexus.in">
                      Manage Appointment
                    </Button>
                  </Section>
                )}
              </>
            ) : (
              <>
                <Text style={styles.mainText}>
                  {isDoctor
                    ? `The appointment with ${doctorName} on ${formattedDate} has been canceled.`
                    : `Unfortunately, your appointment with ${doctorName} on ${formattedDate} has been canceled.`}
                </Text>

                <Section style={{...styles.detailsCard, backgroundColor: "#fef2f2"}}>
                  <Text style={styles.detailsTitle}>Cancellation Details</Text>
                  
                  <Section style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Original Date:</Text>
                    <Text style={styles.detailsValue}>{formattedDate}</Text>
                  </Section>
                  
                  <Section style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Provider:</Text>
                    <Text style={styles.detailsValue}>{doctorName}</Text>
                  </Section>
                  
                  <Section style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Reason for Cancellation:</Text>
                    <Text style={styles.detailsValue}>{reason}</Text>
                  </Section>
                </Section>

                <Text style={{...styles.instructionsText, marginTop: "20px"}}>
                  {isDoctor
                    ? "The patient may contact to reschedule."
                    : "We apologize for any inconvenience this may cause. If you wish to reschedule, please use the button below to book a new appointment."}
                </Text>

                {!isDoctor && (
                  <Section style={styles.buttonContainer}>
                    <Button style={{...styles.button, backgroundColor: colors.primary}} href="https://medinexus.in">
                      Book New Appointment
                    </Button>
                  </Section>
                )}
              </>
            )}
          </Section>

          {/* Additional Info */}
          <Section style={styles.additionalInfo}>
            {!isDoctor && (
              <>
                <Text style={styles.additionalInfoTitle}>Need Help?</Text>
                <Text style={styles.additionalInfoText}>
                  If you have any questions or concerns, please contact our support team:
                </Text>
                <Text style={styles.contactInfo}>
                  📞 <Link href="tel:+15551234567" style={styles.link}>+1 (555) 123-4567</Link>
                </Text>
                <Text style={styles.contactInfo}>
                  ✉️ <Link href="mailto:support@medinexus.in" style={styles.link}>support@medinexus.in</Link>
                </Text>
              </>
            )}
          </Section>

          <Hr style={styles.divider} />

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              &copy; {new Date().getFullYear()} MediNexus Health. All rights reserved.
            </Text>
            <Text style={styles.footerLinks}>
              <Link href="https://medinexus.example/privacy" style={styles.smallLink}>Privacy Policy</Link> • 
              <Link href="https://medinexus.example/terms" style={styles.smallLink}>Terms of Service</Link> • 
              <Link href="https://medinexus.example/unsubscribe" style={styles.smallLink}>Unsubscribe</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const styles = {
  body: {
    backgroundColor: "#f1f5f9",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    margin: "0",
    padding: "0",
  },
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    overflow: "hidden",
    marginTop: "20px",
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  },
  header: {
    padding: "20px 30px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
  },
  logo: {
    margin: "0",
  },
  statusBanner: {
    padding: "16px 30px",
    textAlign: "center" as const,
  },
  statusHeading: {
    color: "#ffffff",
    fontSize: "24px",
    fontWeight: "600",
    margin: "0",
  },
  content: {
    padding: "30px",
  },
  greeting: {
    fontSize: "18px",
    color: "#334155",
    marginBottom: "16px",
  },
  mainText: {
    fontSize: "16px",
    lineHeight: "26px",
    color: "#334155",
    marginBottom: "24px",
  },
  detailsCard: {
    backgroundColor: "#f0f9ff",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "16px",
    borderLeft: "4px solid #0369a1",
  },
  detailsTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#0369a1",
    marginTop: "0",
    marginBottom: "16px",
  },
  detailsRow: {
    display: "flex",
    marginBottom: "12px",
  },
  detailsLabel: {
    width: "120px",
    fontWeight: "600",
    color: "#475569",
    margin: "0",
  },
  detailsValue: {
    flex: "1",
    color: "#334155",
    margin: "0",
    fontWeight: "400",
  },
  instructionsText: {
    fontSize: "16px",
    lineHeight: "24px",
    color: "#334155",
    marginBottom: "24px",
  },
  buttonContainer: {
    marginTop: "6px",
    marginBottom: "24px",
  },
  button: {
    backgroundColor: "#059669",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    textDecoration: "none",
    textAlign: "center" as const,
    padding: "12px 20px",
    display: "inline-block",
  },
  additionalInfo: {
    backgroundColor: "#f8fafc",
    padding: "20px 30px",
    borderTop: "1px solid #e2e8f0",
  },
  additionalInfoTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#334155",
    marginTop: "0",
    marginBottom: "12px",
  },
  additionalInfoText: {
    fontSize: "14px",
    color: "#475569",
    marginBottom: "16px",
    lineHeight: "22px",
  },
  contactInfo: {
    fontSize: "14px",
    color: "#475569",
    marginBottom: "8px",
  },
  link: {
    color: "#0369a1",
    textDecoration: "none",
  },
  divider: {
    borderColor: "#e2e8f0",
    margin: "0",
  },
  footer: {
    padding: "20px 30px",
    backgroundColor: "#ffffff",
  },
  footerText: {
    fontSize: "12px",
    color: "#64748b",
    marginBottom: "8px",
    textAlign: "center" as const,
  },
  footerLinks: {
    fontSize: "12px",
    color: "#64748b",
    textAlign: "center" as const,
  },
  smallLink: {
    color: "#64748b",
    textDecoration: "none",
    margin: "0 4px",
  },
};

export default AppointmentEmail;