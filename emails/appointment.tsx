import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Heading,
  Section,
} from "@react-email/components";

interface AppointmentEmailProps {
  name: string;
  appointmentDate: string;
  reason: string; // Now used for both scheduled & canceled emails
  doctorName: string;
  type: "schedule" | "cancel";
}

export const AppointmentEmail: React.FC<Readonly<AppointmentEmailProps>> = ({
  name,
  appointmentDate,
  reason,
  doctorName,
  type,
}) => {
  const isScheduled = type === "schedule";

  return (
    <Html lang="en">
      <Head />
      <Body
        style={{
          fontFamily: "Arial, sans-serif",
          padding: "20px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <Container
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Heading style={{ color: "#333", textAlign: "center" }}>
            {isScheduled ? "Appointment Scheduled" : "Appointment Canceled"}
          </Heading>
          <Text>Dear {name},</Text>

          {isScheduled ? (
            <>
              <Text>
                Your appointment with <strong>{doctorName}</strong> has been
                successfully scheduled.
              </Text>
              <Section>
                <Text>
                  <strong>Date:</strong> {new Date(appointmentDate).toLocaleString()}
                  <br />
                  <strong>Reason:</strong> {reason}
                </Text>
              </Section>
              <Text>
                If you have any questions or need to reschedule, please contact
                the hospital.
              </Text>
            </>
          ) : (
            <>
              <Text>
                Unfortunately, your appointment with{" "}
                <strong>Dr. {doctorName}</strong> on{" "}
                <strong>{new Date(appointmentDate).toLocaleString()}</strong> has been canceled.
              </Text>
              <Section>
                <Text>
                  <strong>Reason for Cancellation:</strong> {reason}
                </Text>
              </Section>
              <Text>If you wish to reschedule, please book a new appointment.</Text>
              {/* <Text>
                <a
                  href="https://medinexus.com/appointments"
                  style={{
                    color: "#007bff",
                    textDecoration: "none",
                    fontWeight: "bold",
                  }}
                >
                  Click here to reschedule
                </a>
              </Text> */}
            </>
          )}

          <Text>Best regards,</Text>
          <Text>
            <strong>MediNexus Team</strong>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default AppointmentEmail;
