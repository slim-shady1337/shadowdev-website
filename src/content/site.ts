// Single source of truth for every string on the page.
// Bosnian is rendered into the HTML (SEO + no-JS); English travels as data attributes.

export type Bi = { bs: string; en: string };

export const meta = {
  title: {
    bs: 'ShadowDev — jedan sistem za cijelu firmu',
    en: 'ShadowDev — one system for the whole company'
  },
  description: {
    bs: 'ShadowDev gradi ERP, MES i softver po mjeri, web stranice i mobilne aplikacije, pa ih povezuje u jedan sistem. Jedan partner, jedan sistem, sve povezano.',
    en: 'ShadowDev builds ERP, MES and custom software, websites and mobile apps, then connects them into one system. One partner, one system, everything connected.'
  },
  ogAlt: {
    bs: 'ShadowDev — OneForAll',
    en: 'ShadowDev — OneForAll'
  }
};

export const nav = {
  links: [
    { href: '#sistem', label: { bs: 'Sistem', en: 'System' } as Bi },
    { href: '#proces', label: { bs: 'Kako radimo', en: 'How we work' } as Bi },
    { href: '#sigurnost', label: { bs: 'Sigurnost', en: 'Security' } as Bi },
    { href: '#reference', label: { bs: 'Reference', en: 'Work' } as Bi },
    { href: '#kontakt', label: { bs: 'Kontakt', en: 'Contact' } as Bi }
  ] as { href: string; label: Bi }[],
  cta: { bs: 'Zakaži razgovor', en: 'Book a call' } as Bi,
  menuOpen: { bs: 'Otvori meni', en: 'Open menu' } as Bi,
  menuClose: { bs: 'Zatvori meni', en: 'Close menu' } as Bi,
  skip: { bs: 'Preskoči na sadržaj', en: 'Skip to content' } as Bi,
  home: { bs: 'ShadowDev — početak', en: 'ShadowDev — top' } as Bi
};

export const hero = {
  h1: { bs: 'Jedan sistem za cijelu firmu.', en: 'One system for the whole company.' } as Bi,
  lead: {
    bs: 'Gradimo ERP, MES, softver po mjeri, web i mobilne aplikacije — i povezujemo ih tako da firma radi iz jednog izvora podataka.',
    en: 'We build ERP, MES, custom software, web and mobile apps — and connect them so the company runs on one source of data.'
  } as Bi,
  cta: { bs: 'Zakaži razgovor', en: 'Book a call' } as Bi,
  secondary: { bs: 'Pogledaj sklop', en: 'See the assembly' } as Bi,
  plateLabel: { bs: 'OneForAll', en: 'OneForAll' } as Bi,
  plateValue: {
    bs: '1 partner · 6 sklopova · 1 sistem',
    en: '1 partner · 6 assemblies · 1 system'
  } as Bi,
  scroll: { bs: 'Skrolaj kroz sklop', en: 'Scroll through the assembly' } as Bi
};

export const legend = {
  h2: { bs: 'Jedan izvor podataka', en: 'One source of data' } as Bi,
  p1: {
    bs: 'Firme ne propadaju zbog manjka softvera. Propadaju na razlikama između tabela: ista šifra artikla u tri verzije, stanje skladišta koje ne zna za proizvodnju, izvještaj koji stiže pet dana poslije odluke.',
    en: 'Companies do not fail for lack of software. They fail in the gaps between spreadsheets: the same part number in three versions, a warehouse count that never reached production, a report that arrives five days after the decision.'
  } as Bi,
  p2: {
    bs: 'Sklop ispod je isti posao gledan iz šest uglova. Svaka stanica je jedan dio sistema — a sistem postoji tek kad su dijelovi povezani.',
    en: 'The assembly below is the same work seen from six angles. Each station is one part of the system — and the system only exists once the parts are connected.'
  } as Bi,
  indexTitle: { bs: 'Sadržaj sklopa', en: 'Assembly index' } as Bi,
  indexNote: { bs: 'Šest stanica, jedan sklop', en: 'Six stations, one assembly' } as Bi
};

