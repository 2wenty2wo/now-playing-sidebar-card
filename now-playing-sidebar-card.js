/* now-playing-sidebar-card.js
 * Compact sidebar Now Playing card
 * - Always white foreground (only inside this card)
 * - No rounded container behind artwork
 * - Progress bar BELOW artwork
 * - Compact controls + typography
 * - Bottom icons centered
 * - Transport icons optically centered
 * - Hides itself when idle/off/unavailable
 * - Removes ripple / circle / focus ring from controls
 */

const LitElementBase = Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const html = LitElementBase.prototype.html;
const css = LitElementBase.prototype.css;

class NowPlayingSidebarCard extends LitElementBase {
  static get properties() {
    return {
      hass: {},
      config: {},
      _tick: { type: Number },
      _titleOverflow: { type: Boolean },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        width: 100%;
      }

      ha-card {
        background: none;
        box-shadow: none;
        border: none;
        padding: 0;
        margin: 0;
        display: flex;
        justify-content: center;
        width: 100%;

        /* FORCE WHITE FOREGROUND FOR THIS CARD ONLY */
        color: #ffffff !important;
        --primary-text-color: #ffffff;
        --secondary-text-color: rgba(255, 255, 255, 0.72);

        --paper-item-icon-color: #ffffff;
        --paper-item-icon-active-color: #ffffff;
        --mdc-icon-button-ink-color: #ffffff;
        --mdc-icon-button-disabled-ink-color: rgba(255, 255, 255, 0.35);
        --mdc-theme-text-primary-on-background: #ffffff;
        --mdc-theme-text-secondary-on-background: rgba(255, 255, 255, 0.72);
      }

      /* tighter + smaller column */
      .wrap {
        width: var(--np-w, 165px);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        margin: 0 auto;
      }

      /* artwork */
      .art {
        width: var(--np-art-w, 165px);
        height: var(--np-art-h, 165px);
        max-width: 70vw;
        display: block;
        object-fit: contain;
        border-radius: 0;
      }

      .clickable {
        cursor: pointer;
      }

      /* Progress BELOW artwork */
      .progressTrack {
        width: var(--np-art-w, 165px);
        height: 4px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.22);
        overflow: hidden;
        margin-top: -2px;
      }

