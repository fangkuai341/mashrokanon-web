<script setup>
import SectionHeader from '../components/SectionHeader.vue'

defineProps({
  copy: { type: Object, default: () => ({}) },
})
</script>

<template>
  <section class="page page-about is-active">
    <SectionHeader kicker="ABOUT THIS FOREST" title="关于本站" desc="" />

    <div class="notice card reveal is-visible">
      <h3 class="notice-title">重要声明</h3>
      <p>本站是粉丝自发建立的 <b>非官方</b> 纪念与档案馆，与真白花音本人及其所属机构无关。</p>
      <p>我们尊重她因健康原因做出的毕业决定，不催更、不请愿、不打扰。愿她安心休养。</p>
    </div>

    <div class="about-grid">
      <article class="card reveal is-visible">
        <h3 class="card-title">我们是谁</h3>
        <p>一群舍不得说再见、又希望好好道别的旅人。我们把 2019 到 2026 的足迹、梗与笑声收进这片森林，让后来的人也能认识这位温柔的白发公主。</p>
      </article>
      <article class="card reveal is-visible">
        <h3 class="card-title">我们如何维护</h3>
        <p>本站由个人运营：留言自动过滤 + 人工抽查，投稿逐条人工审核。</p>
        <p>所有内容定期备份、可导出；即使某一天森林无人看守，也留有站务交接预案，让记忆不会失联。</p>
      </article>
      <article class="card reveal is-visible">
        <h3 class="card-title">你可以做什么</h3>
        <ul class="guide-list">
          <li>在记忆墙留下一封信；</li>
          <li>埋下一颗时光胶囊，赴未来的约；</li>
          <li>把珍藏的素材投稿进档案；</li>
          <li>把森林分享给同样记得她的人。</li>
        </ul>
      </article>
    </div>

    <div class="contact-card card reveal is-visible">
      <h3 class="card-title">{{ copy.contact_title || '联系我' }}</h3>
      <p class="contact-desc">{{ copy.contact_desc || '森林的维护者就在这里 —— 投稿、勘误、合作或一句问候，都欢迎来信。' }}</p>
      <div class="contact-grid">
        <a class="contact-item" href="https://qm.qq.com/cgi-bin/qm/qr?k=2608796981" target="_blank" rel="noopener" aria-label="QQ">
          <span class="contact-icon qq" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3.5c-3.8 0-6.8 2.6-6.8 6.2 0 1.9 1 3.6 2.6 4.7-.1.8-.5 2.1-1.5 3.2 2-.2 3.6-1.3 4.4-2 .4.1.9.1 1.3.1 3.8 0 6.8-2.6 6.8-6.2S15.8 3.5 12 3.5Z"/><circle cx="9" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1" fill="currentColor" stroke="none"/><path d="M9 13c.7.9 3.3.9 4-.1"/></svg>
          </span>
          <span class="contact-info"><b>{{ copy.ct_qq || 'QQ' }}</b><i>2608796981</i></span>
          <span class="contact-arrow" aria-hidden="true">↗</span>
        </a>
        <a class="contact-item" href="https://space.bilibili.com/293942714" target="_blank" rel="noopener" aria-label="哔哩哔哩">
          <span class="contact-icon bili" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="6.5" width="19" height="11" rx="2.5"/><path d="M7 9l1.5 3L7 15"/><path d="M11.5 9v6M11.5 9h2a1.5 1.5 0 0 1 0 3h-2"/><path d="M17 11.2a1.5 1.5 0 1 1 0 2.6"/><circle cx="8.2" cy="5.2" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.8" cy="5.2" r="1.1" fill="currentColor" stroke="none"/></svg>
          </span>
          <span class="contact-info"><b>{{ copy.ct_bili || '哔哩哔哩' }}</b><i>@雪梨_Channel</i></span>
          <span class="contact-arrow" aria-hidden="true">↗</span>
        </a>
        <a class="contact-item" aria-label="邮箱">
          <span class="contact-icon mail" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 6.5 12 13 20.5 6.5"/></svg>
          </span>
          <span class="contact-info"><b>{{ copy.ct_mail || '邮箱' }}</b><i>2608796981@qq.com</i></span>
          <span class="contact-arrow" aria-hidden="true">↗</span>
        </a>
        <a class="contact-item" href="https://t.me/+gTUfkkDJQ904OTgx" target="_blank" rel="noopener" aria-label="Telegram">
          <span class="contact-icon tg" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20.5 5.5 3.8 11.3l4.7 1.7 1.8 5.4 3.2-3.2 5-9.7Z"/><path d="M9.5 17.4 13 13.5"/></svg>
          </span>
          <span class="contact-info"><b>{{ copy.ct_tg || 'Telegram' }}</b><i>@白菜森林</i></span>
          <span class="contact-arrow" aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  </section>
</template>
