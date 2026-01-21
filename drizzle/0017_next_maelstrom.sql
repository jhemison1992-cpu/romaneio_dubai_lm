CREATE TABLE `pricing_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(50) NOT NULL,
	`description` text,
	`monthly_price` int NOT NULL,
	`annual_price` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`stripe_price_id_monthly` varchar(255),
	`stripe_price_id_annual` varchar(255),
	`max_projects` int,
	`max_users` int,
	`max_media_size` int,
	`features` json DEFAULT JSON_ARRAY(),
	`is_active` int NOT NULL DEFAULT 1,
	`display_order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pricing_plans_id` PRIMARY KEY(`id`),
	CONSTRAINT `pricing_plans_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `subscription_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int NOT NULL,
	`plan_id` int NOT NULL,
	`billing_cycle` enum('monthly','annual') NOT NULL,
	`previous_plan_id` int,
	`change_reason` varchar(255),
	`effective_date` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subscription_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `companies` MODIFY COLUMN `subscription_plan` enum('pro','enterprise') NOT NULL DEFAULT 'pro';--> statement-breakpoint
ALTER TABLE `subscription_history` ADD CONSTRAINT `subscription_history_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscription_history` ADD CONSTRAINT `subscription_history_plan_id_pricing_plans_id_fk` FOREIGN KEY (`plan_id`) REFERENCES `pricing_plans`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscription_history` ADD CONSTRAINT `subscription_history_previous_plan_id_pricing_plans_id_fk` FOREIGN KEY (`previous_plan_id`) REFERENCES `pricing_plans`(`id`) ON DELETE no action ON UPDATE no action;