      .progressFill {
        height: 100%;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.92);
        width: 0%;
        will-change: width;
      }

      /* compact controls */
      .controls {
        width: var(--np-art-w, 165px);
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        margin-top: 0px;
      }

      ha-icon-button {
        --mdc-icon-size: 22px;
        width: 34px;
        height: 34px;
        padding: 0 !important;
        margin: 0 !important;

        color: #ffffff !important;
        --mdc-icon-button-ink-color: #ffffff;
      }

      /* --- Kill all circles / ripples / focus rings on icon buttons (THIS CARD ONLY) --- */
      .controls ha-icon-button {
        --mdc-ripple-hover-opacity: 0;
        --mdc-ripple-press-opacity: 0;
        --mdc-ripple-focus-opacity: 0;

        /* newer M3 vars (some builds use these) */
        --mdc-icon-button-state-layer-size: 0px;
        --mdc-icon-button-state-layer-color: transparent;
        --mdc-icon-button-hover-state-layer-opacity: 0;
        --mdc-icon-button-focus-state-layer-opacity: 0;
        --mdc-icon-button-pressed-state-layer-opacity: 0;

        background: transparent !important;
        border-radius: 0 !important;
      }

      /* Some HA builds render a <mwc-ripple> inside; hide it */
      .controls ha-icon-button mwc-ripple {
        display: none !important;
      }

      /* Also remove any focus outline/ring */
      .controls ha-icon-button:focus,
      .controls ha-icon-button:focus-visible {
        outline: none !important;
        box-shadow: none !important;
      }

      /* --- Optical centering for transport icons --- */
      .controls ha-icon-button {
        display: inline-flex;
        justify-content: center;
        align-items: center;
      }

      .controls ha-icon {
        display: flex !important;
        justify-content: center;
        align-items: center;
      }

      .controls ha-icon svg {
        margin: auto !important;
        display: block !important;
      }

      .controls ha-icon.prev {
        transform: translateX(-1px);
      }
      .controls ha-icon.next {
        transform: translateX(1px);
      }

      /* title/artist more compact */
      .title {
        width: var(--np-art-w, 165px);
        text-align: center;
        line-height: 1.12;
        margin-top: 2px;
      }

      .title .t {
        font-size: 14px;
        font-weight: 700;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: inherit;
      }

      .title .t.marquee-enabled {
        text-overflow: clip;
      }

      .marquee-viewport {
        overflow: hidden;
        mask-image: linear-gradient(90deg, transparent 0, #000 12%, #000 88%, transparent 100%);
        -webkit-mask-image: linear-gradient(
          90deg,
          transparent 0,
          #000 12%,
          #000 88%,
          transparent 100%
        );
      }

      .marquee-track {
        display: inline-flex;
        gap: var(--np-marquee-gap, 32px);
        animation: np-title-marquee var(--np-marquee-duration, 12s) linear infinite;
        will-change: transform;
      }

      .title .t.marquee-enabled .marquee-track {
        animation-delay: var(--np-marquee-delay, 1.5s);
      }

      .title:hover .marquee-track {
        animation-play-state: paused;
      }

      .marquee-text {
        display: inline-block;
        white-space: nowrap;
      }

      @keyframes np-title-marquee {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(-50%);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .title .t.marquee-enabled {
          text-overflow: ellipsis;
        }

        .title .t.marquee-enabled .marquee-viewport {
          mask-image: none;
          -webkit-mask-image: none;
        }

        .title .t.marquee-enabled .marquee-track {
          animation: none;
          transform: none;
        }

        .title .t.marquee-enabled .marquee-text + .marquee-text {
          display: none;
        }
      }

      .title .a {
        margin-top: 3px;
        font-size: 12px;
        font-weight: 600;
        opacity: 0.75;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--secondary-text-color);
      }

      /* bottom icons */
      .icons {
        width: var(--np-art-w, 165px);
        display: inline-flex;
        justify-content: center;
        align-items: center;
        gap: 14px;
        line-height: 0;
        margin-top: 2px;
        padding-bottom: 2px;
      }

      ha-icon {
        width: 30px;
        height: 30px;
        color: #ffffff !important;
        display: block;
      }
    `;
  }

  setConfig(config) {
    if (!config || !config.entity) throw new Error("now-playing-sidebar-card: entity is required");

    this.config = {
      entity: config.entity,
      width: 165,
      art_width: 165,
      art_height: 165,
      hide_youtube_cast_art: true,
      marquee_title: false,
      show_progress: true,
      tap_to_open: true,
      ...config,
    };

    this._ensureProgressTimer();
  }

  getCardSize() {
    return 3;
  }

  connectedCallback() {
    super.connectedCallback();
    this._ensureProgressTimer();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._timer) window.clearInterval(this._timer);
    this._timer = null;
  }

  updated() {
    const titleEl = this.shadowRoot?.querySelector(".title .t");
    if (!titleEl) return;

    const hasOverflow = titleEl.scrollWidth > titleEl.clientWidth;
    if (this._titleOverflow !== hasOverflow) {
      this._titleOverflow = hasOverflow;
    }
  }

  _stateObj() {
    return this.hass?.states?.[this.config.entity];
  }

  _shouldHide(stateObj) {
    const s = (stateObj?.state || "").toLowerCase();
    return s === "idle" || s === "off" || s === "unavailable" || !s;
  }

  _call(service, data = {}) {
    this.hass.callService("media_player", service, {
      entity_id: this.config.entity,
      ...data,
    });
  }

  _computeProgress(stateObj) {
    const a = stateObj?.attributes || {};
    const dur = Number(a.media_duration || 0);
    const pos = Number(a.media_position || 0);

    const state = (stateObj?.state || "").toLowerCase();
    const isPlaying = state === "playing";

    const updStr = a.media_position_updated_at;
    const updMs = updStr ? Date.parse(updStr) : 0;
    const nowMs = Date.now();

    let posNow = pos;
    if (dur > 0 && isPlaying && updMs > 0) {
      const elapsed = Math.max(0, (nowMs - updMs) / 1000);
      posNow = Math.min(dur, pos + elapsed);
    }

    const pct = dur > 0 ? Math.max(0, Math.min(100, (posNow / dur) * 100)) : 0;
    return { dur, pct };
  }

  _openMoreInfo() {
    if (this.config?.tap_to_open === false) return;
    const entityId = this.config?.entity;
    if (!entityId) return;

    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId },
        bubbles: true,
        composed: true,
      })
    );
  }

  _ensureProgressTimer() {
    const showProgress = this.config?.show_progress !== false;
    if (!showProgress) {
      if (this._timer) window.clearInterval(this._timer);
      this._timer = null;
      return;
    }

    if (this._timer) return;
    this._timer = window.setInterval(() => {
      this._tick = Date.now();
    }, 1000);
  }

  _icons(stateObj) {
    const a = stateObj?.attributes || {};
    const child = (a.active_child || "").toLowerCase();
    const appId = (a.app_id || "").toLowerCase();
    const appName = (a.app_name || "").toLowerCase();

    let deviceIcon = "";
    if (child.includes("apple_tv")) deviceIcon = "si:appletv";
    else if (child.includes("kitchen_display")) deviceIcon = "phu:nest-hub";

    let appIcon = "mdi:play-box";
    if (appId.includes("com.plexapp.plex") || appName.includes("plex")) appIcon = "si:plex";
    else if (appName.includes("youtube")) appIcon = "si:youtube";
    else if (appName.includes("spotify")) appIcon = "si:spotify";
    else if (appName.includes("iplaytv") || appName.includes("iplayer")) appIcon = "mdi:television";

    return { deviceIcon, appIcon, appName, appId };
  }

  render() {
    const stateObj = this._stateObj();
    if (!stateObj || this._shouldHide(stateObj)) return html``;

    const a = stateObj.attributes || {};
    const pic = a.entity_picture || "";

    const { deviceIcon, appIcon, appName, appId } = this._icons(stateObj);

    const hideArt =
      this.config.hide_youtube_cast_art &&
      (appName.includes("youtube") || appId.includes("youtube"));

    const showProgress = this.config.show_progress !== false;
    const { dur, pct } = showProgress ? this._computeProgress(stateObj) : { dur: 0, pct: 0 };
    const showBar = showProgress && dur > 0;

    const title = a.media_title || "";
    const artist = a.media_artist || "";
    const marqueeTitle = Boolean(this.config.marquee_title);
    const showMarquee = marqueeTitle && this._titleOverflow;

    const state = (stateObj.state || "").toLowerCase();
    const isPlaying = state === "playing";
    const playIcon = isPlaying ? "mdi:pause" : "mdi:play";

    const colW = Number(this.config.width || 165);
    const artW = Number(this.config.art_width || 165);
    const artH = Number(this.config.art_height || 165);
    const tapToOpen = this.config.tap_to_open !== false;

    return html`
      <ha-card
        style="
          --np-w:${colW}px;
          --np-art-w:${artW}px;
          --np-art-h:${artH}px;
        "
      >
        <div class="wrap">
          ${hideArt || !pic
            ? html``
            : html`
                <img
                  class=${`art${tapToOpen ? " clickable" : ""}`}
                  src="${pic}"
                  @click=${tapToOpen ? this._openMoreInfo : null}
                />
              `}

          ${showBar
            ? html`
                <div class="progressTrack">
                  <div class="progressFill" style="width:${pct}%;"></div>
                </div>
              `
            : html``}

          <div class="controls">
            <ha-icon-button
              .label=${"Previous"}
              @click=${() => this._call("media_previous_track")}
            >
              <ha-icon class="prev" icon="mdi:skip-previous"></ha-icon>
            </ha-icon-button>

            <ha-icon-button
              .label=${isPlaying ? "Pause" : "Play"}
              @click=${() => this._call("media_play_pause")}
            >
              <ha-icon class="play" .icon=${playIcon}></ha-icon>
            </ha-icon-button>

            <ha-icon-button .label=${"Next"} @click=${() => this._call("media_next_track")}>
              <ha-icon class="next" icon="mdi:skip-next"></ha-icon>
            </ha-icon-button>
          </div>

          <div
            class=${`title${tapToOpen ? " clickable" : ""}`}
            @click=${tapToOpen ? this._openMoreInfo : null}
          >
            <div
              class=${`t${showMarquee ? " marquee-enabled" : ""}`}
              title="${title}"
            >
              ${showMarquee
                ? html`
                    <div class="marquee-viewport">
                      <div class="marquee-track">
                        <span class="marquee-text">${title}</span>
                        <span class="marquee-text" aria-hidden="true">${title}</span>
                      </div>
                    </div>
                  `
                : html`<span class="marquee-text">${title}</span>`}
            </div>
            ${artist ? html`<div class="a" title="${artist}">${artist}</div>` : html``}
          </div>

          <div
            class=${`icons${tapToOpen ? " clickable" : ""}`}
            @click=${tapToOpen ? this._openMoreInfo : null}
          >
            ${deviceIcon ? html`<ha-icon icon="${deviceIcon}"></ha-icon>` : html``}
            ${appIcon ? html`<ha-icon icon="${appIcon}"></ha-icon>` : html``}
          </div>
        </div>
      </ha-card>
    `;
  }
}

customElements.define("now-playing-sidebar-card", NowPlayingSidebarCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "now-playing-sidebar-card",
  name: "Now Playing (Sidebar)",
  description: "Single-card now playing block for sidebar-card bottomCard (compact).",
});