export type Station = {
  n: number;
  code: string;
  kind: Bi;
  title: Bi;
  lead: Bi;
  body: Bi;
  terms: Bi;
  href: string;
  spec: Bi;
};

export const stations: Station[] = [
  {
    n: 1,
    code: 'SKLOP 01',
    kind: { bs: 'ERP', en: 'ERP' },
    title: { bs: 'Poslovni sistem', en: 'Business system' },
    lead: {
      bs: 'Finansije, nabavka, skladište i kadrovi na jednom mjestu.',
      en: 'Finance, procurement, warehouse and HR in one place.'
    },
    body: {
      bs: 'Kad nabavka uđe u sistem, skladište i finansije to vide odmah — bez prepisivanja i bez dvije istine. Izvještaj koji vam treba postoji prije nego što ga zatražite.',
      en: 'When procurement enters an order, warehouse and finance see it immediately — no retyping, no two versions of the truth. The report you need already exists before you ask for it.'
    },
    terms: { bs: 'Finansije · Nabavka · Skladište · Kadrovi', en: 'Finance · Procurement · Warehouse · HR' },
    href: '#kontakt',
    spec: { bs: 'Jedan izvor podataka za cijelu firmu', en: 'One source of data for the whole company' }
  },
  {
    n: 2,
    code: 'SKLOP 02',
    kind: { bs: 'MES', en: 'MES' },
    title: { bs: 'Proizvodnja', en: 'Production' },
    lead: {
      bs: 'Radni nalozi, mašine i materijal u jednom toku.',
      en: 'Work orders, machines and material in one flow.'
    },
    body: {
      bs: 'Vidite gdje posao stoji, koliko traje svaka operacija i šta košta sat zastoja. Izvještaj se piše sam, iz podataka koje sistem već ima.',
      en: 'See where work is stuck, how long each operation takes and what an hour of downtime costs. The report writes itself from data the system already holds.'
    },
    terms: { bs: 'Radni nalozi · Mašine · Operacije · Izvještaji', en: 'Work orders · Machines · Operations · Reporting' },
    href: '#kontakt',
    spec: { bs: 'Praćenje proizvodnje u realnom vremenu', en: 'Production tracking in real time' }
  },
  {
    n: 3,
    code: 'SKLOP 03',
    kind: { bs: 'Po mjeri', en: 'Custom' },
    title: { bs: 'Rješenja po mjeri', en: 'Custom solutions' },
    lead: {
      bs: 'Povezujemo ono što već imate. Gdje gotovo rješenje ne postoji, gradimo ga.',
      en: 'We connect what you already run. Where no off-the-shelf solution exists, we build it.'
    },
    body: {
      bs: 'Računovodstvo, skladište, mašine, web — sve dobija isto mjesto za razmjenu podataka. Softver ostaje vaš, sa dokumentacijom i izvozom podataka.',
      en: 'Accounting, warehouse, machines, web — all of it gets one place to exchange data. The software stays yours, with documentation and data export.'
    },
    terms: { bs: 'Integracije · API · Automatizacija', en: 'Integrations · API · Automation' },
    href: '#kontakt',
    spec: { bs: 'Sistemi koji razgovaraju međusobno', en: 'Systems that talk to each other' }
  },
  {
    n: 4,
    code: 'SKLOP 04',
    kind: { bs: 'Web', en: 'Web' },
    title: { bs: 'Web i web aplikacije', en: 'Websites and web apps' },
    lead: {
      bs: 'Stranica koja se brzo učitava ili aplikacija koja zamjenjuje Excel.',
      en: 'A site that loads fast, or an app that replaces spreadsheets.'
    },
    body: {
      bs: 'Radi na svakom uređaju, pristupačno i mjerljivo. Povezana sa sistemom iza, da sadržaj i podaci ne žive odvojeno.',
      en: 'It works on every device, accessible and measurable. Connected to the system behind it, so content and data do not live apart.'
    },
    terms: { bs: 'Web stranice · Web aplikacije · CMS', en: 'Websites · Web apps · CMS' },
    href: '#kontakt',
    spec: { bs: 'Brzo, pristupačno, povezano sa sistemom', en: 'Fast, accessible, connected to the system' }
  },
  {
    n: 5,
    code: 'SKLOP 05',
    kind: { bs: 'Mobilno', en: 'Mobile' },
    title: { bs: 'Mobilne aplikacije', en: 'Mobile apps' },
    lead: {
      bs: 'Aplikacija za iOS i Android, povezana sa vašim podacima.',
      en: 'An iOS and Android app connected to your data.'
    },
    body: {
      bs: 'Teren, skladište i prodaja unose ono što se dogodilo — odmah, bez papira i bez duplog unosa između dvije smjene.',
      en: 'Field staff, warehouse and sales enter what happened — immediately, without paper and without double entry between shifts.'
    },
    terms: { bs: 'iOS · Android · Terenski rad', en: 'iOS · Android · Field work' },
    href: '#kontakt',
    spec: { bs: 'Podaci iz hale i sa terena, odmah', en: 'Data from the floor and the field, immediately' }
  },
  {
    n: 6,
    code: 'SKLOP 06',
    kind: { bs: 'Marketing', en: 'Marketing' },
    title: { bs: 'Digitalni marketing', en: 'Digital marketing' },
    lead: {
      bs: 'Vidljivost, kampanje i mjerenje na jednom mjestu.',
      en: 'Visibility, campaigns and measurement in one place.'
    },
    body: {
      bs: 'Ne trošimo budžet naslijepo: pratimo šta donosi upite i posao, i gasimo ono što ne radi. Tako sistem koji ste izgradili ne ostaje najbolje čuvana tajna.',
      en: 'We do not spend budget blindly: we track what brings inquiries and business, and stop what does not work. So the system you built does not stay your best-kept secret.'
    },
    terms: { bs: 'SEO · Kampanje · Analitika', en: 'SEO · Campaigns · Analytics' },
    href: '#kontakt',
    spec: { bs: 'Mjerenje koje pokazuje šta donosi posao', en: 'Measurement that shows what brings business' }
  }
];

