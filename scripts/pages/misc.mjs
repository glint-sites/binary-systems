import { esc, formatDate, readMinutes } from "../lib/util.mjs";
import { icon } from "../lib/icons.mjs";
import { pageHero, crumbsLd, crumbs, sectionHead, postCard, img, ctaBand, quoteForm, brandOf, eyebrow, readTime, imageSize } from "../lib/components.mjs";

const homeCrumb = (c) => ({ name: c.t("Home", "الرئيسية"), href: c.u("/") });
const insightsCrumb = (c) => ({ name: c.t("Insights", "المقالات"), href: c.u("/insights/") });

export function insightsIndex(c) {
  const posts = [...c.data.insights].sort((a, b) => b.date.localeCompare(a.date));
  const crumbsItems = [homeCrumb(c), insightsCrumb(c)];
  const main = `${pageHero(c, {
    crumbsItems,
    eyebrowText: c.t("Insights", "المقالات"),
    title: c.t("Insights on diagnostics and laboratory technology.", "رؤى حول التشخيص وتقنيات المختبرات."),
    lede: c.t("Explore the latest insights, technologies and trends in medical diagnostics and laboratory solutions.", "تعرّف على أحدث الرؤى والتقنيات والتوجهات في التشخيص الطبي وحلول المختبرات."),
  })}
<section class="section">
  <div class="container">
    <div class="post-grid post-grid--all reveal-stagger">${posts.map((p) => postCard(c, p, 2)).join("")}</div>
  </div>
</section>`;
  return {
    path: "/insights/",
    nav: "insights",
    title: c.t("Insights | Diagnostics & Laboratory Technology | BSM", "المقالات | التشخيص وتقنيات المختبرات | BSM"),
    description: c.t("Articles from Binary System Medical on molecular diagnostics, H. pylori breath testing, STI screening and laboratory technology.", "مقالات من باينري سيستم الطبية حول التشخيص الجزيئي واختبار تنفس اليوريا لجرثومة المعدة وفحوصات الأمراض المنقولة جنسيًا وتقنيات المختبرات."),
    jsonld: [crumbsLd(c, crumbsItems)],
    main,
  };
}

