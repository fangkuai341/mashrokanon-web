import { prisma } from '../../lib/prisma.js'
import {
  countTimelineEvents,
  createTimelineEvent,
  deleteTimelineEvent,
  listTimelineEvents,
  updateTimelineEvent,
} from '../content/data.js'

export const COUNTDOWN_SETTING_KEY = 'home.countdown'

export const DEFAULT_COUNTDOWN = {
  labelZh: '下一个纪念日 · 生日',
  labelJa: '次の記念日 · 卒業百日祭',
  date: '2026-12-29',
}

export function normalizeCountdown(raw) {
  let value = raw
  if (typeof raw === 'string') {
    try {
      value = JSON.parse(raw)
    } catch {
      value = null
    }
  }
  return {
    labelZh: String(value?.labelZh?.trim?.() || DEFAULT_COUNTDOWN.labelZh),
    labelJa: String(value?.labelJa?.trim?.() || DEFAULT_COUNTDOWN.labelJa),
    date: String(value?.date?.trim?.() || DEFAULT_COUNTDOWN.date),
  }
}

function computeDaysLeft(dateText) {
  const target = Date.parse(`${dateText}T00:00:00.000Z`)
  if (Number.isNaN(target)) return 0
  const diff = target - Date.now()
  return diff > 0 ? Math.ceil(diff / 86_400_000) : 0
}

export const siteRepository = {
  getSettings(keys) {
    return prisma.siteSetting.findMany({ where: { settingKey: { in: keys } } })
  },
  async getCountdownSetting() {
    const rows = await this.getSettings([COUNTDOWN_SETTING_KEY])
    return normalizeCountdown(rows[0]?.settingValue)
  },
  async upsertSetting(settingKey, settingValue) {
    return prisma.siteSetting.upsert({
      where: { settingKey },
      update: { settingValue },
      create: { settingKey, settingValue },
    })
  },
  async getHomeSummary() {
    const [timelineCount, approvedSubmissionCount, approvedMemoryCount, countdownSetting] = await Promise.all([
      countTimelineEvents(),
      prisma.communitySubmission.count({ where: { status: 'approved' } }),
      prisma.memoryLetter.count({ where: { status: 'approved' } }),
      this.getCountdownSetting(),
    ])
    const countdown = normalizeCountdown(countdownSetting)

    return {
      countdown: { ...countdown, days: computeDaysLeft(countdown.date) },
      stats: [
        { value: '2019–2026', label: '七年森林旅程' },
        { value: '216万+', label: '粉丝记忆' },
        { value: String(timelineCount), label: '时间轴事件' },
        { value: String(approvedSubmissionCount + approvedMemoryCount), label: '共建投稿' },
      ],
      notice: '非官方粉丝纪念站，内容均以尊重与纪念为前提。',
    }
  },
  listTimelineEvents(year) {
    return listTimelineEvents(year)
  },
  createTimelineEvent(data) {
    return createTimelineEvent(data)
  },
  updateTimelineEvent(id, data) {
    return updateTimelineEvent(id, data)
  },
  deleteTimelineEvent(id) {
    return deleteTimelineEvent(id)
  },
  listRank() {
    return prisma.communitySubmission.groupBy({
      by: ['submitter'],
      where: { status: 'approved' },
      _count: { submitter: true },
      orderBy: { _count: { submitter: 'desc' } },
      take: 10,
    })
  },
}
