#!/usr/bin/env node
/**
 * deploy_check.js - 部署驗證腳本
 * 確保 Server 端程式碼與 Git 一致
 *
 * 用法：
 *   node server/deploy_check.js        # 檢查狀態
 *   node server/deploy_check.js --fix  # 自動修復（執行 git reset --hard）
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

function run(cmd) {
    try {
        return execSync(cmd, { cwd: ROOT_DIR, encoding: 'utf8' }).trim();
    } catch (e) {
        return null;
    }
}

function main() {
    const args = process.argv.slice(2);
    const shouldFix = args.includes('--fix');

    console.log('========================================');
    console.log('  GameZoe 部署檢查工具');
    console.log('========================================\n');

    // 1. 獲取當前 HEAD commit
    const localHead = run('git rev-parse HEAD');
    const localShort = run('git rev-parse --short HEAD');
    console.log(`本地 HEAD: ${localShort} (${localHead})`);

    // 2. Fetch 遠端更新
    console.log('\n正在獲取遠端更新...');
    run('git fetch origin');

    // 3. 獲取遠端 master HEAD
    const remoteHead = run('git rev-parse origin/master');
    const remoteShort = run('git rev-parse --short origin/master');
    console.log(`遠端 HEAD: ${remoteShort} (${remoteHead})`);

    // 4. 檢查是否一致
    const isInSync = localHead === remoteHead;

    console.log('\n----------------------------------------');
    if (isInSync) {
        console.log('✅ 狀態: 同步');
        console.log('   本地與遠端 Git 一致');
    } else {
        console.log('❌ 狀態: 不同步');
        console.log('   本地與遠端 Git 不一致!');

        // 顯示落後多少 commits
        const behind = run('git rev-list HEAD..origin/master --count');
        const ahead = run('git rev-list origin/master..HEAD --count');
        if (behind && parseInt(behind) > 0) {
            console.log(`   落後遠端 ${behind} 個 commit`);
        }
        if (ahead && parseInt(ahead) > 0) {
            console.log(`   領先遠端 ${ahead} 個 commit (本地有未推送的變更)`);
        }
    }

    // 5. 檢查本地是否有未提交的變更
    const status = run('git status --porcelain');
    if (status && status.length > 0) {
        const modifiedFiles = status.split('\n').filter(l => l.startsWith(' M') || l.startsWith('M '));
        if (modifiedFiles.length > 0) {
            console.log(`\n⚠️  警告: 有 ${modifiedFiles.length} 個本地修改的文件:`);
            modifiedFiles.slice(0, 5).forEach(f => console.log(`   ${f}`));
            if (modifiedFiles.length > 5) {
                console.log(`   ... 還有 ${modifiedFiles.length - 5} 個文件`);
            }
        }
    }
    console.log('----------------------------------------\n');

    // 6. 顯示最近的 commits
    console.log('最近 5 個 commits (遠端):');
    const logs = run('git log origin/master --oneline -5');
    if (logs) {
        logs.split('\n').forEach(l => console.log(`  ${l}`));
    }

    // 7. 如果不同步且有 --fix 參數，自動修復
    if (!isInSync && shouldFix) {
        console.log('\n========================================');
        console.log('  執行自動修復...');
        console.log('========================================');

        console.log('\n執行: git reset --hard origin/master');
        const result = run('git reset --hard origin/master');
        console.log(result || '完成');

        const newHead = run('git rev-parse --short HEAD');
        console.log(`\n✅ 已同步到: ${newHead}`);
        console.log('\n請執行: pm2 restart all');
    } else if (!isInSync) {
        console.log('\n要同步到最新版本，請執行:');
        console.log('  node server/deploy_check.js --fix && pm2 restart all');
        console.log('\n或手動執行:');
        console.log('  git fetch origin && git reset --hard origin/master && pm2 restart all');
    }

    // 8. 顯示關鍵文件的修改時間
    console.log('\n關鍵文件狀態:');
    const keyFiles = [
        'server/index.js',
        'server/fish_mocker.js',
        'server/utils/RoomManager.js',
        'games/slot-machine/index.html'
    ];

    keyFiles.forEach(f => {
        const fullPath = path.join(ROOT_DIR, f);
        if (fs.existsSync(fullPath)) {
            const stat = fs.statSync(fullPath);
            const mtime = stat.mtime.toISOString().replace('T', ' ').substring(0, 19);
            console.log(`  ${f}: ${mtime}`);
        }
    });

    console.log('\n========================================\n');

    return isInSync ? 0 : 1;
}

process.exit(main());
