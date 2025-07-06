#!/bin/bash

# Plan Management Tools
# Provides utilities for creating, updating, and managing development plans

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TODO_FILE="$PROJECT_ROOT/TODO.md"
PLANS_DIR="$PROJECT_ROOT/plans"
TEMPLATES_DIR="$PROJECT_ROOT/plans/templates"
COMPLETED_DIR="$PROJECT_ROOT/plans/completed"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

show_help() {
    echo "Plan Management Tools"
    echo ""
    echo "Usage: $0 <command> [arguments]"
    echo ""
    echo "Commands:"
    echo "  create-plan <name> [type]     Create new plan from template"
    echo "                                Types: plan (default), feature, bugfix"
    echo "  update-status <plan> <status> Update plan status in both files"
    echo "  validate-plans                Check consistency between files"
    echo "  archive-plan <name>           Move completed plan to archive"
    echo "  list-plans                    List all active plans"
    echo "  sync-todo                     Sync TODO.md with plan files"
    echo ""
    echo "Examples:"
    echo "  $0 create-plan ui-redesign feature"
    echo "  $0 update-status search-optimization 'In Progress'"
    echo "  $0 archive-plan search-optimization"
}

create_plan() {
    local plan_name="$1"
    local plan_type="${2:-plan}"
    
    if [[ -z "$plan_name" ]]; then
        echo -e "${RED}❌ Plan name is required${NC}"
        exit 1
    fi
    
    local template_file="$TEMPLATES_DIR/${plan_type}-template.md"
    local plan_file="$PLANS_DIR/${plan_name}.md"
    
    if [[ ! -f "$template_file" ]]; then
        echo -e "${RED}❌ Template not found: ${plan_type}-template.md${NC}"
        echo "Available templates: plan, feature, bugfix"
        exit 1
    fi
    
    if [[ -f "$plan_file" ]]; then
        echo -e "${RED}❌ Plan already exists: ${plan_name}.md${NC}"
        exit 1
    fi
    
    # Copy template and replace placeholders
    cp "$template_file" "$plan_file"
    
    # Replace placeholders with actual values
    local current_date=$(date +%Y-%m-%d)
    local plan_title=$(echo "$plan_name" | sed 's/-/ /g' | sed 's/\b\w/\U&/g')
    
    sed -i "s/\[Plan Name\]/$plan_title/g" "$plan_file"
    sed -i "s/\[Feature Name\]/$plan_title/g" "$plan_file"
    sed -i "s/\[Bug Fix: Brief Description\]/Bug Fix: $plan_title/g" "$plan_file"
    sed -i "s/\[YYYY-MM-DD\]/$current_date/g" "$plan_file"
    
    echo -e "${GREEN}✅ Created plan: ${plan_name}.md${NC}"
    echo -e "${BLUE}📝 Don't forget to add it to TODO.md${NC}"
    echo -e "${BLUE}📂 Plan file: $plan_file${NC}"
}

update_status() {
    local plan_name="$1"
    local new_status="$2"
    
    if [[ -z "$plan_name" || -z "$new_status" ]]; then
        echo -e "${RED}❌ Plan name and status are required${NC}"
        exit 1
    fi
    
    local plan_file="$PLANS_DIR/${plan_name}.md"
    
    if [[ ! -f "$plan_file" ]]; then
        echo -e "${RED}❌ Plan file not found: ${plan_name}.md${NC}"
        exit 1
    fi
    
    # Update status in plan file
    sed -i "s/- \*\*Status\*\*: .*/- **Status**: $new_status/" "$plan_file"
    
    # Update Last Updated date
    local current_date=$(date +%Y-%m-%d)
    sed -i "s/- \*\*Last Updated\*\*: .*/- **Last Updated**: $current_date/" "$plan_file"
    
    echo -e "${GREEN}✅ Updated status for ${plan_name}: $new_status${NC}"
    echo -e "${BLUE}📝 Remember to update TODO.md manually${NC}"
}

archive_plan() {
    local plan_name="$1"
    
    if [[ -z "$plan_name" ]]; then
        echo -e "${RED}❌ Plan name is required${NC}"
        exit 1
    fi
    
    local plan_file="$PLANS_DIR/${plan_name}.md"
    local archive_file="$COMPLETED_DIR/${plan_name}.md"
    
    if [[ ! -f "$plan_file" ]]; then
        echo -e "${RED}❌ Plan file not found: ${plan_name}.md${NC}"
        exit 1
    fi
    
    # Ensure completed directory exists
    mkdir -p "$COMPLETED_DIR"
    
    # Move plan to completed directory
    mv "$plan_file" "$archive_file"
    
    echo -e "${GREEN}✅ Archived plan: ${plan_name}.md${NC}"
    echo -e "${BLUE}📝 Remember to move it from Active to Completed in TODO.md${NC}"
}

list_plans() {
    echo -e "${BLUE}📋 Active Plans:${NC}"
    for plan_file in "$PLANS_DIR"/*.md; do
        if [[ -f "$plan_file" ]]; then
            local filename=$(basename "$plan_file" .md)
            local status=$(grep "Status.*:" "$plan_file" | head -1 | sed 's/.*Status.*: *//')
            local priority=$(grep "Priority.*:" "$plan_file" | head -1 | sed 's/.*Priority.*: *//')
            echo "  • $filename [$priority] - $status"
        fi
    done
    
    echo ""
    echo -e "${BLUE}📁 Completed Plans:${NC}"
    if [[ -d "$COMPLETED_DIR" ]]; then
        for plan_file in "$COMPLETED_DIR"/*.md; do
            if [[ -f "$plan_file" ]]; then
                local filename=$(basename "$plan_file" .md)
                echo "  • $filename"
            fi
        done
    else
        echo "  (none)"
    fi
}

sync_todo() {
    echo -e "${BLUE}🔄 Syncing TODO.md with plan files...${NC}"
    
    # This is a placeholder for more advanced sync functionality
    # For now, just validate consistency
    "$PROJECT_ROOT/scripts/validate-plans.sh"
}

# Main command dispatcher
case "${1:-}" in
    "create-plan")
        create_plan "$2" "$3"
        ;;
    "update-status")
        update_status "$2" "$3"
        ;;
    "validate-plans")
        "$PROJECT_ROOT/scripts/validate-plans.sh"
        ;;
    "archive-plan")
        archive_plan "$2"
        ;;
    "list-plans")
        list_plans
        ;;
    "sync-todo")
        sync_todo
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