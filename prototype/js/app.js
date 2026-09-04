/* ============================================================
   白菜的森林 · Prototype v0.5
   路由 / i18n(中·日) / 时间轴 / 记忆墙 / 时光胶囊 / 贡献榜
   ============================================================ */
"use strict";

const $  = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ---------------- 国际化字典 ---------------- */

const I18N = {
  zh: {
    badge_official: "非官方粉丝站",
    nav_home: "首页", nav_timeline: "足迹", nav_memory: "记忆墙",
    nav_capsule: "时光胶囊", nav_rank: "贡献榜", nav_about: "关于",
    lang_zh: "中", lang_ja: "日",
    kicker: "FAN MEMORIAL ARCHIVE · 2019 — 2026",
    hero_sub: "毕业不是终点，而是公主回到森林后，由我们共同续写的一场「后日谈」。",
    hero_meta2: "非官方后日谈纪念档案馆",
    cta_enter: "进入森林 · 看她的足迹",
    cta_write: "写一封信",
    cd_label: "下一个纪念日 · 毕业百日祭",
    cd_label2: "下一个纪念日 · 毕业一周年",
    cd_days: "天后，森林将亮起百日灯海",
    cd_days2: "天后，森林将迎来毕业一周年",
    st1: "七年足迹", st2: "森林旅人", st3: "名场面存档", st4: "森林来信",
    entries_title: "在森林里，你可以",
    ent_tl_t: "足迹时间轴", ent_tl_d: "从 2019 初配信到 2026 毕业，七年大事记与名场面。",
    ent_mw_t: "记忆墙", ent_mw_d: "写一封给森林的信，和大家一起说「辛苦音」。",
    ent_cp_t: "时光胶囊", ent_cp_d: "写信给未来的自己，在毕业一周年那天开启。",
    ent_rank_t: "贡献榜", ent_rank_d: "看看是谁在用记忆为森林添砖加瓦。",
    fw_title: "毕业公告 · 节选",
    fw_quote: "「由于长期过度用嗓、长期居家等原因，身体和心理都出现了一些不小的问题，医嘱需要长期休养。」",
    fw_note: "—— 2026 年 5 月 1 日 · 毕业公告（全文见 B 站动态）",
    tl_kicker: "ARCHIVE · 2019 — 2026",
    tl_title: "足迹时间轴",
    tl_desc: "从初配信到毕业，七年的森林足迹。内容整理自公开资料，如有遗漏欢迎投稿勘误。",
    year_all: "全部",
    tl_empty: "这一年森林里还没有存档的事件。记得什么的话，欢迎来投稿补全。",
    tl_cta: "看看是谁在为森林添砖加瓦 →",
    tl_view: "在 B 站查看 →",
    mw_kicker: "MEMORY WALL · LETTERS TO THE FOREST",
    mw_title: "记忆墙",
    mw_desc: "这里挂着旅人们写给森林的信。写下一句「辛苦音」，让白菜知道森林一直有人记得她。",
    mw_write: "写一封给森林的信",
    f_name: "昵称（可选）", f_tag: "信件标签", f_text: "想说的话",
    f_send: "寄出这封信", f_cancel: "再想想", f_note: "来信会先经过自动过滤与人工抽查，请温柔地写下每一句。",
    f_title: "标题", f_unlock: "开启时间", f_mail: "邮箱（可选，用于开启提醒）", f_link: "素材链接（可选）", f_type: "投稿类型",
    tag_miss: "思念", tag_thanks: "感谢", tag_bless: "祝福", tag_story: "故事", tag_other: "其他",
    tag_all: "全部", sort_new: "最新", sort_hot: "最热",
    pending: "审核中", demo: "演示",
    lights: "灯",
    mw_note: "原型中的来信为演示数据；正式上线后，留言需经审核才会展示。",
    ph_name: "匿名旅人", ph_text: "把想对白菜说的话写在这里……",
    cp_kicker: "TIME CAPSULE · A LETTER TO THE FUTURE",
    cp_title: "时光胶囊",
    cp_desc: "写给未来的一封信。把它埋在森林里，等到约定之日，再回来开启。",
    cp_form_t: "埋下一颗胶囊",
    cp_bury: "埋进森林",
    cp_note: "胶囊在开启前是私密的，森林承诺不会读取。开启后可选是否公开展示。",
    cp_guide_t: "约定与规则",
    cp_g1: "默认在 2027 年 5 月 1 日 · 毕业一周年时开启；",
    cp_g2: "未到开启时间，任何人都看不到信的内容；",
    cp_g3: "留下邮箱，开启当天森林会寄来提醒；",
    cp_g4: "开启后，你决定这封信是留在心里，还是挂上记忆墙。",
    cp_demo: "原型演示：胶囊存于本地浏览器，正式版将安全存储于服务器。",
    cp_list_t: "埋下的胶囊",
    opt_1y: "2027-05-01 · 毕业一周年",
    opt_3y: "2029-05-01 · 三年之约",
    opt_5y: "2031-05-01 · 五年之约",
    ph_title: "致未来的自己", ph_cp_text: "写下此刻想对未来的自己、或对森林说的话……", ph_mail: "you@example.com",
    cp_locked: "锁定", cp_unlocked: "已开启", cp_days_left: "还有", cp_days: "天开启",
    cp_buried: "埋藏于", cp_open: "开启于", cp_private: "私密胶囊：到约定之日，森林会提醒你回来开启。",
    cp_unlocked_note: "公开开启 · 以下是信的内容",
    rk_kicker: "CONTRIBUTORS · FOREST BUILDERS",
    rk_title: "贡献榜",
    rk_desc: "森林由许多人共同补全。以下是被采纳投稿最多的旅人——感谢你们，让记忆不再残缺。",
    rk_sub: "更多贡献者",
    rk_count: "篇",
    rk_note: "投稿入口将在正式版开放（需站长审核）；原型中的贡献数据为演示。",
    ab_kicker: "ABOUT THIS FOREST",
    ab_title: "关于本站",
    ab_notice_t: "重要声明",
    ab_notice_p1: "本站是粉丝自发建立的非官方纪念与档案馆，与真白花音本人及其所属机构无关。",
    ab_notice_p2: "我们尊重她因健康原因做出的毕业决定，不催更、不请愿、不打扰。愿她安心休养。",
    ab_who_t: "我们是谁",
    ab_who_p: "一群舍不得说再见、又希望好好道别的旅人。我们把 2019 到 2026 的足迹、梗与笑声收进这片森林，让后来的人也能认识这位温柔的白发公主。",
    ab_how_t: "我们如何维护",
    ab_how_p1: "本站由个人运营：留言自动过滤 + 人工抽查，投稿逐条人工审核。",
    ab_how_p2: "所有内容定期备份、可导出；即使某一天森林无人看守，也留有站务交接预案，让记忆不会失联。",
    ab_do_t: "你可以做什么",
    ab_do1: "在记忆墙留下一封信；", ab_do2: "埋下一颗时光胶囊，赴未来的约；",
    ab_do3: "把珍藏的素材投稿进档案；", ab_do4: "把森林分享给同样记得她的人。",
    ab_facts_t: "站点信息",
    ab_f1: "域名", ab_f2: "备案", ab_f2v: "备案号占位（已备案）",
    ab_f3: "语言", ab_f3v: "中文 · 日本語", ab_f4: "版本", ab_f4v: "原型 v0.5 · 演示数据",
    ab_demo: "本站所有展示数据均为原型演示内容，正式上线前将替换为经审核的真实内容。",
    ft_line1: "非官方粉丝纪念站 · 与真白花音本人及其运营方无关",
    ft_line2: "愿森林永远记得你",
    ft_meta: "© 2026 · 原型演示数据仅供预览 · 备案号占位",
    t_letter_ok: "来信已送达森林（演示：自动过滤通过）",
    t_capsule_ok: "胶囊已埋进森林，约定之日再见。",
    t_submit_ok: "投稿已收到，站长审核通过后会展示。",
    t_err_required: "请先写下想说的话。",
    t_err_cp: "请填写标题与信的内容。",
    t_err_sub: "请填写标题与内容描述。"
  },

  ja: {
    badge_official: "非公式ファンサイト",
    nav_home: "ホーム", nav_timeline: "軌跡", nav_memory: "メモリアル",
    nav_capsule: "タイムカプセル", nav_rank: "貢献ランキング", nav_about: "この森について",
    lang_zh: "中", lang_ja: "日",
    kicker: "ファンメモリアルアーカイブ · 2019 — 2026",
    hero_sub: "卒業は終わりではありません。王女が森へ帰ったあと、私たちが一緒に紡ぐ「アフターストーリー」です。",
    hero_meta2: "非公式アフターストーリー記念アーカイブ",
    cta_enter: "森へ入る · 彼女の軌跡を見る",
    cta_write: "手紙を書く",
    cd_label: "次の記念日 · 卒業百日祭",
    cd_label2: "次の記念日 · 卒業一周年",
    cd_days: "日後、森に百日の灯りが灯ります",
    cd_days2: "日後、森は卒業一周年を迎えます",
    st1: "7年間の軌跡", st2: "森の旅人", st3: "名場面アーカイブ", st4: "森への手紙",
    entries_title: "森の中で、あなたは",
    ent_tl_t: "軌跡タイムライン", ent_tl_d: "2019年初配信から2026年卒業まで、7年間の出来事と名場面。",
    ent_mw_t: "メモリアルウォール", ent_mw_d: "森への手紙を書いて、みんなで「おつかれさまでした」を。",
    ent_cp_t: "タイムカプセル", ent_cp_d: "未来の自分へ手紙を書き、卒業一周年の日に開けます。",
    ent_rank_t: "貢献ランキング", ent_rank_d: "記憶で森を紡いでくれた人たち。",
    fw_title: "卒業のお知らせ · 抜粋",
    fw_quote: "「長期間にわたる過度な声の使用や自宅での生活が続いたことなどから、心身ともにいくつかの問題が生じ、医師から長期の休養が必要と診断されました。」",
    fw_note: "—— 2026年5月1日 · 卒業のお知らせ（全文はBilibiliにて）",
    tl_kicker: "アーカイブ · 2019 — 2026",
    tl_title: "軌跡タイムライン",
    tl_desc: "初配信から卒業まで、7年間の森の軌跡。公開資料をもとに整理しています。",
    year_all: "すべて",
    tl_empty: "この年の記録はまだありません。何かご存知でしたら、投稿で補完をお願いします。",
    tl_cta: "森を紡いでくれた人たちを見る →",
    tl_view: "Bilibiliで見る →",
    mw_kicker: "メモリアルウォール · 森への手紙",
    mw_title: "メモリアルウォール",
    mw_desc: "ここには旅人たちが森に宛てた手紙が掛けられています。「おつかれさまでした」の一言を、どうぞ。",
    mw_write: "森への手紙を書く",
    f_name: "ニックネーム（任意）", f_tag: "手紙のタグ", f_text: "伝えたい言葉",
    f_send: "手紙を送る", f_cancel: "やめておく", f_note: "手紙は自動フィルターと人手の確認を経て公開されます。",
    f_title: "タイトル", f_unlock: "開封日", f_mail: "メール（任意・開封通知用）", f_link: "素材リンク（任意）", f_type: "投稿タイプ",
    tag_miss: "想い", tag_thanks: "感謝", tag_bless: "祝福", tag_story: "思い出", tag_other: "その他",
    tag_all: "すべて", sort_new: "新しい順", sort_hot: "人気順",
    pending: "確認中", demo: "デモ",
    lights: "灯",
    mw_note: "プロトタイプの手紙はデモデータです。正式版では審査後に公開されます。",
    ph_name: "匿名の旅人", ph_text: "かのんに伝えたいことをここに……",
    cp_kicker: "タイムカプセル · 未来への手紙",
    cp_title: "タイムカプセル",
    cp_desc: "未来の自分への手紙。森に埋めて、約束の日に開けに来てください。",
    cp_form_t: "カプセルを埋める",
    cp_bury: "森に埋める",
    cp_note: "開封前のカプセルは非公開です。森は内容を読みません。開封後、公開するか選べます。",
    cp_guide_t: "約束とルール",
    cp_g1: "デフォルトは2027年5月1日・卒業一周年に開封；",
    cp_g2: "開封日までは、誰も中身を見ることができません；",
    cp_g3: "メールを残すと、開封当日に森からお知らせが届きます；",
    cp_g4: "開封後、その手紙を心に留めるか、メモリアルウォールに掛けるかを選べます。",
    cp_demo: "デモ：カプセルはこのブラウザに保存されます。正式版ではサーバーに安全に保存されます。",
    cp_list_t: "埋めたカプセル",
    opt_1y: "2027-05-01 · 卒業一周年",
    opt_3y: "2029-05-01 · 三年の約束",
    opt_5y: "2031-05-01 · 五年の約束",
    ph_title: "未来の自分へ", ph_cp_text: "今の想いを、未来の自分や森に向けて……", ph_mail: "you@example.com",
    cp_locked: "封印中", cp_unlocked: "開封済み", cp_days_left: "あと", cp_days: "日で開封",
    cp_buried: "埋めた日", cp_open: "開封日", cp_private: "プライベートカプセル：約束の日に森がお知らせします。",
    cp_unlocked_note: "公開開封 · 以下が手紙の内容です",
    rk_kicker: "コントリビューター · 森を紡ぐ人々",
    rk_title: "貢献ランキング",
    rk_desc: "森は多くの人の記憶で紡がれています。採用された投稿が多い旅人たち——ありがとう、記憶は欠けません。",
    rk_sub: "その他の貢献者",
    rk_count: "件",
    rk_note: "投稿機能は正式版で公開予定（管理人審査あり）。現在はデモデータを表示中。",
    ab_kicker: "この森について",
    ab_title: "この森について",
    ab_notice_t: "重要なご案内",
    ab_notice_p1: "このサイトはファンが自主的に作った非公式の記念・アーカイブサイトで、真白花音本人および所属事務所とは関係ありません。",
    ab_notice_p2: "私たちは健康上の理由による卒業という決断を尊重します。復帰を求めず、お願いせず、邪魔しません。どうかゆっくり休んでください。",
    ab_who_t: "私たちは誰？",
    ab_who_p: "別れが名残惜しく、でもちゃんとお別れをしたい旅人の集まりです。2019年から2026年までの軌跡と笑い声をこの森に集め、後に来る人にも優しい白髪の王女を知ってもらいたいのです。",
    ab_how_t: "どのように運営するか",
    ab_how_p1: "個人運営：手紙は自動フィルター＋人手の確認、投稿は1件ずつ審査します。",
    ab_how_p2: "すべての内容は定期的にバックアップ・エクスポート可能。いつか森を守る人がいなくなっても、記憶が消えないよう引き継ぎの準備を残します。",
    ab_do_t: "あなたにできること",
    ab_do1: "メモリアルウォールに手紙を残す；", ab_do2: "タイムカプセルを埋めて未来の約束を；",
    ab_do3: "大切な素材をアーカイブに投稿する；", ab_do4: "彼女を覚えている人に森をシェアする。",
    ab_facts_t: "サイト情報",
    ab_f1: "ドメイン", ab_f2: "ICP届出", ab_f2v: "届出番号（仮）",
    ab_f3: "言語", ab_f3v: "中文 · 日本語", ab_f4: "バージョン", ab_f4v: "プロトタイプ v0.5 · デモデータ",
    ab_demo: "本サイトの表示データはすべてプロトタイプ用デモです。正式公開前に審査済みの内容へ差し替えます。",
    ft_line1: "非公式ファン記念サイト · 真白花音本人および運営とは無関係です",
    ft_line2: "森がいつまでもあなたを覚えていますように",
    ft_meta: "© 2026 · デモデータをプレビュー中 · 届出番号（仮）",
    t_letter_ok: "手紙が森に届きました（デモ：自動確認通過）",
    t_capsule_ok: "カプセルを森に埋めました。約束の日にまた会いましょう。",
    t_submit_ok: "投稿を受け付けました。確認後に掲載されます。",
    t_err_required: "伝えたい言葉を書いてください。",
    t_err_cp: "タイトルと手紙の内容を入力してください。",
    t_err_sub: "タイトルと内容を入力してください。"
  }
};

