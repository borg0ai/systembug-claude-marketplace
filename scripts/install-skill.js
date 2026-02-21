#!/usr/bin/env node
/**
 * 从本市场注册表安装指定技能到 Cursor 技能目录。
 * 用法: node scripts/install-skill.js <skill-id> [--project]
 * 或:   npm run install-skill -- <skill-id> [--project]
 *
 * --project: 安装到当前项目 .cursor/skills/，否则安装到用户级 ~/.cursor/skills/
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REGISTRY_PATH = 'data/skills.json';
const SOURCE_GIT = 'git';
const SOURCE_URL = 'url';
const SOURCE_FILE = 'file';

function getProjectRoot() {
  let dir = __dirname;
  while (dir !== path.dirname(dir)) {
    const pkg = path.join(dir, 'package.json');
    if (fs.existsSync(pkg)) return dir;
    dir = path.dirname(dir);
  }
  return process.cwd();
}

function loadRegistry(projectRoot) {
  const registryPath = path.join(projectRoot, REGISTRY_PATH);
  if (!fs.existsSync(registryPath)) {
    console.error('错误: 未找到注册表', registryPath);
    process.exit(1);
  }
  const raw = fs.readFileSync(registryPath, 'utf8');
  return JSON.parse(raw);
}

function findSkill(registry, skillId) {
  const skill = registry.skills?.find((s) => s.id === skillId);
  if (!skill) {
    console.error('错误: 未找到技能 id:', skillId);
    process.exit(1);
  }
  return skill;
}

function resolveTargetDir(skillId, projectScope) {
  if (projectScope) {
    const cwd = process.cwd();
    return path.join(cwd, '.cursor', 'skills', skillId);
  }
  const home = process.env.HOME || process.env.USERPROFILE;
  if (!home) {
    console.error('错误: 无法解析用户主目录');
    process.exit(1);
  }
  return path.join(home, '.cursor', 'skills', skillId);
}

function installFromFile(projectRoot, skill, targetDir) {
  const src = path.join(projectRoot, skill.installPath || skill.id);
  if (!fs.existsSync(src)) {
    console.error('错误: 本地技能路径不存在:', src);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(targetDir), { recursive: true });
  if (fs.existsSync(targetDir)) fs.rmSync(targetDir, { recursive: true });
  copyDir(src, targetDir);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const srcPath = path.join(src, name);
    const destPath = path.join(dest, name);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function installFromGit(skill, targetDir) {
  const url = skill.sourceUrl;
  if (!url) {
    console.error('错误: 技能 source 为 git 但未提供 sourceUrl');
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(targetDir), { recursive: true });
  if (fs.existsSync(targetDir)) fs.rmSync(targetDir, { recursive: true });
  execSync(`git clone --depth 1 "${url}" "${targetDir}"`, { stdio: 'inherit' });
  const subPath = skill.installPath;
  if (subPath) {
    const sub = path.join(targetDir, subPath);
    if (fs.existsSync(sub)) {
      const tmp = targetDir + '.tmp';
      fs.renameSync(targetDir, tmp);
      fs.renameSync(sub, targetDir);
      fs.rmSync(tmp, { recursive: true });
    }
  }
}

function installFromUrl(skill, targetDir) {
  const url = skill.sourceUrl;
  if (!url) {
    console.error('错误: 技能 source 为 url 但未提供 sourceUrl');
    process.exit(1);
  }
  console.error('当前未实现从 URL 下载安装，请使用 git 或 file 来源。');
  process.exit(1);
}

function main() {
  const args = process.argv.slice(2);
  const projectScope = args.includes('--project');
  const skillId = args.find((a) => !a.startsWith('--'));
  if (!skillId) {
    console.error('用法: node scripts/install-skill.js <skill-id> [--project]');
    process.exit(1);
  }

  const projectRoot = getProjectRoot();
  const registry = loadRegistry(projectRoot);
  const skill = findSkill(registry, skillId);
  const targetDir = resolveTargetDir(skillId, projectScope);

  const source = (skill.source || SOURCE_FILE).toLowerCase();
  if (source === SOURCE_FILE) {
    installFromFile(projectRoot, skill, targetDir);
  } else if (source === SOURCE_GIT) {
    installFromGit(skill, targetDir);
  } else if (source === SOURCE_URL) {
    installFromUrl(skill, targetDir);
  } else {
    console.error('错误: 不支持的 source 类型:', skill.source);
    process.exit(1);
  }

  console.log('已安装:', skill.name, '->', targetDir);
}

main();
