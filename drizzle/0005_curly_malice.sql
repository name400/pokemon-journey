CREATE TABLE `friendships` (
	`pair_key` text PRIMARY KEY NOT NULL,
	`requester` text NOT NULL,
	`recipient` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`nickname` text NOT NULL,
	`nickname_key` text NOT NULL,
	`friend_code` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_nickname_key_unique` ON `profiles` (`nickname_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_friend_code_unique` ON `profiles` (`friend_code`);