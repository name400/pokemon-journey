CREATE TABLE IF NOT EXISTS `classic_leaderboard` (
  `user_id` text PRIMARY KEY NOT NULL,
  `best_wave` integer NOT NULL CHECK (`best_wave` BETWEEN 1 AND 200),
  `achieved_at` integer NOT NULL,
  `run_id` text NOT NULL
);
CREATE INDEX IF NOT EXISTS `classic_leaderboard_wave_idx` ON `classic_leaderboard` (`best_wave` DESC, `achieved_at` ASC);
