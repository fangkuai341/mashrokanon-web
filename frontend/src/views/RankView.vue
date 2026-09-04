<script setup>
import { onMounted, ref } from 'vue'
import SectionHeader from '../components/SectionHeader.vue'
import GlassCard from '../components/GlassCard.vue'
import { api } from '../services/api'

const props = defineProps({
  showToast: { type: Function, required: true },
})

const form = ref({
  date: '',
  title: '',
  zh: '',
  ja: '',
  tags: '',
  source: '',
  name: '',
})

const rankList = ref([])

const guidance = [
  '补充真实可溯源的时间轴事件：日期、标题、中/日文描述与标签。',
  '所有投稿都会先进入人工审核队列，避免误收不可靠内容。',
  '审核通过后会写入足迹时间轴档案馆，并在贡献榜中记录来源昵称。',
]

async function loadRank() {
  try {
    const res = await api.requestJson('/api/rank')
    rankList.value = res.data?.items ?? []
  } catch {
    rankList.value = [
      { name: '守林人 · 小K', count: 8 },
      { name: '白菜考古队', count: 5 },
      { name: '深夜听众 A', count: 3 },
      { name: '补档新人', count: 2 },
      { name: '切片收藏家', count: 2 },
      { name: '匿名旅人', count: 1 },
    ]
  }
}

async function submitPost() {
  if (!form.value.date.trim()) {
    props.showToast('请选择事件日期。', 'error')
    return
  }
  if (!form.value.title.trim()) {
    props.showToast('请填写事件标题。', 'error')
    return
  }
  if (!form.value.zh.trim()) {
    props.showToast('请填写中文描述。', 'error')
    return
  }

  try {
    await api.requestJson('/api/submissions', {
      method: 'POST',
      body: JSON.stringify({
        date: form.value.date,
        title: form.value.title.trim(),
        zh: form.value.zh.trim(),
        ja: form.value.ja.trim() || '',
        tags: form.value.tags.split(',').map((item) => item.trim()).filter(Boolean),
        source: form.value.source.trim(),
        name: form.value.name.trim(),
      }),
    })
    props.showToast('投稿已收到，站长审核通过后会写入足迹时间轴档案馆。')
    form.value = {
      date: '',
      title: '',
      zh: '',
      ja: '',
      tags: '',
      source: '',
      name: '',
    }
  } catch (error) {
    props.showToast(error instanceof Error ? error.message : '投稿失败', 'error')
  }
}

onMounted(loadRank)
</script>

<template>
  <section class="page page-rank is-active">
    <SectionHeader
      kicker="CONTRIBUTORS · FOREST CO-CREATION"
      title="投稿与贡献榜"
      desc="在这里补充资料，也在这里看见为森林添砖加瓦的人。"
    />

    <div class="community-layout">
      <div class="community-left">
        <GlassCard class-name="community-panel reveal is-visible">
          <div class="community-panel-head">
            <div>
              <p class="community-eyebrow">投稿说明</p>
              <h3 class="card-title">森林共建入口</h3>
            </div>
            <span class="community-badge">人工审核</span>
          </div>
          <ul class="steps community-steps">
            <li v-for="(item, index) in guidance" :key="item"><b>{{ String(index + 1).padStart(2, '0') }}</b> {{ item }}</li>
          </ul>
        </GlassCard>

        <div class="community-grid-bottom">
          <GlassCard class-name="community-panel reveal is-visible">
            <div class="community-panel-head">
              <div>
                <p class="community-eyebrow">贡献榜</p>
                <h3 class="card-title">被采纳投稿最多的旅人</h3>
              </div>
              <span class="community-badge community-badge-muted">截至本原型</span>
            </div>

            <div class="podium community-podium">
              <div class="podium-item place-2">
                <span class="podium-rank">02</span>
                <span class="podium-name">{{ rankList[1]?.name ?? '—' }}</span>
                <span class="podium-count">{{ rankList[1]?.count ?? 0 }} 篇</span>
              </div>
              <div class="podium-item place-1">
                <span class="podium-rank">01</span>
                <span class="podium-name">{{ rankList[0]?.name ?? '—' }}</span>
                <span class="podium-count">{{ rankList[0]?.count ?? 0 }} 篇</span>
              </div>
              <div class="podium-item place-3">
                <span class="podium-rank">03</span>
                <span class="podium-name">{{ rankList[2]?.name ?? '—' }}</span>
                <span class="podium-count">{{ rankList[2]?.count ?? 0 }} 篇</span>
              </div>
            </div>

            <div class="rank-list community-rank-list">
              <div v-for="(item, index) in rankList.slice(3)" :key="item.name" class="rank-row community-rank-row">
                <span class="rank-no">{{ String(index + 4).padStart(2, '0') }}</span>
                <span class="rank-name">{{ item.name }}</span>
                <span class="rank-count">{{ item.count }} 篇</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      <aside class="community-right">
        <GlassCard class-name="community-panel community-form-panel reveal is-visible">
          <div class="community-panel-head">
            <div>
              <p class="community-eyebrow">投稿表单</p>
              <h3 class="card-title">提交一条新足迹</h3>
            </div>
          </div>
          <form class="community-form" @submit.prevent="submitPost">
            <div class="form-row">
              <label for="submit-date">事件日期 <b class="form-required">*</b></label>
              <input id="submit-date" v-model="form.date" type="date" required />
            </div>
            <div class="form-row">
              <label for="submit-title">事件标题 <b class="form-required">*</b></label>
              <input id="submit-title" v-model="form.title" type="text" maxlength="80" placeholder="例如：生日回读信环节" />
            </div>
            <div class="form-row">
              <label for="submit-zh">中文描述 <b class="form-required">*</b></label>
              <textarea id="submit-zh" v-model="form.zh" rows="7" maxlength="3000" placeholder="写下事件经过、背景与可溯源细节……"></textarea>
            </div>
            <div class="form-row">
              <label for="submit-ja">日文描述</label>
              <textarea id="submit-ja" v-model="form.ja" rows="3" maxlength="3000" placeholder="可选：日语版描述，弥补后由管理员补录"></textarea>
            </div>
            <div class="form-row">
              <label for="submit-tags">标签</label>
              <input id="submit-tags" v-model="form.tags" type="text" maxlength="120" placeholder="可选：里程碑,名场面,形象（逗号分隔）" />
            </div>
            <div class="form-row">
              <label for="submit-source">素材链接 / 出处</label>
              <input id="submit-source" v-model="form.source" type="text" maxlength="300" placeholder="可选：B 站切片链接、原文出处" />
            </div>
            <div class="form-row">
              <label for="submit-name">投稿署名</label>
              <input id="submit-name" v-model="form.name" type="text" maxlength="20" placeholder="可选：匿名或昵称" />
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">提交投稿</button>
            </div>
            <p class="form-note">涉及隐私、未授权搬运或无法溯源的内容会被驳回；通过审核后才会写入时间轴并公开展示。</p>
          </form>
        </GlassCard>
      </aside>
    </div>
  </section>
</template>
