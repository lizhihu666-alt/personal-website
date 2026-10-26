// 用本机 Chrome 把站内的简历页（?print=resume）打印成 public/resume.pdf。
// 用法：先启动开发服务器（npm run dev），再运行 npm run resume:pdf。
// 简历内容改了（portfolioData.ts）之后需要重新运行一次，PDF 才会更新。
import puppeteer from 'puppeteer-core';

const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = process.env.RESUME_URL || 'http://localhost:3000/?print=resume#work';

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-first-run'] });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 900 });
await page.goto(URL, { waitUntil: 'networkidle2' });
await page.waitForSelector('.resume-print-sheet', { timeout: 20000 });
await new Promise((resolve) => setTimeout(resolve, 1500));
await page.emulateMediaType('print');
await page.pdf({
  path: 'public/resume.pdf',
  format: 'A4',
  printBackground: true,
  margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' },
});
await browser.close();
console.log('已生成 public/resume.pdf');
