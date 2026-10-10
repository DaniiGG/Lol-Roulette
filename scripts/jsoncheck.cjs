const fs = require('fs')
const file = process.argv[2]
const s = fs.readFileSync(file, 'utf8')
const lines = s.split('\n')
let inStr = false, esc = false
const stack = []
let bad = false
for (let i = 0; i < s.length; i++) {
  const c = s[i]
  if (inStr) {
    if (esc) { esc = false; continue }
    if (c === '\\') { esc = true; continue }
    if (c === '"') inStr = false
    continue
  }
  if (c === '"') { inStr = true; continue }
  if (c === '{' || c === '[') stack.push([c, i])
  else if (c === '}' || c === ']') {
    const top = stack.pop()
    const want = c === '}' ? '{' : '['
    if (!top || top[0] !== want) {
      const lineNo = s.slice(0, i).split('\n').length
      const col = s.slice(0, i).split('\n').pop().length + 1
      console.log('MISMATCH at line', lineNo, 'col', col, 'got', c, 'expected close of', top ? top[0] : '(none)')
      for (let j = Math.max(0, lineNo - 5); j < lineNo + 2; j++) {
        console.log((j + 1) + ': ' + (lines[j] || ''))
      }
      bad = true
      break
    }
  }
}
if (!bad) console.log('balanced, stack size:', stack.length)
