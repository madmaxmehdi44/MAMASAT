import type { Channel, EPGProgram, EPGProgramCategory, EPGSchedule } from '../types';

// Category mapping helper
const CATEGORY_LABELS: Record<EPGProgramCategory, string> = {
  movie: 'فیلم سینمایی',
  series: 'سریال',
  sports: 'ورزشی',
  news: 'خبری و سیاسی',
  documentary: 'مستند و علمی',
  entertainment: 'سرگرمی و طنز',
  animation: 'کودک و انیمیشن',
  music: 'موسیقی و کلیپ',
  religious: 'معارفی',
  talkshow: 'گفتگو و میزگرد',
  other: 'برنامه عمومی',
};

// Seed program templates by channel category/genre
interface ProgramTemplate {
  title: string;
  originalTitle?: string;
  subtitle?: string;
  description: string;
  durationMinutes: number;
  category: EPGProgramCategory;
  ageRating?: string;
  seasonEpisode?: string;
  isLiveEvent?: boolean;
  directorOrHost?: string;
  tags?: string[];
}

const NEWS_TEMPLATES: ProgramTemplate[] = [
  {
    title: 'اخبار زنده بامدادی و رویدادهای روز',
    subtitle: 'مرور تیتر یک روزنامه‌ها و گزارش هواشناسی',
    description: 'مشروح مهم‌ترین اخبار و رویدادهای داخلی و بین‌المللی همراه با ارتباط زنده با خبرنگاران و بررسی وضعیت راه‌ها و شاخص‌های اقتصادی.',
    durationMinutes: 45,
    category: 'news',
    isLiveEvent: true,
    directorOrHost: 'تحریریه اتاق خبر',
    tags: ['زنده', 'سیاسی', 'اقتصادی'],
  },
  {
    title: 'مجله خبری تحلیلی نیمروزی',
    subtitle: 'تحلیل جامع تحولات منطقه‌ای و جهانی',
    description: 'بررسی رویدادهای اقتصادی، نفت و طلا، تازه‌ترین گزارش‌های میدانی از سراسر جهان و گفتگو با کارشناسان مسائل بین‌الملل.',
    durationMinutes: 60,
    category: 'news',
    isLiveEvent: true,
    directorOrHost: 'گروه سیاسی و بین‌الملل',
    tags: ['خبر', 'تحلیل'],
  },
  {
    title: 'گفتگوی ویژه خبری و میزگرد اقتصادی',
    subtitle: 'بررسی مسائل جاری با حضور مسئولان و منتقدان',
    description: 'مناظره و بررسی کارشناسی پیرامون سیاست‌های پولی، معیشت، بازار مسکن و سرمایه‌گذاری با حضور صاحب‌نظران برجسته.',
    durationMinutes: 50,
    category: 'talkshow',
    isLiveEvent: true,
    directorOrHost: 'میزگرد تحلیلی',
    tags: ['مناظره', 'زنده', 'اقتصاد'],
  },
  {
    title: 'مستند گزارش میدانی جهان',
    subtitle: 'روایتی از بحران‌های اقلیمی و زیست‌محیطی',
    description: 'مستند پژوهشی درباره دگرگونی‌های اقلیمی خاورمیانه، منابع آبی و چالش‌های زیست‌محیطی قرن بیست و یکم.',
    durationMinutes: 45,
    category: 'documentary',
    directorOrHost: 'مستندسازان مستقل',
    tags: ['مستند', 'محیط زیست'],
  },
  {
    title: 'مشروح اخبار شبانگاهی (بخش اصلی)',
    subtitle: 'مهم‌ترین سرخط خبرهای ایران و جهان',
    description: 'بخش اصلی خبری با مروری بر تحولات دیپلماتیک، گزارش‌های اختصاصی، اخبار فناوری و گزارش ورزشی روز.',
    durationMinutes: 60,
    category: 'news',
    isLiveEvent: true,
    directorOrHost: 'گویندگان ارشد خبر',
    tags: ['اخبار اصلی', 'زنده'],
  },
  {
    title: 'دیدگاه و بررسی پرونده‌های ژئوپلیتیک',
    subtitle: 'تحلیل استراتژیک تحولات غرب آسیا و قفقاز',
    description: 'نگاهی عمیق به قراردادهای بین‌المللی، دیپلماسی انرژی و نقش هوش مصنوعی در روابط قدرت‌های جهانی.',
    durationMinutes: 40,
    category: 'talkshow',
    directorOrHost: 'پژوهشگران روابط بین‌الملل',
    tags: ['دیپلماسی', 'استراتژیک'],
  },
];

