import { esc } from "../lib/util.mjs";
import { icon } from "../lib/icons.mjs";
import { pageHero, crumbsLd, sectionHead, bmark, statsBand, eyebrow, img, sectors, processSteps, brandMark, ctaBand, contactForm, divOf, techCount } from "../lib/components.mjs";
import { orgLd } from "./home.mjs";

const homeCrumb = (c) => ({ name: c.t("Home", "الرئيسية"), href: c.u("/") });

export function about(c) {
  const { site, taxonomy, products } = c.data;
  const crumbsItems = [homeCrumb(c), { name: c.t("About", "من نحن"), href: c.u("/about") }];
  const values = [
    ["award", c.t("Quality first", "الجودة أولًا"), c.t("High-quality products from globally recognised manufacturers, selected to meet international standards and Saudi regulations.", "منتجات عالية الجودة من شركات تصنيع عالمية معروفة، مختارة لتلبي المعايير الدولية والأنظمة السعودية.")],
    ["users", c.t("Specialist expertise", "خبرة متخصصة"), c.t("Technical support and application specialists who understand the laboratory and the clinic.", "دعم فني وأخصائيو تطبيقات يفهمون طبيعة العمل في المختبر والعيادة.")],
    ["zap", c.t("Responsive service", "خدمة سريعة الاستجابة"), c.t("Fast, reliable customer service — because diagnostics can't wait.", "خدمة عملاء سريعة وموثوقة — لأن التشخيص لا يحتمل الانتظار.")],
    ["headset", c.t("After-sales commitment", "التزام بخدمة ما بعد البيع"), c.t("Comprehensive support for the full life of every system we supply.", "دعم شامل طوال العمر التشغيلي لكل نظام نورّده.")],
    ["handshake", c.t("Authorised partnerships", "شراكات معتمدة"), c.t("Authorised distribution of world-class medical technologies.", "توزيع معتمد لتقنيات طبية عالمية المستوى.")],
    ["sparkles", c.t("Innovation", "الابتكار"), c.t("A commitment to innovation, quality and healthcare excellence.", "التزام بالابتكار والجودة والتميز في الرعاية الصحية.")],
  ];
  const main = `${pageHero(c, {
    crumbsItems,
    cls: "page-hero--stats",
    eyebrowText: c.t("About Binary System Medical", "عن باينري سيستم الطبية"),
    title: c.t("Advancing diagnostics in Saudi Arabia since 2015.", "نرتقي بالتشخيص في المملكة العربية السعودية منذ عام 2015."),
    lede: c.t(
      "Binary System Medical Co. is a Saudi-based medical technology company and a subsidiary of Saudi Mais Co. Certified by the Saudi Food and Drug Authority (SFDA), we specialise in In Vitro Diagnostics (IVD) and Medical Devices (MD) solutions.",
      "شركة باينري سيستم الطبية شركة سعودية للتقنيات الطبية، وإحدى الشركات التابعة لشركة ميس السعودية. ونحن معتمدون من الهيئة العامة للغذاء والدواء، ومتخصصون في حلول التشخيص المخبري (IVD) والأجهزة الطبية (MD)."
    ),
  })}
${statsBand(c)}
<section class="section">
  <div class="container split">
    <div class="reveal">${bmark(c, {
      top: { src: "/images/photos/pcr-plate.webp", alt: c.t("Pipetting samples into PCR tubes", "نقل العينات بالماصة إلى أنابيب PCR") },
      bottom: { src: "/images/photos/lab-interior.webp", alt: c.t("A modern clinical laboratory with automated analysers", "مختبر سريري حديث مزود بأجهزة تحليل آلية") },
      tagCode: "EST.",
      tagValue: "2015",
    })}</div>
    <div class="split__copy reveal">
      ${eyebrow("A", c.t("Who we are", "من نحن"))}
      <h2 class="h2">${c.t("Our role goes beyond supply.", "دورنا يتجاوز التوريد.")}</h2>
      <p class="lede">${c.t("Since 2015, we have supported hospitals, laboratories, universities and research centres with advanced solutions sourced from trusted global manufacturers.", "منذ عام 2015، ندعم المستشفيات والمختبرات والجامعات ومراكز الأبحاث بحلول متقدمة من شركات تصنيع عالمية موثوقة.")}</p>
      <p class="prose-sm">${c.t("We provide expert consultation, proper system selection and long-term support — so every technology we bring to the Kingdom is matched to the people who use it, and keeps performing long after installation.", "نقدم الاستشارة المتخصصة والاختيار السليم للأنظمة والدعم طويل الأمد، لتكون كل تقنية نوفرها في المملكة ملائمة لمن يستخدمها، وتواصل أداءها بكفاءة لفترة طويلة بعد تركيبها.")}</p>
      <p class="prose-sm">${c.t("As Saudi Arabia continues to invest in world-class healthcare, we help providers adopt diagnostic technology that meets international standards and SFDA requirements.", "ومع استمرار المملكة في الاستثمار في رعاية صحية عالمية المستوى، نساعد مقدمي الخدمات الصحية على تبنّي تقنيات تشخيصية تلبي المعايير الدولية ومتطلبات الهيئة العامة للغذاء والدواء.")}</p>
    </div>
  </div>
</section>
<section class="section section--tint section--line">
  <div class="container">
    ${sectionHead({ coord: "B", eyebrowText: c.t("Why choose us", "لماذا نحن"), title: c.t("What healthcare providers can expect from BSM.", "ما يمكن أن يتوقعه مقدمو الرعاية الصحية من BSM.") })}
    <div class="pillars pillars--light pillars--3 reveal-stagger">${values.map(([ic, h, p]) => `<div class="pillar">${icon(ic)}<h3>${h}</h3><p>${p}</p></div>`).join("")}</div>
  </div>
</section>
<section class="section dark">
  <div class="container">
    ${sectionHead({ coord: "C", eyebrowText: c.t("How we work", "كيف نعمل"), title: c.t("A partnership model built around your results.", "نموذج شراكة يتمحور حول نتائجك."), side: `<a class="btn btn--outline-light" href="${c.u("/contact")}">${c.t("Talk to us", "تحدث إلينا")}</a>` })}
    ${processSteps(c)}
  </div>
</section>
<section class="section">
  <div class="container">
    ${sectionHead({ coord: "D", eyebrowText: c.t("Our expertise", "خبراتنا"), title: c.t("Three divisions. One standard of care.", "ثلاثة أقسام. ومعيار واحد للرعاية.") })}
    <div class="pillars pillars--light pillars--3 reveal-stagger">${taxonomy.divisions.map((d) => `<a class="pillar" href="${c.u(`/solutions/${d.slug}`)}" style="text-decoration:none"><span class="mega__code">${d.code}</span><h3>${esc(c.tx(d).name)}</h3><p>${esc(c.tx(d).tagline)}</p><p class="link-arrow" style="margin-top:14px">${techCount(c, products.filter((p) => p.division === d.id).length)} ${icon("arrow")}</p></a>`).join("")}</div>
    <div class="mt-l">${sectors(c)}</div>
  </div>
</section>
<section class="section section--tint section--line" id="careers">
  <div class="container split">
    <div class="split__copy reveal">
      ${eyebrow("E", c.t("Careers", "الوظائف"))}
      <h2 class="h2">${c.t("Join us.", "انضم إلينا.")}</h2>
      <p class="lede">${c.t("Be part of a company that is shaping the future of medical diagnostics and healthcare innovation in Saudi Arabia.", "كن جزءًا من شركة تسهم في رسم مستقبل التشخيص الطبي والابتكار الصحي في المملكة العربية السعودية.")}</p>
      <p class="prose-sm">${c.t("We're always glad to hear from application specialists, service engineers, sales and regulatory professionals who care about getting diagnostics right.", "يسعدنا دائمًا التواصل مع أخصائيي التطبيقات ومهندسي الخدمة ومتخصصي المبيعات والشؤون التنظيمية ممن يهتمون بدقة التشخيص.")}</p>
      <a class="btn btn--wrap" href="mailto:${site.company.careers_email}?subject=${encodeURIComponent(c.t("Application — Binary System Medical", "طلب توظيف — باينري سيستم الطبية"))}">${icon("mail")} ${c.t("Send your CV to", "أرسل سيرتك الذاتية إلى")} ${site.company.careers_email}</a>
    </div>
    <div class="reveal">${img("/images/photos/team-lab.webp", c.t("The BSM team in the laboratory", "فريق BSM في المختبر"), { cls: "" }).replace("<img", '<img style="border-radius:24px;width:100%"')}</div>
  </div>
</section>
<section class="section section--tight">
  <div class="container">
    ${ctaBand(c, {
      title: c.t("Let's build your next diagnostic solution together.", "لنبنِ معًا حلك التشخيصي القادم."),
      text: c.t("Tell us about your facility and the tests you run — we'll help you find the right technology.", "أخبرنا عن منشأتك والفحوصات التي تجريها، وسنساعدك في إيجاد التقنية المناسبة."),
      primary: { href: c.u("/quote"), label: c.t("Request a quotation", "اطلب عرض سعر") },
      secondary: { href: c.u("/products/"), label: c.t("Explore products", "استكشف المنتجات") },
    })}
  </div>
</section>`;
  return {
    path: "/about",
    nav: "about",
    title: c.t("About BSM | Binary System Medical, Riyadh", "من نحن | باينري سيستم الطبية، الرياض"),
    description: c.t("Binary System Medical Co. is an SFDA-certified Saudi medical technology company, established in 2015 and a subsidiary of Saudi Mais Co., specialising in IVD and medical device solutions.", "شركة باينري سيستم الطبية شركة سعودية للتقنيات الطبية معتمدة من الهيئة العامة للغذاء والدواء، تأسست عام 2015، وهي تابعة لشركة ميس السعودية ومتخصصة في حلول التشخيص المخبري والأجهزة الطبية."),
    jsonld: [crumbsLd(c, crumbsItems), orgLd(c)],
    main,
  };
}

