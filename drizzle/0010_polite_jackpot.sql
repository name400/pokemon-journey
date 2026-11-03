CREATE TABLE `admin_player_backups` (
	`id` text PRIMARY KEY NOT NULL,
	`actor` text NOT NULL,
	`target` text NOT NULL,
	`mode` text NOT NULL,
	`data` text NOT NULL,
	`reset_revision` integer NOT NULL,
	`created_at` integer NOT NULL,
	`restored_at` integer
);
--> statement-breakpoint
CREATE INDEX `admin_player_backups_target_mode_idx` ON `admin_player_backups` (`target`,`mode`);