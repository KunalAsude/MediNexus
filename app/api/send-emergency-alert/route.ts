import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmergencyData {
  latitude: number;
  longitude: number;
  timestamp: string;
  userDetails: {
    id: string;
    name: string;
    email: string;
    phone: string;
    emergencyContact: {
      name: string;
      phone: string;
      relation: string;
    } | null;
  };
}

export async function POST(request: Request) {
  try {
    const body: EmergencyData = await request.json();
    const { latitude, longitude, timestamp, userDetails } = body;

    const { data, error } = await resend.emails.send({
      from: 'MediNexus Emergency <onreply@medinexus.in>',
      to: ['medinexus.dev24@gmail.com'],
      subject: '🚨 Emergency Alert - User Location',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background-color: #dc2626;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 5px 5px 0 0;
              }
              .content {
                background-color: #f9fafb;
                padding: 20px;
                border: 1px solid #e5e7eb;
                border-radius: 0 0 5px 5px;
              }
              .section {
                margin-bottom: 20px;
              }
              .section-title {
                color: #dc2626;
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 10px;
              }
              .info-grid {
                display: grid;
                grid-template-columns: 150px 1fr;
                gap: 10px;
                margin-bottom: 10px;
              }
              .label {
                font-weight: bold;
                color: #4b5563;
              }
              .value {
                color: #111827;
              }
              .map-link {
                display: inline-block;
                background-color: #dc2626;
                color: white;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🚨 Emergency Alert</h1>
              <p>Time: ${new Date(timestamp).toLocaleString()}</p>
            </div>
            
            <div class="content">
              <div class="section">
                <div class="section-title">User Information</div>
                <div class="info-grid">
                  <div class="label">Name:</div>
                  <div class="value">${userDetails.name}</div>
                  
                  <div class="label">ID:</div>
                  <div class="value">${userDetails.id}</div>
                  
                  <div class="label">Email:</div>
                  <div class="value">${userDetails.email}</div>
                  
                  <div class="label">Phone:</div>
                  <div class="value">${userDetails.phone}</div>
                </div>
              </div>

              ${userDetails.emergencyContact ? `
                <div class="section">
                  <div class="section-title">Emergency Contact</div>
                  <div class="info-grid">
                    <div class="label">Name:</div>
                    <div class="value">${userDetails.emergencyContact.name}</div>
                    
                    <div class="label">Relation:</div>
                    <div class="value">${userDetails.emergencyContact.relation}</div>
                    
                    <div class="label">Phone:</div>
                    <div class="value">${userDetails.emergencyContact.phone}</div>
                  </div>
                </div>
              ` : ''}

              <div class="section">
                <div class="section-title">Location Details</div>
                <div class="info-grid">
                  <div class="label">Coordinates:</div>
                  <div class="value">${latitude}, ${longitude}</div>
                </div>
                <div class="map-links">
                  <a href="https://www.google.com/maps?q=${latitude},${longitude}" class="map-link" target="_blank">
                    View on Google Maps
                  </a>
                  <a href="https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15" class="map-link" target="_blank" style="margin-left: 10px;">
                    View on OpenStreetMap
                  </a>
                </div>
              </div>
            </div>

            <div class="footer">
              <p>This is an automated emergency alert from MediNexus. Please respond immediately.</p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
} 