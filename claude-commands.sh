#!/bin/bash

# SuperClaude Commands for 3DAvatar Project
# Usage: ./claude-commands.sh @command-name [args]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper function to print colored output
print_status() {
    echo -e "${GREEN}[CLAUDE]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Get current date for session naming
get_date() {
    date +%Y%m%d
}

# Development Workflow Commands
cmd_start_session() {
    local topic=${1:-"general"}
    local branch_name="claude-session-$(get_date)-${topic}"
    
    print_status "Starting new development session: ${branch_name}"
    
    git checkout -b "${branch_name}"
    git push -u origin "${branch_name}"
    
    print_status "Session started! Branch: ${branch_name}"
}

cmd_commit_changes() {
    local type=${1:-"feat"}
    local description=${2:-"update"}
    
    print_status "Committing changes: ${type}: ${description}"
    
    git add -A
    git commit -m "${type}: ${description}"
    
    print_status "Changes committed successfully"
}

cmd_run_tests() {
    local test_type=${1:-"all"}
    
    print_status "Running tests: ${test_type}"
    
    case $test_type in
        "all")
            npm test
            ;;
        "watch")
            npm run test:watch
            ;;
        "coverage")
            npm run test:coverage
            ;;
        "e2e")
            npm run test:e2e
            ;;
        *)
            print_error "Unknown test type: ${test_type}"
            print_info "Available types: all, watch, coverage, e2e"
            exit 1
            ;;
    esac
}

cmd_dev_start() {
    print_status "Starting development environment"
    npm run dev
}

cmd_build_prod() {
    print_status "Building for production"
    npm run build
    npm run build:backend
}

# Code Quality Commands
cmd_lint_fix() {
    print_status "Fixing linting issues"
    
    cd apps/frontend && npm run lint:fix
    cd ../backend && npm run lint:fix
    cd ../..
    
    print_status "Linting fixes applied"
}

cmd_type_check() {
    print_status "Running TypeScript type checking"
    
    cd apps/frontend && npm run type-check
    cd ../backend && npm run type-check
    cd ../..
    
    print_status "Type checking completed"
}

cmd_format_code() {
    print_status "Formatting code"
    npm run format
    print_status "Code formatted"
}

# Project Analysis Commands
cmd_analyze_tests() {
    print_status "Analyzing test status"
    
    echo "Current test status:"
    echo "- Test Files: 19 total (17 failed, 2 passed)"
    echo "- Test Cases: 114 total (35 failed, 79 passed) - 69% pass rate"
    echo "- Structure: Co-located tests for better maintainability"
    
    # Run actual test analysis if available
    if command -v npm &> /dev/null; then
        print_info "Running actual test analysis..."
        npm test --reporter=json 2>/dev/null | jq '.stats' 2>/dev/null || echo "Install jq for detailed JSON analysis"
    fi
}

cmd_analyze_architecture() {
    print_status "Analyzing project architecture"
    
    echo "Current architecture:"
    echo "- Frontend: React 18 + Three.js + Vite"
    echo "- Backend: Node.js + Express + OpenAI SDK"
    echo "- Testing: Vitest + React Testing Library + Playwright"
    echo "- Deployment: Vercel configuration"
    
    # Show project structure
    print_info "Project structure:"
    tree -I 'node_modules|.git|dist|build' -L 3 2>/dev/null || find . -type d -name "node_modules" -prune -o -type d -name ".git" -prune -o -type d -print | head -20
}

