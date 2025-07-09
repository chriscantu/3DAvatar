# SuperClaude Commands Quick Reference

## Usage
```bash
# Using the script directly
./claude-commands.sh @command-name [args]

# Using npm alias
npm run claude @command-name [args]
```

## Development Workflow

| Command | Description | Example |
|---------|-------------|---------|
| `@start-session [topic]` | Create new development session | `@start-session avatar-improvements` |
| `@commit-changes [type] [desc]` | Commit with structured message | `@commit-changes feat "add voice recognition"` |
| `@run-tests [type]` | Run tests | `@run-tests coverage` |
| `@dev-start` | Start development environment | `@dev-start` |
| `@build-prod` | Build for production | `@build-prod` |

## Code Quality

| Command | Description | Example |
|---------|-------------|---------|
| `@lint-fix` | Fix linting issues | `@lint-fix` |
| `@type-check` | Run TypeScript checking | `@type-check` |
| `@format-code` | Format code with prettier | `@format-code` |

## Project Analysis

| Command | Description | Example |
|---------|-------------|---------|
| `@analyze-tests` | Show test status | `@analyze-tests` |
| `@analyze-architecture` | Show project architecture | `@analyze-architecture` |
| `@analyze-performance` | Show performance metrics | `@analyze-performance` |

## File Management

| Command | Description | Example |
|---------|-------------|---------|
| `@create-component [name]` | Create React component | `@create-component VoiceControls` |
| `@create-service [name]` | Create service class | `@create-service AudioProcessor` |
| `@create-hook [name]` | Create React hook | `@create-hook VoiceRecognition` |

## Deployment

| Command | Description | Example |
|---------|-------------|---------|
| `@deploy-staging` | Deploy to staging | `@deploy-staging` |
| `@deploy-production` | Deploy to production | `@deploy-production` |
| `@check-deployment [url]` | Check deployment health | `@check-deployment https://my-app.vercel.app` |

## Emergency

| Command | Description | Example |
|---------|-------------|---------|
| `@rollback [commit-hash]` | Rollback to specific commit | `@rollback abc123` |
| `@help` | Show help message | `@help` |

## Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `style`: Formatting changes
- `docs`: Documentation updates
- `chore`: Maintenance tasks
- `test`: Test-related changes

## Test Types

- `all`: Run all tests (default)
- `watch`: Run tests in watch mode
- `coverage`: Run tests with coverage
- `e2e`: Run end-to-end tests

## Examples

```bash
# Start a new session for avatar improvements
./claude-commands.sh @start-session avatar-improvements

# Create a new component
./claude-commands.sh @create-component VoiceControls

# Run tests with coverage
./claude-commands.sh @run-tests coverage

# Commit changes
./claude-commands.sh @commit-changes feat "add voice recognition support"

# Deploy to staging
./claude-commands.sh @deploy-staging

# Using npm alias
npm run claude @analyze-tests
npm run claude @dev-start
```

## Integration with Cursor

These commands are designed to work seamlessly with Cursor and this Claude agent:

1. **Session Management**: Automatically creates git branches for tracking work
2. **Code Quality**: Integrates with existing linting and formatting tools
3. **Testing**: Provides easy access to all test types
4. **File Generation**: Creates components, services, and hooks with proper structure
5. **Deployment**: Simplifies deployment workflows

## Project-Specific Features

- **3D Avatar Development**: Commands understand Three.js patterns
- **Chat Interface**: Supports React component patterns
- **Text-to-Speech**: Includes TTS service templates
- **Monorepo Structure**: Works with frontend/backend separation
- **Co-located Tests**: Generates tests alongside source files

## Configuration

The commands read from `CLAUDE.md` for project-specific settings and standards. This ensures consistency across all generated code and follows the established patterns in your 3DAvatar project. 