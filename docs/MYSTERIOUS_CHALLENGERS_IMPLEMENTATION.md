# 원본 도전자 이벤트 연결 기록

이 문서는 제공 ZIP의 소스에서 확인한 규칙과 현재 연결 상태를 구분한다. 현재 이벤트가 플레이에 노출됐다는 문서가 아니다.

## 확인한 원본
- src/data/mystery-encounters/encounters/mysterious-challengers-encounter.ts
- src/data/mystery-encounters/mystery-encounter-biomes.ts
- src/data/mystery-encounters/utils/encounter-phase-utils.ts
- src/field/arena.ts randomTrainerType, src/battle-scene.ts applyPartyExp

## 이벤트의 원본 규칙
- GREAT 등급, 인간 활동이 있는 바이옴의 일반 이벤트 후보. 일반/어려움/극악 세 선택지이며 이탈 선택지는 없다.
- 일반은 바이옴의 일반 트레이너. 어려움은 다른 일반 트레이너를 최대 5회 재추첨해 선택하며 선두 STRONGER 1마리와 AVERAGE 균형 파티 min(ceil(wave/20),5)마리로 구성한다.
- 극악은 바이옴의 보스 트레이너를 ELITE_FOUR 템플릿으로 구성하며 기존 관장 템플릿 함수를 덮어쓴다.
- 어려움의 levelAdditiveModifier는 1, 극악은 1.5. 실제 가산은 max(round(wave/10*modifier),0)이다. 최신 지시로 포켓로그의 임의100레벨 제한은 철회됐으므로 가산 후 레벨을100으로 자르지 않는다.
- doubleOnly는 더블로 진행한다. 그 외 일반 클래스의 무작위 더블 추첨을 추가하지 않는다. 원본은 초기 후보 구성에서 성별을 정하고 선택 후 팀 생성에 별도 시드 오프셋 wave*10/100/1000을 사용한다.
- 일반 보상은 TM_COMMON, TM_GREAT, MEMORY_MUSHROOM을 보장하고 나머지 선택 수를 채운다. 어려움은 [ULTRA,ULTRA,GREAT,GREAT], 극악은 [ROGUE,ROGUE,ULTRA,GREAT] 등급을 보장한다. 한 가지 보상을 선택하는 절차다.
- 원본은 극악 선택 때 expMultiplier=0.9를 설정한다. 다만 실제 applyPartyExp에서는 TRAINER_BATTLE의 1.5배 분기가 먼저 적용되고 미스터리 배율은 else-if이다. 의도 주석만 보고 트레이너 경험치에 임의 0.9배를 추가하지 않는다. 실제 원본 실행 경로를 검사할 필요가 있다.

## 현재 구현한 공용 부분
- 미스터리 레벨 보정을 classicMysteryLevelAdditive로 연결하고, 기존 ‘트레이너의 시험’의 평면 +1을 원본의 웨이브 비례 가산으로 수정했다. 현재 저장된 진행 중 전투의 레벨을 소급 변경하지 않는다.
- 기억버섯은 이미 공용 서비스/무료 보상 처리에 구현되어 있었다. 상점 해금 전 무료 보상 사용, 기술3개일 때 네 번째 칸 추가, 돈 미소비, 잘못된 기술 거절 및 파티 보존 검사를 추가해 이벤트 보상에서 재사용 가능한 경로를 확인했다. 별도의 중복 기억버섯 구현은 추가하지 않았다.

## 남은 이벤트 연결
1. 원본 바이옴 후보 추첨과 세 트레이너/성별 설정을 저장하고, 선택 전에는 원본처럼 실루엣/난이도로 제시.
2. 파티 템플릿 덮어쓰기 및 선택별 시드 오프셋을 공용 트레이너 생성기로 연결.
3. 선택·취소·확인, 실제 배틀 진입, 기절/승패, 원본 대화 및 재접속을 연결.
4. 원본 보장 보상·추가 선택 수·리롤·학습 처리와 경험치의 실제 원본 분기를 검증.
5. 위 경로가 연결되기 전에 후보 목록이나 UI에 구현된 이벤트로 표시하지 않는다.

## 원본 비활성 이벤트
AN_OFFER_YOU_CANT_REFUSE는 mystery-encounter-biomes.ts에서 Disabled로 주석 처리되어 있다. 개별 이벤트 파일이 있다는 이유만으로 일반 플레이에 활성화하지 않는다. BERRIES_ABOUND 등 다른 후보도 원본의 활성 여부를 직접 확인해야 한다.
