# Candidate Check Tracker - QA Test Suite 🐛

A robust, automated API and UI testing suite created as part of the Springworks QA challenge. This repository contains the source code for the "Candidate Check Tracker" application, along with an extensive test suite that programmatically proves the existence of **14 distinct bugs** spanning from server logic to UI rendering.

## 🚀 Overview

The goal of this project was to discover, document, and programmatically reproduce intentional bugs planted within an internal BGV (Background Verification) tracker app.

### 🛠 Tech Stack & Tools Used
- **Node.js & Express**: Backend API framework powering the app.
- **Jest**: The primary testing framework utilized for test assertions and suite organization.
- **Supertest**: Employed to perform robust, headless HTTP request testing against the Express API endpoints without requiring a live server loop.
- **Native DOM String Parsing**: Employed for rapid, lightweight evaluation of UI logic without the overhead of browser automation tools.

## 🧪 Testing Methodology

14 tests were developed to specifically **FAIL** on the app's current implementation, directly identifying the divergence between the API Specifications and the actual codebase behavior.

### Bugs Identified & Covered by Tests:
- **API Status Codes**: Identified incorrect `200 OK` returns instead of standard `404 Not Found` and `201 Created` responses.
- **Data Validation & Persistence**: Detected missing enum validations on `POST` and `PATCH`, failure to persist patched data, and lack of foreign key reference checks on Candidate IDs.
- **Type Coercion & Formatting**: Flagged loose `parseInt` string coercion, broken boolean logic filters, case-sensitivity issues, and substring vs. exact-match errors.
- **UI & Frontend rendering**: Identified unhandled UI state feedback (missing error guards), incorrect DOM attribute scraping (stale state updates), and missing frontend date formatting routines.

## 💻 Getting Started

To run the automated tests locally and see the bugs in action:

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`
2. **Run the Test Suite**
   \`\`\`bash
   npm test
   \`\`\`
   *(Note: The test script passes `--forceExit` to cleanly shut down any dangling listeners from the Express app.)*

## 📜 Specifications Referenced
The tests are built in strict compliance with the application's original OpenAPI schema and Markdown documentation specifications.
