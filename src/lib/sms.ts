import axios from 'axios';

const AUTH_ID = import.meta.env.VITE_SMSHUB_AUTH_ID;
const SECRET_KEY = import.meta.env.VITE_SMSHUB_SECRET_KEY;
const BASE_URL = import.meta.env.VITE_SMSHUB_BASE_URL;
const SENDER_ID = import.meta.env.VITE_SMSHUB_SENDER_ID;

export const sendSMS = async (phone: string, message: string) => {
  if (!AUTH_ID || !SECRET_KEY) {
    console.log('SMS Simulation:', phone, message);
    return { success: true, simulated: true };
  }

  try {
    const response = await axios.post(`${BASE_URL}/send`, {
      auth_id: AUTH_ID,
      secret_key: SECRET_KEY,
      sender_id: SENDER_ID,
      to: phone,
      message: message,
    });
    return response.data;
  } catch (error) {
    console.error('SMS Error:', error);
    return { success: false, error };
  }
};
