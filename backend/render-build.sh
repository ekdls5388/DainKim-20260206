#!/usr/bin/env bash
set -o errexit

# 1. 패키지 설치
npm install

# 2. 설치된 puppeteer 바이너리에 실행 권한(+x)을 직접 부여
chmod +x ./node_modules/.bin/puppeteer

# 3. 브라우저 설치 실행
./node_modules/.bin/puppeteer browsers install chrome