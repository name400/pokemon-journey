# 두 번째 연속 구현 검증 묶음

기준11be862. 검증된 스냅샷과 후속 개발 작업 트리를 분리해 작업을 이어갔다. 이 커밋에는 완료된 아래 내용만 포함하며, 후속 활성 폼 도구 상태 모델/새 호출 후보 정책/일반폼 이미지 확장은 별도 작업 중이다.

- 융합·진화: source 조건과 목적 폼을 대조해 544 진화 edge의 알려진 조건/허용폼 누락을 연결했다. 허용341/비기본416은 권한 메타데이터 수치이며 전 효과 실행 검증 수치가 아니다. 일반95폼의 양역할190조합과 기존 donor213폼의 실제 보상·전투·codec·분리를 검사했다. source ability enum8개 오매핑을 고치고 무표식 기존 명시 능력은 유지한다.
- 자동 폼: Zen Mode2종, Schooling, Shields Down7색, Forecast, Flower Gift, Stance Change, Zero to Hero, Disguise, Ice Face를 전투·초기화·NoFusion·저장에 연결했다. 패시브가 바뀌는 폼은 oldEnd→교체→newStart 및 억제/가스/기절을 검사했다.
- 도구: Leftovers/ShellBell의 중복·혼합 native 거래와 보상·자동지급·수동이전·전투theft/Grip/BH/Pickup cap을 연결했다. 과거 과다 보유를 삭제하지 않는다. 다른 의미의 native 도구를 임의 등가변환하지 않는다.
- 이벤트: 검토된 native 일반 효과134종을 새 도전의 꿈 변환/대체전투에 허용한다. 기존18종은 이전 저장에 유지, 폼/특수·미검토 종족종속/현재카탈로그밖 항목은 계속 거부한다. 전체587항목에 이유를 남긴 정책과 원본 native data 해시를 보관했다.
- 전투: Nature Power35바이옴/4지형, 호출·Dancer의 전투별위력/flag전달을 연결했다. 기존 무룰 저장은 유지한다.
- AI: 새 도전의 source matchup 산식·일반3배/보스2배 교체·연속교체counter·동점 seed offset을 연결했다. 공격 점수/대상/능력·노출·필드의 전체 원본 동등성은 미완료다. 당시 기본 chart adapter 범위와 후속 보완을 구분한다.
- 자산: 원본96Mega+37변신폼, 대응하는 양면/일반이로치/색변종·파트너 초상을 연결했다. 메가1552·대표융합88, 변신592, 파트너6화면 및404fallback을 검증했다. 원본 바이트/출처 고지를 보존하며 보호된 원본 비활성/적전용폼을 일반 융합에 열지 않는다.

## 검증 경계

분리 스냅샷의 표준 전체938/938(419.4초), Worker 전체938/938(422.9초), 타입·production빌드 통과. 이후 동일 native instance의 왕복 폼 상태 기록 순서 한 곳을 보정하고, 자동폼/패시브/새왕복25/25를 표준·Worker 각각 통과했다. 마지막 타입·production빌드도 통과했다. 941개 전체를 돌렸다고 합산하지 않는다.

초기 전체의 유일한 실패는 기존 donor폼수68 고정 기대값이었고, 확장된213개를 정확히 검증하며 전213개의 실제 경로를 다시 실행했다. 패시브 변경 후 native binding 불일치는 실제 복구 차단으로 재현·수정했다. 동적 패시브31개 검사와 마지막 왕복25개는 의미 있는 후속 검증이다.

로그: /tmp/round2-check-final-{full,worker,type,build}.log, /tmp/round2-check-form-order{,-worker}.log, /tmp/round2-check-order-{type,build}.log. 검증 작업 트리는 /tmp/pokerogue-round2-check. 진행 중 lib/rogue-transformations.mjs와 rogue-form-item-state.mjs 변경은 이 묶음에서 제외했다. 다음 작업은 계속 진행한다. 전체원본수치/효과/난수 동등성·자연200층·실기기·운영409/PC끊김의 실제 원인 확정은 별도다. Sites와 운영 저장은 변경하지 않는다.


## 원본 고지 메타데이터 정리

추가 Mega/변신 provenance의 원본 REUSE path 목록 반복을 제거해 두 파일 합계약142MB를약493KB로 줄였다. 전체원본 REUSE.toml은고정바이트/SHA로한번보존하며각asset은annotation index와동일SPDX고지·일치한path만기록한다. 이미지/atlas원본바이트나작성자/라이선스고지는삭제하지않았다. 정규화후R2자산집중10/10통과,크레딧소비자출력계약유지. source CRLF와hash를보존하는gitattributes만추가했다. /tmp/normalized-attribution-r2{,-tests}.log가근거다.
