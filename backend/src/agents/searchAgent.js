const { naverShoppingService } = require("../services/naverSearchService");

/**
 * Search Agent: 네이버 쇼핑 API를 통해 제품 정보를 수집합니다.
 * @param {Array} searchQueries
 * @returns {Promise<Array>}
 */
const searchAgent = async (searchQueries) => {
  console.log("Search Agent 시작: 수신된 쿼리들 -", searchQueries);
  let allProducts = [];

  for (const query of searchQueries) {
    try {
      console.log(`[탐색 중] 키워드: "${query}"...`);

      // 네이버 쇼핑 서비스 호출
      const naverResults = await naverShoppingService.search(query);

      if (naverResults && naverResults.length > 0) {
        console.log(
          `[성공] "${query}" 쿼리로 ${naverResults.length}개의 상품을 찾았습니다.`,
        );
        // 모든 결과를 하나의 배열로 병합
        allProducts = [...allProducts, ...naverResults];
      } else {
        console.warn(`[주의] "${query}"에 대한 검색 결과가 없습니다.`);
      }
    } catch (error) {
      console.error(`[에러] "${query}" 처리 중 문제 발생:`, error.message);
      // 특정 쿼리가 실패해도 다음 쿼리를 계속 진행하도록 예외 처리
    }
  }

  // 중복된 상품 제거 (productId가 있다면 그것으로, 없다면 link 기준)
  const uniqueProducts = allProducts.filter(
    (product, index, self) =>
      index === self.findIndex((p) => p.link === product.link),
  );

  console.log(
    `Search Agent 완료: 총 ${uniqueProducts.length}개의 고유 상품 수집됨.`,
  );

  return uniqueProducts;
};

module.exports = searchAgent;
