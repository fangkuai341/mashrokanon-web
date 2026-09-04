<script setup>
import SectionHeader from '../components/SectionHeader.vue'
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

    <div class="about-facts card reveal is-visible">
      <h3 class="card-title">站点信息</h3>
      <dl class="facts">
        <div><dt>域名</dt><dd>www.love-kanon.com</dd></div>
        <div><dt>备案</dt><dd>备案号占位（已备案）</dd></div>
        <div><dt>语言</dt><dd>中文 · 日本語</dd></div>
        <div><dt>版本</dt><dd>Vue 原型 · 演示数据</dd></div>
      </dl>
      <p class="capsule-demo-note">本站所有展示数据均为原型演示内容，正式上线前将替换为经审核的真实内容。</p>
    </div>
  </section>
</template>
