ALTER TABLE `trades` ADD `offered_snapshot` text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE `trades` ADD `received_snapshot` text;--> statement-breakpoint
CREATE INDEX `trades_requester_idx` ON `trades` (`requester`);--> statement-breakpoint
CREATE INDEX `trades_recipient_idx` ON `trades` (`recipient`);--> statement-breakpoint
CREATE INDEX `battle_queue_status_score_idx` ON `battle_queue` (`status`,`score`);--> statement-breakpoint
CREATE INDEX `friendships_requester_idx` ON `friendships` (`requester`);--> statement-breakpoint
CREATE INDEX `friendships_recipient_idx` ON `friendships` (`recipient`);--> statement-breakpoint
CREATE INDEX `inventory_user_idx` ON `inventory` (`user_id`);--> statement-breakpoint
CREATE INDEX `matches_player1_idx` ON `matches` (`player1`);--> statement-breakpoint
CREATE INDEX `matches_player2_idx` ON `matches` (`player2`);--> statement-breakpoint
CREATE INDEX `pokemon_box_user_idx` ON `pokemon_box` (`user_id`);--> statement-breakpoint
CREATE INDEX `season_ratings_season_score_idx` ON `season_ratings` (`season`,`score`);