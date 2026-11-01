import { esc } from "../lib/util.mjs";
import { icon } from "../lib/icons.mjs";
import { pageHero, crumbsLd, crumbs, sectionHead, productCard, addQuoteButton, img, brandMark, assurance, ctaBand, discOf, divOf, brandOf, eyebrow, postCard, techCount, productHeroSet } from "../lib/components.mjs";

const homeCrumb = (c) => ({ name: c.t("Home", "الرئيسية"), href: c.u("/") });
const productsCrumb = (c) => ({ name: c.t("Products", "المنتجات"), href: c.u("/products/") });

export function catalog(c) {
  const { products, taxonomy, brands } = c.data;
  const crumbsItems = [homeCrumb(c), productsCrumb(c)];
  const n = (fn) => products.filter(fn).length;
  const facets = taxonomy.divisions.map((d) => {
    const subs = d.disciplines.map((id) => `<button class="facet facet--sub" type="button" data-facet="discipline" data-value="${id}" aria-pressed="false"><span>${esc(c.tx(discOf(c, id)).name)}</span><span class="count">${n((p) => p.discipline === id)}</span></button>`).join("");
    return `<button class="facet" type="button" data-facet="division" data-value="${d.id}" aria-pressed="false"><span>${esc(c.tx(d).name)} <span class="muted">(${d.code})</span></span><span class="count">${n((p) => p.division === d.id)}</span></button>${d.disciplines.length > 1 ? subs : ""}`;
  }).join("");
  const brandOptions = [...brands].sort((a, b) => a.name.localeCompare(b.name)).map((b) => `<option value="${b.slug}">${esc(b.name)}</option>`).join("");
  const ordered = [...products].sort((a, b) => a.order - b.order);
  const main = `${pageHero(c, {
    crumbsItems,
    eyebrowText: c.t("Product catalogue", "دليل المنتجات"),
    title: c.t("Products & technologies", "المنتجات والتقنيات"),
    lede: c.t("Explore the diagnostic platforms, assays, medical devices and research tools we supply and support across Saudi Arabia. Add items to your quote list and request one consolidated quotation.", "استكشف المنصات التشخيصية والاختبارات والأجهزة الطبية والأدوات البحثية التي نوفرها وندعمها في أنحاء المملكة. أضف المنتجات إلى قائمة عرض السعر واطلب عرض سعر موحدًا."),
    extra: `<div class="disc-nav">${taxonomy.divisions.map((d) => `<a href="${c.u(`/solutions/${d.slug}`)}">${esc(c.tx(d).name)} <span class="count">${n((p) => p.division === d.id)}</span></a>`).join("")}</div>`,
  })}
<section class="section section--tight">
  <div class="container catalog" data-catalog>
    <aside class="filters" data-filters aria-label="${c.t("Filters", "عوامل التصفية")}">
      <div class="filters__group">
        <label class="filters__label" for="q">${c.t("Search", "بحث")}</label>
        <div class="search">${icon("search")}<input id="q" type="search" placeholder="${esc(c.t("Product, brand or test…", "منتج أو علامة أو فحص…"))}" data-filter-search autocomplete="off"></div>
      </div>
      <div class="filters__group" role="group" aria-label="${c.t("Division and discipline", "القسم والتخصص")}">
        <span class="filters__label">${c.t("Division", "القسم")}</span>
        <button class="facet" type="button" data-facet="all" aria-pressed="true"><span>${c.t("All technologies", "جميع التقنيات")}</span><span class="count">${products.length}</span></button>
        ${facets}
      </div>
      <div class="filters__group">
        <label class="filters__label" for="brand">${c.t("Brand", "العلامة التجارية")}</label>
        <select class="select" id="brand" data-filter-brand><option value="">${c.t("All brands", "جميع العلامات")}</option>${brandOptions}</select>
      </div>
    </aside>
    <div>
      <div class="catalog__bar">
        <span class="catalog__count" data-catalog-count aria-live="polite">${c.t(`Showing ${products.length} of ${products.length}`, `عرض ${products.length} من ${products.length}`)}</span>
        <button class="btn btn--ghost btn--sm filter-toggle" type="button" data-filter-toggle aria-expanded="false">${icon("sliders")} ${c.t("Filters", "التصفية")}</button>
      </div>
      <div class="product-grid" data-catalog-grid>${ordered.map((p) => productCard(c, p, { headingLevel: 2 })).join("")}</div>
      <div class="catalog__empty" data-catalog-empty><p><strong>${c.t("No products match these filters.", "لا توجد منتجات مطابقة لعوامل التصفية.")}</strong></p><p class="muted" style="margin-top:6px">${c.t("Try another search term or clear the filters. Not every product we supply is listed — our team can help.", "جرّب كلمة بحث أخرى أو امسح عوامل التصفية. لا تظهر هنا جميع المنتجات التي نوردها، ويسعد فريقنا بمساعدتك.")}</p><p class="mt-l" style="margin-top:12px"><button class="btn btn--ghost btn--sm" type="button" data-filter-reset>${c.t("Clear filters", "مسح عوامل التصفية")}</button></p></div>
    </div>
  </div>
</section>
<section class="section section--tight">
  <div class="container">
    ${ctaBand(c, {
      title: c.t("Can't find what you need?", "لم تجد ما تبحث عنه؟"),
      text: c.t(`We work with ${c.data.site.stats.brands} global diagnostic brands — not every product is listed here. Tell us what you're looking for and we'll find the right solution.`, `نتعاون مع أكثر من ${c.data.site.stats.brands.replace("+", "")} علامة تشخيصية عالمية، ولا تظهر جميع المنتجات هنا. أخبرنا بما تبحث عنه وسنجد لك الحل المناسب.`),
      primary: { href: c.u("/contact"), label: c.t("Ask our team", "اسأل فريقنا") },
      secondary: { href: c.u("/quote"), label: c.t("Request a quotation", "اطلب عرض سعر") },
    })}
  </div>
</section>`;
  return {
    path: "/products/",
    nav: "products",
    title: c.t("Products & Technologies | IVD, Medical Devices & RUO | BSM Saudi Arabia", "المنتجات والتقنيات | التشخيص المخبري والأجهزة الطبية ومنتجات الاستخدام البحثي | BSM السعودية"),
    description: c.t("Browse IVD analysers, PCR and molecular assays, digital pathology, point-of-care testing, respiratory and wound-care devices and research tools supplied by Binary System Medical in Saudi Arabia.", "تصفّح أجهزة التحليل للتشخيص المخبري، واختبارات PCR والاختبارات الجزيئية، وعلم الأمراض الرقمي، وفحوصات نقطة الرعاية، وأجهزة الرعاية التنفسية والعناية بالجروح، والأدوات البحثية التي توفرها باينري سيستم الطبية في المملكة."),
    jsonld: [crumbsLd(c, crumbsItems)],
    main,
  };
}

