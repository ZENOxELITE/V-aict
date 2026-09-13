# V-AICT / NeuraChat

## Overview

**V-AICT is a Next.js AI assistant web application.** It provides a chat interface plus a collection of focused AI tools for summarizing text, generating stories, explaining code, creating quizzes, writing emails, and preparing debates.

The application uses server-side Next.js API routes to call NVIDIA's OpenAI-compatible chat-completions endpoint with DeepSeek V4 Flash. The browser stores recent chat messages and the selected model in `localStorage`; there is no database, authentication system, user account system, or persistent server-side session in the current implementation.

The product name shown in the interface is **NeuraChat**. The repository folder is **V-aict**, while the package name is still the generic `my-project`.

## Project Type

Type: full-stack AI web application with a Next.js frontend and server API routes.

It is not a static website, mobile app, CLI tool, browser extension, or traditional REST backend. It is a browser-based AI workspace with:

- a conversational AI page at `/`
- an AI tools dashboard at `/tools`
- server-side API routes under `/api/*`
- client-side local persistence for chat state and model selection

## Technology Stack

The project uses:

- Next.js `16.2.4` with the App Router
- React `19`
- TypeScript `5.7.3`
- Tailwind CSS `4`
- Radix UI primitives and shadcn-style components
- Lucide React icons
- React Hook Form and Zod-related dependencies
- Recharts, Embla Carousel, Sonner, Vaul, and other UI utilities included in the package manifest
- `@vercel/analytics` in production
- npm and pnpm lockfiles are both present

Build and development configuration is found in:

- `package.json`
- `next.config.mjs`
- `tsconfig.json`
- `postcss.config.mjs`
- `components.json`
- `app/globals.css`

## Main Features

### AI chat

The home page provides a NeuraChat conversation interface with:

- selectable AI models
- welcome screen
- prompt suggestions
- prompt templates
- message copy and code-block copy
- syntax-highlighted fenced code
- edit and resend
- regenerate response
- local message reactions
- token tracking and approximate cost display
- plain-text chat export
- responsive desktop and mobile sidebar
- keyboard shortcuts

### AI tools dashboard

The `/tools` page provides six tools:

1. **Summarizer** — concise, detailed, bullet-point, or plain-English summaries
2. **Story Generator** — genre, tone, length, protagonist, setting, and story continuation
3. **Code Explainer** — line-by-line, overview, debugging, or complexity analysis
4. **Quiz Generator** — multiple choice, true/false, or short-answer quizzes
5. **Email Writer** — professional, formal, friendly, assertive, or apologetic emails
6. **Debate Generator** — arguments for both sides, in favor, or against a topic

Each tool sends a request to its own Next.js API route and displays the latest result in the browser. Tool results are not persisted after a page reload.

## Routes and Entry Points

### Pages

- `app/page.tsx` — main chat interface
- `app/tools/page.tsx` — AI tools dashboard
- `app/layout.tsx` — global fonts, metadata, dark theme, and Vercel Analytics

### API routes

- `app/api/chat/route.ts` — conversational chat
- `app/api/summarize/route.ts` — text summarization
- `app/api/story/route.ts` — story generation
- `app/api/explain-code/route.ts` — code analysis and explanation
- `app/api/quiz/route.ts` — quiz generation
- `app/api/email/route.ts` — email writing
- `app/api/debate/route.ts` — debate generation
- `app/api/clear/route.ts` — currently returns success but does not clear server history

### Shared application areas

- `components/chat/` — chat sidebar, header, messages, input, and typing indicator
- `components/tools/` — six AI tool interfaces and tool navigation
- `components/ui/` — reusable UI primitives and result display components
- `hooks/` — chat state, toasts, mobile detection, and toast helpers
- `lib/models.ts` — enabled model list and default model
- `lib/storage.ts` — browser-local chat/model storage
- `types/index.ts` — request, response, message, tool, and model types
- `public/` — icons and placeholder assets
- `styles/globals.css` — older stylesheet that is not imported by the active layout

## AI Provider and Current Configuration

All active AI API routes currently call:

```text
https://integrate.api.nvidia.com/v1/chat/completions
```

The server-side environment variable required by every AI route is:

```text
NVIDIA_API_KEY=your_nvidia_api_key
```

Create `.env.local` in the project root, copy the variable from `.env.example`,
replace the placeholder with an NVIDIA API key, and restart `npm run dev`. Never
expose this key through a `NEXT_PUBLIC_` variable or commit `.env.local`.

The chat client also supports this optional variable:

```text
NEXT_PUBLIC_API_URL=https://your-public-api-base-url
```

When `NEXT_PUBLIC_API_URL` is not set, the chat client uses the same Next.js origin. The individual tools call their local `/api/...` routes directly.

Keep `NVIDIA_API_KEY` server-side. Do not prefix it with `NEXT_PUBLIC_`, and do not put it in client components.

## Enabled AI Models

The selectable models are centralized in `lib/models.ts`:

