import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateEvaluation(
  imagesBase64: string[],
  imagesMediaTypes: string[],
  extraInstructions: string
): Promise<string> {
  const model = process.env.ANTHROPIC_MODEL || "claude-opus-4-7";

  const content: Anthropic.MessageParam["content"] = [];

  for (let i = 0; i < imagesBase64.length; i++) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: imagesMediaTypes[i] as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
        data: imagesBase64[i],
      },
    });
  }

  content.push({
    type: "text",
    text: buildUserPrompt(extraInstructions),
  });

  const response = await client.messages.create({
    model: model,
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: content }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  return text;
}
