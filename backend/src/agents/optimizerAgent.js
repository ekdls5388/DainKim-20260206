const OpenAI = require("openai");
const optimizerPrompt = require("../prompts/optimizerPrompt");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const optimizerAgent = async (
  allAvailableProducts,
  userInput,
  supervisorAnalysis,
) => {
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
};

module.exports = optimizerAgent;
