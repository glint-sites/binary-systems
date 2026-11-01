import { esc } from "../lib/util.mjs";
import { icon } from "../lib/icons.mjs";
import { plate, statsBand, sectionHead, bmark, img, productCard, processSteps, sectors, logoWall, postCard, ctaBand, eyebrow, techCount, productSet } from "../lib/components.mjs";

export function home(c) {
  const { taxonomy, products, insights, site } = c.data;
  const count = (fn) => products.filter(fn).length;

  const hero = `<section class="hero">
  <img class="hero__mark" src="/images/brand/bsm-mark-white.svg" alt="" width="45" height="41" aria-hidden="true">
  <div class="container hero__grid">
    <div class="hero__copy">
      <p class="eyebrow reveal-load"><span class="tag-dot"></span>${c.t("SFDA-certified · Riyadh, Saudi Arabia", "معتمدة من هيئة الغذاء والدواء · الرياض، المملكة العربية السعودية")}</p>
      <h1 class="display">${c.t("Leading <em>IVD &amp; medical device</em> solutions for Saudi healthcare.", "حلول رائدة في <em>التشخيص المخبري والأجهزة الطبية</em> للقطاع الصحي السعودي.")}</h1>
      <p class="lede reveal-load">${c.t(
        `Binary System Medical brings proven technologies from ${site.stats.brands} global manufacturers to hospitals, laboratories, universities and research centres — backed by expert consultation, system selection and long-term support.`,
        `تقدم باينري سيستم الطبية تقنيات موثوقة من أكثر من ${site.stats.brands.replace("+", "")} شركة تصنيع عالمية للمستشفيات والمختبرات والجامعات ومراكز الأبحاث — مدعومة بالاستشارة المتخصصة واختيار الأنظمة المناسبة والدعم طويل الأمد.`
      )}</p>
      <div class="hero__ctas reveal-load">
        <a class="btn btn--light" href="${c.u("/products/")}">${c.t("Explore products", "استكشف المنتجات")} ${icon("arrow")}</a>
        <a class="btn btn--outline-light" href="${c.u("/quote")}">${c.t("Request a quotation", "اطلب عرض سعر")}</a>
      </div>
      <ul class="trust-row reveal-load">
        <li>${icon("shield")}${c.t("SFDA-certified", "معتمدة من هيئة الغذاء والدواء")}</li>
        <li>${icon("calendar")}${c.t("Established 2015", "تأسست عام 2015")}</li>
        <li>${icon("building")}${c.t("A Saudi Mais Co. subsidiary", "تابعة لشركة ميس السعودية")}</li>
      </ul>
    </div>
    ${plate(c)}
  </div>
</section>`;

  const who = `<section class="section" id="about">
  <div class="container split">
    <div class="reveal">${bmark(c, {
      top: { src: "/images/photos/team-lab.webp", alt: c.t("Laboratory specialists at work", "أخصائيون يعملون في المختبر") },
      bottom: { src: "/images/photos/lab-interior.webp", alt: c.t("A modern clinical laboratory with automated analysers", "مختبر سريري حديث مزود بأجهزة تحليل آلية") },
      tagCode: "EST.",
      tagValue: "2015",
    })}</div>
    <div class="split__copy reveal">
      ${eyebrow("A", c.t("Who we are", "من نحن"))}
      <h2 class="h2">${c.t("A Saudi medical technology company built on expertise — not just supply.", "شركة سعودية للتقنيات الطبية تقوم على الخبرة — لا على التوريد فحسب.")}</h2>
      <p class="lede">${c.t(
        "Established in 2015 and a subsidiary of Saudi Mais Co., Binary System Medical Co. supports hospitals, laboratories, universities and research centres with advanced solutions sourced from trusted global manufacturers.",
        "تأسست شركة باينري سيستم الطبية عام 2015، وهي إحدى الشركات التابعة لشركة ميس السعودية، وتدعم المستشفيات والمختبرات والجامعات ومراكز الأبحاث بحلول متقدمة من شركات تصنيع عالمية موثوقة."
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

  const divisionCards = taxonomy.divisions.map((d) => {
    const t = c.tx(d);
    const n = count((p) => p.division === d.id);
    const chips = d.disciplines.map((id) => `<span class="chip chip--plain">${esc(c.tx(taxonomy.disciplines.find((x) => x.id === id)).name)}</span>`).join("");
    return `<a class="division" href="${c.u(`/solutions/${d.slug}`)}">
      <div class="division__media"><span class="division__code">${d.code}</span>${img(`/images/products/${d.image}-sm.webp`, "", { srcset: productSet(d.image), sizes: "(max-width: 980px) 92vw, 400px" })}</div>
      <div class="division__body">
        <h3>${esc(t.name)}</h3>
        <p>${esc(t.tagline)}</p>
        <div class="division__chips">${chips}</div>
        <div class="division__foot"><span class="division__count">${techCount(c, n)}</span><span class="division__go">${icon("arrow")}</span></div>
      </div>
    </a>`;
  }).join("");

  const solutions = `<section class="section section--tint section--line">
  <div class="container">
    ${sectionHead({
      coord: "B",
      eyebrowText: c.t("Our expertise", "خبراتنا"),
      title: c.t("Complete diagnostic solutions, organised around how you work.", "حلول تشخيصية متكاملة، مصممة وفق طريقة عملك."),
      lede: c.t("We deliver complete diagnostic solutions designed for accuracy, reliability and clinical efficiency.", "نقدم حلولًا تشخيصية متكاملة مصممة لتحقيق الدقة والموثوقية والكفاءة السريرية."),
      side: `<a class="btn btn--ghost" href="${c.u("/products/")}">${c.t("View all products", "عرض جميع المنتجات")} ${icon("arrow")}</a>`,
    })}
    <div class="divisions reveal-stagger">${divisionCards}</div>
  </div>
</section>`;

  const featured = products.filter((p) => p.featured);
  const tech = `<section class="section">
  <div class="container">
    ${sectionHead({
      coord: "C",
      eyebrowText: c.t("Featured technologies", "تقنيات مختارة"),
      title: c.t("Proven platforms, now within reach in the Kingdom.", "منصات مثبتة الكفاءة، متاحة الآن في المملكة."),
      lede: c.t("A selection of the systems, assays and devices we supply and support — add any of them to your quote list as you browse.", "مجموعة من الأنظمة والاختبارات والأجهزة التي نوردها وندعمها — أضف ما يناسبك إلى قائمة عرض السعر أثناء التصفح."),
      side: `<div class="rail-controls"><button class="rail-btn" type="button" data-rail-prev aria-label="${c.t("Previous", "السابق")}">${icon("chevronLeft")}</button><button class="rail-btn" type="button" data-rail-next aria-label="${c.t("Next", "التالي")}">${icon("chevronRight")}</button></div>`,
    })}
    <div class="rail" data-rail tabindex="0" role="region" aria-label="${c.t("Featured technologies", "تقنيات مختارة")}">${featured.map((p) => productCard(c, p)).join("")}</div>
  </div>
</section>`;

  const process = `<section class="section dark">
  <div class="container">
    ${sectionHead({
      coord: "D",
      eyebrowText: c.t("Beyond supply", "أكثر من مجرد توريد"),
      title: c.t("From first consultation to long-term performance.", "من الاستشارة الأولى إلى الأداء المستدام."),
      lede: c.t("Our role goes beyond supply. We stay with you through every stage — so the technology you choose keeps delivering accurate, reliable results.", "دورنا يتجاوز التوريد؛ نرافقك في كل مرحلة لتواصل التقنية التي تختارها تقديم نتائج دقيقة وموثوقة."),
      side: `<a class="btn btn--outline-light" href="${c.u("/contact")}">${c.t("Talk to a specialist", "تحدث إلى أحد المختصين")}</a>`,
    })}
    ${processSteps(c)}
  </div>
</section>`;

  const serve = `<section class="section">
  <div class="container">
    ${sectionHead({
      coord: "E",
      eyebrowText: c.t("Who we serve", "الجهات التي نخدمها"),
      title: c.t("Trusted across the Saudi healthcare and research landscape.", "شريك موثوق في منظومة الرعاية الصحية والبحث العلمي في المملكة."),
    })}
    ${sectors(c)}
  </div>
</section>`;

  const partners = `<section class="section section--tint section--line">
  <div class="container">
    ${sectionHead({
      coord: "F",
      eyebrowText: c.t("Strategic partnerships", "شراكات استراتيجية"),
      title: c.t("Internationally recognised manufacturers. One trusted partner in the Kingdom.", "شركات تصنيع ذات سمعة عالمية. وشريك واحد موثوق في المملكة."),
      lede: c.t("We collaborate with leading medical and diagnostic manufacturers, delivering proven technologies that meet international standards and Saudi healthcare regulations.", "نتعاون مع كبرى شركات التصنيع الطبي والتشخيصي لتقديم تقنيات أثبتت كفاءتها تلبي المعايير الدولية واشتراطات القطاع الصحي السعودي."),
      side: `<a class="btn btn--ghost" href="${c.u("/partners")}">${c.t("Meet our partners", "تعرّف على شركائنا")} ${icon("arrow")}</a>`,
    })}
    ${logoWall(c)}
  </div>
</section>`;

  const posts = [...insights].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const blog = `<section class="section">
  <div class="container">
    ${sectionHead({
      coord: "G",
      eyebrowText: c.t("Insights", "المقالات"),
      title: c.t("Notes on diagnostics, technology and better patient care.", "رؤى حول التشخيص والتقنية ورعاية أفضل للمرضى."),
      side: `<a class="link-arrow" href="${c.u("/insights/")}">${c.t("All insights", "جميع المقالات")} ${icon("arrow")}</a>`,
    })}
    <div class="post-grid reveal-stagger">${posts.map((p) => postCard(c, p)).join("")}</div>
  </div>
</section>`;

  const contact = `<section class="section section--tight" id="contact">
  <div class="container">
    ${eyebrow("H", c.t("Quotation &amp; enquiries", "عروض الأسعار والاستفسارات"))}
    ${ctaBand(c, {
      title: c.t("Tell us what your laboratory needs.", "أخبرنا بما يحتاجه مختبرك."),
      text: c.t("Request a quotation, ask about a platform or discuss a complete solution — our team will get back to you shortly.", "اطلب عرض سعر، أو استفسر عن منصة معينة، أو ناقش حلًا متكاملًا — وسيتواصل معك فريقنا قريبًا."),
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
      "SFDA-certified Saudi distributor of in vitro diagnostics, medical devices and research solutions from 30+ global brands — with expert consultation, installation and long-term support.",
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
    main: hero + statsBand(c) + who + solutions + tech + process + serve + partners + blog + contact,
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
