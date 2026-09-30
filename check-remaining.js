const fs = require('fs');
const d = JSON.parse(fs.readFileSync('locales/es/common.json', 'utf8'));
const sections = ['home','about','contact','faq','faqContent','howToPlay','tips','tipsContent','leaderboard','blog','meta','seo','localeSwitcher','championMastery','mastery','championWinrate','championPool','blogContent'];
let enStrings = [];
sections.forEach(s => {
    const v = d[s];
    if (typeof v === 'string' && /^[A-Za-z\s]+$/.test(v) && v.length > 5) {
        enStrings.push(s + '=' + v.substring(0, 50));
    } else if (typeof v === 'object') {
        Object.entries(v).forEach(([k, val]) => {
            if (typeof val === 'string' && /^[A-Za-z\s]+$/.test(val) && val.length > 5) {
                enStrings.push(k + '=' + val.substring(0, 30));
            }
        });
    }
});
console.log('Spanish en strings:', enStrings.slice(0, 20).join('; '));
console.log('Total:', enStrings.length);