export function partners(c) {
  const { brands, products } = c.data;
  const crumbsItems = [homeCrumb(c), { name: c.t("Partners", "الشركاء"), href: c.u("/partners") }];
  const cards = brands.map((b) => {
    const ps = products.filter((p) => p.brand === b.slug);
    const divs = [...new Set(ps.map((p) => p.division))].map((id) => divOf(c, id).code).join(" · ");
    return `<article class="brand-card" id="${b.slug}">
      <div class="brand-card__top">${brandMark(c, b)}<span class="brand-card__country">${esc(c.tx(b.country))}</span></div>
      <h3>${esc(b.name)} <span class="mono muted" style="font-size:.75rem">${divs}</span></h3>
      <p>${esc(c.tx(b).about)}</p>
      <div class="brand-card__products">${ps.map((p) => `<a class="chip" href="${c.u(`/products/${p.slug}`)}">${esc(c.tx(p).name)}</a>`).join("")}</div>
      <a class="brand-card__site" href="${esc(b.website)}" rel="noopener" target="_blank">${esc(b.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""))} ${icon("external")}</a>
    </article>`;
  }).join("");
  const pillars = [
    ["map", c.t("Market access across the Kingdom", "الوصول إلى السوق في أنحاء المملكة"), c.t("Regional market offices and established relationships with hospitals, laboratories, universities and research centres.", "مكاتب إقليمية وعلاقات راسخة مع المستشفيات والمختبرات والجامعات ومراكز الأبحاث.")],
    ["fileCheck", c.t("Regulatory know-how", "خبرة تنظيمية"), c.t("An SFDA-certified company that understands Saudi healthcare regulations and international standards.", "شركة معتمدة من هيئة الغذاء والدواء تفهم أنظمة القطاع الصحي السعودي والمعايير الدولية.")],
    ["users", c.t("Technical & application specialists", "أخصائيون فنيون وأخصائيو تطبيقات"), c.t("A team that installs, trains and supports — representing your technology with the expertise it deserves.", "فريق يتولى التركيب والتدريب والدعم، ويمثل تقنيتك بالخبرة التي تستحقها.")],
    ["headset", c.t("Long-term customer care", "رعاية طويلة الأمد للعملاء"), c.t("Comprehensive after-sales support that protects your brand's reputation in the market.", "دعم شامل لما بعد البيع يحافظ على سمعة علامتك التجارية في السوق.")],
  ];
  const main = `${pageHero(c, {
    crumbsItems,
    eyebrowText: c.t("Strategic partnerships", "شراكات استراتيجية"),
    title: c.t("World-class manufacturers. One trusted partner in the Kingdom.", "شركات تصنيع عالمية. وشريك واحد موثوق في المملكة."),
    lede: c.t("We collaborate with internationally recognised medical and diagnostic manufacturers, enabling us to deliver proven technologies that meet international standards and Saudi healthcare regulations.", "نتعاون مع شركات تصنيع طبية وتشخيصية ذات سمعة دولية، مما يمكّننا من تقديم تقنيات أثبتت كفاءتها تلبي المعايير الدولية واشتراطات القطاع الصحي السعودي."),
    extra: `<div class="page-hero__meta"><span class="chip">${c.t(`${brands.length} featured manufacturers`, `${brands.length} شركة تصنيع مختارة`)}</span><span class="chip">${c.t("Europe · Asia · North America", "أوروبا · آسيا · أمريكا الشمالية")}</span></div>`,
  })}
<section class="section">
  <div class="container">
    ${sectionHead({ coord: "A", eyebrowText: c.t("Brand directory", "دليل العلامات التجارية"), title: c.t("The manufacturers behind our solutions.", "شركات التصنيع التي تقف وراء حلولنا."), lede: c.t("Explore each partner and the technologies we supply from them in Saudi Arabia.", "تعرّف على كل شريك والتقنيات التي نوفرها منه في المملكة العربية السعودية.") })}
    <div class="brand-grid">${cards}</div>
  </div>
</section>
<section class="section dark" id="manufacturers">
  <div class="container split">
    <div class="split__copy">
      ${eyebrow("B", c.t("For manufacturers", "لشركات التصنيع"))}
      <h2 class="h2">${c.t("Bring your technology to Saudi Arabia with BSM.", "أدخل تقنيتك إلى السوق السعودية مع BSM.")}</h2>
      <p class="lede">${c.t("We are always looking to partner with manufacturers whose technologies raise the standard of diagnostics and patient care. BSM combines market knowledge, regulatory understanding and a dedicated technical team to represent your products in one of the region's fastest-growing healthcare markets.", "نبحث دائمًا عن شراكات مع شركات تصنيع ترفع تقنياتها مستوى التشخيص ورعاية المرضى. وتجمع BSM بين المعرفة بالسوق والفهم التنظيمي وفريق فني متخصص لتمثيل منتجاتك في أحد أسرع أسواق الرعاية الصحية نموًا في المنطقة.")}</p>
      <div class="hero__ctas"><a class="btn btn--light" href="${c.u("/contact")}?topic=partnership">${c.t("Discuss a partnership", "ناقش فرصة شراكة")} ${icon("arrow")}</a></div>
    </div>
    <div class="pillars reveal-stagger">${pillars.map(([ic, h, p]) => `<div class="pillar">${icon(ic)}<h3>${h}</h3><p>${p}</p></div>`).join("")}</div>
  </div>
</section>`;
  return {
    path: "/partners",
    nav: "partners",
    title: c.t("Our Partners | Global Diagnostic & Medical Device Brands | BSM", "شركاؤنا | علامات عالمية في التشخيص والأجهزة الطبية | BSM"),
    description: c.t("Binary System Medical partners with 3DHISTECH, Bosch, GeneProof, Vircell, Wantai, D-tek, terraplasma and more to bring proven diagnostic and medical technologies to Saudi Arabia.", "تتعاون باينري سيستم الطبية مع 3DHISTECH وBosch وGeneProof وVircell وWantai وD-tek وterraplasma وغيرها لتقديم تقنيات تشخيصية وطبية أثبتت كفاءتها في المملكة العربية السعودية."),
    jsonld: [crumbsLd(c, crumbsItems)],
    main,
  };
}

