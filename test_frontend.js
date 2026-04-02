const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
        page.on('response', resp => console.log('PAGE RESP:', resp.url(), resp.status()));
        
        console.log('Navigating...');
        await page.goto('http://localhost:3000');
        
        console.log('Logging in...');
        await page.type('#email', 'admin@ctia.com');
        await page.type('#senha', 'admin123');
        await page.click('button[type="submit"]');
        await page.waitForNavigation();
        
        console.log('Opening Ensaio...');
        await page.waitForSelector('.kanban-card');
        await page.click('.kanban-card');
        
        console.log('Editing Ensaio...');
        await page.waitForSelector('#btnEditEnsaio', {visible: true});
        await page.click('#btnEditEnsaio');
        
        console.log('Saving Edit...');
        await page.waitForSelector('#btnSubmitForm', {visible: true});
        await page.click('#btnSubmitForm');
        
        console.log('Waiting for response...');
        await new Promise(r => setTimeout(r, 2000));
        
        await browser.close();
        console.log('Done');
    } catch (e) {
        console.log('SCRIPT ERR:', e);
    }
})();
