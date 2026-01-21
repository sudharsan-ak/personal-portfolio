import puppeteer from "puppeteer";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 300;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 80);
    });
  });
}

const url = "https://sudharsansrinivasan.com/api-docs";
const output = "sudharsansrinivasan-fullpage2.pdf";

const browser = await puppeteer.launch({
  headless: "new",
  defaultViewport: null,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  const page = await browser.newPage();

  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  await page.goto(url, { waitUntil: "networkidle2", timeout: 120000 });

  // Helps load lazy sections/images
  await autoScroll(page);

  // small wait for animations/fonts/images
  await sleep(1500);

  await page.pdf({
    path: output,
    printBackground: true,
    format: "A4",
    margin: {
      top: "10mm",
      right: "10mm",
      bottom: "10mm",
      left: "10mm",
    },
    scale: 1,
  });

  console.log(`✅ Saved: ${output}`);
} catch (err) {
  console.error("❌ Failed to generate PDF:", err);
  process.exitCode = 1;
} finally {
  await browser.close();
}
