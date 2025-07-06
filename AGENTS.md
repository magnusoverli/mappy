# AGENTS.md - Development Guidelines for Mappy

## Build/Test Commands
- **Client dev**: `cd client && npm run dev` (Vite dev server)
- **Client build**: `cd client && npm run build` (production build)
- **Client lint**: `cd client && npm run lint` (ESLint check)
- **Server start**: `cd server && npm start` (Express server)
- **No test commands configured** - add tests using your preferred framework

## Architecture Overview
Mappy uses an **Agent Pattern** where each agent encapsulates a single responsibility:
- **FileAgent**: File I/O operations, preserving line endings
- **ParserAgent**: INI parsing/serialization with VSM-specific formatting
- **LayersAgent**: Layer CRUD operations with 2-digit zero-padded keys
- **TargetsAgent/SourcesAgent**: Data grouping and offset calculations
- **StorageAgent**: localStorage persistence for session recovery

## Code Style Guidelines

### File Structure & Naming
- Components: PascalCase (e.g., `LayerPanel`, `EntryEditModal`)
- Agent files: PascalCase ending in "Agent" (e.g., `FileAgent.js`)
- Utilities: camelCase (e.g., `entryHelpers.js`, `formatLayerLabel.js`)
- React components use `.jsx`, utilities use `.js`

### Imports & Exports
- ES6 imports/exports in client: `import { Box } from '@mui/material'`
- Named exports for agent functions: `export function openFile()`
- Default exports for React components: `export default function App()`
- Agent modules return structured data with consistent interfaces

### Data Handling Patterns
- **Preserve file integrity**: Maintain original line endings and formatting
- **Structured returns**: Agents return objects with predictable shapes
- **Error handling**: Use try/catch with meaningful error messages
- **State management**: Single source of truth via useMappingEditor hook
- **Validation**: Format-specific rules (2-digit layers, 8-digit hex values)

### VSM File Format Rules
- Layer keys: 2-digit zero-padded (00-99)
- Target/Source keys: `NN.CCCC` format (layer.channel/source)
- Hex values: 8-digit uppercase (00000000-FFFFFFFF)
- Paths: Unix-style, typically ending with `/Matrix`
- Preserve whitespace around `=` signs in INI output

## Development Workflow
- **Always commit when tasks are completed**: Create commits immediately after completing any task or feature
- Use descriptive commit messages that explain the purpose of changes
- Follow conventional commit format when possible