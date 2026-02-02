import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuestionStat } from "@/lib/google-forms/analytics";
import { Quote } from "lucide-react";

export function FormAnalytics({ stats }: { stats: QuestionStat[] }) {
  if (stats.length === 0) return null;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {stats.map((stat, index) => {
        // --- VISTA PARA PREGUNTAS DE TEXTO LIBRE ---
        if (stat.type === 'text') {
            return (
                <Card key={index} className="break-inside-avoid flex flex-col h-[500px]">
                    <CardHeader className="pb-2 flex-shrink-0">
                        <CardTitle className="text-base font-medium flex items-start justify-between gap-2">
                            <span>{stat.question}</span>
                            <Badge variant="outline" className="shrink-0 bg-blue-50 text-blue-700 border-blue-200">
                                Texto Libre
                            </Badge>
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">{stat.total} respuestas</p>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden flex flex-col gap-4">
                         {/* Palabras Clave */}
                        {stat.commonWords && stat.commonWords.length > 0 && (
                            <div className="flex-shrink-0">
                                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Temas frecuentes</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {stat.commonWords.map((w) => (
                                        <Badge key={w.word} variant="secondary" className="text-xs font-normal">
                                            {w.word} <span className="ml-1 opacity-50 text-[10px]">({w.count})</span>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Lista de comentarios */}
                        <div className="flex-1 min-h-0 relative border rounded-md bg-slate-50 dark:bg-slate-900/50">
                            <div className="absolute inset-0 overflow-y-auto p-3 space-y-3">
                                {stat.textAnswers?.map((ans, i) => (
                                    <div key={i} className="bg-white dark:bg-slate-950 p-3 rounded shadow-sm border text-sm relative pl-6">
                                        <Quote className="h-3 w-3 text-slate-300 absolute left-2 top-3" />
                                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">"{ans}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        // --- VISTA PARA PREGUNTAS CATEGÓRICAS (Original) ---
        return (
            <Card key={index} className="break-inside-avoid h-fit">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">{stat.question}</CardTitle>
                <p className="text-xs text-muted-foreground">{stat.total} respuestas</p>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                {stat.counts && Object.entries(stat.counts)
                    .sort(([, a], [, b]) => b - a) // Sort by count descending
                    .map(([answer, count]) => {
                    const percentage = stat.total > 0 ? Math.round((count / stat.total) * 100) : 0;
                    return (
                        <div key={answer} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                            <span className="truncate max-w-[85%] font-medium text-slate-700 dark:text-slate-300" title={answer}>
                                {answer}
                            </span>
                            <span className="text-xs text-muted-foreground tabular-nums">
                                {count} ({percentage}%)
                            </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                            className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-out"
                            style={{ width: `${percentage}%` }}
                            />
                        </div>
                        </div>
                    );
                    })}
                </div>
            </CardContent>
            </Card>
        );
      })}
    </div>
  );
}
