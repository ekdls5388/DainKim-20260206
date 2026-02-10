// src/routes/api.js
const express = require("express");
const router = express.Router();

// 총 5가지의 Agent를 구성하였습니다.
// 에이전트 파이프라인 구조
// 입력 -> 분석(step 1) -> 검색(step 2) -> 최적화 및 검증(step 3) -> 재고 확인(step 4) -> 최종 응답
const intakeAnalysisAgent = require("../agents/intakeAnalysisAgent"); // step 1
const searchAgent = require("../agents/searchAgent"); // step 2
const optimizerAgent = require("../agents/optimizerAgent"); // step 3
const verifierAgent = require("../agents/verifierAgent"); // step 3
const connectingAgent = require("../agents/connectingAgent"); // step 4

router.post("/analyze-and-recommend", async (req, res) => {
  const userInput = req.body;
  console.log("프론트엔드로부터 받은 데이터:", userInput);

  try {
    console.log("에이전트 파이프라인 가동 시작");

    //Step 1. Intake & Analysis Agent
    const analysisResult = await intakeAnalysisAgent(userInput);
    console.log("Intake & Analysis Agent 결과:", analysisResult);

    const {
      recommended_nutrients,
      search_queries,
      safety_filters,
      priority,
      initial_summary,
    } = analysisResult;

    //Step 2. Search Agent
    console.log("Searching for products based on keywords...");
    const allProducts = await searchAgent(search_queries);
    console.log(`Found ${allProducts.length} products after search.`);

    //Step 3. Optimizer Agent
    console.log("Optimizing product selection...");
    const optimization = await optimizerAgent(
      allProducts,
      userInput,
      analysisResult,
    );
    console.log("Optimization Result:", optimization);

    //Step 3. Verifier Agent
    console.log("Verifying optimized product...");
    const verification = await verifierAgent(
      optimization,
      userInput.medications_allergies, // Assuming this is part of userInput
    );
    console.log("Verification Result:", verification);

    let finalProduct = optimization.selected_product;
    let availabilityStatus = "unavailable";

    if (optimization.selected_product && optimization.selected_product.link) {
      // 5. Connecting Agent
      console.log("Checking product availability...");
      const connectingAgentResult = await connectingAgent(
        optimization.selected_product.link,
      );
      console.log(
        "Connecting Agent Result (Availability):",
        connectingAgentResult,
      );
      if (connectingAgentResult.is_available) {
        finalProduct = optimization.selected_product;
        availabilityStatus = "available";
      } else {
        console.warn(
          "Optimized product not available. Further logic might be needed here.",
        );
      }
    } else {
      console.warn("No optimized product or product link found.");
    }

    // 6. Final Result Response (mimicking original index.js structure)
    res.json({
      initial_summary: analysisResult.initial_summary,
      recommendedIngredients: Array.isArray(recommended_nutrients)
        ? recommended_nutrients.map((n) => (typeof n === "string" ? n : n.name))
        : [],
      finalRecommendation: finalProduct,
      selectionRationale: optimization.selection_rationale,
      optimizationWarning: optimization.warning,
      verification: verification.detailed_message,
      verificationStatus: verification.verification_status,
      rawProducts: allProducts,
      availabilityStatus: availabilityStatus,
    });
  } catch (error) {
    console.error("Error in /api/analyze-and-recommend:", error);
    res.status(500).json({ error: "프로세스 중단", details: error.message });
  }
});

module.exports = router;
