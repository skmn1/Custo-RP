# Internationalisation (i18n) Developer Guide

## Overview

Staff Scheduler Pro supports **French (fr)** as the primary locale and **English (en)** as the secondary locale. The frontend uses [react-i18next](https://react.i18next.com/) v17 with [i18next](https://www.i18next.com/) v26. The Spring Boot backend uses Spring's `MessageSource` with `Accept-Language` header resolution.

## Architecture

### Frontend

| Layer | Technology |
|---|---|
| Translation runtime | i18next v26 + react-i18next v17 |
| Resource loading | i18next-http-backend (load from `/public/locales/`) |
| Language detection | i18next-browser-languagedetector |
| Date formatting | date-fns v4 with `fr` / `enUS` locales |
| Number formatting | `Intl.NumberFormat` via `useLocaleFormat()` |

### Backend

| Layer | Technology |
|---|---|
| Locale resolution | `AcceptHeaderLocaleResolver` (Spring MVC) |
| Message bundles | `messages.properties` / `messages_fr.properties` |

---

## Translation File Structure

```
public/locales/
├── en/
│   ├── auth.json
│   ├── common.json
│   ├── employees.json
│   ├── mobile.json
│   ├── payroll.json
│   ├── pos.json
│   ├── scheduler.json
│   ├── swaps.json
│   ├── timeOff.json
│   └── validation.json
├── fr/
│   └── (same 10 files)
└── GLOSSARY.md
```

Each file is a **namespace**. Use `useTranslation(['namespace'])` to load the required namespace(s).

---

## Using Translations in Components

### Basic usage

```jsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation(['employees', 'common']);

  return (
    <div>
      <h1>{t('employees:title')}</h1>
      <button>{t('common:actions.save')}</button>
    </div>
  );
};
```

### Interpolation

```jsx
t('employees:subtitleStats', { count: employees.length })
// en: "Managing {{count}} employees"
// fr: "Gestion de {{count}} employés"
```

### Pluralisation

```jsx
// In the JSON file:
// "hours_one": "{{count}} hour"
// "hours_other": "{{count}} hours"

t('common:time.hours', { count: 5 })
// → "5 hours" (en) / "5 heures" (fr)
```

### Enum / constant mapping

When translating values from JS constants (e.g., `POS_TYPES`), use a key map:

```jsx
const TYPE_KEY_MAP = {
  BUTCHER: 'butcher',
  GROCERY: 'grocery',
  FAST_FOOD: 'fastFood',
  MIXED: 'mixed',
};

// Usage:
t(`pos:type.${TYPE_KEY_MAP[pos.type]}`)
```

---

## Date & Number Formatting

### Locale-aware dates (date-fns)

```jsx
import { useLocaleDateFns } from '../utils/formatLocale';

const MyComponent = () => {
  const { formatDate } = useLocaleDateFns();

  return <span>{formatDate(new Date(), 'PPP')}</span>;
  // → "15 juillet 2025" (fr) / "July 15, 2025" (en)
};
```

### Locale-aware numbers

```jsx
import { useLocaleFormat } from '../utils/formatLocale';

const MyComponent = () => {
  const { formatCurrency, formatPercent } = useLocaleFormat();

  return (
    <>
      <span>{formatCurrency(1234.56)}</span>
      {/* → "1 234,56 $" (fr) / "$1,234.56" (en) */}
      <span>{formatPercent(0.85)}</span>
      {/* → "85 %" (fr) / "85%" (en) */}
    </>
  );
};
```

---

## Adding New Translation Keys

1. Add the key to **both** `en/<namespace>.json` and `fr/<namespace>.json`
2. Run the completeness checker: `npm run i18n:check`
3. Use the key in your component with `t('namespace:key.path')`

### Completeness checker

```bash
npm run i18n:check
```

This script compares all keys between `en/` and `fr/` and reports any missing translations. It exits with code 1 if any are missing.

---

## Language Switching

The language toggle is in the Navbar (`FR` / `EN` buttons). It uses:

```jsx
import { useLocale } from '../hooks/useLocale';

const { locale, setLocale, isFrench, isEnglish } = useLocale();

// Switch language
setLocale('fr'); // or 'en'
```

The choice is persisted to `localStorage` under the key `scheduler.locale`.

---

## Backend i18n

### Configuration

`LocaleConfig.java` configures `AcceptHeaderLocaleResolver` with French as the default locale.

### Message files

- `src/main/resources/messages.properties` — English (fallback)
- `src/main/resources/messages_fr.properties` — French

### Using MessageSource

```java
@Autowired
private MessageSource messageSource;

Locale locale = LocaleContextHolder.getLocale();
String msg = messageSource.getMessage("error.notFound", null, locale);
```

The frontend sends `Accept-Language: fr` (or `en`) on every API request via the Axios interceptor in `src/api/config.js`.

### Adding backend messages

1. Add the key to both `messages.properties` and `messages_fr.properties`
2. Use `messageSource.getMessage(key, args, locale)` in your Java code

---

## Conventions

| Rule | Detail |
|---|---|
| Default locale | `fr` (French) |
| Key naming | Dot-separated, camelCase segments: `section.subSection.keyName` |
| Namespace per domain | employees, payroll, pos, scheduler, etc. |
| Shared keys | Use the `common` namespace |
| Avoid hardcoded strings | Every user-visible string must use `t()` |
| Loop variable naming | When iterating with `.map()`, do **not** name the variable `t` (conflicts with the translation function). Use `tp`, `item`, etc. |
| Date formatting | Always use `useLocaleDateFns()`, never raw `date-fns` `format()` |
| Number/currency | Always use `useLocaleFormat()`, never raw template literals |
