import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { characters, moments } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const allCharacters = await db.select().from(characters);
  return NextResponse.json(allCharacters);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { nickname, realName, avatar, persona, voice, momentContents } = body;

  if (!nickname || !realName || !avatar || !persona) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  const [newCharacter] = await db
    .insert(characters)
    .values({
      nickname,
      realName,
      avatar,
      persona,
      voice,
    })
    .returning();

  if (momentContents && momentContents.length > 0) {
    for (const moment of momentContents) {
      await db.insert(moments).values({
        characterId: newCharacter.id,
        content: moment.content,
        mediaType: moment.mediaType,
        mediaUrl: moment.mediaUrl,
      });
    }
  }

  return NextResponse.json(newCharacter, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, nickname, realName, avatar, persona, voice, moments: momentContents } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }

  const [updated] = await db
    .update(characters)
    .set({
      nickname,
      realName,
      avatar,
      persona,
      voice,
      updatedAt: new Date(),
    })
    .where(eq(characters.id, id))
    .returning();

  // Update moments if provided
  if (momentContents !== undefined) {
    // Delete existing moments
    await db.delete(moments).where(eq(moments.characterId, id));

    // Insert new moments
    if (momentContents && momentContents.length > 0) {
      for (const moment of momentContents) {
        if (moment.content || moment.mediaUrl) {
          await db.insert(moments).values({
            characterId: id,
            content: moment.content,
            mediaType: moment.mediaType,
            mediaUrl: moment.mediaUrl,
          });
        }
      }
    }
  }

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }

  await db.delete(moments).where(eq(moments.characterId, parseInt(id)));
  await db.delete(characters).where(eq(characters.id, parseInt(id)));

  return NextResponse.json({ success: true });
}