const SPORTS_TEMPLATES: ProgramTemplate[] = [
  {
    title: 'پخش زنده فوتبال: مسابقه حساس هفته',
    subtitle: 'لیگ برتر فوتبال با تحلیل قبل و بعد بازی',
    description: 'پوشش زنده و اختصاصی رقابت‌های لیگ با گزارش فارسی، بررسی وضعیت داوری، مصاحبه در جایگاه مربیان و تحلیل آماری زنده مسابقه.',
    durationMinutes: 120,
    category: 'sports',
    isLiveEvent: true,
    ageRating: 'عمومی',
    directorOrHost: 'گزارشگر اختصاصی شبکه',
    tags: ['فوتبال', 'پخش مستقیم', 'لیگ برتر'],
  },
  {
    title: 'فوتبال برتر و آنالیز تاکتیکی بازی‌ها',
    subtitle: 'نقد داوری، آمار دوندگی و نشست‌های خبری',
    description: 'تحلیل فنی و کارشناسی مسابقات با استفاده از شبیه‌سازهای سه‌بعدی و گفتگوی تلفنی با سرمربیان و پیشکسوتان فوتبال.',
    durationMinutes: 90,
    category: 'sports',
    isLiveEvent: true,
    directorOrHost: 'تیم کارشناسی ورزشی',
    tags: ['کارشناسی', 'داوری', 'آنالیز'],
  },
  {
    title: 'مجله ورزش جهان و هایلایت لیگ قهرمانان اروپا',
    subtitle: 'برترین گل‌ها، رکوردشکنی‌ها و لژیونرها',
    description: 'گلچین درخشان‌ترین لحظات ورزش جهان، مسابقات فرمول یک، مسابقات تنیس گرنداسلم و عملکرد لژیونرهای ایرانی در لیگ‌های اروپایی.',
    durationMinutes: 60,
    category: 'sports',
    directorOrHost: 'تحریریه ورزش بین‌الملل',
    tags: ['اروپا', 'هایلایت', 'گل‌ها'],
  },
  {
    title: 'دایره طلایی: ویژه کشتی و ورزش‌های رزمی',
    subtitle: 'مرور اردوهای تیم ملی و مسابقات جهانی',
    description: 'گزارش اختصاصی از تمرینات دلاورمردان کشتی آزاد و فرنگی، مسابقات جهانی تکواندو و گفتگوی ویژه با قهرمانان المپیک.',
    durationMinutes: 50,
    category: 'sports',
    directorOrHost: 'کمیسیون کشتی و ورزش قهرمانی',
    tags: ['کشتی', 'المپیک', 'رزمی'],
  },
  {
    title: 'ویدیو چک: حواشی داغ و ناگفته‌های ورزش',
    subtitle: 'طنز انتقادی پیرامون مدیریت و اخبار جنجالی ورزش',
    description: 'برنامه‌ای پرطرفدار با رویکردی طنز و حقیقت‌یاب به اتفاقات عجیب و غریب استادیوم‌ها و قراردادهای ورزشی.',
    durationMinutes: 45,
    category: 'entertainment',
    directorOrHost: 'تیم برنامه ویدیو چک',
    tags: ['طنز ورزشی', 'حواشی'],
  },
];

