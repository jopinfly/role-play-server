import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { characters, moments } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const characterId = parseInt(id);

  const [character] = await db
    .select()
    .from(characters)
    .where(eq(characters.id, characterId));

  if (!character) {
    return NextResponse.json({ error: 'Character not found' }, { status: 404 });
  }

  const characterMoments = await db
    .select()
    .from(moments)
    .where(eq(moments.characterId, characterId));

  return NextResponse.json({
    ...character,
    moments: characterMoments,
  });
}
