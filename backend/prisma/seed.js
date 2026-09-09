import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { DEFAULT_COUNTDOWN } from '../src/modules/site/repository.js'

const prisma = new PrismaClient()

const admin = {
  username: process.env.ADMIN_USERNAME ?? 'admin',
  password: process.env.ADMIN_PASSWORD ?? 'change-me-now',
}

const timelineEvents = [
 
  { date: '2019-05-14', title: '断手事件 ①', zh: '直播中模仿迷惑行为，惨遭「断手」。森林的第一个名场面诞生。', ja: '配信中のふざけた行動から「手を折られる」事件が発生。', tagsJson: ['名场面'], featured: false },
  { date: '2020-12-07', title: '复活直播', zh: '断手后「复活」直播，手再次被打断。', ja: '復活配信で再び手を折られる伝説が生まれました。', tagsJson: ['名场面'], featured: false },
  { date: '2021-05-29', title: '生日洋装 · 紫甘蓝', zh: '生日直播公开洋装形象，整体色调偏紫。', ja: '誕生日配信でドレス姿を公開。紫寄りの配色が印象的でした。', tagsJson: ['形象', '生日'], featured: false },
  { date: '2021-10-04', title: '中式女仆偶像装', zh: '12 万粉纪念回公开中式女仆风偶像形象。', ja: '12万人記念配信で中華メイド風アイドル衣装を公開。', tagsJson: ['形象', '里程碑'], featured: false },
  { date: '2022-11-13', title: '3D 发布会', zh: '3D 发布会公开 3D 形象。', ja: '3Dお披露目配信を開催。', tagsJson: ['里程碑'], featured: false },
  { date: '2022-12-31', title: '年度巅峰主播', zh: '获 Bilibili 2022 年度巅峰主播认证；年度盛典年度第三。', ja: 'Bilibili 2022年度トップ配信者に認定され、祭典で年間3位に。', tagsJson: ['荣誉'], featured: true },
  { date: '2025-10-12', title: '上海音乐节首唱', zh: '登上上海「热爱次元」音乐节舞台。', ja: '上海の音楽フェスに出演。', tagsJson: ['舞台'], featured: false },
  { date: '2026-05-01', title: '毕业', zh: '因身心长期负荷，经医嘱需长期休养，正式终止全部活动。', ja: '心身の負担から長期休養のため全活動を終了。', tagsJson: ['里程碑', '毕业'], featured: true },
]

async function main() {
  const passwordHash = await bcrypt.hash(admin.password, 10)
  await prisma.adminUser.upsert({
    where: { username: admin.username },
    update: { passwordHash, nickname: '守林人', role: 'super_admin', status: 'active' },
    create: { username: admin.username, passwordHash, nickname: '守林人', role: 'super_admin', status: 'active' },
  })

  await prisma.siteSetting.upsert({
    where: { settingKey: 'home.countdown' },
    update: { settingValue: JSON.stringify(DEFAULT_COUNTDOWN) },
    create: { settingKey: 'home.countdown', settingValue: JSON.stringify(DEFAULT_COUNTDOWN) },
  })

  for (const entry of timelineEvents) {
    const date = new Date(`${entry.date}T00:00:00.000Z`)
    const payload = {
      date,
      title: entry.title,
      zh: entry.zh,
      ja: entry.ja,
      tagsJson: entry.tagsJson,
      link: entry.link ?? null,
      featured: entry.featured,
    }

    await prisma.timelineEvent.upsert({
      where: { date_title: { date, title: entry.title } },
      update: payload,
      create: payload,
    })
  }

  const submissions = [
    { date: new Date('2021-06-01T00:00:00.000Z'), title: '补档示例 1', zh: '示例内容', ja: '', tagsJson: ['补档'], source: 'https://example.com/1', submitter: '白菜考古队', status: 'approved' },
    { date: new Date('2022-03-15T00:00:00.000Z'), title: '补档示例 2', zh: '示例内容', ja: '', tagsJson: ['补档'], source: 'https://example.com/2', submitter: '守林人 · 小K', status: 'approved' },
    { date: new Date('2023-08-20T00:00:00.000Z'), title: '补档示例 3', zh: '示例内容', ja: '', tagsJson: ['补档'], source: 'https://example.com/3', submitter: '深夜听众 A', status: 'approved' },
  ]

  for (const item of submissions) {
    await prisma.communitySubmission.create({ data: item })
  }

  console.log(`Seeded admin: ${admin.username}`)
}

main().finally(() => prisma.$disconnect())
