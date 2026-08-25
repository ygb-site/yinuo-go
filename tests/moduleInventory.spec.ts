import { describe, expect, it } from 'vitest';
import {
  MODULE_INVENTORY,
  getOrphanModules,
  getReachableModules
} from '../src/data/moduleInventory';

describe('模块清单', () => {
  it('每条记录 id 唯一，可触达项都有入口说明', () => {
    const ids = MODULE_INVENTORY.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const item of getReachableModules()) {
      expect(item.entries.length).toBeGreaterThan(0);
      expect(item.suggestDelete).toBe(false);
    }
  });

  it('无入口项已清空，清单里都有产品入口', () => {
    expect(getOrphanModules()).toEqual([]);
    expect(MODULE_INVENTORY.every((item) => item.suggestDelete === false)).toBe(true);
    expect(MODULE_INVENTORY.every((item) => !item.hiddenEntry)).toBe(true);
  });
});
