# Google Forms Static Analysis Prompt

Este documento contiene el Prompt (instrucciones) utilizado para generar el análisis estático manual (`StaticAnalysisReport.tsx`) a partir de las respuestas crudas de Google Forms.

Usa este prompt con tu AI Assistant (Copilot, ChatGPT, Claude) cuando tengas un nuevo lote de datos y quieras actualizar los insights cualitativos.

---

## El Prompt

**Contexto:**
Estoy construyendo un MVP para una app de carpooling ("Asiento Libre") en Argentina. Tengo un export de respuestas de una encuesta de validación en formato JSON.
Necesito que actúes como un **Analista de Producto Senior** y analices estos datos para actualizar el reporte de situación. No quiero gráficos genéricos, quiero "storytelling" y cualitativa.

**Tus Objetivos:**
1.  **Leer** el archivo JSON de respuestas provisto.
2.  **Identificar** patrones clave en los comentarios de texto libre (miedos, deseos, casos de uso borde).
3.  **Detectar** nuevas ciudades o rutas mencionadas que no estaban en el análisis anterior.
4.  **Sintetizar** el "Sentimiento del Usuario" y las barreras de entrada.
5.  **Proveer** el código actualizado para el componente `StaticAnalysisReport.tsx`.

**Puntos Focales de Análisis:**
*   **Seguridad:** ¿Qué dicen exactamente sobre viajar con desconocidos? ¿Qué validaciones piden?
*   **Mascotas/Encomiendas:** Buscar menciones específicas. ¿Es un dolor fuerte?
*   **Rutas:** ¿Aparecen destinos de larga distancia (CABA, La Plata, Córdoba) o sigue siendo regional?
*   **Lenguaje:** ¿Qué palabras usa el usuario? (ej. "Micro" vs "Bondi").

**Formato de Salida Esperado:**
No me des un resumen en texto plano. Dame directamente el bloque de código JSX/React para reemplazar el contenido dentro de `src/components/admin/forms/StaticAnalysisReport.tsx`. Manten el estilo de tarjetas de `shadcn/ui`.

**Datos de Entrada:**
*(Aquí pegarías el contenido de tu JSON o le pedirías al agente que lea el archivo `data/google-forms/responses-normalized-YYYY-MM-DD.json`)*
