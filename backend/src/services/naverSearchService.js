const axios = require("axios");
require("dotenv").config();

// 네이버 API 키 설정
const NAVER_CLIENT_ID = process.env.NAVER_API_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_API_KEY;

if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
  console.error("Missing NAVER_CLIENT_ID or NAVER_CLIENT_SECRET in .env file.");
}

const naverShoppingService = {
  /**
   * 네이버 쇼핑 검색 수행
   * @param {string} query - 검색어 (예: "코엔자임 Q10")
   * @returns {Promise<Array>} 정제된 상품 목록 배열
   */
  search: async (query) => {
    // 1. API 키가 없을 경우 방어 코드 (Mock 데이터 반환)
    if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
      console.warn("Naver API credentials not set. Returning mock results.");
      return [
        {
          title: `[Mock] ${query} 추천 상품`,
          link: "https://search.shopping.naver.com/",
          image: "https://via.placeholder.com/150",
          lprice: "15000",
          brand: "MockBrand",
          mallName: "네이버쇼핑",
        },
      ];
    }

    try {
      // 2. 네이버 쇼핑 API 호출
      const res = await axios.get(
        "https://openapi.naver.com/v1/search/shop.json",
        {
          params: {
            query: query,
            display: 5, // 결과 5개 출력
            sort: "sim", // 유사도순 정렬
          },
          headers: {
            "X-Naver-Client-Id": NAVER_CLIENT_ID,
            "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
          },
        },
      );

      // 3. 응답 데이터 정제 (Mapping)
      if (res.data.items && res.data.items.length > 0) {
        return res.data.items.map((item) => ({
          title: item.title.replace(/<[^>]*>?/gm, ""),
          link: item.link,
          image: item.image,
          lprice: item.lprice, // 최저가
          brand: item.brand, // 브랜드
          maker: item.maker, // 제조사
          mallName: item.mallName, // 판매처
          category: `${item.category3} > ${item.category4}`, // 카테고리 요약
        }));
      }

      return [];
    } catch (error) {
      console.error(
        "Error calling Naver Shopping API:",
        error.response ? error.response.data : error.message,
      );
      // 에러를 던져서 상위 에이전트(Search Agent)가 인지하게 함
      throw new Error("네이버 쇼핑 검색에 실패했습니다.");
    }
  },
};

module.exports = { naverShoppingService };
