CREATE TABLE `companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`logo_url` varchar(1000),
	`subscription_plan` enum('free','pro','enterprise') NOT NULL DEFAULT 'free',
	`subscription_status` enum('active','paused','cancelled') NOT NULL DEFAULT 'active',
	`subscription_end_date` timestamp,
	`stripe_customer_id` varchar(255),
	`stripe_subscription_id` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`),
	CONSTRAINT `companies_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `company_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int NOT NULL,
	`user_id` int NOT NULL,
	`role` enum('admin','supervisor','technician','viewer') NOT NULL DEFAULT 'viewer',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `company_users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int NOT NULL,
	`stripe_invoice_id` varchar(255),
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`status` enum('draft','open','paid','void','uncollectible') NOT NULL DEFAULT 'draft',
	`paid_at` timestamp,
	`due_date` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_stripe_invoice_id_unique` UNIQUE(`stripe_invoice_id`)
);
--> statement-breakpoint
ALTER TABLE `projects` MODIFY COLUMN `supplier` varchar(255) DEFAULT 'ALUMINC Esquadrias Metalicas Industria e Comercio Ltda.';--> statement-breakpoint
ALTER TABLE `inspection_environments` ADD `company_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `inspection_items` ADD `company_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `inspections` ADD `company_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `installation_steps` ADD `company_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `company_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `company_users` ADD CONSTRAINT `company_users_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `company_users` ADD CONSTRAINT `company_users_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inspection_environments` ADD CONSTRAINT `inspection_environments_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inspection_items` ADD CONSTRAINT `inspection_items_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inspections` ADD CONSTRAINT `inspections_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `installation_steps` ADD CONSTRAINT `installation_steps_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;