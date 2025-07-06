#!/bin/bash

# Plan Synchronization Script
# Automatically syncs plan files with TODO.md and manages archiving

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TODO_FILE="$PROJECT_ROOT/TODO.md"
PLANS_DIR="$PROJECT_ROOT/plans"
COMPLETED_DIR="$PROJECT_ROOT/plans/completed"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

show_help() {
    echo "Plan Synchronization Tool"
    echo ""
    echo "Usage: $0 <command> [arguments]"
    echo ""
    echo "Commands:"
    echo "  auto-archive              Archive all completed plans"
    echo "  sync-status <plan>        Sync plan status between files"
    echo "  update-todo               Regenerate TODO.md from plan files"
    echo "  check-consistency         Check and report inconsistencies"
    echo ""
    echo "Examples:"
    echo "  $0 auto-archive"
    echo "  $0 sync-status search-optimization"
    echo "  $0 update-todo"
}

auto_archive() {
    echo -e "${BLUE}🔄 Auto-archiving completed plans...${NC}"
    
    archived_count=0
    
    # Check active plans for completed status
    for plan_file in "$PLANS_DIR"/*.md; do
        if [[ -f "$plan_file" ]]; then
            filename=$(basename "$plan_file" .md)
            
            # Skip template files
            if [[ "$filename" == *"-template" ]]; then
                continue
            fi
            
            # Check if plan is marked as completed
            if grep -q -E "(Status.*: Completed|Status.*: completed)" "$plan_file"; then
                echo -e "${GREEN}📦 Archiving completed plan: $filename${NC}"
                
                # Ensure completed directory exists
                mkdir -p "$COMPLETED_DIR"
                
                # Move to completed directory
                mv "$plan_file" "$COMPLETED_DIR/"
                
                # Update TODO.md references
                if [[ -f "$TODO_FILE" ]]; then
                    # Update path references in TODO.md
                    sed -i "s|/plans/${filename}.md|/plans/completed/${filename}.md|g" "$TODO_FILE"
                    
                    # Move from Active Plans to Completed Plans section
                    # This is a simplified approach - in practice, you might want more sophisticated parsing
                    echo -e "${BLUE}📝 Updated TODO.md references for $filename${NC}"
                fi
                
                ((archived_count++))
            fi
        fi
    done
    
    if [[ $archived_count -eq 0 ]]; then
        echo -e "${YELLOW}ℹ️  No completed plans found to archive${NC}"
    else
        echo -e "${GREEN}✅ Archived $archived_count plan(s)${NC}"
    fi
}

sync_status() {
    local plan_name="$1"
    
    if [[ -z "$plan_name" ]]; then
        echo -e "${RED}❌ Plan name is required${NC}"
        exit 1
    fi
    
    # Check if plan exists in active or completed directory
    local plan_file=""
    if [[ -f "$PLANS_DIR/${plan_name}.md" ]]; then
        plan_file="$PLANS_DIR/${plan_name}.md"
    elif [[ -f "$COMPLETED_DIR/${plan_name}.md" ]]; then
        plan_file="$COMPLETED_DIR/${plan_name}.md"
    else
        echo -e "${RED}❌ Plan file not found: ${plan_name}.md${NC}"
        exit 1
    fi
    
    # Extract status from plan file
    local plan_status=$(grep -E "(\*\*Status\*\*:|Status.*:)" "$plan_file" | head -1 | sed 's/.*Status.*: *//')
    
    if [[ -z "$plan_status" ]]; then
        echo -e "${RED}❌ Could not extract status from plan file${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}🔄 Syncing status for $plan_name: $plan_status${NC}"
    
    # Update TODO.md with the plan status
    # This is a simplified implementation - you might want more sophisticated parsing
    if grep -q "${plan_name}.md" "$TODO_FILE"; then
        # Update the status line in TODO.md
        sed -i "/- \*\*Status\*\*:.*${plan_name}/s/Status\*\*: .*/Status**: $plan_status/" "$TODO_FILE"
        echo -e "${GREEN}✅ Updated TODO.md status for $plan_name${NC}"
    else
        echo -e "${YELLOW}⚠️  Plan not found in TODO.md: $plan_name${NC}"
    fi
}

check_consistency() {
    echo -e "${BLUE}🔍 Checking plan consistency...${NC}"
    
    # Run the validation script
    "$PROJECT_ROOT/scripts/validate-plans.sh"
}

update_todo() {
    echo -e "${BLUE}🔄 Regenerating TODO.md from plan files...${NC}"
    echo -e "${YELLOW}⚠️  This feature is not yet implemented${NC}"
    echo -e "${BLUE}ℹ️  For now, please update TODO.md manually${NC}"
    
    # This would be a more complex implementation that rebuilds TODO.md
    # from the plan files automatically. For now, we'll keep manual updates.
}

# Main command dispatcher
case "${1:-}" in
    "auto-archive")
        auto_archive
        ;;
    "sync-status")
        sync_status "$2"
        ;;
    "update-todo")
        update_todo
        ;;
    "check-consistency")
        check_consistency
        ;;
    "help"|"-h"|"--help"|"")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac