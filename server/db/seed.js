const bcrypt = require('bcryptjs');
const db = require('./database');

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

const SPECIALTIES = [
  'Weight Loss', 'Muscle Building', 'HIIT', 'Yoga', 'Rehabilitation',
  'Nutrition', 'Boxing', 'Strength Training', 'Mobility', 'Conditioning',
];

// Sport-themed imagery — LoremFlickr serves keyword-matched photos.
const loremflickr = (w, h, keywords, lock) =>
  `https://loremflickr.com/${w}/${h}/${keywords}?lock=${lock}`;

const COVER_IMAGERY = {
  'marcus@fitconnect.com': { keywords: 'gym,workout', lock: 31 },
  'sofia@fitconnect.com': { keywords: 'yoga', lock: 34 },
  'darnell@fitconnect.com': { keywords: 'boxing', lock: 37 },
  'elena@fitconnect.com': { keywords: 'healthy,food', lock: 40 },
  'jordan@fitconnect.com': { keywords: 'fitness,training', lock: 43 },
  'aisha@fitconnect.com': { keywords: 'running', lock: 46 },
  'tommy@fitconnect.com': { keywords: 'gym,fitness', lock: 49 },
  'grace@fitconnect.com': { keywords: 'fitness,workout', lock: 52 },
};

const WORK_IMAGERY = {
  'marcus@fitconnect.com': { keywords: 'gym,strength', lock: 110 },
  'sofia@fitconnect.com': { keywords: 'yoga,stretching', lock: 120 },
  'darnell@fitconnect.com': { keywords: 'boxing,training', lock: 130 },
  'elena@fitconnect.com': { keywords: 'fitness,healthy', lock: 140 },
  'jordan@fitconnect.com': { keywords: 'fitness,exercise', lock: 150 },
  'aisha@fitconnect.com': { keywords: 'running,workout', lock: 160 },
  'tommy@fitconnect.com': { keywords: 'gym,fitness', lock: 170 },
  'grace@fitconnect.com': { keywords: 'fitness,workout', lock: 180 },
};

const coverPhotoFor = (email) => {
  const c = COVER_IMAGERY[email];
  return loremflickr(1600, 900, c.keywords, c.lock);
};

const workPhotoFor = (email, index) => {
  const w = WORK_IMAGERY[email];
  return loremflickr(900, 900, w.keywords, w.lock + index);
};

