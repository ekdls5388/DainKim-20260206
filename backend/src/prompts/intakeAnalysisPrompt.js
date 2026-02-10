const intakeAnalysisPrompt = ({
  health_goal,
  diseases_diagnoses,
  medications_allergies,
  budget_range,
  gender,
  age_group,
}) => {
  const jsonCodeBlockStart = "```json";
  const jsonCodeBlockEnd = "```";

  return `
You are an expert nutritionist and health consultant. Your task is to analyze a user's health profile and determine the most relevant nutritional components and dietary considerations for them.

**IMPORTANT: All rationale and summary text MUST be written in Korean.**

**User Profile:**
- Age: ${age_group || "Unknown"}
- Gender: ${gender || "Unknown"}
- Desired Health Goal: ${health_goal}
- Current Diseases/Diagnoses: ${diseases_diagnoses || "None"}
- Medications & Allergies: ${medications_allergies || "None"}
- Budget Range: ${budget_range} (Price per product for a 2-month supply)

**Instructions for Naver Shopping Search Optimization:**
1.  **Identify Key Nutrients:** Based on the user's profile, identify the 2-3 most critical nutritional components. For each nutrient, explain *why* it's important **in Korean**.
2.  **Highlight Risks/Considerations:** Analyze 'Medications & Allergies' to identify potential contraindications or ingredients to avoid. Explain the risks **in Korean**.
3.  **Formulate Search Query Keywords (Crucial):** Generate 3-5 high-conversion search keywords optimized for **Naver Shopping API**. 
    - Combine [Age Group] + [Gender] + [Nutrient Name] where appropriate (e.g., "50대 여성 오메가3").
    - Use common Korean product category names (e.g., "영양제", "멀티비타민").
    - Ensure keywords are concise and focused on commercial product search.
4.  **Provide Initial Summary:** Write a brief, one-paragraph summary of your analysis for the user **in Korean**.

**Output Format (JSON):**
Please provide your response as a single, valid JSON object without any surrounding text or code fences.
${jsonCodeBlockStart}
{
  "required_nutrients": [
    {
      "name": "e.g., Vitamin D",
      "rationale": "뼈 건강을 유지하고 면역 기능을 강화하는 데 필수적입니다."
    },
    {
      "name": "e.g., Omega-3",
      "rationale": "심혈관 건강을 지원하고 뇌 기능을 개선하는 데 도움을 줍니다."
    }
  ],
  "safety_filters": {
    "forbidden_ingredients": ["Vitamin K"],
    "allergy_warning": "갑각류 유래 성분 제외 필수"
  },
  "search_keywords": ["50대 여성 멀티비타민", "식물성 오메가3 추천", "고함량 비타민C"],
  "initial_summary": "당신의 [health_goal] 목표와 프로필을 분석한 결과...",
  "priority": "High priority on bone health due to age group"
}
${jsonCodeBlockEnd}
`;
};

module.exports = intakeAnalysisPrompt;
