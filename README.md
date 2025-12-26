# Now Playing Sidebar Card (Home Assistant)

A **compact, theme-independent “Now Playing” card** designed specifically for use inside the  
[`sidebar-card`](https://github.com/DBuit/sidebar-card) **bottomCard** area in Home Assistant.

This card is implemented as a **single custom Lovelace card** (no `conditional`, no `vertical-stack`) so it works reliably inside the sidebar without layout bugs.

---

## ✨ Features

- ✅ **Single-card implementation**  
  Works inside `sidebar-card` where conditional / stack cards break.

- 🎵 **Now Playing display**
  - Artwork (square or poster, `object-fit: contain`)
  - Track title + artist
  - Playback progress bar (below artwork)

- ⏯️ **Playback controls**
  - Previous / Play–Pause / Next
  - **No ripple, no circles, no focus rings**
  - Optically centered icons (no “off to one side” look)

- 🎨 **Always white foreground**
  - Ignores HA light/dark theme text color changes
  - Perfect for dark sidebars in light mode
  - Scoped to this card only (no global theme impact)

- 📱 **Compact + sidebar-friendly**
  - Tuned spacing and typography
  - Designed for narrow columns
  - No wasted padding or backgrounds

- 🚫 **Smart hiding**
  - Card renders nothing when the media player is:
    - `idle`
    - `off`
    - `unavailable`

---

## 📸 Design Goal

Visually matches an **Apple TV / Spotify style Now Playing panel**, but:

- Smaller
- Cleaner
- Sidebar-safe
- No Material Design ripples or hover junk

---

## 📦 Installation

### 1️⃣ Copy the JS file

Place `now-playing-sidebar-card.js` in:

```
/config/www/now-playing-sidebar-card.js
```

---

### 2️⃣ Install via HACS

In **HACS → Frontend**, add this repository as a **custom repository** (category: **Lovelace**) if it isn’t in the default store.  
Then install **Now Playing Sidebar Card**.

After installing, confirm HACS added the resource as a JavaScript module:

```
/hacsfiles/now-playing-sidebar-card/now-playing-sidebar-card.js
```

---

### 3️⃣ Add as a Lovelace resource

In Home Assistant:

**Settings → Dashboards → Resources → Add Resource**

- **URL:**  
  ```
  /local/now-playing-sidebar-card.js
  ```
  or (HACS)
  ```
  /hacsfiles/now-playing-sidebar-card/now-playing-sidebar-card.js
  ```
- **Type:** JavaScript Module

> 💡 When editing, append `?v=1`, `?v=2`, etc. to bust cache.

---

### 4️⃣ Use it in `sidebar-card` (bottomCard)

`sidebar-card` expects the card configuration under `cardOptions`.

Example:

```yaml
bottomCard:
  type: custom:now-playing-sidebar-card
  cardStyle: |
    :host {
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      overflow: hidden;
    }
  cardOptions:
    entity: media_player.preferred_now_playing
    width: 150
    art_width: 150
    art_height: 215
    hide_youtube_cast_art: true
    show_progress: false
```

Resource example (manual or HACS):

```yaml
resources:
  - url: /local/now-playing-sidebar-card.js
    type: module
  # or
  - url: /hacsfiles/now-playing-sidebar-card/now-playing-sidebar-card.js
    type: module
```

> Notes:
> - `width` controls the card’s internal column width.
> - `art_width` / `art_height` control the artwork box.
> - This card renders nothing when the player is `idle`, `off`, or `unavailable`, so you don’t need a `conditional` wrapper.


---

## ⚙️ Configuration Options

| Option | Default | Description |
|------|--------|------------|
| `entity` | **required** | Media player entity |
| `width` | `165` | Total card column width |
| `art_width` | `165` | Artwork width |
| `art_height` | `165` | Artwork height |
| `hide_youtube_cast_art` | `true` | Hides fake Cast artwork for YouTube |
| `marquee_title` | `false` | Scrolls long titles horizontally when they overflow |
| `show_progress` | `true` | Shows playback progress bar and live updates |

Example:

```yaml
type: custom:now-playing-sidebar-card
entity: media_player.preferred_now_playing
width: 155
art_width: 155
art_height: 155
show_progress: false
```

---

## 🎯 Why This Exists

The `sidebar-card` **cannot safely render**:

- `conditional`
- `vertical-stack`
- `horizontal-stack`

Attempting to do so causes:
- Layout corruption
- Invisible cards
- Broken updates

This card solves that by:

- Rendering **everything inside one custom element**
- Handling state logic internally
- Rendering **nothing** when inactive

---

## 🧠 Implementation Notes

- Built on Home Assistant’s internal `LitElement`
- Uses HA services directly (`media_player.*`)
- CSS variables are overridden **only inside this card**
- Ripple / state-layer behavior is forcibly disabled for clean controls
- Optical centering fixes for MDI transport icons

---

## 🛠️ Development / Editing

This repo is intentionally friendly for iterative editing with **ChatGPT Codex**.

Recommended workflow:
1. Edit JS
2. Increment resource URL (`?v=8`)
3. Hard refresh dashboard
4. Iterate

---

## 🧩 Known Limitations

- Icon packs like `si:` and `phu:` must be installed if used
- Artwork aspect ratio depends on source metadata
- Designed for sidebars, not full-width dashboards

---

## 📄 License

MIT — do whatever you want with it.  
If you improve it, future you will appreciate a commit message.
