# chrome-block-devtools-shortcut

A minimal Google Chrome extension that prevents `Ctrl+Shift+C` from opening DevTools, while preserving the keystroke for page-level handlers — most importantly, web terminal emulators that bind `Ctrl+Shift+C` as the standard "copy" shortcut.

> **Status: Untested in Chrome.**
> This is a Chrome port of [edge-block-devtools-shortcut](https://github.com/tinywind/edge-block-devtools-shortcut). The Edge variant was developed and verified on Microsoft Edge for Windows. The code in this Chrome variant is **identical** — Manifest V3 is cross-browser, and no browser-specific APIs are used — so the mechanism *should* work in Chrome unchanged. **However, it has not been verified in Google Chrome.** If you try it and find it does not behave as documented, please open an issue.

## Purpose

Google Chrome (and Chromium broadly) hardcodes `Ctrl+Shift+C` as the **"Open DevTools to the Elements tab"** accelerator. There is no built-in user-facing toggle to disable just this one shortcut without disabling DevTools entirely.

The two obvious "fixes" both have a showstopping side effect: they kill `Ctrl+Shift+C` for *every* page handler, including web terminals that legitimately use it for copy.

| Approach | DevTools blocked | Web terminal copy still works |
|----------|------------------|-------------------------------|
| Chrome enterprise `KeyboardShortcutsConfig` policy (registry / GPO) | yes | **no** — policy consumes the keystroke at the browser-chrome level before any page sees it |
| Chrome Web Store "Disable keyboard shortcuts" extensions | yes | **no** — they call `stopImmediatePropagation()` and kill page handlers |
| **This extension** | yes (expected) | **yes** (expected) |

The root cause: `Ctrl+Shift+C` is one of Chromium's "reserved" shortcuts, and the standard ways to disable a reserved shortcut all consume the keystroke entirely. Web terminals (xterm.js, ttyd, code-server, Wetty, GoTTY, etc.) standardize on `Ctrl+Shift+C` as their copy binding precisely because `Ctrl+C` is reserved by the shell for SIGINT — but the keystroke never reaches them when DevTools-blocking workarounds are in place.

## How It Works

A content script registered against `<all_urls>` runs at `document_start` on every page and attaches a `keydown` listener in the **capture phase**. When the listener sees `Ctrl+Shift+C`:

1. `event.preventDefault()` — flags the event as `defaultPrevented`. Chrome's DevTools accelerator checks this flag and skips opening DevTools.
2. `document.execCommand('copy')` — synthesizes a `copy` event on the document. Terminal emulators register `copy` listeners and write their internal selection to the clipboard from there. Regular pages with a DOM text selection get default-copy behavior.
3. **No `stopImmediatePropagation()`** — the event still propagates, so any page handler that wants to act on the keystroke still receives it.

Net effect: DevTools never opens, and selection-based copy works in both regular pages and web terminals.

## Installation

Manual developer-mode load (this extension is not on the Chrome Web Store):

1. Clone or download this repo.
2. Open `chrome://extensions/`.
3. Enable **Developer mode** (toggle, top-right corner).
4. Click **Load unpacked**.
5. Select the cloned directory.
6. Reload any open tabs to apply.

If you have any other "disable keyboard shortcuts" extension installed, or you applied an enterprise keyboard-shortcut policy, **disable or remove them first**. They will intercept the keystroke before this extension runs and your web terminal copy will still be broken.

## Usage

There is no UI, no options page, and no background process. After installation, just press your shortcuts:

| Action | Behavior (expected) |
|--------|---------------------|
| `Ctrl+Shift+C` on a regular web page with a text selection | Selected text is copied to the clipboard. DevTools does **not** open. |
| `Ctrl+Shift+C` in a web terminal (ttyd, code-server, etc.) with terminal text selected | Terminal selection is copied to the clipboard. DevTools does **not** open. |
| `Ctrl+Shift+C` with nothing selected | No-op. DevTools does **not** open. |
| `F12` / `Ctrl+Shift+I` | DevTools opens normally. |
| Right-click → Inspect | DevTools opens normally. |

To uninstall, remove the entry from `chrome://extensions/`. The extension makes no registry or filesystem changes outside its own directory.

## Use Cases

- **Web-based terminals**: `ttyd`, `code-server`'s integrated terminal, Wetty, GoTTY, Eclipse Theia, JetBrains Projector, browser-based SSH gateways, and any xterm.js-powered emulator. These bind `Ctrl+Shift+C` as copy because shells reserve `Ctrl+C` for SIGINT.
- **Avoiding accidental DevTools popups**: keep `F12` and `Ctrl+Shift+I` working but stop opening DevTools mid-typing when you fat-finger `C` near `Shift`.
- **Drop-in replacement for failed approaches**: if you tried an enterprise keyboard policy or a Chrome Web Store "disable shortcuts" extension and your web terminals stopped copying, this extension is the targeted fix — it solves only the DevTools accelerator and leaves everything else alone.
- **Keyboard-driven users on Chromium**: any case where you want a single hardcoded Chromium accelerator silenced without nuking neighboring functionality.

## Customization

The whole logic is 16 lines in [`content.js`](content.js). Edit it directly to change behavior.

Block a different shortcut — e.g., `Ctrl+Shift+I` instead:

```javascript
// Change the key code check from KeyC to KeyI
event.code === 'KeyI'
```

Block multiple shortcuts — turn the predicate into an array:

```javascript
const blocked = [
  { ctrl: true, shift: true, code: 'KeyC' },
  { ctrl: true, shift: true, code: 'KeyI' },
];
const matches = blocked.some(
  (b) =>
    event.ctrlKey === b.ctrl &&
    event.shiftKey === b.shift &&
    event.code === b.code
);
if (matches) {
  event.preventDefault();
  document.execCommand('copy');
}
```

Drop the copy synthesis (just block, no copy):

```javascript
event.preventDefault();
// remove the document.execCommand('copy') line
```

Reload the extension from `chrome://extensions/` (the reload icon on the extension card) after editing, then refresh open tabs.

## Limitations

Content scripts cannot run on browser-internal pages:

- `chrome://*`
- The new-tab page
- The Chrome Web Store
- Settings pages

On those pages, `Ctrl+Shift+C` will still open DevTools. This is a hard restriction enforced by the extension platform itself — no extension in any Chromium browser can override it.

If full coverage on internal pages matters, you need an OS-level keystroke interceptor (AutoHotkey on Windows, Hammerspoon on macOS, or similar). For most users this isn't worth the setup cost.

## Files

| File | Purpose |
|------|---------|
| `manifest.json` | Manifest V3 declaration with one `<all_urls>` content script |
| `content.js` | Capture-phase `keydown` listener |
| `README.md` | This file |
| `LICENSE` | MIT |

## Background

This extension exists because of how Chromium chose to handle DevTools shortcuts. Relevant context:

- [Chromium issue 33056](https://groups.google.com/a/chromium.org/g/chromium-bugs/c/Ntc1byZXHfU) — original "reserved Ctrl keys" design decision (Chrome 4 era)
- [Chromium issue 174309](https://bugs.chromium.org/p/chromium/issues/detail?id=174309) — DevTools shortcut customization request; partially shipped, but does not cover the *opening* shortcuts (`F12`, `Ctrl+Shift+I`, `Ctrl+Shift+C`)
- [xterm.js issue #292](https://github.com/xtermjs/xterm.js/issues/292) — context for why web terminals standardized on `Ctrl+Shift+C` as copy

## Related

- [edge-block-devtools-shortcut](https://github.com/tinywind/edge-block-devtools-shortcut) — the Microsoft Edge variant of this extension, which has been verified on Edge for Windows.

## License

[MIT](LICENSE)
