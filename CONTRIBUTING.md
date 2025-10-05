### Contributing to TrekMate AI

Thanks for your interest in improving TrekMate AI! I built this to learn and to help others plan safer treks. PRs are welcome.

#### Setup
- Fork and clone the repo
- `npm install`
- Copy `example.env` to `.env` and add `GROQ_API_KEY`
- `npm run dev`

#### Branching and commits
- Create feature branches from `main`: `feat/voice-vad`, `fix/geocode-ja`, etc.
- Keep commits focused; use imperative messages: `add ja-JP toggle in ChatInput`

#### Code style
- TypeScript, no `any` if avoidable
- Early returns, minimal nesting
- Avoid unnecessary try/catch
- Keep comments for non-obvious intent only

#### Testing changes
- Ensure voice input still works in Chrome
- Check weather and AI flows for both EN and JA

#### Pull requests
- Describe the change, screenshots if UI-related
- Link any related issues
- Note breaking changes if any

Thank you for contributing!