cmd_analyze_performance() {
    print_status "Analyzing performance metrics"
    
    echo "Performance metrics:"
    echo "- Development: Fast HMR with Vite"
    echo "- 3D Rendering: Efficient Three.js implementation"
    echo "- TTS: Non-blocking voice synthesis"
    echo "- Build: Optimized with modern tooling"
    
    # Check bundle sizes if available
    if [ -d "apps/frontend/dist" ]; then
        print_info "Bundle sizes:"
        du -sh apps/frontend/dist/* 2>/dev/null || echo "No build artifacts found"
    fi
}

# File Management Commands
cmd_create_component() {
    local component_name=$1
    
    if [ -z "$component_name" ]; then
        print_error "Component name is required"
        print_info "Usage: @create-component ComponentName"
        exit 1
    fi
    
    print_status "Creating component: ${component_name}"
    
    local component_dir="apps/frontend/src/components"
    local component_file="${component_dir}/${component_name}.tsx"
    local test_file="${component_dir}/${component_name}.test.tsx"
    
    # Create component file
    cat > "$component_file" << EOF
import React from 'react';

export interface ${component_name}Props {
  // Add props here
}

export const ${component_name}: React.FC<${component_name}Props> = (props) => {
  return (
    <div>
      <h1>${component_name}</h1>
    </div>
  );
};
EOF

    # Create test file
    cat > "$test_file" << EOF
import { render, screen } from '@testing-library/react';
import { ${component_name} } from './${component_name}';

describe('${component_name}', () => {
  it('renders correctly', () => {
    render(<${component_name} />);
    expect(screen.getByText('${component_name}')).toBeInTheDocument();
  });
});
EOF

    print_status "Component created: ${component_file}"
    print_status "Test created: ${test_file}"
}

cmd_create_service() {
    local service_name=$1
    
    if [ -z "$service_name" ]; then
        print_error "Service name is required"
        print_info "Usage: @create-service ServiceName"
        exit 1
    fi
    
    print_status "Creating service: ${service_name}"
    
    local service_dir="apps/frontend/src/services"
    local service_file="${service_dir}/${service_name}.ts"
    local test_file="${service_dir}/${service_name}.test.ts"
    
    # Create service file
    cat > "$service_file" << EOF
export class ${service_name} {
  constructor() {
    // Initialize service
  }

  // Add methods here
}

export const ${service_name,,}Service = new ${service_name}();
EOF

    # Create test file
    cat > "$test_file" << EOF
import { ${service_name} } from './${service_name}';

describe('${service_name}', () => {
  let service: ${service_name};

  beforeEach(() => {
    service = new ${service_name}();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
EOF

    print_status "Service created: ${service_file}"
    print_status "Test created: ${test_file}"
}

cmd_create_hook() {
    local hook_name=$1
    
    if [ -z "$hook_name" ]; then
        print_error "Hook name is required"
        print_info "Usage: @create-hook HookName"
        exit 1
    fi
    
    print_status "Creating hook: use${hook_name}"
    
    local hook_dir="apps/frontend/src/hooks"
    local hook_file="${hook_dir}/use${hook_name}.ts"
    local test_file="${hook_dir}/use${hook_name}.test.ts"
    
    # Create hook file
    cat > "$hook_file" << EOF
import { useState, useEffect } from 'react';

export const use${hook_name} = () => {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Hook logic here
  }, []);

  return {
    state,
    setState
  };
};
EOF

    # Create test file
    cat > "$test_file" << EOF
import { renderHook, act } from '@testing-library/react';
import { use${hook_name} } from './use${hook_name}';

describe('use${hook_name}', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => use${hook_name}());
    
    expect(result.current.state).toBeNull();
  });
});
EOF

    print_status "Hook created: ${hook_file}"
    print_status "Test created: ${test_file}"
}

# Deployment Commands
cmd_deploy_staging() {
    print_status "Deploying to staging"
    
    if command -v vercel &> /dev/null; then
        vercel --prod=false
    else
        print_error "Vercel CLI not found. Install with: npm i -g vercel"
        exit 1
    fi
}

cmd_deploy_production() {
    print_status "Deploying to production"
    
    if command -v vercel &> /dev/null; then
        vercel --prod
    else
        print_error "Vercel CLI not found. Install with: npm i -g vercel"
        exit 1
    fi
}

cmd_check_deployment() {
    local url=${1:-"https://your-app.vercel.app"}
    
    print_status "Checking deployment health: ${url}"
    
    if curl -f "${url}/health" &> /dev/null; then
        print_status "Deployment is healthy"
    else
        print_error "Deployment health check failed"
        exit 1
    fi
}

# Emergency Procedures
cmd_rollback() {
    local commit_hash=$1
    
    if [ -z "$commit_hash" ]; then
        print_error "Commit hash is required"
        print_info "Usage: @rollback <commit-hash>"
        exit 1
    fi
    
    print_warning "Rolling back to commit: ${commit_hash}"
    
    git reset --hard "$commit_hash"
    git push --force-with-lease origin HEAD
    
    print_status "Rollback completed"
}

# Help command
cmd_help() {
    echo "SuperClaude Commands for 3DAvatar Project"
    echo ""
    echo "Development Workflow:"
    echo "  @start-session [topic]     - Create new development session"
    echo "  @commit-changes [type] [desc] - Commit changes with structured message"
    echo "  @run-tests [type]          - Run tests (all, watch, coverage, e2e)"
    echo "  @dev-start                 - Start development environment"
    echo "  @build-prod                - Build for production"
    echo ""
    echo "Code Quality:"
    echo "  @lint-fix                  - Fix linting issues"
    echo "  @type-check                - Run TypeScript type checking"
    echo "  @format-code               - Format code with prettier"
    echo ""
    echo "Project Analysis:"
    echo "  @analyze-tests             - Show test status"
    echo "  @analyze-architecture      - Show project architecture"
    echo "  @analyze-performance       - Show performance metrics"
    echo ""
    echo "File Management:"
    echo "  @create-component [name]   - Create new React component"
    echo "  @create-service [name]     - Create new service"
    echo "  @create-hook [name]        - Create new React hook"
    echo ""
    echo "Deployment:"
    echo "  @deploy-staging            - Deploy to staging"
    echo "  @deploy-production         - Deploy to production"
    echo "  @check-deployment [url]    - Check deployment health"
    echo ""
    echo "Emergency:"
    echo "  @rollback [commit-hash]    - Rollback to specific commit"
    echo "  @help                      - Show this help message"
}

# Main command dispatcher
main() {
    local command=$1
    shift
    
    case $command in
        "@start-session")
            cmd_start_session "$@"
            ;;
        "@commit-changes")
            cmd_commit_changes "$@"
            ;;
        "@run-tests")
            cmd_run_tests "$@"
            ;;
        "@dev-start")
            cmd_dev_start "$@"
            ;;
        "@build-prod")
            cmd_build_prod "$@"
            ;;
        "@lint-fix")
            cmd_lint_fix "$@"
            ;;
        "@type-check")
            cmd_type_check "$@"
            ;;
        "@format-code")
            cmd_format_code "$@"
            ;;
        "@analyze-tests")
            cmd_analyze_tests "$@"
            ;;
        "@analyze-architecture")
            cmd_analyze_architecture "$@"
            ;;
        "@analyze-performance")
            cmd_analyze_performance "$@"
            ;;
        "@create-component")
            cmd_create_component "$@"
            ;;
        "@create-service")
            cmd_create_service "$@"
            ;;
        "@create-hook")
            cmd_create_hook "$@"
            ;;
        "@deploy-staging")
            cmd_deploy_staging "$@"
            ;;
        "@deploy-production")
            cmd_deploy_production "$@"
            ;;
        "@check-deployment")
            cmd_check_deployment "$@"
            ;;
        "@rollback")
            cmd_rollback "$@"
            ;;
        "@help"|"")
            cmd_help
            ;;
        *)
            print_error "Unknown command: $command"
            print_info "Run '@help' to see available commands"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@" 