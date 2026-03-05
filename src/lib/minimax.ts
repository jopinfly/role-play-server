const MINIMAX_API_URL = 'https://api.minimaxi.com/v1/text/chatcompletion_v2';
const DEFAULT_MODEL = 'M2-her';

interface Message {
  role: 'system' | 'user' | 'assistant';
  name?: string;
  content: string;
}

export async function sendChatMessage(
  messages: Message[],
  characterPersona: string,
  characterName?: string
): Promise<string> {
  const apiKey = process.env.MINIMAX_API_KEY;

  if (!apiKey) {
    throw new Error('MiniMax API key not configured');
  }

  // 构建消息列表，将角色人设作为 system 消息
  const systemMessage: Message = {
    role: 'system',
    name: characterName || 'AI Assistant',
    content: characterPersona,
  };

  const allMessages: Message[] = [systemMessage, ...messages];

  const response = await fetch(MINIMAX_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: allMessages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`MiniMax API error: ${error}`);
  }

  const data = await response.json();

  if (data.base_resp && data.base_resp.status_code !== 0) {
    throw new Error(`MiniMax API error: ${data.base_resp.status_msg}`);
  }

  return data.choices[0].message.content;
}