export function article(c, post) {
  const t = c.tx(post);
  const crumbsItems = [homeCrumb(c), insightsCrumb(c), { name: t.title, href: c.u(`/insights/${post.slug}`) }];
  const body = t.body.map((b) => {
    if (b.h2) return `<h2>${esc(b.h2)}</h2>`;
    if (b.p) return `<p>${esc(b.p)}</p>`;
    if (b.ul) return `<ul>${b.ul.map((li) => `<li>${esc(li)}</li>`).join("")}</ul>`;
    return "";
  }).join("");
  const related = post.related.map((s) => c.data.products.find((p) => p.slug === s)).filter(Boolean);
  const others = c.data.insights.filter((p) => p.slug !== post.slug);
  const mins = readMinutes(t.body);
  const main = `<article>
<header class="article-hero">
  <div class="container">
    ${crumbs(c, crumbsItems)}
    <div class="container--narrow" style="margin-inline:0">
      <p class="eyebrow">${esc(t.topic)}</p>
      <h1>${esc(t.title)}</h1>
      <div class="article-meta"><span>${icon("calendar").replace("<svg", '<svg style="width:16px;height:16px;display:inline;vertical-align:-3px;margin-inline-end:6px"')}<time datetime="${post.date}">${formatDate(post.date, c.lang)}</time></span><span>${readTime(c, mins)}</span><span>${c.t("By the BSM team", "بقلم فريق BSM")}</span></div>
    </div>
    <div class="article-cover">${img(`/images/insights/${post.image}.webp`, "", { lazy: false, priority: true, srcset: [[`/images/insights/${post.image}-sm.webp`, imageSize(`/images/insights/${post.image}-sm.webp`).w], [`/images/insights/${post.image}.webp`, imageSize(`/images/insights/${post.image}.webp`).w]], sizes: "(max-width: 1240px) 96vw, 1200px" })}</div>
  </div>
</header>
<section class="section section--tight">
  <div class="container article-layout">
    <div class="prose">
      <p class="lead">${esc(t.excerpt)}</p>
      ${body}
      <p class="disclaimer">${c.t("This article is for general information only and is not a substitute for professional medical advice. Please consult a qualified healthcare provider about diagnosis and treatment.", "هذا المقال لأغراض المعلومات العامة فقط ولا يغني عن الاستشارة الطبية المتخصصة. يرجى استشارة مقدم رعاية صحية مؤهل بشأن التشخيص والعلاج.")}</p>
    </div>
    <aside class="article-aside">
      ${related.length ? `<div class="aside-card"><h3>${c.t("Related technologies", "تقنيات ذات صلة")}</h3><ul class="aside-list">${related.map((p) => `<li><a href="${c.u(`/products/${p.slug}`)}">${img(`/images/products/${p.slug}-xs.webp`, "")}<span><small>${esc(brandOf(c, p.brand).name)}</small>${esc(c.tx(p).name)}</span></a></li>`).join("")}</ul></div>` : ""}
      <div class="aside-card"><h3>${c.t("Need this in your lab?", "هل تحتاج إلى هذه التقنية في مختبرك؟")}</h3><p class="muted" style="font-size:.93rem;margin-bottom:14px">${c.t("Our specialists can advise on the right platform and prepare a quotation.", "يمكن لمختصينا تقديم المشورة حول المنصة المناسبة وإعداد عرض سعر.")}</p><a class="btn btn--sm btn--block" href="${c.u("/quote")}">${c.t("Request a quotation", "اطلب عرض سعر")}</a></div>
    </aside>
  </div>
</section>
</article>
<section class="section section--tint section--line">
  <div class="container">
    ${sectionHead({ eyebrowText: c.t("Keep reading", "تابع القراءة"), title: c.t("More insights", "مقالات أخرى"), side: `<a class="link-arrow" href="${c.u("/insights/")}">${c.t("All insights", "جميع المقالات")} ${icon("arrow")}</a>` })}
    <div class="post-grid post-grid--all">${others.map((p) => postCard(c, p)).join("")}</div>
  </div>
</section>`;
  return {
    path: `/insights/${post.slug}`,
    nav: "insights",
    ogType: "article",
    title: `${t.title} | BSM`,
    description: t.excerpt,
    ogImage: `/images/insights/${post.image}.webp`,
    jsonld: [crumbsLd(c, crumbsItems), {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: t.title,
      description: t.excerpt,
      datePublished: post.date,
      dateModified: post.date,
      inLanguage: c.lang,
      image: `https://binarysys.net/images/insights/${post.image}.webp`,
      author: { "@type": "Organization", name: "Binary System Medical Co." },
      publisher: { "@type": "Organization", name: "Binary System Medical Co.", logo: { "@type": "ImageObject", url: "https://binarysys.net/images/brand/bsm-logo.svg" } },
      mainEntityOfPage: `https://binarysys.net${c.u(`/insights/${post.slug}`)}`,
    }],
    main,
  };
}

