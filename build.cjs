#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Vite build process...');

// 直接使用node来运行vite
const vitePath = path.join(__dirname, 'node_modules', 'vite', 'bin', 'vite.js');
const nodeArgs = [vitePath, 'build'];

console.log('Running:', 'node', nodeArgs.join(' '));

const child = spawn('node', nodeArgs, {
  stdio: 'inherit',
  cwd: __dirname
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('Build completed successfully!');
    process.exit(0);
  } else {
    console.error(`Build failed with exit code ${code}`);
    process.exit(code);
  }
});

child.on('error', (error) => {
  console.error('Build error:', error.message);
  process.exit(1);
});
