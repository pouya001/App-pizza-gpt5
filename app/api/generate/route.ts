import { NextRequest, NextResponse } from "next/server";
import { generateEvaluation } from "@/lib/anthropic";
import { parseEvaluationResponse } from "@/lib/parse-response";
import { buildDocx } from "@/lib/docx-builder";

export const maxDuration = 120;
export const runtime = "nodejs";

interface RequestBody {
  images: string[];
  extraInstructions?: string;
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Configuration manquante (ANTHROPIC_API_KEY)." },
        { status: 500 }
      );
    }

    const body = (await req.json()) as RequestBody;

    if (!body.images || !Array.isArray(body.images) || body.images.length === 0) {
      return NextResponse.json(
        { error: "Aucune image fournie." },
        { status: 400 }
      );
    }
    if (body.images.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 images." },
        { status: 400 }
      );
    }

    const imagesBase64: string[] = [];
    const imagesMediaTypes: string[] = [];
    for (const dataUrl of body.images) {
      const match = dataUrl.match(/^data:(image\/(jpeg|png|gif|webp));base64,(.+)$/);
      if (!match) {
        return NextResponse.json(
          { error: "Format d'image invalide. JPEG, PNG, GIF ou WEBP attendu." },
          { status: 400 }
        );
      }
      imagesMediaTypes.push(match[1]);
      imagesBase64.push(match[3]);
    }

    const rawResponse = await generateEvaluation(
      imagesBase64,
      imagesMediaTypes,
      body.extraInstructions?.trim() || ""
    );

    let evaluation;
    try {
      evaluation = parseEvaluationResponse(rawResponse);
    } catch (err) {
      console.error("Parse error:", err, "Raw:", rawResponse.slice(0, 500));
      return NextResponse.json(
        { error: "L'IA a renvoyé une réponse invalide. Réessayez." },
        { status: 502 }
      );
    }

    const buffer = await buildDocx(evaluation);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="evaluation-${Date.now()}.docx"`,
      },
    });
  } catch (err) {
    console.error("Erreur génération:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
