import { icon } from "../lib/icons.mjs";
import { plate, standardCurve, facts, sectionHead, bmark, productCard, processSteps, logoWall, postCard, ctaBand, divisionCards } from "../lib/components.mjs";

export function home(c) {
  const { products, insights, site } = c.data;

  const hero = `<section class="hero">
  <div class="container">
    <div class="hero__grid">
      <div class="hero__copy">
        <h1 class="display reveal-load">${c.t("Diagnostics and medical devices for Saudi healthcare", "التشخيص المخبري والأجهزة الطبية للقطاع الصحي السعودي")}</h1>
        <p class="lede reveal-load">${c.t(
          `We supply hospitals, laboratories, universities and research centres with systems from ${site.stats.brands} global manufacturers, and we install them, train your staff and keep them running.`,
          `نورّد للمستشفيات والمختبرات والجامعات ومراكز الأبحاث أنظمة من أكثر من ${site.stats.brands.replace("+", "")} شركة تصنيع عالمية، ونتولى تركيبها وتدريب فريقك عليها ودعم تشغيلها.`
        )}</p>
        <div class="hero__ctas reveal-load">
          <a class="btn btn--light" href="${c.u("/products/")}">${c.t("Explore products", "استكشف المنتجات")} ${icon("arrow")}</a>
          <a class="btn btn--outline-light" href="${c.u("/quote")}">${c.t("Request a quotation", "اطلب عرض سعر")}</a>
        </div>
      </div>
      ${plate(c)}
      ${standardCurve()}
    </div>
    ${facts(c)}
  </div>
</section>`;

  const who = `<section class="section" id="about">
  <div class="container split">
    <div class="reveal">${bmark(c, {
      top: { src: "/images/photos/team-lab.webp", alt: c.t("Laboratory specialists at work", "أخصائيون يعملون في المختبر") },
      bottom: { src: "/images/photos/lab-interior.webp", alt: c.t("A modern clinical laboratory with automated analysers", "مختبر سريري حديث مزود بأجهزة تحليل آلية") },
    })}</div>
    <div class="split__copy reveal">
      <h2 class="h2">${c.t("Part of Saudi&nbsp;Mais, in medical technology since 2015", "نعمل في مجال التقنيات الطبية منذ عام 2015 ضمن شركة ميس السعودية")}</h2>
      <p class="lede">${c.t(
        "Binary System Medical supplies hospitals, laboratories, universities and research centres with systems from trusted global manufacturers, and with the expertise to choose and run them.",
        "تورّد باينري سيستم الطبية للمستشفيات والمختبرات والجامعات ومراكز الأبحاث أنظمة من شركات تصنيع عالمية موثوقة، مع الخبرة اللازمة لاختيارها وتشغيلها."
      )}</p>
      <ul class="checklist">
        <li>${icon("checkCircle")}<span>${c.t("Certified by the Saudi Food and Drug Authority (SFDA) for IVD and medical device solutions.", "معتمدة من الهيئة العامة للغذاء والدواء لحلول التشخيص المخبري والأجهزة الطبية.")}</span></li>
        <li>${icon("checkCircle")}<span>${c.t("Expert consultation and proper system selection for every facility.", "استشارة متخصصة واختيار مدروس للأنظمة المناسبة لكل منشأة.")}</span></li>
        <li>${icon("checkCircle")}<span>${c.t("Technical support and application specialists for the long term.", "دعم فني وأخصائيو تطبيقات على المدى الطويل.")}</span></li>
      </ul>
      <a class="link-arrow" href="${c.u("/about")}">${c.t("More about BSM", "المزيد عن BSM")} ${icon("arrow")}</a>
    </div>
  </div>
</section>`;

  const solutions = `<section class="section section--tint">
  <div class="container">
    ${sectionHead({
      title: c.t("What we supply", "ما نورّده"),
      lede: c.t("Three areas, from the hospital laboratory to the research bench.", "ثلاثة مجالات، من مختبر المستشفى إلى طاولة البحث العلمي."),
      side: `<a class="btn btn--ghost" href="${c.u("/products/")}">${c.t("View all products", "عرض جميع المنتجات")} ${icon("arrow")}</a>`,
    })}
    <div class="divisions reveal-stagger">${divisionCards(c)}</div>
  </div>
</section>`;

  const featured = products.filter((p) => p.featured);
  const tech = `<section class="section">
  <div class="container">
    ${sectionHead({
      title: c.t("Featured technologies", "تقنيات مختارة"),
      lede: c.t("A few of the systems and assays we supply. Add any of them to your quote list as you browse.", "بعض الأنظمة والاختبارات التي نوردها. أضف ما يناسبك منها إلى قائمة عرض السعر أثناء التصفح."),
      side: `<div class="rail-controls"><button class="rail-btn" type="button" data-rail-prev aria-label="${c.t("Previous", "السابق")}">${icon("chevronLeft")}</button><button class="rail-btn" type="button" data-rail-next aria-label="${c.t("Next", "التالي")}">${icon("chevronRight")}</button></div>`,
    })}
    <div class="rail" data-rail tabindex="0" role="region" aria-label="${c.t("Featured technologies", "تقنيات مختارة")}">${featured.map((p) => productCard(c, p)).join("")}</div>
  </div>
</section>`;

  const process = `<section class="section dark">
  <div class="container">
    ${sectionHead({
      title: c.t("We stay after installation", "نبقى معك بعد التركيب"),
      lede: c.t("Every system comes with people: specialists who help you choose it, a technical team that installs it and application specialists who train your staff.", "يأتي كل نظام مع فريق يدعمه: مختصون يساعدونك في اختياره، وفريق فني يتولى تركيبه، وأخصائيو تطبيقات يدرّبون فريقك على استخدامه."),
      side: `<a class="btn btn--outline-light" href="${c.u("/contact")}">${c.t("Talk to a specialist", "تحدث إلى أحد المختصين")}</a>`,
    })}
    ${processSteps(c)}
  </div>
</section>`;

  const partners = `<section class="section section--tint">
  <div class="container">
    ${sectionHead({
      title: c.t("Our manufacturers", "شركات التصنيع التي نعمل معها"),
      lede: c.t(`${c.data.brands.length} manufacturers from Europe, Asia and North America. Select a logo to see what we supply from each.`, `${c.data.brands.length} شركة تصنيع من أوروبا وآسيا وأمريكا الشمالية. اختر شعارًا لترى ما نورّده من كل منها.`),
      side: `<a class="btn btn--ghost" href="${c.u("/partners")}">${c.t("Meet our partners", "تعرّف على شركائنا")} ${icon("arrow")}</a>`,
    })}
    ${logoWall(c)}
  </div>
</section>`;

  const posts = [...insights].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const blog = `<section class="section">
  <div class="container">
    ${sectionHead({
      title: c.t("Insights", "المقالات"),
      side: `<a class="link-arrow" href="${c.u("/insights/")}">${c.t("All articles", "جميع المقالات")} ${icon("arrow")}</a>`,
    })}
    <div class="post-grid reveal-stagger">${posts.map((p) => postCard(c, p)).join("")}</div>
  </div>
</section>`;

  const contact = `<section class="section section--violet" id="contact">
  <div class="container">
    ${ctaBand(c, {
      title: c.t("Tell us what your laboratory needs", "أخبرنا بما يحتاجه مختبرك"),
      text: c.t("Ask for a quotation or advice on a platform, and our team will get back to you.", "اطلب عرض سعر أو استشارة حول منصة معينة، وسيتواصل معك فريقنا."),
      primary: { href: c.u("/quote"), label: c.t("Request a quotation", "اطلب عرض سعر") },
      secondary: { href: c.u("/contact"), label: c.t("Contact us", "تواصل معنا") },
    })}
  </div>
</section>`;

  return {
    path: "/",
    nav: "home",
    headerOnDark: true,
    title: c.t("Binary System Medical (BSM) | IVD & Medical Device Solutions in Saudi Arabia", "باينري سيستم الطبية (BSM) | حلول التشخيص المخبري والأجهزة الطبية في السعودية"),
    description: c.t(
      "SFDA-certified Saudi distributor of in vitro diagnostics, medical devices and research solutions from 30+ global brands, with expert consultation, installation and long-term support.",
      "موزّع سعودي معتمد من الهيئة العامة للغذاء والدواء لحلول التشخيص المخبري والأجهزة الطبية والحلول البحثية من أكثر من 30 علامة تجارية عالمية، مع الاستشارات المتخصصة والتركيب والدعم طويل الأمد."
    ),
    jsonld: [orgLd(c), {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `https://binarysys.net${c.u("/")}#website`,
      url: `https://binarysys.net${c.u("/")}`,
      name: c.t("Binary System Medical", "باينري سيستم الطبية"),
      inLanguage: c.lang === "ar" ? "ar-SA" : "en",
      publisher: { "@id": "https://binarysys.net/#organization" },
    }],
    main: hero + who + solutions + tech + process + partners + blog + contact,
  };
}

export function orgLd(c) {
  const { company } = c.data.site;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://binarysys.net/#organization",
    name: company.name,
    alternateName: ["BSM", "Binary System Medical", company.name_ar],
    url: "https://binarysys.net/",
    logo: "https://binarysys.net/images/brand/bsm-logo.svg",
    email: company.email,
    telephone: company.phone_tel,
    foundingDate: String(company.founded),
    parentOrganization: { "@type": "Organization", name: company.parent },
    address: { "@type": "PostalAddress", streetAddress: company.street, addressLocality: company.city, postalCode: company.postal_code, addressCountry: company.country },
    areaServed: { "@type": "Country", name: "Saudi Arabia" },
    contactPoint: [
      { "@type": "ContactPoint", contactType: "sales", telephone: company.phone_tel, email: company.email, availableLanguage: ["en", "ar"], areaServed: "SA" },
    ],
  };
}
