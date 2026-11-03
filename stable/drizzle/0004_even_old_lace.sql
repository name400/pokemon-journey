CREATE TABLE `pokemon_box` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`species_id` integer NOT NULL,
	`data` text NOT NULL,
	`origin` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rating_results` (
	`code` text PRIMARY KEY NOT NULL,
	`player1` text NOT NULL,
	`player2` text NOT NULL,
	`winner` integer,
	`applied` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ratings` (
	`user_id` text PRIMARY KEY NOT NULL,
	`score` integer DEFAULT 1000 NOT NULL,
	`wins` integer DEFAULT 0 NOT NULL,
	`losses` integer DEFAULT 0 NOT NULL,
	`draws` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `worlds` (
	`user_id` text PRIMARY KEY NOT NULL,
	`state` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `wallets` ADD `balls` integer DEFAULT 5 NOT NULL;