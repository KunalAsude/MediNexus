
export function getAuthToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  export function getUserDetails() {
    if (typeof window === 'undefined') return null;
    
    const userDetailsString = localStorage.getItem('userDetails');
    if (!userDetailsString) return null;
    
    try {
      return JSON.parse(userDetailsString);
    } catch (e) {
      console.error("Error parsing user details:", e);
      return null;
    }
  }
  
 
  export function getAuthHeaders() {
    const token = getAuthToken();
    const userDetails = getUserDetails();
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (userDetails) {
      headers['User-Details'] = JSON.stringify(userDetails);
    }
    
    return headers;
  }
  
 
  export async function makeEmergencyRequest(data:Date, method = 'POST', endpoint = '/api/emergency') {
    const headers = getAuthHeaders();
    
    const response = await fetch(endpoint, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return response.json();
  }
  
 
  export async function sendEmergencyAlert(emergencyData = {}) {
    // Get current location
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const userDetails = getUserDetails();
            
            const data = {
              ...emergencyData,
              location: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
              },
              deviceInfo: navigator.userAgent,
              timestamp: new Date().toISOString(),
              userId: userDetails?.id,
              userName: userDetails?.name,
            };
            
            const response = await makeEmergencyRequest(data);
            resolve(response);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          reject(new Error(`Unable to get location: ${error.message}`));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }
  
  export async function checkEmergencyStatus(emergencyId:any) {
    const headers = getAuthHeaders();
    const response = await fetch(`/api/emergency?id=${emergencyId}`, {
      method: 'GET',
      headers,
    });
    
    return response.json();
  }
  
  export async function updateEmergencyStatus(emergencyId, status, additionalData = {}) {
    const data = {
      emergencyId,
      status,
      ...additionalData,
    };
    
    return makeEmergencyRequest(data, 'PATCH');
  }