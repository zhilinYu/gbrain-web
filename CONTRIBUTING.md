# Contributing to GBrain Web

Thank you for your interest in contributing to GBrain Web! This guide will help you get started.

## Code of Conduct

Please read our [Code of Conduct](./CODE_OF_CONDUCT.md) before participating in our community.

## How to Contribute

### Reporting Bugs

- Check [existing issues](https://github.com/zhilinYu/gbrain-web/issues) to avoid duplicates
- Use the **Bug Report** issue template
- Include: steps to reproduce, expected vs actual behavior, screenshots if applicable
- Specify your environment: OS, Node.js version, browser

### Suggesting Features

- Open a **Feature Request** issue
- Describe the motivation and use case
- Include mockups or examples if possible

### Pull Requests

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feature/your-feature-name`
3. **Develop**:
   - Follow the existing code style (ESLint + Prettier)
   - Write meaningful commit messages (`feat:`, `fix:`, `docs:`, `chore:`)
   - Add/Update tests if applicable
4. **Lint**: `npm run lint`
5. **Build**: `npm run build` (must pass with no errors)
6. **Push** to your fork and open a **Pull Request**
7. Link the related issue in the PR description

### Branch Naming

| Type | Format |
|------|--------|
| Feature | `feature/short-description` |
| Bug fix | `fix/short-description` |
| Docs | `docs/short-description` |
| Chore | `chore/short-description` |

## Development Setup

```bash
# 1. Prerequisites
# - GBrain installed and running (https://github.com/zhilinYu/gbrain)
# - Node.js 20+

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/gbrain-web.git
cd gbrain-web

# 3. Install dependencies
npm install

# 4. Configure environment
cp .env.example .env.local
# Edit .env.local and set your GBrain URL + Token

# 5. Start GBrain MCP service (in another terminal)
gbrain serve --http --port 8787
gbrain auth create "gbrain-web-dev" --scopes read

# 6. Start dev server
npm run dev
```

Open http://localhost:3000 → go to **Settings** → paste your `gbrain_xxx` token.

## Project Structure (Quick Reference)

```
src/
├── app/            # Next.js App Router pages
├── components/     # React UI components
├── lib/            # MCP client, Store, Utils
└── types/          # TypeScript definitions
```

## Coding Standards

- **TypeScript**: Strict mode enabled — no `any` types in new code
- **Components**: Use functional components + hooks
- **Styling**: Tailwind CSS utilities (no custom CSS unless absolutely necessary)
- **State**: Zustand stores in `src/lib/store.ts`
- **Commits**: Use [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat:` new feature
  - `fix:` bug fix
  - `docs:` documentation only
  - `chore:` tooling/config changes

## Community

- Questions? Open a [Discussion](https://github.com/zhilinYu/gbrain-web/discussions)
- Bug? Open an [Issue](https://github.com/zhilinYu/gbrain-web/issues/new?template=bug_report.md)

---

 Again, thank you for contributing! 🚀
