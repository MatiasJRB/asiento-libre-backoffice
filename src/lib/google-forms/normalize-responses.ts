/**
 * Normaliza las respuestas del formulario de Google Forms
 * Form ID: 17cXUR1aJHApjghaNmo0BN3Xj7eCj2Vg4RBYls8hDvJY
 */

export interface NormalizedFormResponse {
  responseId: string;
  timestamp: string;
  email?: string;
  answers: {
    question: string;
    answer: string | string[];
  }[];
}

export interface GoogleFormResponse {
  responseId: string;
  createTime: string;
  lastSubmittedTime: string;
  respondentEmail?: string;
  answers: {
    [questionId: string]: {
      questionId: string;
      textAnswers?: {
        answers: Array<{ value: string }>;
      };
      fileUploadAnswers?: {
        answers: Array<{ fileId: string; fileName: string; mimeType: string }>;
      };
    };
  };
}

export interface GoogleFormStructure {
  formId: string;
  info: {
    title: string;
  };
  items: Array<{
    itemId: string;
    title: string;
    questionItem?: {
      question: {
        questionId: string;
        required: boolean;
      };
    };
  }>;
}

/**
 * Normaliza una respuesta individual del formulario
 */
export function normalizeResponse(
  response: GoogleFormResponse,
  formStructure: GoogleFormStructure
): NormalizedFormResponse {
  const questionMap = new Map<string, string>();
  
  // Crear un mapa de questionId -> título de pregunta
  formStructure.items.forEach(item => {
    if (item.questionItem?.question?.questionId) {
      questionMap.set(item.questionItem.question.questionId, item.title);
    }
  });

  const normalizedAnswers = Object.entries(response.answers).map(([questionId, answer]) => {
    const question = questionMap.get(questionId) || `Pregunta ${questionId}`;
    
    let answerValue: string | string[];
    
    if (answer.textAnswers) {
      const textValues = answer.textAnswers.answers.map(a => a.value);
      answerValue = textValues.length === 1 ? textValues[0] : textValues;
    } else if (answer.fileUploadAnswers) {
      answerValue = answer.fileUploadAnswers.answers.map(
        file => `${file.fileName} (${file.fileId})`
      );
    } else {
      answerValue = 'Respuesta no disponible';
    }

    return {
      question,
      answer: answerValue
    };
  });

  return {
    responseId: response.responseId,
    timestamp: response.lastSubmittedTime || response.createTime,
    email: response.respondentEmail,
    answers: normalizedAnswers
  };
}

/**
 * Normaliza todas las respuestas del formulario
 */
export function normalizeAllResponses(
  responses: GoogleFormResponse[],
  formStructure: GoogleFormStructure
): NormalizedFormResponse[] {
  return responses.map(response => normalizeResponse(response, formStructure));
}

/**
 * Extrae los datos en formato tabular para análisis
 */
export function toTabularFormat(normalizedResponses: NormalizedFormResponse[]) {
  if (normalizedResponses.length === 0) return [];

  // Obtener todas las preguntas únicas
  const allQuestions = new Set<string>();
  normalizedResponses.forEach(response => {
    response.answers.forEach(answer => {
      allQuestions.add(answer.question);
    });
  });

  // Crear filas tabulares
  return normalizedResponses.map(response => {
    const row: Record<string, any> = {
      responseId: response.responseId,
      timestamp: response.timestamp,
      email: response.email || 'N/A'
    };

    // Agregar cada respuesta como columna
    response.answers.forEach(answer => {
      row[answer.question] = Array.isArray(answer.answer) 
        ? answer.answer.join(', ') 
        : answer.answer;
    });

    return row;
  });
}
