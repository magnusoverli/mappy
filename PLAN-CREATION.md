# Plan Creation Documentation

## Overview
This document outlines the process for creating development plans in the Mappy project. Plans help organize and track significant features, optimizations, and architectural changes.

## When to Create Plans
Create plans for:
- **Significant features** (>2 hours of work)
- **Performance optimizations** 
- **Architectural changes**
- **Bug fixes** that require multiple steps or affect multiple components
- **UI/UX improvements** that involve multiple components

## Plan Structure
All plans should be created in the `/plans` folder and follow this structure:

### Required Sections
1. **Current State Analysis** - What exists now and what problems need solving
2. **Proposed Solutions** - Detailed technical approach with code examples
3. **Success Criteria** - How to measure completion

### File Naming Convention
- Use kebab-case: `search-optimization.md`, `ui-redesign.md`
- Be descriptive but concise
- Include the type of work: `feature-`, `bugfix-`, `optimization-`

## Plan Templates
Use the templates in `/plans/templates/`:
- `feature-template.md` - For new features
- `bugfix-template.md` - For bug fixes
- `plan-template.md` - General purpose template

## Plan Management Workflow

### 1. Create Plan
```bash
./scripts/plan-tools.sh create-plan <name> [type]
```

### 2. Update TODO.md
Add entry to TODO.md with:
- Plan name and file reference
- Priority level (High/Medium/Low)
- Current status (Not Started/In Progress/Completed)
- Brief description (1-2 lines)

### 3. Implementation Tracking
- Update plan status in both the plan file and TODO.md
- Reference plan files in commit messages
- Break down large plans into smaller tasks

### 4. Completion
- Mark as completed in TODO.md
- Archive to `/plans/completed/` folder using:
```bash
./scripts/plan-tools.sh archive-plan <name>
```

## Best Practices
- **Be specific**: Include code examples and technical details
- **Be specific**: Include code examples and technical details
- **Update regularly**: Keep status current in both plan file and TODO.md
- **Reference in commits**: Link implementation commits to plan files
- **Review weekly**: Reassess priorities and relevance

## Tools Available
- `./scripts/plan-tools.sh` - Plan management utilities
- `./scripts/validate-plans.sh` - Validate plan format and consistency
- Templates in `/plans/templates/` - Starting points for new plans