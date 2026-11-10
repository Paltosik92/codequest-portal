import inventory from './source-inventory.json' with { type: 'json' };

export interface Course {
  id: string;
  title: string;
  academicTitle: string;
  category: string;
  description: string;
  intro: string;
  image: string | null;
  imageFit?: 'cover' | 'contain';
  cover: 'arena' | 'mobile' | 'guild' | 'desktop' | 'web';
  accent: string;
  technologies: string[];
  order: number;
  status: 'published' | 'draft';
  materialsPath: string;
  goals: string[];
  project: string;
  sourceNote?: string;
  downloads?: { title: string; description: string; path: string; buttonLabel?: string }[];
  modules?: { title: string; from: number; to: number }[];
  plannedLessons: { number: number; title: string }[];
}

const definitions: Omit<Course, 'materialsPath' | 'plannedLessons'>[] = [
  {
    id: 'neon-arena',
    title: 'Neon Arena',
    academicTitle: 'Разработка игровых приложений',
    category: 'Игровая разработка',
    description:
      'Собери свою 2D-арену: движение, выстрелы, волны противников и тот самый game feel.',
    intro:
      'Пустая сцена превращается в arena shooter с видом сверху. Ты управляешь героем, собираешь бонусы, переживаешь волны противников и доводишь игру до версии для компьютера и Android.',
    image: 'materials/neon-arena/img/lab9/07-runtime-initial-hud.webp',
    cover: 'arena',
    accent: '#9b9dff',
    technologies: ['Godot', 'C#'],
    order: 4,
    status: 'published',
    project: '2D Arena Shooter',
    downloads: [
      {
        title: 'Спрайты и звуки Neon Arena',
        description:
          'Готовые PNG-спрайты и звуки с именами из методичек, без дублирующих вариантов. Листы анимаций содержат кадры 96×96. Файлы разложены по номерам работ.',
        path: 'materials/neon-arena/downloads/neon-arena-assets.zip',
      },
    ],
    goals: [
      'Собирать сцены и игровую логику на C#',
      'Создавать противников, волны и систему урона',
      'Добавлять HUD, звук и визуальную обратную связь',
      'Собирать игру для компьютера и Android',
    ],
  },
  {
    id: 'mobile-lab',
    title: 'Mobile Lab',
    academicTitle: 'Разработка мобильных приложений',
    category: 'Мобильная разработка',
    description:
      'Три игры в одном GameBox. От первого экрана до свайпов, компьютерного соперника и релиза.',
    intro:
      'Развивай одно Flutter-приложение вместе с Битом: игровая полка, крестики-нолики, змейка и морской бой. Проверяй интерфейсы в браузере и на Android, добавляй игровые правила и поведение соперника.',
    image: 'materials/mobile-lab/img/lab14/comic-01-bit-release-day.webp',
    cover: 'mobile',
    accent: '#65dddc',
    technologies: ['Flutter', 'Dart', 'Android'],
    order: 3,
    status: 'published',
    project: 'GameBox',
    downloads: [
      {
        title: 'Android SDK без Android Studio',
        description:
          'Инструкция для Windows 10/11: JDK, Android SDK, эмулятор и проверка окружения. Подготовь инструменты заранее — они понадобятся в работе №8.',
        path: 'materials/mobile-lab/downloads/android-sdk-setup.md',
        buttonLabel: 'Скачать инструкцию',
      },
    ],
    goals: [
      'Строить интерфейсы и переходы между экранами',
      'Управлять состоянием и игровым циклом',
      'Реализовывать компьютерного соперника',
      'Адаптировать управление под телефон и выпускать приложение',
    ],
  },
  {
    id: 'guild-of-heroes',
    title: 'Guild of Heroes',
    academicTitle: 'Объектно-ориентированное программирование',
    category: 'Основы ООП',
    description:
      'Освой ООП, развивая RPG-проект. У каждого героя своё состояние, у каждого решения — последствия.',
    intro:
      'Начни с класса Hero и постепенно создай гильдию: герои, задания, взаимодействия и сохранение данных. История развивается вместе с кодом — от первых объектов до наследования, событий и LINQ.',
    image: 'materials/guild-of-heroes/img/start-poster-01-team_v3.webp',
    cover: 'guild',
    accent: '#e3bd7a',
    technologies: ['C#', '.NET', 'ООП'],
    order: 1,
    status: 'published',
    project: 'Гильдия героев',
    goals: [
      'Различать класс, объект и состояние',
      'Применять инкапсуляцию, наследование и полиморфизм',
      'Связывать объекты через интерфейсы и композицию',
      'Работать с коллекциями, событиями и LINQ',
    ],
  },
  {
    id: 'desktop-forge',
    title: 'Desktop Forge',
    academicTitle: 'Разработка настольных приложений',
    category: 'Настольная разработка',
    description:
      'Создавай приложения, которыми удобно пользоваться: от первого окна до собственного каталога.',
    intro:
      'Знакомься с Avalonia на небольших видимых результатах: карточка студента, калькулятор заказа, настройки и список задач. Затем переходи к привязкам данных, MVVM и приложению с JSON.',
    image: 'materials/desktop-forge/img/lab9/catalog-final.png',
    imageFit: 'contain',
    cover: 'desktop',
    accent: '#7cdbb7',
    technologies: ['Avalonia', 'C#', 'MVVM'],
    order: 2,
    status: 'published',
    project: 'Собственный каталог',
    goals: [
      'Создавать окна и компоновку на AXAML',
      'Настраивать стили и привязки данных',
      'Разделять интерфейс и логику с MVVM',
      'Использовать команды, коллекции и JSON',
    ],
  },
  {
    id: 'mediahub',
    title: 'MediaHub',
    academicTitle: 'Осуществление интеграции программных модулей',
    category: 'Веб-разработка',
    description:
      'Преврати страницу в игровой магазин: витрина, корзина, API, отзывы и собственная фича.',
    intro:
      'Создай PixelPort — свой магазин инди-игр. Начни со страницы одной игры, добавь витрину и корзину на TypeScript, подключи ASP.NET Core API и PostgreSQL. В финале — отзывы, заказы, админка и собственная функция для демо-дня.',
    image: 'materials/mediahub/img/hero.png',
    cover: 'web',
    accent: '#b0a0ff',
    technologies: ['HTML', 'CSS', 'TypeScript', 'ASP.NET Core', 'PostgreSQL', 'EF Core'],
    order: 5,
    status: 'published',
    project: 'PixelPort — игровой магазин',
    downloads: [
      {
        title: 'Обложки и интерфейс PixelPort',
        description:
          'Обложки 12 игр, логотипы, баннеры, аватары и изображения состояний. Распакуй папку img в корень своего проекта.',
        path: 'materials/mediahub/downloads/pixelport-images.zip',
      },
      {
        title: 'Скриншоты игр',
        description:
          'Иллюстрации для галерей на страницах игр. Распакуй рядом с первым архивом: файлы попадут в img/screens.',
        path: 'materials/mediahub/downloads/pixelport-screenshots.zip',
      },
      {
        title: 'Данные, шаблоны и подготовка',
        description:
          'Каталог игр, данные для БД, шаблон своей функции, карточка демо-дня и памятки. Нужные файлы копируй в проект по указаниям работ.',
        path: 'materials/mediahub/downloads/pixelport-materials.zip',
      },
    ],
    goals: [
      'Верстать адаптивную витрину на HTML и CSS',
      'Создавать поиск, фильтры и корзину на TypeScript',
      'Соединять браузер и ASP.NET Core API',
      'Работать с данными, заказами и выпуском приложения',
    ],
    modules: [
      { title: 'Витрина · HTML и CSS', from: 1, to: 6 },
      { title: 'Оживляем · TypeScript в браузере', from: 7, to: 13 },
      { title: 'Сервер и база · ASP.NET Core и PostgreSQL', from: 14, to: 18 },
      { title: 'Живой магазин · данные идут в обе стороны', from: 19, to: 25 },
      { title: 'Релиз', from: 26, to: 30 },
    ],
  },
];

// Новые направления не требуют изменения маршрутов или шаблонов.
export const courses: Course[] = definitions.map((course) => {
  const source = inventory[course.id as keyof typeof inventory];
  if (!source) throw new Error(`Нет метаданных программы: ${course.id}`);
  return {
    ...course,
    materialsPath: source.source,
    plannedLessons: source.lessons.map(({ number, title }) => ({ number, title })),
  };
});
if (new Set(courses.map((c) => c.id)).size !== courses.length)
  throw new Error('Идентификаторы курсов должны быть уникальны');
for (const course of courses) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(course.id))
    throw new Error(`Недопустимый id курса: ${course.id}`);
  if (new Set(course.plannedLessons.map((l) => l.number)).size !== course.plannedLessons.length)
    throw new Error(`Повтор номера в программе: ${course.id}`);
  for (const lesson of course.plannedLessons) {
    if (
      course.modules &&
      course.modules.filter((m) => lesson.number >= m.from && lesson.number <= m.to).length !== 1
    )
      throw new Error(`Номер ${lesson.number} не принадлежит одному модулю: ${course.id}`);
  }
}
export const publishedCourses = courses
  .filter((c) => c.status === 'published')
  .sort((a, b) => a.order - b.order);
