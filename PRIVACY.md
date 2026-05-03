# Privacy Policy

**Last updated:** 2026-05-03

This extension does not collect, store, transmit, share, or sell any user data of any kind.

## What this extension does

The extension installs a single content script that listens for the `Ctrl+Shift+C` keystroke on every page you visit. When that exact keystroke is pressed, the extension calls `event.preventDefault()` to suppress the browser-level "Open DevTools" action and triggers a standard `copy` command so that page-level copy handlers (e.g., web terminal emulators) can complete their copy operation.

## What data is collected

**None.** The extension does not:

- Read, parse, or transmit page content.
- Read, parse, or transmit URLs, page titles, or browsing history.
- Read, parse, or transmit user input, form data, selections, or clipboard contents.
- Use cookies, local storage, IndexedDB, or any other persistence layer.
- Make any network requests.
- Communicate with any first-party or third-party server.
- Use analytics, telemetry, crash reporting, or remote logging.
- Use any tracking, advertising, or fingerprinting technology.

## What permissions are requested

The manifest declares only `<all_urls>` as the host pattern for the content script. This is the minimum scope required to register a `keydown` listener on every page. No `activeTab`, `tabs`, `storage`, `webNavigation`, `webRequest`, `cookies`, `host_permissions`, or other sensitive permissions are requested.

## Source code

The full source is published at:

- Edge variant: https://github.com/tinywind/edge-block-devtools-shortcut
- Chrome variant: https://github.com/tinywind/chrome-block-devtools-shortcut

The source is small (the active logic is approximately 16 lines of JavaScript in `content.js`) and you are encouraged to read it directly to verify the claims above.

## Contact

For questions or concerns, open an issue on the GitHub repository linked above.
