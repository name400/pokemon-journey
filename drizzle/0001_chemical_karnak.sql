CREATE TABLE `admin_attempts` (
	`key` text PRIMARY KEY NOT NULL,
	`failures` integer DEFAULT 0 NOT NULL,
	`until` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `admin_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `matches` (
	`code` text PRIMARY KEY NOT NULL,
	`player1` text NOT NULL,
	`player2` text,
	`state` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `wallets` (
	`user_id` text PRIMARY KEY NOT NULL,
	`coins` integer DEFAULT 300 NOT NULL,
	`potions` integer DEFAULT 0 NOT NULL,
	`last_claim` text DEFAULT '' NOT NULL
);
