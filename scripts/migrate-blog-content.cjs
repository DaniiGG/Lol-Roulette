// One-time migration: move the blogContent array out of locales/*/common.json
// into a dedicated locales/*/blog-content.json (for en and es a hand-written
// improved version already exists at that path and is kept as-is).
const fs = require('fs')
const path = require('path')

const locales = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh-CN', 'ko', 'ar', 'ru', 'nl', 'pl']

for (const locale of locales) {
  const commonPath = path.join('locales', locale, 'common.json')
  const targetPath = path.join('locales', locale, 'blog-content.json')
  const data = JSON.parse(fs.readFileSync(commonPath, 'utf8'))
  const hasContent = 'blogContent' in data

  if (fs.existsSync(targetPath) && hasContent) {
    // en / es: improved content already written -> just strip the old key
    delete data.blogContent
    fs.writeFileSync(commonPath, JSON.stringify(data, null, 4) + '\n')
    console.log(locale + ': stripped blogContent from common.json (kept new blog-content.json)')
  } else if (fs.existsSync(targetPath) && !hasContent) {
    console.log(locale + ': nothing to do')
  } else {
    // other locales: move the existing array into the dedicated file
    const content = data.blogContent
    delete data.blogContent
    fs.writeFileSync(targetPath, JSON.stringify({ blogContent: content }, null, 4) + '\n')
    fs.writeFileSync(commonPath, JSON.stringify(data, null, 4) + '\n')
    console.log(locale + ': moved ' + (content ? content.length : 0) + ' posts into blog-content.json')
  }
}
console.log('done')
