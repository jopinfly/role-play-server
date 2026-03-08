import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

const TTS_API_URL = 'https://api.minimaxi.com/v1/t2a_v2';

// Filter out action descriptions in *...* format for better TTS results
function filterTextForTTS(text: string): string {
  // Remove action descriptions like *She leans back...* or *he smiles*
  // This regex matches text between asterisks at the beginning or surrounded by asterisks
  let filtered = text
    // Remove *...* patterns (action descriptions)
    .replace(/\*([^*]+)\*/g, '')
    // Remove ... patterns at the beginning of sentences (standalone actions)
    .replace(/^\s*\*[^*]+\*\s*/g, '')
    // Clean up extra whitespace
    .trim();

  // If the filtered text is empty or too short, fall back to original
  if (filtered.length < 5) {
    // Try to extract just the dialogue parts (in quotes)
    const dialogueMatch = text.match(/"([^"]+)"/g);
    if (dialogueMatch) {
      filtered = dialogueMatch.join(' ').replace(/"/g, '');
    } else {
      filtered = text;
    }
  }

  return filtered;
}

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId, messageId } = await request.json();

    if (!text || !voiceId) {
      return NextResponse.json(
        { error: 'Missing required fields: text and voiceId' },
        { status: 400 }
      );
    }

    // Filter out action descriptions for better TTS quality
    const ttsText = filterTextForTTS(text);

    const apiKey = process.env.MINIMAX_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'MiniMax API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(TTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'speech-2.6-turbo',
        text: ttsText,
        stream: false,
        voice_setting: {
          voice_id: voiceId,
          speed: 1,
          vol: 1,
          pitch: 0,
        },
        audio_setting: {
          sample_rate: 32000,
          bitrate: 128000,
          format: 'mp3',
          channel: 1,
        },
        output_format: 'hex',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `TTS API error: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Check for errors in response
    if (data.base_resp && data.base_resp.status_code !== 0) {
      return NextResponse.json(
        { error: `TTS API error: ${data.base_resp.status_msg}` },
        { status: 500 }
      );
    }

    // Get hex audio data from response
    const hexAudio = data?.data?.audio;
    if (!hexAudio) {
      return NextResponse.json(
        { error: 'No audio data in response' },
        { status: 500 }
      );
    }

    // Decode hex to binary
    const audioBuffer = Buffer.from(hexAudio, 'hex');
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mp3' });

    // Generate filename
    const fileName = `voice_${messageId || Date.now()}.mp3`;

    // Save to Vercel Blob
    const blob = await put(fileName, audioBlob, {
      access: 'public',
      contentType: 'audio/mp3',
    });

    return NextResponse.json({
      url: blob.url,
      originalText: text,
      ttsText: ttsText, // Return the filtered text for reference
    });
  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json(
      { error: 'Failed to synthesize speech' },
      { status: 500 }
    );
  }
}