export function contact(c) {
  const { company } = c.data.site;
  const crumbsItems = [homeCrumb(c), { name: c.t("Contact", "تواصل معنا"), href: c.u("/contact") }];
  const why = [
    c.t("Authorised distributor of world-class medical technologies", "موزع معتمد لتقنيات طبية عالمية المستوى"),
    c.t("High-quality products from globally recognised manufacturers", "منتجات عالية الجودة من شركات تصنيع عالمية معروفة"),
    c.t("Expert technical support and application specialists", "دعم فني متخصص وأخصائيو تطبيقات"),
    c.t("Fast and reliable customer service", "خدمة عملاء سريعة وموثوقة"),
    c.t("Comprehensive after-sales support", "دعم شامل لما بعد البيع"),
    c.t("Commitment to innovation, quality and healthcare excellence", "التزام بالابتكار والجودة والتميز في الرعاية الصحية"),
  ];
  const card = (href, ic, label, value, ext = false) => `<${href ? `a href="${href}"${ext ? ' rel="noopener" target="_blank"' : ""}` : "div"} class="contact-card"><span class="contact-card__icon">${icon(ic)}</span><div><small>${label}</small><span>${value}</span></div></${href ? "a" : "div"}>`;
  const main = `${pageHero(c, {
    crumbsItems,
    eyebrowText: c.t("Get in touch", "تواصل معنا"),
    title: c.t("Let's talk about your diagnostic needs.", "لنتحدث عن احتياجاتك التشخيصية."),
    lede: c.t("Whether you're a hospital, medical laboratory, clinic, research centre or healthcare provider, our team is here to help you find the right solution — from product questions and quotations to technical support and partnerships.", "سواء كنت مستشفى أو مختبرًا طبيًا أو عيادة أو مركز أبحاث أو مقدم رعاية صحية، فإن فريقنا مستعد لمساعدتك في إيجاد الحل المناسب — من الاستفسارات عن المنتجات وعروض الأسعار إلى الدعم الفني والشراكات."),
  })}
<section class="section">
  <div class="container contact-layout">
    <div class="stack-s">
      <div class="contact-cards">
        ${card(`mailto:${company.email}`, "mail", c.t("Email", "البريد الإلكتروني"), esc(company.email))}
        ${card(`tel:${company.phone_tel}`, "phone", c.t("Phone", "الهاتف"), `<span class="ltr">${esc(company.phone)}</span>`)}
        ${card(company.maps_url, "pin", c.t("Main office — Riyadh", "المكتب الرئيسي — الرياض"), esc(c.t(`${company.street}, ${company.city} ${company.postal_code}, Saudi Arabia`, `${company.street_ar}، ${company.city_ar} ${company.postal_code}، المملكة العربية السعودية`)), true)}
        ${card(`mailto:${company.careers_email}`, "briefcase", c.t("Careers", "الوظائف"), esc(company.careers_email))}
      </div>
      <a class="map-card" href="${esc(company.maps_url)}" rel="noopener" target="_blank">
        ${mapArt()}
        <strong>${c.t("Visit us in Riyadh", "زرنا في الرياض")}</strong>
        <p>${esc(c.t(`${company.street}, ${company.city} ${company.postal_code}`, `${company.street_ar}، ${company.city_ar} ${company.postal_code}`))}</p>
        <span class="link-arrow">${c.t("Open in Google Maps", "افتح في خرائط Google")} ${icon("arrowUpRight")}</span>
      </a>
      <div class="aside-card" style="margin-top:12px">
        <h2 class="aside-card__title">${c.t("Why choose us?", "لماذا تختارنا؟")}</h2>
        <ul class="checklist">${why.map((w) => `<li>${icon("checkCircle")}<span>${w}</span></li>`).join("")}</ul>
      </div>
    </div>
    <div class="form-card" id="form">
      <h2>${c.t("Send us a message", "أرسل لنا رسالة")}</h2>
      <p>${c.t("Fill in the form below and our team will get back to you shortly.", "املأ النموذج أدناه وسيتواصل معك فريقنا قريبًا.")} <span class="muted">${c.t("Fields marked * are required.", "الحقول المشار إليها بـ * مطلوبة.")}</span></p>
      ${contactForm(c)}
    </div>
  </div>
</section>`;
  return {
    path: "/contact",
    nav: "contact",
    title: c.t("Contact Us | Binary System Medical, Riyadh", "تواصل معنا | باينري سيستم الطبية، الرياض"),
    description: c.t(`Contact Binary System Medical in Riyadh for product information, quotations, technical support or partnerships. Call ${company.phone} or email ${company.email}.`, `تواصل مع باينري سيستم الطبية في الرياض للاستفسار عن المنتجات أو طلب عروض الأسعار أو الدعم الفني أو الشراكات. اتصل بنا على ${company.phone} أو راسلنا على ${company.email}.`),
    jsonld: [crumbsLd(c, crumbsItems), orgLd(c)],
    main,
    scripts: `<script type="module" src="/js/altcha.min.js"></script>`,
  };
}

