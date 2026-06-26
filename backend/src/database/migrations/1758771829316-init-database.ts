import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitDatabase1758771829316 implements MigrationInterface {
  name = 'InitDatabase1758771829316';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`roles\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` enum ('1', '2') NOT NULL, \`description\` text NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_roles\` (\`user_id\` int NOT NULL, \`role_id\` int NOT NULL, PRIMARY KEY (\`user_id\`, \`role_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`permissions\` (\`id\` tinyint NOT NULL AUTO_INCREMENT, \`action\` enum ('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14') NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_permissions\` (\`user_id\` int NOT NULL, \`permission_id\` tinyint NOT NULL, PRIMARY KEY (\`user_id\`, \`permission_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`department_permissions\` (\`id\` tinyint NOT NULL AUTO_INCREMENT, \`action\` enum ('1', '2', '3', '4', '5', '6', '7', '8') NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_department_permissions\` (\`user_id\` int NOT NULL, \`department_id\` tinyint NOT NULL, \`department_permission_id\` tinyint NOT NULL, \`assigned_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`user_id\`, \`department_id\`, \`department_permission_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`departments\` (\`id\` tinyint NOT NULL AUTO_INCREMENT, \`department_name\` varchar(255) NOT NULL, \`level\` enum ('1', '2', '3', '4') NOT NULL DEFAULT '1', \`status\` enum ('1', '2') NOT NULL DEFAULT '1', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_departments\` (\`user_id\` int NOT NULL, \`department_id\` tinyint NOT NULL, \`position\` enum ('1', '2', '3') NOT NULL DEFAULT '3', \`assigned_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`user_id\`, \`department_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`attendances\` (\`id\` varchar(36) NOT NULL, \`check_in\` datetime NULL, \`check_out\` datetime NULL, \`attendance_date\` date NOT NULL, \`status\` enum ('1', '2', '3', '4', '5', '6') NOT NULL, \`note\` text NOT NULL, \`overtime_hours\` decimal(5,2) NOT NULL DEFAULT '0.00', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`user_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`audit_logs\` (\`id\` int NOT NULL AUTO_INCREMENT, \`action\` enum ('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23') NOT NULL, \`description\` text NULL, \`entity_name\` varchar(255) NULL, \`record_id\` int NULL, \`previous_value\` json NULL, \`new_value\` json NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`user_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`leave_attachments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`file_path\` varchar(255) NOT NULL, \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`leave_request_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`leave_requests\` (\`id\` int NOT NULL AUTO_INCREMENT, \`leave_type\` enum ('1', '2', '3', '4') NOT NULL, \`start_date\` datetime NOT NULL, \`end_date\` datetime NOT NULL, \`reason\` varchar(255) NOT NULL, \`status\` enum ('1', '2', '3', '4', '5') NOT NULL DEFAULT '1', \`approved_at\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`user_id\` int NULL, \`approved_by\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`logos\` (\`id\` tinyint NOT NULL AUTO_INCREMENT, \`logo_url\` varchar(255) NOT NULL, \`uploaded_by\` int NOT NULL, \`uploaded_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`is_active\` enum ('1', '0') NOT NULL DEFAULT '1', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`notifications\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` enum ('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14') NOT NULL, \`title\` varchar(255) NOT NULL, \`content\` varchar(255) NOT NULL, \`day_inform\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_notifications\` (\`id\` int NOT NULL AUTO_INCREMENT, \`reference_id\` int NULL, \`is_read\` tinyint NOT NULL DEFAULT 0, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user_id\` int NULL, \`notification_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`full_name\` varchar(255) NOT NULL, \`code\` varchar(255) NOT NULL, \`identity_number\` varchar(12) NOT NULL, \`address\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`date_of_birth\` datetime NULL, \`phone\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`refresh_token\` varchar(255) NULL, \`expires_at\` datetime NULL, \`avatar_url\` varchar(255) NULL, \`public_img_id\` varchar(255) NULL, \`sex\` enum ('1', '2', '3') NOT NULL, \`status\` enum ('1', '2', '3') NOT NULL DEFAULT '1', \`bank_account\` varchar(20) NOT NULL, \`bank_name\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, UNIQUE INDEX \`IDX_1f7a2b11e29b1422a2622beab3\` (\`code\`), UNIQUE INDEX \`IDX_43d2ef62e309fe8f4bae2a67e5\` (\`identity_number\`), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), UNIQUE INDEX \`IDX_a000cca60bcf04454e72769949\` (\`phone\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_87b8888186ca9769c960e926870\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_b23c65e50a758245a33ee35fda1\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_permissions\` ADD CONSTRAINT \`FK_3495bd31f1862d02931e8e8d2e8\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_permissions\` ADD CONSTRAINT \`FK_8145f5fadacd311693c15e41f10\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_department_permissions\` ADD CONSTRAINT \`FK_864057fd9c3c7045bebcbe93de9\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_department_permissions\` ADD CONSTRAINT \`FK_86fc5b0651530c16874ed38b57c\` FOREIGN KEY (\`department_id\`) REFERENCES \`departments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_department_permissions\` ADD CONSTRAINT \`FK_0b59b3737ead58b8ccd49ef835a\` FOREIGN KEY (\`department_permission_id\`) REFERENCES \`department_permissions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_departments\` ADD CONSTRAINT \`FK_78098f9a7c51985e96b5326bca9\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_departments\` ADD CONSTRAINT \`FK_f10514cebc5e624f08c1b558081\` FOREIGN KEY (\`department_id\`) REFERENCES \`departments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`attendances\` ADD CONSTRAINT \`FK_aa902e05aeb5fde7c1dd4ced2b7\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`audit_logs\` ADD CONSTRAINT \`FK_bd2726fd31b35443f2245b93ba0\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`leave_attachments\` ADD CONSTRAINT \`FK_b2d5ed0afbc0b0dc6cbfc4cac10\` FOREIGN KEY (\`leave_request_id\`) REFERENCES \`leave_requests\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`leave_requests\` ADD CONSTRAINT \`FK_6d320737541c7c4d2a6f0f9d911\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`leave_requests\` ADD CONSTRAINT \`FK_fe3e6c3fea2c56aaaad8cedbc20\` FOREIGN KEY (\`approved_by\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`logos\` ADD CONSTRAINT \`FK_2d47df4561739d176da67fb406d\` FOREIGN KEY (\`uploaded_by\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_notifications\` ADD CONSTRAINT \`FK_ae9b1d1f1fe780ef8e3e7d0c0f6\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_notifications\` ADD CONSTRAINT \`FK_944431ae979397c8b56a99bf024\` FOREIGN KEY (\`notification_id\`) REFERENCES \`notifications\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_notifications\` DROP FOREIGN KEY \`FK_944431ae979397c8b56a99bf024\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_notifications\` DROP FOREIGN KEY \`FK_ae9b1d1f1fe780ef8e3e7d0c0f6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`logos\` DROP FOREIGN KEY \`FK_2d47df4561739d176da67fb406d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`leave_requests\` DROP FOREIGN KEY \`FK_fe3e6c3fea2c56aaaad8cedbc20\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`leave_requests\` DROP FOREIGN KEY \`FK_6d320737541c7c4d2a6f0f9d911\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`leave_attachments\` DROP FOREIGN KEY \`FK_b2d5ed0afbc0b0dc6cbfc4cac10\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`audit_logs\` DROP FOREIGN KEY \`FK_bd2726fd31b35443f2245b93ba0\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`attendances\` DROP FOREIGN KEY \`FK_aa902e05aeb5fde7c1dd4ced2b7\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_departments\` DROP FOREIGN KEY \`FK_f10514cebc5e624f08c1b558081\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_departments\` DROP FOREIGN KEY \`FK_78098f9a7c51985e96b5326bca9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_department_permissions\` DROP FOREIGN KEY \`FK_0b59b3737ead58b8ccd49ef835a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_department_permissions\` DROP FOREIGN KEY \`FK_86fc5b0651530c16874ed38b57c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_department_permissions\` DROP FOREIGN KEY \`FK_864057fd9c3c7045bebcbe93de9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_permissions\` DROP FOREIGN KEY \`FK_8145f5fadacd311693c15e41f10\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_permissions\` DROP FOREIGN KEY \`FK_3495bd31f1862d02931e8e8d2e8\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_b23c65e50a758245a33ee35fda1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_87b8888186ca9769c960e926870\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_a000cca60bcf04454e72769949\` ON \`users\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_43d2ef62e309fe8f4bae2a67e5\` ON \`users\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_1f7a2b11e29b1422a2622beab3\` ON \`users\``,
    );
    await queryRunner.query(`DROP TABLE \`users\``);
    await queryRunner.query(`DROP TABLE \`user_notifications\``);
    await queryRunner.query(`DROP TABLE \`notifications\``);
    await queryRunner.query(`DROP TABLE \`logos\``);
    await queryRunner.query(`DROP TABLE \`leave_requests\``);
    await queryRunner.query(`DROP TABLE \`leave_attachments\``);
    await queryRunner.query(`DROP TABLE \`audit_logs\``);
    await queryRunner.query(`DROP TABLE \`attendances\``);
    await queryRunner.query(`DROP TABLE \`user_departments\``);
    await queryRunner.query(`DROP TABLE \`departments\``);
    await queryRunner.query(`DROP TABLE \`user_department_permissions\``);
    await queryRunner.query(`DROP TABLE \`department_permissions\``);
    await queryRunner.query(`DROP TABLE \`user_permissions\``);
    await queryRunner.query(`DROP TABLE \`permissions\``);
    await queryRunner.query(`DROP TABLE \`user_roles\``);
    await queryRunner.query(`DROP TABLE \`roles\``);
  }
}
