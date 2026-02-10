const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { addExtra } = require("puppeteer-extra");

const puppeteerExtra = addExtra(puppeteer);
puppeteerExtra.use(StealthPlugin());

const productScraperService = {
  _launchBrowser: async () => {
    const isProduction =
      process.env.NODE_ENV === "production" || process.env.RENDER;

    let browser;

    if (isProduction) {
      browser = await puppeteerExtra.launch({
        args: [
          ...chromium.args,
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--single-process",
          "--no-zygote",
          "--disable-blink-features=AutomationControlled",
        ],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    } else {
      const puppeteerRegular = require("puppeteer-extra");
      puppeteerRegular.use(StealthPlugin());

      browser = await puppeteerRegular.launch({
        headless: "new",
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-blink-features=AutomationControlled",
        ],
      });
    }
    return browser;
  },

  _setupPage: async (page) => {
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => false,
      });
    });

    await page.setUserAgent();
    await page.setViewport({ width: 1280, height: 800 });
  },

  checkAvailability: async (productUrl) => {
    console.log(
      `Scraper Service: Checking 'Buy Now' button for: ${productUrl}`,
    );
    let browser;
    try {
      browser = await productScraperService._launchBrowser();
      const page = await browser.newPage();
      await productScraperService._setupPage(page);

      // 페이지 이동
      await page.goto(productUrl, {
        waitUntil: "networkidle2",
        timeout: 60000,
      });

      // 1. 네이버 스마트스토어의 일반적인 '구매하기' 버튼 셀렉터들(NPay 구매하기 버튼이나 일반 구매하기 버튼 등등)을 모두 체크합니다.
      const buyButtonSelectors = [
        'a[data-shp-contents-type="BUY_NOW"]', // 스마트스토어 신형
        ".X2sN1pS99n", // 스마트스토어 공통 클래스 중 하나
        "._2-m89_L6EB", // 구매하기 버튼 클래스
        'button:contains("구매하기")',
        'a:contains("구매하기")',
      ];

      const isBuyButtonAvailable = await page.evaluate(() => {
        // '구매하기' 텍스트를 포함한 버튼이나 링크를 찾습니다.
        const buttons = Array.from(document.querySelectorAll("button, a"));
        const buyButton = buttons.find(
          (btn) =>
            btn.innerText.includes("구매하기") &&
            btn.offsetParent !== null && // 화면에 실제로 보이는지 확인
            !btn.disabled, // 비활성화 상태가 아닌지 확인
        );

        return !!buyButton; // 존재하면 true, 없으면 false
      });

      if (isBuyButtonAvailable) {
        console.log(`[SUCCESS] '구매하기' 버튼 발견! 구매 가능 상태입니다.`);
        return true;
      } else {
        console.log(
          `[FAILED] '구매하기' 버튼을 찾을 수 없습니다. 품절이거나 URL 확인이 필요합니다.`,
        );
        return false;
      }
    } catch (error) {
      console.error(`Error checking button for ${productUrl}:`, error);
      return false;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  },
};

module.exports = { productScraperService };
