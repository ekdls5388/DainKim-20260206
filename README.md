# 호스팅된 URL
> https://nutri-agent-name-git-main-dains-projects-8647354e.vercel.app/

# 💊 AI Nutri-Agent Team (내 손안의 영양 전략팀)

> **"결국 뭘 사야 할지 모르겠다"는 고민을 "이것을 사면 되겠구나"라는 명확한 답으로.**

## 🎯 Project Overview
수많은 영양제 정보 속에서 사용자가 겪는 결정 장애를 해결하기 위해 기획된 **AI 에이전트 협업 시스템**입니다. 본 MVP는 인지적 노동을 간소화하고, 명확한 제약 조건(약물 상호작용, 알레르기)을 수행하여 사용자에게 최적의 제품 1종을 제안하는 것에 집중합니다.

## 🚀 Key Points
**본 프로젝트는 로컬 개발 환경에서 모든 핵심 로직이 성공적으로 작동함을 증명하였으나, 배포 과정에서의 오류로 인해 정상적인 호스팅에 실패하였습니다. 부디 이를 헤아려 로컬 환경에서의 성능을 평가해주시면 감사하겠습니다.**

* **Local Stability**: 로컬 리소스를 활용한 Puppeteer 브라우저 제어를 통해 iHerb 실시간 검색 및 데이터 추출 성공.
* **Agent Synergy**: Supervisor부터 Verifier까지 이어지는 4단계 에이전트 워크플로우의 정합성 확인.
* **Real-time Data**: 제품명, 가격, 영양 성분 정보를 누락 없이 수집하여 최적화 엔진으로 전달.

## 🤖 Agent Workflow & Architecture
사용자의 인지적 부하를 줄이기 위해 4개의 특화된 에이전트가 협업합니다. 
1. **Supervisor Agent (분석)**
   - 사용자의 건강 목표, 질병 이력, 예산을 분석하여 필요한 핵심 성분 TOP 3를 선정합니다. 
2. **Search Agent (검색)**
   - 선정된 성분을 바탕으로 iHerb에서 실제 구매 가능한 제품 리스트를 실시간으로 수집합니다.
3. **Optimizer Agent (최종 가성비 One 선택)**
   - 수집된 제품 중 가성비와 성분 함량을 비교하여 최적의 제품 1종을 최종 선정합니다. 
4. **Verifier Agent (Compliance)**
   - 선정된 제품이 사용자의 복용 약물 및 알레르기와 충돌하는지 검증하고 주의사항을 제공합니다.


## 🛠 Tech Stack
- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **AI Engine**: OpenAI API (GPT-4o)
- **Automation**: Puppeteer (Stealth Plugin)
- **Deployment**: Render (Backend), Vercel (Frontend)


## 🚧 Challenges & Technical Hurdles (배포 한계점)

1. **클라우드 환경의 브라우저 실행 제어**
   - **문제**: Render(Linux) 서버 환경에서 Puppeteer 구동을 위한 Chrome 설치 및 권한 설정(`chmod`) 과정에서 시스템 제약 발생.
   - **원인**: 프리 티어의 리소스 제한(RAM 512MB) 및 호스팅 인프라의 보안 정책으로 인한 브라우저 인스턴스 실행 차단.
2. **크롤링 엔진 고도화의 한계**
   - **문제**: 서버 환경에서 iHerb의 보안 엔진 및 동적 렌더링을 대응하며 제품 상세 링크를 수집하는 데 어려움을 겪음.
   - **교훈**: 애플리케이션 로직만큼이나 **인프라(DevOps) 환경 설정**이 중요함을 깨달았으며, 향후 Docker를 통한 환경 격리의 필요성을 인지하였습니다.
