import bcrypt from 'bcryptjs';
import db from './db';

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

const SPECIALTIES = [
  // Sports & Athletics
  'Gym Training', 'Muscle Building', 'Powerlifting', 'Calisthenics', 'HIIT', 'Conditioning', 'Weight Loss', 'CrossFit', 'Boxing', 'Martial Arts', 'Soccer', 'Basketball', 'Tennis', 'Volleyball', 'Baseball', 'Cricket', 'Badminton', 'Running', 'Cycling', 'Swimming',
  // Wellness & Health
  'Yoga', 'Pilates', 'Mobility', 'Rehabilitation', 'Stretching', 'Meditation', 'Nutrition', 'Meal Planning', 'Sports Nutrition', 'Weight Management',
  // Academic
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History',
  // Creative & Tech
  'Programming', 'Web Development', 'Data Science', 'UI/UX Design', 'Graphic Design', 'Photography', 'Video Editing', 'Music',
];

const loremflickr = (w: number, h: number, keywords: string, lock: number) =>
  `https://loremflickr.com/${w}/${h}/${keywords}?lock=${lock}`;

const COVER_IMAGERY: Record<string, { keywords: string; lock: number }> = {
  'marcus@fitconnect.com':  { keywords: 'gym,workout',      lock: 31 },
  'sofia@fitconnect.com':   { keywords: 'yoga',             lock: 34 },
  'darnell@fitconnect.com': { keywords: 'boxing',           lock: 37 },
  'elena@fitconnect.com':   { keywords: 'healthy,food',     lock: 40 },
  'jordan@fitconnect.com':  { keywords: 'fitness,training', lock: 43 },
  'aisha@fitconnect.com':   { keywords: 'running',          lock: 46 },
  'tommy@fitconnect.com':   { keywords: 'gym,fitness',      lock: 49 },
  'grace@fitconnect.com':   { keywords: 'fitness,workout',  lock: 52 },
  'alex.t@fitconnect.com':  { keywords: 'math,education',   lock: 55 },
  'maya@fitconnect.com':    { keywords: 'design,art',       lock: 58 },
  'ryan@fitconnect.com':    { keywords: 'computer,coding',  lock: 61 },
  'carlos@fitconnect.com':  { keywords: 'soccer,football',  lock: 64 },
  'wade@fitconnect.com':    { keywords: 'basketball',       lock: 67 },
  'emma.l@fitconnect.com':  { keywords: 'running,marathon', lock: 70 },
  'kai@fitconnect.com':     { keywords: 'swimming,pool',    lock: 73 },
};

const WORK_IMAGERY: Record<string, { keywords: string; lock: number }> = {
  'marcus@fitconnect.com':  { keywords: 'gym,strength',      lock: 110 },
  'sofia@fitconnect.com':   { keywords: 'yoga,stretching',   lock: 120 },
  'darnell@fitconnect.com': { keywords: 'boxing,training',   lock: 130 },
  'elena@fitconnect.com':   { keywords: 'fitness,healthy',   lock: 140 },
  'jordan@fitconnect.com':  { keywords: 'fitness,exercise',  lock: 150 },
  'aisha@fitconnect.com':   { keywords: 'running,workout',   lock: 160 },
  'tommy@fitconnect.com':   { keywords: 'gym,fitness',       lock: 170 },
  'grace@fitconnect.com':   { keywords: 'fitness,workout',   lock: 180 },
  'alex.t@fitconnect.com':  { keywords: 'study,learning',    lock: 190 },
  'maya@fitconnect.com':    { keywords: 'design,creative',   lock: 200 },
  'ryan@fitconnect.com':    { keywords: 'coding,technology', lock: 210 },
  'carlos@fitconnect.com':  { keywords: 'soccer,sport',      lock: 220 },
  'wade@fitconnect.com':    { keywords: 'basketball,sport',  lock: 230 },
  'emma.l@fitconnect.com':  { keywords: 'running,road',      lock: 240 },
  'kai@fitconnect.com':     { keywords: 'swimming,water',    lock: 250 },
};

const coverPhotoFor = (email: string) => {
  const c = COVER_IMAGERY[email];
  return loremflickr(1600, 900, c.keywords, c.lock);
};

const workPhotoFor = (email: string, index: number) => {
  const w = WORK_IMAGERY[email];
  return loremflickr(900, 900, w.keywords, w.lock + index);
};

interface TrainerData {
  email: string;
  name: string;
  tagline: string;
  bio: string;
  profilePhoto: string;
  location: string;
  isRemote: boolean;
  years: number;
  availability: string[];
  specialties: string[];
  packages: { name: string; description: string; sessions: number; price: number; popular: boolean }[];
  work: { student: string; goal: string; duration: string; description: string; visible: boolean }[];
  reviews: { name: string; rating: number; comment: string; created_at: string }[];
  certs: { name: string; issuer: string; year: number }[];
}

