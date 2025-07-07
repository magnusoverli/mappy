# AGENTS.md - Development Guidelines for Mappy

## 🚨 CRITICAL REQUIREMENTS 🚨
**PLAN MANAGEMENT IS MANDATORY** - When completing any planned work:
1. ✅ Update plan status to "Completed" 
2. ✅ Update TODO.md status and move to completed section
3. ✅ Run `./scripts/sync-plans.sh auto-archive`
4. ✅ Run `./scripts/validate-plans.sh`

**NEVER SKIP THESE STEPS** unless explicitly told to ignore them.

## Build/Test Commands
- **Client dev**: `cd client && npm run dev` (Vite dev server)
- **Client build**: `cd client && npm run build` (production build)
- **Client lint**: `cd client && npm run lint` (ESLint check)
- **Server start**: `cd server && npm start` (Express server)
- **Docker restart**: `docker compose down -v && docker compose build && docker compose up -d && docker compose logs -f` (restart container after changes)
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

### **CRITICAL: Plan Management is MANDATORY**
- **NEVER skip plan management steps** unless explicitly told to ignore them
- **ALWAYS follow the Plan Completion Checklist** when finishing any planned work
- **Plan tracking is as important as the code itself** - incomplete tracking creates technical debt

### **Task Completion Process**
1. **Complete the development work** (code, tests, documentation)
2. **MANDATORY: Execute Plan Completion Checklist** (see below)
3. **NEVER commit changes unless explicitly requested**: Only create git commits when the user specifically asks for it
4. **When asked to commit**: Use descriptive commit messages that explain the purpose of changes
5. Follow conventional commit format when possible

### **MANDATORY Plan Completion Checklist**
When completing ANY planned work, you MUST execute ALL of these steps:

**□ Step 1: Update Plan Status**
- Mark plan status as "Completed" in the plan file metadata
- Update "Last Updated" date in plan metadata

**□ Step 2: Update TODO.md**
- Change plan status from "Not Started/In Progress" to "Completed" 
- Update the plan description to use simplified format (remove Priority/Assignee, keep only achievement summary)
- NOTE: Moving between "Active Plans" and "Completed Plans" sections is now AUTOMATIC

**□ Step 3: Archive Plan**
- Run `./scripts/sync-plans.sh auto-archive` to move plan to `/plans/completed/`
- This step AUTOMATICALLY moves completed plans from "Active Plans" to "Completed Plans" section in TODO.md
- This step is AUTOMATIC but must be executed

**□ Step 4: Validate**
- Run `./scripts/validate-plans.sh` to ensure consistency
- Fix any validation errors immediately

**FAILURE TO COMPLETE ALL 4 STEPS IS UNACCEPTABLE** - These steps are not optional.

## Plan Management Guidelines

### **Creating Development Plans**
- **Always create detailed plans** in the `/plans` folder for any significant feature, optimization, or architectural change
- Plan files should be named descriptively: `search-optimization.md`, `ui-redesign.md`, `performance-improvements.md`
- Each plan must include:
  - Current state analysis
  - Proposed solutions with code examples
  - Performance impact estimates
  - Implementation priority/timeline
  - Success criteria

### **TODO Management**
- **Always maintain TODO.md** in the project root with brief summaries of all active plans
- Each plan entry in TODO.md should include:
  - Plan name and file reference
  - Current status (Not Started/In Progress/Completed)
  - Brief description (1-3 lines)

### **Plan Implementation Tracking**
- **Update TODO.md immediately** when:
  - Creating new plans
  - Starting implementation of a plan
  - Completing plan milestones
  - Finishing entire plans
- **Reference plan files** in commit messages when implementing planned features

### **CRITICAL REMINDER: Plan Completion is MANDATORY**
- **EVERY completed plan MUST follow the Plan Completion Checklist** (see Development Workflow)
- **NO EXCEPTIONS** - Plan tracking is not optional
- **If you complete work without updating plans, you have failed the task**

### **Plan Review Process**
- Review and update all active plans weekly
- Reassess priorities based on project needs
- Break down large plans into smaller, actionable tasks
- Ensure all plans remain relevant and up-to-date

### **Plan Synchronization and Consistency**
- **Always run validation** after making plan changes: `./scripts/validate-plans.sh`
- **Auto-archive completed plans**: `./scripts/sync-plans.sh auto-archive`
- **Check consistency regularly**: `./scripts/sync-plans.sh check-consistency`
- **Update both plan file AND TODO.md** when changing status
- **Required metadata format** for all plans:
  ```markdown
  ## Plan Metadata
  - **Status**: [Not Started/In Progress/Completed]
  - **Priority**: [High/Medium/Low]
  - **Created**: [YYYY-MM-DD]
  - **Last Updated**: [YYYY-MM-DD]
  - **Assignee**: @opencode
  - **Type**: [Bug Fix/Feature/Enhancement/etc.]
  ```

### **TODO.md Format Requirements**

**Active Plans Format:**
```markdown
### 🎨 Plan Name (`/plans/plan-name.md`)
- **Priority**: [High/Medium/Low] | **Assignee**: @opencode
- **Status**: [Not Started/In Progress]
- **Description**: Brief description of what needs to be done
- **Goal**: Expected outcome or benefit
```

**Completed Plans Format (Simplified):**
```markdown
### ✅ Plan Name (`/plans/completed/plan-name.md`)
Brief summary of what was accomplished and the benefits achieved. No priority, assignee, or status attributes needed.
```

### **Plan Lifecycle Management**
1. **Create Plan**: Use templates in `/plans/templates/`
2. **Add to TODO.md**: Include in Active Plans section with proper formatting
3. **Update Status**: Modify both plan file and TODO.md simultaneously
4. **Complete Plan**: **MANDATORY** - Follow the Plan Completion Checklist in Development Workflow
5. **Archive Plan**: **MANDATORY** - Run `./scripts/sync-plans.sh auto-archive` to move to `/plans/completed/`
6. **Validate**: **MANDATORY** - Always run `./scripts/validate-plans.sh` after changes

### **ENFORCEMENT: Plan Management Compliance**
- **Plan management steps are NOT suggestions - they are requirements**
- **Completing code without completing plan tracking is an incomplete task**
- **Always prioritize plan management equally with code development**
- **Only skip plan management if explicitly instructed by the user**