let lang = "zh";
const LS_LANG = "baiocai.lang";

function t(key) {
  return (I18N[lang] && I18N[lang][key]) || (I18N.zh[key] || key);
}

function applyI18n() {
  $$("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    const val = t(key);
    if (val) el.textContent = val;
  });
  $$("[data-i18n-ph]").forEach(el => {
    const val = t(el.dataset.i18nPh);
    if (val) el.placeholder = val;
  });
  document.documentElement.lang = lang === "ja" ? "ja" : "zh-CN";
  $$(".lang-btn").forEach(b => b.classList.toggle("is-active", b.dataset.langBtn === lang));
}

function setLang(next) {
  lang = next;
  try { localStorage.setItem(LS_LANG, lang); } catch (e) { /* ignore */ }
  applyI18n();
  renderHomeCountdown();   // 文案随语言变化
  renderCapsules();        // 胶囊状态文案
}

/* ---------------- 夜空 ---------------- */

function buildSky() {
  const stars = $("#stars");
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 90; i++) {
    const s = document.createElement("i");
    s.className = "star";
    const size = (Math.random() * 1.6 + 1).toFixed(2);
    s.style.cssText = [
      `left:${(Math.random() * 100).toFixed(2)}%`,
      `top:${(Math.random() * 100).toFixed(2)}%`,
      `width:${size}px;height:${size}px`,
      `--o:${(Math.random() * 0.6 + 0.25).toFixed(2)}`,
      `--td:${(Math.random() * 5 + 2.5).toFixed(1)}s`,
      `--tdelay:${(Math.random() * 6).toFixed(1)}s`
    ].join(";");
    frag.appendChild(s);
  }
  stars.appendChild(frag);

  const flies = $("#fireflies");
  for (let i = 0; i < 9; i++) {
    const f = document.createElement("i");
    f.className = "firefly";
    const tx = (Math.random() * 120 - 60).toFixed(0);
    const ty = (-(Math.random() * 110 + 50)).toFixed(0);
    f.style.cssText = [
      `left:${(Math.random() * 100).toFixed(2)}%`,
      `top:${(Math.random() * 90 + 5).toFixed(2)}%`,
      `--tx:${tx}px`,
      `--ty:${ty}px`,
      `--dur:${(Math.random() * 7 + 8).toFixed(1)}s`,
      `--fd:${(Math.random() * 9).toFixed(1)}s`
    ].join(";");
    flies.appendChild(f);
  }
}