| Model ID | Display name | Tag |
|---|---|---|
| `deepseek-ai/deepseek-v4-flash-0731` | DeepSeek V4 Flash | Default |

The first entry in `MODELS` is the default model:

```ts
export const DEFAULT_MODEL = MODELS[0];
```

## How to Change the AI Model

### Add or remove a model from the selector

1. Open `lib/models.ts`.
2. Add an entry to the `MODELS` array using the exact model ID accepted by your provider.
3. Give it a display name and a short tag.
4. Update `types/index.ts` and add the ID to `ModelId` if TypeScript does not already accept it.
5. Put the preferred default first, or change `DEFAULT_MODEL` explicitly.

Example:

```ts
export const MODELS: ModelOption[] = [
  {
    id: 'your-provider/model-id',
    name: 'My Model',
    tag: 'Custom',
  },
  { id: 'deepseek-ai/deepseek-v4-flash-0731', name: 'DeepSeek V4 Flash', tag: 'Default' },
];
```

The selected model is saved in browser storage under `neurachat_model`. A user who already opened the app may continue using their old saved model until they select a new one or clear that browser storage.

### Change only the fallback model

Each API route has its own fallback in an expression like:

```ts
model: model || 'deepseek-ai/deepseek-v4-flash-0731'
```

Search the `app/api` directory for `model ||` and change every fallback if you want consistent behavior across all tools.

The chat route uses `deepseek-ai/deepseek-v4-flash-0731` when no model is supplied. The normal UI sends the selected model explicitly.

### Change model behavior per tool

Every route accepts a client-provided `model` field. The route passes that value directly to the provider. To force one tool to always use a particular model, replace the request value in that route instead of using the client value:

```ts
model: 'your-provider/model-id'
```

This is useful when you want a fast model for summaries, a larger model for code explanations, or a creative model for stories. Remember to update the UI description if the change affects user expectations.

## How to Replace NVIDIA with Another AI Provider

All seven AI routes use the same general request pattern, so provider replacement is possible without rebuilding the UI. The current code is not using a shared provider client; the fetch request is repeated in each route.

### Provider migration checklist

1. Choose the replacement provider and confirm that it supports the models you need.
2. Add its server-side API key to `.env.local`.
3. Change the endpoint constant in every route under `app/api/`.
4. Update the authorization header format if the provider does not use `Bearer` tokens.
5. Update the request body if the provider does not use OpenAI-compatible `messages`, `model`, `max_tokens`, and `temperature` fields.
6. Update response parsing if the reply is not at `data.choices[0].message.content`.
7. Update token usage parsing if usage fields differ.
8. Replace the model IDs in `lib/models.ts` and `types/index.ts`.
9. Update fallback model values in every route.
10. Test every page tool separately, not only chat.

The current request shape is:

```ts
const response = await fetch(PROVIDER_API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model,
    messages,
    max_tokens,
    temperature,
  }),
});
```

The current response shape is expected to contain:

```ts
{
  choices: [{
    message: { content: '...' }
  }],
  usage: {
    total_tokens: 123
  }
}
```

### Recommended future provider abstraction

For a larger migration, create a shared server-only helper such as `lib/ai.ts` that accepts a normalized request and returns a normalized response. Then each route can call the helper instead of duplicating provider-specific fetch code.

A normalized helper could expose:

```ts
runTextGeneration({
  model,
  messages,
  maxTokens,
  temperature,
})
```

The helper would own:

- provider URL
- API key lookup
- provider headers
- provider-specific request format
- provider-specific response parsing
- error normalization
- token usage parsing

This makes future provider changes safer because the UI and tool routes keep the same contract.

## API Route Contracts

All routes accept `POST` requests with JSON and return JSON. They check for a required primary input and return `400` when it is missing. They return `500` when the API key is missing or the provider request fails.

| Route | Main request fields | Response fields | Current generation settings |
|---|---|---|---|
| `/api/chat` | `message`, `model` | `reply`, `model`, `tokens` | 2,048 max tokens, temperature 0.7 |
| `/api/summarize` | `text`, `style`, `model` | `summary`, `tokens`, `word_count` | 1,024 max tokens, temperature 0.3 |
| `/api/story` | `prompt`, `genre`, `tone`, `length`, optional `protagonist`, `setting`, `continue_story`, `model` | `story`, `tokens` | 700/1,200/2,000 max tokens, temperature 0.8 |
| `/api/explain-code` | `code`, `mode`, optional `language`, `model` | `explanation`, `tokens` | 2,048 max tokens, temperature 0.3 |
| `/api/quiz` | `topic`, `type`, `difficulty`, `count`, `model` | `quiz`, `tokens` | 2,048 max tokens, temperature 0.5 |
| `/api/email` | `intent`, optional `recipient`, `sender`, `tone`, `length`, `context`, `model` | `email`, `tokens` | 1,024 max tokens, temperature 0.5 |
| `/api/debate` | `topic`, `side`, `depth`, `model` | `debate`, `tokens` | 2,048 max tokens, temperature 0.6 |
| `/api/clear` | no body | `success` | Does not currently clear server history |

