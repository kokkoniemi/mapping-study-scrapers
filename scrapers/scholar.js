const puppeteer = require("puppeteer-extra");
const chalk = require("chalk");
const db = require("../models");
const { saveRecord } = require("../helpers");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

const error = chalk.bold.red;
const success = chalk.keyword("green");

puppeteer.use(StealthPlugin());
let scrape = null;

(async () => {
    let browser = null;
    try {
        const urls = [
            [
                `https://scholar.google.com/scholar?q=%28%22project-based+learning%22+OR+%22problem-based+learning%22%29+AND+%28%22group+work%22+OR+%22team+work%22+OR+teamwork%29+AND+%28%22computing+education%22+OR+%22computer+science+education%22+OR+%22software+engineering+education%22%29&hl=fi&as_sdt=0%2C5&as_ylo=2020&as_yhi=2020`,
                `https://scholar.google.com/scholar?q=%28%22project-based+learning%22+OR+%22problem-based+learning%22%29+AND+%28%22group+work%22+OR+%22team+work%22+OR+teamwork%29+AND+%28%22computing+education%22+OR+%22computer+science+education%22+OR+%22software+engineering+education%22%29&hl=fi&as_sdt=0%2C5&as_ylo=2021&as_yhi=2021`,
            ],
            [
                `https://scholar.google.com/scholar?q=%28capstone+OR+%22student+project%22+OR+%22team+project%22+OR+%22group+project%22%29+AND+%28%22group+work%22+OR+%22team+work%22+OR+teamwork%29+AND+%28%22computing+education%22+OR+%22computer+science+education%22+OR+%22software+engineering+education%22%29&hl=fi&as_sdt=0%2C5&as_ylo=2020&as_yhi=2020`,
                `https://scholar.google.com/scholar?q=%28capstone+OR+%22student+project%22+OR+%22team+project%22+OR+%22group+project%22%29+AND+%28%22group+work%22+OR+%22team+work%22+OR+teamwork%29+AND+%28%22computing+education%22+OR+%22computer+science+education%22+OR+%22software+engineering+education%22%29&hl=fi&as_sdt=0%2C5&as_ylo=2021&as_yhi=2021`,
            ],
            [
                `https://scholar.google.com/scholar?q=%28%22student+projects%22+OR+%22team+projects%22+OR+%22group+projects%22%29+AND+%28%22group+work%22+OR+%22team+work%22+OR+teamwork%29+AND+%28%22computing+education%22+OR+%22computer+science+education%22+OR+%22software+engineering+education%22%29&hl=fi&as_sdt=0%2C5&as_ylo=2020&as_yhi=2020`,
                `https://scholar.google.com/scholar?q=%28%22student+projects%22+OR+%22team+projects%22+OR+%22group+projects%22%29+AND+%28%22group+work%22+OR+%22team+work%22+OR+teamwork%29+AND+%28%22computing+education%22+OR+%22computer+science+education%22+OR+%22software+engineering+education%22%29&hl=fi&as_sdt=0%2C5&as_ylo=2021&as_yhi=2021`,
            ]
        ];
        
        
        // browser = await puppeteer.launch({ headless: false, product: 'firefox', executablePath: "/Applications/Firefox.app/Contents/MacOS/firefox" });
        browser = await puppeteer.launch({ headless: false });
        let page = await browser.newPage();
        
        for (const urlSet of urls) {
            scrape = await db.Import.create({
                database: "scholar",
                query: urlSet[0].replace("&as_yhi=2020","&as_yhi=2021"),
                total: 0,
                dublicates: 0,
                namesakes: []
            });
            for (let url of urlSet) {
                await page.goto(url, {
                    waitUntil: "domcontentloaded",
                    timeout: 0,
                });
        
                await processPage(page);
            }
        }
        
    
        await browser.close();
        console.log(success("Browser Closed"));
    } catch (err) {
        console.log(error(err));
        await browser.close();
        console.log(error("Browser Closed"));
    }
})();

async function processPage(page) {
    const waitTime = 4500 + Math.floor(Math.random() * Math.floor(8000)); // To look like a human behaviour
    await page.waitFor(waitTime);
    await page.waitForSelector("#gs_res_ccl_mid", { timeout: 0 });
    await page.waitForSelector(".gs_r", { timeout: 0 });
    await page.waitForSelector("#gs_res_ccl_bot", { timeout: 0 });

    let res = await page.evaluate(() => {
        const resNode = document.querySelector("#gs_res_ccl_mid");
        const pageNodes = resNode.querySelectorAll(".gs_r");
        const pageResults = [];
        for (let i = 0; i < pageNodes.length; i++) {
            const node = pageNodes[i];
            const titleNode = node.querySelector("h3.gs_rt");
            if (titleNode.querySelector(".gs_ctu") !== null
                || node.querySelector("div.gs_a") === null
                || node.querySelector("div.gs_rs") === null
                || titleNode === null
            ) {
                continue;
            }
            const url = new URL(titleNode.querySelector("a").getAttribute("href"));
            const author = node.querySelector("div.gs_a").innerText.trim();
            const description = node.querySelector("div.gs_rs").innerText.trim();

            pageResults.push({
                title: titleNode.querySelector("a").innerText,
                url: url.href,
                alternateUrls: [],
                author: author,
                description: description,
                databases: ["scholar"]
            });
        }
        return pageResults;
    });

    for (let i = 0; i < res.length; i++) {
        const record = res[i];
        const url = new URL(record.url);
        const allowedHosts = [
            "ieeexplore.ieee.org",
            "link.springer.com",
            "dl.acm.org",
            "search.proquest.com",
            "www.tandfonline.com",
            "www.sciencedirect.com",
            "onlinelibrary.wiley.com",
            "peer.asee.org",
            "www.asee.org"
        ];
        if (allowedHosts.includes(url.host)) {
            await saveRecord(record, db, scrape);
        }
    }

    await nextPage(page);
}

async function nextPage(page) {
    await page.waitForSelector("#gs_res_ccl_bot", { timeout: 0 });

    const nextLink = await page.evaluate(async () => {
        const resNode = document.querySelector("#gs_res_ccl_bot");
        const nextBtn = resNode.querySelector(".gs_ico_nav_next");
        if (nextBtn) {
            return nextBtn.parentNode.getAttribute("href");
        }
        return null;
    });
    console.log(nextLink);
    if (nextLink) {
        await page.goto("https://scholar.google.fi" + nextLink, {
            waitUntil: 'domcontentloaded',
            timeout: 0,
        });
        await processPage(page);
    }
}