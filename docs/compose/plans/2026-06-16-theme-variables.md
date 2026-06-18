# Theme Variables Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Define all missing custom CSS variables for light and dark themes so the app renders correctly in both modes without color bleeding.

**Architecture:** Add a `.dark` class toggle on `<html>` via the existing theme store, then define all custom CSS variables (`--color-*`, `--radius-*`, `--shadow-*`, `--font-*`, `--blur-*`) in `:root` (light) and `.dark` (dark) blocks in App.vue's global style. Fix chart components that hardcode dark-mode colors.

**Tech Stack:** Vue 3, Ant Design Vue, CSS custom properties, Chart.js

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `src/stores/theme.ts` | Modify | Add `.dark` class toggle on `<html>` |
| `src/App.vue` | Modify | Add `:root` and `.dark` CSS variable definitions |
| `src/components/statistics/CompletionChart.vue` | Modify | Use theme store instead of hardcoded `isDark = true` |
| `src/components/statistics/TimeDistribution.vue` | Modify | Use CSS variables instead of hardcoded dark colors |
| `src/components/statistics/ProductivityTrends.vue` | Modify | Use CSS variables instead of hardcoded dark colors |

---

### Task 1: Add `.dark` class toggle to theme store

**Covers:** Theme switching mechanism

**Files:**
- Modify: `src/stores/theme.ts`

The theme store currently only updates Ant Design's algorithm. It never adds a class to `<html>`, so custom CSS variables can't respond to theme changes.

- [ ] **Step 1: Add DOM class toggle to the watch**

In `src/stores/theme.ts`, update the `watch` callback to add/remove `.dark` on `document.documentElement`:

```ts
watch(isDark, (val) => {
  localStorage.setItem('theme', val ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark', val)
}, { immediate: true })
```

The `{ immediate: true }` ensures the class is set on page load, not just on toggle.

- [ ] **Step 2: Verify the class is applied**

Run the dev server and inspect `<html>` in browser DevTools. Toggle the theme — the `dark` class should appear/disappear on `<html>`.

- [ ] **Step 3: Commit**

```bash
git add src/stores/theme.ts
git commit -m "feat: add .dark class toggle on html element for CSS variable theming"
```

---

### Task 2: Define all custom CSS variables

**Covers:** Light theme definition, Dark theme definition

**Files:**
- Modify: `src/App.vue`

This is the core fix. All 30+ custom CSS variables used across the codebase need `:root` (light) and `.dark` (dark) definitions.

- [ ] **Step 1: Add CSS variable definitions to App.vue**

Add the following block inside the existing `<style>` tag in `src/App.vue`, after the `body` rule:

```css
:root {
  /* Accent */
  --color-accent: #FF6B4A;
  --color-accent-soft: rgba(255, 107, 74, 0.12);
  --color-accent-strong: #e85a3a;

  /* Text */
  --color-text: #1a1a2e;
  --color-text-secondary: #5a5a72;
  --color-text-tertiary: #8a8a9e;
  --color-text-inverse: #ffffff;

  /* Surface */
  --color-bg: #f5f5f7;
  --color-surface: #ffffff;
  --color-surface-elevated: #ffffff;
  --color-surface-glass: rgba(255, 255, 255, 0.72);
  --color-surface-hover: rgba(0, 0, 0, 0.04);

  /* Border */
  --color-border: rgba(0, 0, 0, 0.08);
  --color-border-hover: rgba(0, 0, 0, 0.15);

  /* Semantic */
  --color-red: #ef4444;
  --color-red-soft: rgba(239, 68, 68, 0.1);

  /* Typography */
  --font-display: 'Fraunces', 'Noto Sans CJK SC', serif;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;

  /* Shadow */
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-glow: 0 0 20px rgba(255, 107, 74, 0.25);

  /* Effects */
  --blur-sm: blur(12px);
  --focus-ring: 0 0 0 3px rgba(255, 107, 74, 0.2);
}

.dark {
  /* Accent */
  --color-accent: #FF6B4A;
  --color-accent-soft: rgba(255, 107, 74, 0.15);
  --color-accent-strong: #ff8066;

  /* Text */
  --color-text: #e8e8e8;
  --color-text-secondary: #a0a0b0;
  --color-text-tertiary: #6a6a7e;
  --color-text-inverse: #ffffff;

  /* Surface */
  --color-bg: #0f0f23;
  --color-surface: #1a1a2e;
  --color-surface-elevated: #252540;
  --color-surface-glass: rgba(26, 26, 46, 0.72);
  --color-surface-hover: rgba(255, 255, 255, 0.06);

  /* Border */
  --color-border: rgba(255, 255, 255, 0.08);
  --color-border-hover: rgba(255, 255, 255, 0.15);

  /* Semantic */
  --color-red: #f87171;
  --color-red-soft: rgba(248, 113, 113, 0.12);
}
```

