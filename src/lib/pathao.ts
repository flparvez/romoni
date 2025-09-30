import { OrderPayload, PathaoOrderResponse, PathaoAuthResponse, City, Zone, Area } from '@/types/pathao';

// A simple in-memory cache for the access token
let accessToken: string | null = null;
let tokenExpiryTime: number = 0;

const PATHAO_API_BASE_URL = process.env.PATHAO_API_BASE_URL;

const getAccessToken = async (): Promise<string> => {
  const currentTime = Date.now();
  if (accessToken && currentTime < tokenExpiryTime) {
    return accessToken;
  }

  const response = await fetch(`${PATHAO_API_BASE_URL}/aladdin/api/v1/issue-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.PATHAO_CLIENT_ID,
      client_secret: process.env.PATHAO_CLIENT_SECRET,
      grant_type: 'password',
      username: "uniquestorebd23@gmail.com",
      password: "MDparvez12@",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get access token: ${JSON.stringify(error)}`);
  }

  const data: PathaoAuthResponse = await response.json();
  accessToken = data.access_token;
  tokenExpiryTime = currentTime + (data.expires_in * 1000) - 60000;
  return accessToken;
};

export const createPathaoOrder = async (payload: OrderPayload): Promise<PathaoOrderResponse> => {
  const token = await getAccessToken();
  const response = await fetch(`${PATHAO_API_BASE_URL}/aladdin/api/v1/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Pathao API error: ${JSON.stringify(error)}`);
  }
  
  const data: PathaoOrderResponse = await response.json();
  return data;
};

export const getCities = async (): Promise<City[]> => {
  const token = await getAccessToken();
  const response = await fetch(`${PATHAO_API_BASE_URL}/aladdin/api/v1/countries/1/city-list`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch cities');
  const data = await response.json();
  return data.data;
};

export const getZones = async (cityId: number): Promise<Zone[]> => {
  const token = await getAccessToken();
  const response = await fetch(`${PATHAO_API_BASE_URL}/aladdin/api/v1/cities/${cityId}/zone-list`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch zones');
  
  try {
    const data = await response.json();
    // FIX: Clean the data to ensure it's JSON serializable
    const serializableData = JSON.parse(JSON.stringify(data.data));
    return serializableData;
  } catch (parseError) {
    console.error('JSON parsing failed for zones:', parseError);
    throw new Error('Invalid JSON response from Pathao API');
  }
};

export const getAreas = async (zoneId: number): Promise<Area[]> => {
  const token = await getAccessToken();
  const response = await fetch(`${PATHAO_API_BASE_URL}/aladdin/api/v1/zones/${zoneId}/area-list`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch areas');

  try {
    const data = await response.json();
    // FIX: Clean the data to ensure it's JSON serializable
    const serializableData = JSON.parse(JSON.stringify(data.data));
    return serializableData;
  } catch (parseError) {
    console.error('JSON parsing failed for areas:', parseError);
    throw new Error('Invalid JSON response from Pathao API');
  }
};