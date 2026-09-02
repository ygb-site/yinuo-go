import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as cloudSync from '../src/services/cloudSyncService';

describe('家庭私有：公开注册已收回', () => {
  it('客户端不再导出注册或发放账号接口', () => {
    expect('signUpWithEmail' in cloudSync).toBe(false);
    expect('createUserByAdmin' in cloudSync).toBe(false);
  });

  it('登录弹窗只留登录，没有免费注册，也没有登录后的账号中心', () => {
    const source = readFileSync(
      resolve(__dirname, '../src/components/common/AuthModal.vue'),
      'utf8'
    );
    expect(source).not.toMatch(/免费注册/);
    expect(source).not.toMatch(/handleRegister/);
    expect(source).not.toMatch(/signUpWithEmail/);
    expect(source).not.toMatch(/家庭管理员发放/);
    expect(source).not.toMatch(/家长账号中心/);
    expect(source).toMatch(/仅限本家庭使用/);
    expect(source).toMatch(/handleClose\(\)/);
  });

  it('头像菜单不再入口进家长账号中心', () => {
    const source = readFileSync(
      resolve(__dirname, '../src/components/common/UserMenuDropdown.vue'),
      'utf8'
    );
    expect(source).not.toMatch(/家长账号中心/);
    expect(source).not.toMatch(/openAccountCenter/);
  });

  it('cloudSync 不再调用 auth.signUp，也不再调用发放账号函数', () => {
    const source = readFileSync(
      resolve(__dirname, '../src/services/cloudSyncService.ts'),
      'utf8'
    );
    expect(source).not.toMatch(/auth\.signUp/);
    expect(source).not.toMatch(/admin-create-user/);
    expect(source).not.toMatch(/createUserByAdmin/);
  });

  it('管理后台不再出现发放账号入口', () => {
    const source = readFileSync(
      resolve(__dirname, '../src/views/AdminView.vue'),
      'utf8'
    );
    expect(source).not.toMatch(/发放账号/);
    expect(source).not.toMatch(/handleIssueAccount/);
    expect(source).not.toMatch(/createUserByAdmin/);
  });
});