const TRAINERS: TrainerData[] = [
  {
    email: 'marcus@fitconnect.com',
    name: 'Marcus Bennett',
    tagline: 'Build the kind of strength that lasts a lifetime.',
    bio: `I have spent the last eleven years helping everyday people fall in love with lifting heavy. My approach is simple: master the fundamentals, progress with intention, and never train through pain. Whether you are stepping into a gym for the first time or chasing a new deadlift PR, we will build a plan around your body and your goals — no fluff, no ego.`,
    profilePhoto: 'https://i.pravatar.cc/600?img=12',
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
      { student: 'David', goal: 'Added 140 lbs to his total', duration: '6 months', description: 'David arrived unable to squat his own bodyweight. Six months of patient progression later, he pulled 405 for a clean single.', visible: true },
      { student: 'Priya', goal: 'First-ever strict pull-up', duration: '4 months', description: 'We rebuilt Priya\'s upper-body strength from scratch with a structured pulling progression. She now knocks out sets of five.', visible: true },
      { student: 'Liam', goal: 'Off-season lean mass gain', duration: '8 months', description: 'Liam wanted size without losing conditioning. Smart periodization added 18 lbs of lean mass while keeping his engine.', visible: true },
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
      { student: 'Hannah', goal: 'Touched her toes for the first time', duration: '3 months', description: 'Hannah came in with years of desk-job stiffness. A daily ten-minute routine and weekly sessions transformed her range of motion.', visible: true },
      { student: 'Marco', goal: 'Pain-free lower back', duration: '5 months', description: 'Marco managed chronic back tension with mobility work and breathwork. He has now gone four months without a flare-up.', visible: true },
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
      { student: 'Chris', goal: 'Lost 34 lbs and learned to box', duration: '7 months', description: 'Chris wanted a workout that did not feel like a chore. Boxing hooked him, and the weight came off as a happy side effect.', visible: true },
      { student: 'Bianca', goal: 'First amateur bout', duration: '10 months', description: 'Bianca walked in with zero experience. We built her up methodically and she won her debut amateur fight on points.', visible: true },
      { student: 'Sam', goal: 'Doubled his conditioning capacity', duration: '4 months', description: 'A weekend warrior who gassed out fast — four months of structured rounds and his engine is unrecognizable.', visible: false },
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
      { student: 'Karen', goal: 'Lost 41 lbs and kept it off', duration: '9 months', description: 'Karen had tried every diet. We threw the rulebook out and built habits — she has held her result for over a year now.', visible: true },
      { student: 'Robert', goal: 'Dropped two pant sizes', duration: '5 months', description: 'A frequent business traveler who thought consistency was impossible. We built a plan that travels with him.', visible: true },
      { student: 'Aisha', goal: 'Postpartum strength and energy', duration: '6 months', description: 'Aisha wanted to feel like herself again. A gentle, progressive approach restored her energy and confidence.', visible: true },
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
      { student: 'Tom', goal: 'Returned to running post-ACL', duration: '8 months', description: 'Tom feared he would never run again after surgery. A careful loading progression had him back on the trails pain-free.', visible: true },
      { student: 'Nadia', goal: 'Resolved chronic shoulder pain', duration: '5 months', description: 'Years of shoulder pain limited Nadia\'s training. Targeted rehab restored her overhead strength completely.', visible: true },
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
      { student: 'Jess', goal: 'Best conditioning of her life', duration: '6 weeks', description: 'Jess committed to six weeks and never looked back. Her resting heart rate dropped and her energy soared.', visible: true },
      { student: 'Omar', goal: 'Lost 22 lbs training before work', duration: '4 months', description: 'Omar squeezed early-morning sessions into a hectic schedule. Short, intense, and consistent did the rest.', visible: true },
      { student: 'Lily', goal: 'Ran her first 10k', duration: '3 months', description: 'Interval training built the engine; Lily finished her first 10k with energy to spare.', visible: true },
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
      { student: 'Ethan', goal: 'Gained 24 lbs of muscle', duration: '12 months', description: 'Ethan was a classic hard-gainer convinced he could not grow. A year of disciplined hypertrophy work proved him wrong.', visible: true },
      { student: 'Marcus', goal: 'First bodybuilding show', duration: '14 months', description: 'From his very first dumbbell to the competition stage — Marcus placed third in the novice division.', visible: true },
      { student: 'Ben', goal: 'Rebuilt his physique at 50', duration: '10 months', description: 'Ben proved it is never too late. Ten months of smart training gave him the best shape of his adult life.', visible: true },
      { student: 'Carlos', goal: 'Filled out a lean frame', duration: '7 months', description: 'Carlos wanted size without losing his lean look. Careful surplus management added quality mass.', visible: true },
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
    name: "Grace O'Sullivan",
    tagline: 'Strong, healthy, and confident — at every stage of life.',
    bio: `I coach women through the seasons of life that gyms too often ignore — pregnancy, postpartum, perimenopause, and beyond. My training is gentle where it needs to be and challenging where it counts, always built around how you actually feel. Health is not a number on a scale; it is energy, strength, and confidence in your own skin. Let us build that together.`,
    profilePhoto: 'https://i.pravatar.cc/600?img=27',
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
      { student: 'Emma', goal: 'Rebuilt core strength postpartum', duration: '6 months', description: 'Emma wanted to feel strong again after her second child. We rebuilt her core safely from the ground up.', visible: true },
      { student: 'Diane', goal: 'Lost 28 lbs through perimenopause', duration: '8 months', description: 'Diane felt her body had stopped responding. A patient, hormone-aware approach got results that lasted.', visible: true },
      { student: 'Tara', goal: 'Healthy, strong pregnancy', duration: '7 months', description: 'Tara trained safely right through her pregnancy and felt energized and capable the entire time.', visible: true },
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
  {
    email: 'alex.t@fitconnect.com',
    name: 'Alex Torres',
    tagline: 'Math made simple — from algebra to calculus.',
    bio: `I have been tutoring mathematics for over eight years, from middle school fundamentals to university-level calculus and statistics. My method is patient, systematic, and deeply visual — I believe every concept clicks once it is explained the right way. Whether you are preparing for an exam or rebuilding your confidence after years of struggle, I will meet you exactly where you are.`,
    profilePhoto: 'https://i.pravatar.cc/600?img=15',
    location: 'Boston, MA',
    isRemote: true,
    years: 8,
    availability: ['weekdays', 'weekends', 'evenings'],
    specialties: ['Mathematics'],
    packages: [
      { name: 'Single Session', description: 'A focused 60-minute tutoring session on any topic you choose.', sessions: 1, price: 60, popular: false },
      { name: 'Exam Prep Pack', description: 'Five targeted sessions designed around your upcoming test.', sessions: 5, price: 270, popular: true },
      { name: 'Monthly Tutoring', description: 'Eight sessions per month with weekly progress tracking and practice sheets.', sessions: 8, price: 400, popular: false },
    ],
    work: [
      { student: 'Jamie', goal: 'Passed calculus with an A', duration: '3 months', description: 'Jamie had failed calculus twice. We rebuilt the foundation from limits upward — she aced the final.', visible: true },
      { student: 'Oscar', goal: 'SAT Math score jumped 180 points', duration: '6 weeks', description: 'Targeted practice on Oscar\'s weak areas closed the gap dramatically before his test date.', visible: true },
    ],
    reviews: [
      { name: 'Linda K.', rating: 5, comment: 'Alex explains things in a way that just makes sense. My son went from failing to loving math.', created_at: daysAgo(8) },
      { name: 'Tom R.', rating: 5, comment: 'Incredibly patient and thorough. Worth every session.', created_at: daysAgo(25) },
      { name: 'Priya S.', rating: 4, comment: 'Great tutor. Remote sessions work perfectly.', created_at: daysAgo(52) },
    ],
    certs: [
      { name: 'BSc Mathematics', issuer: 'MIT', year: 2016 },
      { name: 'Certified Tutoring Professional', issuer: 'NCTM', year: 2018 },
    ],
  },
  {
    email: 'maya@fitconnect.com',
    name: 'Maya Chen',
    tagline: 'Design skills that get you hired.',
    bio: `I am a senior graphic designer turned coach, with a decade of agency experience across branding, UI, and print. I teach the tools — Figma, Illustrator, Photoshop — but more importantly I teach design thinking: how to see, how to communicate, and how to build a portfolio that stands out. Whether you are switching careers or leveling up your freelance work, I will fast-track your growth.`,
    profilePhoto: 'https://i.pravatar.cc/600?img=5',
    location: 'San Francisco, CA',
    isRemote: true,
    years: 10,
    availability: ['weekdays', 'weekends', 'afternoons'],
    specialties: ['Graphic Design'],
    packages: [
      { name: 'Intro Session', description: 'A 90-minute orientation — we review your goals and create a personalised learning roadmap.', sessions: 1, price: 80, popular: false },
      { name: 'Portfolio Sprint', description: 'Eight sessions over four weeks to build three portfolio-ready projects.', sessions: 8, price: 580, popular: true },
      { name: 'Career Accelerator', description: 'Sixteen sessions covering tools, design theory, portfolio, and freelance business fundamentals.', sessions: 16, price: 1040, popular: false },
    ],
    work: [
      { student: 'Ben', goal: 'Landed a junior designer role in 3 months', duration: '3 months', description: 'Ben came from a marketing background with zero design experience. His portfolio impressed three agencies.', visible: true },
      { student: 'Leila', goal: 'Grew freelance income by 200%', duration: '5 months', description: 'Leila already designed but lacked confidence. Better process and a sharper portfolio tripled her rates.', visible: true },
    ],
    reviews: [
      { name: 'Chris M.', rating: 5, comment: 'Maya bridges the gap between theory and real-world work like nobody else. My portfolio is unrecognisable.', created_at: daysAgo(6) },
      { name: 'Fiona T.', rating: 5, comment: 'Practical, honest, and inspiring. I got my first design job two weeks after finishing with Maya.', created_at: daysAgo(30) },
      { name: 'Daniel H.', rating: 4, comment: 'Excellent content and very supportive. Sessions could be a touch longer but the quality is top.', created_at: daysAgo(61) },
    ],
    certs: [
      { name: 'BFA Graphic Design', issuer: 'California College of the Arts', year: 2014 },
      { name: 'Google UX Design Certificate', issuer: 'Google', year: 2021 },
    ],
  },
  {
    email: 'ryan@fitconnect.com',
    name: 'Ryan Park',
    tagline: 'From zero to developer — at your own pace.',
    bio: `I am a full-stack software engineer with nine years of professional experience and a genuine passion for teaching. I have helped over two hundred people learn to code — from total beginners to professionals learning a second language or framework. My sessions are hands-on and project-based. We write real code from day one, and I explain the why behind every line.`,
    profilePhoto: 'https://i.pravatar.cc/600?img=68',
    location: 'Seattle, WA',
    isRemote: true,
    years: 9,
    availability: ['weekdays', 'evenings', 'weekends'],
    specialties: ['Programming'],
    packages: [
      { name: 'Single Session', description: 'A 60-minute session on any topic — debugging, concepts, or code review.', sessions: 1, price: 90, popular: false },
      { name: 'Bootcamp Prep', description: 'Ten sessions covering HTML, CSS, JavaScript fundamentals, and Git.', sessions: 10, price: 800, popular: true },
      { name: 'Full-Stack Immersion', description: 'Twenty sessions from frontend to backend, with a deployed project at the end.', sessions: 20, price: 1400, popular: false },
    ],
    work: [
      { student: 'Sam', goal: 'Got into a top bootcamp', duration: '6 weeks', description: "Sam needed a coding foundation fast. Ryan's structured prep landed him a spot in a competitive programme.", visible: true },
      { student: 'Nina', goal: 'Switched careers from finance to dev', duration: '5 months', description: 'Nina learned Python and Django from scratch, built a portfolio, and landed her first developer role.', visible: true },
      { student: 'Jake', goal: 'Promoted to senior developer', duration: '3 months', description: 'Jake filled his architecture gaps with targeted sessions on system design and algorithms.', visible: true },
    ],
    reviews: [
      { name: 'Mark L.', rating: 5, comment: 'Ryan explains complex ideas so clearly. I actually understand what I am writing now.', created_at: daysAgo(7) },
      { name: 'Sarah O.', rating: 5, comment: 'Best investment I have made. I got a job offer six months after our first session.', created_at: daysAgo(29) },
      { name: 'Ahmed K.', rating: 5, comment: 'Patient, smart, and always prepared. Truly exceptional teacher.', created_at: daysAgo(55) },
    ],
    certs: [
      { name: 'BSc Computer Science', issuer: 'University of Washington', year: 2015 },
      { name: 'AWS Certified Developer', issuer: 'Amazon Web Services', year: 2020 },
    ],
  },
  {
    email: 'carlos@fitconnect.com',
    name: 'Carlos Silva',
    tagline: 'Play smarter. Move faster. Think like a pro.',
    bio: `I played semi-professional soccer for twelve years across three countries before transitioning to full-time coaching. I coach players from age ten to adult, focusing on technical skill, tactical awareness, and the mental side of the game. My sessions are high-energy and demanding — but every drill has a clear purpose. If you are serious about soccer, I will make you a better player.`,
    profilePhoto: 'https://i.pravatar.cc/600?img=56',
    location: 'Miami, FL',
    isRemote: false,
    years: 12,
    availability: ['weekdays', 'weekends', 'mornings', 'afternoons'],
    specialties: ['Soccer', 'Conditioning'],
    packages: [
      { name: 'Single Training', description: 'One 75-minute private session focused on your chosen area — technical, tactical, or fitness.', sessions: 1, price: 70, popular: false },
      { name: 'Pre-Season Block', description: 'Ten sessions to sharpen your game before a competitive season begins.', sessions: 10, price: 620, popular: true },
      { name: 'Elite Development', description: 'Twenty sessions of full player development — skill, tactics, video analysis and fitness.', sessions: 20, price: 1100, popular: false },
    ],
    work: [
      { student: 'Miguel', goal: 'Made the varsity team', duration: '4 months', description: 'Miguel was cut the year before. Focused technical work and tactical sessions got him into the starting lineup.', visible: true },
      { student: 'Ava', goal: 'Earned a college scholarship', duration: '8 months', description: "Ava's speed was already there — Carlos sharpened her decision-making and positioning dramatically.", visible: true },
    ],
    reviews: [
      { name: 'Pedro M.', rating: 5, comment: "Carlos sees the game differently. His coaching raised my son's level in ways I could not have imagined.", created_at: daysAgo(9) },
      { name: 'Laura F.', rating: 5, comment: 'Demanding but brilliant. Every session has purpose and energy.', created_at: daysAgo(33) },
      { name: 'Jorge R.', rating: 4, comment: 'Great technical coach. Pushes you hard but is always fair.', created_at: daysAgo(60) },
    ],
    certs: [
      { name: 'UEFA B Coaching Licence', issuer: 'UEFA', year: 2016 },
      { name: 'USSF National Youth Coaching Certificate', issuer: 'US Soccer Federation', year: 2018 },
    ],
  },
  {
    email: 'wade@fitconnect.com',
    name: 'Marcus Wade',
    tagline: 'IQ on the court. Strength in the gym. Greatness everywhere.',
    bio: `I played Division I college basketball and spent five years coaching at the professional development level before going independent. I work with players who want to get serious — improving ball handling, shooting mechanics, footwork, and basketball IQ at the same time. Off the court, I build the athleticism to back it all up. If you are willing to put in the work, I will show you exactly what that looks like.`,
    profilePhoto: 'https://i.pravatar.cc/600?img=57',
    location: 'Atlanta, GA',
    isRemote: false,
    years: 7,
    availability: ['weekdays', 'weekends', 'mornings', 'evenings'],
    specialties: ['Basketball', 'Conditioning'],
    packages: [
      { name: 'Single Session', description: 'One 90-minute skills session — shooting, handles, footwork or defence.', sessions: 1, price: 85, popular: false },
      { name: 'Skill Block', description: 'Eight focused sessions to lock in a specific skill area in four weeks.', sessions: 8, price: 600, popular: true },
      { name: 'Full Player Development', description: 'Twenty sessions covering every dimension of the game plus athletic training.', sessions: 20, price: 1400, popular: false },
    ],
    work: [
      { student: 'Darius', goal: 'Walked on to a D3 roster', duration: '6 months', description: 'Darius was a late bloomer. Six months of daily habits and skill work turned raw potential into a real player.', visible: true },
      { student: 'Zoe', goal: 'Led her high school team in assists', duration: '5 months', description: "We overhauled Zoe's court vision and decision-making. She ran the offence by mid-season.", visible: true },
    ],
    reviews: [
      { name: 'Kevin J.', rating: 5, comment: 'Wade elevated my game like nobody else could. His eye for detail is extraordinary.', created_at: daysAgo(10) },
      { name: 'Tamara B.', rating: 5, comment: 'My daughter credits Marcus with changing her relationship with basketball entirely.', created_at: daysAgo(27) },
      { name: 'Deon P.', rating: 4, comment: 'Intense, professional, and genuinely gifted at coaching. Highly recommend.', created_at: daysAgo(58) },
    ],
    certs: [
      { name: 'USA Basketball Gold Licence', issuer: 'USA Basketball', year: 2019 },
      { name: 'NSCA-CPT Certified Personal Trainer', issuer: 'NSCA', year: 2020 },
    ],
  },
  {
    email: 'emma.l@fitconnect.com',
    name: 'Emma Laurent',
    tagline: 'Run farther, run faster, run smarter.',
    bio: `I qualified for the Boston Marathon twice and have been coaching runners of all levels for seven years. I believe that most people can run better than they think — they just need the right training structure, form cues, and recovery strategy. Whether you are chasing your first 5k or a new personal best at the marathon, I build plans that fit your life and get you to the start line healthy and ready.`,
    profilePhoto: 'https://i.pravatar.cc/600?img=25',
    location: 'Portland, OR',
    isRemote: true,
    years: 7,
    availability: ['weekdays', 'weekends', 'mornings'],
    specialties: ['Running', 'Conditioning'],
    packages: [
      { name: 'Form Analysis', description: 'A 60-minute session with video gait analysis and a corrective action plan.', sessions: 1, price: 65, popular: false },
      { name: '12-Week Race Prep', description: 'A fully structured training plan with four coaching check-ins and weekly feedback.', sessions: 4, price: 320, popular: true },
      { name: 'Monthly Coaching', description: 'Ongoing weekly check-ins, adaptive training plans, and injury prevention guidance.', sessions: 4, price: 280, popular: false },
    ],
    work: [
      { student: 'Claire', goal: 'Finished her first marathon', duration: '4 months', description: 'Claire had never run more than 10k. A progressive build-up plan got her to the finish line strong.', visible: true },
      { student: 'Josh', goal: 'Cut 12 minutes off his half-marathon PB', duration: '3 months', description: 'Targeted tempo work and better pacing strategy dropped Josh\'s time dramatically.', visible: true },
    ],
    reviews: [
      { name: 'Rachel G.', rating: 5, comment: 'Emma\'s plans are intelligent and genuinely enjoyable to follow. My running has never felt this good.', created_at: daysAgo(5) },
      { name: 'Matt P.', rating: 5, comment: 'The form work alone was worth it. I have not had a single injury since working with Emma.', created_at: daysAgo(23) },
      { name: 'Sophie C.', rating: 4, comment: 'Great coach and extremely responsive. My pacing improved hugely.', created_at: daysAgo(50) },
    ],
    certs: [
      { name: 'RRCA Certified Running Coach', issuer: 'Road Runners Club of America', year: 2017 },
      { name: 'NASM Certified Personal Trainer', issuer: 'NASM', year: 2018 },
    ],
  },
  {
    email: 'kai@fitconnect.com',
    name: 'Kai Nakamura',
    tagline: 'Technique is speed. Speed is everything.',
    bio: `I swam competitively through college and spent three years as an assistant coach at a Division I programme before pursuing private coaching full-time. I work with swimmers at every level — from beginners learning their first strokes to club swimmers trying to shave tenths off their times. My coaching is detail-obsessed and highly technical, because in swimming, every detail matters.`,
    profilePhoto: 'https://i.pravatar.cc/600?img=62',
    location: 'San Diego, CA',
    isRemote: false,
    years: 6,
    availability: ['weekdays', 'weekends', 'mornings', 'afternoons'],
    specialties: ['Swimming', 'Conditioning'],
    packages: [
      { name: 'Single Lane Session', description: 'One 60-minute private pool session with video analysis and technical feedback.', sessions: 1, price: 75, popular: false },
      { name: 'Stroke Clinic', description: 'Six sessions targeting one specific stroke, with video review after each session.', sessions: 6, price: 420, popular: true },
      { name: 'Competitive Season Prep', description: 'Twelve sessions of structured technical and race-pace training.', sessions: 12, price: 780, popular: false },
    ],
    work: [
      { student: 'Tyler', goal: 'Dropped 4 seconds off his 100m freestyle', duration: '8 weeks', description: 'Targeted underwater work and turn mechanics slashed Tyler\'s time and got him a personal best.', visible: true },
      { student: 'Mei', goal: 'Learned to swim at 28', duration: '3 months', description: 'Mei went from terrified of deep water to confidently swimming laps with proper technique.', visible: true },
    ],
    reviews: [
      { name: 'Hiro T.', rating: 5, comment: 'Kai is one of the most technical coaches I have ever met. My times dropped and my form is completely different.', created_at: daysAgo(7) },
      { name: 'Linda N.', rating: 5, comment: 'He turned my son into a competitive swimmer in less than a year. Extraordinary coach.', created_at: daysAgo(21) },
      { name: 'David W.', rating: 4, comment: 'Focused, disciplined, and incredibly knowledgeable. Exactly what I needed.', created_at: daysAgo(48) },
    ],
    certs: [
      { name: 'ASCA Level 4 Certified Coach', issuer: 'American Swimming Coaches Association', year: 2019 },
      { name: 'USA Swimming Coach Safety Training', issuer: 'USA Swimming', year: 2021 },
    ],
  },
];

// Returns an ISO string for a date offset by `days` (negative = past) at a given hour (UTC)
const schedAt = (days: number, hour: number) => {
  const d = new Date(Date.now() + days * 86400000);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
};

interface StudentData {
  email: string;
  name: string;
  trainerEmail: string;
}

const STUDENTS: StudentData[] = [
  { email: 'demo.student@fitconnect.com', name: 'Demo Student',  trainerEmail: 'marcus@fitconnect.com' },
  { email: 'alex@student.com',  name: 'Alex Johnson',  trainerEmail: 'marcus@fitconnect.com' },
  { email: 'emma@student.com',  name: 'Emma Clarke',   trainerEmail: 'marcus@fitconnect.com' },
  { email: 'cem@student.com',   name: 'Cem Yılmaz',    trainerEmail: 'sofia@fitconnect.com'  },
  { email: 'sara@student.com',  name: 'Sara Koç',      trainerEmail: 'darnell@fitconnect.com'},
];

export function seed() {
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
  const insStudentProfile = db.prepare(`
    INSERT INTO student_profiles (user_id, name, created_at)
    VALUES (?, ?, datetime('now'))
  `);
  const insEnroll = db.prepare(`
    INSERT INTO trainer_students (trainer_id, student_id, enrolled_at)
    VALUES (?, ?, datetime('now'))
  `);
  const insSession = db.prepare(`
    INSERT INTO training_sessions (trainer_id, student_id, title, scheduled_at, duration_min, status, notes)
    VALUES (@trainer_id, @student_id, @title, @scheduled_at, @duration_min, @status, @notes)
  `);
  const insChangeReq = db.prepare(`
    INSERT INTO session_change_requests (session_id, requested_by, proposed_at, message, status, created_at)
    VALUES (?, ?, ?, ?, 'pending', datetime('now'))
  `);
  const insMessage = db.prepare(`
    INSERT INTO messages (trainer_id, student_id, sender, content, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const run = db.transaction(() => {
    db.exec(`
      DELETE FROM messages;
      DELETE FROM session_change_requests;
      DELETE FROM training_sessions;
      DELETE FROM trainer_students;
      DELETE FROM student_profiles;
      DELETE FROM trainer_specialties;
      DELETE FROM pricing_packages;
      DELETE FROM previous_work;
      DELETE FROM reviews;
      DELETE FROM certifications;
      DELETE FROM trainer_profiles;
      DELETE FROM specialties;
      DELETE FROM users;
    `);
    try { db.exec('DELETE FROM sqlite_sequence'); } catch { /* created lazily */ }

    const specId: Record<string, number | bigint> = {};
    for (const name of SPECIALTIES) {
      specId[name] = insSpec.run(name).lastInsertRowid;
    }

    const trainerHash = bcrypt.hashSync('trainer123', 10);
    const trainerIdByEmail: Record<string, number | bigint> = {};

    for (const t of TRAINERS) {
      const userId = insUser.run(t.email, trainerHash, 'trainer').lastInsertRowid;
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

      trainerIdByEmail[t.email] = trainerId;

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

    // ── Students ────────────────────────────────────────────────────────────
    const studentHash = bcrypt.hashSync('student123', 10);
    const studentIdByEmail: Record<string, number | bigint> = {};

    for (const s of STUDENTS) {
      const userId = insUser.run(s.email, studentHash, 'student').lastInsertRowid;
      const studentId = insStudentProfile.run(userId, s.name).lastInsertRowid;
      studentIdByEmail[s.email] = studentId;
      const trainerId = trainerIdByEmail[s.trainerEmail];
      insEnroll.run(trainerId, studentId);
    }

    // ── Training sessions ────────────────────────────────────────────────────
    // Marcus (trainer 1) ↔ Alex (student 1)
    const marcus = trainerIdByEmail['marcus@fitconnect.com'];
    const alexId  = studentIdByEmail['alex@student.com'];
    const emmaId  = studentIdByEmail['emma@student.com'];
    const sofia   = trainerIdByEmail['sofia@fitconnect.com'];
    const cemId   = studentIdByEmail['cem@student.com'];
    const darnell = trainerIdByEmail['darnell@fitconnect.com'];
    const saraId  = studentIdByEmail['sara@student.com'];

    // Past sessions — Marcus & Alex
    insSession.run({ trainer_id: marcus, student_id: alexId,  title: 'Deadlift Technique',        scheduled_at: schedAt(-14, 9),  duration_min: 60, status: 'confirmed', notes: 'Focus on hip hinge and bar path.' });
    insSession.run({ trainer_id: marcus, student_id: alexId,  title: 'Squat Progression',          scheduled_at: schedAt(-7,  9),  duration_min: 60, status: 'confirmed', notes: 'Working up to 3×5 back squat.' });
    insSession.run({ trainer_id: marcus, student_id: alexId,  title: 'Upper Body Push',             scheduled_at: schedAt(-3,  10), duration_min: 60, status: 'confirmed', notes: 'Bench press + OHP accessory work.' });

    // Upcoming sessions — Marcus & Alex
    const sess1 = insSession.run({ trainer_id: marcus, student_id: alexId,  title: 'Pull Day — Rows & Pull-Ups', scheduled_at: schedAt(2,  9),  duration_min: 60, status: 'confirmed', notes: '' });
    const sess2 = insSession.run({ trainer_id: marcus, student_id: alexId,  title: 'Leg Day — Heavy Squats',     scheduled_at: schedAt(7,  9),  duration_min: 75, status: 'confirmed', notes: 'Aiming for a new 5-rep max.' });
    insSession.run({ trainer_id: marcus, student_id: alexId,  title: 'Conditioning Circuit',        scheduled_at: schedAt(14, 10), duration_min: 45, status: 'confirmed', notes: '' });

    // Upcoming sessions — Marcus & Emma
    insSession.run({ trainer_id: marcus, student_id: emmaId, title: 'Foundation Assessment',        scheduled_at: schedAt(3,  11), duration_min: 75, status: 'confirmed', notes: 'First session — movement screen and goal setting.' });
    insSession.run({ trainer_id: marcus, student_id: emmaId, title: 'Barbell Basics',                scheduled_at: schedAt(10, 11), duration_min: 60, status: 'confirmed', notes: '' });

    // Sofia & Cem
    insSession.run({ trainer_id: sofia, student_id: cemId,   title: 'Hip Opener Flow',              scheduled_at: schedAt(1,  8),  duration_min: 60, status: 'confirmed', notes: '' });
    insSession.run({ trainer_id: sofia, student_id: cemId,   title: 'Shoulder Mobility & Breath',    scheduled_at: schedAt(8,  8),  duration_min: 60, status: 'confirmed', notes: 'Bring a block and strap.' });

    // Darnell & Sara
    insSession.run({ trainer_id: darnell, student_id: saraId, title: 'Boxing Fundamentals',          scheduled_at: schedAt(4,  18), duration_min: 60, status: 'confirmed', notes: 'Bring hand wraps.' });
    insSession.run({ trainer_id: darnell, student_id: saraId, title: 'Pad Work & Footwork',           scheduled_at: schedAt(11, 18), duration_min: 60, status: 'pending',   notes: '' });

    // ── Change requests ──────────────────────────────────────────────────────
    // Alex requests to move sess1 two days later
    insChangeReq.run(
      sess1.lastInsertRowid,
      'student',
      schedAt(4, 9),
      "Something came up on Thursday — can we move to Saturday morning instead?"
    );
    // Marcus requests to move sess2 one day earlier
    insChangeReq.run(
      sess2.lastInsertRowid,
      'trainer',
      schedAt(6, 9),
      "I have a scheduling conflict on the 7th. Can we do the 6th instead?"
    );

    // ── Messages — Marcus & Alex ─────────────────────────────────────────────
    const msgs: Array<{ sender: 'trainer' | 'student'; content: string; hoursAgo: number }> = [
      { sender: 'student',  content: "Hey Marcus! Quick question — should I eat before our morning sessions or train fasted?",                                                    hoursAgo: 72 },
      { sender: 'trainer',  content: "Great question. For sessions under 60 minutes, fasted is fine if you tolerate it well. If you feel weak or dizzy, grab a banana 30 min before.",  hoursAgo: 71 },
      { sender: 'student',  content: "Got it. I'll try fasted first and see how it goes. Also, my lower back was a bit sore after the deadlifts — is that normal?",             hoursAgo: 70 },
      { sender: 'trainer',  content: "Some muscle soreness in the erectors is totally normal, especially early on. If it's sharp or on one side, tell me immediately. Otherwise it should clear in 48 hours.", hoursAgo: 69 },
      { sender: 'student',  content: "It's just that dull muscle ache, feels fine. I'm actually excited for the squat session next week — been practicing the hip hinge at home.", hoursAgo: 48 },
      { sender: 'trainer',  content: "Love the dedication! Make sure you're not rounding your lower back at the bottom. Record yourself from the side and send me a clip — happy to give you feedback.", hoursAgo: 47 },
      { sender: 'student',  content: "Will do! Sent you a video in email. Also I requested to reschedule Thursday's session — something came up at work.",                        hoursAgo: 24 },
      { sender: 'trainer',  content: "Saw the reschedule request — no problem, Saturday works. And I'll check the video tonight. Keep the work up, you're progressing really well.", hoursAgo: 23 },
      { sender: 'student',  content: "Thanks! Really appreciate it. See you Saturday 💪",                                                                                         hoursAgo: 22 },
      { sender: 'trainer',  content: "See you then. Rest up tomorrow — legs are gonna be working hard on Saturday.",                                                               hoursAgo: 21 },
    ];

    for (const m of msgs) {
      const createdAt = new Date(Date.now() - m.hoursAgo * 3600000).toISOString();
      insMessage.run(marcus, alexId, m.sender, m.content, createdAt);
    }

    // A short exchange — Sofia & Cem
    const sofaMsgs: Array<{ sender: 'trainer' | 'student'; content: string; hoursAgo: number }> = [
      { sender: 'student',  content: "Merhaba Sofia! Yarınki seans için hazır mıyım? Blok ve kayış getirmemi söylediniz.",  hoursAgo: 10 },
      { sender: 'trainer',  content: "Merhaba Cem! Evet, bloğunu ve kayışını getir. Ayrıca rahat kıyafet giy — bugün kalça açılımına odaklanacağız.", hoursAgo: 9  },
      { sender: 'student',  content: "Harika, teşekkürler. Görüşürüz!",                                                       hoursAgo: 9  },
    ];

    for (const m of sofaMsgs) {
      const createdAt = new Date(Date.now() - m.hoursAgo * 3600000).toISOString();
      insMessage.run(sofia, cemId, m.sender, m.content, createdAt);
    }
  });

  run();
  return TRAINERS.length;
}

// Run directly: tsx src/lib/seed.ts
if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  const count = seed();
  console.log(`Seeded ${count} trainers + ${STUDENTS.length} students.`);
  console.log('Trainer login  → marcus@fitconnect.com / trainer123');
  console.log('Student logins → alex@student.com / student123');
  console.log('               → emma@student.com / student123');
  console.log('               → cem@student.com  / student123');
  console.log('               → sara@student.com / student123');
}
