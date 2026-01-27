CREATE TABLE `payment_methods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int NOT NULL,
	`stripe_payment_method_id` varchar(255) NOT NULL,
	`type` enum('card','bank_account','pix') NOT NULL,
	`card_brand` varchar(50),
	`card_last4` varchar(4),
	`card_exp_month` int,
	`card_exp_year` int,
	`is_default` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_methods_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_methods_stripe_payment_method_id_unique` UNIQUE(`stripe_payment_method_id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int NOT NULL,
	`plan_id` int NOT NULL,
	`billing_cycle` enum('monthly','annual') NOT NULL DEFAULT 'monthly',
	`status` enum('active','paused','cancelled','expired') NOT NULL DEFAULT 'active',
	`stripe_subscription_id` varchar(255),
	`stripe_customer_id` varchar(255),
	`current_period_start` timestamp NOT NULL,
	`current_period_end` timestamp NOT NULL,
	`cancelled_at` timestamp,
	`trial_end_date` timestamp,
	`is_trial_active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_stripe_subscription_id_unique` UNIQUE(`stripe_subscription_id`)
);
--> statement-breakpoint
CREATE TABLE `usage_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int NOT NULL,
	`month` varchar(7) NOT NULL,
	`projects_count` int NOT NULL DEFAULT 0,
	`users_count` int NOT NULL DEFAULT 0,
	`storage_used_mb` int NOT NULL DEFAULT 0,
	`api_calls_count` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `usage_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `invoices` ADD `subscription_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `invoices` ADD `invoice_number` varchar(50);--> statement-breakpoint
ALTER TABLE `invoices` ADD `description` text;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_invoice_number_unique` UNIQUE(`invoice_number`);--> statement-breakpoint
ALTER TABLE `payment_methods` ADD CONSTRAINT `payment_methods_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_plan_id_pricing_plans_id_fk` FOREIGN KEY (`plan_id`) REFERENCES `pricing_plans`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `usage_tracking` ADD CONSTRAINT `usage_tracking_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_subscription_id_subscriptions_id_fk` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON DELETE cascade ON UPDATE no action;