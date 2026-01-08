# 🍊 Citrus Music

Музыкальное приложение с интеграцией VK и Яндекс Музыки.

![Version](https://img.shields.io/badge/version-1.0.0-orange)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 🚀 Возможности

### Phase 1 (MVP) - ✅ Реализовано
- ✅ Аутентификация через VK OAuth 2.1
- ✅ Загрузка плейлистов и треков из ВК
- ✅ Базовый плеер (play/pause/next/prev)
- ✅ Тёмная тема
- ✅ Поиск по каталогу VK

### Phase 2 (В разработке)
- 🔄 Интеграция Яндекс Музыки
- 🔄 Кеширование треков
- 🔄 Функция скачивания

## 📦 Установка

```bash
# Клонирование репозитория
git clone https://github.com/dany-simonov/Citrus-music.git
cd Citrus-music

# Установка зависимостей
npm install

# Копирование конфигурации
cp .env.local.example .env.local
```

## ⚙️ Настройка

### VK API

1. Создайте приложение на [VK Developers](https://dev.vk.com)
2. Установите тип приложения: "Веб-сайт"
3. Укажите redirect URI: `http://localhost:3000/auth/vk/callback`
4. Получите App ID и Client Secret
5. Добавьте их в `.env.local`:

```env
NEXT_PUBLIC_VK_APP_ID=your_app_id
VK_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_VK_REDIRECT_URI=http://localhost:3000/auth/vk/callback
```

### Yandex Music (скоро)

Интеграция с Яндекс Музыкой будет добавлена в следующих версиях.

## 🏃 Запуск

```bash
# Режим разработки
npm run dev

# Сборка
npm run build

# Продакшн
npm start
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## 🏗️ Структура проекта

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   └── auth/          # OAuth endpoints
│   ├── auth/              # Auth callback pages
│   ├── library/           # Library page
│   ├── login/             # Login page
│   ├── playlist/          # Playlist pages
│   ├── search/            # Search page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React компоненты
│   ├── layout/            # Layout components
│   ├── player/            # Player components
│   ├── playlist/          # Playlist components
│   ├── providers/         # Context providers
│   ├── track/             # Track components
│   └── ui/                # UI primitives
├── hooks/                 # Custom hooks
├── lib/                   # Utilities
├── services/              # API services
│   └── vk/                # VK API service
├── store/                 # Zustand stores
├── styles/                # Global styles
└── types/                 # TypeScript types
```

## 🛠️ Технологии

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Data Fetching:** React Query
- **Icons:** Lucide React

## 📝 API Reference

### VK API Methods используемые в приложении:
- `users.get` - Получение информации о пользователе
- `audio.get` - Получение аудиозаписей
- `audio.getPlaylists` - Получение плейлистов
- `audio.search` - Поиск аудиозаписей
- `audio.getRecommendations` - Рекомендации

## 🎨 Цветовая палитра

| Цвет | HEX | Использование |
|------|-----|---------------|
| Оранжевый (Accent) | `#E47600` | Акцентные элементы, кнопки |
| Белый | `#FFFFFF` | Фон (светлая тема) |
| Чёрный | `#000000` | Фон (тёмная тема) |
| Серый светлый | `#F5F5F5` | Вторичный фон (светлая) |
| Серый тёмный | `#1F1F1F` | Вторичный фон (тёмная) |

## 📄 Лицензия

MIT License - см. [LICENSE](LICENSE)

## 🤝 Контрибьютинг

Pull requests приветствуются! Для крупных изменений сначала откройте issue.

---

Made with 🍊 by Citrus Team