Note: `--font-display`, `--radius-*`, `--shadow-*`, `--blur-sm`, `--focus-ring` are the same in both themes — they only need to be in `:root`. The `.dark` block only overrides values that change.

- [ ] **Step 2: Verify light mode renders correctly**

Run the dev server in light mode. Check:
- BoardView: eyebrow text is orange, buttons have correct bg/text
- StatisticsView: stat cards have white bg with border
- AppLayout: page background is light gray
- Sidebar: logo font is Fraunces (italic serif)

- [ ] **Step 3: Verify dark mode renders correctly**

Toggle to dark mode. Check:
- BoardView: eyebrow text is orange, buttons work
- StatisticsView: stat cards have dark bg
- AppLayout: page background is dark navy
- No light-colored surfaces "bleeding through"

- [ ] **Step 4: Commit**

```bash
git add src/App.vue
git commit -m "feat: define all custom CSS variables for light and dark themes"
```

---

### Task 3: Fix CompletionChart hardcoded theme

**Covers:** Chart theme consistency

**Files:**
- Modify: `src/components/statistics/CompletionChart.vue`

The chart has `const isDark = true` hardcoded, meaning it always renders dark-mode colors.

- [ ] **Step 1: Import and use the theme store**

Replace the script section. Change:

```ts
function getChartColors() {
  const isDark = true
  return {
    completed: '#4CDF8B',
    pending: '#FFC043',
    border: isDark ? '#222326' : '#fffdf8',
    text: isDark ? '#A09E98' : '#718087',
  }
}
```

To:

```ts
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

function getChartColors() {
  const dark = themeStore.isDark
  return {
    completed: '#4CDF8B',
    pending: '#FFC043',
    border: dark ? '#1a1a2e' : '#ffffff',
    text: dark ? '#a0a0b0' : '#5a5a72',
  }
}
```

- [ ] **Step 2: Verify chart colors update on theme toggle**

Open the Statistics view. Toggle the theme — the doughnut chart border and legend text should change to match.

- [ ] **Step 3: Commit**

```bash
git add src/components/statistics/CompletionChart.vue
git commit -m "fix: use theme store in CompletionChart instead of hardcoded dark mode"
```

---

### Task 4: Fix TimeDistribution hardcoded colors

**Covers:** Chart theme consistency

**Files:**
- Modify: `src/components/statistics/TimeDistribution.vue`

Chart.js colors are hardcoded with dark-mode values (`#A09E98`, `rgba(255,255,255,0.04)`).

- [ ] **Step 1: Import theme store and use dynamic colors**

Update the script to import the store and compute colors based on theme:

```ts
import { ref, onMounted, onUnmounted } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useThemeStore } from '@/stores/theme'

Chart.register(...registerables)

const props = defineProps<{
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor?: string
    }[]
  }
}>()

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const themeStore = useThemeStore()

onMounted(() => {
  if (chartCanvas.value) {
    const isDark = themeStore.isDark
    const colors = [
      'rgba(255, 107, 74, 0.7)',
      'rgba(74, 217, 217, 0.7)',
      'rgba(255, 192, 67, 0.7)',
      'rgba(76, 223, 139, 0.7)',
    ]
    const datasets = props.data.datasets.map((d, i) => ({
      ...d,
      backgroundColor: d.backgroundColor || colors[i % colors.length],
      borderColor:
        d.backgroundColor?.replace('0.7', '1') || colors[i % colors.length].replace('0.7', '1'),
      borderWidth: 1,
    }))

    chartInstance = new Chart(chartCanvas.value, {
      type: 'bar',
      data: { labels: props.data.labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: isDark ? '#a0a0b0' : '#5a5a72',
              font: { family: "'DM Sans', sans-serif", size: 11 },
            },
          },
        },
        scales: {
          x: {
            ticks: { color: isDark ? '#6a6a7e' : '#8a8a9e', font: { size: 11 } },
            grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' },
          },
          y: {
            beginAtZero: true,
            ticks: { color: isDark ? '#6a6a7e' : '#8a8a9e', font: { size: 11 } },
            grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' },
          },
        },
      },
    })
  }
})

onUnmounted(() => {
  chartInstance?.destroy()
})
```