export function quote(c) {
  const crumbsItems = [homeCrumb(c), { name: c.t("Request a quotation", "طلب عرض سعر"), href: c.u("/quote") }];
  const catalogJson = Object.fromEntries(c.data.products.map((p) => [p.slug, { n: c.tx(p).name, b: brandOf(c, p.brand).name, u: c.u(`/products/${p.slug}`), i: `/images/products/${p.slug}-xs.webp` }]));
  const main = `${pageHero(c, {
    crumbsItems,
    eyebrowText: c.t("Quotation", "عرض السعر"),
    title: c.t("Request a quotation", "اطلب عرض سعر"),
    lede: c.t("Tell us what you need — one product or a complete laboratory solution. Products you add while browsing appear in your quote list below.", "أخبرنا بما تحتاجه — منتج واحد أو حل مخبري متكامل. تظهر المنتجات التي تضيفها أثناء التصفح في قائمة عرض السعر أدناه."),
  })}
<section class="section">
  <div class="container quote-layout">
    <div class="quote-side">
      <div class="aside-card" style="background:#fff">
        <h2 class="h3" style="font-size:1.25rem;margin-bottom:6px">${c.t("Your quote list", "قائمة عرض السعر")}</h2>
        <p class="muted" style="font-size:.92rem;margin-bottom:16px" data-quote-summary>${c.t("Products you've selected for this request.", "المنتجات التي اخترتها لهذا الطلب.")}</p>
        <ul class="qlist" data-quote-list></ul>
        <div class="qempty" data-quote-empty>${icon("clipboard")}<p>${c.t("Your list is empty. Browse our products and select <strong>Add to quote</strong>, or simply describe what you need in the form.", "قائمتك فارغة. تصفّح منتجاتنا واختر <strong>أضف إلى عرض السعر</strong>، أو صف ما تحتاجه مباشرة في النموذج.")}</p></div>
        <a class="link-arrow" style="margin-top:16px" href="${c.u("/products/")}">${c.t("Browse products", "تصفّح المنتجات")} ${icon("arrow")}</a>
      </div>
      <div class="aside-card">
        <h3>${c.t("What happens next", "الخطوات التالية")}</h3>
        <ul class="checklist" style="font-size:.95rem">
          <li>${icon("checkCircle")}<span>${c.t("A specialist reviews your requirements.", "يراجع أحد المختصين متطلباتك.")}</span></li>
          <li>${icon("checkCircle")}<span>${c.t("We confirm configuration, quantities and any questions with you.", "نراجع معك الإعدادات والكميات ونجيب عن أي استفسارات.")}</span></li>
          <li>${icon("checkCircle")}<span>${c.t("You receive a formal quotation from our team.", "تتلقى عرض سعر رسميًا من فريقنا.")}</span></li>
        </ul>
      </div>
    </div>
    <div class="form-card" id="form">
      <h2>${c.t("Your details", "بياناتك")}</h2>
      <p>${c.t("Fields marked * are required.", "الحقول المشار إليها بـ * مطلوبة.")}</p>
      ${quoteForm(c)}
    </div>
  </div>
</section>
<script type="application/json" id="catalog-data">${JSON.stringify(catalogJson).replace(/</g, "\\u003c")}</script>`;
  return {
    path: "/quote",
    nav: "quote",
    title: c.t("Request a Quotation | Binary System Medical", "اطلب عرض سعر | باينري سيستم الطبية"),
    description: c.t("Request a quotation for IVD analysers, molecular assays, medical devices or research products from Binary System Medical in Saudi Arabia.", "اطلب عرض سعر لأجهزة التشخيص المخبري أو الاختبارات الجزيئية أو الأجهزة الطبية أو المنتجات البحثية من باينري سيستم الطبية في المملكة العربية السعودية."),
    jsonld: [crumbsLd(c, crumbsItems)],
    main,
    scripts: `<script type="module" src="/js/altcha.min.js"></script>`,
  };
}

