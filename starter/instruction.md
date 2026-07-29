# GitHub Copilot Instructions

## Project Overview

This project is a legacy Flask-based Sudoku game that has been refactored and enhanced. When generating code, preserve the existing application architecture and game flow.

## Coding Guidelines

- Keep the existing Flask application structure.
- Do not rewrite working code unless necessary.
- Make incremental improvements instead of large refactors.
- Keep backend and frontend logic separated.
- Use meaningful variable and function names.
- Write clean, readable, and well-commented code.
- Follow Python best practices and PEP 8 style guidelines.
- Keep JavaScript modular and easy to understand.

## Feature Development Guidelines

When implementing new features:

- Preserve existing functionality.
- Avoid introducing breaking changes.
- Reuse existing helper functions where possible.
- Keep UI updates responsive and user-friendly.
- Minimize duplicate code.

## Testing

Whenever backend logic changes:

- Update existing pytest tests if required.
- Add new tests for new functionality.
- Ensure all tests pass before considering changes complete.

## GitHub Copilot Expectations

Before generating code:

1. Analyze the existing codebase.
2. Explain which files require modification.
3. Explain why each change is needed.
4. Generate code incrementally.
5. Avoid replacing the entire implementation when only small changes are required.

## Code Quality

- Keep functions small and focused.
- Avoid unnecessary complexity.
- Write maintainable code.
- Preserve readability over clever implementations.
- Ensure compatibility with the existing project.