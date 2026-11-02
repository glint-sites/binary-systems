import { esc } from "../lib/util.mjs";
import { icon } from "../lib/icons.mjs";
import { pageHero, crumbsLd, sectionHead, img, sectors, brandMark, ctaBand, contactForm, divOf, divisionCards } from "../lib/components.mjs";
import { orgLd } from "./home.mjs";

const homeCrumb = (c) => ({ name: c.t("Home", "الرئيسية"), href: c.u("/") });

export function about(c) {
  const { site } = c.data;
  const crumbsItems = [homeCrumb(c), { name: c.t("About", "من نحن"), href: c.u("/about") }];
  const values = [
    ["award", c.t("Quality first", "الجودة أولًا"), c.t("Products from established manufacturers, selected to meet international standards and Saudi regulations.", "منتجات من شركات تصنيع راسخة، مختارة لتلبي المعايير الدولية والأنظمة السعودية.")],
    ["users", c.t("Specialist expertise", "خبرة متخصصة"), c.t("Technical support and application specialists who understand the laboratory and the clinic.", "دعم فني وأخصائيو تطبيقات يفهمون طبيعة العمل في المختبر والعيادة.")],
    ["zap", c.t("Responsive service", "خدمة سريعة الاستجابة"), c.t("Fast, reliable customer service, because diagnostics can't wait.", "خدمة عملاء سريعة وموثوقة، لأن التشخيص لا يحتمل الانتظار.")],
    ["headset", c.t("After-sales commitment", "التزام بخدمة ما بعد البيع"), c.t("Support for the full working life of every system we supply.", "دعم طوال العمر التشغيلي لكل نظام نورّده.")],
    ["handshake", c.t("Authorised distributor", "موزّع معتمد"), c.t("We are an authorised distributor for the manufacturers we represent.", "نحن موزّع معتمد لشركات التصنيع التي نمثلها.")],
    ["fileCheck", c.t("Regulatory know-how", "خبرة تنظيمية"), c.t("SFDA-certified, and familiar with the rules that apply to IVD and medical devices in Saudi Arabia.", "معتمدون من الهيئة العامة للغذاء والدواء، وعلى دراية بالأنظمة التي تنطبق على التشخيص المخبري والأجهزة الطبية في المملكة.")],
  ];
  const main = `${pageHero(c, {
    crumbsItems,
    title: c.t("Diagnostics and medical technology in Saudi Arabia since 2015", "التشخيص والتقنيات الطبية في المملكة العربية السعودية منذ عام 2015"),
    lede: c.t(
      "Binary System Medical Co. is a Saudi-based medical technology company and a subsidiary of Saudi Mais Co. Certified by the Saudi Food and Drug Authority (SFDA), we specialise in In Vitro Diagnostics (IVD) and Medical Devices (MD) solutions.",
      "شركة باينري سيستم الطبية شركة سعودية للتقنيات الطبية، وإحدى الشركات التابعة لشركة ميس السعودية. ونحن معتمدون من الهيئة العامة للغذاء والدواء، ومتخصصون في حلول التشخيص المخبري (IVD) والأجهزة الطبية (MD)."
    ),
  })}
<section class="section">
  <div class="container split">
    <div class="reveal">${img("/images/photos/pcr-plate.webp", c.t("Pipetting samples into PCR tubes", "نقل العينات بالماصة إلى أنابيب PCR"), { cls: "photo", srcset: [["/images/photos/pcr-plate-md.webp", 800], ["/images/photos/pcr-plate.webp", 1600]], sizes: "(max-width: 900px) 92vw, 600px" })}</div>
    <div class="split__copy reveal">
      <h2 class="h2">${c.t("Who we are", "من نحن")}</h2>
      <p class="lede">${c.t("Since 2015 we have supplied hospitals, laboratories, universities and research centres with diagnostic systems and medical devices from manufacturers in Europe, Asia and North America.", "منذ عام 2015 نورّد للمستشفيات والمختبرات والجامعات ومراكز الأبحاث أنظمة تشخيصية وأجهزة طبية من شركات تصنيع في أوروبا وآسيا وأمريكا الشمالية.")}</p>
      <p class="prose-sm">${c.t("We provide expert consultation, careful system selection and long-term support, so every technology we bring to the Kingdom suits the people who use it and keeps performing long after installation.", "نقدم الاستشارة المتخصصة والاختيار السليم للأنظمة والدعم طويل الأمد، لتكون كل تقنية نوفرها في المملكة ملائمة لمن يستخدمها، وتواصل أداءها بكفاءة لفترة طويلة بعد تركيبها.")}</p>
    </div>
  </div>
</section>
<section class="section dark">
  <div class="container">
    ${sectionHead({ title: c.t("What you can expect from us", "ما يمكنك أن تتوقعه منا"), side: `<a class="btn btn--outline-light" href="${c.u("/contact")}">${c.t("Talk to us", "تحدث إلينا")}</a>` })}
    <div class="pillars pillars--3 reveal-stagger">${values.map(([, h, p]) => `<div class="pillar"><h3>${h}</h3><p>${p}</p></div>`).join("")}</div>
  </div>
</section>
<section class="section">
  <div class="container">
    ${sectionHead({ title: c.t("Our divisions", "أقسامنا") })}
    <div class="divisions reveal-stagger">${divisionCards(c)}</div>
    <div class="mt-l"><h3 class="h3" style="margin-bottom:24px">${c.t("Who we work with", "الجهات التي نخدمها")}</h3>${sectors(c)}</div>
  </div>
</section>
<section class="section section--tint" id="careers">
  <div class="container split">
    <div class="split__copy reveal">
      <h2 class="h2">${c.t("Careers", "الوظائف")}</h2>
      <p class="lede">${c.t("We're always glad to hear from application specialists, service engineers, and sales and regulatory professionals who care about getting diagnostics right.", "يسعدنا دائمًا التواصل مع أخصائيي التطبيقات ومهندسي الخدمة ومتخصصي المبيعات والشؤون التنظيمية ممن يهتمون بدقة التشخيص.")}</p>
      <a class="btn btn--wrap" href="mailto:${site.company.careers_email}?subject=${encodeURIComponent(c.t("Application: Binary System Medical", "طلب توظيف: باينري سيستم الطبية"))}">${icon("mail")} ${c.t("Send your CV to", "أرسل سيرتك الذاتية إلى")} ${site.company.careers_email}</a>
    </div>
    <div class="reveal">${img("/images/photos/team-lab.webp", c.t("The BSM team in the laboratory", "فريق BSM في المختبر"), { cls: "photo" })}</div>
  </div>
</section>
<section class="section section--violet">
  <div class="container">
    ${ctaBand(c, {
      title: c.t("Planning a new system or an upgrade?", "هل تخطط لنظام جديد أو لتحديث نظامك الحالي؟"),
      text: c.t("Tell us about your facility and the tests you run, and we'll help you find the right technology.", "أخبرنا عن منشأتك والفحوصات التي تجريها، وسنساعدك في إيجاد التقنية المناسبة."),
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
      <h3>${esc(b.name)} <span class="brand-card__divs">${divs}</span></h3>
      <p>${esc(c.tx(b).about)}</p>
      <div class="brand-card__products">${ps.map((p) => `<a class="chip" href="${c.u(`/products/${p.slug}`)}">${esc(c.tx(p).name)}</a>`).join("")}</div>
      <a class="brand-card__site" href="${esc(b.website)}" rel="noopener" target="_blank">${esc(b.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""))} ${icon("external")}</a>
    </article>`;
  }).join("");
  const pillars = [
    ["map", c.t("Market access across the Kingdom", "الوصول إلى السوق في أنحاء المملكة"), c.t("Regional market offices and established relationships with hospitals, laboratories, universities and research centres.", "مكاتب إقليمية وعلاقات راسخة مع المستشفيات والمختبرات والجامعات ومراكز الأبحاث.")],
    ["fileCheck", c.t("Regulatory know-how", "خبرة تنظيمية"), c.t("An SFDA-certified company that understands Saudi healthcare regulations and international standards.", "شركة معتمدة من هيئة الغذاء والدواء تفهم أنظمة القطاع الصحي السعودي والمعايير الدولية.")],
    ["users", c.t("Technical & application specialists", "أخصائيون فنيون وأخصائيو تطبيقات"), c.t("A team that installs your systems, trains users and handles service.", "فريق يتولى تركيب أنظمتك وتدريب المستخدمين وتقديم خدمات الصيانة.")],
    ["headset", c.t("Long-term customer care", "رعاية طويلة الأمد للعملاء"), c.t("After-sales support that keeps your customers' systems running.", "دعم ما بعد البيع يحافظ على تشغيل أنظمة عملائك.")],
  ];
  const main = `${pageHero(c, {
    crumbsItems,
    title: c.t("Manufacturers we represent in Saudi Arabia", "شركات التصنيع التي نمثلها في المملكة"),
    lede: c.t("We work with internationally recognised medical and diagnostic manufacturers and supply their technologies in Saudi Arabia, in line with international standards and Saudi regulations.", "نعمل مع شركات تصنيع طبية وتشخيصية معروفة دوليًا، ونورّد تقنياتها في المملكة العربية السعودية وفق المعايير الدولية والأنظمة السعودية."),
    extra: `<div class="page-hero__meta"><span class="chip">${c.t(`${brands.length} featured manufacturers`, `${brands.length} شركة تصنيع مختارة`)}</span><span class="chip">${c.t("Europe · Asia · North America", "أوروبا · آسيا · أمريكا الشمالية")}</span></div>`,
  })}
<section class="section">
  <div class="container">
    ${sectionHead({ title: c.t("Brand directory", "دليل العلامات التجارية"), lede: c.t("Explore each partner and the technologies we supply from them in Saudi Arabia.", "تعرّف على كل شريك والتقنيات التي نوفرها منه في المملكة العربية السعودية.") })}
    <div class="brand-grid">${cards}</div>
  </div>
</section>
<section class="section section--tint" id="manufacturers">
  <div class="container split">
    <div class="split__copy">
      <h2 class="h2">${c.t("For manufacturers: bring your technology to Saudi Arabia", "لشركات التصنيع: أدخل تقنيتك إلى السوق السعودية")}</h2>
      <p class="lede">${c.t("We look for manufacturers whose technologies improve diagnostics and patient care. We bring market knowledge, regulatory experience and a technical team that installs, trains users and services the equipment.", "نبحث عن شركات تصنيع تسهم تقنياتها في تحسين التشخيص ورعاية المرضى. ونقدم لها المعرفة بالسوق والخبرة التنظيمية وفريقًا فنيًا يتولى التركيب وتدريب المستخدمين وصيانة الأجهزة.")}</p>
      <div class="hero__ctas"><a class="btn" href="${c.u("/contact")}?topic=partnership">${c.t("Discuss a partnership", "ناقش فرصة شراكة")} ${icon("arrow")}</a></div>
    </div>
    <div class="pillars pillars--light reveal-stagger">${pillars.map(([, h, p]) => `<div class="pillar"><h3>${h}</h3><p>${p}</p></div>`).join("")}</div>
  </div>
</section>`;
  return {
    path: "/partners",
    nav: "partners",
    title: c.t("Our Partners | Global Diagnostic & Medical Device Brands | BSM", "شركاؤنا | علامات عالمية في التشخيص والأجهزة الطبية | BSM"),
    description: c.t("Binary System Medical partners with 3DHISTECH, Bosch, GeneProof, Vircell, Wantai, D-tek, terraplasma and more to bring diagnostic and medical technologies to Saudi Arabia.", "تتعاون باينري سيستم الطبية مع 3DHISTECH وBosch وGeneProof وVircell وWantai وD-tek وterraplasma وغيرها لتقديم تقنيات تشخيصية وطبية في المملكة العربية السعودية."),
    jsonld: [crumbsLd(c, crumbsItems)],
    main,
  };
}

