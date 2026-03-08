import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { characters, conversations, messages } from '@/lib/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { sendChatMessage } from '@/lib/minimax';

const PAGE_SIZE = 20;

// Get favorability level info
function getFavorabilityLevel(favorability: number): { level: number; title: string; nextLevelNeed: number } {
  const levels = [
    { min: 0, level: 1, title: '陌生人' },
    { min: 10, level: 2, title: '认识的人' },
    { min: 30, level: 3, title: '普通朋友' },
    { min: 60, level: 4, title: '好朋友' },
    { min: 100, level: 5, title: '亲密好友' },
    { min: 200, level: 6, title: '灵魂伴侣' },
  ];

  for (let i = levels.length - 1; i >= 0; i--) {
    if (favorability >= levels[i].min) {
      const nextLevel = levels.find(l => l.min > favorability);
      return {
        level: levels[i].level,
        title: levels[i].title,
        nextLevelNeed: nextLevel ? nextLevel.min - favorability : 0,
      };
    }
  }
  return { level: 1, title: '陌生人', nextLevelNeed: 10 };
}

// Get random favorability change for normal chat
function getRandomFavorabilityChange(): number {
  return Math.floor(Math.random() * 3) + 1; // 1-3
}

// Start a new conversation with a character (or get existing one)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { characterId, userId } = body;

  if (!characterId || !userId) {
    return NextResponse.json(
      { error: 'Character ID and User ID required' },
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

  // Check if there's an existing conversation for this user and character
  const [existingConversation] = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.userId, userId),
        eq(conversations.characterId, characterId)
      )
    )
    .orderBy(desc(conversations.updatedAt))
    .limit(1);

  let isFirstConversation = false;
  let favorability = 0;

  if (existingConversation) {
    favorability = existingConversation.favorability;
  } else {
    // New conversation - first time talking
    isFirstConversation = true;
    favorability = 5; // First conversation bonus
  }

  // Create or update conversation
  let conversation;
  if (existingConversation) {
    // Update timestamp
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, existingConversation.id));

    conversation = existingConversation;
  } else {
    // Create new conversation with initial favorability
    [conversation] = await db
      .insert(conversations)
      .values({ userId, characterId, favorability })
      .returning();
  }

  // Get recent messages for conversation
  const conversationHistory = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversation.id))
    .orderBy(messages.createdAt)
    .limit(PAGE_SIZE);

  const levelInfo = getFavorabilityLevel(favorability);

  return NextResponse.json({
    conversationId: conversation.id,
    character,
    isExisting: !isFirstConversation,
    isFirstConversation,
    messages: conversationHistory,
    favorability,
    favorabilityLevel: levelInfo,
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

  // Calculate favorability change
  const favorabilityChange = getRandomFavorabilityChange();
  const newFavorability = conversation.favorability + favorabilityChange;

  try {
    // Get AI response
    const aiResponse = await sendChatMessage(chatHistory, character.persona, character.nickname);

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

    // Update conversation timestamp and favorability
    await db
      .update(conversations)
      .set({ updatedAt: new Date(), favorability: newFavorability })
      .where(eq(conversations.id, conversationId));

    const levelInfo = getFavorabilityLevel(newFavorability);

    return NextResponse.json({
      response: aiResponse,
      character,
      favorability: newFavorability,
      favorabilityChange,
      favorabilityLevel: levelInfo,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to get response from AI' },
      { status: 500 }
    );
  }
}

// Get conversation history or list of conversations
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');
  const userId = searchParams.get('userId');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || String(PAGE_SIZE));

  // If conversationId is provided, get messages for that conversation
  if (conversationId) {
    const offset = (page - 1) * pageSize;

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(eq(messages.conversationId, parseInt(conversationId)));

    const conversationHistory = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, parseInt(conversationId)))
      .orderBy(messages.createdAt)
      .limit(pageSize)
      .offset(offset);

    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, parseInt(conversationId)));

    const [character] = await db
      .select()
      .from(characters)
      .where(eq(characters.id, conversation?.characterId));

    const levelInfo = conversation ? getFavorabilityLevel(conversation.favorability) : null;

    return NextResponse.json({
      conversation,
      character,
      messages: conversationHistory,
      favorability: conversation?.favorability || 0,
      favorabilityLevel: levelInfo,
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize),
      },
    });
  }

  // If userId is provided, get list of conversations for that user
  if (userId) {
    const offset = (page - 1) * pageSize;

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(conversations)
      .where(eq(conversations.userId, userId));

    // Get conversations with character info
    const conversationList = await db
      .select({
        id: conversations.id,
        characterId: conversations.characterId,
        favorability: conversations.favorability,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
        nickname: characters.nickname,
        realName: characters.realName,
        avatar: characters.avatar,
      })
      .from(conversations)
      .leftJoin(characters, eq(conversations.characterId, characters.id))
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt))
      .limit(pageSize)
      .offset(offset);

    return NextResponse.json({
      conversations: conversationList,
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize),
      },
    });
  }

  return NextResponse.json(
    { error: 'Conversation ID or User ID required' },
    { status: 400 }
  );
}