/* ---------------- 路由 ---------------- */

const PAGE_NAMES = ["home", "timeline", "memory", "capsule", "rank", "about"];

function currentPage() {
  const h = (location.hash || "#/home").replace(/^#\//, "");
  return PAGE_NAMES.includes(h) ? h : "home";
}

function showPage(name) {
  $$(".page").forEach(p => {
    const active = p.dataset.page === name;
    p.hidden = !active;
    p.classList.toggle("is-active", active);
  });
  $$(".site-nav a").forEach(a => a.classList.toggle("is-active", a.dataset.nav === name));
  window.scrollTo({ top: 0 });

  // 触发入场动画
  requestAnimationFrame(() => {
    setTimeout(() => {
      $$(`.page[data-page="${name}"] .reveal`).forEach(el => el.classList.add("is-visible"));
    }, 30);
  });
}

/* ---------------- Toast ---------------- */

let toastTimer = null;
function toast(msg, isErr = false) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.toggle("is-err", isErr);
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
}

/* ---------------- 首页倒计时 ---------------- */

const D_BAI = new Date("2026-08-09T00:00:00");
const D_ONE = new Date("2027-05-01T00:00:00");

function renderHomeCountdown() {
  const now = new Date();
  const target = now < D_BAI ? D_BAI : D_ONE;
  const label = now < D_BAI ? t("cd_label") : t("cd_label2");
  const suffix = now < D_BAI ? t("cd_days") : t("cd_days2");
  const days = Math.max(0, Math.ceil((target - now) / 86400000));
  const labelEl = $(".countdown-label");
  if (labelEl) labelEl.textContent = label;
  const numEl = $("[data-days]");
  if (numEl) numEl.textContent = days;
  const daysEl = $(".countdown-days span");
  if (daysEl) daysEl.textContent = suffix;
}

