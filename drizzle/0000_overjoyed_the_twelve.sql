CREATE TABLE `addresses` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`street` varchar(1000),
	`zip_code` varchar(10),
	`city` varchar(255),
	`country` varchar(255),
	CONSTRAINT `addresses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chargeboxes` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`ocpp_protocol` varchar(255),
	`charge_point_vendor` varchar(255),
	`charge_point_model` varchar(255),
	`charge_point_serial_number` varchar(255),
	`charge_box_serial_number` varchar(255),
	`firmware_version` varchar(255),
	`iccid` varchar(255),
	`imsi` varchar(255),
	`meter_type` varchar(255),
	`meter_serial_number` varchar(255),
	`last_heartbeat` timestamp(6),
	`address_id` int unsigned,
	`location_latitude` decimal(11,8),
	`location_longitude` decimal(11,8),
	CONSTRAINT `chargeboxes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meter_values` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`connector_pk` int unsigned NOT NULL,
	`transaction_id` int unsigned,
	`timestamp` timestamp(6),
	`value` text,
	`reading_context` varchar(255),
	`format` varchar(255),
	`measurand` varchar(255),
	`location` varchar(255),
	`unit` varchar(255),
	`phase` varchar(255),
	CONSTRAINT `meter_values_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `connector_statuses` (
	`id` int unsigned NOT NULL,
	`status` varchar(255),
	`status_timestamp` timestamp(6),
	`error_code` varchar(255),
	`error_info` varchar(255),
	`vendor_id` varchar(255),
	`vendor_error_code` varchar(255),
	CONSTRAINT `connector_statuses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `connectors` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`chargebox_id` int unsigned NOT NULL,
	`connector_id` int unsigned NOT NULL,
	CONSTRAINT `connectors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ocpp_tags` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`id_tag` varchar(255) NOT NULL,
	`parent_id_tag` varchar(255),
	`expired_date` timestamp,
	CONSTRAINT `ocpp_tags_id` PRIMARY KEY(`id`),
	CONSTRAINT `ocpp_tags_id_tag_unique` UNIQUE(`id_tag`)
);
--> statement-breakpoint
CREATE TABLE `transaction_starts` (
	`transaction_id` int unsigned AUTO_INCREMENT NOT NULL,
	`connector_pk` int unsigned NOT NULL,
	`id_tag` varchar(255) NOT NULL,
	`start_timestamp` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
	`meter_start` int unsigned NOT NULL,
	CONSTRAINT `transaction_starts_transaction_id` PRIMARY KEY(`transaction_id`)
);
--> statement-breakpoint
CREATE TABLE `transaction_stops` (
	`transaction_id` int unsigned NOT NULL,
	`event_timestamp` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
	`event_actor` enum('manual','station'),
	`stop_timestamp` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
	`meter_stop` int unsigned NOT NULL,
	`stop_reason` varchar(255),
	CONSTRAINT `transaction_stops_transaction_id` PRIMARY KEY(`transaction_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`first_name` varchar(255),
	`last_name` varchar(255),
	`email` varchar(255),
	`password` varchar(255),
	`phone` varchar(15),
	`ocpp_tag_id` int unsigned,
	`address_id` int unsigned,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `chargeboxes` ADD CONSTRAINT `chargeboxes_address_id_addresses_id_fk` FOREIGN KEY (`address_id`) REFERENCES `addresses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `meter_values` ADD CONSTRAINT `meter_values_connector_pk_connectors_id_fk` FOREIGN KEY (`connector_pk`) REFERENCES `connectors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `meter_values` ADD CONSTRAINT `meter_values_transaction_id_transaction_starts_transaction_id_fk` FOREIGN KEY (`transaction_id`) REFERENCES `transaction_starts`(`transaction_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `connector_statuses` ADD CONSTRAINT `connector_statuses_id_connectors_id_fk` FOREIGN KEY (`id`) REFERENCES `connectors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `connectors` ADD CONSTRAINT `connectors_chargebox_id_chargeboxes_id_fk` FOREIGN KEY (`chargebox_id`) REFERENCES `chargeboxes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ocpp_tags` ADD CONSTRAINT `ocpp_tags_parent_id_tag_ocpp_tags_id_tag_fk` FOREIGN KEY (`parent_id_tag`) REFERENCES `ocpp_tags`(`id_tag`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transaction_starts` ADD CONSTRAINT `transaction_starts_connector_pk_connectors_id_fk` FOREIGN KEY (`connector_pk`) REFERENCES `connectors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transaction_starts` ADD CONSTRAINT `transaction_starts_id_tag_ocpp_tags_id_tag_fk` FOREIGN KEY (`id_tag`) REFERENCES `ocpp_tags`(`id_tag`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transaction_stops` ADD CONSTRAINT `transaction_stops_transaction_id_fk` FOREIGN KEY (`transaction_id`) REFERENCES `transaction_starts`(`transaction_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_ocpp_tag_id_ocpp_tags_id_fk` FOREIGN KEY (`ocpp_tag_id`) REFERENCES `ocpp_tags`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_address_id_addresses_id_fk` FOREIGN KEY (`address_id`) REFERENCES `addresses`(`id`) ON DELETE no action ON UPDATE no action;