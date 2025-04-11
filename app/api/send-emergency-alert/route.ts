import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// Hospital interface 
interface Hospital {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance: number;
}

// Distance calculation function
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Fetch hospitals near the given coordinates using OpenStreetMap Nominatim API
async function fetchNearestHospitals(latitude: number, longitude: number): Promise<Hospital[]> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=10&` +
      `q=hospital&viewbox=${longitude-0.5},${latitude-0.5},${longitude+0.5},${latitude+0.5}&bounded=1`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch hospitals');
    }

    const data = await response.json();

    // Process and calculate distances
    const hospitals: Hospital[] = data
      .filter((hospital: any) => hospital.type === 'hospital')
      .map((hospital: any) => ({
        name: hospital.display_name || 'Unnamed Hospital',
        address: hospital.display_name || 'Address Not Available',
        latitude: parseFloat(hospital.lat),
        longitude: parseFloat(hospital.lon),
        distance: calculateDistance(latitude, longitude, parseFloat(hospital.lat), parseFloat(hospital.lon))
      }))
      // Sort by distance
      .sort((a: Hospital, b: Hospital) => a.distance - b.distance)
      // Limit to top 5 nearest hospitals
      .slice(0, 5);

    return hospitals;
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    return [];
  }
}

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const body = await request.json();
    const { latitude, longitude, timestamp, userDetails } = body;

    // Fetch nearest hospitals
    const nearestHospitals = await fetchNearestHospitals(latitude, longitude);

    // Send single email to MediNexus with hospital information
    const { data, error } = await resend.emails.send({
      from: 'MediNexus Emergency <no-reply@medinexus.in>',
      to: ['medinexus.dev24@gmail.com','adhavrohit37@gmail.com'],
      // to: [hospital.email!],
      subject: '🚨 Emergency Alert - Nearest Hospitals',
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
              .hospital-section {
                background-color: #f3f4f6;
                border: 1px solid #d1d5db;
                border-radius: 5px;
                padding: 15px;
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

              <div class="section hospital-section">
                <div class="section-title">Nearest Hospitals</div>
                ${nearestHospitals.map((hospital, index) => `
                  <div class="info-grid">
                    <div class="label">Hospital ${index + 1}:</div>
                    <div class="value">${hospital.name}</div>
                    
                    <div class="label">Address:</div>
                    <div class="value">${hospital.address}</div>
                    
                    <div class="label">Distance:</div>
                    <div class="value">${hospital.distance.toFixed(2)} km</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="footer">
              <p>This is an automated emergency alert from MediNexus. Immediate response required.</p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ 
      nearestHospitals: nearestHospitals.map(hospital => ({
        name: hospital.name,
        address: hospital.address,
        distance: hospital.distance
      }))
    });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}