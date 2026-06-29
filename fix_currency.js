const fs = require('fs');
const path = require('path');
const dir = path.join('d:', 'ITP_SE-59', 'B2B-ERP-System', 'client', 'src', 'pages');

for (const file of fs.readdirSync(dir)) {
    if (file.endsWith('.jsx')) {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        // \u20A6 is the Unicode for the Naira sign (₦)
        if (content.includes('\u20A6')) {
            content = content.replace(/\u20A6/g, 'LKR ');
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Updated ' + file);
        }
    }
}
