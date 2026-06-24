# Mobile app — Hebrew RTL

The product UI is Hebrew (right-to-left), aligned with the web (`dir="rtl"`).

## Bootstrap

- `src/bootstrap/rtl.js` runs at app start (`App.js`) and enables `I18nManager.forceRTL(true)`.
- After the first install, reload the app once if layout looks mirrored wrong.

## Layout helpers

Use `src/utils/layout.js` instead of hard-coding LTR patterns:

| Need | Use | Avoid when RTL is on |
|------|-----|---------------------|
| Horizontal row (icon + text) | `row` | `flexDirection: "row-reverse"` |
| Text / titles | `textStart` | `textAlign: "left"` |
| Align control to the right | `selfStart` | `alignSelf: "flex-end"` |
| Screen / scroll content | `rtlView` (`direction: "rtl"`) | — |
| URLs / raw LTR strings | `textLtr` | — |

`ScreenWithAccessibility` already sets `direction: "rtl"` on screens.

## New screens

- Wrap scroll/content with `rtlView`.
- Import `row`, `textStart`, `selfStart` from `../utils/layout`.
- Keep `textAlign: "right"` and `writingDirection: "rtl"` on Hebrew `Text` / `TextInput` where layout helpers are not used.
