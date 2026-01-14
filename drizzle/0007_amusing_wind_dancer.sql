CREATE TABLE `inspection_environments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inspection_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`caixilho_code` varchar(50) NOT NULL,
	`caixilho_type` text NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`planta_file_key` varchar(500),
	`planta_file_url` varchar(1000),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inspection_environments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `inspection_environments` ADD CONSTRAINT `inspection_environments_inspection_id_inspections_id_fk` FOREIGN KEY (`inspection_id`) REFERENCES `inspections`(`id`) ON DELETE cascade ON UPDATE no action;