export const convergence = {
  h2: { bs: 'Šest dijelova. Jedan sklop.', en: 'Six parts. One assembly.' } as Bi,
  lead: {
    bs: 'Kad se povežu, ne kupujete šest alata — imate jedan sistem. Nova funkcionalnost ulazi u isti tok podataka, a odgovornost ostaje na jednom mjestu.',
    en: 'Connected, you are not buying six tools — you have one system. New functionality joins the same data flow, and responsibility stays in one place.'
  } as Bi,
  core: { bs: 'Jezgro', en: 'Core' } as Bi,
  labels: {
    erp: { bs: 'ERP', en: 'ERP' } as Bi,
    mes: { bs: 'MES', en: 'MES' } as Bi,
    custom: { bs: 'Po mjeri', en: 'Custom' } as Bi,
    web: { bs: 'Web', en: 'Web' } as Bi,
    mobile: { bs: 'Mobilno', en: 'Mobile' } as Bi,
    marketing: { bs: 'Marketing', en: 'Marketing' } as Bi
  },
  caption: {
    bs: 'Isti podaci, jedan tok. Svaki novi modul ulazi u već postojeći sklop.',
    en: 'Same data, one flow. Every new module joins the assembly that already exists.'
  } as Bi
};

export const process = {
  eyebrow: { bs: 'Redoslijed rada', en: 'Sequence of work' } as Bi,
  h2: { bs: 'Kako radimo', en: 'How we work' } as Bi,
  lead: {
    bs: 'Pet koraka, istim redom svaki put. Na kraju svakog koraka dobijate nešto što možete pregledati — ne prezentaciju.',
    en: 'Five steps, in the same order every time. Each step ends with something you can inspect — not a presentation.'
  } as Bi,
  resultLabel: { bs: 'Rezultat', en: 'Output' } as Bi,
  steps: [
    {
      op: '10',
      name: { bs: 'Analiza', en: 'Analysis' } as Bi,
      text: {
        bs: 'Gledamo kako firma stvarno radi: ko šta unosi, gdje se gubi vrijeme i koji podatak nedostaje da bi odluka bila tačna.',
        en: 'We look at how the company actually works: who enters what, where time is lost, and which data is missing for a decision to be correct.'
      } as Bi,
      result: { bs: 'Popis procesa i prioriteta', en: 'A map of processes and priorities' } as Bi
    },
    {
      op: '20',
      name: { bs: 'Dizajn', en: 'Design' } as Bi,
      text: {
        bs: 'Dogovaramo kako sistem izgleda prije nego što ga gradimo: ekrani, tok podataka, prava pristupa.',
        en: 'We agree on how the system looks before building it: screens, data flow, access rights.'
      } as Bi,
      result: { bs: 'Odobren dizajn i plan isporuke', en: 'Approved design and delivery plan' } as Bi
    },
    {
      op: '30',
      name: { bs: 'Razvoj', en: 'Development' } as Bi,
      text: {
        bs: 'Gradimo u kratkim ciklusima. Pokazujemo radnu verziju, ne izvještaj o napretku.',
        en: 'We build in short cycles. We show a working version, not a progress report.'
      } as Bi,
      result: { bs: 'Radni sistem, dio po dio', en: 'A working system, part by part' } as Bi
    },
    {
      op: '40',
      name: { bs: 'Isporuka', en: 'Delivery' } as Bi,
      text: {
        bs: 'Prebacujemo podatke, obučavamo ljude i puštamo sistem u rad. Prve sedmice smo uz korisnike.',
        en: 'We migrate data, train people and go live. We stay beside the users for the first weeks.'
      } as Bi,
      result: { bs: 'Sistem u produkciji', en: 'The system in production' } as Bi
    },
    {
      op: '50',
      name: { bs: 'Podrška', en: 'Support' } as Bi,
      text: {
        bs: 'Održavamo, mjerimo i dodajemo ono što se pokaže potrebnim. Sistem raste sa firmom.',
        en: 'We maintain, measure and add what turns out to be needed. The system grows with the company.'
      } as Bi,
      result: { bs: 'Partner, ne jednokratni projekat', en: 'A partner, not a one-off project' } as Bi
    }
  ]
};

