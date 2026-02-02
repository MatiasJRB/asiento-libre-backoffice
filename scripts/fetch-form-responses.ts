#!/usr/bin/env tsx

/**
 * Script para obtener y normalizar las respuestas del formulario de Google Forms
 * 
 * Uso:
 * npx tsx scripts/fetch-form-responses.ts
 */

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { normalizeAllResponses, toTabularFormat } from '../src/lib/google-forms/normalize-responses';
import * as fs from 'fs';
import * as path from 'path';

const FORM_ID = '17cXUR1aJHApjghaNmo0BN3Xj7eCj2Vg4RBYls8hDvJY';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
  console.error("Error: Falta configurar variables de entorno GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET o GOOGLE_REFRESH_TOKEN");
  process.exit(1);
}

async function fetchFormResponses() {
  console.log('🔐 Autenticando con Google Forms API...');
  
  // Configurar cliente OAuth2
  const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET);
  oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

  // Inicializar API de Google Forms
  const forms = google.forms({ version: 'v1', auth: oauth2Client });

  try {
    console.log(`📋 Obteniendo estructura del formulario ${FORM_ID}...`);
    const formResponse = await forms.forms.get({ formId: FORM_ID });
    const formStructure = formResponse.data;

    console.log(`✅ Formulario: ${formStructure.info?.title}`);
    console.log(`📊 Total de preguntas: ${formStructure.items?.length || 0}`);

    console.log('\n📥 Obteniendo respuestas del formulario...');
    const responsesResponse = await forms.forms.responses.list({ formId: FORM_ID });
    
    const responses = responsesResponse.data.responses || [];
    console.log(`✅ Total de respuestas: ${responses.length}`);

    if (responses.length === 0) {
      console.log('⚠️  No hay respuestas en el formulario');
      return;
    }

    console.log('\n🔄 Normalizando respuestas...');
    const normalizedResponses = normalizeAllResponses(responses as any, formStructure as any);
    
    console.log('\n📊 Convirtiendo a formato tabular...');
    const tabularData = toTabularFormat(normalizedResponses);

    // Guardar archivos
    const outputDir = path.join(process.cwd(), 'data', 'google-forms');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Guardar respuestas normalizadas
    const normalizedPath = path.join(outputDir, `responses-normalized-${timestamp}.json`);
    fs.writeFileSync(normalizedPath, JSON.stringify(normalizedResponses, null, 2));
    console.log(`✅ Respuestas normalizadas guardadas en: ${normalizedPath}`);

    // Guardar formato tabular
    const tabularPath = path.join(outputDir, `responses-tabular-${timestamp}.json`);
    fs.writeFileSync(tabularPath, JSON.stringify(tabularData, null, 2));
    console.log(`✅ Formato tabular guardado en: ${tabularPath}`);

    // Guardar como CSV
    const csvPath = path.join(outputDir, `responses-${timestamp}.csv`);
    const csvContent = convertToCSV(tabularData);
    fs.writeFileSync(csvPath, csvContent);
    console.log(`✅ CSV guardado en: ${csvPath}`);

    // Mostrar resumen
    console.log('\n📈 Resumen de respuestas:');
    console.log(`   - Total de respuestas: ${normalizedResponses.length}`);
    console.log(`   - Primera respuesta: ${normalizedResponses[0]?.timestamp}`);
    console.log(`   - Última respuesta: ${normalizedResponses[normalizedResponses.length - 1]?.timestamp}`);
    
    // Mostrar ejemplo de la primera respuesta
    console.log('\n📄 Ejemplo de respuesta normalizada:');
    console.log(JSON.stringify(normalizedResponses[0], null, 2));

  } catch (error: any) {
    console.error('❌ Error al obtener respuestas:', error.message);
    if (error.response?.data) {
      console.error('Detalles del error:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      const escaped = String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

// Ejecutar script
fetchFormResponses().catch(console.error);
