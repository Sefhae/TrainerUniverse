'use client';

import { useLanguage } from '../../hooks/useLanguage';

type Block = { p: string } | { ul: string[] };
interface Section {
  title: string;
  blocks: Block[];
}
interface AgreementDoc {
  legal: string;
  title: string;
  subtitle: string;
  updatedLabel: string;
  updated: string;
  intro: string;
  calloutLabel: string;
  callout: string;
  sections: Section[];
  closing: string;
}

const EN: AgreementDoc = {
  legal: 'Legal',
  title: 'User Agreement',
  subtitle: 'Kullanıcı Sözleşmesi',
  updatedLabel: 'Last updated',
  updated: 'June 8, 2026',
  intro:
    'This User Agreement (the “Agreement”) is a binding contract between you and TrainerUniverse (“TrainerUniverse,” “we,” “us,” or “the Platform”). It governs your access to and use of the Platform, whether as a trainer, a student, or a visitor. By creating an account or otherwise using the Platform, you confirm that you have read, understood, and agree to be bound by this Agreement.',
  calloutLabel: 'Please read carefully',
  callout:
    'TrainerUniverse is only a venue that introduces trainers and students. We are not a party to any arrangement, session, lesson, or meeting between users, and we are not responsible or liable for anything that happens between a trainer and a student — online or in person, on or off the Platform. You use the Platform and meet other users entirely at your own risk.',
  sections: [
    {
      title: 'Acceptance of this Agreement',
      blocks: [
        { p: 'You must accept this Agreement to create an account. If you do not agree with any part of it, do not register for or use the Platform. If you use the Platform on behalf of an organization, you represent that you are authorized to bind that organization to this Agreement.' },
      ],
    },
    {
      title: 'What TrainerUniverse Is — and Is Not',
      blocks: [
        { p: 'TrainerUniverse is an online marketplace that helps independent trainers, coaches, and tutors (“Trainers”) present their services and helps users (“Students”) discover and contact them. The Platform provides listings, search, messaging, and booking tools.' },
        { p: 'TrainerUniverse is not a gym, a training provider, a healthcare or medical provider, an employer, an agency, or a party to the relationship between a Trainer and a Student. We do not provide training, coaching, tutoring, medical, nutritional, or health advice, and nothing on the Platform should be treated as such.' },
      ],
    },
    {
      title: 'No Endorsement, Employment, or Supervision',
      blocks: [
        { p: 'Trainers are independent third parties, not employees, agents, partners, or representatives of TrainerUniverse. We do not direct, control, supervise, or monitor the services Trainers provide. Listings, ratings, and badges do not constitute an endorsement, recommendation, certification, or guarantee by us of any Trainer, Student, or their qualifications, credentials, conduct, or services.' },
      ],
    },
    {
      title: 'No Screening Guarantee',
      blocks: [
        { p: 'We do not guarantee that we conduct background checks, identity verification, licensing checks, or qualification checks on any user, and any verification feature we may offer is limited and provided without warranty. You are solely responsible for evaluating, and deciding whether to interact with, any Trainer or Student, including verifying their identity, credentials, insurance, certifications, and suitability.' },
      ],
    },
    {
      title: 'Assumption of Risk',
      blocks: [
        { p: 'Physical exercise, sports, and training carry inherent risks, including the risk of serious injury, illness, disability, or death. You voluntarily and knowingly assume all such risks arising from any session, activity, advice, or meeting connected to the Platform.' },
        { p: 'You are responsible for your own health and safety. You should consult a qualified physician before beginning any training, exercise, nutrition, or wellness program. Do not rely on a Trainer or the Platform for medical clearance.' },
      ],
    },
    {
      title: 'Release and Waiver of Liability',
      blocks: [
        { p: 'To the fullest extent permitted by law, you release, waive, and discharge TrainerUniverse and its owners, officers, employees, and affiliates from any and all claims, demands, damages, injuries, losses, liabilities, or expenses of any kind — whether direct or indirect, known or unknown — arising out of or related to:' },
        { ul: [
          'any interaction, communication, session, lesson, transaction, or meeting between users, whether online or in person;',
          'the conduct, acts, or omissions of any Trainer, Student, or other user;',
          'any injury, harm, loss, or damage to persons or property occurring before, during, or after any session or meeting;',
          'the quality, safety, legality, or outcome of any service obtained through the Platform;',
          'any dispute between users, including payment, scheduling, or service disputes.',
        ] },
        { p: 'Any arrangement you make with another user is strictly between you and that user.' },
      ],
    },
    {
      title: 'Indemnification',
      blocks: [
        { p: 'You agree to indemnify and hold harmless TrainerUniverse and its affiliates from any claim, liability, damage, loss, or expense (including reasonable legal fees) arising out of your use of the Platform, your interactions or meetings with other users, your breach of this Agreement, or your violation of any law or the rights of any third party.' },
      ],
    },
    {
      title: 'User Conduct and Responsibilities',
      blocks: [
        { p: 'You are solely responsible for your own conduct and your dealings with other users. You agree not to:' },
        { ul: [
          'provide false, misleading, or fraudulent information;',
          'harass, threaten, abuse, defraud, or harm any other user;',
          'offer or request unlawful, unsafe, or prohibited services;',
          'circumvent the Platform’s fees, tools, or safety features in a way that violates this Agreement;',
          'infringe the intellectual property or privacy rights of others.',
        ] },
      ],
    },
    {
      title: 'Bookings, Payments, and Cancellations',
      blocks: [
        { p: 'Rates, packages, scheduling, refunds, and cancellation terms are set and agreed directly between Trainers and Students. TrainerUniverse is not responsible for collecting, holding, or refunding payments made directly between users, nor for any failure of a user to deliver or pay for services.' },
      ],
    },
    {
      title: 'Eligibility',
      blocks: [
        { p: 'You must be at least 18 years old (or the age of majority in your jurisdiction) to create an account. Where a minor is involved in training, a parent or legal guardian must accept this Agreement and supervise the arrangement and is responsible for it.' },
      ],
    },
    {
      title: 'Accounts and Accuracy',
      blocks: [
        { p: 'You are responsible for keeping your login credentials secure and for all activity under your account. You agree to provide accurate information and to keep it up to date. We may suspend or terminate accounts that violate this Agreement.' },
      ],
    },
    {
      title: 'Disclaimer of Warranties',
      blocks: [
        { p: 'The Platform is provided “as is” and “as available,” without warranties of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, accuracy, or non-infringement. We do not warrant that the Platform will be uninterrupted, secure, or error-free, or that any user or service will meet your expectations.' },
      ],
    },
    {
      title: 'Limitation of Liability',
      blocks: [
        { p: 'To the fullest extent permitted by law, TrainerUniverse and its affiliates will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss of profits, data, goodwill, or for personal injury, arising out of or related to your use of the Platform or your interactions with other users. Our total aggregate liability for any claim relating to the Platform will not exceed the greater of the total fees you paid to TrainerUniverse in the twelve (12) months before the claim or USD 100.' },
      ],
    },
    {
      title: 'Content and Reviews',
      blocks: [
        { p: 'You are responsible for the content you post, including profiles, messages, and reviews, and you grant us a non-exclusive license to display it on the Platform. Reviews must be honest and based on genuine experience. We may remove content that violates this Agreement or applicable law.' },
      ],
    },
    {
      title: 'Termination',
      blocks: [
        { p: 'You may stop using the Platform at any time. We may suspend or terminate your access at our discretion, including for breach of this Agreement. Sections that by their nature should survive termination — including the release, indemnification, disclaimers, and limitation of liability — will survive.' },
      ],
    },
    {
      title: 'Changes to this Agreement',
      blocks: [
        { p: 'We may update this Agreement from time to time. If we make material changes, we will update the “Last updated” date above. Your continued use of the Platform after changes take effect constitutes acceptance of the revised Agreement.' },
      ],
    },
    {
      title: 'Governing Law',
      blocks: [
        { p: 'This Agreement is governed by the laws of the jurisdiction in which TrainerUniverse is established, without regard to its conflict-of-laws rules. The courts of that jurisdiction will have exclusive jurisdiction over any dispute, to the extent permitted by law.' },
      ],
    },
    {
      title: 'Contact',
      blocks: [
        { p: 'Questions about this Agreement can be sent through the Platform’s contact channels.' },
      ],
    },
  ],
  closing:
    'By creating an account, you acknowledge that you have read and agree to this User Agreement, including the assumption of risk and the release of liability for any interaction or meeting between trainers and students.',
};