/* ---------------- 时间轴 ---------------- */

const EVENTS = [
  { y: "2019", d: "04.30", t: "初配信", zh: "以「高等精灵公主」身份初次配信，自称清楚系 Vtuber，开始了七年的森林之旅。", ja: "「ハイエルフの王女」として初配信。清楚系VTuberを自称し、7年間の旅が始まりました。", tags: ["里程碑"], featured: false },
  { y: "2019", d: "05.14", t: "断手事件 ①", zh: "直播中模仿神乐めあ的迷惑行为，惨遭「断手」。森林的第一个名场面诞生。", ja: "配信中の神楽めあへのおふざけで「手を折られる」事件。最初の名場面が生まれました。", tags: ["名场面"], featured: false },
  { y: "2020", d: "12.07", t: "复活直播", zh: "断手后「复活」直播，二度跳脸帕里，手再次被打断（笑）。", ja: "復活配信で再びパリィを挑発し、また手を折られる（笑）。", tags: ["名场面"], featured: false },
  { y: "2020", d: "12.15", t: "外部装甲", zh: "在帕里处追加「外部装甲」，获得新手臂，迎来机甲改造（?）。", ja: "パリィの手で「外部装甲」を装着し、新しい腕を手に入れました。", tags: ["形象"], featured: false },
  { y: "2020", d: "12.20", t: "僵尸化", zh: "再度跳脸帕里被打成僵尸；两天后贴着符纸出场，喜剧效果拉满。", ja: "またもやゾンビ化され、2日後にはお札を貼って登場。伝説のコントでした。", tags: ["名场面"], featured: false },
  { y: "2021", d: "05.29", t: "生日洋装 · 紫甘蓝", zh: "生日直播公开洋装形象，整体色调偏紫，被戏称「紫甘蓝」；手部动作被封印。", ja: "誕生日配信でドレス姿を公開。紫寄りの配色から「紫キャベツ」と愛称されました。", tags: ["形象", "生日"], featured: false },
  { y: "2021", d: "10.04", t: "中式女仆偶像装", zh: "12 万粉纪念回公开中式女仆风偶像形象——猫耳、猫尾、女仆头饰，还有传统艺能的双手动作。", ja: "12万人記念配信で中華メイド風アイドル衣装を公開。猫耳と猫しっぽが可愛い。", tags: ["形象", "里程碑"], featured: false },
  { y: "2021", d: "12.15", t: "短发新造型", zh: "形象更新，追加短发造型。", ja: "ショートヘアの新スタイルを追加。", tags: ["形象"], featured: false },
  { y: "2022", d: "02.02", t: "新年和服", zh: "正月初二公开新年和服形象，脸部可动大幅提升，表情更丰富了。", ja: "新春に着物姿を公開。顔の可動域が大幅に向上し、表情豊かになりました。", tags: ["形象"], featured: false },
  { y: "2022", d: "05.29", t: "生日新形象", zh: "生日直播公开新形象：更精致的画风与丰富表情，并新增了宠物伙伴。", ja: "誕生日配信で新衣装を公開。より精緻な絵柄と豊富な表情、ペットも登場。", tags: ["形象", "生日"], featured: false },
  { y: "2022", d: "11.13", t: "3D 发布会", zh: "3D 发布会公开 3D 形象（2021 BLS 外 V 分区冠军奖品，模型制作者 uron）。", ja: "3Dお披露目配信。2021年BLS外V部門優勝特典の3Dモデル（モデラー：uron氏）。", tags: ["里程碑"], featured: false },
  { y: "2022", d: "12.31", t: "年度巅峰主播", zh: "获 Bilibili 2022 年度巅峰主播认证；虚拟 UP 主年终盛典年度第三。", ja: "Bilibili 2022年度トップ配信者に認定。VTuber年末祭典では年間3位に。", tags: ["荣誉"], featured: false },
  { y: "2025", d: "10.12", t: "上海音乐节首唱", zh: "登上 2025 上海「热爱次元」音乐节舞台，首唱《燃烧攻击》与《future》（《排球女将》《网球王子》主题曲）。", ja: "2025上海の音楽フェスに出演。『燃えるアタック』『future』を初歌唱。", tags: ["舞台"], featured: false },
  { y: "2026", d: "05.01", t: "毕业", zh: "因身心长期负荷，经医嘱需长期休养，正式终止全部活动。毕业不是终点——森林会一直记得你。", ja: "心身の負担が大きく、医師の指示で長期休養のため全活動を終了。卒業は終わりではありません——森はいつまでもあなたを覚えています。", tags: ["里程碑", "毕业"], featured: true }
];

