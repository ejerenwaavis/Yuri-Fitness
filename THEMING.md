# Theming Guide

The design system for this application is entirely controlled by a single configuration file. 
You do not need to modify Tailwind classes or React components to re-skin the app.

## The Token File

All theme values are stored in:
`packages/shared/theme/theme.config.json`

### Colors
- `primary`: The main accent color (e.g. vivid green `#7CFF3D`).
- `primaryGlow`: A translucent version of the primary color for shadows (e.g. `rgba(124, 255, 61, 0.4)`).
- `secondaryAccent`: A contrasting color for warnings or secondary data visualization.
- `background`: The deepest background color of the app.
- `surface`: Elevated cards and bottom navigation bars.
- `surfaceElevated`: Borders, inputs, and higher-elevation UI elements.

### Updating the Theme

1. Open `packages/shared/theme/theme.config.json`.
2. Change any hex or rgba values.
3. Save the file. The Vite dev server will automatically hot-reload the UI with the new theme because the `tailwind.config.js` in the web app reads directly from this JSON file.

### Example: White-labeling to a "Midnight Blue" theme
```json
{
  "colors": {
    "primary": "#3B82F6",
    "primaryGlow": "rgba(59, 130, 246, 0.4)",
    "secondaryAccent": "#F59E0B",
    "background": "#0F172A",
    "surface": "#1E293B",
    "surfaceElevated": "#334155",
    "textPrimary": "#F8FAFC",
    "textMuted": "#94A3B8"
  }
}
```
