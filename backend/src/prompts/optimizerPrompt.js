const optimizerPrompt = ({
  allAvailableProducts,
  userInput,
  supervisorAnalysis,
}) => {
  const jsonCodeBlockStart = "```json";
  const jsonCodeBlockEnd = "```";

  return `
You are an expert product optimizer for health supplements. Your goal is to select ONE "best value" product from a list of available products that best fits the user's profile and budget, and addresses their required nutrients.

**IMPORTANT: The 'details_summary' and 'selection_rationale' MUST be written in Korean.**

**User Input:**
${JSON.stringify(userInput, null, 2)}

**Supervisor Agent Analysis:**
${JSON.stringify(supervisorAnalysis, null, 2)}

**Available Products (from iHerb):**
${JSON.stringify(allAvailableProducts, null, 2)}

**Instructions:**
1.  Review the 'User Input' (especially budget) and 'Supervisor Agent Analysis' (especially required nutrients and risk factors).
2.  Carefully examine the 'Available Products'.
3.  Select *exactly one* product that offers the best "value for money" and most closely aligns with the user's needs, while also considering the budget and avoiding specified risk factors.
4.  **Provide the 'selection_rationale' and 'details_summary' in Korean.**
5.  Selection Rationale Example: "이 제품은 사용자의 [건강 목표]를 위한 [핵심 성분] 함량이 높으면서 [예산 범위]에 가장 적합한 가성비 제품입니다."

**Output Format (JSON):**
${jsonCodeBlockStart}
{
  "selected_product": {
    "name": "Selected Product Name",
    "price": "Product Price",
    "link": "Product URL",
    "image": "imageurl",
    "brand": "brand",
    "maker": "maker"
    "details_summary": "사용자의 니즈에 부합하는 핵심 특징 및 성분을 한국어로 요약하세요."
  },
  "selection_rationale": "이 제품을 선택한 이유를 논리적인 한국어 한 문장으로 설명하세요.",
  "warning": "선택 과정에서 발생한 주의사항 (예: '예산이 매우 제한적이어서 선택지가 부족했습니다.')"
}
${jsonCodeBlockEnd}
`;
};

module.exports = optimizerPrompt;