const SERIES_MOVIE_TEMPLATES: ProgramTemplate[] = [
  {
    title: 'سریال درام و پرطرفدار خانوادگی',
    subtitle: 'روایتی پرکشش از سرنوشت خانواده‌ها',
    description: 'قسمت جدید از مجموعه پربیننده با دوبله فارسی باکیفیت و کیفیت تصویر بلوری ۱۰۸۰p. ماجرای تقابل رازهای گذشته و تصمیم‌های سرنوشت‌ساز.',
    durationMinutes: 60,
    category: 'series',
    ageRating: '+14',
    seasonEpisode: 'فصل ۳ · قسمت ۱۸',
    directorOrHost: 'کارگردان: کمال تبریزی',
    tags: ['درام', 'دوبله فارسی', 'پربیننده'],
  },
  {
    title: 'فیلم سینمایی برتر هالیوود و سینمای جهان',
    subtitle: 'اکشن و هیجان‌انگیز برنده جوایز اسکار',
    description: 'پخش فیلم سینمایی تماشایی با کیفیت فول‌اچ‌دی، صدای دالبی دیجیتال و زیرنویس هماهنگ. داستانی پرماجرا درباره گروهی از نجات‌دهندگان در زمان وقوع بحران جهانی.',
    durationMinutes: 120,
    category: 'movie',
    ageRating: '+16',
    directorOrHost: 'ستارگان: کریستوفر نولان',
    tags: ['سینمایی', 'اکشن', 'هیجان‌انگیز'],
  },
  {
    title: 'مجموعه طنز و کمدی خاطره‌انگیز',
    subtitle: 'لحظاتی شاد و خنده‌دار با محبوب‌ترین بازیگران',
    description: 'پخش مجدد اپیزودهای برگزیده از سریال‌های کمدی پرطرفدار به همراه پشت صحنه‌های جذاب و دیده‌نشده.',
    durationMinutes: 50,
    category: 'series',
    ageRating: 'عمومی',
    seasonEpisode: 'فصل ۲ · قسمت ۶',
    directorOrHost: 'کارگردان: رضا عطاران',
    tags: ['طنز', 'کمدی', 'نوستالژی'],
  },
  {
    title: 'فیلم سینمایی کلاسیک و ماندگار تاریخ سینما',
    subtitle: 'شاهکارهای سینمای ایران و جهان با بازسازی رنگ و صدا',
    description: 'مروری بر آثار برجسته اسطوره‌های بازیگری با نقد کوتاه پیش از اکران توسط منتقدان صاحب‌نام.',
    durationMinutes: 100,
    category: 'movie',
    ageRating: '+12',
    directorOrHost: 'میز نقد سینمایی',
    tags: ['کلاسیک', 'شاهکار', 'نقد'],
  },
  {
    title: 'سریال ماجراجویانه و رازآلود معمایی',
    subtitle: 'کشف حقیقت در میان پیچیده‌ترین معماها',
    description: 'داستان کارآگاهی کارکشته که با زنجیره‌ای از اتفاقات غیرمنتظره در شهری مه‌آلود روبرو می‌شود.',
    durationMinutes: 55,
    category: 'series',
    ageRating: '+15',
    seasonEpisode: 'فصل ۱ · قسمت ۸',
    tags: ['معمایی', 'پلیسی', 'هیجان'],
  },
];

const ENTERTAINMENT_TEMPLATES: ProgramTemplate[] = [
  {
    title: 'تاک شو شبانه و برنامه استعدادیابی',
    subtitle: 'اجرای موسیقی زنده، استندآپ کمدی و گفتگوی صمیمی',
    description: 'حضور چهره‌های محبوب فرهنگ، ورزش و هنر در استودیویی پرنشاط به همراه مسابقات مهیج بین حضار.',
    durationMinutes: 80,
    category: 'entertainment',
    ageRating: 'عمومی',
    directorOrHost: 'میزبان و مجری مهمان',
    tags: ['کمدی', 'استعدادیابی', 'موسیقی'],
  },
  {
    title: 'مسابقه بزرگ معما و چالش ذهن',
    subtitle: 'رقابت نفس‌گیر شرکت‌کنندگان بر سر جوایز ویژه',
    description: 'مسابقه هوش، حافظه و اطلاعات عمومی با آیتم‌های بصری مدرن و حضور تماشاگران پرشور.',
    durationMinutes: 60,
    category: 'entertainment',
    directorOrHost: 'اجرای مسابقه تلویزیونی',
    tags: ['مسابقه', 'اطلاعات عمومی'],
  },
  {
    title: 'خندوانه و شب‌های دورهمی',
    subtitle: 'لحظاتی به یادماندنی با بازیگران و کمدین‌های محبوب',
    description: 'بخش‌های خاطره‌انگیز و خنده‌دار با اجرای قطعات کمدی، مصاحبه‌های جذاب و گفتگوهای شوخ‌طبعانه.',
    durationMinutes: 75,
    category: 'entertainment',
    tags: ['خنده', 'سرگرمی', 'طنز'],
  },
  {
    title: 'مستند سبک زندگی، سفر و گردشگری',
    subtitle: 'سفر به بکرترین و شگفت‌انگیزترین مناطق توریستی',
    description: 'کشف جاذبه‌های باستانی، غذاهای سنتی، اکوتوریسم کویری و سواحل صخره‌ای به همراه معرفی فرهنگ اقوام.',
    durationMinutes: 45,
    category: 'documentary',
    tags: ['ایرانگردی', 'جهانگردی', 'طبیعت'],
  },
];

