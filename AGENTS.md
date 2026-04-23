# AgentMemoryBook

## Cursor Cloud specific instructions

This is a markdown-only book project. There are no services, dependencies, build steps, or tests to run.

- **Structure**: `README.md` (main page with quick comparison table) + `chapters/` directory with 7 chapter files (01–07).
- **No code dependencies**: Pure markdown content. No package.json, no requirements.txt.
- **No services to run**: This is a static documentation project.
- **Editing**: Edit markdown files directly. The README.md contains the top-level comparison table and links to chapters.
- **Adding a new provider**: Add the provider section to `chapters/03_providers.md`, update the comparison table in `README.md`, and update the decision guide in `chapters/06_decision_guide.md`.

## Bilingual (English + Chinese) support

The book is published in two languages with a one-click language switcher in the online version.

- **English source**: `src/` directory, configured by `book.toml`
- **Chinese source**: `src-zh/` directory, configured by `book-zh.toml`
- **Language switcher**: `lang-switcher.js` + `lang-switcher.css` inject an EN/中文 toggle on every page
- **Build**: The GitHub Actions workflow (`deploy.yml`) builds both books — English to `book/` and Chinese to `book/zh/`
- **README files**: `README.md` (English) and `README.zh.md` (Chinese) cross-link to each other
- **When editing content**: If you modify a chapter or provider in `src/`, make the corresponding change in `src-zh/` as well to keep both languages in sync. The directory structures mirror each other exactly.
- **Adding a new provider (bilingual)**: Add the provider to both `src/providers/{name}.md` and `src-zh/providers/{name}.md`, update both `src/SUMMARY.md` and `src-zh/SUMMARY.md`, update both `src/03_providers.md` and `src-zh/03_providers.md`, update both READMEs, and update the decision guide in both languages.
