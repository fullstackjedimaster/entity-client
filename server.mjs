import { createServer } from 'https';
import { readFileSync } from 'fs';
import { parse } from 'url';
import next from 'next';

const dev = true; // always dev
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
    key:  readFileSync('./localhost-key.pem'),
    cert: readFileSync('./localhost-cert.pem'),
};

app.prepare().then(() => {
    createServer(httpsOptions, (req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    }).listen(3003, (err) => {
        if (err) throw err;
        console.log('✅ HTTPS dev server ready at https://localhost:3003');
    });
});
