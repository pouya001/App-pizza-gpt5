import { Packer } from 'docx';
import { buildWordDoc } from '@/lib/word/buildWordDoc';
import type { Evaluation } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { evaluation, showAnswer } = (await req.json()) as {
    evaluation: Evaluation;
    showAnswer: boolean;
  };

  const doc = buildWordDoc(evaluation, Boolean(showAnswer));
  const buffer = await Packer.toBuffer(doc);
  const filename = showAnswer ? 'corrige.docx' : 'evaluation.docx';

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
