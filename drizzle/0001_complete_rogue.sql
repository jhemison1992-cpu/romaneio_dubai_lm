CREATE TABLE `activity_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int NOT NULL,
	`inspection_environment_id` int NOT NULL,
	`description` varchar(255) NOT NULL,
	`status` enum('pendente','em_andamento','concluida') NOT NULL DEFAULT 'pendente',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `activity_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comment_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int NOT NULL,
	`inspection_environment_id` int NOT NULL,
	`author` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comment_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `equipment_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int NOT NULL,
	`inspection_environment_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`unit` varchar(50) NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `equipment_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `labor_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int NOT NULL,
	`inspection_environment_id` int NOT NULL,
	`profession` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`hours` varchar(50) NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `labor_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `occurrence_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int NOT NULL,
	`inspection_environment_id` int NOT NULL,
	`description` varchar(255) NOT NULL,
	`severity` enum('baixa','media','alta') NOT NULL DEFAULT 'media',
	`status` enum('aberta','em_resolucao','resolvida') NOT NULL DEFAULT 'aberta',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `occurrence_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `received_material_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int NOT NULL,
	`inspection_environment_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`unit` varchar(50) NOT NULL,
	`received_date` date NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `received_material_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `used_material_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int NOT NULL,
	`inspection_environment_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`unit` varchar(50) NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `used_material_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `activity_items` ADD CONSTRAINT `activity_items_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `activity_items` ADD CONSTRAINT `activity_items_inspection_environment_id_inspection_environments_id_fk` FOREIGN KEY (`inspection_environment_id`) REFERENCES `inspection_environments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comment_items` ADD CONSTRAINT `comment_items_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comment_items` ADD CONSTRAINT `comment_items_inspection_environment_id_inspection_environments_id_fk` FOREIGN KEY (`inspection_environment_id`) REFERENCES `inspection_environments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `equipment_items` ADD CONSTRAINT `equipment_items_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `equipment_items` ADD CONSTRAINT `equipment_items_inspection_environment_id_inspection_environments_id_fk` FOREIGN KEY (`inspection_environment_id`) REFERENCES `inspection_environments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `labor_items` ADD CONSTRAINT `labor_items_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `labor_items` ADD CONSTRAINT `labor_items_inspection_environment_id_inspection_environments_id_fk` FOREIGN KEY (`inspection_environment_id`) REFERENCES `inspection_environments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `occurrence_items` ADD CONSTRAINT `occurrence_items_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `occurrence_items` ADD CONSTRAINT `occurrence_items_inspection_environment_id_inspection_environments_id_fk` FOREIGN KEY (`inspection_environment_id`) REFERENCES `inspection_environments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `received_material_items` ADD CONSTRAINT `received_material_items_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `received_material_items` ADD CONSTRAINT `received_material_items_inspection_environment_id_inspection_environments_id_fk` FOREIGN KEY (`inspection_environment_id`) REFERENCES `inspection_environments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `used_material_items` ADD CONSTRAINT `used_material_items_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `used_material_items` ADD CONSTRAINT `used_material_items_inspection_environment_id_inspection_environments_id_fk` FOREIGN KEY (`inspection_environment_id`) REFERENCES `inspection_environments`(`id`) ON DELETE cascade ON UPDATE no action;