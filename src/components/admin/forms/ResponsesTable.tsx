import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NormalizedFormResponse } from "@/lib/google-forms/normalize-responses";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ResponsesTableProps {
  responses: NormalizedFormResponse[];
}

export function ResponsesTable({ responses }: ResponsesTableProps) {
  if (responses.length === 0) {
    return <div className="text-center py-10">No hay respuestas para mostrar.</div>;
  }

  // Extraer todas las preguntas únicas para los encabezados
  const questionMap = new Map<string, string>(); // Pregunta -> Key acortada
  
  responses.forEach(r => {
    r.answers.forEach(a => {
        // Usamos la pregunta completa como key por ahora
        questionMap.set(a.question, a.question);
    });
  });

  const questions = Array.from(questionMap.keys());

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Fecha</TableHead>
            <TableHead>Email</TableHead>
            {questions.map((q, i) => (
              <TableHead key={i} className="min-w-[200px]">
                {q}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {responses.map((response) => (
            <TableRow key={response.responseId}>
              <TableCell className="font-medium whitespace-nowrap">
                {format(new Date(response.timestamp), "dd/MM/yyyy HH:mm", { locale: es })}
              </TableCell>
              <TableCell>{response.email || "N/A"}</TableCell>
              {questions.map((q, i) => {
                const answer = response.answers.find(a => a.question === q);
                let displayValue = "-";
                
                if (answer) {
                    if (Array.isArray(answer.answer)) {
                        displayValue = answer.answer.join(", ");
                    } else {
                        displayValue = answer.answer;
                    }
                }

                return (
                  <TableCell key={i} className="max-w-[300px] truncate" title={displayValue}>
                    {displayValue}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
