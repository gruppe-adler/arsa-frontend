# UI Redesign — Change Summary

## Design System (`src/style.css`)

Complete CSS rewrite establishing a unified design language:

- **Colour tokens** — oklch-based custom properties: `--bg`, `--bg-soft`, `--bg-sunken`, `--line`, `--line-strong`, `--ink` through `--ink-4`, `--green`, `--red`, `--indigo`, `--amber` and their soft variants.
- **Typography** — Geist (sans) + Geist Mono for monospaced metadata and inputs.
- **Buttons** — `.btn` base with variants: `btn-primary`, `btn-ghost`, `btn-danger`, `btn-start`, `btn-stop`. Disabled state handled globally.
- **Button groups** — `.btn-group` joins adjacent buttons with shared borders and correct border-radius on first/last children only.
- **Switches** — replaced broken `input[type="checkbox"]` global rules; checkboxes are now rendered as toggle switches via `FormCheckboxInput`.
- **Tabs** — `.tabs` underline-bar pattern for primary navigation; `.sub-tabs` segmented pill control for secondary navigation (white active card on grey background).
- **Dot & badge** — `.dot` with `.green` / `.red` / `.amber` glow variants; `.badge` and `.badge.offline` status pills.
- **ID chip** — `.id-chip` monospace tag with clipboard-copy interaction and green "Copied" flash state.
- **Port tag** — `.port-tag` small bordered monospace badge.
- **Log block** — `.log-block` / `.log-row` / `.log-time` / `.log-msg` for the host server log.
- **Form layout** — `.form-section` two-column grid (label sidebar + field area), `.field-list`, `.form-input-container` legacy grid for sub-components.
- **Sticky save toolbar** — `.form-toolbar` with status dot and action buttons.
- **Warning banner** — amber `.warning-banner` for destructive action warnings.
- **Responsive** — `flex-wrap: wrap` on `.tabs` and all page headers so button clusters drop to a new line on narrow viewports.

---

## Global Layout

### `src/App.vue`
- Sticky topbar: brand mark (links to `/servers-list`, no underline), `<Menu />` nav, ARS status chip driven by WebSocket.
- `<WebSocket />` moved here at top level so it's always active.

### `src/components/Menu.vue`
- Clean `RouterLink`-based nav with `.router-link-active` highlight. No more WebSocket logic here.

### `src/components/WebSocket.vue`
- Logic-only component (empty template). Handles WS heartbeat, updates `logsStore` and `serversStore` on incoming messages.

---

## Server List (`src/views/ServersList.vue`)
- Page header with Refresh + "New server" buttons.
- Bordered `.servers` container with `ServerItem` rows separated by lines.
- Empty state via `<EmptyState />`.

### `src/components/ServerItem.vue`
- Three-column grid: status dot + name link, port tag, UUID id-chip + action buttons.
- Start/Stop buttons use `btn-start` / `btn-stop` colour variants.
- UUID id-chip copies to clipboard with 1.4 s green flash.

---

## Add / Edit / View Server

### `src/views/AddServer.vue` / `EditServer.vue` / `ViewServer.vue`
- Breadcrumb navigation (no underline on links).
- Page header with server name + status badge. Header actions (import/export, clone, delete) wrap to a new line on mobile via `flex-wrap: wrap`.
- Six-tab bar: **Settings · Mods · Players · Stats · Size · Logs**. Players/Stats/Size/Logs are disabled on AddServer.
- Clone and Delete live in the header as a `btn-group`, not as tabs.
- EditServer has a sticky save toolbar (violation counter + Save/Discard).
- `ConfigUploadDownload` (download + import cluster) in header on Add/Edit.

### `src/components/ConfigUploadDownload.vue`
- Two `btn-group` clusters: **Download Server / Download Config** and **Import** (file label, shows filename when selected, indigo tint) + **Apply**.
- Hidden `<input type="file">` inside the styled label.