// Abstract city-grid artwork for the location card (no third-party map embed).
function mapArt() {
  return `<svg class="map-art" viewBox="0 0 600 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs><radialGradient id="mg" cx="62%" cy="42%" r="60%"><stop offset="0" stop-color="#683f99" stop-opacity=".55"/><stop offset="1" stop-color="#150e24" stop-opacity="0"/></radialGradient></defs>
  <rect width="600" height="300" fill="#150e24"/>
  <g stroke="rgba(187,163,223,.16)" stroke-width="1" fill="none">
    <path d="M0 60h600M0 120h600M0 180h600M0 240h600M80 0v300M170 0v300M260 0v300M350 0v300M440 0v300M530 0v300"/>
    <path d="M-20 270 C 160 210, 260 150, 640 40" stroke="rgba(187,163,223,.35)" stroke-width="6"/>
    <path d="M300 -10 C 340 80, 380 160, 420 320" stroke="rgba(187,163,223,.22)" stroke-width="3"/>
  </g>
  <rect width="600" height="300" fill="url(#mg)"/>
  <circle cx="372" cy="126" r="34" fill="rgba(70,224,182,.12)"/><circle cx="372" cy="126" r="16" fill="rgba(70,224,182,.25)"/><circle cx="372" cy="126" r="7" fill="#46e0b6"/>
</svg>`;
}
