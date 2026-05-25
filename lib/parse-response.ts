import { Evaluation, isValidEvaluation } from "./types";

export function parseEvaluationResponse(raw: string): Evaluation {
  let text = raw.trim();

  // Strip éventuel bloc markdown ```json ... ```
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }

  // Strip éventuel texte avant le premier { ou après le dernier }
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("Aucun objet JSON détecté dans la réponse.");
  }
  text = text.slice(firstBrace, lastBrace + 1);

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    // Tentative de récupération : supprimer les virgules trailing
    const cleaned = text.replace(/,(\s*[}\]])/g, "$1");
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error("Le JSON renvoyé est invalide.");
    }
  }

  if (!isValidEvaluation(parsed)) {
    throw new Error("Le JSON ne respecte pas le schéma attendu.");
  }

  return parsed;
}
