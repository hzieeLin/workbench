# Light Theme Refresh Design

## Goal

Refresh TaskFlow into a calm light productivity workspace and repair visible mojibake Chinese UI copy. The change is visual and textual only: it must not alter routing, persistence, stores, database entities, or task/calendar/statistics behavior.

## Design Direction

Use the approved "clean workspace" direction:

- Soft warm-neutral app background instead of stark white or dark chrome.
- Near-white panels with subtle borders and restrained shadows.
- Deep blue-gray primary text, muted slate secondary text.
- Teal-green as the main action and active navigation accent.
- Amber, red, and green reserved for priority and state signals.
- Rounded corners around 8px for a professional desktop-tool feel.

## Scope

Update the visible shell and feature surfaces:

- Global app styles: font stack, background, base text color, focus rings, scrollbars, reusable CSS variables.
- Layout components: light sidebar, top bar, status bar, active navigation, board list, search input, icon buttons.
- Board components: board header, columns, task cards, labels, priority chips, add-card/add-list actions, empty state.
- Modal components: create list, create card, card detail, and time block modals should align with the light theme.
- Calendar components: header controls and month/week/day surfaces should use the shared light palette.
- Statistics components: cards, chart containers, and export controls should match the panel system.
- Copy repair: replace visible garbled Chinese labels with normal Chinese text such as "看板", "时间规划", "统计分析", "新建看板", "新建列表", "添加卡片", "请选择一个看板", and priority labels "低", "中", "高".

## Non-Goals

- Do not redesign workflows or add features.
- Do not introduce a UI framework or icon package.
- Do not change store logic, drag/drop behavior, database access, Electron config, tests, or build tooling except where existing visual files require it.
- Do not overwrite unrelated user changes in the dirty working tree.

## Implementation Notes

Prefer CSS variables in the global app style and keep component edits scoped. Preserve the existing Vue single-file component structure. Fix only visible mojibake strings encountered in the UI components touched for the theme.

## Verification

- Run the project build or the closest available validation command.
- Start the Vite dev server.
- Inspect the app in a desktop browser viewport and confirm the light theme, repaired Chinese copy, and absence of obvious overlap or broken layout.
