const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function sendChatMessage(
  messages: Message[],
  characterPersona: string
): Promise<string> {
  const apiKey = process.env.MINIMAX_API_KEY;
  const groupId = process.env.MINIMAX_GROUP_ID;

  if (!apiKey || !groupId) {
    throw new Error('MiniMax API key or group ID not configured');
  }

  const systemMessage: Message = {
    role: 'system',
    content: characterPersona,
  };

  const response = await fetch(MINIMAX_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'abab6.5s-chat',
      group_id: groupId,
      messages: [systemMessage, ...messages],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`MiniMax API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