export const security = {
  eyebrow: { bs: 'Ugled', en: 'Trust' } as Bi,
  h2: { bs: 'Sigurnost i pouzdanost', en: 'Security and reliability' } as Bi,
  lead: {
    bs: 'Ovo su mehanizmi koje ugrađujemo u sistem. Ne navodimo certifikate koje nemamo i ne obećavamo brojke koje ne možemo izmjeriti.',
    en: 'These are the mechanisms we build into the system. We do not list certificates we do not hold, and we do not promise numbers we cannot measure.'
  } as Bi,
  items: [
    {
      k: { bs: 'Pristup po ulozi', en: 'Role-based access' } as Bi,
      v: {
        bs: 'Svako vidi samo ono što mu posao traži. Prava se dodjeljuju po ulozi, ne po osobi, i mijenjaju se bez diranja podataka.',
        en: 'Everyone sees only what their job requires. Rights are assigned by role, not by person, and change without touching the data.'
      } as Bi
    },
    {
      k: { bs: 'Zapis svake promjene', en: 'A record of every change' } as Bi,
      v: {
        bs: 'Ko je šta promijenio i kada. Kad se pojavi razlika u brojevima, zna se odakle je došla.',
        en: 'Who changed what, and when. When two numbers disagree, you can see where the difference started.'
      } as Bi
    },
    {
      k: { bs: 'Rezervne kopije', en: 'Backups' } as Bi,
      v: {
        bs: 'Redovne kopije i provjereno vraćanje. Kopija koja nikad nije vraćena nije kopija, nego nada.',
        en: 'Regular copies and a tested restore. A backup that was never restored is not a backup, it is a hope.'
      } as Bi
    },
    {
      k: { bs: 'Vaši podaci ostaju vaši', en: 'Your data stays yours' } as Bi,
      v: {
        bs: 'Sistem i baza su vaše vlasništvo. Izvoz podataka je dio isporuke, ne dodatna usluga koju plaćate kad odlazite.',
        en: 'The system and the database belong to you. Data export is part of delivery, not an extra you pay for when you leave.'
      } as Bi
    }
  ]
};