const DOCUMENTARY_TEMPLATES: ProgramTemplate[] = [
  {
    title: 'مستند حیات وحش: قلمرو شگفت‌انگیز شکارچیان',
    subtitle: 'تصویربرداری خیره‌کننده ۴K در دل دشت‌های آفریقا',
    description: 'روایتی خیره‌کننده از بقا در حیات وحش، مهاجرت میلیونی پستانداران و رفتارهای کمتر دیده‌شده گونه‌های نادر.',
    durationMinutes: 60,
    category: 'documentary',
    ageRating: 'عمومی',
    tags: ['حیات وحش', 'طبیعت', '۴K'],
  },
  {
    title: 'کیهان و رازهای کهکشان‌های دوردست',
    subtitle: 'سفری فراتر از منظومه شمسی با تصاویر تلسکوپ جیمز وب',
    description: 'بررسی سیاهچاله‌ها، پیدایش کائنات، ماده تاریک و امکان حیات در قمرهای یخی سیارات گازی.',
    durationMinutes: 50,
    category: 'documentary',
    tags: ['نجوم', 'علمی', 'فضا'],
  },
  {
    title: 'عجایب معماری و سازه‌های دوران باستان',
    subtitle: 'چگونه اهرام ثلاثه و شهرهای سنگی بنا شدند؟',
    description: 'رمزگشایی از دانش مهندسی باستانی تمدن‌های کهن با بازسازی‌های دیجیتال و نظرات باستان‌شناسان معاصر.',
    durationMinutes: 50,
    category: 'documentary',
    tags: ['تاریخ', 'معماری', 'تمدن'],
  },
];

const KIDS_TEMPLATES: ProgramTemplate[] = [
  {
    title: 'انیمیشن ماجراجویی پهلوانان و قهرمانان کوچک',
    subtitle: 'داستانی آموزنده از شجاعت، دوستی و جوانمردی',
    description: 'کارتون جذاب و شاد با پیام‌های اخلاقی درباره کمک به همنوع و غلبه بر ترس‌ها.',
    durationMinutes: 45,
    category: 'animation',
    ageRating: 'کودک',
    tags: ['کودک', 'کارتون', 'شاد'],
  },
  {
    title: 'ماجراهای فکری و برنامه‌سازی کارتون‌های جدید',
    subtitle: 'شعر، نقاشی، کاردستی و قصه‌گویی خاله سارا',
    description: 'برنامه‌ای شاد و رنگارنگ همراه با عروسک‌های دوست‌داشتنی و آموزش‌های ابتدایی برای خردسالان.',
    durationMinutes: 40,
    category: 'animation',
    ageRating: 'کودک و خردسال',
    tags: ['عروسکی', 'آموزشی', 'خردسال'],
  },
  {
    title: 'فیلم سینمایی انیمیشن پرماجرای سرزمین حیوانات',
    subtitle: 'دوبله خنده‌دار فارسی با ترانه‌های شاد کودکانه',
    description: 'سفر هیجان‌انگیز حیوانات بیشه به دنیای انسان‌ها برای پیدا کردن اکسیر شادابی جنگل.',
    durationMinutes: 75,
    category: 'animation',
    ageRating: 'کودک و نوجوان',
    tags: ['سینمایی کودک', 'دوبله'],
  },
];