const TRAINERS = [
  {
    email: 'marcus@fitconnect.com',
    name: 'Marcus Bennett',
    tagline: 'Build the kind of strength that lasts a lifetime.',
    bio: `I have spent the last eleven years helping everyday people fall in love with lifting heavy. My approach is simple: master the fundamentals, progress with intention, and never train through pain. Whether you are stepping into a gym for the first time or chasing a new deadlift PR, we will build a plan around your body and your goals — no fluff, no ego.`,
    profilePhoto: 'https://i.pravatar.cc/600?img=12',
    coverPhoto: 'https://picsum.photos/seed/marcus-cover/1600/900',
    location: 'New York, NY',
    isRemote: false,
    years: 11,
    availability: ['weekdays', 'mornings', 'evenings'],
    specialties: ['Strength Training', 'Muscle Building'],
    packages: [
      { name: 'Single Session', description: 'One focused 60-minute session — ideal for a form check or a one-off training day.', sessions: 1, price: 95, popular: false },
      { name: 'Foundation Block', description: 'Eight sessions across a month to lock in technique and build a real base of strength.', sessions: 8, price: 680, popular: true },
      { name: 'Monthly Unlimited', description: 'Train as often as you like, plus weekly programming and form reviews between sessions.', sessions: 0, price: 1100, popular: false },
    ],
    work: [
      { photo: 'https://picsum.photos/seed/marcus-w1/900/900', student: 'David', goal: 'Added 140 lbs to his total', duration: '6 months', description: 'David arrived unable to squat his own bodyweight. Six months of patient progression later, he pulled 405 for a clean single.', visible: true },
      { photo: 'https://picsum.photos/seed/marcus-w2/900/900', student: 'Priya', goal: 'First-ever strict pull-up', duration: '4 months', description: 'We rebuilt Priya’s upper-body strength from scratch with a structured pulling progression. She now knocks out sets of five.', visible: true },
      { photo: 'https://picsum.photos/seed/marcus-w3/900/900', student: 'Liam', goal: 'Off-season lean mass gain', duration: '8 months', description: 'Liam wanted size without losing conditioning. Smart periodization added 18 lbs of lean mass while keeping his engine.', visible: true },
    ],
    reviews: [
      { name: 'Rachel M.', rating: 5, comment: 'Marcus completely changed how I think about training. Patient, sharp, and genuinely invested in your progress.', created_at: daysAgo(9) },
      { name: 'Tom B.', rating: 5, comment: 'Best coach I have worked with. My deadlift has never felt stronger and my back pain is finally gone.', created_at: daysAgo(28) },
      { name: 'Jen K.', rating: 4, comment: 'Really knowledgeable and motivating. Sessions start on time and there is zero wasted effort.', created_at: daysAgo(54) },
      { name: 'Andre P.', rating: 5, comment: 'Six months in and I am lifting weights I never thought possible. Worth every cent.', created_at: daysAgo(91) },
    ],
    certs: [
      { name: 'Certified Strength & Conditioning Specialist (CSCS)', issuer: 'NSCA', year: 2015 },
      { name: 'Precision Nutrition Level 1', issuer: 'Precision Nutrition', year: 2018 },
    ],
  },
  {
    email: 'sofia@fitconnect.com',
    name: 'Sofia Reyes',
    tagline: 'Move better, breathe deeper, live stronger.',
    bio: `Yoga found me after a running injury sidelined me for a year — and it changed everything. I teach a grounded, alignment-focused practice that meets you exactly where you are today. Expect to leave each session looser, calmer, and far more connected to how your body actually moves. Mobility is freedom, and it is never too late to begin.`,
    profilePhoto: 'https://i.pravatar.cc/600?img=1',
    coverPhoto: 'https://picsum.photos/seed/sofia-cover/1600/900',
    location: 'Austin, TX',
    isRemote: true,
    years: 7,
    availability: ['weekdays', 'weekends', 'mornings'],
    specialties: ['Yoga', 'Mobility'],
    packages: [
      { name: 'Drop-In Flow', description: 'A single 60-minute private session, online or in person.', sessions: 1, price: 55, popular: false },
      { name: 'Five-Class Pack', description: 'Five private sessions to build a consistent practice — use them whenever suits you.', sessions: 5, price: 240, popular: true },
      { name: 'Monthly Membership', description: 'Unlimited private sessions plus a personalized home mobility routine.', sessions: 0, price: 320, popular: false },
    ],
    work: [
      { photo: 'https://picsum.photos/seed/sofia-w1/900/900', student: 'Hannah', goal: 'Touched her toes for the first time', duration: '3 months', description: 'Hannah came in with years of desk-job stiffness. A daily ten-minute routine and weekly sessions transformed her range of motion.', visible: true },
      { photo: 'https://picsum.photos/seed/sofia-w2/900/900', student: 'Marco', goal: 'Pain-free lower back', duration: '5 months', description: 'Marco managed chronic back tension with mobility work and breathwork. He has now gone four months without a flare-up.', visible: true },
    ],
    reviews: [
      { name: 'Olivia T.', rating: 5, comment: 'Sofia is the calmest, most encouraging teacher. My hips have never felt this open.', created_at: daysAgo(6) },
      { name: 'Daniel R.', rating: 5, comment: 'I was skeptical about remote yoga but her cues are so clear it feels like she is in the room.', created_at: daysAgo(31) },
      { name: 'Megan F.', rating: 4, comment: 'Lovely sessions and great home routines. Wish she had more evening slots available.', created_at: daysAgo(70) },
    ],
    certs: [
      { name: 'RYT-500 Registered Yoga Teacher', issuer: 'Yoga Alliance', year: 2017 },
      { name: 'Functional Range Conditioning (FRC)', issuer: 'Functional Anatomy Seminars', year: 2020 },
    ],
  },
  {
    email: 'darnell@fitconnect.com',
    name: 'Darnell Carter',
    tagline: 'Train like a fighter. Carry yourself like one too.',
    bio: `I boxed competitively for a decade before I ever picked up a clipboard, and I bring that ring-tested intensity to every session. My training blends real boxing technique with high-output conditioning, so you build skill and a serious engine at the same time. You do not need to want to fight — you just need to want to work. I will handle the rest.`,
    profilePhoto: 'https://i.pravatar.cc/600?img=33',
    coverPhoto: 'https://picsum.photos/seed/darnell-cover/1600/900',
    location: 'Chicago, IL',
    isRemote: false,
    years: 13,
    availability: ['weekdays', 'weekends', 'evenings'],
    specialties: ['Boxing', 'HIIT', 'Conditioning'],
    packages: [
      { name: 'Single Round', description: 'One 60-minute private boxing and conditioning session.', sessions: 1, price: 80, popular: false },
      { name: 'Ten-Session Fight Camp', description: 'Ten sessions of pads, footwork, and conditioning to sharpen everything.', sessions: 10, price: 700, popular: true },
      { name: 'Monthly Unlimited', description: 'Unlimited sessions plus a conditioning plan for your days off.', sessions: 0, price: 980, popular: false },
    ],
    work: [
      { photo: 'https://picsum.photos/seed/darnell-w1/900/900', student: 'Chris', goal: 'Lost 34 lbs and learned to box', duration: '7 months', description: 'Chris wanted a workout that did not feel like a chore. Boxing hooked him, and the weight came off as a happy side effect.', visible: true },
      { photo: 'https://picsum.photos/seed/darnell-w2/900/900', student: 'Bianca', goal: 'First amateur bout', duration: '10 months', description: 'Bianca walked in with zero experience. We built her up methodically and she won her debut amateur fight on points.', visible: true },
      { photo: 'https://picsum.photos/seed/darnell-w3/900/900', student: 'Sam', goal: 'Doubled his conditioning capacity', duration: '4 months', description: 'A weekend warrior who gassed out fast — four months of structured rounds and his engine is unrecognizable.', visible: false },
    ],
    reviews: [
      { name: 'Kevin L.', rating: 5, comment: 'Darnell pushes you hard but never past what you can handle. I look forward to every session.', created_at: daysAgo(4) },
      { name: 'Natalie S.', rating: 5, comment: 'I have never been this fit. The boxing makes the cardio fly by and his technique coaching is top notch.', created_at: daysAgo(22) },
      { name: 'Marcus W.', rating: 4, comment: 'Great energy and serious knowledge. Sessions are intense — come ready to sweat.', created_at: daysAgo(48) },
      { name: 'Priya N.', rating: 5, comment: 'He made boxing feel accessible from day one. Best decision I made this year.', created_at: daysAgo(76) },
      { name: 'Greg H.', rating: 5, comment: 'Old-school coaching with real results. My footwork and confidence are night and day.', created_at: daysAgo(110) },
    ],
    certs: [
      { name: 'USA Boxing Certified Coach', issuer: 'USA Boxing', year: 2013 },
      { name: 'NASM Certified Personal Trainer', issuer: 'NASM', year: 2014 },
    ],
  },
  {
    email: 'elena@fitconnect.com',
    name: 'Elena Petrova',
    tagline: 'Sustainable fat loss — no crash diets, no burnout.',
    bio: `I help busy people lose fat in a way that actually fits their lives. There are no banned foods and no punishing routines here — just honest coaching, smart habits, and a plan you can keep long after we stop working together. I pair training with practical nutrition guidance because the two are inseparable. Slow, steady, and permanent beats fast and fragile every time.`,
    profilePhoto: 'https://i.pravatar.cc/600?img=45',
    coverPhoto: 'https://picsum.photos/seed/elena-cover/1600/900',
    location: 'Miami, FL',
    isRemote: true,
    years: 8,
    availability: ['weekdays', 'mornings', 'afternoons'],
    specialties: ['Weight Loss', 'Nutrition'],
    packages: [
      { name: 'Strategy Session', description: 'A 60-minute consult to assess your goals and map a realistic plan.', sessions: 1, price: 70, popular: false },
      { name: '12-Week Transformation', description: 'Twelve weekly sessions with full nutrition coaching and habit tracking.', sessions: 12, price: 960, popular: true },
      { name: 'Monthly Coaching', description: 'Ongoing weekly check-ins, programming, and accountability.', sessions: 4, price: 340, popular: false },
    ],
    work: [
      { photo: 'https://picsum.photos/seed/elena-w1/900/900', student: 'Karen', goal: 'Lost 41 lbs and kept it off', duration: '9 months', description: 'Karen had tried every diet. We threw the rulebook out and built habits — she has held her result for over a year now.', visible: true },
      { photo: 'https://picsum.photos/seed/elena-w2/900/900', student: 'Robert', goal: 'Dropped two pant sizes', duration: '5 months', description: 'A frequent business traveler who thought consistency was impossible. We built a plan that travels with him.', visible: true },
      { photo: 'https://picsum.photos/seed/elena-w3/900/900', student: 'Aisha', goal: 'Postpartum strength and energy', duration: '6 months', description: 'Aisha wanted to feel like herself again. A gentle, progressive approach restored her energy and confidence.', visible: true },
    ],
    reviews: [
      { name: 'Laura D.', rating: 5, comment: 'Elena finally helped me understand food instead of fearing it. The weight loss feels effortless and permanent.', created_at: daysAgo(11) },
      { name: 'Mike R.', rating: 4, comment: 'Practical, no-nonsense coaching. The habit tracking kept me honest between sessions.', created_at: daysAgo(40) },
      { name: 'Sandra K.', rating: 5, comment: 'The only program that ever stuck. She is supportive without ever being preachy.', created_at: daysAgo(67) },
      { name: 'James O.', rating: 5, comment: 'Down 30 lbs and my energy is through the roof. I only wish I had found her sooner.', created_at: daysAgo(99) },
    ],
    certs: [
      { name: 'Precision Nutrition Level 2 Master Coach', issuer: 'Precision Nutrition', year: 2019 },
      { name: 'ACE Certified Health Coach', issuer: 'American Council on Exercise', year: 2016 },
    ],
  },
  {
    email: 'jordan@fitconnect.com',
    name: 'Jordan Mitchell',
    tagline: 'Recover smart. Come back stronger than before.',
    bio: `I specialize in the gap between physical therapy and full performance — the part most people are left to navigate alone. Coming back from injury or surgery, you need someone who understands load, tissue, and patience. I work closely with your medical team to bridge you safely back to the training you love. Setbacks are not the end of the story; they are a chapter.`,
    profilePhoto: 'https://i.pravatar.cc/600?img=51',
    coverPhoto: 'https://picsum.photos/seed/jordan-cover/1600/900',
    location: 'Los Angeles, CA',
    isRemote: false,
    years: 6,
    availability: ['weekdays', 'afternoons'],
    specialties: ['Rehabilitation', 'Mobility'],
    packages: [
      { name: 'Assessment Session', description: 'A thorough 75-minute movement assessment and recovery roadmap.', sessions: 1, price: 110, popular: false },
      { name: 'Return-to-Training Block', description: 'Ten progressive sessions bridging rehab and full performance.', sessions: 10, price: 950, popular: true },
      { name: 'Monthly Support', description: 'Four sessions a month plus ongoing programming and progress reviews.', sessions: 4, price: 400, popular: false },
    ],
    work: [
      { photo: 'https://picsum.photos/seed/jordan-w1/900/900', student: 'Tom', goal: 'Returned to running post-ACL', duration: '8 months', description: 'Tom feared he would never run again after surgery. A careful loading progression had him back on the trails pain-free.', visible: true },
      { photo: 'https://picsum.photos/seed/jordan-w2/900/900', student: 'Nadia', goal: 'Resolved chronic shoulder pain', duration: '5 months', description: 'Years of shoulder pain limited Nadia’s training. Targeted rehab restored her overhead strength completely.', visible: true },
    ],
    reviews: [
      { name: 'Chris B.', rating: 5, comment: 'Jordan gave me my confidence back after surgery. Methodical, reassuring, and genuinely expert.', created_at: daysAgo(8) },
      { name: 'Emily H.', rating: 5, comment: 'He coordinated perfectly with my physio. I felt safe every single step of the way.', created_at: daysAgo(35) },
      { name: 'Paul S.', rating: 4, comment: 'Patient and thorough. Recovery is slow by nature but he kept me motivated throughout.', created_at: daysAgo(72) },
    ],
    certs: [
      { name: 'Corrective Exercise Specialist (NASM-CES)', issuer: 'NASM', year: 2018 },
      { name: 'Certified Strength & Conditioning Specialist (CSCS)', issuer: 'NSCA', year: 2020 },
    ],
  },
  {
    email: 'aisha@fitconnect.com',
    name: 'Aisha Khan',
    tagline: 'High intensity. Higher standards. Real results.',
    bio: `My sessions are short, ferocious, and ruthlessly effective — built for people who do not have hours to spend in a gym. I came up through group fitness and learned how to make every single minute count. Expect interval work that leaves you breathless and a coach who will not let you coast. Forty-five minutes, fully committed, is all it takes.`,
    profilePhoto: 'https://i.pravatar.cc/600?img=9',
    coverPhoto: 'https://picsum.photos/seed/aisha-cover/1600/900',
    location: 'Seattle, WA',
    isRemote: true,
    years: 4,
    availability: ['weekdays', 'weekends', 'evenings'],
    specialties: ['HIIT', 'Conditioning'],
    packages: [
      { name: 'Single Session', description: 'One 45-minute high-intensity interval session, online or in person.', sessions: 1, price: 60, popular: false },
      { name: 'Six-Week Shred', description: 'Eighteen sessions over six weeks for a serious conditioning overhaul.', sessions: 18, price: 870, popular: true },
      { name: 'Monthly Unlimited', description: 'Unlimited interval sessions plus a weekly conditioning challenge.', sessions: 0, price: 540, popular: false },
    ],
    work: [
      { photo: 'https://picsum.photos/seed/aisha-w1/900/900', student: 'Jess', goal: 'Best conditioning of her life', duration: '6 weeks', description: 'Jess committed to six weeks and never looked back. Her resting heart rate dropped and her energy soared.', visible: true },
      { photo: 'https://picsum.photos/seed/aisha-w2/900/900', student: 'Omar', goal: 'Lost 22 lbs training before work', duration: '4 months', description: 'Omar squeezed early-morning sessions into a hectic schedule. Short, intense, and consistent did the rest.', visible: true },
      { photo: 'https://picsum.photos/seed/aisha-w3/900/900', student: 'Lily', goal: 'Ran her first 10k', duration: '3 months', description: 'Interval training built the engine; Lily finished her first 10k with energy to spare.', visible: true },
    ],
    reviews: [
      { name: 'Derek M.', rating: 5, comment: 'Aisha gets more out of 45 minutes than anyone I have trained with. Brutal in the best way.', created_at: daysAgo(5) },
      { name: 'Hana P.', rating: 5, comment: 'Perfect for my packed schedule. I am fitter than I have ever been and it only takes three sessions a week.', created_at: daysAgo(26) },
      { name: 'Steve K.', rating: 4, comment: 'Tough sessions and great programming. Just be ready to actually work.', created_at: daysAgo(58) },
    ],
    certs: [
      { name: 'NASM Certified Personal Trainer', issuer: 'NASM', year: 2021 },
      { name: 'Kettlebell Athletics Level 1', issuer: 'Kettlebell Athletics', year: 2022 },
    ],
  },
  {
    email: 'tommy@fitconnect.com',
    name: 'Tommy Nguyen',
    tagline: 'Sixteen years turning beginners into bodybuilders.',
    bio: `I have competed, coached, and stood in the trenches of the iron game for sixteen years. My specialty is hypertrophy — building muscle that looks as good as it performs — through precise programming and relentless attention to detail. I love working with beginners because the transformation is the most dramatic. If you want to build a physique you are proud of, I will show you exactly how.`,
    profilePhoto: 'https://i.pravatar.cc/600?img=60',
    coverPhoto: 'https://picsum.photos/seed/tommy-cover/1600/900',
    location: 'Austin, TX',
    isRemote: false,
    years: 16,
    availability: ['weekdays', 'mornings', 'afternoons', 'evenings'],
    specialties: ['Muscle Building', 'Strength Training'],
    packages: [
      { name: 'Single Session', description: 'One 60-minute hypertrophy-focused training session.', sessions: 1, price: 130, popular: false },
      { name: 'Physique Block', description: 'Sixteen sessions over eight weeks with full hypertrophy programming.', sessions: 16, price: 1800, popular: true },
      { name: 'Competition Prep', description: 'Twelve weeks of stage-ready coaching, programming, and nutrition.', sessions: 24, price: 3200, popular: false },
    ],
    work: [
      { photo: 'https://picsum.photos/seed/tommy-w1/900/900', student: 'Ethan', goal: 'Gained 24 lbs of muscle', duration: '12 months', description: 'Ethan was a classic hard-gainer convinced he could not grow. A year of disciplined hypertrophy work proved him wrong.', visible: true },
      { photo: 'https://picsum.photos/seed/tommy-w2/900/900', student: 'Marcus', goal: 'First bodybuilding show', duration: '14 months', description: 'From his very first dumbbell to the competition stage — Marcus placed third in the novice division.', visible: true },
      { photo: 'https://picsum.photos/seed/tommy-w3/900/900', student: 'Ben', goal: 'Rebuilt his physique at 50', duration: '10 months', description: 'Ben proved it is never too late. Ten months of smart training gave him the best shape of his adult life.', visible: true },
      { photo: 'https://picsum.photos/seed/tommy-w4/900/900', student: 'Carlos', goal: 'Filled out a lean frame', duration: '7 months', description: 'Carlos wanted size without losing his lean look. Careful surplus management added quality mass.', visible: true },
    ],
    reviews: [
      { name: 'Jordan F.', rating: 5, comment: 'Tommy knows the human body inside out. Every program is dialed in to the rep. Unreal results.', created_at: daysAgo(7) },
      { name: 'Alex T.', rating: 5, comment: 'I added more muscle in eight months with Tommy than in five years on my own.', created_at: daysAgo(19) },
      { name: 'Ryan C.', rating: 5, comment: 'Premium coaching and worth every dollar. He treats your physique like a craft.', created_at: daysAgo(44) },
      { name: 'Nick D.', rating: 4, comment: 'Incredibly knowledgeable and detailed. Bring a notebook — there is a lot to absorb.', created_at: daysAgo(81) },
      { name: 'Sophie L.', rating: 5, comment: 'He prepped me for my first show flawlessly. Calm, precise, and endlessly supportive.', created_at: daysAgo(115) },
    ],
    certs: [
      { name: 'IFBB Certified Coach', issuer: 'IFBB Academy', year: 2012 },
      { name: 'Certified Strength & Conditioning Specialist (CSCS)', issuer: 'NSCA', year: 2010 },
      { name: 'Precision Nutrition Level 1', issuer: 'Precision Nutrition', year: 2015 },
    ],
  },
  {
    email: 'grace@fitconnect.com',
    name: 'Grace O’Sullivan',
    tagline: 'Strong, healthy, and confident — at every stage of life.',
    bio: `I coach women through the seasons of life that gyms too often ignore — pregnancy, postpartum, perimenopause, and beyond. My training is gentle where it needs to be and challenging where it counts, always built around how you actually feel. Health is not a number on a scale; it is energy, strength, and confidence in your own skin. Let us build that together.`,
    profilePhoto: 'https://i.pravatar.cc/600?img=27',
    coverPhoto: 'https://picsum.photos/seed/grace-cover/1600/900',
    location: 'Denver, CO',
    isRemote: true,
    years: 9,
    availability: ['weekdays', 'weekends', 'mornings'],
    specialties: ['Weight Loss', 'Nutrition'],
    packages: [
      { name: 'Single Session', description: 'A 60-minute private session tailored to your stage and goals.', sessions: 1, price: 75, popular: false },
      { name: 'Eight-Week Reset', description: 'Eight weekly sessions with nutrition guidance and gentle progression.', sessions: 8, price: 560, popular: true },
      { name: 'Monthly Coaching', description: 'Four sessions a month plus check-ins and a plan that adapts with you.', sessions: 4, price: 300, popular: false },
    ],
    work: [
      { photo: 'https://picsum.photos/seed/grace-w1/900/900', student: 'Emma', goal: 'Rebuilt core strength postpartum', duration: '6 months', description: 'Emma wanted to feel strong again after her second child. We rebuilt her core safely from the ground up.', visible: true },
      { photo: 'https://picsum.photos/seed/grace-w2/900/900', student: 'Diane', goal: 'Lost 28 lbs through perimenopause', duration: '8 months', description: 'Diane felt her body had stopped responding. A patient, hormone-aware approach got results that lasted.', visible: true },
      { photo: 'https://picsum.photos/seed/grace-w3/900/900', student: 'Tara', goal: 'Healthy, strong pregnancy', duration: '7 months', description: 'Tara trained safely right through her pregnancy and felt energized and capable the entire time.', visible: true },
    ],
    reviews: [
      { name: 'Beth A.', rating: 5, comment: 'Grace is the most understanding coach I have ever had. She truly meets you where you are.', created_at: daysAgo(10) },
      { name: 'Caroline M.', rating: 5, comment: 'Finally a trainer who understands a postpartum body. I feel strong and like myself again.', created_at: daysAgo(38) },
      { name: 'Wendy R.', rating: 4, comment: 'Kind, knowledgeable, and patient. The remote format worked perfectly around my kids.', created_at: daysAgo(63) },
      { name: 'Hannah K.', rating: 5, comment: 'I cannot recommend Grace enough. Sustainable, supportive, and genuinely life-changing.', created_at: daysAgo(95) },
    ],
    certs: [
      { name: 'Pre & Postnatal Coaching Certification', issuer: 'Girls Gone Strong', year: 2017 },
      { name: 'ACE Certified Personal Trainer', issuer: 'American Council on Exercise', year: 2015 },
    ],
  },
];

