import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { normalizeAllResponses, toTabularFormat, GoogleFormStructure, GoogleFormResponse } from './normalize-responses';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

function getClient() {
  console.log('Verificando credenciales de Google...');
  console.log('CLIENT_ID existe:', !!CLIENT_ID);
  console.log('CLIENT_SECRET existe:', !!CLIENT_SECRET);
  console.log('REFRESH_TOKEN existe:', !!REFRESH_TOKEN);
  
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    console.error('Faltan credenciales:', {
      hasClientId: !!CLIENT_ID,
      hasClientSecret: !!CLIENT_SECRET,
      hasRefreshToken: !!REFRESH_TOKEN
    });
    throw new Error('Faltan credenciales de Google en las variables de entorno');
  }

  console.log('Creando OAuth2Client con CLIENT_ID:', CLIENT_ID.substring(0, 10) + '...');
  const oauth2Client = new OAuth2Client(
    CLIENT_ID, 
    CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );
  oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
  console.log('OAuth2Client creado exitosamente');
  return oauth2Client;
}

function getFormsService() {
  const auth = getClient();
  return google.forms({ version: 'v1', auth });
}

export async function getForm(formId: string) {
  const forms = getFormsService();
  const response = await forms.forms.get({ formId });
  return response.data as GoogleFormStructure;
}

export async function getFormResponses(formId: string) {
  try {
    console.log('getFormResponses: iniciando para formId:', formId);
    const forms = getFormsService();
    console.log('getFormResponses: forms service creado');
    
    const response = await forms.forms.responses.list({ formId });
    console.log('getFormResponses: respuestas obtenidas:', response.data.responses?.length || 0);
    const responses = (response.data.responses || []) as GoogleFormResponse[];
    
    // También necesitamos la estructura para normalizar
    const formResponse = await forms.forms.get({ formId });
    console.log('getFormResponses: estructura del form obtenida');
    const formStructure = formResponse.data as GoogleFormStructure;

    const normalized = normalizeAllResponses(responses, formStructure);
    const tabular = toTabularFormat(normalized);

    return {
      raw: responses,
      normalized,
      tabular,
      formTitle: formStructure.info.title,
      totalResponses: responses.length
    };
  } catch (error: unknown) {
    console.error('getFormResponses: ERROR COMPLETO:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: unknown; status?: number } };
      console.error('getFormResponses: Response status:', apiError.response?.status);
      console.error('getFormResponses: Response data:', JSON.stringify(apiError.response?.data, null, 2));
    }
    throw error;
  }
}
