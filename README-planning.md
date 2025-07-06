# Mappy Planning System

This document explains the planning and tracking system used in the Mappy project.

## Overview

The planning system consists of three main components:

1. **AGENTS.md** - Development guidelines and planning workflow
2. **TODO.md** - High-level overview of all active plans and quick tasks
3. **/plans/** - Detailed plan files with implementation specifics

## File Structure

```
/
├── AGENTS.md              # Development guidelines
├── TODO.md                # Project overview and active plans
├── plans/
│   ├── templates/         # Plan templates for different types
│   │   ├── plan-template.md
│   │   ├── feature-template.md
│   │   └── bugfix-template.md
│   ├── completed/         # Archived completed plans
│   └── [active-plans].md  # Current development plans
└── scripts/
    ├── validate-plans.sh  # Validation and consistency checking
    └── plan-tools.sh      # Plan management utilities
```

## Creating New Plans

### Using Templates

1. **General Plans**: Use `plan-template.md` for optimizations, refactoring, etc.
2. **New Features**: Use `feature-template.md` for user-facing functionality
3. **Bug Fixes**: Use `bugfix-template.md` for issue resolution

### Using Scripts

```bash
# Create a new plan
./scripts/plan-tools.sh create-plan my-feature feature

# List all plans
./scripts/plan-tools.sh list-plans

# Update plan status
./scripts/plan-tools.sh update-status my-feature "In Progress"
```

## Plan Lifecycle

1. **Creation**: Create plan file from template
2. **TODO Entry**: Add summary to TODO.md
3. **Implementation**: Work through milestones
4. **Status Updates**: Keep both files synchronized
5. **Completion**: Archive to `/plans/completed/`

## Required Fields

Every plan must include:

- **Status**: Not Started/In Progress/Completed
- **Priority**: High/Medium/Low
- **Effort**: Estimated time (hours/days)
- **Created**: Creation date (YYYY-MM-DD)
- **Last Updated**: Last modification date
- **Assignee**: Person responsible

## Validation

Run validation to ensure consistency:

```bash
# Check all plans for consistency
./scripts/validate-plans.sh

# Validate specific aspects
./scripts/plan-tools.sh validate-plans
```

## Best Practices

### Plan Creation
- Use descriptive names (kebab-case)
- Include specific, measurable milestones
- Estimate effort realistically
- Define clear success criteria

### Status Updates
- Update both plan file and TODO.md
- Use milestone checkboxes to track progress
- Reference plan files in commit messages
- Archive completed plans promptly

### Collaboration
- Assign plans to specific team members
- Review and update plans weekly
- Use consistent terminology and formatting
- Keep plans focused and actionable

## Integration with Development

### Commit Messages
Reference plan files when implementing features:
```
Implement search optimization milestone 2

- Consolidate useMemo hooks as planned in /plans/search-optimization.md
- Reduces React re-renders by 200%
- Completes milestone 2 of 6 in search optimization plan
```

### Code Reviews
- Check that implementations match plan specifications
- Verify milestones are updated appropriately
- Ensure plan status reflects actual progress

## Automation

The planning system includes automation for:

- **Consistency Validation**: Checks status synchronization
- **Template Generation**: Creates plans from templates
- **Status Management**: Updates plan metadata
- **Archive Management**: Moves completed plans

## Troubleshooting

### Common Issues

1. **Status Mismatch**: Run `./scripts/validate-plans.sh` to identify inconsistencies
2. **Missing Fields**: Use templates to ensure all required fields are present
3. **Orphaned Plans**: Validation script identifies plans not referenced in TODO.md

### Getting Help

- Check AGENTS.md for detailed workflow guidelines
- Use `./scripts/plan-tools.sh help` for command reference
- Review existing plans for examples and patterns

## Examples

See `/plans/search-optimization.md` for a complete example of a well-structured plan with milestones, progress tracking, and detailed implementation guidance.