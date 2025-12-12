#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: Build the new AI-Powered Dashboard for Orbit.
## backend:
##   - task: "Setup Dashboard API Endpoints"
##     implemented: true
##     working: true
##     file: "/app/backend/routers/dashboard.py"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: false
##     status_history:
##         -working: true
##         -agent: "main"
##         -comment: "Implemented endpoints and verified with curl."
##   - task: "Integrate Real Firebase Data"
##     implemented: true
##     working: true
##     file: "/app/backend/services/firebase_service.py"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: false
##     status_history:
##         -working: true
##         -agent: "main"
##         -comment: "Implemented Firebase Admin aggregation logic, robust APY parsing, and Snapshot saving."
##   - task: "Implement AI Analysis Logic"
##     implemented: true
##     working: true
##     file: "/app/backend/services/gemini_service.py"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: true
##     status_history:
##         -working: "true"
##         -agent: "main"
##         -comment: "Implemented full context generation, prompt engineering for JSON output, and 1-week cache logic."
##
## frontend:
##   - task: "Create Dashboard Page"
##     implemented: true
##     working: true
##     file: "/app/frontend/src/pages/OrbitAIDashboard.jsx"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: true
##     status_history:
##         -working: "NA"
##         -agent: "main"
##         -comment: "Updated to fetch and display AI insights and risk metrics."
##
## metadata:
##   created_by: "main_agent"
##   version: "1.6"
##   test_sequence: 6
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Verify UI in Browser"
##   stuck_tasks: []
##   test_all: false
##   test_priority: "sequential"
##
## agent_communication:
##     -agent: "main"
##     -message: "Implemented AI analysis generation with caching and frontend integration."

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

## user_problem_statement: Migrate backend logic into frontend and preserve functionality
## backend:
##   - task: "Setup Express API Endpoints"
##     implemented: true
##     working: true
##     file: "/frontend/server/src/index.ts"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: true
##     status_history:
##       -working: true
##       -agent: "main"
##       -comment: "Added /api root, /api/health, and mounted dashboard routes."
##   - task: "Migrate Firebase Admin Aggregation"
##     implemented: true
##     working: true
##     file: "/frontend/server/src/services/firebaseService.ts"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: true
##     status_history:
##       -working: true
##       -agent: "main"
##       -comment: "Implemented aggregated stats, snapshot saving, and context retrieval."
##   - task: "Migrate Gemini AI Service"
##     implemented: true
##     working: true
##     file: "/frontend/server/src/services/geminiService.ts"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: true
##     status_history:
##       -working: true
##       -agent: "main"
##       -comment: "Implemented chat and weekly analysis with strict JSON output."
##   - task: "Wire Dashboard Routes"
##     implemented: true
##     working: true
##     file: "/frontend/server/src/routes/dashboard.ts"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: true
##     status_history:
##       -working: true
##       -agent: "main"
##       -comment: "Added stats, insights (with 7-day cache), chat, and generate-analysis routes with Zod validation."
## frontend:
##   - task: "Update OrbitAIDashboard to new API"
##     implemented: true
##     working: true
##     file: "/frontend/src/pages/OrbitAIDashboard.jsx"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: true
##     status_history:
##       -working: true
##       -agent: "main"
##       -comment: "Switched to base '/api'; added robust loading reset and error handling."
##   - task: "Enhance KPISection null-safe rendering"
##     implemented: true
##     working: true
##     file: "/frontend/src/components/KPISection.jsx"
##     stuck_count: 0
##     priority: "medium"
##     needs_retesting: true
##     status_history:
##       -working: true
##       -agent: "main"
##       -comment: "Guarded toLocaleString and numeric fields; preserved defaults."
##   - task: "AIChatBar base URL fallback"
##     implemented: true
##     working: true
##     file: "/frontend/src/components/AIChatBar.jsx"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: true
##     status_history:
##       -working: true
##       -agent: "main"
##       -comment: "Uses process.env or '/api' fallback; maintains error toast."
## metadata:
##   created_by: "main_agent"
##   version: "2.0"
##   test_sequence: 1
##   run_ui: true
## test_plan:
##   current_focus:
##     - "Start API via npm run api:start and validate all endpoints"
##     - "Load AI Dashboard and verify stats/insights populate"
##     - "Test chat flow via AIChatBar"
##   stuck_tasks: []
##   test_all: true
##   test_priority: "sequential"
## agent_communication:
##   -agent: "main"
##   -message: "Backend migrated into frontend/server (TypeScript). UI wired to /api with fallbacks and error handling."
