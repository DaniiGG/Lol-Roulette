const fs = require('fs');

function getKeys(obj, prefix = '') {
    const result = [];
    for (const [key, val] of Object.entries(obj)) {
        const fullKey = prefix ? prefix + '.' + key : key;
        if (typeof val === 'object' && val !== null) {
            result.push(...getKeys(val, fullKey));
        } else {
            result.push(fullKey);
        }
    }
    return result;
}

const en = JSON.parse(fs.readFileSync('locales/en/common.json', 'utf8'));
const es = JSON.parse(fs.readFileSync('locales/es/common.json', 'utf8'));
const de = JSON.parse(fs.readFileSync('locales/de/common.json', 'utf8'));

const enKeys = getKeys(en);
const esKeys = getKeys(es);
const deKeys = getKeys(de);

console.log('=== Keys missing in es ===');
enKeys.forEach(k => {
    if (!esKeys.includes(k)) console.log('ES MISSING: ' + k);
});

console.log('\n=== Keys missing in de ===');
enKeys.forEach(k => {
    if (!deKeys.includes(k)) console.log('DE MISSING: ' + k);
});

// Check which en values are still English in es
console.log('\n=== English values still in ES common.json ===');
function checkEn(obj, prefix = '') {
    let results = [];
    for (const [key, val] of Object.entries(obj)) {
        const fullKey = prefix ? prefix + '.' + key : key;
        if (typeof val === 'string' && /^[A-Za-z\s.,'!?():;"-]+$/.test(val) && val.length > 3) {
            results.push(fullKey + ': "' + val.substring(0, 40) + '"');
        } else if (typeof val === 'object' && val !== null) {
            results.push(...checkEn(val, fullKey));
        }
    }
    return results;
}
const esEn = checkEn(es);
console.log('Found ' + esEn.length + ' English strings in ES');
esEn.slice(0, 20).forEach(e => console.log('  ' + e));