- [ ] **Step 2: Verify bar chart renders correctly in both themes**

Open Statistics view. Toggle theme — grid lines, tick labels, and legend should all adapt.

- [ ] **Step 3: Commit**

```bash
git add src/components/statistics/TimeDistribution.vue
git commit -m "fix: use theme-aware colors in TimeDistribution chart"
```

---

### Task 5: Fix ProductivityTrends hardcoded colors

**Covers:** Chart theme consistency

**Files:**
- Modify: `src/components/statistics/ProductivityTrends.vue`

Same issue as TimeDistribution — hardcoded dark-mode colors for legend, ticks, and grid.

- [ ] **Step 1: Import theme store and use dynamic colors**

Update the script:

```ts
import { ref, onMounted, onUnmounted } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useThemeStore } from '@/stores/theme'

Chart.register(...registerables)

const props = defineProps<{
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      borderColor?: string
      tension?: number
    }[]
  }
}>()

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const themeStore = useThemeStore()

onMounted(() => {
  if (chartCanvas.value) {
    const isDark = themeStore.isDark
    const colors = ['#FF6B4A', '#4AD9D9', '#FFC043']
    const datasets = props.data.datasets.map((d, i) => ({
      ...d,
      borderColor: d.borderColor || colors[i % colors.length],
      backgroundColor: (d.borderColor || colors[i % colors.length]).replace('1)', '0.1)'),
      tension: d.tension ?? 0.3,
      pointRadius: 3,
      pointHoverRadius: 5,
      fill: true,
    }))

    chartInstance = new Chart(chartCanvas.value, {
      type: 'line',
      data: { labels: props.data.labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: isDark ? '#a0a0b0' : '#5a5a72',
              font: { family: "'DM Sans', sans-serif", size: 11 },
            },
          },
        },
        scales: {
          x: {
            ticks: { color: isDark ? '#6a6a7e' : '#8a8a9e', font: { size: 11 } },
            grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' },
          },
          y: {
            beginAtZero: true,
            ticks: { color: isDark ? '#6a6a7e' : '#8a8a9e', font: { size: 11 } },
            grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' },
          },
        },
      },
    })
  }
})

onUnmounted(() => {
  chartInstance?.destroy()
})
```

- [ ] **Step 2: Verify line chart renders correctly in both themes**

Open Statistics view. Toggle theme — grid, ticks, and legend should adapt.

- [ ] **Step 3: Commit**

```bash
git add src/components/statistics/ProductivityTrends.vue
git commit -m "fix: use theme-aware colors in ProductivityTrends chart"
```

---

### Task 6: Final verification

**Covers:** All spec sections

- [ ] **Step 1: Run the dev server and test light mode**

Visually verify every view:
- **BoardView**: header text, buttons, columns, cards — all light-themed
- **CalendarView**: day/week/month views — light backgrounds, correct text colors
- **StatisticsView**: stat cards, charts — light backgrounds, readable text
- **Sidebar**: logo, nav menu, board list — light container
- **TopBar**: search, buttons — light container

- [ ] **Step 2: Toggle to dark mode and verify**

Same checklist — everything should be dark, no light-colored surfaces bleeding through.

- [ ] **Step 3: Toggle back and forth rapidly**

Check for any flicker or missed transitions. The `transition` on `body` in App.vue should handle smooth color changes.

- [ ] **Step 4: Run typecheck if available**

```bash
npx vue-tsc --noEmit
```

- [ ] **Step 5: Commit any remaining fixes**

```bash
git add -A
git commit -m "fix: complete theme variable definitions for light and dark modes"
```
