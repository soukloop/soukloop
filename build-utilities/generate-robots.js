const fs = require("fs");

const path = require("path");

function generaterobots(){
    const robotsContent =`
    User-agent: *
    Disallow: /
`;
    fs.writeFileSync(path.resolve("./public/robots.txt"), robotsContent) 
}