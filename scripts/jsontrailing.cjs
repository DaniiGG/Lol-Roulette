const fs = require('fs')
const file = process.argv[2]
const s = fs.readFileSync(file, 'utf8')
// find all occurrences of a comma followed only by whitespace, then a closing bracket
const re = /,\s*([\]\}])/g
let m
let count = 0
while ((m = re.exec(s))) {
  const lineNo = s.slice(0, m.index).split('\n').length
  count++
  console.log('trailing comma at line ' + lineNo + ' before ' + m[1])
  const lines = s.split('\n')
  for (let j = Math.max(0, lineNo - 3); j < lineNo + 1; j++) {
    console.log('  ' + (j + 1) + ': ' + lines[j])
  }
}
if (!count) console.log('no trailing commas found')
