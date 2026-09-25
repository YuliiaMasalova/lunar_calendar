# SPEC: AuraLunar — Лунный и астрологический календарь

Версия: build-ready · 2026-09-23 · автор ТЗ: Yuliia · источник дизайна: [Figma AuraLunar](https://www.figma.com/design/M1VsbaOwwPoa1l5fpOIJq4/lunar_calendar)

Этот документ — единственный источник правды для `builder`, `reviewer` и `storybook`. Токены и состояния сверены с Figma через MCP (get_variable_defs / get_metadata / get_screenshot), fileKey `M1VsbaOwwPoa1l5fpOIJq4`.

---

## 0. Обзор

**AuraLunar** — адаптивное SPA (desktop + mobile iPhone 13/14) лунного и астрологического календаря. Приложение **не привязано к году**: контент 2027 в исходниках — тестовый набор, а не жёсткий диапазон. На любую дату пользователь получает лунный день (1–30), фазу Луны, знак зодиака, планетарные аспекты и рекомендации по 5 категориям.

Два экрана приложения (см. §3):
1. **Daily Forecast** (Today) — главный экран дня.
2. **Monthly Calendar** — сетка месяца + справочные блоки.

> **UI Kit / Calendar Cell Spec Sheet из Figma — это НЕ экран приложения.** Это справочник стилей для настройки Tailwind (токены, состояния ячейки, иконки, теги). Его не верстаем как страницу.

---

## 1. ОБЯЗАТЕЛЬНОЕ УСЛОВИЕ: стилизация только через Tailwind CSS

**Вся стилизация выполняется ИСКЛЮЧИТЕЛЬНО через Tailwind CSS.**

Запрещено:
- inline-стили (`style={{...}}`), кроме динамических значений, которые физически нельзя выразить классом (например вычисляемый `transform` для анимации, `--css-var` для позиционирования) — и такие случаи должны быть явно обоснованы в PR;
- CSS-in-JS (styled-components, emotion, и т.п.);
- отдельные `.css`/`.scss`/`.module.css` файлы.

Разрешено ровно два CSS-артефакта:
- `src/index.css` — только директивы Tailwind (`@tailwind base; @tailwind components; @tailwind utilities;`) и, при необходимости, `@layer` с токен-CSS-переменными;
- `tailwind.config.ts` — вся тема (`theme.extend`) на основе токенов из §9.

Цвета, отступы, радиусы, типографика, тени берутся из `tailwind.config` (токены §9), не хардкодятся хексами в JSX. `reviewer` возвращает FAIL при любом нарушении этого раздела.

---

## 2. Технический стек (зафиксирован)

| Слой | Решение |
| --- | --- |
| Сборка | **Vite** |
| Фреймворк | **React + TypeScript** (strict) |
| Роутинг | **React Router** — deep links `/calendar/:year/:month`, `/day/:date`, `/` → редирект на сегодня |
| Данные/кэш | **TanStack Query** (React Query) — кэш ответов астро-API по ключу (дата+локация), 24h |
| i18n | **react-i18next** — UK / RU / EN, двухслойный (§7) |
| Стили | **Tailwind CSS** (см. §1) |
| Иконки | inline SVG-компоненты (знаки зодиака, chevrons, фазы) |
| Storybook | все компоненты из §11 загружаются в Storybook + Chromatic |

Шрифт интерфейса — **Poppins** (по токенам Figma). Подключается через `@fontsource/poppins` или Google Fonts link в `index.html`; веса 400/500/600/700.

---

## 3. Архитектура данных (гибридная)

Два независимых слоя, соединяются на лету по ключу `lunar_day_number` (1–30).

> **Реализация:** Слой A — реальный астрономический расчёт библиотекой
> **`astronomy-engine`** (pure JS, без API-ключа, работает офлайн, без внешнего
> провайдера). Слой B — **база знаний** `src/knowledge-base/*.json` (только тексты,
> RU-канон, без дат). В кодовой базе **нет захардкоженных дат/годов**: приложение
> не привязано к году, любой месяц/день считается на лету.
>
> Модули: `src/services/astro/AstroCalculator.ts` (эфемериды: знак Луны и переход,
> восход/заход, фаза, лунный день, VoC, аспекты, ретрограды, затмения),
> `src/services/knowledge/KnowledgeService.ts` (маппинг расчёта на тексты KB,
> сборка карточки дня, годовые ретрограды/затмения),
> `src/services/LunarEngineService.ts` (адаптер под контракт `AstroData`).
> Таймзона — `Intl.DateTimeFormat().resolvedOptions().timeZone` (устройство);
> координаты — из `LocationContext`. Все времена — в локальном времени наблюдателя.
> Языки: KB — RU; для UK/EN — RU-контент с баннером «перевод недоступен» (§7.5).

### Слой A — динамический расчёт (astronomy-engine)

Приложение не хранит даты/лунные дни. На пару `(дата, координаты)` движок рассчитывает астрономический пакет. **Контракт** (`AstroData`, основные поля):

```json
{
  "date": "2027-10-15",
  "location": { "lat": 50.45, "lon": 30.52, "city": "Kyiv" },
  "lunar_day_number": 15,
  "lunar_days": [15, 16],
  "lunar_day_transition_time": "17:32",
  "moon_phase": "full_moon",
  "illumination_percent": 100,
  "zodiac_sign": "aries",
  "zodiac_transition_sign": null,
  "zodiac_transition_time": null,
  "moonrise": "17:32",
  "moonset": "07:12",
  "void_of_course": null,
  "moon_event": { "kind": "full_moon", "time": "16:47" },
  "aspects": [{ "planet": "saturn", "geometry": "conjunction", "time": "21:37" }]
}
```

**Лунный день** меняется по восходам Луны: день 1 = [новолуние, первый восход), день 2 = [1-й восход, 2-й) и т. д.; новолуние обнуляет счёт. В сутки может быть 1–3 ЛД (`lunar_days`, §7.1: `28/29/1`, `29/1/2`). Подписи ячеек календаря строятся из структурных полей через i18n, без строкового протокола.

### Слой B — база знаний (RU)

`src/knowledge-base/`: `lunar_days_complete.json` (30 лунных дней), `moon_transits.json` (12 знаков), `planetary_aspects.json` (аспекты Луна–планета по классам harmony/tension/insight), `retrograde_planets.json`, `eclipses.json` (по знакам). Файлы содержат **только тексты** и индексируются по `lunar_day_number`, id знака/планеты/аспекта.

`KnowledgeService` сопоставляет вычисленное с текстами: `lunar_day_number` → день KB (для двойного/тройного ЛД — блоки всех дней, переключатель в `CategoryContent`), `zodiac_sign` → транзит, вычисленный аспект → `moon_<planet>_<class>`, ретрограды и затмения года — из эфемерид (даты вычисляются, тексты из KB).

Ретрограды/затмения — годовой справочный блок Monthly Calendar; даты форматируются в таймзоне пользователя и языке интерфейса.

### LunarEngineService — обёртка над слоем A

Единая точка доступа фронтенда к астро-данным:
- принимает `(date: ISODate, location: {lat, lon, city})` и таймзону устройства;
- вызывает `AstroCalculator` и нормализует результат в `AstroData`;
- кэш — TanStack Query, ключ `['astro', date, roundedLocation]`, staleTime 24h.

```ts
const astro = await lunarEngine.getForDate(date, location);   // Слой A: astronomy-engine
const card = buildDayCard(astro, lang);                       // Слой B: KnowledgeService
```

Frontend не обращается к KB по дате — только по `lunar_day_number`/знаку/аспекту.

---

## 4. Уверенная терминология статусов дня (унификация)

В десктопе Figma — «Критический», в мобильной — «Неблагоприятный». **Фиксируется ЕДИНЫЙ статус `critical`.** Всего три статуса:

| Ключ (code) | RU | UK | EN | Токен-цвет |
| --- | --- | --- | --- | --- |
| `favorable` | Благоприятный | Сприятливий | Favorable | `#5fe3b0` (green) |
| `neutral` | Нейтральный | Нейтральний | Neutral | `#ffd166` (yellow) |
| `critical` | Критический | Критичний | Critical | `#ff6b6b` (red) |

«Неблагоприятный» из мобильного макета **не используется** нигде в коде/строках. Переводы живут в i18n-ключах `status.favorable|neutral|critical`.

---

## 5. Экраны и компоненты

Общий фон приложения: `surface/bg/bg-primary` `#0d1320`. Тема — тёмная (dark-only по макету). Верстаем desktop (1440) и mobile (390, iPhone 13/14); брейкпоинт Tailwind `md` = 768px как граница.

### 5.1. Общий Header (обе страницы)

Состав (слева направо):
- **Логотип** AuraLunar (иконка луны + wordmark), кликабелен → `/` (сегодня).
- **LocationPicker** — точка-индикатор + текст `KYIV 50.45° N`. Клик открывает typeahead выбора города (§6).
- **NavTabs** (desktop, по центру/справа): «СЕГОДНЯ» (Today, `/day/:today`) и «КАЛЕНДАРЬ МЕСЯЦА» (Monthly, `/calendar/:y/:m`). Активная вкладка подсвечена (`nav-tab/*-active`). На mobile — переносится в компактный вид (иконка «назад» + переключение, как в мобильном макете `top-bar`).
- **LangSwitcher**: `EN | RU | UK`, активный язык — strong (вес 700, цвет `text-primary`), остальные — `lang-button/text-default`, hover `lang-button/text-hover` (#a88bff), разделитель `|`.

Footer (обе страницы): «AuraLunar Ephemeris Engine · Sidereal & Tropical precision computation» слева; «Kyiv 50°27' N 30°31' E · © {year} AuraLunar» справа. Координаты берутся из активной локации.

### 5.2. Экран Daily Forecast (`/day/:date`)

Порядок блоков (desktop):

1. **Hero (DayHero)**, по центру, с радиальным purple-glow фоном:
   - надпись-эйбрау (accent green, label/sm caps): «НЕБЕСНЫЙ ПРОГНОЗ НА СЕГОДНЯ» / для не-сегодня — дата;
   - крупный display: «{n} лунный день» (typography `display/lunar-day` 76/96, вес 600); при двойном ЛД — «{n}/{m} лунный день» (см. §8);
   - строка знака (accent purple): «ЛУНА В СКОРПИОНЕ ♏» + иконка знака;
   - подзаголовок (`motto` из JSON): «Время глубокой интуиции и трансформации».

2. **CategoryTabs** — 5 фильтров-чипов (chip-токены, цветная точка + подпись caps):
   - `health_and_body` — «ЗДОРОВЬЕ & ТЕЛО»
   - `beauty` — «КРАСОТА & СТРИЖКИ»
   - `business` — «БИЗНЕС & ДЕЛА»
   - `dreams` — «СНЫ & ИНТУИЦИЯ»
   - `talismans` — «ТАЛИСМАНЫ & КАМНИ»
   Активный чип — подсвечен; выбор переключает контент карточки ниже. По умолчанию активна первая категория.

3. **CategoryContent (DayCard body)** — левая колонка (desktop 2/3):
   - заголовок категории с цветной точкой (напр. «Резонанс Здоровья и Медицины»);
   - для `health_and_body`: две колонки — «РЕКОМЕНДУЕТСЯ» (green «+», список `recommended`) и «ОСТОРОЖНО» (red «−», список `caution`); футер карточки — «Биоритмический статус: {biorhythm_status}» и «Фаза: {moon_phase}»;
   - для остальных 4 категорий: одиночный текстовый блок (строка из JSON).

4. **PlanetaryAspects** — правая колонка, карточка:
   - заголовок «ПЛАНЕТАРНЫЕ АСПЕКТЫ» + диапазон времени (напр. «09:42 – 19:10 UTC»);
   - строки: время · название аспекта · **AspectBadge** (тег). Типы тегов (§9 badge):
     - `120° ГАРМОНИЯ` — harmony (green);
     - `90° НАПРЯЖЕНИЕ` — tension (pink/red);
     - `60° ИНСАЙТ` — insight (purple);
     - `транзит` — переход Луны в знак (нейтральный/insight-стиль).
   - источник: `planetary_aspects[]` из JSON (`time`, `aspect`, `type`); маппинг `type → badge-variant`.

5. **DayParameters** — правая колонка, карточка:
   - заголовок «ПАРАМЕТРЫ ДНЯ» + локация (напр. «KYIV · 50°27 N»);
   - строки key/value: «Восход / Заход Луны» (`moonrise`/`moonset`), «Освещенность» (`illumination_percent`), «Луна без курса» (`void_of_course` — значение красным, `text/error`).
   - числа/время — из слоя A; подписи — из i18n.

Mobile (390): те же блоки в одну колонку, hero компактнее, CategoryTabs — горизонтальный скролл, aspects/parameters — стек под контентом.

### 5.3. Экран Monthly Calendar (`/calendar/:year/:month`)

1. **Заголовок**: эйбрау «ЛУННЫЙ КАЛЕНДАРЬ» + heading «Календарь месяца».
2. **MonthSelector**: `chevron-left` (пред. месяц) · кнопка месяца-года «СЕНТЯБРЬ 2026» + `chevron-down` (открывает выбор месяца/года) · `chevron-right` (след. месяц). Диапазон навигации не ограничен. Меняет URL `/calendar/:year/:month`.
3. **Weekday header**: ПН ВТ СР ЧТ ПТ СБ ВС — **неделя начинается с понедельника** (Monday-first), локализуется.
4. **CalendarGrid** — динамическая сетка недель `week-0…week-4` × 7 ячеек, вычисляется на лету из выбранного месяца. Ведущие/хвостовые дни соседних месяцев — `disabled`-ячейки (см. §6.6).
5. **CalendarCell** — ячейка дня (Material 3, спека 40×40 из UI Kit масштабируется до реальной сетки, radius 12):
   - верх-лево: лунный день из `lunar_days` (напр. «20/21 лд»);
   - верх-право: иконка знака зодиака из `zodiac_sign` (при переходе Луны — две иконки: `zodiac_sign` и `zodiac_transition_sign`);
   - центр: крупное число даты (`display/calendar-date` 32/48 или mobile 36/40);
   - низ: подпись времени (напр. «.../20:50», «с 06:57», «06:27/08:39», «Полнолуние 17:58», «без смены»), локализованная через i18n;
   - фон/бордер — по `day_status` (favorable/neutral/critical), состояния §6.6.
6. **StatusLegend**: три пункта с точкой + подписью — Благоприятный / Нейтральный / Критический. **Не полагается только на цвет** (§10): точка + текстовая подпись обязательны.
7. **RetrogradeBlock** «РЕТРОГРАДНЫЕ ПЛАНЕТЫ»: список строк — chip-диапазон дат + планета/знаки + толкование (периоды считаются из эфемерид, толкования — из `retrograde_planets.json`).
8. **EclipseBlock** «ЗАТМЕНИЯ {year}»: список строк — дата + событие + описание (`eclipses[]`).

Клик по ячейке → `/day/:date` (Daily Forecast этого дня).

Mobile: сетка адаптируется (более узкие ячейки, `mobile-calendar-cell` типографика 10/36), справочные блоки — стек.

---

## 6. Поведение

### 6.1. Геолокация
- При первом заходе — запрос **Geolocation API** с понятным объяснением, зачем (приватность, §10).
- Координаты → reverse-geocoding (Nominatim/OSM или платный геокодер) → город; отображается как `KYIV 50.45° N`.
- Координаты передаются в слой A для точного расчёта восхода/захода и смены лунных суток (зависит от часового пояса и долготы).
- **Ручной выбор**: typeahead-поиск города/страны из справочника; результат заменяет автолокацию.
- **Сохранение**: выбранная локация → `localStorage` (ключ `auralunar.location`), восстанавливается при следующих визитах до явного изменения.
- **Приватность**: координаты используются только для астро-запроса, не передаются третьим сторонам сверх необходимого.

### 6.2. i18n (двухслойная)
- **UI-строки**: react-i18next, namespaces `common`, `daily`, `calendar`; языки UK/RU/EN.
- **JSON-контент**: параллельная структура на 3 языках. Формат — на выбор пайплайна: либо `content.{ru,en,uk}.json` с одинаковой схемой, либо одно поле = `{ru, en, uk}`. Builder закладывает абстракцию `getContent(lunarDay, lang)`.
- Даты, месяцы, числа форматируются по активному языку (`Intl` / date-fns locale).
- Перевод эзотерического контента — профессиональный, не машинный (нефункц. требование).

### 6.3. Кэширование
- Ключ кэша: `(date, локация с округлением до города)`, TTL 24h (TanStack Query staleTime + gcTime).
- Переключение между уже посещёнными днями/месяцами не дёргает API повторно.
- Последний успешный ответ сохраняется для офлайн-режима (§8).

### 6.4. Deep links
- `/day/:date` (ISO `YYYY-MM-DD`) — конкретный день; можно поделиться.
- `/calendar/:year/:month` — конкретный месяц.
- `/` → редирект на `/day/{today}`.
- Невалидные параметры URL → fallback на сегодня/текущий месяц + мягкое уведомление.

### 6.5. Состояния компонентов (общий перечень)
Для каждого интерактивного компонента предусмотреть применимые состояния: **default, hover, focus (видимый focus-ring `border/focus` #a88bff), active/pressed, selected, today, disabled, loading (skeleton), empty, error, success**.

### 6.6. CalendarCell — 5 состояний × 3 статуса
Матрица из Figma (`calendar-cell/*`), radius 12, border-width default 1 / strong 2:

| Состояние | favorable (fill / border) | neutral | critical |
| --- | --- | --- | --- |
| **Default** | `#5fe3b033` / `#5fe3b066` | `#ffd16633` / `#ffd16666` | `#ff6b6b33` / `#ff6b6b66` |
| **Hover** | `#5fe3b059` / `#5fe3b099` | `#ffd16659` / `#ffd16699` | `#ff6b6b59` / `#ff6b6b99` |
| **Selected** (border-width 2) | `#5fe3b059` / `#5fe3b0cc` | `#ffd16659` / `#ffd166cc` | `#ff6b6b59` / `#ff6b6bcc` |
| **Today** (border-width 2, solid) | `#5fe3b033` / `#5fe3b0` | `#ffd16633` / `#ffd166` | `#ff6b6b33` / `#ff6b6b` |
| **Disabled** | приглушённая (dim), текст `text/disabled/disabled-primary` #e7eef766, без hover/click | — | — |

Focus (клавиатура) — дополнительный ring `border/focus`, не заменяет статус-бордер. Today и Selected могут совмещаться (Today-ring + Selected-fill).

---

## 7. Edge cases (обязательны к реализации)

1. **Двойной/тройной лунный день.** Лунный день меняется по восходу Луны, а новолуние обнуляет счёт, поэтому в сутки бывает 1–3 ЛД (`lunar_days`: `1/2`, `28/29/1`, `29/1/2`). Ячейка/карточка показывает **все** лунные дни суток; на Daily Forecast — одна карточка с переключателем ЛД, контент всех дней доступен. Подпись времени в ячейке строится из структурных полей: `…/{восход}` или `{смена знака}/{восход}`, `с {время}` (один ЛД с известным стартом), «Полнолуние/Новолуние {время}», «без смены».
2. **Void of Course (Луна без курса).** Диапазон `void_of_course.start–end` показывается в DayParameters красным (`text/error`); отдельно можно подсветить в аспектах.
3. **Отказ API (слой A).** Daily Forecast → skeleton, затем error-состояние с кнопкой «Повторить» (retry). Monthly Calendar → сетка рисуется с заглушками статусов (neutral/пустой), чтобы не блокировать навигацию; ретрай точечный.
4. **Отказ геолокации.** Если пользователь не дал доступ — показываем дефолтную локацию (Kyiv) + приглашение выбрать город вручную; приложение полностью функционально.
5. **Нет перевода контента для языка.** Fallback-цепочка: выбранный язык → RU (базовый) → показать с пометкой «перевод недоступен» вместо пустоты.
6. **Длинные тексты.** Рекомендации/толкования могут быть длинными — блоки тянутся по высоте, без обрезки смысла; на mobile — перенос, не горизонтальный скролл. Ячейка календаря — фикс. размер, подпись времени усекается с ellipsis при переполнении.
7. **Пустые данные.** Нет аспектов на день → блок PlanetaryAspects показывает empty-state («Значимых аспектов нет»). Нет ретроградов/затмений за год → блоки показывают empty-state.
8. **Offline.** При наличии кэшированного последнего успешного ответа — показываем его с индикатором «офлайн / данные из кэша».
9. **Граничные значения.** Лунный день строго 1–30; месяц 1–12; корректная генерация сетки для месяцев с ведущими/хвостовыми днями (Monday-first), 4–6 недель.

---

## 8. A11y

- **Контраст.** Текст на цветных статусах (особенно `critical` #ff6b6b) — не ниже WCAG AA. Основной текст — светлый (`text-primary` #e7eef8) на тёмном фоне #0d1320. Проверять контраст подписей на fill-ах ячеек.
- **Легенда не только цветом.** StatusLegend и ячейки несут текст/подпись/точку, а не только заливку (dependence-on-color fail недопустим).
- **Клавиатурная навигация по сетке.** CalendarGrid — стрелки ←→↑↓ перемещают фокус между ячейками (roving tabindex), Enter/Space открывают день; сетка — `role="grid"`, строки `role="row"`, ячейки `role="gridcell"`.
- **ARIA:**
  - LangSwitcher — `role="group"` / кнопки с `aria-pressed`, `aria-label="Language"`;
  - LocationPicker — `aria-label`, typeahead с `role="combobox"` + `aria-expanded` + `aria-activedescendant`;
  - MonthSelector — кнопки chevron с `aria-label` («Предыдущий месяц» / «Следующий месяц» / «Выбрать месяц»);
  - NavTabs — `role="tablist"`/ссылки с `aria-current="page"`;
  - CategoryTabs — `role="tablist"`, `aria-selected` на активном фильтре; контент — `role="tabpanel"`.
- **Focus-стан.** Видимый focus-ring `border/focus` #a88bff на всех интерактивных элементах; не убирать outline без замены.
- **Семантика.** Заголовки h1→h2→h3 по иерархии; списки рекомендаций — `<ul>`; время — `<time datetime>`.
- **prefers-reduced-motion.** Уважать при анимации glow/переходов.

---

## 9. Дизайн-токены → Tailwind (сверено с Figma)

Токены готовы лечь в `tailwind.config.ts` → `theme.extend`. Значения — из Figma (fileKey `M1VsbaOwwPoa1l5fpOIJq4`).

### 9.1. Цвета — поверхности и фон
| Токен | HEX | Назначение |
| --- | --- | --- |
| `bg-primary` | `#0d1320` | основной фон приложения |
| `bg-secondary` | `#0e1423` | вторичный фон |
| `card-primary` | `#121621cc` | фон карточек (с прозрачностью) |
| `overlay-dark` | `#080d1980` | оверлеи/затемнение |
| `surface-dark-alt` | `#1f1f26` | альт. тёмная поверхность |

### 9.2. Цвета — текст
| Токен | HEX |
| --- | --- |
| `text-primary` | `#e7eef8` |
| `text-secondary` / `body-primary` | `#e7eef7cc` |
| `text-tertiary` | `#e7eef7b2` |
| `disabled-primary` | `#e7eef766` |
| `disabled-secondary` | `#e7eef799` |
| `heading-accent` (green) | `#5fe3b0` |
| `heading-secondary` | `#e7eef7f2` |

### 9.3. Цвета — статусы и семантика
| Токен | HEX | Роль |
| --- | --- | --- |
| `success` / status `favorable` | `#5fe3b0` | благоприятный (green) |
| `warning` / status `neutral` | `#ffd166` | нейтральный (yellow) |
| `error` / status `critical` | `#ff6b6b` | критический (red) |
| `accent` / `link-default` | `#a88bff` | акцент purple, ссылки, focus |
| `link-hover` | `#cebdff` | ссылка hover |
| `info-primary` | `#2563eb` | информационный (blue) |
| `info-secondary` | `#62bfeae5` | информационный вторичный |

### 9.4. Цвета — бордеры
| Токен | HEX |
| --- | --- |
| `border-primary` | `#ffffff1a` |
| `border-secondary` | `#ffffff0d` |
| `border-focus` | `#a88bff` |
| `border-success` | `#5fe3b066` |
| `border-inverse` | `#e5e7eb33` |

### 9.5. Типографика (font-family Poppins, size/line-height/weight)
| Токен | size/lh/weight | Применение |
| --- | --- | --- |
| `display-lunar-day` | 76 / 96 / 600 | hero «N лунный день» |
| `display-calendar-date` | 32 / 48 / 600 | число даты в ячейке |
| `mobile-cal-date` | 36 / 40 / 600 | число даты (mobile) |
| `label-md` | 16 / 24 / 500 | подписи, кнопки |
| `label-md-regular` | 16 / 24 / 400 | обычный текст 16 |
| `label-md-strong` | 16 / 24 / 700 | активный язык, акценты |
| `label-sm` | 12 / 16 / 500 | мелкие подписи, эйбрау |
| `caption-sm` | 12 / 18 / 400 | капшены |
| `meta-sm` | 12 / 18 / 500 | мета в календаре |
| `cal-lunar-day` | 12 / 18 / 500 | «20/21 лд» в ячейке |
| `cal-lunar-time` | 12 / 18 / 400 | подпись времени в ячейке |
| `mobile-cal-weekday` | 10 / 16 / 500 | дни недели (mobile) |

### 9.6. Радиусы и отступы
- **radius** (px): `4`, `8`, `12` (cell), `16`, `28`, `full` (10000).
- **spacing/scale** (px): `4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 48, 60, 64, 96`.

### 9.7. CalendarCell (Material 3) — токены ячейки
- radius `12`; border-width default `1`, strong `2`; spacing `4`; padding — h `12`, top `8`, bottom `12`.
- Полная матрица fill/border по 3 статусам × состояниям — см. §6.6.

### 9.8. AspectBadge (теги аспектов)
radius `8`, padding h `12` / v `4`, border-width `1`, typography `12/16/500`.
| Вариант | text | fill | border |
| --- | --- | --- | --- |
| `tension` (90° напряжение) | `#ff6b6b` | `#ff6b6b33` | `#ff6b6b66` |
| `harmony` (120° гармония) | `#5fe3b0` | `#5fe3b026` | `#5fe3b033` |
| `insight` (60° инсайт) | `#a88bff` | `#1a1f2d99` | `#a88bff59` |

### 9.9. Chip (CategoryTabs / фильтры)
radius `8`, padding h `24` / v `12`, spacing `8`, border-width `1`, fill `#0d1320`, border-default `#ffffff0d`, dot-default `#e7eef766`, text-default `#e7eef7cc`.
Цветные варианты точки/бордера: green `#5fe3b0`, pink `#ff6b6b`, blue `#2563eb`, purple `#a88bff` (border-суффикс `66`/`59`).

### 9.10. NavTab (верхняя навигация Today/Calendar)
radius `12`, padding h `24` / v `12`, border-width `1`.
| Состояние | fill | border | text |
| --- | --- | --- | --- |
| default | — | — | `#e7eef7cc` |
| hover | `#121621cc` | `#ffffff0d` | — |
| active | `#1a1f2d99` | `#ffffff1a` | `#e7eef8` |
| pressed | `#1a1f2d` | `#ffffff1a` | — |
| disabled | — | — | `#e7eef766` |

### 9.11. LangButton
padding h `4`; text default `#e7eef7cc` (16/24/400), hover `#a88bff`, active/strong 16/24/700 `text-primary`, disabled `#e7eef766`.

### 9.12. ZodiacIcon
size `24`, stroke-width `2`. 12 иконок знаков зодиака (символы ♈♉♊♋♌♍♎♏♐♑♒♓ или SVG-глифы).

### 9.13. Эффекты
- glow purple: `#a88bff26` (radial glow за hero);
- shadow card: `#00000080`.

> Все значения выше извлечены из Figma-переменных. При расхождении с текущим состоянием макета — Figma-переменные считаются приоритетным источником; сверять при обновлении дизайна.

---

## 10. Нефункциональные требования

- **Производительность:** первичная загрузка карточки дня ≤ 1–2 с при тёплом кэше; запросы к астро-API кэшируются (§6.3); сетка месяца не блокируется ожиданием ответа по каждой ячейке.
- **Адаптивность:** брейкпоинты минимум mobile (iPhone 13/14, 390) и desktop (1440); граница `md` 768px.
- **Устойчивость к сбоям:** понятное error-состояние + retry при недоступности API; сохранение последнего успешного ответа для офлайна.
- **Локализация:** даты/месяцы/числа — по активному языку; профессиональный перевод эзотерического контента.
- **Приватность геоданных:** координаты только для астро-запроса, не передаются третьим сторонам сверх необходимого; запрос геолокации с объяснением.
- **Контент-операции:** тексты KB (`src/knowledge-base/`) обновляются контент-командой; даты ретроградов и затмений вычисляются движком и в обновлении не нуждаются.

---

## 11. Инвентарь компонентов (для builder и Storybook)

Все компоненты загружаются в Storybook (+ Chromatic). Для каждого — stories на все применимые состояния из §6.5.

| Компонент | Назначение | Ключевые состояния / props |
| --- | --- | --- |
| `Header` | шапка обеих страниц | компоновка desktop/mobile |
| `NavTabs` | навигация Today / Monthly | default/hover/active/pressed/disabled; `aria-current` |
| `LangSwitcher` | EN\|RU\|UK | активный/hover/disabled; `lang`, `onChange` |
| `LocationPicker` | локация + typeahead | default/open/loading/error/empty; `city`, `coords`, `onSelect` |
| `DayHero` | hero Daily Forecast | single/double ЛД; `lunarDay`, `zodiac`, `motto` |
| `CategoryTabs` | 5 фильтров-чипов | default/hover/selected/disabled; `active`, `onChange` |
| `CategoryContent` | тело карточки дня | health_and_body (рек/осторожно) vs строка; loading/empty/error |
| `PlanetaryAspects` | блок аспектов | loading/empty/error; `aspects[]` |
| `AspectBadge` | тег аспекта | tension/harmony/insight/транзит |
| `DayParameters` | параметры дня | loading/error; VoC красным |
| `CalendarGrid` | сетка месяца | loading(skeleton)/error(заглушки); `role=grid`, клавиши |
| `CalendarCell` | ячейка дня | 5 состояний × 3 статуса (§6.6); single/double ЛД; disabled |
| `MonthSelector` | выбор месяца/года | chevrons + dropdown; `year`, `month`, `onChange` |
| `StatusLegend` | легенда статусов | 3 статуса, не только цветом |
| `RetrogradeBlock` | ретроградные планеты | loading/empty; `items[]` |
| `EclipseBlock` | затмения года | loading/empty; `items[]` |
| `MoonPhaseIcon` | иконка фазы Луны | по `moon_phase` + `illumination_percent` |
| `ZodiacIcon` | иконка знака (12 шт) | size 24, stroke 2; `sign` |
| `Skeleton` / `ErrorState` / `EmptyState` | общие состояния | reusable для карточек и сетки |

---

## 12. Маршрутизация (сводка)

| Route | Экран | Примечание |
| --- | --- | --- |
| `/` | → redirect | на `/day/{today}` |
| `/day/:date` | Daily Forecast | `date` = ISO `YYYY-MM-DD` |
| `/calendar/:year/:month` | Monthly Calendar | `year` 4 цифры, `month` 1–12 |
| `*` | fallback | мягкий редирект на сегодня |

---

## Приложение A. Источники и соответствие ТЗ

Данный SPEC полностью покрывает исходное ТЗ (разделы 1–9 оригинала): обзор, гибридная архитектура данных (слои A/B), логика связки, навигация и сетка, геолокация + i18n, техстек (зафиксирован), контракты данных, дизайн (Figma), нефункциональные требования. Терминология статусов унифицирована (§4). Токены сверены с Figma (§9). Данные считаются на лету (astronomy-engine, §3) и сопоставляются с текстовой KB (`src/knowledge-base/`).
