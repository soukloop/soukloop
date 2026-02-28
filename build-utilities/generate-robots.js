const fs = require("fs");
const path = require("path");

function generaterobots() {
    const robotsContent = `
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /*?*

# Block AI Scrapers and Aggressive Crawlers
User-agent: GPTBot
Disallow: /
User-agent: ChatGPT-User
Disallow: /
User-agent: Google-Extended
Disallow: /
User-agent: CCBot
Disallow: /
User-agent: anthropic-ai
Disallow: /
User-agent: OmgiliBot
Disallow: /
User-agent: FacebookBot
Disallow: /
User-agent: Bytespider
Disallow: /
`;
    fs.writeFileSync(path.resolve("./public/robots.txt"), robotsContent.trim() + "\\n");
}

generaterobots();