export function privacy(c) {
  const { company } = c.data.site;
  const crumbsItems = [homeCrumb(c), { name: c.t("Privacy policy", "سياسة الخصوصية"), href: c.u("/privacy-policy") }];
  const en = `
<p><strong>Last updated:</strong> November 1, 2026</p>
<p>This policy explains how ${esc(company.name)} ("BSM", "we") handles personal information collected through binarysys.net.</p>
<h2>Information we collect</h2>
<p>We only collect the information you choose to send us through our contact and quotation forms: your name, work email, phone number, organisation, job title, facility type, city, the products in your quote list and your message.</p>
<h2>How we use it</h2>
<ul><li>To respond to your enquiry or prepare a quotation.</li><li>To follow up about the products or services you asked about.</li><li>To keep a record of business correspondence.</li></ul>
<p>We do not sell your information or use it for unrelated marketing.</p>
<h2>Form delivery and spam protection</h2>
<p>Form submissions are processed by our website host (Cloudflare) and delivered to our team by email or a secure business system. To block automated spam, our forms use ALTCHA, a privacy-friendly check that runs a small calculation in your browser. It does not use cookies or track you, and it is served from our own website.</p>
<h2>Your browser</h2>
<p>This website does not use advertising or analytics cookies. A few things are stored only in your own browser (local storage) so they stay with you while you browse or switch language: your quote list, your language choice and any form you have started but not sent. Nothing is sent to us unless you submit a form. Unsent form entries are deleted after 12 hours or as soon as you send the form, and you can clear everything at any time by clearing your browser data.</p>
<h2>Retention and security</h2>
<p>We keep enquiry information only for as long as needed to respond and to maintain business records, and we protect it with appropriate technical and organisational measures.</p>
<h2>Your rights</h2>
<p>In line with Saudi Arabia's Personal Data Protection Law, you may ask to access, correct or delete the personal information you have sent us. Contact us at <a href="mailto:${company.email}">${company.email}</a>.</p>
<h2>Contact</h2>
<p>${esc(company.name)}, ${esc(company.street)}, ${esc(company.city)} ${esc(company.postal_code)}, Saudi Arabia · <span class="ltr">${esc(company.phone)}</span> · <a href="mailto:${company.email}">${company.email}</a></p>`;
  const ar = `
<p><strong>آخر تحديث:</strong> 1 نوفمبر 2026</p>
<p>توضح هذه السياسة كيفية تعامل ${esc(company.name_ar)} ("BSM" أو "نحن") مع البيانات الشخصية التي نجمعها عبر الموقع binarysys.net.</p>
<h2>البيانات التي نجمعها</h2>
<p>نجمع فقط البيانات التي تختار إرسالها إلينا عبر نماذج التواصل وطلب عرض السعر: اسمك وبريدك الإلكتروني للعمل ورقم هاتفك واسم جهتك ومسماك الوظيفي ونوع المنشأة والمدينة والمنتجات المدرجة في قائمة عرض السعر ورسالتك.</p>
<h2>كيف نستخدمها</h2>
<ul><li>للرد على استفسارك أو إعداد عرض السعر.</li><li>للمتابعة بشأن المنتجات أو الخدمات التي سألت عنها.</li><li>للاحتفاظ بسجل للمراسلات التجارية.</li></ul>
<p>لا نبيع بياناتك ولا نستخدمها في أغراض تسويقية غير ذات صلة.</p>
<h2>إرسال النماذج والحماية من الرسائل المزعجة</h2>
<p>يعالج مزود استضافة موقعنا (Cloudflare) النماذج المرسَلة، ثم تصل إلى فريقنا عبر البريد الإلكتروني أو نظام أعمال آمن. ولمنع الرسائل المزعجة الآلية، نستخدم ALTCHA، وهو فحص يحافظ على الخصوصية ويجري عملية حسابية بسيطة في متصفحك، ولا يستخدم ملفات تعريف الارتباط ولا يتتبعك، ويُقدَّم من موقعنا مباشرة.</p>
<h2>متصفحك</h2>
<p>لا يستخدم هذا الموقع ملفات تعريف ارتباط إعلانية أو تحليلية. ونحفظ بعض البيانات في متصفحك فقط (التخزين المحلي) لتبقى معك أثناء التصفح أو عند تغيير اللغة: قائمة عرض السعر، واللغة التي اخترتها، وأي نموذج بدأت تعبئته ولم ترسله بعد. ولا يُرسل إلينا شيء من ذلك إلا عند إرسال أحد النماذج. وتُحذف بيانات النماذج غير المرسلة بعد 12 ساعة أو فور إرسال النموذج، ويمكنك مسح كل ذلك في أي وقت بمسح بيانات المتصفح.</p>
<h2>الاحتفاظ بالبيانات وحمايتها</h2>
<p>لا نحتفظ ببيانات الاستفسارات إلا للمدة اللازمة للرد عليها وللاحتفاظ بالسجلات التجارية، ونحميها بإجراءات تقنية وتنظيمية مناسبة.</p>
<h2>حقوقك</h2>
<p>وفقًا لنظام حماية البيانات الشخصية في المملكة العربية السعودية، يحق لك طلب الاطلاع على بياناتك الشخصية التي أرسلتها إلينا أو تصحيحها أو حذفها. تواصل معنا عبر <a href="mailto:${company.email}">${company.email}</a>.</p>
<h2>التواصل</h2>
<p>${esc(company.name_ar)}، ${esc(company.street_ar)}، ${esc(company.city_ar)} ${esc(company.postal_code)}، المملكة العربية السعودية · <span class="ltr">${esc(company.phone)}</span> · <a href="mailto:${company.email}">${company.email}</a></p>`;
  const main = `${pageHero(c, { crumbsItems, eyebrowText: c.t("Legal", "معلومات قانونية"), title: c.t("Privacy policy", "سياسة الخصوصية") })}
<section class="section section--tight"><div class="container--narrow legal prose">${c.t(en, ar)}</div></section>`;
  return {
    path: "/privacy-policy",
    nav: "",
    title: c.t("Privacy Policy | Binary System Medical", "سياسة الخصوصية | باينري سيستم الطبية"),
    description: c.t("How Binary System Medical collects, uses and protects the information you send through binarysys.net.", "كيف تجمع باينري سيستم الطبية البيانات التي ترسلها عبر binarysys.net وتستخدمها وتحميها."),
    jsonld: [crumbsLd(c, crumbsItems)],
    main,
  };
}

