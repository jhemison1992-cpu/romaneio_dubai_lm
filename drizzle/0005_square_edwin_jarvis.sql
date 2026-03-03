CREATE TABLE `caixilhos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`project_id` int NOT NULL,
	`room_id` int NOT NULL,
	`code` varchar(100) NOT NULL,
	`type` varchar(100) NOT NULL,
	`description` text,
	`quantity` int NOT NULL DEFAULT 1,
	`width` int,
	`height` int,
	`specifications` text,
	`weight` varchar(50),
	`pdf_reference` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `caixilhos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `floors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`project_id` int NOT NULL,
	`floor_number` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`planta_file_key` varchar(500),
	`planta_file_url` varchar(1000),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `floors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pdf_imports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`project_id` int NOT NULL,
	`pdf_file_key` varchar(500) NOT NULL,
	`pdf_file_url` varchar(1000) NOT NULL,
	`pdf_file_name` varchar(255) NOT NULL,
	`extracted_data` text,
	`import_status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`error_message` text,
	`floors_created` int NOT NULL DEFAULT 0,
	`rooms_created` int NOT NULL DEFAULT 0,
	`caixilhos_created` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pdf_imports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`project_id` int NOT NULL,
	`floor_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`pdf_reference` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rooms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `caixilhos` ADD CONSTRAINT `caixilhos_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `caixilhos` ADD CONSTRAINT `caixilhos_room_id_rooms_id_fk` FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `floors` ADD CONSTRAINT `floors_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pdf_imports` ADD CONSTRAINT `pdf_imports_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rooms` ADD CONSTRAINT `rooms_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rooms` ADD CONSTRAINT `rooms_floor_id_floors_id_fk` FOREIGN KEY (`floor_id`) REFERENCES `floors`(`id`) ON DELETE cascade ON UPDATE no action;