const TR: AgreementDoc = {
  legal: 'Yasal',
  title: 'Kullanıcı Sözleşmesi',
  subtitle: 'User Agreement',
  updatedLabel: 'Son güncelleme',
  updated: '8 Haziran 2026',
  intro:
    'Bu Kullanıcı Sözleşmesi (“Sözleşme”), sizinle TrainerUniverse (“TrainerUniverse”, “biz” veya “Platform”) arasında bağlayıcı bir sözleşmedir. İster antrenör, ister öğrenci, ister ziyaretçi olun, Platform’a erişiminizi ve Platform’u kullanımınızı düzenler. Bir hesap oluşturarak veya Platform’u kullanarak; bu Sözleşme’yi okuduğunuzu, anladığınızı ve onunla bağlı olmayı kabul ettiğinizi onaylarsınız.',
  calloutLabel: 'Lütfen dikkatlice okuyun',
  callout:
    'TrainerUniverse yalnızca antrenörlerle öğrencileri buluşturan bir aracıdır. Kullanıcılar arasındaki hiçbir anlaşmaya, seansa, derse veya görüşmeye taraf değiliz ve bir antrenör ile bir öğrenci arasında — çevrimiçi ya da yüz yüze, Platform içinde veya dışında — yaşanan hiçbir şeyden sorumlu veya yükümlü değiliz. Platform’u kullanmanız ve diğer kullanıcılarla buluşmanız tamamen kendi sorumluluğunuzdadır.',
  sections: [
    {
      title: 'Bu Sözleşme’nin Kabulü',
      blocks: [
        { p: 'Hesap oluşturmak için bu Sözleşme’yi kabul etmeniz gerekir. Herhangi bir bölümünü kabul etmiyorsanız Platform’a kaydolmayın veya Platform’u kullanmayın. Platform’u bir kuruluş adına kullanıyorsanız, o kuruluşu bu Sözleşme ile bağlamaya yetkili olduğunuzu beyan edersiniz.' },
      ],
    },
    {
      title: 'TrainerUniverse Nedir — ve Ne Değildir',
      blocks: [
        { p: 'TrainerUniverse; bağımsız antrenörlerin, koçların ve eğitmenlerin (“Antrenörler”) hizmetlerini sunmasına ve kullanıcıların (“Öğrenciler”) onları keşfedip iletişime geçmesine yardımcı olan çevrimiçi bir pazar yeridir. Platform; ilan, arama, mesajlaşma ve randevu araçları sağlar.' },
        { p: 'TrainerUniverse bir spor salonu, bir antrenman sağlayıcısı, bir sağlık veya tıbbi hizmet sağlayıcısı, bir işveren, bir acente ya da Antrenör ile Öğrenci arasındaki ilişkinin tarafı değildir. Antrenman, koçluk, eğitmenlik, tıbbi, beslenme veya sağlık tavsiyesi vermeyiz ve Platform’daki hiçbir şey bu şekilde değerlendirilmemelidir.' },
      ],
    },
    {
      title: 'Onay, İstihdam veya Denetim Yoktur',
      blocks: [
        { p: 'Antrenörler bağımsız üçüncü taraflardır; TrainerUniverse’in çalışanı, temsilcisi, ortağı veya vekili değildir. Antrenörlerin sunduğu hizmetleri yönlendirmez, kontrol etmez, denetlemez veya gözetlemeyiz. İlanlar, puanlar ve rozetler; herhangi bir Antrenör, Öğrenci veya bunların nitelikleri, belgeleri, davranışları ya da hizmetleri hakkında tarafımızdan bir onay, tavsiye, sertifika veya garanti anlamına gelmez.' },
      ],
    },
    {
      title: 'Eleme Garantisi Yoktur',
      blocks: [
        { p: 'Herhangi bir kullanıcı için adli sicil kontrolü, kimlik doğrulaması, lisans veya nitelik kontrolü yaptığımızı garanti etmeyiz; sunabileceğimiz herhangi bir doğrulama özelliği sınırlıdır ve garantisiz sağlanır. Herhangi bir Antrenör veya Öğrenci’yi değerlendirmek ve onlarla etkileşime girip girmemeye karar vermek — kimliklerini, belgelerini, sigortalarını, sertifikalarını ve uygunluklarını doğrulamak dahil — yalnızca sizin sorumluluğunuzdadır.' },
      ],
    },
    {
      title: 'Riskin Üstlenilmesi',
      blocks: [
        { p: 'Fiziksel egzersiz, spor ve antrenman; ciddi yaralanma, hastalık, sakatlık veya ölüm riski dahil olmak üzere doğası gereği riskler içerir. Platform’la bağlantılı herhangi bir seans, faaliyet, tavsiye veya görüşmeden doğan tüm bu riskleri gönüllü ve bilerek üstlenirsiniz.' },
        { p: 'Kendi sağlığınızdan ve güvenliğinizden siz sorumlusunuz. Herhangi bir antrenman, egzersiz, beslenme veya sağlık programına başlamadan önce yetkin bir hekime danışmalısınız. Tıbbi onay için bir Antrenör’e veya Platform’a güvenmeyin.' },
      ],
    },
    {
      title: 'Sorumluluğun Bırakılması ve Feragat',
      blocks: [
        { p: 'Yürürlükteki yasaların izin verdiği en geniş ölçüde; aşağıdakilerden doğan veya bunlarla ilgili her türlü talep, dava, zarar, yaralanma, kayıp, yükümlülük veya masraftan — doğrudan ya da dolaylı, bilinen ya da bilinmeyen — TrainerUniverse’i ve sahiplerini, yöneticilerini, çalışanlarını ve bağlı kuruluşlarını ibra eder, feragat eder ve sorumluluktan kurtarırsınız:' },
        { ul: [
          'kullanıcılar arasında çevrimiçi veya yüz yüze her türlü etkileşim, iletişim, seans, ders, işlem veya görüşme;',
          'herhangi bir Antrenör’ün, Öğrenci’nin veya diğer kullanıcının davranışları, eylemleri veya ihmalleri;',
          'herhangi bir seans veya görüşmeden önce, sırasında ya da sonrasında kişilere veya mülke gelen her türlü yaralanma, zarar, kayıp veya hasar;',
          'Platform aracılığıyla elde edilen herhangi bir hizmetin kalitesi, güvenliği, yasallığı veya sonucu;',
          'ödeme, planlama veya hizmet anlaşmazlıkları dahil kullanıcılar arasındaki her türlü anlaşmazlık.',
        ] },
        { p: 'Başka bir kullanıcıyla yaptığınız her türlü anlaşma kesinlikle sizinle o kullanıcı arasındadır.' },
      ],
    },
    {
      title: 'Tazminat',
      blocks: [
        { p: 'Platform’u kullanmanızdan, diğer kullanıcılarla etkileşim veya görüşmelerinizden, bu Sözleşme’yi ihlal etmenizden ya da herhangi bir yasayı veya üçüncü tarafın haklarını ihlal etmenizden doğan her türlü talep, yükümlülük, zarar, kayıp veya masrafa (makul avukatlık ücretleri dahil) karşı TrainerUniverse’i ve bağlı kuruluşlarını tazmin etmeyi ve zarar görmemelerini sağlamayı kabul edersiniz.' },
      ],
    },
    {
      title: 'Kullanıcı Davranışı ve Sorumlulukları',
      blocks: [
        { p: 'Kendi davranışlarınızdan ve diğer kullanıcılarla ilişkilerinizden yalnızca siz sorumlusunuz. Şunları yapmamayı kabul edersiniz:' },
        { ul: [
          'yanlış, yanıltıcı veya hileli bilgi vermek;',
          'başka bir kullanıcıyı taciz etmek, tehdit etmek, kötüye kullanmak, dolandırmak veya ona zarar vermek;',
          'yasadışı, güvensiz veya yasaklı hizmetler sunmak veya talep etmek;',
          'Platform’un ücretlerini, araçlarını veya güvenlik özelliklerini bu Sözleşme’yi ihlal edecek şekilde atlatmak;',
          'başkalarının fikri mülkiyet veya gizlilik haklarını ihlal etmek.',
        ] },
      ],
    },
    {
      title: 'Rezervasyonlar, Ödemeler ve İptaller',
      blocks: [
        { p: 'Ücretler, paketler, planlama, iadeler ve iptal koşulları doğrudan Antrenörler ile Öğrenciler arasında belirlenir ve kararlaştırılır. TrainerUniverse; kullanıcılar arasında doğrudan yapılan ödemelerin tahsilinden, tutulmasından veya iadesinden ya da bir kullanıcının hizmeti sunmaması veya ödememesinden sorumlu değildir.' },
      ],
    },
    {
      title: 'Uygunluk',
      blocks: [
        { p: 'Hesap oluşturmak için en az 18 yaşında (veya bulunduğunuz yargı bölgesindeki reşit olma yaşında) olmalısınız. Antrenmana bir reşit olmayan dahil olduğunda, bir ebeveyn veya yasal vasi bu Sözleşme’yi kabul etmeli, düzenlemeyi denetlemeli ve ondan sorumlu olmalıdır.' },
      ],
    },
    {
      title: 'Hesaplar ve Doğruluk',
      blocks: [
        { p: 'Giriş bilgilerinizi güvende tutmaktan ve hesabınız altındaki tüm etkinliklerden siz sorumlusunuz. Doğru bilgi vermeyi ve bunu güncel tutmayı kabul edersiniz. Bu Sözleşme’yi ihlal eden hesapları askıya alabilir veya kapatabiliriz.' },
      ],
    },
    {
      title: 'Garantilerin Reddi',
      blocks: [
        { p: 'Platform; satılabilirlik, belirli bir amaca uygunluk, doğruluk veya ihlal etmeme garantileri dahil açık ya da zımni hiçbir garanti olmaksızın “olduğu gibi” ve “mevcut olduğu şekilde” sağlanır. Platform’un kesintisiz, güvenli veya hatasız olacağını ya da herhangi bir kullanıcının veya hizmetin beklentilerinizi karşılayacağını garanti etmeyiz.' },
      ],
    },
    {
      title: 'Sorumluluğun Sınırlandırılması',
      blocks: [
        { p: 'Yürürlükteki yasaların izin verdiği en geniş ölçüde; TrainerUniverse ve bağlı kuruluşları, Platform’u kullanmanızdan veya diğer kullanıcılarla etkileşimlerinizden doğan ya da bunlarla ilgili hiçbir dolaylı, arızi, özel, sonuç niteliğinde veya cezai zarardan ya da kâr, veri, itibar kaybından veya kişisel yaralanmadan sorumlu olmayacaktır. Platform ile ilgili herhangi bir talebe ilişkin toplam yükümlülüğümüz, talepten önceki on iki (12) ay içinde TrainerUniverse’e ödediğiniz toplam ücretlerden veya 100 ABD dolarından yüksek olanı aşmayacaktır.' },
      ],
    },
    {
      title: 'İçerik ve Yorumlar',
      blocks: [
        { p: 'Profiller, mesajlar ve yorumlar dahil olmak üzere paylaştığınız içerikten siz sorumlusunuz ve bunu Platform’da göstermemiz için bize münhasır olmayan bir lisans verirsiniz. Yorumlar dürüst ve gerçek deneyime dayalı olmalıdır. Bu Sözleşme’yi veya yürürlükteki yasaları ihlal eden içerikleri kaldırabiliriz.' },
      ],
    },
    {
      title: 'Fesih',
      blocks: [
        { p: 'Platform’u istediğiniz zaman kullanmayı bırakabilirsiniz. Bu Sözleşme’nin ihlali dahil olmak üzere, erişiminizi kendi takdirimizle askıya alabilir veya sonlandırabiliriz. Niteliği gereği fesihten sonra da geçerli olması gereken bölümler — ibra, tazminat, garantilerin reddi ve sorumluluğun sınırlandırılması dahil — geçerliliğini korur.' },
      ],
    },
    {
      title: 'Bu Sözleşme’deki Değişiklikler',
      blocks: [
        { p: 'Bu Sözleşme’yi zaman zaman güncelleyebiliriz. Önemli değişiklikler yaparsak yukarıdaki “Son güncelleme” tarihini güncelleriz. Değişiklikler yürürlüğe girdikten sonra Platform’u kullanmaya devam etmeniz, güncellenmiş Sözleşme’yi kabul ettiğiniz anlamına gelir.' },
      ],
    },
    {
      title: 'Geçerli Hukuk',
      blocks: [
        { p: 'Bu Sözleşme, TrainerUniverse’in kurulu olduğu yargı bölgesinin yasalarına tabidir ve kanunlar ihtilafı kurallarına bakılmaksızın uygulanır. Yasaların izin verdiği ölçüde, her türlü anlaşmazlıkta münhasır yargı yetkisi o yargı bölgesinin mahkemelerine aittir.' },
      ],
    },
    {
      title: 'İletişim',
      blocks: [
        { p: 'Bu Sözleşme ile ilgili sorularınızı Platform’un iletişim kanalları aracılığıyla iletebilirsiniz.' },
      ],
    },
  ],
  closing:
    'Bir hesap oluşturarak; riskin üstlenilmesi ve antrenörlerle öğrenciler arasındaki her türlü etkileşim veya görüşmeye ilişkin sorumluluğun bırakılması dahil olmak üzere, bu Kullanıcı Sözleşmesi’ni okuduğunuzu ve kabul ettiğinizi onaylarsınız.',
};

