const fs = require('fs');
const path = require('path');

// Fix missing keys by copying from English
const localesDir = 'locales';
const locales = fs.readdirSync(localesDir);
const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en', 'common.json'), 'utf8'));

// Get all keys from English
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

const enKeys = getKeys(en);

// Keys to add to es
const esExtra = {
    'seo.features.8': 'Free to Play',
    'home.editPool': 'Editar Pool',
    'home.usePool': 'Usar Pool',
    'home.challengeActive': 'Desafío Activo',
    'home.lane': 'Lane',
    'championWinrate.mode.all': 'All Modes',
    'championWinrate.mode.classic': 'Classic',
    'championWinrate.mode.aram': 'ARAM',
    'championPool.cancel': 'Cancelar',
    'championPool.save': 'Guardar'
};

// Keys to add to de
const deExtra = {
    'home.editPool': 'Pool bearbeiten',
    'home.usePool': 'Pool verwenden',
    'home.challengeActive': 'Aktive Challenge',
    'home.lane': 'Lane',
    'seo.features.8': 'Free to Play',
    'championWinrate.mode.all': 'Alle Modi',
    'championWinrate.mode.classic': 'Klassisch',
    'championWinrate.mode.aram': 'ARAM',
    'championPool.cancel': 'Abbrechen',
    'championPool.save': 'Speichern'
};

let totalAdded = 0;

// Add missing keys to es and de
['es', 'de'].forEach(l => {
    const cp = path.join(localesDir, l, 'common.json');
    const d = JSON.parse(fs.readFileSync(cp, 'utf8'));
    const extra = l === 'es' ? esExtra : deExtra;
    let changed = false;
    
    Object.entries(extra).forEach(([key, val]) => {
        const parts = key.split('.');
        let current = d;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) { current[parts[i]] = {}; changed = true; }
            current = current[parts[i]];
        }
        if (current[parts[parts.length - 1]] !== val) {
            current[parts[parts.length - 1]] = val;
            changed = true;
        }
    });
    
    if (changed) {
        fs.writeFileSync(cp, JSON.stringify(d, null, 4));
        totalAdded++;
        console.log('Added missing keys: ' + l);
    }
});

console.log('\nAdded missing keys to ' + totalAdded + ' locales.');
