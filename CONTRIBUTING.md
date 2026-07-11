# Contributing to StatusForge

We welcome contributions to StatusForge! Follow these guidelines to get started.

## Development Workflow

1. Fork the repository and create a branch for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Ensure local databases are migrated and seeded:
   ```bash
   npx prisma migrate dev
   ```

4. Make your code changes. Write clean, modular TypeScript following strict guidelines.

5. Run test suites locally:
   ```bash
   npm run test
   ```

6. Commit changes and push to your branch:
   ```bash
   git commit -m "feat: your new feature"
   git push origin feature/your-feature-name
   ```

7. Open a Pull Request against the main branch.

## Code Standards

- **TypeScript strict:** Ensure code builds with zero compiler errors.
- **Accessibility:** Use proper ARIA properties and keep pages keyboard navigable.
- **Design system:** Adhere to defined CSS properties and color variables.
- **Testing:** Include unit assertions in `tests/` for new validations or services.