function Block({ block }: { block: Block }) {
  if ('ul' in block) {
    return (
      <ul className="ml-4 list-disc space-y-1.5 marker:text-accent">
        {block.ul.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }
  return <p>{block.p}</p>;
}

export default function UserAgreementPage() {
  const { lang } = useLanguage();
  const doc = lang === 'tr' ? TR : EN;

  return (
    <div className="relative overflow-hidden bg-surface text-content">
      <div className="grain-layer" />
      <div className="relative mx-auto max-w-3xl px-5 py-16 lg:px-8 lg:py-24">
        {/* Header */}
        <p className="eyebrow text-accent">
          <span className="h-px w-8 bg-accent" />
          {doc.legal}
        </p>
        <h1 className="mt-5 font-display text-5xl leading-[0.95] tracking-wide sm:text-6xl">{doc.title}</h1>
        <p className="mt-3 font-display text-2xl tracking-wide text-content/45">{doc.subtitle}</p>
        <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.18em] text-content/40">
          {doc.updatedLabel}: {doc.updated}
        </p>

        <p className="mt-8 text-sm leading-relaxed text-content/70 sm:text-[15px]">{doc.intro}</p>

        {/* Key disclaimer callout */}
        <div className="mt-8 border-l-2 border-volt bg-content/[0.04] p-5 theme-light:bg-content/[0.05]">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">{doc.calloutLabel}</p>
          <p className="mt-2 text-sm font-medium leading-relaxed text-content/80 sm:text-[15px]">{doc.callout}</p>
        </div>

        {doc.sections.map((section, idx) => (
          <section key={idx} className="mt-10">
            <h2 className="font-display text-2xl leading-tight tracking-wide sm:text-3xl">
              <span className="mr-3 text-accent">{idx + 1}.</span>
              {section.title}
            </h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-content/70 sm:text-[15px]">
              {section.blocks.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </div>
          </section>
        ))}

        <p className="mt-12 border-t border-content/10 pt-6 text-sm font-medium text-content/60">{doc.closing}</p>
      </div>
    </div>
  );
}
