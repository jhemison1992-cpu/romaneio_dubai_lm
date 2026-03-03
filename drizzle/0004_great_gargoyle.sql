CREATE TABLE `project_report_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`report_id` int NOT NULL,
	`environment_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`caixilho_code` varchar(100) NOT NULL,
	`caixilho_type` varchar(100) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`evolution_status` varchar(255),
	`item_conformity` enum('ok','not_ok','pending') NOT NULL DEFAULT 'pending',
	`observations` text,
	`defects` text,
	`photo_urls` text,
	`photo_keys` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `project_report_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`project_id` int NOT NULL,
	`company_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`inspection_date` date NOT NULL,
	`responsible_name` varchar(255) NOT NULL,
	`responsible_role` varchar(255),
	`observations` text,
	`general_conformity` enum('ok','not_ok','partial') NOT NULL DEFAULT 'partial',
	`responsible_signature` text,
	`aluminic_signature` text,
	`responsible_photo_url` varchar(1000),
	`aluminic_photo_url` varchar(1000),
	`report_status` enum('draft','completed','approved') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `project_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `project_report_items` ADD CONSTRAINT `project_report_items_report_id_project_reports_id_fk` FOREIGN KEY (`report_id`) REFERENCES `project_reports`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `project_report_items` ADD CONSTRAINT `project_report_items_environment_id_environments_id_fk` FOREIGN KEY (`environment_id`) REFERENCES `environments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `project_reports` ADD CONSTRAINT `project_reports_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `project_reports` ADD CONSTRAINT `project_reports_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;