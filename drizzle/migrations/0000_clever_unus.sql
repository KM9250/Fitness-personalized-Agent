CREATE TABLE `ai_coaches` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`avatar_url` text,
	`personality_prompt` text NOT NULL,
	`llm_provider` text DEFAULT 'openai',
	`llm_model` text DEFAULT 'gpt-4o-mini',
	`description` text,
	`is_active` integer DEFAULT false,
	`is_preset` integer DEFAULT false,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`provider` text,
	`model` text,
	`coach_id` text,
	`created_at` text NOT NULL,
	`session_context` text
);
--> statement-breakpoint
CREATE TABLE `exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`name_ja` text NOT NULL,
	`name_en` text NOT NULL,
	`category` text NOT NULL,
	`met_value` real NOT NULL,
	`default_duration_min` integer DEFAULT 10,
	`description` text,
	`muscle_groups` text,
	`is_custom` integer DEFAULT false
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `settings_key_unique` ON `settings` (`key`);--> statement-breakpoint
CREATE TABLE `user_profile` (
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`height_cm` real,
	`weight_kg` real,
	`birth_year` integer,
	`gender` text,
	`activity_level` text,
	`fitness_goal` text,
	`preferred_language` text DEFAULT 'ja',
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `weight_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`weight_kg` real NOT NULL,
	`body_fat_percent` real,
	`notes` text
);
--> statement-breakpoint
CREATE TABLE `workout_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`sets` integer,
	`reps` integer,
	`weight_kg` real,
	`duration_min` integer NOT NULL,
	`calories_burned` real,
	`order_index` integer NOT NULL,
	`notes` text,
	FOREIGN KEY (`session_id`) REFERENCES `workout_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `workout_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`started_at` text NOT NULL,
	`ended_at` text,
	`total_duration_min` integer,
	`total_calories` real,
	`ai_evaluation` text,
	`ai_provider` text,
	`coach_id` text,
	`notes` text,
	`status` text DEFAULT 'in_progress'
);
