<script setup>
import { computed } from 'vue'
import { daysUntil } from '../data/siteData'

const props = defineProps({
  capsule: { type: Object, required: true },
})

const unlocked = computed(() => daysUntil(props.capsule.unlock) === 0)
</script>

<template>
  <article class="capsule" :class="{ 'is-unlocked': unlocked, 'is-locked': !unlocked }">
    <div class="capsule-top">
      <span class="capsule-status">{{ unlocked ? '已开启' : '锁定' }}</span>
      <time class="capsule-unlock-time">{{ capsule.unlock }}</time>
    </div>
    <h3>{{ capsule.title }}</h3>
    <p class="capsule-when">埋下于 · {{ capsule.buried }}</p>
    <p v-if="!unlocked" class="capsule-countdown"><span class="lock-ic">🔒</span>还有 <b class="days-num">{{ daysUntil(capsule.unlock) }}</b> 天开启</p>
    <p v-else class="capsule-body">{{ capsule.public && capsule.content ? capsule.content : '私密胶囊：到约定之日，森林会提醒你回来开启。' }}</p>
  </article>
</template>
