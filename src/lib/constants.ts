export const PRICE_MIN = 0;
export const PRICE_MAX = 200;
export const PRICE_STEP = 5;

export const SPECIALTY_GROUPS: { label: string; options: string[] }[] = [
  {
    label: 'Sports & Athletics',
    options: ['Gym Training', 'Muscle Building', 'Powerlifting', 'Calisthenics', 'HIIT', 'Conditioning', 'Weight Loss', 'CrossFit', 'Boxing', 'Martial Arts', 'Soccer', 'Basketball', 'Tennis', 'Volleyball', 'Baseball', 'Cricket', 'Badminton', 'Running', 'Cycling', 'Swimming'],
  },
  {
    label: 'Wellness & Health',
    options: ['Yoga', 'Pilates', 'Mobility', 'Rehabilitation', 'Stretching', 'Meditation', 'Nutrition', 'Meal Planning', 'Sports Nutrition', 'Weight Management'],
  },
  {
    label: 'Academic',
    options: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History'],
  },
  {
    label: 'Creative & Tech',
    options: ['Programming', 'Web Development', 'Data Science', 'UI/UX Design', 'Graphic Design', 'Photography', 'Video Editing', 'Music'],
  },
];

export const SPECIALTY_OPTIONS = SPECIALTY_GROUPS.flatMap((g) => g.options);

export const AVAILABILITY_OPTIONS = [
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'mornings', label: 'Mornings' },
  { value: 'afternoons', label: 'Afternoons' },
  { value: 'evenings', label: 'Evenings' },
];

export const EXPERIENCE_OPTIONS = [
  { value: '1-3', label: '1–3 years' },
  { value: '3-7', label: '3–7 years' },
  { value: '7+', label: '7+ years' },
];

export const RATING_OPTIONS = [
  { value: 0, label: 'Any rating' },
  { value: 4, label: '4.0 & up' },
  { value: 4.5, label: '4.5 & up' },
];

export const SORT_OPTIONS = [
  { value: 'top-rated', label: 'Top Rated' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'most-reviewed', label: 'Most Reviewed' },
  { value: 'newest', label: 'Newest' },
];

export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const DAY_PARTS = [
  { value: 'mornings', label: 'Morning' },
  { value: 'afternoons', label: 'Afternoon' },
  { value: 'evenings', label: 'Evening' },
];
