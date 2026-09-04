-- CreateTable
CREATE TABLE `TimelineEvent` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `zh` TEXT NOT NULL,
    `ja` TEXT NOT NULL,
    `tagsJson` JSON NOT NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TimelineEvent_date_idx`(`date`),
    INDEX `TimelineEvent_featured_idx`(`featured`),
    UNIQUE INDEX `TimelineEvent_date_title_key`(`date`, `title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