## How to Change Prompts and AI Behavior

The system and user prompts are located directly inside each API route. Search for `systemPrompt`, `STYLE_PROMPTS`, `MODE_PROMPTS`, `TYPE_PROMPTS`, `LENGTH_GUIDE`, or `DEPTH_POINTS`.

Examples:

- summarizer instructions: `app/api/summarize/route.ts`
- story personality and format: `app/api/story/route.ts`
- code analysis modes: `app/api/explain-code/route.ts`
- quiz formats: `app/api/quiz/route.ts`
- email tone and structure: `app/api/email/route.ts`
- debate structure: `app/api/debate/route.ts`
- chat assistant identity: `app/api/chat/route.ts`

To change an AI tool’s behavior:

1. Edit the system prompt or prompt map in its route.
2. Keep the input fields expected by the client unless you also update the matching tool component.
3. If you add a new option, update both the UI control and the route’s prompt logic.
4. Test short, long, empty, and unusual inputs.

## Chat State and Persistence

`hooks/use-chat-state.ts` controls the main chat flow. It sends messages to `/api/chat`, loads and saves the selected model, tracks tokens, exports text, and manages reactions, editing, and regeneration.

`lib/storage.ts` uses browser `localStorage` keys:

- `neurachat_messages` — latest 30 chat messages
- `neurachat_model` — selected model ID
- `neura-welcome-seen` — welcome screen dismissal flag, handled by the page/sidebar UI

There is no database or server session. Tool results live only in React state and disappear after reload or navigation.

## Important Current Limitations

- Chat conversation history is stored in a module-level server variable capped at 20 entries. It is not separated by user or browser session.
- In a multi-user deployment, users can potentially share conversation context on the same server instance.
- `/api/clear` clears the browser display through the client flow but does not reset the module-level server history.
- The visible loading stop button does not cancel the active request.
- API routes trust client-provided model IDs and do not perform runtime schema validation.
- There is no authentication, rate limiting, request-size enforcement, or per-user quota system.
- `next.config.mjs` sets `typescript.ignoreBuildErrors` to `true`, so production builds can hide TypeScript errors.
- The chat fallback model behavior is inconsistent as described above.
- Approximate token cost shown in the UI is not guaranteed to match provider billing.
- No automated test script is defined in `package.json`.
- `styles/globals.css` is not imported by the active layout and appears to be leftover styling.
- Several generic Radix/shadcn components and hooks are present but may not be used by the active pages.
- There is no `.env.example`, so required environment variables are not distributed as a template.

## Environment Variables

Create a local environment file for development and keep it out of source control:

```env
NVIDIA_API_KEY=your_server_side_nvidia_key
# Optional: use a different public API base for the chat client
NEXT_PUBLIC_API_URL=
```

Do not commit real API keys. The `.gitignore` already excludes `.env` and `.env.local`.

## Run and Build Scripts

The available scripts are defined in `package.json`:

- `npm run dev` — starts the Next.js development server
- `npm run build` — creates a production build
- `npm run start` — starts the production server
- `npm run lint` — runs ESLint

The project also contains both `package-lock.json` and `pnpm-lock.yaml`; use one package manager consistently for a given installation.

## Visual Design

The active layout forces a dark theme and uses:

- `Space Grotesk` for the main sans-serif interface font
- `JetBrains Mono` for code and monospaced content
- black and gray backgrounds
- green, red, and yellow status accents
- custom scrollbar and focus styles
- fade-up, floating-particle, and interaction animations

The active stylesheet is `app/globals.css`. The separate `styles/globals.css` file is not imported by the current layout.

## Security and Deployment Notes

The NVIDIA key is used from server routes, which is the correct general placement for a secret. However, the application should add authentication, rate limiting, input validation, request limits, and user-specific conversation storage before being exposed as a public multi-user service.

The current in-memory chat history is not suitable for reliable production persistence. A database or Redis-backed session store would be needed for isolated, durable conversations.

## Summary

V-AICT is a Next.js-based AI workspace called NeuraChat. It combines a conversational assistant with six AI productivity and creative tools, using DeepSeek V4 Flash through NVIDIA's server-side OpenAI-compatible API. Model options live in `lib/models.ts`, route contracts and model types live in `types/index.ts`, and provider integration is repeated in `app/api/*/route.ts`.

For routine model changes, update `lib/models.ts`, `types/index.ts`, and the route fallbacks. For a provider replacement, update the endpoint, authentication, request body, response parsing, environment variable, model IDs, and every API route, or centralize those concerns in a shared server-side AI helper.

## Related Project Context

The neighboring `Fly wheel TA` folder is a separate Vite + React + TypeScript travel-agency website for FlyWheel PK Tours. It is not imported by or connected to V-AICT. Its presence in the workspace does not affect this application.
