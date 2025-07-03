
# Mappy INI Editor

This web app lets you edit NEVION iPath `.ini` mapping files directly in your browser. Open the page, upload an `.ini` file and download the edited version when you're done.

The editor automatically restores the last loaded file and any edits using the browser's Cache Storage. Refreshing the page resumes your previous session.

Upload a new file at any time to start over; the cached session is cleared when a new file is loaded or when the browser cache is emptied.

## Development

The project is based on React + Vite with ESLint configured. The usual Vite commands are available:

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
