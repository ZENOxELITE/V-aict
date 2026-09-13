export async function readAiStream(
  response: Response,
  onChunk: (content: string) => void,
): Promise<number | null> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('The AI provider returned no response stream.');

  const decoder = new TextDecoder();
  let buffer = '';
  let tokens: number | null = null;

  const processLines = (lines: string[]) => {
    for (const rawLine of lines) {
      const line = rawLine.replace(/\r$/, '');
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (payload === '[DONE]') continue;

      try {
        const data = JSON.parse(payload);
        if (data.error?.message) throw new Error(data.error.message);
        const content = data.choices?.[0]?.delta?.content;
        if (content) onChunk(content);
        if (data.usage?.total_tokens) tokens = data.usage.total_tokens;
      } catch {
        // Ignore incomplete events until the next chunk completes them.
      }
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    processLines(lines);
  }

  if (buffer) processLines([buffer]);
  if (!tokens) tokens = null;
  return tokens;
}
