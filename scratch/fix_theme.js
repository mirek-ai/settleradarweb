const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Colors replacement for Light Mode support
content = content.replace(/text-white/g, 'text-slate-900 dark:text-white');
content = content.replace(/text-slate-300/g, 'text-slate-700 dark:text-slate-300');
content = content.replace(/text-slate-400/g, 'text-slate-600 dark:text-slate-400');
content = content.replace(/text-slate-500/g, 'text-slate-500 dark:text-slate-500');

// Backgrounds & Borders
content = content.replace(/bg-white\/5/g, 'bg-black/5 dark:bg-white/5');
content = content.replace(/bg-white\/10/g, 'bg-black/10 dark:bg-white/10');
content = content.replace(/bg-white\/20/g, 'bg-black/20 dark:bg-white/20');
content = content.replace(/border-white\/10/g, 'border-black/10 dark:border-white/10');
content = content.replace(/border-white\/40/g, 'border-black/20 dark:border-white/40');

// Buttons & Accents
content = content.replace(/bg-blue-600/g, 'bg-blue-500 dark:bg-blue-600');
content = content.replace(/hover:bg-blue-500/g, 'hover:bg-blue-600 dark:hover:bg-blue-500');

// Remove double 'dark:' if any
content = content.replace(/dark:dark:/g, 'dark:');

fs.writeFileSync('src/app/page.tsx', content);
console.log('page.tsx fixed for light theme support.');