function renderTimeline(year) {
  const box = $("#timeline");
  const list = year === "all" ? EVENTS : EVENTS.filter(e => e.y === year);
  if (!list.length) {
    box.innerHTML = `<div class="tl-empty card reveal is-visible">${t("tl_empty")} <a href="#/rank">→</a></div>`;
    return;
  }
  const years = [...new Set(list.map(e => e.y))];
  box.innerHTML = years.map(y => {
    const items = list.filter(e => e.y === y);
    const inner = items.map((e, i) => `
      <article class="tl-item${e.featured ? " is-featured" : ""}" style="--d:${(i * 0.06).toFixed(2)}s">
        <span class="tl-node" aria-hidden="true"></span>
        <time class="tl-date">${y}.${e.d}</time>
        <div class="tl-card">
          <h3>${escapeHtml(e.t)}</h3>
          <p>${escapeHtml(e.zh)}</p>
          <div class="tl-foot">
            <div class="tl-tags">${e.tags.map(tag => `<span class="tag${e.featured ? " tag-amber" : ""}">${tag}</span>`).join("")}</div>
            <a class="tl-link" href="https://search.bilibili.com/all?keyword=${encodeURIComponent("真白花音 " + e.t)}" target="_blank" rel="noopener">${t("tl_view")}</a>
          </div>
        </div>
      </article>`).join("");
    return `<h4 class="tl-year">${y}</h4>${inner}`;
  }).join("");
}