export function contact(c) {
  const { company } = c.data.site;
  const crumbsItems = [homeCrumb(c), { name: c.t("Contact", "تواصل معنا"), href: c.u("/contact") }];
  const card = (href, ic, label, value, ext = false) => `<${href ? `a href="${href}"${ext ? ' rel="noopener" target="_blank"' : ""}` : "div"} class="contact-card"><span class="contact-card__icon">${icon(ic)}</span><div><small>${label}</small><span>${value}</span></div></${href ? "a" : "div"}>`;
  const main = `${pageHero(c, {
    crumbsItems,
    title: c.t("Talk to our team", "تحدث إلى فريقنا"),
    lede: c.t("Whether you run a hospital, laboratory, clinic or research centre, our team can help with product questions, quotations, technical support and partnerships.", "سواء كنت تدير مستشفى أو مختبرًا أو عيادة أو مركز أبحاث، يمكن لفريقنا مساعدتك في الاستفسارات عن المنتجات وعروض الأسعار والدعم الفني والشراكات."),
  })}
<section class="section">
  <div class="container contact-layout">
    <div class="stack-s">
      <div class="contact-cards">
        ${card(`mailto:${company.email}`, "mail", c.t("Email", "البريد الإلكتروني"), esc(company.email))}
        ${card(`tel:${company.phone_tel}`, "phone", c.t("Phone", "الهاتف"), `<span class="ltr">${esc(company.phone)}</span>`)}
        ${card(company.maps_url, "pin", c.t("Main office, Riyadh", "المكتب الرئيسي، الرياض"), `${esc(c.t(`${company.street}, ${company.city}`, `${company.street_ar}، ${company.city_ar}`))} <span class="ltr">${esc(company.postal_code)}</span>${esc(c.t(", Saudi Arabia", "، المملكة العربية السعودية"))}`, true)}
        ${card(`mailto:${company.careers_email}`, "briefcase", c.t("Careers", "الوظائف"), esc(company.careers_email))}
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
