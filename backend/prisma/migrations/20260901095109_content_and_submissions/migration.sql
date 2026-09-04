-- CreateTable
CREATE TABLE `CommunitySubmission` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `source` VARCHAR(300) NULL,
    `submitter` VARCHAR(191) NOT NULL DEFAULT '匿名',
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `reason` VARCHAR(191) NULL,
    `reviewedById` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CommunitySubmission_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `CommunitySubmission_submitter_status_idx`(`submitter`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