const MUSIC_TEMPLATES: ProgramTemplate[] = [
  {
    title: 'تاپ ۲۰ موزیک ویدیوهای برتر هفته',
    subtitle: 'شمارش معکوس پرطرفدارترین ترانه‌های فارسی و جهانی',
    description: 'رتبه‌بندی هفتگی جدیدترین موزیک ویدیوها بر اساس نظرسنجی بینندگان، پشت صحنه تولید کلیپ‌ها و مصاحبه با هنرمندان.',
    durationMinutes: 60,
    category: 'music',
    tags: ['موسیقی', 'تاپ۲۰', 'جدید'],
  },
  {
    title: 'نوستالژی پاپ: جاودانه‌های موسیقی ایران',
    subtitle: 'گلچین ترانه‌های ماندگار دهه‌های ۵۰، ۶۰ و ۷۰',
    description: 'پخش باکیفیت ترانه‌های ماندگار با تصاویر بازسازی‌شده از اجراهای زنده تاریخی و خاطره‌انگیز.',
    durationMinutes: 60,
    category: 'music',
    tags: ['نوستالژی', 'موسیقی سنتی', 'پاپ'],
  },
  {
    title: 'کنسرت بزرگ استیج و اجرای زنده خوانندگان',
    subtitle: 'صدای استریو و اجرای پرشور قطعات پرطرفدار',
    description: 'پوشش اختصاصی کنسرت‌های باشکوه زنده با اجرای بهترین ارکسترها و خوانندگان نام‌آشنا.',
    durationMinutes: 90,
    category: 'music',
    isLiveEvent: true,
    tags: ['کنسرت', 'زنده', 'صحنه'],
  },
];

/**
 * Procedural pseudo-random generator with seed based on channelId and day
 */
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Determine the best pool of templates for a given channel based on name and category
 */
function getTemplatePool(channel: Channel): ProgramTemplate[] {
  const name = (channel.name + ' ' + (channel.nameEn || '')).toLowerCase();
  const category = (channel.category + ' ' + (channel.categoryEn || '')).toLowerCase();

  if (name.includes('ورزش') || name.includes('varzesh') || name.includes('sport') || category.includes('ورزش')) {
    return [...SPORTS_TEMPLATES, ...NEWS_TEMPLATES.slice(0, 2)];
  }
  if (name.includes('خبر') || name.includes('khabar') || name.includes('news') || name.includes('bbc') || name.includes('اینترنشنال') || name.includes('euronews')) {
    return [...NEWS_TEMPLATES, ...DOCUMENTARY_TEMPLATES.slice(0, 1)];
  }
  if (name.includes('مستند') || name.includes('documentary') || name.includes('geo') || name.includes('discovery')) {
    return [...DOCUMENTARY_TEMPLATES, ...NEWS_TEMPLATES.slice(3)];
  }
  if (name.includes('کودک') || name.includes('پویا') || name.includes('نهال') || name.includes('cartoon') || name.includes('junior')) {
    return [...KIDS_TEMPLATES, ...ENTERTAINMENT_TEMPLATES.slice(1, 2)];
  }
  if (name.includes('موزیک') || name.includes('music') || name.includes('pmc') || name.includes('رادیو جوان') || name.includes('radio javan')) {
    return [...MUSIC_TEMPLATES, ...ENTERTAINMENT_TEMPLATES.slice(0, 1)];
  }
  if (name.includes('سریس') || name.includes('series') || name.includes('فیلم') || name.includes('movie') || name.includes('cinema') || name.includes('آی‌فیلم') || name.includes('نمایش')) {
    return [...SERIES_MOVIE_TEMPLATES, ...ENTERTAINMENT_TEMPLATES.slice(0, 1)];
  }

  // General or entertainment channels (e.g. GEM, Fun Plus, Manoto, Nasim, Shabake 3)
  return [
    ...SERIES_MOVIE_TEMPLATES,
    ...ENTERTAINMENT_TEMPLATES,
    ...SPORTS_TEMPLATES.slice(0, 2),
    ...NEWS_TEMPLATES.slice(0, 2),
  ];
}

/**
 * Format timestamp as Persian/Arabic numerals HH:MM
 */
