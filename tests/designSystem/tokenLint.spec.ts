import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Design System: Boundary Invariant Linting', () => {
  it('ensures no store or data layer imports exist in src/design-system/', () => {
    const dsDir = path.resolve(process.cwd(), 'src/design-system');
    const files = fs.readdirSync(dsDir).filter(f => f.endsWith('.vue') || f.endsWith('.ts'));

    for (const file of files) {
      const filePath = path.join(dsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Boundary check: Design system must remain pure and not depend on store or game data
      expect(content).not.toMatch(/from\s+['"](\.\.\/)?stores\//);
      expect(content).not.toMatch(/from\s+['"](\.\.\/)?data\//);
      expect(content).not.toMatch(/from\s+['"](\.\.\/)?services\//);
    }
  });
});