/* ---------------- 记忆墙 ---------------- */

const DEMO_LETTERS = [
  { id: "d1", tag: "感谢", text: "辛苦了，白菜。从 2019 到 2026，谢谢你带来那么多温柔的夜晚。愿你好好休息，森林永远有你的位置。", sign: "匿名旅人", date: "2026-05-03", lights: 128, demo: true, pending: false },
  { id: "d2", tag: "思念", text: "第一次听你唱《future》就入坑了。BML 的梦想没能实现也没关系，你早就是我们心里最亮的星。", sign: "一颗小星星", date: "2026-05-03", lights: 96, demo: true, pending: false },
  { id: "d3", tag: "故事", text: "2022 年的夏天，是你的直播陪我熬过最难的日子。辛苦音，永远是辛苦音。", sign: "深夜党", date: "2026-05-02", lights: 87, demo: true, pending: false },
  { id: "d4", tag: "祝福", text: "断手梗、紫甘蓝、中式女仆……每一个形象都好好看。谢谢你一直做自己。", sign: "匿名旅人", date: "2026-05-02", lights: 64, demo: true, pending: false },
  { id: "d5", tag: "思念", text: "我是毕业后才认识你的新粉。补档的时候哭了好几次——原来世界上真的有这么温柔的公主。", sign: "迟到的旅人", date: "2026-05-01", lights: 52, demo: true, pending: false },
  { id: "d6", tag: "感谢", text: "「辛苦音」会一直留在森林里。等 2031 年再打开我埋下的那封信，我想我已经成了更好的人。", sign: "守林人", date: "2026-05-01", lights: 41, demo: true, pending: false },
  { id: "d7", tag: "故事", text: "深夜的歌回、凌晨的杂谈，还有每次说再见时那句温柔的「辛苦音」。谢谢你陪我度过每一个睡不着觉的夜晚。", sign: "失眠星人", date: "2026-05-01", lights: 33, demo: true, pending: true }
];

const LS_LETTERS = "baiocai.letters";
let letters = [];
let wallTag = "all";
let wallSort = "new";

function loadLetters() {
  letters = [...DEMO_LETTERS];
  try {
    const saved = JSON.parse(localStorage.getItem(LS_LETTERS) || "[]");
    letters = saved.concat(letters);
  } catch (e) { /* ignore */ }
}

function saveLetters() {
  const user = letters.filter(l => !l.demo);
  try { localStorage.setItem(LS_LETTERS, JSON.stringify(user)); } catch (e) { /* ignore */ }
}

