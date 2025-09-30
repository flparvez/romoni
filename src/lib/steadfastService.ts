const STEADFAST_API_BASE_URL = process.env.STEADFAST_API_BASE_URL;
const STEADFAST_API_KEY = process.env.STEADFAST_API_KEY;
const STEADFAST_SECRET_KEY = process.env.STEADFAST_SECRET_KEY;

import { SteadfastOrderPayload, SteadfastOrderResponse, SteadfastLocation } from "@/types/steadfast";

if (!STEADFAST_API_KEY || !STEADFAST_SECRET_KEY || !STEADFAST_API_BASE_URL) {
  throw new Error('Steadfast API environment variables are not set.');
}

// Function to create a new order with Steadfast
export const createSteadfastOrder = async (payload: SteadfastOrderPayload): Promise<SteadfastOrderResponse> => {
  try {
    // console.log('Sending request to Steadfast API:', {
    //   url: `${STEADFAST_API_BASE_URL}/create_order`,
    //   payload: payload
    // });

    const response = await fetch(`${STEADFAST_API_BASE_URL}/create_order`, {
      method: 'POST',
      headers: {
        'Api-Key': STEADFAST_API_KEY,
        'Secret-Key': STEADFAST_SECRET_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

   

    // Get the response text first to handle both HTML and JSON responses
    const responseText = await response.text();
  
    if (!response.ok) {
      // Try to parse as JSON, if it fails, use the raw text
      let errorMessage = responseText;
      try {
        const errorJson = JSON.parse(responseText);
        errorMessage = JSON.stringify(errorJson);
      } catch (e) {
        // If it's HTML, provide a more helpful error message
        if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
          errorMessage = 'Steadfast API returned HTML instead of JSON. Check your API credentials, base URL, and endpoint.';
        }
      }
      
      throw new Error(`Steadfast API error (${response.status}): ${errorMessage}`);
    }

    // Parse the successful response as JSON
    const data: SteadfastOrderResponse = JSON.parse(responseText);
 
    return data;
  } catch (error) {
    console.error('Error in createSteadfastOrder:', error);
    throw error;
  }
};

// Function to get a list of cities from Steadfast (if available)
export const getSteadfastLocations = async (): Promise<SteadfastLocation[]> => {
  try {
    const response = await fetch(`${STEADFAST_API_BASE_URL}/locations`, {
      headers: {
        'Api-Key': STEADFAST_API_KEY,
        'Secret-Key': STEADFAST_SECRET_KEY,
      },
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      let errorMessage = responseText;
      try {
        const errorJson = JSON.parse(responseText);
        errorMessage = JSON.stringify(errorJson);
      } catch (e) {
        if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
          errorMessage = 'Steadfast locations API returned HTML. Check endpoint availability.';
        }
      }
      throw new Error(`Failed to fetch Steadfast locations: ${errorMessage}`);
    }

    const data = JSON.parse(responseText);
    return data.data || data;
  } catch (error) {
    console.error('Error in getSteadfastLocations:', error);
    throw error;
  }
};

// Test function to verify API connection
export const testSteadfastConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${STEADFAST_API_BASE_URL}/create_order`, {
      method: 'POST',
      headers: {
        'Api-Key': STEADFAST_API_KEY,
        'Secret-Key': STEADFAST_SECRET_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const responseText = await response.text();
    
    // Even if it fails, if we don't get HTML, the connection is working
    return !responseText.includes('<!DOCTYPE') && !responseText.includes('<html');
  } catch (error) {
    console.error('Steadfast connection test failed:', error);
    return false;
  }
};