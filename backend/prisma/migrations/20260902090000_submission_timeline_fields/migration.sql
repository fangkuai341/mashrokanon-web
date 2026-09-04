-- AlterTable: TimelineEvent 增加出处链接（可空），投稿采纳后写入
ALTER TABLE `TimelineEvent` ADD COLUMN `link` VARCHAR(300) NULL;

-- AlterTable: CommunitySubmission 重构为“足迹时间轴事件投稿”
-- 1) 移除旧的自由文本投稿字段
ALTER TABLE `CommunitySubmission`
  DROP COLUMN `type`,
  DROP COLUMN `content`;

-- 2) 先以可空列新增时间轴事件结构化字段，避免在非空表中直接加 NOT NULL 列报错
ALTER TABLE `CommunitySubmission`
  ADD COLUMN `date` DATETIME(3) NULL,
  ADD COLUMN `zh` LONGTEXT NULL,
  ADD COLUMN `ja` LONGTEXT NULL,
  ADD COLUMN `tagsJson` JSON NULL;

-- 3) 回填存量数据：日期取创建时间，双语内容留空（等待补录）
UPDATE `CommunitySubmission` SET
  `date` = `createdAt`,
  `zh` = '',
  `ja` = '',
  `tagsJson` = JSON_ARRAY()
WHERE `date` IS NULL;

-- 4) 收紧为必填列
ALTER TABLE `CommunitySubmission`
  MODIFY `date` DATETIME(3) NOT NULL,
  MODIFY `zh` LONGTEXT NOT NULL,
  MODIFY `ja` LONGTEXT NOT NULL,
  MODIFY `tagsJson` JSON NOT NULL;