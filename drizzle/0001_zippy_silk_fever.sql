CREATE TABLE `environments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`caixilho_code` varchar(50) NOT NULL,
	`caixilho_type` text NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `environments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inspection_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inspection_id` int NOT NULL,
	`environment_id` int NOT NULL,
	`release_date` timestamp,
	`responsible_construction` varchar(255),
	`responsible_supplier` varchar(255),
	`observations` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inspection_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inspections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`status` enum('draft','in_progress','completed') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inspections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media_files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inspection_item_id` int NOT NULL,
	`file_key` varchar(500) NOT NULL,
	`file_url` varchar(1000) NOT NULL,
	`file_name` varchar(255) NOT NULL,
	`mime_type` varchar(100) NOT NULL,
	`file_size` int NOT NULL,
	`media_type` enum('photo','video') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `inspection_items` ADD CONSTRAINT `inspection_items_inspection_id_inspections_id_fk` FOREIGN KEY (`inspection_id`) REFERENCES `inspections`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inspection_items` ADD CONSTRAINT `inspection_items_environment_id_environments_id_fk` FOREIGN KEY (`environment_id`) REFERENCES `environments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inspections` ADD CONSTRAINT `inspections_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_files` ADD CONSTRAINT `media_files_inspection_item_id_inspection_items_id_fk` FOREIGN KEY (`inspection_item_id`) REFERENCES `inspection_items`(`id`) ON DELETE cascade ON UPDATE no action;