### `src/components/ConfigForm.vue`
- Accepts `tab: 'settings' | 'mods'` prop; parents switch between the two.
- **Settings tab** split into three sub-tabs via `<FormTabs class="sub-tabs">`:
  - **Server** — Identity, Startup Parameters, Network, A2S, RCON
  - **Game** — Game, Game Properties
  - **Advanced** — Operating
- **Identity** section description corrected: `server.name` is the ARSA-internal label, not visible in-game.
- **Game › name** field has a "Use identity" button that pastes `server.name` into `server.config.game.name`.
- Violation notice always visible regardless of active sub-tab.
- **Mods tab** — modsRequiredByDefault toggle + `FormModsInput`.

---

## Form Components

### `src/components/FormTabs.vue` *(new)*
Reusable tab bar. Props: `tabs: { key, label, disabled? }[]` + `v-model` for active key. Used for primary tabs in all views and as sub-tabs inside `ConfigForm`.

### `src/components/FormCheckboxInput.vue`
Replaced `input[type="checkbox"]` with a CSS toggle switch: rounded track fills dark on checked, white knob slides with 140 ms transition. Disabled state at 45% opacity.

### `src/components/FormTextInput.vue`
Added optional `pasteValue` prop. When present, renders the input in a flex row alongside a "Use identity" button that sets the model to the supplied value.

### `src/components/FormModsInput.vue`
- Mod list in a monospace `<select multiple>` with auto-select-all.
- Add-mod fields in a styled `.add-mod-fields` panel (modId, name, version optional, required toggle).
- Two `btn-group` clusters: **Add mod / Delete selected** and **Import modeset / Export modeset**.
- Active panel button gets indigo tint (`.has-panel`).
- Import/Export as inline `.modset-panel` overlays with textarea + foot actions. Uses `v-model` refs instead of `getElementById`.

### `src/components/FormMultiSelectModInput.vue`
- Monospace `<select>` list + controls row: text input + `btn-group` (Add / Delete).

---

## Inline Tab Components

Extracted from standalone route pages into props-based components rendered directly inside Edit/View/Add server:

### `src/components/TabPlayers.vue`
Accepts `serverId` prop. Fetches known players, renders a bordered table with Name + Identity ID columns.

### `src/components/TabStats.vue`
Accepts `serverId` prop. Fetches Docker stats. Refresh + auto-refresh toggle. Key/value table for CPU, memory, net I/O, etc.

### `src/components/TabSize.vue`
Accepts `serverId` prop. Cards for profile and server directories with mods/logs sub-rows and `<pre>` breakdowns.

### `src/components/TabLogs.vue`
Accepts `serverId` prop. Table of log directories with links to console/error/script/crash logs and per-row Delete. CrashReports.log shown at top when present.

---

## Host Server Log (`src/components/HostServerLog.vue`)

Full rewrite — parses raw `[ISO_TIMESTAMP]: {json}` strings and renders structured rows:

- **`isRunningUpdate`** → server name as `.id-chip` (clicking copies UUID, green flash) + "started" / "stopped".
- **`arsStatusUpdate`** → plain "ARS status: X".
- **`message`** type and **all other strings** → any embedded UUID is detected via regex and replaced inline with a `.id-chip` showing the resolved server name. Clicking copies the raw UUID.
- Timestamp formatted as `HH:MM:SS.mmm`.

---

## Standalone Pages (restyled)

All pages brought into the design system with consistent breadcrumb, page header, and table/card layouts:

- `src/views/PlayersList.vue`
- `src/views/ServerStats.vue`
- `src/views/ServerSize.vue`
- `src/views/ServerLogsList.vue`
- `src/views/ViewServerLog.vue`
- `src/views/ViewCrashReportsLog.vue`
- `src/views/ArsService.vue` — two-card grid: status card + recreate-image card with amber warning banner.
- `src/views/PageNotFound.vue` / `src/components/NotFound.vue` — clean 404 pages.
- `src/components/EmptyState.vue` — styled `.empty-box` with optional `message` prop.
- `src/components/Loading.vue` — consistent loading indicator.