export const proof = {
  eyebrow: { bs: 'Reference', en: 'Work' } as Bi,
  h2: { bs: 'Reference i brojke', en: 'Work and numbers' } as Bi,
  lead: {
    bs: 'Ovaj prostor čeka stvarne projekte i izmjerene rezultate. Do tada stoji oznaka — ne izmišljeni klijenti.',
    en: 'This space is waiting for real projects and measured results. Until then it carries a marker — not invented clients.'
  } as Bi,
  placeholder: { bs: 'PLACEHOLDER', en: 'PLACEHOLDER' } as Bi,
  cards: [
    {
      sector: { bs: 'Sektor · Godina', en: 'Sector · Year' } as Bi,
      title: { bs: 'Naziv projekta', en: 'Project name' } as Bi,
      text: {
        bs: 'Jedna rečenica: kakav je problem bio i šta je sistem promijenio. Ovdje idu stvarni podaci, uz dozvolu klijenta.',
        en: 'One sentence: what the problem was and what the system changed. Real data goes here, with the client’s permission.'
      } as Bi
    },
    {
      sector: { bs: 'Sektor · Godina', en: 'Sector · Year' } as Bi,
      title: { bs: 'Naziv projekta', en: 'Project name' } as Bi,
      text: {
        bs: 'Jedna rečenica: kakav je problem bio i šta je sistem promijenio. Ovdje idu stvarni podaci, uz dozvolu klijenta.',
        en: 'One sentence: what the problem was and what the system changed. Real data goes here, with the client’s permission.'
      } as Bi
    }
  ],
  figures: [
    { label: { bs: 'Godine rada', en: 'Years in business' } as Bi },
    { label: { bs: 'Sistema u produkciji', en: 'Systems in production' } as Bi },
    { label: { bs: 'Prosječno trajanje projekta', en: 'Average project length' } as Bi }
  ],
  note: {
    bs: 'Popuniti stvarnim i izmjerenim podacima prije objave sajta.',
    en: 'Fill with real, measured data before the site goes live.'
  } as Bi
};

