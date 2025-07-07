#!/bin/bash

# Plan Validation Script
# Validates consistency between TODO.md and plan files

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TODO_FILE="$PROJECT_ROOT/TODO.md"
PLANS_DIR="$PROJECT_ROOT/plans"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Validating planning system consistency..."

# Check if required files exist
if [[ ! -f "$TODO_FILE" ]]; then
    echo -e "${RED}❌ TODO.md not found${NC}"
    exit 1
fi

if [[ ! -d "$PLANS_DIR" ]]; then
    echo -e "${RED}❌ /plans directory not found${NC}"
    exit 1
fi

# Extract plan references from TODO.md
echo "📋 Checking TODO.md plan references..."
plan_refs=$(grep -o '`/plans/[^`]*\.md`' "$TODO_FILE" | sed 's/`//g' | sed 's|^/plans/||')

validation_errors=0

# Validate each plan reference
for plan_file in $plan_refs; do
    plan_path="$PLANS_DIR/$plan_file"
    
    if [[ ! -f "$plan_path" ]]; then
        echo -e "${RED}❌ Referenced plan file not found: $plan_file${NC}"
        ((validation_errors++))
        continue
    fi
    
    echo "✅ Plan file exists: $plan_file"
    
    # Determine expected status based on plan location and TODO.md section
    if [[ "$plan_file" == completed/* ]]; then
        # For completed plans, status is implicit from section location
        expected_status="Completed"
        
        # Check if plan is actually in Completed Plans section
        if grep -A 1000 "## Completed Plans" "$TODO_FILE" | grep -B 1000 "^## " | tail -n +2 | head -n -1 | grep -q "$plan_file"; then
            todo_status="Completed"
        else
            echo -e "${YELLOW}⚠️  Completed plan not in Completed Plans section: $plan_file${NC}"
            ((validation_errors++))
            continue
        fi
    else
        # For active plans, extract explicit status
        todo_status=$(grep -A 10 "$plan_file" "$TODO_FILE" | grep "Status" | head -1 | sed 's/.*Status.*: *//' | sed 's/ (.*//')
        expected_status="$todo_status"
    fi
    
    # Extract status from plan file (handle multiple formats)
    plan_status=$(grep -E "(\\*\\*Status\\*\\*:|Status.*:)" "$plan_path" | head -1 | sed 's/.*Status.*: *//')
    
    if [[ -n "$expected_status" && -n "$plan_status" ]]; then
        if [[ "$expected_status" != "$plan_status" ]]; then
            echo -e "${YELLOW}⚠️  Status mismatch for $plan_file:${NC}"
            echo -e "   Expected: '$expected_status'"
            echo -e "   Plan file: '$plan_status'"
            ((validation_errors++))
        else
            echo -e "${GREEN}✅ Status consistent: $expected_status${NC}"
        fi
    fi
    
    # Check required fields in plan file (handle multiple formats)
    # Only validate required fields for active plans (not completed ones)
    if [[ "$plan_file" != completed/* ]]; then
        required_fields=("Status" "Assignee" "Type")
        for field in "${required_fields[@]}"; do
            if ! grep -q -E "(\\*\\*$field\\*\\*:|$field.*:)" "$plan_path"; then
                echo -e "${RED}❌ Missing required field '$field' in $plan_file${NC}"
                ((validation_errors++))
            fi
        done
    fi
done

# Check for orphaned plan files
echo ""
echo "🔍 Checking for orphaned plan files..."
for plan_file in "$PLANS_DIR"/*.md; do
    if [[ -f "$plan_file" ]]; then
        filename=$(basename "$plan_file")
        # Skip template files
        if [[ "$filename" == *"-template.md" ]]; then
            continue
        fi
        if ! grep -q "$filename" "$TODO_FILE"; then
            echo -e "${YELLOW}⚠️  Plan file not referenced in TODO.md: $filename${NC}"
            ((validation_errors++))
        fi
    fi
done

# Check for orphaned completed plans
echo ""
echo "🔍 Checking completed plans directory..."
if [[ -d "$PLANS_DIR/completed" ]]; then
    for plan_file in "$PLANS_DIR/completed"/*.md; do
        if [[ -f "$plan_file" ]]; then
            filename=$(basename "$plan_file")
            if ! grep -q "completed/$filename" "$TODO_FILE"; then
                echo -e "${YELLOW}⚠️  Completed plan file not referenced in TODO.md: completed/$filename${NC}"
                ((validation_errors++))
            fi
        fi
    done
fi

# Summary
echo ""
if [[ $validation_errors -eq 0 ]]; then
    echo -e "${GREEN}🎉 All validations passed! Planning system is consistent.${NC}"
    exit 0
else
    echo -e "${RED}❌ Found $validation_errors validation error(s). Please fix before proceeding.${NC}"
    exit 1
fi