function renderWall() {
  const box = $("#wall");
  let list = letters.filter(l => wallTag === "all" || l.tag === wallTag);
  if (wallSort === "hot") list = [...list].sort((a, b) => b.lights - a.lights);
  else list = [...list].sort((a, b) => (a.date < b.date ? 1 : -1));

  box.innerHTML = list.map((l, i) => `
    <article class="letter reveal is-visible" style="--d:${Math.min(i * 0.05, 0.4).toFixed(2)}s">
      <div class="letter-head">
        <span class="letter-tag${l.demo && !l.pending ? " plain" : ""}">${escapeHtml(l.tag)}${l.demo ? " · " + t("demo") : ""}</span>
        ${l.pending ? `<span class="letter-pending">${t("pending")}</span>` : ""}
      </div>
      <p class="letter-text">${escapeHtml(l.text)}</p>
      <footer class="letter-foot">
        <span class="letter-sign">${escapeHtml(l.sign || t("ph_name"))}<time>${l.date}</time></span>
        <button class="light-btn" data-light="${l.id}" aria-label="${t("lights")}">${LIGHT_SVG}<b>${l.lights}</b></button>
      </footer>
    </article>`).join("");
}

const LIGHT_SVG = `<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><path d="M12 3c2.8 3 4.6 6 4.6 8.8 0 3-2 5.4-4.6 5.4s-4.6-2.4-4.6-5.4C7.4 9 9.2 6 12 3Z"/><path d="M12 17.2v3.8M9 21h6"/></svg>`;

/* ---------------- 时光胶囊 ---------------- */

const DEMO_CAPSULES = [
  { title: "致一年后的自己", buried: "2026-05-01", unlock: "2027-05-01", public: true, content: "一年后的我，你还好吗？希望你已经学会了好好睡觉，也记得偶尔抬头看看月亮。", demo: true },
  { title: "给 2031 年的森林", buried: "2026-05-01", unlock: "2031-05-01", public: false, content: "", demo: true }
];

const LS_CAPSULES = "baiocai.capsules";
let capsules = [];

function loadCapsules() {
  capsules = [...DEMO_CAPSULES];
  try {
    const saved = JSON.parse(localStorage.getItem(LS_CAPSULES) || "[]");
    capsules = saved.concat(capsules);
  } catch (e) { /* ignore */ }
}

function saveCapsules() {
  const user = capsules.filter(c => !c.demo);
  try { localStorage.setItem(LS_CAPSULES, JSON.stringify(user)); } catch (e) { /* ignore */ }
}

