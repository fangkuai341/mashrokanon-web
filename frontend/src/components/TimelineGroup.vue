<script setup>
defineProps({
  year: { type: String, required: true },
  items: { type: Array, required: true },
  lang: { type: String, required: true },
})
</script>

<template>
  <section class="timeline-group">
    <h3 class="tl-year">{{ year }}</h3>
    <article v-for="event in items" :key="`${event.y}-${event.d}-${event.title}`" class="tl-item" :class="{ 'is-featured': event.featured }">
      <span class="tl-node" aria-hidden="true"></span>
      <time class="tl-date">{{ event.y }}.{{ event.d }}</time>

      <div class="tl-card tl-card--image">
        <div class="tl-media" :style="{ backgroundImage: `url(${event.image})` }" aria-hidden="true">
          <span class="tl-media-badge">{{ event.tags[0] }}</span>
        </div>

        <div class="tl-content">
          <div class="tl-title-row">
            <div>
              <h3>{{ event.title }}</h3>
              <p class="tl-lead">{{ lang === 'ja' ? event.ja : event.zh }}</p>
            </div>
            <span class="tl-date-pill">{{ event.d }}</span>
          </div>

          <div class="tl-foot">
            <div class="tl-tags">
              <span v-for="tag in event.tags" :key="tag" :class="['tag', { 'tag-amber': event.featured }]">{{ tag }}</span>
            </div>
            <a
              class="tl-link"
                :href="`${  event.link ? event.link : `https://search.bilibili.com/all?keyword=${encodeURIComponent(`真白花音 ${event.title}`)}`}`"
                target="_blank"
              rel="noopener"
            >
             查看详情 →
            </a>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>
