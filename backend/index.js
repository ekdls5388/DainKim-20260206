require("dotenv").config();
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const supervisorPrompt = require("./prompts/supervisorPrompt");
const optimizerPrompt = require("./prompts/optimizerPrompt");
const verifierPrompt = require("./prompts/verifierPrompt");

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// SearchAgent : 파싱된 정보를 바탕으로 Iherb 홈페이지에서 제품을 크롤링함.
async function searchAgent(ingredient) {
  console.log(`[Search Agent] 아이허브 크롤링 시작: '${ingredient}'`);

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
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

    // 상품 목록 셀렉터 대기
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

        // 가격 데이터에서 숫자만 추출 (가성비 계산용)
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
      `[Search Agent] '${ingredient}' 검색 완료: ${products.length}건`,
    );
    return products;
  } catch (error) {
    console.error(
      `[Search Agent] '${ingredient}' 검색 중 오류: ${error.message}`,
    );
    return []; // 에러 발생 시 빈 배열 반환하여 전체 흐름 유지
  } finally {
    await browser.close();
  }
}

// Optimizer Agent : 검색한 정보 중 최적의 결과(가성비)를 선택
async function optimizerAgent(
  allAvailableProducts,
  userInput,
  supervisorAnalysis,
) {
  console.log("[Optimizer Agent] 최적의 제품 선별 중...");

  if (!allAvailableProducts || allAvailableProducts.length === 0) {
    return {
      selected_product: null,
      selection_rationale: "검색된 제품이 없습니다.",
      warning: "No products found.",
    };
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
  const prompt = optimizerPrompt({
    allAvailableProducts,
    userInput,
    supervisorAnalysis,
  });

  const result = await model.generateContent(prompt);
  return JSON.parse(
    result.response
      .text()
      .replace(/^```json\s*|```\s*$/g, "")
      .trim(),
  );
}

// Verifier Agent : 선택된 정보를 기준에 맞춰 검증
async function verifierAgent(optimizedProduct, medicationsAllergies) {
  if (!optimizedProduct?.selected_product)
    return {
      verification_status: "skipped",
      detailed_message: "검증할 제품이 없습니다.",
    };

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
  const prompt = verifierPrompt({ optimizedProduct, medicationsAllergies });

  const result = await model.generateContent(prompt);
  return JSON.parse(
    result.response
      .text()
      .replace(/^```json\s*|```\s*$/g, "")
      .trim(),
  );
}

/**
 * [Main API Endpoint]
 */
app.post("/api/recommend", async (req, res) => {
  const userInput = req.body;

  try {
    console.log("[Nutri-Agent] 워크플로우 시작...");

    // 1. Supervisor 분석
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const supPrompt = supervisorPrompt(userInput);
    const supResult = await model.generateContent(supPrompt);
    const analysis = JSON.parse(
      supResult.response
        .text()
        .replace(/^```json\s*|```\s*$/g, "")
        .trim(),
    );

    // 2. Search Agent 병렬 실행
    console.log("[Supervisor] 키워드 병렬 검색 시작...");
    const searchKeywords = analysis.search_keywords.slice(0, 3); // 상위 3개 키워드

    // [Image of parallel vs sequential processing]
    const searchPromises = searchKeywords.map((kw) => searchAgent(kw));
    const searchResults = await Promise.all(searchPromises);
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
    console.error("Critical Error:", error);
    res.status(500).json({ error: "프로세스 중단", details: error.message });
  }
});

app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`),
);