export function formatTimeHHMM(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Generate a complete 24-hour EPG schedule for a specific day
 */
export function generateEPGSchedule(channel: Channel, dateOffsetDays: number = 0): EPGSchedule {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + dateOffsetDays);

  const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
  const startOfDayMs = startOfDay.getTime();
  const dayOfYear = Math.floor((startOfDayMs - new Date(targetDate.getFullYear(), 0, 0).getTime()) / 86400000);

  // Deterministic seed ensures schedule remains stable throughout the day
  const seed = channel.id * 1000 + dayOfYear + (dateOffsetDays * 31);
  const rng = seededRandom(seed);

  const pool = getTemplatePool(channel);
  const programs: EPGProgram[] = [];

  let currentSlotMs = startOfDayMs;
  const endOfDayMs = startOfDayMs + 24 * 60 * 60 * 1000;
  let programIndex = 0;

  while (currentSlotMs < endOfDayMs) {
    // Pick template with pseudo-random sequence
    const templateIndex = Math.floor(rng() * pool.length);
    const template = pool[templateIndex];

    // Slight duration variation (e.g. +/- 10 mins or rounded slots: 30, 45, 60, 90, 120 mins)
    const possibleDurations = [30, 45, 50, 60, 75, 90, 120];
    const duration = possibleDurations[Math.floor(rng() * possibleDurations.length)];
    const durationMs = duration * 60 * 1000;

    const programStartMs = currentSlotMs;
    const programEndMs = Math.min(currentSlotMs + durationMs, endOfDayMs);

    const startDate = new Date(programStartMs);
    const endDate = new Date(programEndMs);

    const programId = `epg-${channel.id}-${targetDate.toISOString().slice(0, 10)}-${programIndex}`;

    programs.push({
      id: programId,
      channelId: channel.id,
      title: template.title,
      originalTitle: template.originalTitle,
      subtitle: template.subtitle,
      description: template.description,
      startTime: formatTimeHHMM(startDate),
      endTime: formatTimeHHMM(endDate),
      startTimestamp: programStartMs,
      endTimestamp: programEndMs,
      durationMinutes: Math.round((programEndMs - programStartMs) / 60000),
      category: template.category,
      categoryLabel: CATEGORY_LABELS[template.category] || 'برنامه عمومی',
      ageRating: template.ageRating,
      seasonEpisode: template.seasonEpisode,
      isLiveEvent: template.isLiveEvent,
      directorOrHost: template.directorOrHost,
      tags: template.tags,
    });

    currentSlotMs = programEndMs;
    programIndex++;
  }

  // Calculate live metadata based on current time
  const nowMs = Date.now();
  let currentProgram: EPGProgram | null = null;
  let nextProgram: EPGProgram | null = null;
  let currentProgressPercent = 0;
  let elapsedMinutes = 0;
  let remainingMinutes = 0;

  for (let i = 0; i < programs.length; i++) {
    const prog = programs[i];
    if (prog.startTimestamp <= nowMs && nowMs < prog.endTimestamp) {
      currentProgram = prog;
      nextProgram = programs[i + 1] || null;

      const totalDuration = prog.endTimestamp - prog.startTimestamp;
      const elapsed = nowMs - prog.startTimestamp;
      currentProgressPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
      elapsedMinutes = Math.floor(elapsed / 60000);
      remainingMinutes = Math.max(0, Math.ceil((prog.endTimestamp - nowMs) / 60000));
      break;
    }
  }

  // If before first program of the day or after last program
  if (!currentProgram && programs.length > 0) {
    if (nowMs < programs[0].startTimestamp) {
      nextProgram = programs[0];
    }
  }

  let dayLabel = 'امروز';
  if (dateOffsetDays === 1) dayLabel = 'فردا';
  else if (dateOffsetDays === -1) dayLabel = 'دیروز';
  else if (dateOffsetDays > 1) dayLabel = `${dateOffsetDays} روز بعد`;
  else if (dateOffsetDays < -1) dayLabel = `${Math.abs(dateOffsetDays)} روز قبل`;

  return {
    channelId: channel.id,
    channelName: channel.name,
    dateStr: targetDate.toISOString().slice(0, 10),
    dayLabel,
    programs,
    currentProgram,
    nextProgram,
    currentProgressPercent,
    elapsedMinutes,
    remainingMinutes,
    lastUpdated: nowMs,
  };
}

// LocalStorage helpers for user program reminders
const REMINDERS_KEY = 'momsat_epg_reminders';

export function getSavedReminders(): string[] {
  try {
    const stored = localStorage.getItem(REMINDERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function toggleProgramReminder(programId: string): boolean {
  const current = getSavedReminders();
  const index = current.indexOf(programId);
  let isSaved = false;

  if (index >= 0) {
    current.splice(index, 1);
    isSaved = false;
  } else {
    current.push(programId);
    isSaved = true;
  }

  try {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(current));
  } catch (err) {
    console.warn('Failed to save EPG reminder', err);
  }

  return isSaved;
}

export function isProgramReminderSet(programId: string): boolean {
  const current = getSavedReminders();
  return current.includes(programId);
}
