CREATE TABLE `battle_queue` (
	`user_id` text PRIMARY KEY NOT NULL,
	`team` text NOT NULL,
	`score` integer NOT NULL,
	`status` text DEFAULT 'waiting' NOT NULL,
	`match_code` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `season_ratings` (
	`key` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`season` text NOT NULL,
	`score` integer DEFAULT 1000 NOT NULL,
	`wins` integer DEFAULT 0 NOT NULL,
	`losses` integer DEFAULT 0 NOT NULL,
	`draws` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE `rating_results` ADD `season` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `rating_results` ADD `delta1` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `rating_results` ADD `delta2` integer DEFAULT 0 NOT NULL;