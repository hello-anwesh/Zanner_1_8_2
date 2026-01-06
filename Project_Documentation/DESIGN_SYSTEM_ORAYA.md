# 🎨 DESIGN SYSTEM - Based on Oraya Reference
**Date:** January 6, 2026 at 22:32 PM IST  
**Reference:** Oraya Settings Screenshot  
**Goal:** Extract exact design values to create elegant, professional UI

---

## 📐 MEASUREMENTS FROM REFERENCE

### Colors
```css
/* Backgrounds */
--bg-app: #2B2B35;              /* Main app background */
--bg-card: #333340;             /* Card/panel background */
--bg-secondary: #3D3D4A;        /* Secondary elements */
--bg-input: #2A2A35;            /* Input fields */

/* Borders */
--border-subtle: rgba(255,255,255,0.08);
--border-medium: rgba(255,255,255,0.12);
--border-strong: rgba(255,255,255,0.2);

/* Text */
--text-primary: #FFFFFF;        /* Headers, primary text */
--text-secondary: #B8B8C4;      /* Body text */
--text-tertiary: #808090;       /* Muted text */
--text-disabled: #5A5A6A;       /* Disabled state */

/* Accents */
--accent-blue: #00A8E8;         /* Primary action color */
--accent-green: #00C48C;        /* Success/configured */
--accent-red: #FF6B6B;          /* Error/warning */
```

### Typography Scale
```css
/* Headers */
--text-2xl: 24px;    /* Page title */
--text-xl: 20px;     /* Section headers */
--text-lg: 18px;     /* Card titles */
--text-base: 16px;   /* Body text */
--text-sm: 14px;     /* Secondary text */
--text-xs: 12px;     /* Labels, captions */

/* Font Weights */
--font-semibold: 600;
--font-medium: 500;
--font-normal: 400;

/* Line Heights */
--leading-tight: 1.2;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Spacing System
```css
/* From Oraya analysis */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
```

### Component Sizing

#### Buttons
```css
/* Primary Button (Configure) */
padding: 12px 24px;              /* py-3 px-6 */
font-size: 14px;                 /* text-sm */
font-weight: 500;                /* font-medium */
border-radius: 8px;              /* rounded-lg */
height: 40px;

/* Secondary Button */
padding: 10px 20px;              /* py-2.5 px-5 */
font-size: 14px;
height: 36px;
```

#### Input Fields
```css
padding: 12px 16px;              /* py-3 px-4 */
font-size: 14px;
height: 44px;
border-radius: 8px;
border: 1px solid var(--border-medium);
```

#### Cards/Panels
```css
/* Provider Card */
padding: 20px 24px;              /* py-5 px-6 */
border-radius: 12px;             /* rounded-xl */
border: 1px solid var(--border-subtle);
margin-bottom: 12px;             /* space-y-3 */

/* Modal/Dialog */
padding: 24px;                   /* p-6 */
border-radius: 16px;             /* rounded-2xl */
max-width: 480px;
```

#### Tabs
```css
/* Tab Container */
padding: 4px;                    /* p-1 */
background: var(--bg-card);
border-radius: 8px;
border: 1px solid var(--border-subtle);

/* Tab Button */
padding: 8px 16px;               /* py-2 px-4 */
font-size: 14px;
font-weight: 500;
border-radius: 6px;
min-width: 100px;

/* Active Tab */
background: var(--accent-blue);
color: #000000;
```

---

## 🎯 CALCULATED VALUES FOR PROVIDER CARDS

### Card Structure
```
┌─────────────────────────────────────────────────┐
│  [24px padding top]                             │
│  ┌───────────────────────────────────────────┐  │
│  │ [Icon] Provider Name        [Status] [Btn]│  │
│  │        Description                         │  │
│  └───────────────────────────────────────────┘  │
│  [24px padding bottom]                          │
└─────────────────────────────────────────────────┘

Padding: 20-24px (vertical & horizontal)
Icon: 20x20px
Icon margin-right: 16px
Title font: 18px semibold
Description font: 14px regular, opacity 0.6
Status badge: 12px padding, 14px font
Button: 40px height, 24px horizontal padding
Gap between elements: 16px
```

### List Spacing
```
Card height: ~76px (content + padding)
Gap between cards: 12px
Container padding: 32px
```

---

## 🎨 VISUAL HIERARCHY

### Primary Actions
- Background: #00A8E8
- Text: #000000
- Font weight: 500
- Size: 14px
- Padding: 12px 24px

### Status Indicators
- Configured: Green badge (#00C48C)
- Not configured: No badge
- Error: Red badge (#FF6B6B)

### Typography Hierarchy
1. **Page Title** (24px, semibold, white)
2. **Section Headers** (18px, semibold, white)
3. **Card Titles** (18px, semibold, white)
4. **Body Text** (14px, regular, #B8B8C4)
5. **Labels** (12px, medium, #808090)

---

## ✅ IMPLEMENTATION CHECKLIST

### IntegrationsHub Component
- [ ] Page padding: 32px
- [ ] Title: 24px semibold
- [ ] Subtitle: 14px, opacity 0.5
- [ ] Tab container: 4px padding, proper spacing
- [ ] Active tab: Blue background, black text
- [ ] Provider cards: 20-24px padding
- [ ] Card spacing: 12px gap
- [ ] Provider name: 18px semibold
- [ ] Description: 14px, opacity 0.6
- [ ] Configure button: 40px height, blue bg
- [ ] Configured badge: Green, 12px padding
- [ ] Proper icon sizing: 16-20px
- [ ] Consistent border radius: 8-12px
- [ ] Clean hover states

---

## 🔍 KEY PRINCIPLES

1. **Generous Padding**: Never less than 16px, usually 20-24px
2. **Consistent Gaps**: 12px between cards, 16px between sections
3. **Typography Scale**: Clear hierarchy, proper sizes
4. **Button Sizing**: Minimum 40px height for primary actions
5. **Visual Weight**: Semibold for headers, medium for buttons, regular for body
6. **Color Usage**: Blue for actions, green for success, subtle grays for text
7. **Border Radius**: 8px default, 12px for cards, 16px for modals

---

**Next Step:** Apply these exact values to IntegrationsHub.tsx
