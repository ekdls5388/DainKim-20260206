const OpenAI = require("openai");
const verifierPrompt = require("../prompts/verifierPrompt");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const verifierAgent = async (optimizedProduct, medicationsAllergies) => {
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
};

module.exports = verifierAgent;