export function division(c, d) {
  const { products, insights } = c.data;
  const t = c.tx(d);
  const crumbsItems = [homeCrumb(c), productsCrumb(c), { name: t.name, href: c.u(`/solutions/${d.slug}`) }];
  const sections = d.disciplines.map((id, i) => {
    const disc = discOf(c, id);
    const ps = products.filter((p) => p.discipline === id).sort((a, b) => a.order - b.order);
    return `<section class="disc" id="${id}">
      <div class="container">
        <div class="disc__head">
          <div>${eyebrow(String.fromCharCode(65 + i), `${d.code} · ${techCount(c, ps.length)}`)}<h2 class="h2">${esc(c.tx(disc).name)}</h2></div>
          <p>${esc(c.tx(disc).intro)}</p>
        </div>
        <div class="product-grid reveal-stagger">${ps.map((p) => productCard(c, p)).join("")}</div>
      </div>
    </section>`;
  }).join("");
  const related = insights.filter((p) => products.some((x) => x.division === d.id && p.related.includes(x.slug)));
  const main = `${pageHero(c, {
    crumbsItems,
    eyebrowText: `${d.code} · ${c.t("Solutions", "الحلول")}`,
    title: `${esc(t.name)} <span class="accent">(${d.code})</span>`,
    lede: esc(t.intro),
    extra: d.disciplines.length > 1 ? `<nav class="disc-nav" aria-label="${c.t("Disciplines", "التخصصات")}">${d.disciplines.map((id) => `<a href="#${id}">${esc(c.tx(discOf(c, id)).name)} <span class="count">${products.filter((p) => p.discipline === id).length}</span></a>`).join("")}</nav>` : "",
  })}
${sections}
<section class="section section--tint section--line">
  <div class="container">
    ${sectionHead({ coord: "", eyebrowText: c.t("Beyond supply", "أكثر من مجرد توريد"), title: c.t("Every system comes with a team behind it.", "خلف كل نظام فريق يدعمه.") })}
    ${assurance(c)}
    ${related.length ? `<div class="mt-l">${sectionHead({ eyebrowText: c.t("Related insights", "مقالات ذات صلة"), title: c.t("Further reading", "قراءات إضافية") })}<div class="post-grid post-grid--all">${related.slice(0, 3).map((p) => postCard(c, p)).join("")}</div></div>` : ""}
  </div>
</section>
<section class="section section--tight">
  <div class="container">
    ${ctaBand(c, {
      title: c.t(`Planning a ${t.short} project?`, `هل تخطط لمشروع في ${t.name}؟`),
      text: c.t("Share your requirements and we'll recommend the right configuration — and prepare a quotation.", "شاركنا متطلباتك وسنقترح الإعداد المناسب ونجهز لك عرض سعر."),
      primary: { href: c.u("/quote"), label: c.t("Request a quotation", "اطلب عرض سعر") },
      secondary: { href: c.u("/contact"), label: c.t("Talk to a specialist", "تحدث إلى أحد المختصين") },
    })}
  </div>
</section>`;
  return {
    path: `/solutions/${d.slug}`,
    nav: "solutions",
    title: c.t(`${t.name} (${d.code}) Solutions in Saudi Arabia | BSM`, `حلول ${t.name} (${d.code}) في السعودية | BSM`),
    description: t.meta,
    jsonld: [crumbsLd(c, crumbsItems)],
    main,
  };
}

