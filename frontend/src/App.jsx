import { useState } from "react";
import "./App.css";

// Icons for verification status
const StatusIcon = ({ status }) => {
  switch (status) {
    case "Safe":
      return (
        <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold mr-2">
          SAFE ✅
        </span>
      );
    case "Caution":
      return (
        <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-bold mr-2">
          CAUTION ⚠️
        </span>
      );
    case "Avoid":
      return (
        <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold mr-2">
          AVOID ❌
        </span>
      );
    default:
      return null;
  }
};

function App() {
  const [healthGoal, setHealthGoal] = useState("");
  const [diseases, setDiseases] = useState("");
  const [budget, setBudget] = useState("price_50000_100000"); // Default budget
  const [allergies, setAllergies] = useState("");

  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRecommend = async () => {
    setLoading(true);
    setError(null);
    setRecommendations(null); // Clear previous recommendations

    const userInput = {
      health_goal: healthGoal,
      diseases_diagnoses: diseases,
      budget_range: budget,
      medications_allergies: allergies,
    };

    try {
      // For local development, assuming backend runs on 3001
      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(`${API_BASE_URL}/api/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userInput),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log("Received recommendations:", data);
      setRecommendations(data);
    } catch (e) {
      setError("Failed to fetch recommendations: " + e.message);
      console.error("Error fetching recommendations:", e);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return healthGoal.trim() !== "";
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-green-400 mb-4">
            내 손안의 영양 전략팀
          </h1>
          <p className="text-slate-400 text-lg">
            AI 에이전트 협업 시스템이 당신의 최적 영양제 조합을 설계합니다.
          </p>
        </div>

        {/* Form Section */}
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-6 rounded-3xl mb-12 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="healthGoal"
                className="text-sm font-bold text-slate-400 uppercase ml-1 block"
              >
                가장 중요한 건강 목표는 무엇인가요?{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="healthGoal"
                className="w-full p-4 bg-slate-900 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none placeholder-slate-500"
                placeholder="예: 만성 피로 개선, 갱년기 증상 완화"
                value={healthGoal}
                onChange={(e) => setHealthGoal(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="diseases"
                className="text-sm font-bold text-slate-400 uppercase ml-1 block"
              >
                현재 앓고 있는 질병이나 진단받은 건강 문제가 있나요?
              </label>
              <input
                type="text"
                id="diseases"
                className="w-full p-4 bg-slate-900 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none placeholder-slate-500"
                placeholder="예: 고혈압, 당뇨 (없으면 공란)"
                value={diseases}
                onChange={(e) => setDiseases(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="budget"
                className="text-sm font-bold text-slate-400 uppercase ml-1 block"
              >
                제품당 가격 범위 (2개월분 기준)를 선택해주세요.
              </label>
              <select
                id="budget"
                className="w-full p-4 bg-slate-900 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none text-slate-300"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              >
                <option value="price_under_30000">30,000원 이하</option>
                <option value="price_30000_50000">30,000원 ~ 50,000원</option>
                <option value="price_50000_100000">50,000원 ~ 100,000원</option>
                <option value="price_over_100000">100,000원 이상</option>
                <option value="unlimited">상관 없음</option>
              </select>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="allergies"
                className="text-sm font-bold text-slate-400 uppercase ml-1 block"
              >
                복용 중인 약물이나 알레르기가 있나요?
              </label>
              <textarea
                id="allergies"
                className="w-full p-4 bg-slate-900 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none placeholder-slate-500 resize-none"
                rows="3"
                placeholder="예: 혈압약 복용 중, 해산물 알레르기 있음"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              ></textarea>
            </div>
          </div>
          <button
            onClick={handleRecommend}
            disabled={loading || !isFormValid()}
            className="w-full mt-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "에이전트들이 분석 중입니다..."
              : "최적 영양제 조합 찾기"}
          </button>
        </div>

        {error && (
          <div className="bg-red-800/50 border border-red-700 p-4 rounded-xl mb-8 text-red-300">
            <p className="font-bold">오류 발생:</p>
            <p>{error}</p>
          </div>
        )}

        {recommendations && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
            {/* 1. Supervisor Card */}
            <div className="bg-slate-800 border-l-4 border-indigo-500 p-6 rounded-r-3xl shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🧠</span>
                <h3 className="text-xl md:text-2xl font-bold text-indigo-300">
                  AI 약사의 조언
                </h3>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-indigo-500/10 mb-4">
                <p className="text-slate-200 leading-relaxed whitespace-pre-wrap italic text-lg">
                  "{recommendations.initialRecommendation}"
                </p>
              </div>
              {/* 1. Supervisor Card 내부의 추천 성분 부분 */}
              <div className="mt-6">
                <div className="flex items-center mb-3">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">추천 핵심 성분</span>
                  <div className="flex-grow ml-4 h-[1px] bg-slate-700"></div>
                </div>
                
                {/* 📍 flex-wrap과 gap-3으로 성분 간의 거리를 확실히 벌립니다 */}
                <div className="flex flex-wrap gap-3">
                  {recommendations.recommendedIngredients && Array.isArray(recommendations.recommendedIngredients) ? (
                    recommendations.recommendedIngredients.map((ingredient, index) => (
                      <span 
                        key={index} 
                        className="px-4 py-2 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded-xl text-sm font-bold shadow-sm transition-transform hover:scale-105"
                      >
                        {ingredient}
                      </span>
                    ))
                  ) : (
                    // 데이터가 배열이 아닐 경우를 대비한 안전장치
                    <span className="text-slate-400 italic">성분 데이터를 분석 중입니다...</span>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Optimizer Card */}
            <div className="bg-slate-800 border-l-4 border-emerald-500 p-6 rounded-r-3xl shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🏆</span>
                <h3 className="text-xl md:text-2xl font-bold text-emerald-400">
                  최적 제품 선택
                </h3>
              </div>
              {recommendations.finalRecommendation && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/50 p-5 rounded-2xl border border-emerald-500/10">
                  <div className="space-y-3">
                    <p className="text-xl font-bold text-white line-clamp-2">
                      {recommendations.finalRecommendation.name}
                    </p>
                    <p className="text-3xl font-mono text-emerald-400 font-bold">
                      {recommendations.finalRecommendation.price}
                    </p>
                    {recommendations.finalRecommendation.link && (
                      <a
                        href={recommendations.finalRecommendation.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-white text-slate-900 px-6 py-2 rounded-xl font-bold text-sm hover:bg-slate-200 transition"
                      >
                        제품 구매 페이지로 이동
                      </a>
                    )}
                  </div>
                  <div className="space-y-6"> {/* 전체 섹션 간의 여백을 넉넉히 줍니다 */}
  
                    {/* 1. 선택 사유 섹션 */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-emerald-500 uppercase flex items-center gap-1">
                        💡 선택 사유
                      </span>
                      {/* 배경색과 패딩을 살짝 주어 내용 영역을 구분합니다 */}
                      <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/50">
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {recommendations.selectionRationale}
                        </p>
                      </div>
                    </div>

                    {/* 2. 추가 주의 사항 섹션 */}
                    {recommendations.optimizationWarning && (
                      <div className="space-y-2 pt-2 border-t border-slate-800/50">
                        <span className="text-xs font-bold text-yellow-500 uppercase flex items-center gap-1">
                          ⚠️ 추가 주의 사항
                        </span>
                        <p className="text-xs text-yellow-400/80 leading-relaxed pl-1">
                          {recommendations.optimizationWarning}
                        </p>
                      </div>
                    )}
                    
                  </div>
                </div>
              )}
            </div>

            {/* 3. Verifier Card */}
            <div className="bg-slate-800 border-l-4 border-amber-500 p-6 rounded-r-3xl shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🛡️</span>
                <h3 className="text-xl md:text-2xl font-bold text-amber-300">
                  안전성 정밀 검증
                </h3>
              </div>
              <div className="bg-slate-900/50 p-5 rounded-2xl border border-amber-500/10">
                <div className="mb-2">
                  <StatusIcon
                    status={recommendations.verificationStatus || "Safe"}
                  />
                </div>
                <p className="text-slate-300 leading-relaxed text-sm">
                  {recommendations.verification}
                </p>
              </div>
            </div>

            {/* 4. Search Logs */}
            <details className="group">
              <summary className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl cursor-pointer hover:bg-slate-800/50 transition">
                <span className="text-slate-500 font-bold text-sm uppercase">
                  🔍 검색된 다른 제품들도 살펴보세요!
                </span>
                <span className="text-slate-500 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="p-4 space-y-2 bg-slate-900/30 mt-2 rounded-2xl overflow-hidden">
                {recommendations.rawProducts?.map((p, i) => (
                  <div
                    key={i}
                    className="text-xs text-slate-500 border-b border-slate-800 pb-1 flex justify-between"
                  >
                    <span className="truncate mr-4">{p.name}</span>
                    <span className="whitespace-nowrap font-mono">
                      {p.price}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
