import "./App.css";
import { useState } from "react";

const Card = ({ children }) => <div className="card">{children}</div>;

const CardTitle = ({ icon, title }) => (
  <h2 className="card-title">
    <span>{icon}</span>
    {title}
  </h2>
);

const Field = ({ label, children }) => (
  <div className="field">
    <p className="field-label">{label}</p>
    {children}
  </div>
);

const TextInput = ({ value, onChange, placeholder }) => (
  <input
    className="input"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
  />
);

const SelectInput = ({ value, onChange, options }) => (
  <select className="input" value={value} onChange={onChange}>
    <option value="">선택</option>
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

const TextAreaInput = ({ value, onChange, placeholder }) => (
  <textarea
    className="textarea"
    rows={3}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
  />
);

const PrimaryButton = ({ text, onClick, disabled }) => (
  <button className="primary-button" onClick={onClick} disabled={disabled}>
    {text}
  </button>
);
const Chip = ({ text }) => (
  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">
    {text}
  </span>
);
const InfoBlock = ({ label, children, highlight = false }) => (
  <div
    className={`mt-6 mb-10 p-6 rounded-none border-none ${
      highlight ? "bg-rose-100/50" : "bg-slate-100"
    }`}
  >
    <p
      className={`text-sm font-black uppercase tracking-widest mb-4 ${
        highlight ? "text-rose-600" : "text-slate-600"
      }`}
    >
      {label}
    </p>
    <div
      className={`text-base leading-relaxed font-bold ${
        highlight ? "text-rose-900" : "text-slate-900"
      }`}
    >
      {children}
    </div>
  </div>
);

function App() {
  const [healthGoal, setHealthGoal] = useState("");
  const [diseases, setDiseases] = useState("");
  const [budget, setBudget] = useState("price_50000_100000");
  const [allergies, setAllergies] = useState("");
  const [gender, setGender] = useState("");
  const [ageGroup, setAgeGroup] = useState("");

  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRecommend = async () => {
    setLoading(true);
    setError(null);
    setRecommendations(null);

    const userInput = {
      health_goal: healthGoal,
      diseases_diagnoses: diseases,
      budget_range: budget,
      medications_allergies: allergies,
      gender,
      age_group: ageGroup,
    };

    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(
        `${API_BASE_URL}/api/analyze-and-recommend`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userInput),
        },
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setRecommendations(data);
    } catch (e) {
      setError("데이터를 가져오는데 실패했습니다: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () =>
    healthGoal.trim() !== "" && gender !== "" && ageGroup !== "";

  return (
    <div className="min-h-screen bg-[#f7fee7] text-slate-300 font-sans selection:bg-green-500/30">
      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        {/* Header Section */}
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4">
            Nutri<span className="text-green-500">Agent</span>
          </h1>
          <p className="text-slate-500 text-lg font-medium">
            당신만을 위한 정밀 영양 분석 서비스
          </p>
        </header>

        {/* Input Card */}
        <Card>
          <CardTitle icon="📝" title="기본 정보 입력" />

          <Field label="건강 목표 *">
            <TextInput
              value={healthGoal}
              onChange={(e) => setHealthGoal(e.target.value)}
              placeholder="예: 만성 피로 개선"
            />
          </Field>

          <Field label="기존 질환">
            <TextInput
              value={diseases}
              onChange={(e) => setDiseases(e.target.value)}
              placeholder="예: 고혈압, 당뇨"
            />
          </Field>

          <Field label="성별">
            <SelectInput
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              options={[
                { value: "male", label: "남성" },
                { value: "female", label: "여성" },
              ]}
            />
          </Field>

          <Field label="연령대">
            <SelectInput
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              options={[
                { value: "twenties", label: "20대" },
                { value: "thirties", label: "30대" },
                { value: "forties", label: "40대" },
                { value: "fifties", label: "50대" },
                { value: "overSixties", label: "60대 이상" },
              ]}
            />
          </Field>

          <Field label="약물 및 알레르기">
            <TextAreaInput
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="복용 중인 약이나 알레르기 정보를 입력하세요."
            />
          </Field>

          <PrimaryButton
            text={loading ? "에이전트 분석 중..." : "분석 시작하기"}
            onClick={handleRecommend}
            disabled={loading || !isFormValid()}
          />
        </Card>

        {recommendations && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* 1. AI 약사의 조언 */}
            <Card>
              <CardTitle
                icon="🥦"
                title="AI 영양사의 조언"
                color="text-green-400"
              />

              <p className="text-slate-200 leading-relaxed">
                {recommendations.initial_summary}
              </p>

              {/* 추천 영양성분 */}
              {recommendations.recommendedIngredients?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                    추천드리는 영양 성분
                  </p>

                  <p className="text-slate-200 leading-relaxed">
                    {recommendations.recommendedIngredients.join(", ")}
                  </p>
                </div>
              )}
            </Card>

            {/* 2. 최적의 상품 추천 */}
            <Card>
              <div className="flex justify-between items-start">
                <CardTitle
                  icon="💊"
                  title="최적의 상품 추천"
                  color="text-white"
                />
              </div>

              <div>
                <h4 className="text-2xl font-black text-green-400">
                  {recommendations.finalRecommendation?.name}
                </h4>

                <p className="text-lg text-slate-300 mt-2">
                  💰 {recommendations.finalRecommendation?.price} KRW
                </p>
              </div>

              {/* 구매 버튼 */}
              <a
                href={recommendations.finalRecommendation?.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-4 rounded-2xl bg-green-500 text-black font-black hover:scale-[1.02] transition"
              >
                구매 페이지로 이동 →
              </a>

              <div
                className={`mt-4 p-3 rounded-xl border-transparent text-sm ${
                  recommendations.availabilityStatus === "available"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {recommendations.availabilityStatus === "available"
                  ? "✅ 현재 구매가 가능합니다!"
                  : "⚠️ 현재 품절인 것으로 추측됩니다. 그래도 모르니 아래 링크에서 확인해보세요."}
              </div>

              {/* 추천 이유 */}
              <InfoBlock label="<추천 이유>">
                {recommendations.selectionRationale}
              </InfoBlock>

              {/* 주의사항 */}
              {recommendations.optimizationWarning && (
                <InfoBlock label="<주의사항>" highlight>
                  {recommendations.optimizationWarning}
                </InfoBlock>
              )}
            </Card>

            {/* 3. 안전할까요 */}
            <Card>
              <CardTitle icon="🛡️" title="안전할까요?" color="text-blue-400" />

              <p className="text-sm text-slate-400 leading-relaxed">
                고객님의 안전을 위해 해당 상품이 알러지, 나이, 복용 약에 대해
                안전한지 체크해봤어요!
              </p>

              <div className="text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                {recommendations.verification?.replace(/(\d+\.)/g, "\n$1")}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
