CREATE TABLE `inventory` (
	`key` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`item` text NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `trades` (
	`id` text PRIMARY KEY NOT NULL,
	`requester` text NOT NULL,
	`recipient` text NOT NULL,
	`offered_id` text NOT NULL,
	`received_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL
);
