const OpenAI = require("openai");
const intakeAnalysisPrompt = require("../prompts/intakeAnalysisPrompt");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const intakeAnalysisAgent = async (userInput) => {
  console.log("Intake & Analysis Agent 시작...");

  const {
    health_goal,
    diseases_diagnoses,
    medications_allergies,
    budget_range,
    gender,
    age_group,
  } = userInput;

  const prompt = intakeAnalysisPrompt({
    health_goal,
    diseases_diagnoses,
    medications_allergies,
    budget_range,
    gender,
    age_group,
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const responseContent = completion.choices[0].message.content;
  const analysis = JSON.parse(responseContent);

  return {
    recommended_nutrients: analysis.required_nutrients.map((n) => ({
      name: typeof n === "string" ? n : n.name,
      ...(typeof n === "object" && n !== null ? n : {}),
    })),

    search_queries: analysis.search_keywords.map((kw) => kw.trim()),
    safety_filters: analysis.safety_filters,
    priority: analysis.priority,
    initial_summary: analysis.initial_summary,
  };
};

module.exports = intakeAnalysisAgent;
