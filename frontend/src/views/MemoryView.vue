<script setup>
import { computed, onMounted, ref } from 'vue'
import SectionHeader from '../components/SectionHeader.vue'
import FilterChips from '../components/FilterChips.vue'
import MemoryLetterCard from '../components/MemoryLetterCard.vue'
import { api } from '../services/api'

const props = defineProps({
  showToast: { type: Function, required: true },
})

const writeOpen = ref(false)
const letterName = ref('')
const letterTag = ref('思念')
const letterText = ref('')
const tagFilter = ref('all')
const sortMode = ref('new')
const letters = ref([])
const loading = ref(false)

const tagItems = [
  { value: 'all', label: '全部' },
  { value: '思念', label: '思念' },
  { value: '感谢', label: '感谢' },
  { value: '祝福', label: '祝福' },
  { value: '故事', label: '故事' },
  { value: '其他', label: '其他' },
]

const sortItems = [
  { value: 'new', label: '最新' },
  { value: 'hot', label: '最热' },
]

const filteredLetters = computed(() => {
  const list = letters.value.filter((letter) => tagFilter.value === 'all' || letter.tag === tagFilter.value)
  return [...list].sort((a, b) => {
    if (sortMode.value === 'hot') return (b.lightsCount ?? 0) - (a.lightsCount ?? 0)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
})

const letterCards = computed(() =>
  filteredLetters.value.map((letter) => ({
    id: letter.id,
    tag: letter.tag,
    text: letter.content,
    sign: letter.nickname,
    date: new Date(letter.createdAt).toISOString().slice(0, 10),
    lights: letter.lightsCount ?? 0,
    pending: letter.status === 'pending',
    demo: false,
  })),
)

async function loadLetters() {
  loading.value = true
  try {
    const res = await api.listLetters({ limit: 50 })
    letters.value = res.data?.items ?? []
  } catch (error) {
    props.showToast(error instanceof Error ? error.message : '读取留言失败', 'error')
  } finally {
    loading.value = false
  }
}

async function submitLetter() {
  if (!letterText.value.trim()) {
    props.showToast('请先写下想说的话。', 'error')
    return
  }

  try {
    await api.createLetter({
      nickname: letterName.value.trim(),
      content: letterText.value.trim(),
      tag: letterTag.value,
      isAnonymous: !letterName.value.trim(),
    })
    letterName.value = ''
    letterTag.value = '思念'
    letterText.value = ''
    writeOpen.value = false
    props.showToast('来信已送达森林，等待审核后展示。')
    await loadLetters()
  } catch (error) {
    props.showToast(error instanceof Error ? error.message : '提交失败', 'error')
  }
}

async function toggleLight(letter) {
  try {
    const res = await api.lightLetter(letter.id)
    const nextCount = res.data?.lightsCount ?? (letter.lightsCount ?? 0) + 1
    const idx = letters.value.findIndex((item) => item.id === letter.id)
    if (idx !== -1) letters.value[idx].lightsCount = nextCount
    props.showToast('已为这封信点亮一盏灯。')
  } catch (error) {
    props.showToast(error instanceof Error ? error.message : '点灯失败', 'error')
  }
}

onMounted(loadLetters)
</script>

<template>
  <section class="page page-memory is-active">
    <SectionHeader kicker="MEMORY WALL · LETTERS TO THE FOREST" title="记忆墙" desc="这里挂着旅人们写给森林的信。写下一句「辛苦音」，让白菜知道森林一直有人记得她。" />

    <div class="write-box card reveal is-visible">
      <button class="btn btn-primary" type="button" @click="writeOpen = !writeOpen">{{ writeOpen ? '再想想' : '写一封给森林的信' }}</button>
      <form v-if="writeOpen" class="letter-form" @submit.prevent="submitLetter">
        <div class="form-row">
          <label for="letter-name">昵称（可选）</label>
          <input id="letter-name" v-model="letterName" type="text" maxlength="16" placeholder="匿名旅人" />
        </div>
        <div class="form-row">
          <label for="letter-tag">信件标签</label>
          <select id="letter-tag" v-model="letterTag">
            <option>思念</option>
            <option>感谢</option>
            <option>祝福</option>
            <option>故事</option>
            <option>其他</option>
          </select>
        </div>
        <div class="form-row">
          <label for="letter-text">想说的话</label>
          <textarea id="letter-text" v-model="letterText" rows="4" maxlength="500" placeholder="把想对白菜说的话写在这里……"></textarea>
          <span class="char-count"><b>{{ letterText.length }}</b> / 500</span>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">寄出这封信</button>
          <button type="button" class="btn btn-ghost" @click="writeOpen = false">再想想</button>
        </div>
        <p class="form-note">来信会先经过自动过滤与人工抽查，请温柔地写下每一句。</p>
      </form>
    </div>

    <div class="wall-tools reveal is-visible">
      <FilterChips v-model="tagFilter" :items="tagItems" aria-label="按标签筛选" />
      <FilterChips v-model="sortMode" :items="sortItems" aria-label="排序" />
    </div>

    <p v-if="loading" class="wall-note">正在从森林里加载来信……</p>

    <div class="wall">
      <MemoryLetterCard v-for="card in letterCards" :key="card.id" :letter="card" @light="toggleLight" />
    </div>

    <p class="wall-note">留言提交后会进入审核队列，审核通过才会公开展示。</p>
  </section>
</template>
