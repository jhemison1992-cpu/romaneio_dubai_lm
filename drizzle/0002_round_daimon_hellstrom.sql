CREATE TABLE `delivery_receipt_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`delivery_receipt_id` int NOT NULL,
	`environment_id` int NOT NULL,
	`code` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`unit_value` varchar(20),
	`total_value` varchar(20),
	`received_quantity` int NOT NULL DEFAULT 0,
	`item_status` enum('pending','received','partial','rejected') NOT NULL DEFAULT 'pending',
	`conformity` enum('ok','not_ok','pending') NOT NULL DEFAULT 'pending',
	`observations` text,
	`defects` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `delivery_receipt_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `delivery_receipts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int NOT NULL,
	`project_id` int NOT NULL,
	`receipt_number` varchar(50) NOT NULL,
	`construction_responsible` varchar(255),
	`construction_responsible_signature` text,
	`supplier_responsible` varchar(255),
	`supplier_responsible_signature` text,
	`receipt_date` timestamp NOT NULL,
	`delivery_date` timestamp,
	`status` enum('draft','pending','approved','rejected') NOT NULL DEFAULT 'draft',
	`observations` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `delivery_receipts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `delivery_receipt_items` ADD CONSTRAINT `delivery_receipt_items_delivery_receipt_id_delivery_receipts_id_fk` FOREIGN KEY (`delivery_receipt_id`) REFERENCES `delivery_receipts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `delivery_receipt_items` ADD CONSTRAINT `delivery_receipt_items_environment_id_environments_id_fk` FOREIGN KEY (`environment_id`) REFERENCES `environments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `delivery_receipts` ADD CONSTRAINT `delivery_receipts_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `delivery_receipts` ADD CONSTRAINT `delivery_receipts_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;