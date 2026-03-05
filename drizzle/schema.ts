import { pgTable, serial, text, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';

export const mediaTypeEnum = pgEnum('media_type', ['image', 'video', 'text']);

export const characters = pgTable('characters', {
  id: serial('id').primaryKey(),
  nickname: text('nickname').notNull(),
  realName: text('real_name').notNull(),
  avatar: text('avatar').notNull(),
  persona: text('persona').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

export const moments = pgTable('moments', {
  id: serial('id').primaryKey(),
  characterId: integer('character_id').references(() => characters.id).notNull(),
  content: text('content'),
  mediaType: mediaTypeEnum('media_type'),
  mediaUrl: text('media_url'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  characterId: integer('character_id').references(() => characters.id).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').references(() => conversations.id).notNull(),
  role: text('role').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export type Character = typeof characters.$inferSelect;
export type CharacterInsert = typeof characters.$inferInsert;
export type Moment = typeof moments.$inferSelect;
export type MomentInsert = typeof moments.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