function daysUntil(dateStr) {
  const diff = new Date(dateStr + "T00:00:00") - new Date();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function renderCapsules() {
  const box = $("#capsules");
  box.innerHTML = capsules.map((c, i) => {
    const unlocked = daysUntil(c.unlock) === 0;
    if (unlocked) {
      return `
      <article class="capsule is-unlocked reveal is-visible">
        <div class="capsule-top">
          <span class="capsule-status">${t("cp_unlocked")}</span>
          <time class="capsule-unlock-time">${c.unlock}</time>
        </div>
        <h3>${escapeHtml(c.title)}</h3>
        <p class="capsule-when">${t("cp_buried")} · ${c.buried}</p>
        ${c.public && c.content
          ? `<p class="capsule-note">${t("cp_unlocked_note")}</p><p class="capsule-body">${escapeHtml(c.content)}</p>`
          : `<p class="capsule-body">${t("cp_private")}</p>`}
      </article>`;
    }
    return `
    <article class="capsule is-locked reveal is-visible" style="--d:${Math.min(i * 0.06, 0.3).toFixed(2)}s">
      <div class="capsule-top">
        <span class="capsule-status">${t("cp_locked")}</span>
        <time class="capsule-unlock-time">${t("cp_open")} · ${c.unlock}</time>
      </div>
      <h3>${escapeHtml(c.title)}</h3>
      <p class="capsule-when">${t("cp_buried")} · ${c.buried}</p>
      <p class="capsule-countdown"><span class="lock-ic">${LOCK_SVG}</span>${t("cp_days_left")} <b class="days-num">${daysUntil(c.unlock)}</b> ${t("cp_days")}</p>
    </article>`;
  }).join("");
}

const LOCK_SVG = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 10V8a6 6 0 0 1 12 0v2"/><rect x="4.5" y="10" width="15" height="10" rx="2"/><path d="M12 13.5v3.2"/></svg>`;

/* ---------------- 贡献榜 ---------------- */

const RANK = [
  { name: "守林人 · 小K", count: 8 },
  { name: "白菜考古队", count: 5 },
  { name: "深夜听众 A", count: 3 },
  { name: "补档新人", count: 2 },
  { name: "切片收藏家", count: 2 },
  { name: "匿名旅人", count: 1 }
];

function renderRank() {
  const podium = $("#podium");
  const order = [1, 0, 2]; // 视觉顺序：亚军 · 冠军 · 季军
  podium.innerHTML = order.map(i => {
    const r = RANK[i];
    const place = i + 1;
    return `
    <div class="podium-item place-${place}">
      <span class="podium-rank">0${place}</span>
      <span class="podium-name">${escapeHtml(r.name)}</span>
      <span class="podium-count">${r.count} ${t("rk_count")}</span>
    </div>`;
  }).join("");

  const list = $("#rank-list");
  list.innerHTML = RANK.slice(3).map((r, i) => `
    <div class="rank-row">
      <span class="rank-no">${String(i + 4).padStart(2, "0")}</span>
      <span class="rank-name">${escapeHtml(r.name)}</span>
      <span class="rank-count">${r.count} ${t("rk_count")}</span>
    </div>`).join("");
}

/* ---------------- 工具 ---------------- */

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/* ---------------- 事件绑定 ---------------- */

function bindEvents() {
  // 语言切换
  $$(".lang-btn").forEach(btn => btn.addEventListener("click", () => setLang(btn.dataset.langBtn)));

  // 时间轴年份筛选
  $$(".filter-chips [data-year]").forEach(chip => {
    chip.addEventListener("click", () => {
      $$(".filter-chips [data-year]").forEach(c => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      renderTimeline(chip.dataset.year);
    });
  });

  // 记忆墙：写信用表单
  const writeToggle = $("#write-toggle");
  const letterForm = $("#letter-form");
  writeToggle.addEventListener("click", () => {
    const willShow = letterForm.hidden;
    letterForm.hidden = !willShow;
    writeToggle.textContent = willShow ? t("mw_write") : t("f_cancel");
    writeToggle.classList.toggle("btn-ghost", willShow);
    writeToggle.classList.toggle("btn-primary", !willShow);
  });
  $$(".write-cancel").forEach(b => b.addEventListener("click", () => {
    letterForm.hidden = true;
    writeToggle.textContent = t("mw_write");
    writeToggle.classList.remove("btn-ghost");
    writeToggle.classList.add("btn-primary");
  }));

  letterForm.addEventListener("submit", e => {
    e.preventDefault();
    const text = $("#letter-text").value.trim();
    if (!text) { toast(t("t_err_required"), true); return; }
    letters.unshift({
      id: "u" + Date.now(),
      tag: $("#letter-tag").value,
      text,
      sign: $("#letter-name").value.trim() || "",
      date: todayStr(),
      lights: 1,
      demo: false,
      pending: true
    });
    saveLetters();
    renderWall();
    letterForm.reset();
    $("#char-count").textContent = "0";
    $("#letter-text").dispatchEvent(new Event("input"));
    letterForm.hidden = true;
    writeToggle.textContent = t("mw_write");
    writeToggle.classList.remove("btn-ghost");
    writeToggle.classList.add("btn-primary");
    toast(t("t_letter_ok"));
  });

  // 记忆墙：字数统计
  $("#letter-text").addEventListener("input", e => {
    $("#char-count").textContent = e.target.value.length;
  });

  // 记忆墙：标签 / 排序 / 点亮
  document.addEventListener("click", e => {
    const tagChip = e.target.closest("[data-wtag]");
    if (tagChip) {
      $$("[data-wtag]").forEach(c => c.classList.remove("is-active"));
      tagChip.classList.add("is-active");
      wallTag = tagChip.dataset.wtag;
      renderWall();
      return;
    }
    const sortBtn = e.target.closest("[data-sort]");
    if (sortBtn) {
      $$("[data-sort]").forEach(c => c.classList.remove("is-active"));
      sortBtn.classList.add("is-active");
      wallSort = sortBtn.dataset.sort;
      renderWall();
      return;
    }
    const light = e.target.closest("[data-light]");
    if (light) {
      const id = light.dataset.light;
      const letter = letters.find(l => l.id === id);
      if (!letter) return;
      const isLit = light.classList.toggle("is-lit");
      letter.lights += isLit ? 1 : -1;
      $("b", light).textContent = letter.lights;
    }
  });

  // 时光胶囊表单
  $("#capsule-form").addEventListener("submit", e => {
    e.preventDefault();
    const title = $("#cp-title").value.trim();
    const text = $("#cp-text").value.trim();
    if (!title || !text) { toast(t("t_err_cp"), true); return; }
    capsules.unshift({
      title,
      buried: todayStr(),
      unlock: $("#cp-unlock").value,
      public: false,
      content: text,
      demo: false
    });
    saveCapsules();
    renderCapsules();
    e.target.reset();
    toast(t("t_capsule_ok"));
  });
}

/* ---------------- 启动 ---------------- */

function init() {
  try { lang = localStorage.getItem(LS_LANG) || "zh"; } catch (e) { /* ignore */ }
  buildSky();
  loadLetters();
  loadCapsules();

  applyI18n();
  renderHomeCountdown();
  renderTimeline("all");
  renderWall();
  renderCapsules();
  renderRank();
  bindEvents();

  // 路由
  const navigate = () => showPage(currentPage());
  window.addEventListener("hashchange", navigate);
  if (!location.hash) history.replaceState(null, "", "#/home");
  navigate();

  // 兜底：激活当前页面的 reveal
  setTimeout(() => {
    $$(`.page[data-page="${currentPage()}"] .reveal`).forEach(el => el.classList.add("is-visible"));
  }, 80);
}

document.addEventListener("DOMContentLoaded", init);