export function thanks(c) {
  const main = `<section class="notfound"><div class="container--narrow">
  <div class="plate-mini" aria-hidden="true"><i class="on"></i><i class="on"></i><i class="on"></i><i class="on"></i></div>
  ${eyebrow("", c.t("Message sent", "تم الإرسال"))}
  <h1 class="h2">${c.t("Thank you — we've received your request.", "شكرًا لك — استلمنا طلبك.")}</h1>
  <p class="lede" style="margin:18px auto 30px">${c.t("A member of our team will get back to you shortly.", "سيتواصل معك أحد أعضاء فريقنا قريبًا.")}</p>
  <a class="btn" href="${c.u("/products/")}">${c.t("Continue browsing", "متابعة التصفح")} ${icon("arrow")}</a>
</div></section>`;
  return { path: "/thank-you", nav: "", noindex: true, title: c.t("Thank you | Binary System Medical", "شكرًا لك | باينري سيستم الطبية"), description: c.t("Thank you for contacting Binary System Medical. Our team will get back to you shortly.", "شكرًا لتواصلك مع باينري سيستم الطبية. سيتواصل معك فريقنا قريبًا."), main };
}

export function notFound(c) {
  const main = `<section class="notfound"><div class="container--narrow">
  <div class="plate-mini" aria-hidden="true"><i class="on"></i><i></i><i></i><i class="on"></i></div>
  <p class="eyebrow" style="justify-content:center"><span class="coord">404</span>${c.t("Sample not found", "العينة غير موجودة")}</p>
  <h1 class="h2">${c.t("This page didn't show up in our results.", "لم تظهر هذه الصفحة في نتائجنا.")}</h1>
  <p class="lede" style="margin:18px auto 30px">${c.t("The page may have moved after our website update. Try the catalogue or head back home.", "ربما نُقلت الصفحة بعد تحديث موقعنا. جرّب دليل المنتجات أو عُد إلى الصفحة الرئيسية.")}</p>
  <div class="hero__ctas" style="justify-content:center"><a class="btn" href="${c.u("/")}">${c.t("Back to home", "العودة للرئيسية")}</a><a class="btn btn--ghost" href="${c.u("/products/")}">${c.t("Browse products", "تصفّح المنتجات")}</a></div>
</div></section>`;
  return { path: "/404", nav: "", noindex: true, title: c.t("Page not found | Binary System Medical", "الصفحة غير موجودة | باينري سيستم الطبية"), description: c.t("The page you were looking for could not be found.", "تعذّر العثور على الصفحة المطلوبة."), main };
}
