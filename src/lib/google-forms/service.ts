import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { normalizeAllResponses, toTabularFormat, GoogleFormStructure, GoogleFormResponse } from './normalize-responses';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

function getClient() {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    throw new Error('Faltan credenciales de Google en las variables de entorno');
  }

  const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET);
  oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
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
  const forms = getFormsService();
  const response = await forms.forms.responses.list({ formId });
  const responses = (response.data.responses || []) as GoogleFormResponse[];
  
  // También necesitamos la estructura para normalizar
  const formResponse = await forms.forms.get({ formId });
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
}
