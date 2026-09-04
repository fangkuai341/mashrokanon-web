-- AlterTable
ALTER TABLE `capsule` ADD COLUMN `keyEncrypted` VARCHAR(500) NULL,
    MODIFY `contentEncrypted` VARCHAR(5000) NOT NULL;

-- AlterTable
ALTER TABLE `communitysubmission` MODIFY `zh` TEXT NOT NULL,
    MODIFY `ja` TEXT NOT NULL;
