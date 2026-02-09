require("dotenv").config();
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { addExtra } = require("puppeteer-extra");
const fs = require("fs");

const puppeteerExtra = addExtra(puppeteer);
puppeteerExtra.use(StealthPlugin());

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const supervisorPrompt = require("./prompts/supervisorPrompt");
const optimizerPrompt = require("./prompts/optimizerPrompt");
const verifierPrompt = require("./prompts/verifierPrompt");

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.json({ message: "백엔드 서버 가동중. " });
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function searchAgent(ingredient) {
  console.log(`Search guy says: diving into iHerb for '${ingredient}'...`);

  const browser = await puppeteerExtra.launch({
    args: [
      ...chromium.args,
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--single-process",
      "--no-zygote",
    ],
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    ignoreDefaultArgs: ["--disable-extensions"], // 추가
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  );
  await page.setViewport({ width: 1280, height: 800 });

  try {
    const searchUrl = `https://kr.iherb.com/search?kw=${encodeURIComponent(ingredient)}`;

    await page.goto(searchUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await page.waitForSelector(".products.product-cells", { timeout: 15000 });

    const products = await page.evaluate(() => {
      const items = Array.from(
        document.querySelectorAll(".product.ga-product"),
      ).slice(0, 3);

      return items.map((item) => {
        const titleEl =
          item.querySelector(".product-title") ||
          item.querySelector(".product-link");
        const priceEl =
          item.querySelector(".product-price") || item.querySelector(".price");

        const rawPrice = priceEl?.innerText || "0";
        const numericPrice = rawPrice.replace(/[^0-9]/g, "");

        return {
          name: titleEl?.innerText?.trim() || "상품명 없음",
          price: rawPrice.trim() || "가격 정보 없음",
          numericPrice: parseInt(numericPrice, 10) || 0,
          link: titleEl?.href || "#",
        };
      });
    });

    console.log(
      `Search guy found ${products.length} things for '${ingredient}'. Links:`,
      products.map((p) => p.link),
    );
    return products;
  } catch (error) {
    console.error(
      `Oops! Search for '${ingredient}' totally messed up: ${error.message}`,
    );
    return [];
  } finally {
    await browser.close();
  }
}

async function optimizerAgent(
  allAvailableProducts,
  userInput,
  supervisorAnalysis,
) {
  console.log("Optimizer's on it! Picking the coolest stuff...");

  if (!allAvailableProducts || allAvailableProducts.length === 0) {
    return {
      selected_product: null,
      selection_rationale: "검색된 제품이 없습니다.",
      warning: "No products found.",
    };
  }

  const prompt = optimizerPrompt({
    allAvailableProducts,
    userInput,
    supervisorAnalysis,
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const responseContent = completion.choices[0].message.content;
  console.log("Optimizer heard back from brainy friend:", responseContent);

  return JSON.parse(responseContent);
}

async function verifierAgent(optimizedProduct, medicationsAllergies) {
  console.log("Safety patrol is on duty! Checking things out...");
  if (!optimizedProduct?.selected_product)
    return {
      verification_status: "skipped",
      detailed_message: "검증할 제품이 없습니다.",
    };

  const prompt = verifierPrompt({ optimizedProduct, medicationsAllergies });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const responseContent = completion.choices[0].message.content;
  console.log("Safety patrol checked with brainy friend:", responseContent);

  return JSON.parse(responseContent);
}

app.post("/api/recommend", async (req, res) => {
  const userInput = req.body;

  try {
    console.log("Alright, let's get started");

    // 1. Supervisor 분석
    const supPrompt = supervisorPrompt(userInput);
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: supPrompt }],
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0].message.content;
    const analysis = JSON.parse(responseContent);

    // 2. Search Agent 병렬 실행
    console.log("Bossman says: searching for keywords in parallel, kinda...");
    const searchKeywords = analysis.search_keywords.slice(0, 3);

    const searchResults = [];
    for (const kw of searchKeywords) {
      const result = await searchAgent(kw);
      searchResults.push(result);
    }
    const allProducts = searchResults.flat();

    // 3. Optimizer 실행
    const optimization = await optimizerAgent(allProducts, userInput, analysis);

    // 4. Verifier 실행
    const verification = await verifierAgent(
      optimization,
      userInput.medications_allergies,
    );

    // 5. 최종 결과 반환
    res.json({
      initialRecommendation: analysis.initial_summary,
      recommendedIngredients: analysis.search_keywords,
      finalRecommendation: optimization.selected_product,
      selectionRationale: optimization.selection_rationale,
      optimizationWarning: optimization.warning,
      verification: verification.detailed_message,
      verificationStatus: verification.verification_status,
      rawProducts: allProducts,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "프로세스 중단", details: error.message });
  }
});

app.listen(port, () =>
  console.log(
    `Server up and running at http://localhost:${port}. Go check it out!`,
  ),
);
