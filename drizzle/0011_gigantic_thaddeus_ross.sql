CREATE TABLE IF NOT EXISTS `rogue_rankings` (
	`user_id` text PRIMARY KEY NOT NULL,
	`best_wave` integer NOT NULL,
	`achieved_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `rogue_rankings_wave_idx` ON `rogue_rankings` (`best_wave`,`achieved_at`);