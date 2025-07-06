# File Upload Reset Bug

When the user clicks the Reset button, the file input wouldn't trigger onChange if the same file was selected again.

## Plan Metadata
- **Status**: Completed
- **Priority**: High
- **Created**: 2025-07-06
- **Last Updated**: 2025-07-06
- **Assignee**: @opencode
- **Type**: Bug Fix

## Overview
1. Investigate cause of file input not triggering onChange after reset.
2. Discovered we need to clear or reinitialize the file input to allow repeated selections.
3. Implement fix by resetting the value on file change to ensure onChange fires again.

## Implementation
- Edited FileUpload.jsx to clear input value on each file selection.

## Resolution
- Issue resolved by resetting input's value, allowing repeated file selections after pressing Reset.

## Next Steps
- None, completed.
