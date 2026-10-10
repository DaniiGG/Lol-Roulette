const fs = require('fs')
const files = [
  'app/[locale]/blog/page.tsx',
  'app/[locale]/blog/[slug]/page.tsx',
  'app/[locale]/blog/champions/page.tsx',
  'app/[locale]/blog/guides/page.tsx',
  'app/[locale]/blog/tier-lists/page.tsx',
  'app/[locale]/blog/beginners/page.tsx',
  'app/[locale]/blog/ranked/page.tsx',
  'app/[locale]/blog/mechanics/page.tsx',
  'app/[locale]/blog/league-roulette/page.tsx',
  'app/[locale]/[lane]/page.tsx'
]
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8')
  if (content.includes("raw('blogContent')")) {
    const updated = content.replace(/raw\('blogContent'\)/g, "raw('blog-content')")
    fs.writeFileSync(f, updated)
    console.log('fixed:', f)
  }
}