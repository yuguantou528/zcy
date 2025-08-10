#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting build process...');

try {
  // 确保node_modules/.bin目录存在
  const binDir = path.join(__dirname, 'node_modules', '.bin');
  if (fs.existsSync(binDir)) {
    console.log('Setting executable permissions for bin files...');
    try {
      execSync(`chmod +x ${binDir}/*`, { stdio: 'inherit' });
    } catch (error) {
      console.log('Permission setting failed, continuing with npx...');
    }
  }

  // 运行构建
  console.log('Running Vite build...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
