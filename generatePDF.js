import puppeteer from "puppeteer";
import { readFileSync } from "node:fs";

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

const url = process.env.PDF_URL || "https://sudharsansrinivasan.com";
const output = process.env.PDF_OUTPUT || "Sudharsan-Srinivasan-Portfolio.pdf";

const pdfStyles = readFileSync(new URL("./generatePDF.css", import.meta.url), "utf8");

async function applyPdfLayout(page) {
  await page.evaluate(() => {
    document.documentElement.classList.add("pdf-export");

    const addClass = (selector, className) => {
      document.querySelectorAll(selector).forEach((node) => {
        node.classList.add(className);
      });
    };

    addClass("#projects > div > div:nth-of-type(1)", "pdf-project-list");
    addClass("#projects > div > div:nth-of-type(1) > div", "pdf-project-card");
    addClass("#projects > div > div:nth-of-type(2)", "pdf-project-more");

    const experience = document.querySelector("#experience");
    const experienceCards = [
      ...document.querySelectorAll("#experience > div > div:nth-of-type(1) > div"),
    ];
    if (experience && experienceCards.length > 0) {
      experienceCards.forEach((node) => {
        node.classList.add("pdf-experience-card");
      });
      experience.innerHTML = "";

      const page = document.createElement("div");
      page.className = "pdf-experience-page";

      const heading = document.createElement("h2");
      heading.textContent = "Experience";
      page.appendChild(heading);

      const list = document.createElement("div");
      list.className = "pdf-experience-list";
      experienceCards.forEach((card) => list.appendChild(card));
      page.appendChild(list);
      experience.appendChild(page);
    }

    addClass("#skills > div > div:nth-of-type(1)", "pdf-skills-grid");
    document
      .querySelectorAll("#skills > div > div:nth-of-type(1) > div")
      .forEach((node) => {
        node.classList.add("pdf-skill-card-wrap");
        node.firstElementChild?.classList.add("pdf-skill-card");
      });

    addClass("#about [class*='shadow-md']", "pdf-about-card");
    addClass("#about > div > div:nth-of-type(2) > div:nth-of-type(2)", "pdf-about-grid");

    addClass("#contact > div > div:nth-of-type(1)", "pdf-contact-grid");
    addClass("#contact [class*='shadow-md']", "pdf-contact-card");

    document.querySelector("footer")?.classList.add("pdf-footer");
  });

  await page.addStyleTag({ content: pdfStyles });
}

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

  await applyPdfLayout(page);

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
