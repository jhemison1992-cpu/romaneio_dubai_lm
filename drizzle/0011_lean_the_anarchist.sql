CREATE TABLE `installation_steps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inspection_item_id` int NOT NULL,
	`step_name` varchar(100) NOT NULL,
	`step_order` int NOT NULL,
	`is_completed` int NOT NULL DEFAULT 0,
	`completed_at` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `installation_steps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `installation_steps` ADD CONSTRAINT `installation_steps_inspection_item_id_inspection_items_id_fk` FOREIGN KEY (`inspection_item_id`) REFERENCES `inspection_items`(`id`) ON DELETE cascade ON UPDATE no action;