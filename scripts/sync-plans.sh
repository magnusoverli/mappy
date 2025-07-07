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
    echo "  move-to-completed <plan>  Move plan from Active to Completed section"
    echo "  update-todo               Regenerate TODO.md from plan files"
    echo "  check-consistency         Check and report inconsistencies"
    echo ""
    echo "Examples:"
    echo "  $0 auto-archive"
    echo "  $0 sync-status search-optimization"
    echo "  $0 move-to-completed entry-edit-modal-field-borders"
    echo "  $0 update-todo"
}

move_plan_to_completed() {
    local plan_name="$1"
    local temp_file=$(mktemp)
    local in_active_section=false
    local in_completed_section=false
    local plan_block=""
    local capturing_plan=false
    local plan_found=false
    
    # Read TODO.md line by line and process sections
    while IFS= read -r line; do
        # Check for section headers
        if [[ "$line" == "## Active Plans" ]]; then
            in_active_section=true
            in_completed_section=false
            echo "$line" >> "$temp_file"
            continue
        elif [[ "$line" == "## Completed Plans" ]]; then
            in_active_section=false
            in_completed_section=true
            echo "$line" >> "$temp_file"
            continue
        elif [[ "$line" =~ ^##[[:space:]] ]]; then
            # Other section header - end both sections
            in_active_section=false
            in_completed_section=false
            echo "$line" >> "$temp_file"
            continue
        fi
        
        # If we're in the active section, look for our plan
        if [[ "$in_active_section" == true ]]; then
            # Check if this line starts a plan block that matches our plan name
            if [[ "$line" =~ ^###.*${plan_name} ]]; then
                capturing_plan=true
                plan_found=true
                plan_block="$line"
                continue
            elif [[ "$capturing_plan" == true ]]; then
                # Continue capturing until we hit another plan or section
                if [[ "$line" =~ ^### ]] || [[ "$line" =~ ^## ]] || [[ "$line" =~ ^--- ]]; then
                    # End of our plan block, don't include this line in plan_block
                    capturing_plan=false
                    # Process this line normally (it's the start of next plan/section)
                    echo "$line" >> "$temp_file"
                    continue
                else
                    # Add to plan block
                    plan_block="$plan_block"$'\n'"$line"
                    continue
                fi
            else
                # Normal line in active section, not our plan
                echo "$line" >> "$temp_file"
                continue
            fi
        fi
        
        # If we're in completed section and we found our plan, insert it at the beginning
        if [[ "$in_completed_section" == true ]] && [[ "$plan_found" == true ]] && [[ ! -z "$plan_block" ]]; then
            # Insert the captured plan block at the beginning of completed section
            echo "" >> "$temp_file"
            echo "$plan_block" >> "$temp_file"
            echo "" >> "$temp_file"
            plan_block=""  # Clear it so we don't insert again
        fi
        
        # Normal line processing
        echo "$line" >> "$temp_file"
        
    done < "$TODO_FILE"
    
    # If we captured a plan but never inserted it (edge case), insert at end of completed section
    if [[ "$plan_found" == true ]] && [[ ! -z "$plan_block" ]]; then
        echo "" >> "$temp_file"
        echo "$plan_block" >> "$temp_file"
        echo "" >> "$temp_file"
    fi
    
    # Replace original file with processed version
    mv "$temp_file" "$TODO_FILE"
    
    if [[ "$plan_found" == true ]]; then
        echo -e "${GREEN}✅ Moved $plan_name from Active Plans to Completed Plans${NC}"
    else
        echo -e "${YELLOW}⚠️  Plan $plan_name not found in Active Plans section${NC}"
    fi
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
                
                # Update TODO.md references and move between sections
                if [[ -f "$TODO_FILE" ]]; then
                    # Update path references in TODO.md
                    sed -i "s|/plans/${filename}.md|/plans/completed/${filename}.md|g" "$TODO_FILE"
                    
                    # Move plan from Active Plans to Completed Plans section
                    move_plan_to_completed "$filename"
                    
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
    "move-to-completed")
        if [[ -z "$2" ]]; then
            echo -e "${RED}❌ Plan name is required${NC}"
            exit 1
        fi
        move_plan_to_completed "$2"
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