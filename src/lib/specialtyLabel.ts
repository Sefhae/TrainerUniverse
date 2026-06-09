import type { Lang } from './i18n';

// Display-only translations for specialty group labels + options. The English
// name stays the canonical value (used for filtering, URLs and DB storage); only
// the shown label is localized. Anything missing falls back to the English name.

const TR: Record<string, string> = {
  // Groups
  'Sports & Athletics': 'Spor & Atletizm',
  'Wellness & Health': 'Sağlık & Wellness',
  'Academic': 'Akademik',
  'Creative & Tech': 'Yaratıcılık & Teknoloji',
  // Sports
  'Gym Training': 'Salon Antrenmanı',
  'Muscle Building': 'Kas Geliştirme',
  'Powerlifting': 'Powerlifting',
  'Calisthenics': 'Kalistenik',
  'HIIT': 'HIIT',
  'Conditioning': 'Kondisyon',
  'Weight Loss': 'Kilo Verme',
  'CrossFit': 'CrossFit',
  'Boxing': 'Boks',
  'Martial Arts': 'Dövüş Sanatları',
  'Soccer': 'Futbol',
  'Basketball': 'Basketbol',
  'Tennis': 'Tenis',
  'Volleyball': 'Voleybol',
  'Baseball': 'Beyzbol',
  'Cricket': 'Kriket',
  'Badminton': 'Badminton',
  'Running': 'Koşu',
  'Cycling': 'Bisiklet',
  'Swimming': 'Yüzme',
  // Wellness
  'Yoga': 'Yoga',
  'Pilates': 'Pilates',
  'Mobility': 'Mobilite',
  'Rehabilitation': 'Rehabilitasyon',
  'Stretching': 'Esneme',
  'Meditation': 'Meditasyon',
  'Nutrition': 'Beslenme',
  'Meal Planning': 'Beslenme Planı',
  'Sports Nutrition': 'Sporcu Beslenmesi',
  'Weight Management': 'Kilo Yönetimi',
  // Academic
  'Mathematics': 'Matematik',
  'Physics': 'Fizik',
  'Chemistry': 'Kimya',
  'Biology': 'Biyoloji',
  'English': 'İngilizce',
  'History': 'Tarih',
  // Creative & Tech
  'Programming': 'Programlama',
  'Web Development': 'Web Geliştirme',
  'Data Science': 'Veri Bilimi',
  'UI/UX Design': 'UI/UX Tasarımı',
  'Graphic Design': 'Grafik Tasarım',
  'Photography': 'Fotoğrafçılık',
  'Video Editing': 'Video Düzenleme',
  'Music': 'Müzik',
};

const ES: Record<string, string> = {
  // Groups
  'Sports & Athletics': 'Deporte y Atletismo',
  'Wellness & Health': 'Bienestar y Salud',
  'Academic': 'Académico',
  'Creative & Tech': 'Creatividad y Tecnología',
  // Sports
  'Gym Training': 'Entrenamiento en Gimnasio',
  'Muscle Building': 'Desarrollo Muscular',
  'Powerlifting': 'Powerlifting',
  'Calisthenics': 'Calistenia',
  'HIIT': 'HIIT',
  'Conditioning': 'Acondicionamiento',
  'Weight Loss': 'Pérdida de Peso',
  'CrossFit': 'CrossFit',
  'Boxing': 'Boxeo',
  'Martial Arts': 'Artes Marciales',
  'Soccer': 'Fútbol',
  'Basketball': 'Baloncesto',
  'Tennis': 'Tenis',
  'Volleyball': 'Voleibol',
  'Baseball': 'Béisbol',
  'Cricket': 'Críquet',
  'Badminton': 'Bádminton',
  'Running': 'Carrera',
  'Cycling': 'Ciclismo',
  'Swimming': 'Natación',
  // Wellness
  'Yoga': 'Yoga',
  'Pilates': 'Pilates',
  'Mobility': 'Movilidad',
  'Rehabilitation': 'Rehabilitación',
  'Stretching': 'Estiramientos',
  'Meditation': 'Meditación',
  'Nutrition': 'Nutrición',
  'Meal Planning': 'Planificación de Comidas',
  'Sports Nutrition': 'Nutrición Deportiva',
  'Weight Management': 'Control de Peso',
  // Academic
  'Mathematics': 'Matemáticas',
  'Physics': 'Física',
  'Chemistry': 'Química',
  'Biology': 'Biología',
  'English': 'Inglés',
  'History': 'Historia',
  // Creative & Tech
  'Programming': 'Programación',
  'Web Development': 'Desarrollo Web',
  'Data Science': 'Ciencia de Datos',
  'UI/UX Design': 'Diseño UI/UX',
  'Graphic Design': 'Diseño Gráfico',
  'Photography': 'Fotografía',
  'Video Editing': 'Edición de Video',
  'Music': 'Música',
};

export function localizeSpecialty(name: string, lang: Lang): string {
  if (lang === 'tr') return TR[name] ?? name;
  if (lang === 'es') return ES[name] ?? name;
  return name;
}