export const contact = {
  eyebrow: { bs: 'Kontakt', en: 'Contact' } as Bi,
  h2: { bs: 'Pošaljite upit', en: 'Send an inquiry' } as Bi,
  lead: {
    bs: 'Napišite šta vam treba i šta već koristite. Javit ćemo se sa terminom za razgovor — bez obaveze.',
    en: 'Tell us what you need and what you already run. We will come back with a time to talk — no obligation.'
  } as Bi,
  form: {
    name: { bs: 'Ime i prezime', en: 'Full name' } as Bi,
    email: { bs: 'Email', en: 'Email' } as Bi,
    company: { bs: 'Firma', en: 'Company' } as Bi,
    companyOptional: { bs: 'opcionalno', en: 'optional' } as Bi,
    topic: { bs: 'Šta vam treba', en: 'What you need' } as Bi,
    topicPlaceholder: { bs: 'Odaberite', en: 'Choose one' } as Bi,
    topics: [
      { bs: 'ERP sistem', en: 'ERP system' },
      { bs: 'MES / praćenje proizvodnje', en: 'MES / production tracking' },
      { bs: 'Softver po mjeri', en: 'Custom software' },
      { bs: 'Web stranica ili aplikacija', en: 'Website or web app' },
      { bs: 'Mobilna aplikacija', en: 'Mobile app' },
      { bs: 'Digitalni marketing', en: 'Digital marketing' },
      { bs: 'Nisam siguran', en: 'Not sure yet' }
    ],
    message: { bs: 'Poruka', en: 'Message' } as Bi,
    messageHint: {
      bs: 'Dovoljno je nekoliko rečenica o firmi i problemu.',
      en: 'A few sentences about the company and the problem are enough.'
    },
    submit: { bs: 'Pošalji upit', en: 'Send inquiry' } as Bi,
    sending: { bs: 'Šaljem…', en: 'Sending…' } as Bi,
    privacy: {
      bs: 'Podatke koristimo samo da odgovorimo na ovaj upit.',
      en: 'We use your details only to answer this inquiry.'
    },
    errors: {
      name: { bs: 'Unesite ime i prezime (najmanje 2 znaka).', en: 'Enter your full name (at least 2 characters).' } as Bi,
      email: { bs: 'Provjerite email — treba izgledati kao ime@firma.ba.', en: 'Check the email — it should look like name@company.com.' } as Bi,
      message: { bs: 'Napišite barem 20 znakova da znamo s čime da počnemo.', en: 'Write at least 20 characters so we know where to start.' } as Bi,
      topic: { bs: 'Odaberite temu upita.', en: 'Choose a topic.' } as Bi,
      summary: { bs: 'Provjerite polja označena ispod.', en: 'Check the fields marked below.' } as Bi,
      sendFailed: {
        bs: 'Slanje nije uspjelo. Pokušajte ponovo ili pišite na kontakt@shadowdev.ba.',
        en: 'Sending failed. Try again, or write to kontakt@shadowdev.ba.'
      } as Bi
    },
    done: {
      title: { bs: 'Upit je poslan.', en: 'Inquiry sent.' } as Bi,
      text: {
        bs: 'Javit ćemo se sa terminom za razgovor. Ako vam je hitno, pozovite broj ispod.',
        en: 'We will come back with a time to talk. If it is urgent, call the number below.'
      } as Bi
    }
  },
  details: [
    { label: { bs: 'Email', en: 'Email' } as Bi, value: 'kontakt@shadowdev.ba', href: 'mailto:kontakt@shadowdev.ba' },
    { label: { bs: 'Telefon', en: 'Phone' } as Bi, value: '+387 61 000 000', href: 'tel:+38761000000' },
    { label: { bs: 'Lokacija', en: 'Location' } as Bi, value: 'Sarajevo, Bosna i Hercegovina', href: '' }
  ],
  responseNote: {
    bs: 'Ako ostavite email ili telefon, javit ćemo se sa terminom za razgovor.',
    en: 'Leave an email or a phone number and we will come back with a time to talk.'
  } as Bi
};

export const footer = {
  tagline: { bs: 'Jedan partner, jedan sistem, sve povezano.', en: 'One partner, one system, everything connected.' } as Bi,
  services: { bs: 'Usluge', en: 'Services' } as Bi,
  contactTitle: { bs: 'Kontakt', en: 'Contact' } as Bi,
  assembly: { bs: 'Sklop', en: 'Assembly' } as Bi,
  top: { bs: 'Na vrh', en: 'Back to top' } as Bi,
  rights: { bs: '© 2026 ShadowDev. Sva prava zadržana.', en: '© 2026 ShadowDev. All rights reserved.' } as Bi,
  place: { bs: 'Sarajevo, Bosna i Hercegovina', en: 'Sarajevo, Bosnia and Herzegovina' } as Bi
};

export const ui = {
  lang: { bs: 'Jezik', en: 'Language' } as Bi,
  toTop: { bs: 'Na vrh', en: 'Back to top' } as Bi
};
