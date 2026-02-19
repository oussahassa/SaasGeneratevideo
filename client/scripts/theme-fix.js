#!/usr/bin/env node
// Simple codemod to make classes theme-aware
// Usage: node scripts/theme-fix.js
import fs from 'fs'
import path from 'path'

const root = path.resolve(process.cwd(), 'src')
const exts = ['.js', '.jsx', '.ts', '.tsx']

const replacements = [
  // text
  [/\btext-white\b/g, 'text-gray-900 dark:text-white'],
  [/\btext-gray-300\b/g, 'text-gray-600 dark:text-gray-300'],
  [/\btext-slate-400\b/g, 'text-gray-600 dark:text-gray-300'],
  [/\btext-gray-400\b/g, 'text-gray-600 dark:text-gray-300'],
  // backgrounds
  [/\bbg-slate-800\b/g, 'bg-white dark:bg-slate-800'],
  [/\bbg-slate-700\b/g, 'bg-gray-50 dark:bg-slate-700'],
  [/\bbg-slate-900\b/g, 'bg-white dark:bg-slate-900'],
  [/\bbg-white\/5\b/g, 'bg-white dark:bg-white/5'],
  // borders
  [/\bborder-slate-700\b/g, 'border-gray-200 dark:border-slate-700'],
  [/\bborder-slate-600\b/g, 'border-gray-200 dark:border-slate-600'],
  // placeholders
  [/\bplaceholder-slate-500\b/g, 'placeholder-gray-400 dark:placeholder-slate-500'],
  // buttons (keep color but ensure text readable in light)
  [/\btext-black\b/g, 'text-gray-900 dark:text-white']
]

// additional replacements: remove duplicate dark:bg-white and convert dark-only gradients
const more = [
  [/\bdark:bg-white\b/g, ''],
  [/min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900/g, 'min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900'],
  [/min-h-screen bg-gradient-to-br from-slate-900 to-slate-800/g, 'min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800'],
  [/bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900/g, 'bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900'],
  [/bg-gradient-to-br from-slate-800 to-slate-900/g, 'bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900']
]

function walk(dir) {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const full = path.join(dir, file)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) walk(full)
    else if (exts.includes(path.extname(full))) processFile(full)
  }
}

function processFile(file) {
  let src = fs.readFileSync(file, 'utf8')
  let out = src
  for (const [re, to] of replacements) out = out.replace(re, to)
  for (const [re, to] of more) out = out.replace(re, to)
  if (out !== src) {
    fs.writeFileSync(file, out, 'utf8')
    console.log('Patched', file)
  }
}

walk(root)
console.log('Done theme-fix codemod')