export function product(c, p) {
  const { products, insights } = c.data;
  const t = c.tx(p);
  const b = brandOf(c, p.brand);
  const disc = discOf(c, p.discipline);
  const d = divOf(c, p.division);
  const crumbsItems = [homeCrumb(c), productsCrumb(c), { name: c.tx(d).name, href: c.u(`/solutions/${d.slug}`) }, { name: t.name, href: c.u(`/products/${p.slug}`) }];
  const related = products.filter((x) => x.slug !== p.slug && (x.discipline === p.discipline || x.brand === p.brand)).slice(0, 4);
  const more = related.length < 4 ? products.filter((x) => x.slug !== p.slug && x.division === p.division && !related.includes(x)).slice(0, 4 - related.length) : [];
  const shown = [...related, ...more];
  const sameDiscipline = shown.every((x) => x.discipline === p.discipline);
  const articles = insights.filter((i) => i.related.includes(p.slug));
  const highlights = (t.highlights || []).map((h, i) => `<li><span class="mono">${String(i + 1).padStart(2, "0")}</span><span>${esc(h)}</span></li>`).join("");
  const main = `<section class="pd-hero">
  <div class="container">
    ${crumbs(c, crumbsItems)}
    <div class="pd">
      <div class="pd__frame${p.fit === "cover" ? " is-cover" : ""}">${img(`/images/products/${p.slug}.webp`, `${t.name} — ${b.name}`, { lazy: false, priority: true, srcset: productHeroSet(p.slug), sizes: "(max-width: 900px) 92vw, 640px" })}<span class="pd__frame-label">${d.code} · ${esc(c.tx(disc).short || c.tx(disc).name)}</span></div>
      <div>
        <div class="pd__brand">${b.logo ? img(`/images/partners/${b.logo}`, b.name) : ""}<span class="pd__brand-name">${esc(b.name)}</span></div>
        <h1>${esc(t.name)}</h1>
        <p class="pd__summary">${esc(t.summary)}</p>
        <div class="pd__chips"><a class="chip" href="${c.u(`/solutions/${d.slug}`)}#${disc.id}">${esc(c.tx(disc).name)}</a>${(t.applications || []).map((a) => `<span class="chip chip--plain">${esc(a)}</span>`).join("")}</div>
        <div class="pd__actions">
          <a class="btn" href="${c.u("/quote")}?add=${p.slug}" data-quote-now="${p.slug}">${c.t("Request a quotation", "اطلب عرض سعر")} ${icon("arrow")}</a>
          ${addQuoteButton(c, p, true)}
        </div>
        <p class="pd__note">${icon("shield")}${c.t("Supplied and supported in Saudi Arabia by BSM.", "توريد ودعم في المملكة العربية السعودية من خلال BSM.")}</p>
      </div>
    </div>
  </div>
  <div class="pd-bar" data-pd-bar inert>
    <span class="pd-bar__name">${esc(t.name)}</span>
    ${addQuoteButton(c, p).replace('class="add-quote"', 'class="add-quote add-quote--icon"')}
    <a class="btn btn--sm" href="${c.u("/quote")}?add=${p.slug}" data-quote-now="${p.slug}">${c.t("Request a quotation", "اطلب عرض سعر")}</a>
  </div>
</section>
<section class="section">
  <div class="container spec">
    <div>
      ${eyebrow("A", c.t("Overview", "نظرة عامة"))}
      <h2 class="h3" style="margin-bottom:18px">${c.t(`About ${esc(t.name)}`, `عن ${esc(t.name)}`)}</h2>
      <div class="prose">${(t.body || [t.summary]).map((para) => `<p>${esc(para)}</p>`).join("")}</div>
      ${t.tests ? `<h3 style="margin:28px 0 12px;font-size:1.05rem">${c.t("Test menu & applications", "قائمة الفحوصات والتطبيقات")}</h3><div class="tag-cloud">${t.tests.map((x) => `<span class="chip chip--plain">${esc(x)}</span>`).join("")}</div>` : ""}
    </div>
    <div>
      ${highlights ? `${eyebrow("B", c.t("Key highlights", "أبرز المزايا"))}<ul class="spec__list">${highlights}</ul>
      <p class="spec__note">${icon("info")}<span>${c.t("Summarised from manufacturer information. Configurations, test menus and regulatory status vary by market — contact BSM to confirm SFDA registration and availability for your requirements.", "ملخّص من معلومات الشركة المصنّعة. تختلف الإعدادات وقوائم الفحوصات والحالة التنظيمية من سوق لآخر — تواصل مع BSM لتأكيد التسجيل لدى الهيئة العامة للغذاء والدواء ومدى التوفر وفق متطلباتك.")}</span></p>` : ""}
      <div class="maker" style="margin-top:28px">
        <div class="maker__logo">${brandMark(c, b)}</div>
        <div>
          <span class="pd__brand-name">${c.t("Manufacturer", "الشركة المصنّعة")} · ${esc(c.tx(b.country))}</span>
          <p>${esc(c.tx(b).about)}</p>
          <div class="maker__links">
            <a class="link-arrow" href="${c.u("/partners")}#${b.slug}">${c.t(`More from ${b.name}`, `المزيد من ${b.name}`)} ${icon("arrow")}</a>
            <a class="brand-card__site" href="${esc(p.website || b.website)}" rel="noopener" target="_blank">${c.t("Manufacturer website", "موقع الشركة المصنّعة")} ${icon("external")}</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
<section class="section section--tint section--line">
  <div class="container">
    ${sectionHead({ coord: "C", eyebrowText: c.t("Why source through BSM", "لماذا التوريد عبر BSM"), title: c.t("The technology, plus the team that makes it work.", "التقنية، ومعها الفريق الذي يضمن نجاحها.") })}
    ${assurance(c)}
  </div>
</section>
<section class="section">
  <div class="container">
    ${sectionHead({ coord: "D", eyebrowText: c.t("Related technologies", "تقنيات ذات صلة"), title: sameDiscipline ? c.t(`More in ${c.tx(disc).name}`, `المزيد في ${c.tx(disc).name}`) : c.t(`Related ${d.code} technologies`, `تقنيات ${d.code} ذات صلة`), side: `<a class="link-arrow" href="${c.u(`/solutions/${d.slug}`)}">${c.t(`All ${d.code} solutions`, `جميع حلول ${d.code}`)} ${icon("arrow")}</a>` })}
    <div class="product-grid product-grid--related">${shown.map((x) => productCard(c, x)).join("")}</div>
    ${articles.length ? `<div class="mt-l">${sectionHead({ eyebrowText: c.t("Related insights", "مقالات ذات صلة"), title: c.t("Learn more", "اعرف المزيد") })}<div class="post-grid post-grid--all">${articles.map((a) => postCard(c, a)).join("")}</div></div>` : ""}
  </div>
</section>`;
  return {
    path: `/products/${p.slug}`,
    nav: "products",
    title: c.t(`${t.name} by ${b.name} | ${c.tx(disc).name} | BSM Saudi Arabia`, `${t.name} من ${b.name} | ${c.tx(disc).name} | BSM السعودية`),
    description: c.t(`${t.summary} Supplied and supported in Saudi Arabia by Binary System Medical.`, `${t.summary} توريد ودعم في المملكة العربية السعودية من باينري سيستم الطبية.`).slice(0, 300),
    ogImage: `/images/products/${p.slug}.webp`,
    jsonld: [crumbsLd(c, crumbsItems)],
    main,
  };
}
