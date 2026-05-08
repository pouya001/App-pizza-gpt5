import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  timeout: 90_000,
});

export const CLAUDE_MODEL = 'claude-sonnet-4-6';
export const MAX_TOKENS = 4096;
