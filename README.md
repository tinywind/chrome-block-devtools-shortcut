# Chrome Block DevTools Shortcut

A Chrome port intended to block `Ctrl+Shift+C` from opening DevTools while
preserving the keystroke for page handlers, including web terminal copy handlers.

## Status

This Chrome port is untested in Google Chrome. The Edge variant was verified
on Microsoft Edge for Windows. The two variants use identical content scripts,
but Chrome behavior remains unverified. All Chrome behavior below is expected
behavior until a Chrome version and platform have been checked.

## Purpose

Web terminals such as xterm.js, ttyd and code-server commonly use `Ctrl+Shift+C`
for copying selected terminal text. The browser also assigns that shortcut to
DevTools. This extension handles that single accelerator while leaving `F12`,
`Ctrl+Shift+I` and the Inspect context-menu action available.

## Installation

This extension is loaded manually in developer mode and is not published in a
browser extension store.

1. Clone or download this repository and extract it if necessary.
2. Open `chrome://extensions/`.
3. Enable Developer mode.
4. Choose Load unpacked and select the directory containing `manifest.json`.
5. Reload open web pages before using the shortcut.

If another shortcut-blocking extension or policy is active, check it when
troubleshooting. This extension cannot restore an event that another handler
has already consumed. Disable conflicting handlers and retry on a supported page.

## Usage

There is no options page, toolbar UI or background process.

| Action | Expected behavior on supported pages |
| --- | --- |
| `Ctrl+Shift+C` with regular page text selected | Copy the selection without opening DevTools. |
| `Ctrl+Shift+C` with text selected in a web terminal | Let the terminal handle copy without opening DevTools. |
| `Ctrl+Shift+C` without a selection | Suppress the DevTools shortcut; no text is selected to copy. |
| `F12` or `Ctrl+Shift+I` | Open DevTools normally. |
| Right-click and choose Inspect | Open DevTools normally. |

Copying still depends on the page's selection and copy handlers and the browser's
clipboard rules. Try both an ordinary text selection and a terminal selection
when checking a new browser or terminal version.

To uninstall, remove the extension from `chrome://extensions/`. It does not
make registry or filesystem changes outside its own extension directory.

## How it works

The Manifest V3 content script matches `<all_urls>` and runs at `document_start`
on matching pages and frames. It registers a capture-phase `keydown` listener. When the key is
`Ctrl+Shift+C` without Alt or Meta, the listener:

1. Calls `event.preventDefault()` to cancel the browser's default action.
2. Attempts `document.execCommand('copy')`, allowing document copy handlers to
   supply a selection.
3. Leaves event propagation intact so page handlers can receive the keystroke.

On supported pages, this is expected to prevent the DevTools accelerator while
letting the page receive the keystroke and attempt selection-based copying.

## Customization

Edit [`content.js`](content.js) directly. To select `Ctrl+Shift+I` instead, change
`event.code === 'KeyC'` to `event.code === 'KeyI'` while keeping the modifier checks.

To select both shortcuts, replace that key-code comparison with:

```javascript
['KeyC', 'KeyI'].includes(event.code)
```

To suppress the accelerator without synthesizing a copy event, remove the
`document.execCommand('copy')` call. These edits change the documented behavior;
check the resulting shortcut on the intended browser and page.

After editing, reload the extension from `chrome://extensions/`, then refresh
open web pages.

## Limitations

Content scripts cannot run on browser-internal or restricted store pages,
including:

- `chrome://*` and settings pages
- The new-tab page
- The Chrome Web Store

The extension does not intercept `Ctrl+Shift+C` on those pages. If interception
there is required, use an operating-system shortcut tool, such as AutoHotkey or
PowerToys Keyboard Manager on Windows or Hammerspoon on macOS.

## Files

| File | Purpose |
| --- | --- |
| `manifest.json` | Manifest V3 declaration for the content script and icons. |
| `content.js` | Capture-phase shortcut listener. |
| `PRIVACY.md` | Privacy information. |
| `LICENSE` | MIT license. |

## Background

- [Chromium issue 33056](https://groups.google.com/a/chromium.org/g/chromium-bugs/c/Ntc1byZXHfU): background on reserved Ctrl shortcuts.
- [Chromium issue 174309](https://bugs.chromium.org/p/chromium/issues/detail?id=174309): DevTools shortcut customization discussion.
- [xterm.js issue 292](https://github.com/xtermjs/xterm.js/issues/292): terminal copy-shortcut discussion.

## Related

- [edge-block-devtools-shortcut](https://github.com/tinywind/edge-block-devtools-shortcut): the Microsoft Edge variant, verified on Edge for Windows.

## License

[MIT](LICENSE).
