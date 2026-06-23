import { NextRequest, NextResponse } from 'next/server';
import { anthropic, CLAUDE_MODEL, MAX_TOKENS } from '@/lib/anthropic/client';
import { SYSTEM_PROMPT, buildUserMessage } from '@/lib/anthropic/prompts';
import type { Evaluation } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 90;

interface FilePayload {
  name: string;
  mimeType: string;
  data: string; // base64
}

interface GenerateRequest {
  files: FilePayload[];
  hint?: string;
}

function extractJson(text: string): Evaluation {
  try {
    return JSON.parse(text) as Evaluation;
  } catch {
    // Fallback: extract first {...} block
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as Evaluation;
    throw new Error("Impossible d'extraire le JSON de la réponse IA.");
  }
}

type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
const VALID_IMAGE_TYPES: ImageMediaType[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

type ContentBlock =
  | { type: 'document'; source: { type: 'base64'; media_type: 'application/pdf'; data: string } }
  | { type: 'image'; source: { type: 'base64'; media_type: ImageMediaType; data: string } };

function buildContentBlocks(files: FilePayload[]): ContentBlock[] {
  return files.map((f): ContentBlock => {
    if (f.mimeType === 'application/pdf') {
      return {
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: f.data },
      };
    }
    const mediaType: ImageMediaType = VALID_IMAGE_TYPES.includes(f.mimeType as ImageMediaType)
      ? (f.mimeType as ImageMediaType)
      : 'image/jpeg';
    return {
      type: 'image',
      source: { type: 'base64', media_type: mediaType, data: f.data },
    };
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateRequest;
    const { files, hint } = body;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Aucun document fourni.' }, { status: 400 });
    }
    if (files.length > 12) {
      return NextResponse.json({ error: 'Maximum 12 documents par évaluation.' }, { status: 400 });
    }

    const contentBlocks = buildContentBlocks(files);
    const userText = buildUserMessage(hint);

    let evaluation: Evaluation | null = null;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const message = await (anthropic.messages.create as any)({
          model: CLAUDE_MODEL,
          max_tokens: MAX_TOKENS,
          system: [
            { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
          ],
          messages: [
            {
              role: 'user',
              content: [...contentBlocks, { type: 'text', text: userText }],
            },
          ],
        });

        if (message.stop_reason === 'max_tokens') {
          throw new Error('La réponse IA a été tronquée (trop longue). Réessayez ou réduisez le nombre de documents.');
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const responseText = (message.content as any[])
          .filter((b: any) => b.type === 'text')
          .map((b: any) => b.text as string)
          .join('');

        evaluation = extractJson(responseText);
        break;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt === 0) await new Promise((r) => setTimeout(r, 1500));
      }
    }

    if (!evaluation) {
      console.error('[generate] IA error:', lastError?.message);
      return NextResponse.json(
        { error: lastError?.message ?? 'Erreur lors de la génération. Veuillez réessayer.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ evaluation });
  } catch (err) {
    console.error('[generate] Unexpected error:', err);
    return NextResponse.json({ error: 'Erreur inattendue.' }, { status: 500 });
  }
}