function seed() {
  const insUser = db.prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)');
  const insProfile = db.prepare(`
    INSERT INTO trainer_profiles
      (user_id, name, tagline, bio, profile_photo, cover_photo, location, is_remote, years_experience, availability, is_published)
    VALUES
      (@user_id, @name, @tagline, @bio, @profile_photo, @cover_photo, @location, @is_remote, @years_experience, @availability, @is_published)
  `);
  const insSpec = db.prepare('INSERT INTO specialties (name) VALUES (?)');
  const linkSpec = db.prepare('INSERT INTO trainer_specialties (trainer_id, specialty_id) VALUES (?, ?)');
  const insPkg = db.prepare(`
    INSERT INTO pricing_packages (trainer_id, name, description, sessions, price, is_popular)
    VALUES (@trainer_id, @name, @description, @sessions, @price, @is_popular)
  `);
  const insWork = db.prepare(`
    INSERT INTO previous_work (trainer_id, photo, student_name, goal, duration, description, display_order, is_visible)
    VALUES (@trainer_id, @photo, @student_name, @goal, @duration, @description, @display_order, @is_visible)
  `);
  const insReview = db.prepare(`
    INSERT INTO reviews (trainer_id, reviewer_name, rating, comment, created_at)
    VALUES (@trainer_id, @reviewer_name, @rating, @comment, @created_at)
  `);
  const insCert = db.prepare(`
    INSERT INTO certifications (trainer_id, name, issuer, year)
    VALUES (@trainer_id, @name, @issuer, @year)
  `);

  const run = db.transaction(() => {
    db.exec(`
      DELETE FROM trainer_specialties;
      DELETE FROM pricing_packages;
      DELETE FROM previous_work;
      DELETE FROM reviews;
      DELETE FROM certifications;
      DELETE FROM trainer_profiles;
      DELETE FROM specialties;
      DELETE FROM users;
    `);
    try { db.exec('DELETE FROM sqlite_sequence'); } catch { /* created lazily on first insert */ }

    const specId = {};
    for (const name of SPECIALTIES) {
      specId[name] = insSpec.run(name).lastInsertRowid;
    }

    const passwordHash = bcrypt.hashSync('trainer123', 10);

    for (const t of TRAINERS) {
      const userId = insUser.run(t.email, passwordHash, 'trainer').lastInsertRowid;
      const trainerId = insProfile.run({
        user_id: userId,
        name: t.name,
        tagline: t.tagline,
        bio: t.bio,
        profile_photo: t.profilePhoto,
        cover_photo: coverPhotoFor(t.email),
        location: t.location,
        is_remote: t.isRemote ? 1 : 0,
        years_experience: t.years,
        availability: JSON.stringify(t.availability),
        is_published: 1,
      }).lastInsertRowid;

      for (const s of t.specialties) {
        linkSpec.run(trainerId, specId[s]);
      }
      for (const p of t.packages) {
        insPkg.run({
          trainer_id: trainerId,
          name: p.name,
          description: p.description,
          sessions: p.sessions,
          price: p.price,
          is_popular: p.popular ? 1 : 0,
        });
      }
      t.work.forEach((w, i) => {
        insWork.run({
          trainer_id: trainerId,
          photo: workPhotoFor(t.email, i),
          student_name: w.student,
          goal: w.goal,
          duration: w.duration,
          description: w.description,
          display_order: i,
          is_visible: w.visible === false ? 0 : 1,
        });
      });
      for (const r of t.reviews) {
        insReview.run({
          trainer_id: trainerId,
          reviewer_name: r.name,
          rating: r.rating,
          comment: r.comment,
          created_at: r.created_at,
        });
      }
      for (const c of t.certs) {
        insCert.run({ trainer_id: trainerId, name: c.name, issuer: c.issuer, year: c.year });
      }
    }
  });

  run();
  return TRAINERS.length;
}

module.exports = { seed };

if (require.main === module) {
  const count = seed();
  console.log(`Seeded ${count} trainers into the FitConnect database.`);
  console.log('Demo trainer login -> email: marcus@fitconnect.com  password: trainer123');
}
