import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { characters, conversations, messages } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { sendChatMessage } from '@/lib/minimax';

// Start a new conversation with a character
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { characterId } = body;

  if (!characterId) {
    return NextResponse.json(
      { error: 'Character ID required' },
      { status: 400 }
    );
  }

  // Get character info
  const [character] = await db
    .select()
    .from(characters)
    .where(eq(characters.id, characterId));

  if (!character) {
    return NextResponse.json(
      { error: 'Character not found' },
      { status: 404 }
    );
  }

  // Create new conversation
  const [conversation] = await db
    .insert(conversations)
    .values({ characterId })
    .returning();

  return NextResponse.json({
    conversationId: conversation.id,
    character,
  });
}

// Send a message and get response
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { conversationId, content } = body;

  if (!conversationId || !content) {
    return NextResponse.json(
      { error: 'Conversation ID and content required' },
      { status: 400 }
    );
  }

  // Get conversation and character
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId));

  if (!conversation) {
    return NextResponse.json(
      { error: 'Conversation not found' },
      { status: 404 }
    );
  }

  const [character] = await db
    .select()
    .from(characters)
    .where(eq(characters.id, conversation.characterId));

  if (!character) {
    return NextResponse.json(
      { error: 'Character not found' },
      { status: 404 }
    );
  }

  // Get conversation history
  const conversationHistory = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);

  // Build messages for MiniMax API
  const chatHistory = conversationHistory.map((msg) => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));

  // Add current user message
  chatHistory.push({ role: 'user', content });

  try {
    // Get AI response
    const aiResponse = await sendChatMessage(chatHistory, character.persona);

    // Save user message
    await db.insert(messages).values({
      conversationId,
      role: 'user',
      content,
    });

    // Save assistant message
    await db.insert(messages).values({
      conversationId,
      role: 'assistant',
      content: aiResponse,
    });

    // Update conversation timestamp
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, conversationId));

    return NextResponse.json({
      response: aiResponse,
      character,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to get response from AI' },
      { status: 500 }
    );
  }
}

// Get conversation history
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');

  if (!conversationId) {
    return NextResponse.json(
      { error: 'Conversation ID required' },
      { status: 400 }
    );
  }

  const conversationHistory = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, parseInt(conversationId)))
    .orderBy(messages.createdAt);

  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, parseInt(conversationId)));

  const [character] = await db
    .select()
    .from(characters)
    .where(eq(characters.id, conversation?.characterId));

  return NextResponse.json({
    conversation,
    character,
    messages: conversationHistory,
  });
}
