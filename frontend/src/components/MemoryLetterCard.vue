<script setup>
defineProps({
  letter: { type: Object, required: true },
})

defineEmits(['light'])
</script>

<template>
  <article class="letter reveal is-visible">
    <div class="letter-head">
      <span class="letter-tag" :class="{ plain: letter.demo && !letter.pending }">{{ letter.tag }}<template v-if="letter.demo"> · 演示</template></span>
      <span v-if="letter.pending" class="letter-pending">审核中</span>
    </div>
    <p class="letter-text">{{ letter.text }}</p>
    <footer class="letter-foot">
      <span class="letter-sign">{{ letter.sign }}<time>{{ letter.date }}</time></span>
      <button class="light-btn" type="button" @click="$emit('light', letter)">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><path d="M12 3c2.8 3 4.6 6 4.6 8.8 0 3-2 5.4-4.6 5.4s-4.6-2.4-4.6-5.4C7.4 9 9.2 6 12 3Z"/><path d="M12 17.2v3.8M9 21h6"/></svg>
        <b>{{ letter.lights }}</b>
      </button>
    </footer>
  </article>
</template>
