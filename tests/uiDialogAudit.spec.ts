import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('UI Dialog Standards & Zero Native Alert/Confirm Enforcement', () => {
  it('must NOT contain any raw alert() or confirm() in src/ codebase', () => {
    function scanDir(dir: string, fileList: string[] = []): string[] {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          scanDir(fullPath, fileList);
        } else if (file.endsWith('.vue') || file.endsWith('.ts')) {
          // 排除封装底层定义的 alert.ts
          if (!fullPath.replace(/\\/g, '/').endsWith('utils/alert.ts')) {
            fileList.push(fullPath);
          }
        }
      }
      return fileList;
    }

    const srcDir = path.resolve(__dirname, '../src');
    const files = scanDir(srcDir);
    const violations: string[] = [];

    // 正则匹配 alert(...) 与 confirm(...)，但排除 showAlert / showConfirm / handleAlertConfirm 等
    const alertRegex = /(?<!show)(?<![a-zA-Z0-9_])alert\s*\(/;
    const confirmRegex = /(?<!show)(?<!handleAlert)(?<![a-zA-Z0-9_])confirm\s*\(/;

    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split(/\r?\n/);
      lines.forEach((line: string, idx: number) => {
        const trimmed = line.trim();
        // 忽略单行或块级注释
        if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
          return;
        }
        if (alertRegex.test(line) || confirmRegex.test(line)) {
          const relPath = path.relative(path.resolve(__dirname, '..'), filePath);
          violations.push(`${relPath}:${idx + 1} -> ${trimmed}`);
        }
      });
    }

    expect(
      violations,
      `Forbidden native alert()/confirm() detected! Always use showAlert() / showConfirm() from @/utils/alert:\n${violations.join('\n')}`
    ).toEqual([]);
  });
});

