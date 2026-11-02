import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const saves = sqliteTable('saves', { userId: text('user_id').primaryKey(), data: text('data').notNull(), updatedAt: integer('updated_at').notNull(), revision:integer('revision').notNull().default(0) });
export const wallets = sqliteTable('wallets', { userId:text('user_id').primaryKey(), coins:integer('coins').notNull().default(300), potions:integer('potions').notNull().default(0), superPotions:integer('super_potions').notNull().default(0), antidotes:integer('antidotes').notNull().default(0), lastClaim:text('last_claim').notNull().default('') });
export const matches = sqliteTable('matches', { code:text('code').primaryKey(), player1:text('player1').notNull(), player2:text('player2'), state:text('state').notNull(), revision:integer('revision').notNull().default(0), updatedAt:integer('updated_at').notNull() });
export const adminAttempts = sqliteTable('admin_attempts', { key:text('key').primaryKey(), failures:integer('failures').notNull().default(0), until:integer('until').notNull().default(0) });
export const adminSessions = sqliteTable('admin_sessions', { tokenHash:text('token_hash').primaryKey(), userId:text('user_id').notNull(), expiresAt:integer('expires_at').notNull() });
export const players = sqliteTable('players', { userId:text('user_id').primaryKey(), email:text('email').notNull(), name:text('name').notNull(), lastSeen:integer('last_seen').notNull() });
export const adminAudit = sqliteTable('admin_audit', { id:integer('id').primaryKey({autoIncrement:true}), actor:text('actor').notNull(), target:text('target').notNull(), action:text('action').notNull(), detail:text('detail').notNull(), createdAt:integer('created_at').notNull() });


