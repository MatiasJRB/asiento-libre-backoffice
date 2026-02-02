import { NormalizedFormResponse } from "./normalize-responses";

export type QuestionType = 'categorical' | 'text';

export interface QuestionStat {
  question: string;
  total: number;
  type: QuestionType;
  // Para categóricas
  counts?: Record<string, number>;
  // Para texto libre
  textAnswers?: string[];
  commonWords?: { word: string; count: number }[];
}

const SPANISH_STOPWORDS = new Set([
  'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un', 'para', 'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'más', 'pero', 'sus', 'le', 'ya', 'o', 'este', 'sí', 'porque', 'esta', 'entre', 'cuando', 'muy', 'sin', 'sobre', 'también', 'me', 'hasta', 'hay', 'donde', 'quien', 'desde', 'todo', 'nos', 'durante', 'todos', 'uno', 'les', 'ni', 'contra', 'otros', 'ese', 'eso', 'ante', 'ellos', 'e', 'esto', 'mí', 'antes', 'algunos', 'qué', 'unos', 'yo', 'otro', 'otras', 'otra', 'él', 'tanto', 'esa', 'estos', 'mucho', 'quienes', 'nada', 'muchos', 'cual', 'poco', 'ella', 'estar', 'estas', 'algunas', 'algo', 'nosotros', 'mi', 'mis', 'tú', 'te', 'ti', 'es', 'son', 'ser', 'era', 'estaba', 'fui'
]);

function getCommonWords(texts: string[]): { word: string; count: number }[] {
  const wordCounts = new Map<string, number>();
  
  texts.forEach(text => {
    // Limpiar texto: minúsculas, solo letras
    const words = text.toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
      .split(/\s+/)
      .filter(w => w.length > 3 && !SPANISH_STOPWORDS.has(w));
      
    words.forEach(w => {
        wordCounts.set(w, (wordCounts.get(w) || 0) + 1);
    });
  });

  return Array.from(wordCounts.entries())
    .sort((a, b) => b[1] - a[1]) // Descending
    .slice(0, 10) // Top 10
    .map(([word, count]) => ({ word, count }));
}

export function calculateAnalytics(responses: NormalizedFormResponse[]): QuestionStat[] {
  // 1. Agrupar todas las respuestas por pregunta
  const grouped = new Map<string, string[]>();

  responses.forEach(response => {
    response.answers.forEach(({ question, answer }) => {
      // Ignorar "Pregunta X" autogeneradas que no tienen sentido
      // o manejarlas después.
      
      const values = Array.isArray(answer) ? answer : [answer];
      
      if (!grouped.has(question)) {
        grouped.set(question, []);
      }
      const list = grouped.get(question)!;
      
      values.forEach(v => {
        if (v && v.trim() && v !== 'Respuesta no disponible') {
           list.push(v.trim());
        }
      });
    });
  });

  return Array.from(grouped.entries()).map(([question, answers]) => {
     const total = answers.length;
     
     // Heurística simple para determinar tipo
     // Si el promedio de caracteres es alto (>40) -> Texto
     // Si hay pocas respuestas pero únicas, o muchas respuestas pero se repiten poco -> Texto
     
     const totalChars = answers.reduce((acc, curr) => acc + curr.length, 0);
     const avgLength = total > 0 ? totalChars / total : 0;
     
     // Contar repeticiones para ver "unicidad"
     const counts: Record<string, number> = {};
     answers.forEach(a => counts[a] = (counts[a] || 0) + 1);
     const uniqueCount = Object.keys(counts).length;
     const uniquenessRatio = total > 0 ? uniqueCount / total : 0;

     // Decision: Es texto si es largo O si es muy único (y no son pocas respuestas coincidentes)
     // Si uniquenessRatio es bajo (ej: 0.1), significa que muchas personas respondieron lo mismo -> Categórico
     const isText = (avgLength > 30) || (uniquenessRatio > 0.5 && avgLength > 5);

     if (isText) {
        return {
            question,
            total,
            type: 'text',
            textAnswers: answers,
            commonWords: getCommonWords(answers)
        };
     } else {
         return {
             question,
             total,
             type: 'categorical',
             counts
         };
     }
  });
}
