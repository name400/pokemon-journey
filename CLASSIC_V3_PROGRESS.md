> 최신 상태: 이 문서는 시간순 작업 기록이다. 아래의 2026-11-03 알 부화·전설 픽업·교환권 보상·스타터 패시브 추가 기록이 과거의 수동 부화·미구현 메모보다 우선한다. 이 변경들은 아직 검증·배포되지 않았다. 원작과 완전히 같다고 판단하지 않는다.

## 현재 이어서 할 작업 (2026-11-03)

- 사용자 요청으로 보상 선택 후 별도의 웨이브 출발 화면을 거치지 않고 다음 전투로 진행하도록 변경했다. 기술 학습·알 부화가 남아 있으면 먼저 처리하고, 10층 경계의 회복과 지도 선택은 유지한다. 기존 `advance`/`interlude` 저장도 자동으로 이어지며 실패 시 재시도 버튼을 표시한다. 실행 테스트와 저장 재개 확인은 아직 하지 않았다.
- 스타터 선택 화면에서 높이가 짧은 화면과 521–991px 너비에도 화면 틀·파티·출발 버튼이 보이도록 배치를 조정했다. 긴 목록과 상세 옵션은 화면 안쪽에서 스크롤하며, 모든 세부 옵션이 동시에 표시되는 것은 아니다. 실기기 화면 확인은 아직 하지 않았다.
- 전투 승리 결과를 압축하고 보상 선택·대상 지정 화면을 한 화면의 좌우 영역으로 재배치했으며, 보급품 목록은 기본으로 접었다. 타입 검사는 통과했으나 여러 해상도와 긴 기술 설명의 실제 표시·조작은 아직 확인하지 않았다.
- 이후 사용자 요청에 따라 보상 선택 아래에 리롤과 회복 도구를 배치하고, 대상 지정은 작은 화면 내 대화상자로 변경했다. 회복 도구·대화상자 글자와 이미지는 다시 키웠다. 화면 크기별 배치와 키보드 포커스는 아직 검증하지 않았다.
- 타입 심볼은 PokéAPI가 보관한 스칼렛/바이올렛 게임 심볼을 사용하며 실패 시 대체 표기를 한다. 기술에는 타입 기준 배율, 더블배틀에는 상대별 배율을 표시하고 특수 타입 계산이 필요한 기술은 불확실하다고 표기한다. 능력치 변화는 서버 상태와 주요 변화 이벤트를 기반으로 현재 랭크와 증감 로그를 표시한다. 개별 특성·도구 면역 및 모든 특수 이벤트의 완전한 표시 여부는 미검증이다.
- 프리즈드라이·플라잉프레스·사우전드애로 및 잠재파워·웨더볼·대지의파동은 현재 전투의 타입/날씨/필드를 반영해 타입 기준 배율을 계산한다. 노말스킨 등 단일 타입 변환 특성도 일부 반영한다. 선택 예정 테라스탈과 여러 특성 충돌, 상대의 숨은 특성/도구 등은 일반 타입 배율에 포함되지 않을 수 있다. 실제 전투와 비교는 아직 하지 않았다.
- 상대가 일루전으로 다른 포켓몬처럼 보이는 동안 상성 미리보기가 드러나지 않은 실제 종 대신 보이는 모습의 타입을 사용하도록 했다. 일루전 해제·변신 및 재생 중 전환은 아직 테스트하지 않았다.
- 변화 기술 중 타입 면역을 적용하는 전기자석파는 무효인 상대에게 `효과 없음`을 표시한다. 숨겨진 특성이나 도구 면역을 미리 노출하지 않으므로 이 표시는 타입 기준이다.
- 테라버스트는 테라스탈 선택 시 일반 타입의 경우 선택한 테라 타입 아이콘과 상대별 타입 배율을 미리 표시하고, 이미 테라스탈한 경우에도 현재 테라 타입을 사용한다. 스텔라 테라 등 계산이 불확실한 경우에는 상성 정보를 단정하지 않는다. 실행 검증은 아직 하지 않았다.
- 웨이브의 전투 메시지를 서버 저장에 누적하고 전투 로그 안에서 스크롤하도록 변경했다. 이전 버전에서 이미 사라진 메시지는 복구할 수 없다. 저장 재개·더블배틀·긴 로그의 동작은 아직 검증하지 않았다.
- 전투 기록에 HP 동시 변경, 양쪽 필드 효과, 날씨 지속, 능력치 초기화/교환/복사와 테라스탈 타입 메시지를 추가했다. 표시 가능한 이벤트를 확장한 것이며 시뮬레이터 내부의 모든 이벤트가 번역된 것은 아니다.
- 사용자 요청으로 포켓로그 전투 로그의 남은 HP 숫자는 표시하지 않으며, 과거 형식으로 이미 저장된 같은 웨이브 메시지도 화면에서 숫자를 숨긴다. 전장의 실제 HP 바와 수치는 유지한다. 실제 표시 확인은 남았다.
- 이후 요청에 따라 회복 도구를 보상 아래 격자로 나열하고 리롤을 보상 바로 아래에 배치했다. 대상 선택 대화상자와 회복 도구 이미지·글자를 확대했다. 전장 개별 작가 표시는 제거하고 별도의 게임 안내 작가 목록에 출처를 보관한다. 여러 화면 크기의 실제 동작은 미검증이다.
- 보상 하단의 불필요하게 늘어난 행을 줄이고, 큰 화면에는 파티 체력 요약을 표시한다. 기술/체력 카드 타입 이미지는 원본 크기가 아닌 고정 크기로 제한했다. 로컬에서 사용자가 지적한 배치에 대한 변경이며 실제 화면 재확인은 남았다.
- 보상 패널이 남는 화면 높이 전체를 강제로 차지해 하단이 비는 문제를 줄이도록 내용에 맞는 높이로 변경했다. 화면이 짧거나 도구가 많으면 내부 스크롤을 허용하며, 실제 기기 화면은 아직 확인하지 않았다.
- 테라스탈 선택을 명령 화면에서도 제공하고, 전장 아래에 보유한 중요 도구와 현재 파티의 부적·지닌 도구를 표시했다. 실제로 사용할 수 있는 테라스탈만 선택 가능하며, 다른 변신 도구는 보유 표시다. 목록이 길면 가로 스크롤한다. 표시·사용 흐름은 아직 검증하지 않았다.
- 중요 도구의 원격 이미지가 없을 때 팔찌·밴드·오브를 구별할 수 있는 프로젝트 제작 대체 아이콘을 사용한다. 이미지 접근성과 실제 표시 여부는 미검증이다.
- 최근 로그·보상·도구 목록 변경 뒤 JavaScript 구문 검사와 TypeScript 검사는 통과했다. 실제 전투·DB·모바일 상호작용 테스트는 수행하지 않았다.
- 로컬 UI 수정 시 전투·보상·스타터 편성·기술 학습 컴포넌트가 매번 다시 만들어지는 원인을 줄이기 위해 순수 계산 함수를 별도 모듈로 분리했다. 기존 내보내기는 유지하며 타입 검사는 통과했다. 분리 순간의 리로드는 발생했고, 이후 전투 컴포넌트 갱신 로그에서는 이전의 내보내기 호환성 경고가 나타나지 않았다. 실제 입력 보존 여부는 아직 검증하지 않았다.
- 보상 대화상자에서 오류가 발생하면 배경이 아닌 대화상자 안에 표시하고, 긴 보상 화면 하단의 여백에는 큰 화면에서 현재 파티 HP 요약을 보여 준다. 해당 레이아웃과 오류 상황은 미검증이다.
- 전투 로그는 키보드 포커스와 내부 스크롤을 지원하며, 재생 중에는 이전 턴 기록과 이미 재생된 메시지만 보여 주도록 했다. 내용 보존·화면 스크롤·복원은 실제 플레이 검증 전이다.
- 제공된 원작 포획 처리와 비교해 급소 포획 실패도 볼이 한 번 흔들린 뒤 실패하도록 결과의 연출 횟수를 수정하고 급소 포획 표시를 추가했다. 볼 확률이나 실제 애니메이션은 아직 테스트하지 않았다. 원작에서 럭셔리볼은 현재 사용하지 않는 데이터로 확인되어 클래식 선택지에 추가하지 않았다.
- 포획 시 상태 보너스를 잠듦·얼음과 독·맹독·마비·화상에만 적용하도록 명시했다. 알 수 없는 상태 문자열에 자동으로 보너스를 주지 않는다. 실행 테스트는 아직 하지 않았다.
- 원작 마스터 등급의 빛나는부적을 보상에 추가하고, 보유 개수에 따라 야생 색이 다른 모습 확률이 증가하도록 연결했다(최대 4개). 원작 RNG 시드 순서 및 실제 확률·보상 획득은 아직 검증하지 않았다.
- 마스터 등급 회복부적을 추가하고 일반 전투 HP 회복과 보급 도구의 고정 회복량에 중첩당 10%를 적용했다(최대 5개, 부활 제외). Liquid Ooze로 회복이 피해로 바뀌는 경우의 계산 순서도 일부 반영했다. 특성·날씨·회복 방해 및 반올림을 포함한 이벤트 순서의 원작 일치 여부는 미검증이다.
- 파티가 아는 공격 기술의 타입을 가중 추첨해 목탄·자석 등 타입 강화 도구를 보상으로 제공하고, 선택한 보유자의 해당 타입 위력 증가와 연결했다. 심판의뭉치·멀티어택·테크노버스터·오라휠·레이징불·덩굴방망이와 잠재파워·잠재댄스·테라버스트의 일부 후보 계산을 반영했다. 나머지 가변 타입 및 특성의 후보 계산과 실제 대미지·전달·중첩은 아직 검증하지 않았다.
- 타입 강화 도구 후보에 노말스킨·프리즈스킨·페어리스킨·스카이스킨·일렉트릭스킨·리퀴드보이스와 드래고나이즈의 일부 타입 변경 규칙을 추가했다. 가변 타입 기술 예외와 일반/패시브 특성의 처리 순서는 원작을 참고했으나 실제 전투와의 조합은 아직 검증하지 않았다.
- 루어·슈퍼루어·맥스루어 보상과 각 10/15/30전 지속, 동종 재획득 시 갱신, 전투 종료/도망 시 감소, 남은 횟수 표시 및 일반 야생·가능한 일반 트레이너의 더블배틀 확률 증가를 추가했다. 출전 중인 발광·개미지옥·노가드·사령탑 및 패시브의 확률 변화도 일부 연결했다. 보스 야생 더블배틀은 아직 연결되지 않았고, 특성 억제의 모든 예외 및 보상·지속 시간·저장 재개는 테스트하지 않았다.
- 진화한 스타터가 기억버섯을 사용할 때 해금된 알 기술을 진화 후 종이 아닌 스타터 계열의 등록 정보에서 찾도록 수정했다. 실제 학습과 저장 재개의 동작은 아직 테스트하지 않았다.
- 상세 스타터 목록이 필요 없는 전투 응답에서는 전체 스타터의 능력치·기술 목록을 생성하지 않고 해금된 종 수만 계산하도록 분리했다. 성능 측정과 기존 저장별 숫자 비교는 아직 하지 않았다.
- 최종 보스 포획 조건에 사용하는 스타터 종 목록을 모듈에서 한 번만 구성하도록 변경했다. 실제 성능 수치는 측정하지 않았다.
- 트레이너 등장 화면에 가려진 채 보스 등장 알림이 끝날 수 있던 순서를 바꿔, 트레이너 연출이 끝난 뒤 보스 알림이 나타나게 했다. 실제 연출 재생은 아직 테스트하지 않았다.
- 원작 엔드 지역의 포획 기록 제한을 서버와 포획 버튼 조건에 추가하고, 최종 보스 조건은 고정 숫자 대신 현재 스타터 데이터 개수에서 계산하도록 수정했다. 사용자가 요청한 더블배틀 포획 대상 선택은 유지한다. 엔드 지역의 싱글·더블 및 기존 저장은 아직 테스트하지 않았다.
- 포획이 불가능한 트레이너전·엔드 지역·최종 보스전에서는 명령창에 이유를 표시하도록 연결했다. 실제 레이아웃과 판정 일치 여부는 아직 확인하지 않았다.
- 포켓로그 색이 다른 모습의 앞·뒤 이미지 선택에서 일반색 전용 이미지를 우선 사용하던 경로를 수정했다. 전용 이미지가 없으면 해당 폼의 색이 다른 스프라이트를 찾는다. 일부 미지원 폼은 대체 이미지가 나올 수 있으며 실제 이미지 가용성은 아직 검증하지 않았다.
- 진화와 관리자 스타터 지급 때도 해당 종·폼의 색이 다른 앞/뒤 이미지 참조를 갱신한다. 기존 진화 전 이미지 참조가 진화 후에 남는 것을 방지하기 위한 변경이며 이미지 로딩은 미검증이다.
- 포켓로그의 색이 다른 전투 스프라이트와 메가·원시회귀·울트라·거다이맥스 임시 폼에서 기존 일반색/변신 전 이미지를 우선하지 않도록 이미지 선택을 수정했다. 해당 이미지가 없을 때 대체 경로를 사용하며 실제 폼별 이미지 가용성은 아직 검증하지 않았다.
- 전투 응답에 진입 전 기본 종/폼 식별자를 포함해, 변신 기술과 날씨 등으로 실제 전투 폼이 달라질 때 기존 폼의 전용 이미지가 남지 않도록 이미지 선택을 확장했다. 동적 폼별 이미지 매핑과 재생은 아직 확인하지 않았다.
- 위 포획·기억버섯·이미지 선택 변경 후 타입 검사는 통과했다. 게임 시나리오와 이미지 표시 테스트는 아직 수행하지 않았다.
### 남은 작업 우선순위
- UI: 전투·더블배틀, 스타터, 알, 슬롯, 보상, 기술 학습, 랭킹 전체의 실제 배치·가독성·모바일 화면을 확인하고 수정한다. 트레이너 전용 원작 일러스트는 제공된 ZIP에 없어 별도 출처와 이용 조건 확인이 필요하다.
- 규칙: 도망·포획·강제 교체·전투 연속성, 트레이너 파티와 AI, 알·보상·스타터의 원작 차이를 확인해 구현한다. 사용자가 별도로 지정한 해금 및 환급 규칙은 유지한다.
- 콘텐츠: 미지원 폼과 변신 모습, 색이 다른 변종, 기술·특성·도구의 고유 효과와 연출을 단계적으로 확장한다. 미지원 항목은 구현된 것처럼 표시하지 않는다.
- 데이터: 개인 최고 기록·글로벌 랭킹, 관리자 교환권/스타터 지급과 픽업, 초기화·복구 및 저장 충돌의 실제 동작을 확인한다. 포켓로그에는 PvP를 추가하지 않는다.
- 마무리: 사용자 요청에 따라 게임 테스트는 이후로 남겨 두었으며, 실제 플레이 및 모바일 확인과 데이터 출처·이용 조건 확인이 필요하다. 미완성 상태로 배포하지 않는다.

- 사용자 방침: 포켓로그 모드에는 PvP를 추가하지 않는다. PvP는 기존 탐험 모드 범위이며, 포켓로그 구현은 싱글 플레이·전투·수집과 UI에 집중한다.
- 랭킹 동기화 완료 최고 층을 포켓로그 저장에 함께 기록해 같은 기록으로 행동할 때는 랭킹 테이블을 반복 갱신하지 않도록 했다. 이 기록은 슬롯을 덮어쓴 후 개인 최고 기록을 복원할 때도 사용한다. 저장 리비전과 랭킹 갱신은 필요한 경우 같은 배치에서 처리한다. 실측 성능과 동시성 검증은 아직 없다.
- 야생 전투 도망 성공 후 상대 스프라이트가 사라지고 체력 카드가 숨겨지도록 표시를 연결했다. 도망 실패 시 적 턴, 포획/더블배틀과의 상호작용 및 연출은 아직 테스트하지 않았다.
- 진행 중 랭킹·알·파티 메뉴로 이동할 때 전투 컴포넌트를 숨겨 유지해 전송 전 선택 중인 행동이 불필요하게 초기화되지 않도록 변경했다. 라우팅·더블배틀 입력·백그라운드 재생은 아직 확인하지 않았다.
- 랭킹은 별도의 `rogue_rankings` 테이블과 `0011` 마이그레이션을 사용하며, 로컬에서 기능을 열 수 있도록 테이블이 없을 때 생성한다. 초기화 화면에 포켓로그 개인/글로벌 기록도 초기화하고 복구 백업에 포함한다는 범위를 표시했다. 마이그레이션 적용 및 실제 복구는 검증 전이다.
- 포켓로그 개인 최고 돌파 웨이브와 닉네임 기반 글로벌 상위 50위 화면을 추가했다. 승리 보상으로 기록된 웨이브만 서버에 반영하며 도망은 포함하지 않고, 동률은 기록 등록 순이다. 저장 중인 명시적인 승리 기록과 보관된 200층 완주 기록은 랭킹 화면 조회 때 소급한다. 저장/랭킹 갱신을 같은 DB 배치로 처리하고 관리자 초기화·복구에 랭킹 백업을 연결했다. 로컬 갱신 오류를 추적하면서 타입 검사를 실행했고 오류 수정 후 통과했다. 이 타입 검사는 실행 검증이 아니며 이후 추가된 랭킹 화면·SQL/동시성·초기화 및 모바일은 아직 검증하지 않았다.
- 랭킹 화면과 저장 연결을 추가한 뒤 `npm run typecheck`가 다시 통과했다. 게임 시나리오·DB 동작 테스트나 브라우저 조작 검증은 실행하지 않았다.
- 관리자 포켓로그 탭에 플레이어별 일반/플러스/프리미엄/골드 교환권 지급을 추가했다. 1–1000장 정수 검증, 저장 리비전 충돌 방지, 지급 전후 수량 감사 기록을 서버에 연결했다. 사용자 데이터로 지급 동작은 아직 검증하지 않았다.
- 관리자 스타터 지급 시 일반 색이 다른 모습을 해금할 수 있도록 선택값과 서버 등록을 연결했다. 기존 해금은 해제하지 않는다. 원작의 별도 희귀 색상 변종과 관련 에셋은 아직 지원하지 않으며, 지급·스타터 선택·전투 표시 검증이 남았다.
- 슬롯, 파티, 목적지 화면의 레이아웃과 배경·버튼을 다시 구성하고 전투 대화/명령창을 어두운 게임 창 스타일로 변경했다. 실제 모바일·데스크톱 화면 및 모든 상태의 가독성은 아직 확인하지 않았다.
- 관리자 교환권 지급은 포켓로그 저장만 변경하고 기존 지급 이력과 별도로 지급 종류·수량·전후 보유량을 기록한다. 관리자가 색이 다른 스타터를 지급하면 기존 스타터 해금에 추가하며 이전 해금을 삭제하지 않는다. 어느 쪽도 운영 데이터에 적용하거나 테스트하지 않았다.
- 트레이너 첫 전투에 기존 트레이너 이미지를 이용한 등장 장면과 건너뛰기 버튼을 추가했다. 원작의 전용 일러스트·대사 에셋은 제공되지 않아 일반 안내 문구와 기존 스프라이트를 사용한다. 연출 종료 후 전투 이벤트 재생을 시작하도록 연결했으며 아직 실제 플레이 검증은 하지 않았다.
- 더블배틀에서 다른 포켓몬의 테라스탈 예약을 비활성화하고 서버에서도 같은 턴의 중복 테라스탈 명령을 거부한다. 선택 버튼에 시뮬레이터의 테라 타입을 표시하고 행동 수정 시 기존 예약을 재선택하도록 처리했다. 상태 변경·강제 교체 등은 아직 검증하지 않았다.
- 더블배틀 행동 선택과 명령창이 겹치던 데스크톱 그리드 행을 분리하고, 화면 전체 폭을 차지하던 HP 표시를 작은 카드로 바꿨다. 카드에 타입 표시와 전투 명령 아이콘도 추가했다. 스크린샷 사례와 모바일 크기에서 확인은 아직 필요하다.
- 포켓로그 더블배틀의 체력 카드를 전장 내부 상단 왼쪽·하단 오른쪽으로 이동했다. 다른 게임의 기존 배치는 그대로 두며, 작은 화면에서 포켓몬 및 효과와 겹치지 않는지는 아직 미확인이다.
- 포켓로그 전투의 싱글/더블 체력 카드를 어두운 게임 창과 밝은 글자·HP 막대로 다시 스타일링했다. 실제 대비와 여러 화면 크기는 아직 확인하지 않았다.
- 아군 전투 카드에 저장된 현재 레벨의 경험치 비율을 사용하는 경험치 막대를 추가했다. 이전에 탐험 모드 성장식을 잘못 사용하던 부분은 서버의 포켓로그 전용 성장식으로 수정했다. 레벨업 이벤트와 최대 레벨 표시의 실제 재생 결과는 아직 확인하지 않았다.
- 요청한 관리자 게임 구분을 두 버튼으로 분리하고, 포켓로그 관리자에 전설 픽업 고정/일일 자동 설정을 추가했다. 설정은 기존 `admin_audit`에 기록하고 포켓로그 API가 서버에서 읽는다. 변경과 뽑기가 겹치면 저장 조건으로 설정 버전을 검사하고, 열린 알 화면은 주기적으로 변경 여부를 확인한다. 실제 인증·동시성·저장 후 표시 확인은 아직 하지 않았다.
- 알 목록의 기본 브라우저 드롭다운을 그림 버튼과 10개 단위 페이지로 교체했고, 알 SVG 및 기계 형태를 변경했다. 뽑기 성공 응답 뒤 기계 흔들림·다이얼·알 낙하 애니메이션과 건너뛰기 버튼을 추가했다. 움직임 줄이기 설정에서는 연출을 생략한다. 실기기 표시·애니메이션 검증은 아직 하지 않았다.
- 원작 전투 명령 2×2 배치를 로그라이크에 적용했다. 명령 선택 후 기술·볼·포켓몬으로 진입한다. 야생 전투에 속도·보스·실패 횟수·도주 특성을 반영한 도망을 추가했으며 실패 시 상대 턴을 진행하고 성공 시 보상 없이 다음 층으로 이동한다. 트레이너/최종 전투는 도망을 막는다. 싱글/더블, 붙잡힘, 도망 후 전투 연속성과 키보드 동작은 아직 검증하지 않았다.
- 알 뽑기와 바깥 메뉴의 화면 틀·기계·교환권 표시를 다시 디자인했다. 제공된 원작 `egg-gacha-ui-handler.ts`를 참고해 기계/메시지/교환권 배치, 최초 전설 기계 선택, 교환권 순서, 좌우 키 이동을 적용했다. 사용자 요청에 따라 중복 코인 환급과 상시 선택 가능한 메뉴는 유지한다. 모바일 및 실제 화면 확인은 아직 필요하다.
- 포켓로그 전투 화면의 프레임·대화창·기술 버튼·체력바에도 새로운 테마를 적용했다. 각 배틀 상태, 극단적인 화면 비율 및 대조는 아직 확인하지 않았다.
- 스타터 편성과 기술 습득·보상·웨이브 완료 화면에도 같은 화면 색과 버튼 스타일을 적용했다. 사용자 요청에 따라 테스트는 이후로 남겼으며 현재 브라우저 UI 연결이 불가해 이번 변경의 시각 결과도 확인하지 못했다.
- 원작의 연속 뽑기 보장(10개 이상 중 희귀 이상, 25개 중 에픽 이상)을 10/25회 뽑기의 마지막 생성에 적용하고 결과 순서를 섞도록 구현했다. 난수 소비 순서는 원작과 다르며 기존 저장·천장과의 통합 테스트는 아직 하지 않았다.
- 뽑기 응답에 새 알의 공개 가능한 종류·이미지만 담고, 부화 전 종 정보는 노출하지 않는 알 결과 화면을 추가했다. 알 자체는 기존 저장소에 즉시 저장되며 결과 화면은 임시 UI다. 표시와 보장 확률의 종단 간 동작은 아직 테스트하지 않았다.
- 원작 알 기계의 UTC 날짜 갱신 카운트다운을 추가하고 알 화면을 연 상태에서 날짜가 바뀌면 픽업 정보를 다시 불러오도록 했다. 시계만 매초 갱신되도록 별도 컴포넌트로 분리했다. 시계 오차·자정과 뽑기 요청이 겹치는 상황은 아직 검증하지 않았다.
- 로컬 전체화면 버튼과 브라우저 화면 채우기 대체 동작을 추가했다. 실제 전체화면 전환과 모바일 브라우저 호환성은 아직 검증하지 않았다. 전투 화면 높이와 상대 크기, 중복 행동 표시를 줄였고 알 뽑기 터치 영역을 보완했다. 로컬에서 데스크톱 크기의 전투 화면과 버튼 표시만 확인했으며 모든 화면 크기가 한 화면에 들어가는지는 미검증이다.
- 알 화면과 내부 도전 메뉴 간 이동 시 상단 제목·사이드바·주소를 현재 화면에 맞춰 갱신하고, 두 메뉴가 같은 게임 컴포넌트를 사용하도록 연결했다. 메뉴 전환, 브라우저 뒤로 가기 및 전투 선택 유지 동작은 아직 검증하지 않았다.
- 알 뽑기 기계 선택 표시와 교환권 수량의 접근성 설명, 교환권 또는 알 보관 공간 부족 시 버튼 설명을 추가했다. 좁은 화면의 크기와 실제 보조기기 동작은 아직 검증하지 않았다.
- 로컬 포켓로그: 바우처 보상·뽑기·웨이브 부화, 일부 날씨/필드·트레이너 판단과 특성·기술머신 처리, 초기 HP 연출 수정이 구현됐으나 이후 테스트는 수행하지 않았다. 아래 날짜별 기록의 예외가 우선한다.
- 다음 구현: 트레이너의 실제 폼 전환 및 조건부 파티, 미지원 기술·특성·도구와 이로치 변종, 전투 연속성의 임시 상태·교체 선택을 단계적으로 보완한다. 현재 구현이 원작과 동일하다고 보지 않는다.
- 검증은 사용자의 지시에 따라 나중 단계로 남긴다. 공통 전투 초기 HP·상태, 포획/더블배틀, 안개·필드·특성, 알 지급/부화, 기술머신과 모바일 한 화면을 별도 격리 데이터로 확인해야 한다. 탐험 사본의 임시 HP 보정과 중복 통합하지 않는다.
- 제공된 ZIP은 별도 참고 폴더에 보관했고 원본/운영 데이터 변경 및 배포는 하지 않았다.


# Classic v3 재구현 — 이어서 작업할 상태

## 2026-11-03 이어서 작업 — 관리자 정책·화면
- 새 스킬 즉시 적용: `frontend-design` 기준으로 포켓몬 게임 메뉴의 짙은 청록 `#122630`, 종이색 `#f8f4e6`, 초록 `#558b70`, 경고 빨강 `#c16b59`, 보상 금색 `#b78935`를 중심으로 유지하고 NeoDunggeunmo 제목과 읽기 쉬운 본문, 데스크톱 5열·모바일 2열 알 상품 배치를 사용한다. 알 종류마다 의미가 있는 테두리 색상을 추가했다. `vercel-react-best-practices` 기준으로 관리자 종 검색을 Set 및 메모이제이션하고 목록 이미지의 중복 상태 갱신을 줄였다. 성능 개선의 수치 효과와 이 마지막 변경의 회귀 여부는 아직 측정하지 않았다. `playwright` 지침은 읽었으며 사용자의 지시에 따라 브라우저 검증은 별도 테스트 스레드가 담당한다.
- 트레이너 후처리 런타임에는 전체 추출본 대신 `scripts/build-rogue-trainer-effects.mjs`가 생성하는 필요한 필드만 포함한 `data/rogue-trainer-effects.json`을 연결했다. 파일 크기는 659,063바이트에서 53,278바이트로 줄었으며, 이 수치는 데이터 크기 비교이고 실제 응답속도 개선 측정은 아니다. 전체 추출 자료와 출처는 그대로 보관한다. 이 변경은 아직 회귀 테스트하지 않았다.
- **최신 사용자 변경:** 새 플레이어가 처음 무작위로 받는 스타터 한 마리의 IV는 능력별 10이다. 기존 저장에서 더 높은 IV는 낮추지 않는다. 관리자 지급 시 기본 형태의 스타터 종과 IV 0–31, 성격, 유효한 출발 기술 1–4개를 선택한다. 원작 태그 `29441f7`의 `getStarterMoves`/`updateSpeciesDexIvs`에 맞춰 Lv.5 기술과 해당 플레이어가 해금한 알 기술만 허용하고 IV는 능력별 기존 최고값을 유지한다. 선택한 성격은 해금·기본 선택되고 기술도 다음 스타터 기본 선택에 반영한다. 개별 런에 임의 레벨·EV·아이템·색상 등을 지급하지 않는다. 이 항목이 아래의 IV15 및 관리자 종만 등록한다는 이전 기록보다 우선한다.
- 관리자 화면은 이미 등록된 스타터를 선택하면 해당 플레이어의 기존 최고 IV·성격·출발 기술을 불러와 재지급 때 다른 값을 우발적으로 바꾸지 않도록 했다. 이 마지막 변경은 사용자의 구현 우선 요청에 따라 아직 별도 테스트하지 않았다.
- 일반 트레이너 출현을 바이옴 `trainerChance`와 일반 등급별 트레이너 풀에 연결했다. X0/X1층과 **같은 10층 구간 내의** 고정 트레이너전 주변 2층을 제외하며, 원작의 `waveBase + 2` 경계에 따라 직전 구간 X0의 고정전 후 X2 일반 트레이너는 허용된다(예: 20층 관장 후 22층). 현재 층과 이전 2개 후보는 원작의 문자 시드 이동·Phaser RNG 구조를 참고한 웨이브별 독립 추첨으로 처리한다. 전체 RNG 순서와 원작 동등성은 확인되지 않았고 **전체 바이옴·저장 재개 등은 아직 테스트하지 않았다.** 아래의 '랜덤 트레이너 없음'은 이 항목으로 일부 대체된다.
- 일반 야생 더블 전투의 기본 확률을 원작 일반 층 기준 1/8로 조정했다. 현재 살아 있는 아군 2마리 이상일 때만 발생하고 보스 야생 더블 및 확률 변경 아이템·특성은 아직 연결되지 않았다. 이 변경도 아직 테스트하지 않았다.
- 야생 종 등급 추첨에 파티 행운을 반영하고 보스 출현 풀 후보가 없을 때 일반 풀을 사용하도록 조정했다. 더블 야생 상대는 각각 종·등급·레벨을 추첨한다. 전설·환상 계열은 종족값에 따라 55층 또는 80층 전까지 최대 10회 재추첨하도록 연결했다. 원작의 정확한 시드 순서와 모든 출현 예외는 여전히 미구현이며, 이 변경은 아직 테스트하지 않았다.
- 일반 트레이너의 `setDoubleOnly`/`setHasDouble` 설정을 읽어 아군과 상대 파티가 각각 2마리 이상일 때 더블 전투로 연결했다. 더블 전용 초상화가 확인된 경우에만 해당 이미지를 사용한다. 원작의 1마리 대 2마리 트레이너전·고정 전투 더블 및 모든 변형 템플릿은 아직 처리하지 않았고 이 변경은 미검증이다.
- 트레이너 멤버 자료 중 고정 특성 슬롯·성별·친밀도·명시된 보스 HP 구간을 생성 포켓몬에 적용하도록 연결했다. 특성·성별의 종 ID 비교 조건 일부, `ensureMove` 대체 조건 중 기술 타입·위력·분류·ID에 대한 비교와 AND/OR, 정적 `replaceMove`/`setMove`도 일부 반영한다. 해석 불가능한 조건은 건너뛴다. 폼 변경이나 분기가 함께 있는 특성·성별·기술 지시, 나머지 조건식·랜덤 후처리 및 기타 명령은 아직 처리하지 않으며 원작과 동등하다고 주장하지 않는다. 이 변경은 사용자 지시에 따라 아직 테스트하지 않았다.
- 더블배틀의 대상 목록은 시뮬레이터의 대상 유효성 판정과 위치 계산을 사용해 `normal` 기술의 인접 아군 선택 등을 반영한다. AI는 회복할 포켓몬의 체력과 같은 편에 대한 능력치 상승/상대 약화를 구분한다. 이 변경은 사용자의 테스트 분리 지시에 따라 아직 검증하지 않았다.
- 로그라이크 전투의 상태이상 및 행동 불가 메시지를 독·마비·잠듦·풀죽음 등 상황에 맞는 한국어 문장으로 바꾸었다. 공통 엔진에는 선택 옵션으로 연결해 탐험/PvP 기존 문구는 유지한다. 미검증 상태다.
- 전투 로그의 기술 이름 조회는 첫 일치 우선순위를 유지하는 사전 인덱스로 바꿨다. UI 반응 속도 개선 수치는 측정하지 않았고 마지막 변경 역시 아직 테스트하지 않았다.
- 원작 자료의 조건 없는 `setInstantTera` 지정과 관장(100층 제한·명시된 예외)·사천왕의 파티 슬롯/전문 타입 테라 지정을 플레이어 테라오브와 독립적으로 연결했다. Shedinja 타입 제한과 슬롯 범위 보정, 정적 타입·종 ID 조건 일부를 적용하며 초기 전투 요청도 테라 허용 상태를 반영해 갱신한다. 복잡한 조건·모든 변형 규칙과 원작 테라 횟수 동등성은 미완성이다. 이 변경은 **아직 테스트하지 않았다.**
- `lib/rogue-trainer-moves.mjs`에서 트레이너가 레벨과 진화 전 계열의 레벨업·진화 기술(되새김 기술은 Lv.40부터) 중 위력·연속 공격 횟수·명중률·자속성·공격 능력·타입 다양성 및 보조기 유용성을 고려해 기술을 고르도록 추가했다. 알 기술이 허용된 보스 등은 Lv.80부터 일반 알 기술 최대 1개도 후보에 포함한다. 고정된 원작의 기술머신 등급·제한 목록·종별 전용 기술 후보를 `scripts/import-rogue-trainer-tms.mjs`로 정적으로 추출하고, 레벨별 등급·개수 상한 및 후보에 존재하는 전용 기술의 60% 선택을 반영했다. 전체 금지 조건과 가중치는 미구현인 부분 휴리스틱이며, 저장 시드 소비 순서도 원작과 다르다. 트레이너 개별 후처리는 그 다음에 적용한다. 이 변경은 아직 테스트하지 않았다.
- 라이벌 파티에도 같은 부분 기술 생성기와 일부 원작 전용 기술 후보를 연결하고, 선두 포켓몬의 기본 특성·기본 타입 테라와 5/6차전의 2/3구간 보스 HP, 자료에 명시된 차전별 상금 배율을 반영했다. 5/6차전 마지막 레쿠쟈의 이로치·보스 구간, 6차전 메가레쿠쟈의 별도 종족값·특성·모습도 연결했다. 라이벌 전용 기술의 전체 출현 조건·나머지 후처리·원작과 동일한 시드 및 배틀 검증은 아직 남아 있다.
- 사용자 요청으로 포켓몬 프로젝트에 독립 테스트 스레드 `01a1a0bc-b392-7340-89d1-52b2c7c47005`를 생성했다. 원본 코드·운영 데이터는 수정하지 않고 별도 사본·별도 포트·테스트 전용 인증으로 검증하도록 인계했다. 해당 스레드는 이후 사용자의 스킬 설치 요청을 수행하고 현재 대기 상태다. 최초 격리 사본의 자동 테스트와 타입 검사는 통과했지만 HTTP 서버는 로컬 `EACCES`로 확인하지 못했고, 이후 이 구현 스레드에서 추가한 변경은 그 결과에 포함되었다고 볼 수 없다.
- 추가 UI 작업: 모바일에서 보상 3개를 나란히 보여주고, 웨이브 완료·기술 학습 화면의 여백과 버튼 배치를 줄였다. 스타터 편성은 파티·목록/상세·출발 버튼을 화면 안에 배치하고 상세에서 특성·성격·성별·색상·능력치·기술을 압축했으며 파티 추가 버튼은 상세 영역 하단에 고정한다. 긴 설정, 작은 화면, 사탕 설정 등은 내부 스크롤이 남을 수 있다.
- 스타터 목록의 정적 스프라이트는 투명 픽셀 경계를 비동기로 분석해 중심·표시 크기를 제한적으로 보정하며 결과를 캐시한다. CORS 또는 이미지 분석 실패 시 원본 크기, 애니메이션 GIF는 프레임 잘림을 피하려고 원본 크기를 사용한다. 목록 이름·폼은 줄바꿈한다. 기술 설명은 자동 포커스만으로 뜨지 않고 마우스 호버 또는 설명 버튼으로 연다.
- 임시 로컬 샘플 데이터를 사용해 390×844 화면에서 보상·웨이브 완료·기술 학습·스타터 목록과 상세, 기술 설명 열기를 확인하고 샘플 페이지를 삭제했다. 종별 일부 정적 이미지에 크기 보정이 적용된 것도 확인했다. 실제 기기, 모든 폼·긴 문구 및 전체 게임 화면의 완전한 한 화면 배치는 아직 확인하지 않았다.
- `game-ui-frontend`, `game-ui-ux`, `ui-ux-pro-max`, `motion`, `web-design-guidelines` 로컬 지침을 확인했다. UI Pro Max는 내장 Python으로 터치 영역 지침을 조회했고, 웹 가이드 원문을 참고했다. Motion 패키지는 추가하지 않았으며 기존 CSS의 transform 및 reduced-motion 방식을 유지했다. 전달된 두 Library 이미지 ID는 이 세션에서 파일로 가져오는 지원 도구를 확인하지 못해 직접 열지 못했다.
- 게임 선택 화면의 어두운 배경 위 제목 대비를 수정하고 두 게임 카드를 포켓몬풍으로 정리했다. 390×844와 데스크톱 샘플에서 카드·설명·진입 버튼을 확인했다. 모바일 상단의 중복 알 상점 버튼은 숨기고 하단 알 뽑기 메뉴는 유지한다. 전투 UI는 작은 화면에서 로그와 기술 버튼의 공간을 줄였다. 실제 게임 저장은 변경하지 않고 임시 샘플 전투로 확인했다.
- 로그라이크 안내 화면의 제목 대비·카드 배치를 수정했고, 실제로 일부 참조 데이터와 볼 이미지를 사용하면서도 복사하지 않았다고 쓰여 있던 출처 문구를 정정했다. 모바일 안내는 읽을 수 있도록 한 열의 작은 행으로 배치했다.
- 알 상점은 데스크톱에서 다섯 상품의 이름·후보·확률·가격을 같은 줄에 보여주도록 압축했다. 모바일은 두 열로 구성하고 전체 설명을 펼칠 수 있게 했다. 모바일의 모든 상품이 스크롤 없이 보이는지는 아직 확인하지 못했다.
- 관리자 UI는 플레이어를 선택하면 대상 설정을 접을 수 있으며, 테스트 전용 가짜 응답으로 IV·성격·기술 선택과 지급 버튼 흐름을 확인했다. 서버 지급은 단위 테스트로 유효 기술/잠긴 알 기술·IV 범위·성격과 다음 출발 파티 반영을 확인했다. 2026-11-03 현재 `npm test` 35개 및 타입 검사 통과. 실제 D1 격리 관리자 HTTP 전체 흐름은 별도로 남아 있다. 모바일에서는 관리자 입력 항목이 많아 내부 스크롤이 남는다.
- 최신 사용자 지시에 따라 로그라이크 관리자 지급은 **기본 형태의 스타터 종 등록만** 허용한다. 서버가 Lv.5, IV 15, EV 0, 기본 특성·기술·일반 색상·빈 도구를 생성하며 클라이언트의 임의 값은 사용하지 않는다. 관리자에 의한 런 파티 지급·수정 및 기존 스타터 임의 수정은 차단한다. 이전 보유 데이터는 삭제하지 않는다. 탐험 관리자 편집은 기존 동작을 유지한다.
- 관리자 인증은 특정 이메일 조건 없이 서버 비밀번호로 접근하도록 변경했다. 비로그인 방문자도 관리자 화면 진입 가능하며, 실패 횟수 제한은 공통으로 적용하고 세션과 감사 기록은 유지한다. 비밀번호를 아는 사람이 플레이어 데이터 및 초기화 기능에 접근할 수 있는 정책이다. 인증 성공·실패의 새 HTTP 경로는 아직 격리된 테스트 계정으로 다시 검증해야 한다.
- 저장 슬롯을 포켓몬풍 밝은 카드로 정리하고 빈 슬롯의 불필요한 0을 제거했다. 알 상점의 Bootstrap 흰 배경/낮은 대비를 수정했다. 관리자 로그인 화면의 과도한 세로 확장을 줄였고, 로그라이크 친구 화면을 2열 및 접이식 교환 영역으로 압축했다. 390×844 모바일 미리보기에서 빈 저장 슬롯 다섯 개·친구 화면·관리자 인증 화면이 한 화면에 보이는 것을 확인했다. 긴 파티·많은 친구·작은 화면에서는 스크롤이 필요할 수 있다. 다른 화면의 전면 UI 개편과 모바일 실기기 검증은 남았다.
- `npm run typecheck` 및 `tests/rogue-admin.test.mjs`, `tests/rogue-initial-starter.test.mjs` 통과. 5번 Sites 버전은 사용자의 별도 지시로 앞서 배포됐으며, 이 항목의 이후 로컬 변경은 배포하지 않았다. 이전 문서의 v4 운영·관리자 이메일 제한·런 관리자 편집 관련 설명보다 이 항목이 우선한다.

## 최종 사용자 방향
- 포켓로그 모드부터 완성. 원본 시스템을 똑같이, UI는 복제가 아니라 더 높은 품질.
- 직접 원본 플레이 조사는 중단하고 공개 플레이 영상 참고. 참고 영상은 음소거 상태 유지.
- 최대 레벨100 / 자동 진화 금지 / 별도 게임 데이터 / 고가 다양한 포켓몬 가챠 / 넓은 관리자 지급·수정은 명시 예외로 유지.
- 변신은 실제 형태: 메가·G-Max 런 지속, 테라 결정화/왕관과 실제 상태. 일반3턴Dynamax를원본이라고활성화하지않음.
- 완성·검증 전 새 버전 배포 금지. 운영 v4 그대로, 지금 파일은 로컬 개발본.

## 검증한 사실과 구조
원본 기준 v1.12.2.3 / 29441f7aa7482d9e816b253d324293788936dc3e. `work/pokerogue-reference`는 공식 저장소의 해당 태그 clone(원본 앱 실행 안함,ignored). Agent 감사문서:
- outputs/pokerogue-system-audit.md
- outputs/pokerogue-economy-growth.md
- outputs/pokerogue-battle-carry.md

원본 사실:
- 시작27종 모두해금, IV15/EV0/레벨5, 파티6/비용총10. **27종이 전부3점인 것은 아님**(Torchic/Froakie/Gen9 등4점).
- source starterCost 선언된selectable종572, DTO기본+선택형태611개 매핑완료. species source1084→현재PokeAPI/Dex1084모두매핑(0누락).
- 원본base1084종baseStats는현재Dex데이터와전부동일. G-Max같은일부변신폼은커스텀BST/특성/타입으로별도적용필요.
- 원본모든base/passiveAbility는현재NativeDex.exists=true(Dragonize312/FireMane316/AuraGuard319 포함). 패시브배정192종; 모든조합완료라고주장하지않음.
- 새런돈1000/몬스터볼5/수정자[]/영구돈·레벨·도구carry안함.5개의런slot/영구Dex분리.
- Capture caught등록은actual→prevo전부. IV는첫selectable부터prevo까지최대값전파(Raichu26IV자체X,25→172). Candy는babyfamily172. **Pika25 costReduction/passive/candyrow는172와독립,prevo있어Candy메뉴도없음;getStarter25=25이지172아님.** Own eggMoves25=[]이며familyfallback하면틀림.
- wild XP=(폼baseExp*실제적레벨)/5+1. trainer먼저floor1.5. 참가자분배/기절·cap제외, 초기Share0/8라이벌Share1+SuperCharm1/25Share1.벤치Share없으면0.
- wild승리기본돈0. Trainer/돈보상/관련특성·수정자에서돈. Shop치료는즉시효과,영구재고X. firstPotion36/firstReroll250.10층은일반보상·유료상점생략하고고정성장보상→biome/heal.
- 같은구간야생은boosts/volatiles/임시특성·타입/PP/field/hazards보존. FakeOut은waveTurnCount라새wave첫턴가능.
- 일반승리턴residual은수행,10층Interlude는tag/heal/status스킵+fieldduration만lapse. incomingTrainer/Mystery/final/prev10경계의reset과무기한weather다르게처리.
- Champion190/Elite182,184,186,188/Rival8,25,55,95,145,195/Eternatus200.6gymstart20or30 이후30간격.

## 실제 구현된 새 코어(아직 전체 API/UI 미연동)
- data/rogue-reference.json (1.42MBserver-only): source1084/forms609/starter572/egg571/default27,정적진화544/formChange291,함수41/호출6은marker,Minun TM filter1은누락. 원본code라이선스AGPL-source고지포함,독립AST추출/코드실행X.
- scripts/import-rogue-reference.mjs :고정태그 ASTparser.
- lib/rogue-reference.mjs :Native/PokeAPI/source ID·enum·regional/form매핑. unmapped0,GenotypeMoveMapping.
- lib/rogue-starter-system.mjs :기본27/IV15,catch/IV/nature/ability/gender/shiny해금,candy,point10×6서버검증,새party레벨5/EV0/gear초기화. PikaCandyrow독립수정완료. 기본natures는중립cycle(원본seed순서와완전같다고주장X).
- lib/rogue-classic-state.mjs :5개독립run slots/영구자원분리/1000·볼5·레벨5·수정자초기화/시드RNG. startClassicRun은아직 **screen=prepared**인기초모델;완성실행루프아님.
- lib/rogue-classic-rules.mjs :원본레벨/cap/trainerstrength/money/tier·luckUpgrade/reroll/story스케줄/기초EXP분배. sourcecap·enemyLvl은마지막min100. EXP복수Charmfloor/Balance는후속progression모듈필요.
- lib/rogue-classic-services.mjs :즉시치료14종,동적가격/대상/PPbase용량(물대포25)/약품해금/기억버섯·learnableMoves/실패시무차감. 아직run API미연동.
- 위각 test*.test.mjs 통과. old legacyNatural601decisions관리자없이fresh짜랑꼬200완주도통과했으나**원본시스템동등증거아님**.

## 새 UI/시각 기반
- app/rogue.tsx+rogue-ui.css :v5 UI프로토타입,아직기존v2/RogueAPI. actorHP최종스포일러부모HUD/로그숨김.팝업전투제거.
- components/rogue-starter-select.tsx+css :611DTO용10포인트·6slot·세대/검색·유전설정·사탕UI. 아직메인미연동.
- components/rogue-classic-rewards.tsx+css :3랜덤무료/즉시유료정비/리롤/target/PP/TM/Memory버섯 선택UI. 아직미연동.
- BattlePanel/배경/앞뒤GIF/타격HP동기화/crown·결정화/Gmax오라/trueformfallback구현.
- lib/party-battle.mjs :표시필드 terastallized/dynamaxed/gigantamax/mega/primal/ultra/battleAppearance,before/beforeActive 추가. gen9에서nativeDmax요청없음정상. originalRogue고유룰은아직반영안됨.
- HMR영구잠금수정/2.8초재생budget/3.2초안전종료. `.sites-runtime/react-effects/check.mjs` 대조군으로버그재현/수정검증. global.empty padding80가거대원만들던CSS충돌도고침.
- PokemonImage 경량데이터39KB/동일폼artfallback/unknown폼은base가장X. scripts/verify-display-data 검사통과.
- Neo둥근모44KB공식OFL,public/fonts; 원본code-native battleSVG3종public/game/battle,CC0Kenney assets(후속탐험)public/game/town.
- VanillaRogueClient staticJSgzip407117→128346bytes(약68%감소),raw2661487→375595;outputs/rogue-performance.json. localWarmGET11–23ms(인터넷지연아님).

## 연구용 Native 어댑터 프로토타입(앱에 아직 승격 X)
1. `.sites-runtime/rogue-hooks-prototype/adapter.mjs` 및component-abilities.mjs, PHASE2.md:
   - BP스택/먹밥2/기본위협+패시브부유/개별억제/Gas/MoldBreaker/Trace/SkillSwap/스냅샷별프로세스복원/격리통과.
   - b.events Format callback은snapshot직전제거+restore필수; AI clone도같은serializer필수.
   - fromJSON은bind전에getRequests하므로activeRequestnulltombstone→bind→원래활성요청복구필요.
   - 현검증allowlist7개,192모두완료아님.
2. `.sites-runtime/wild-carry-prototype/README.md` +check.mjs:
   - 같은NativeBattle/p2에새Pokemon+side.team추가,oldfainted는refs용graveyard,10×double20개로24위치내snapshot가능.
   - boosts/PP/status/field/tags/seedSlot유지,p1Intimidate재발동X/p2발동,FakeOut첫턴허용,privatecurrentEnemy범위,RevivalBlessing과SupremeOverlord과거묘지영향격리.
   - 새battle부터win을residual완료까지유예하는instance훅필수. 추적없는legacyresidualKOsnapshot은남은효과정보없어거절해야함.
   - trainerfreshReset은HP/status/PP보존하고stage/태그/설치물·유한fieldreset;무기한환경재주입정책추가필요.

## 바로 다음 할 일
1. 검증된프로토타입을정식lib로리뷰/승격:직렬화·component능력·statefulheld스택·sourceStats/customGmax·기초PP·AIclone경로·wildcontinuity/승리residual/EXP시점.
2. source35biomes/NPC/라이벌/템플릿데이터어댑터:pixel_assets가data/rogue-world-reference.json과importer작성중(중간이미있음). callback1331marker는실제NPC생성구현이아님.
3. modifier registry/eligibility/가중보상·스택·즉시치료·캔디·TM·장비·gimmick·돈·route map/10층fixedgift를구현.
4. 전체phase state machine(각KO XP→새기술결정→turnResidual→capture교체→보상→biome→다음전투),wild기본돈0/런0carry,5slots+메타capsule분리.
5. doubles (랜덤쌍전/최종Eternamax2단계),typedtarget·각active선택지원. 현재party-battle는single하드코딩이어서아직필요.
6. 카드35biome비주얼/NPCsource파티/일정,목표원본core에맞춰UI붙이기. 기존고정+2level/heal/recruit보상은새core에서폐기.
7. adminRogue새starterDex와현재runparty선택·편집·감사반영,기존비밀값/사용자데이터유지.
8. 이전v2저장보관/명확한마이그레이션정책,교체중파일을완료라고오인배포하지않기.
9. PC/모바일/실제전체경로검증후테스트모의인증원복→빌드/sourcehelper/publicdeploy.

## 환경과 세션
- root path C:/Users/USER/Documents/Codex/2026-11-02/pc-ui-ai-ai-sites-ai/pokemon-roguelike
- D1로컬세션64141 npmdev5173, .dev.vars dummyADMIN. 원복백업 .sites-runtime/sites-vite-plugin.original.ts.
- mock1=local_seedy(127사용자프리뷰),2=local_second(localhostcookie1도2로격리),3=local_fresh(자동검증). 실제데이터아님. local_second에QAcoins50000, local_fresh naturaltest종료.
- browser2 / handles releaseTab3prod, researchTab4원본(더조작하지말것), roguePreviewTab5 127사용자, videoTab6음소거YouTube, qaRogueTab7localhostQA. 새컴팩션이면cua.rewriteDocumentation필수.
- viewportoverride1440×900설정했으나DOM은한호출늦게반영됨. 종료전reset.
- 운영프로젝트appgprj_6ae805126fcc81919e2957e973c8955a,v4,HEAD7b9de08d0903f054be19d8ae7592a529571e85bb. 새소스uncommitted,전부우리작업. credential세션만료되므로게시시새로get_site+credential+sourcehelper。
- 기존코블버스/전설급게임변경금지,다른Sites배포금지. 실제adminpassword클라이언트/파일출력금지.

## 최신 이어서 상태 (22:40경) — 위 미연동 상태는 이제 일부 오래된 기록

### 새 사용자 변경 (이 부분이 우선)
- 새 스타터 등록은 포획이 아니라 **상점에서 구매한 알을 부화**해야 한다. 기본27종은 그대로. 포획한 포켓몬은 현재 런 파티에 들어가고 관찰/포획/IV 기록은 남지만 신규 starter registered는 false. 관리자 명시 지급은 예외.
- 알 가격은 비싸게. 현재 common12,000 / rare48,000 / epic160,000 / legendary650,000 / shiny240,000 도전 코인. 후보 스타터cost구간별풀, 확률·풀크기표시. 런 소지금과 별도인 기존document.coins를상점지갑으로사용, 매wave/트레이너/구간/완주에서 서버지급(coinRewards로중복방지).
- 게임이 너무 쉬움: 실제 AI가 Growl 같은 음수 boosts를 자기 setup으로 판단해 반복하던 버그 수정. 아직 source 보스segments/관장고유후처리/랜덤트레이너/상세난이도 검증은 남음.
- 기술 hover 설명 + 모바일 i 버튼 요청: Korean826설명(pinnedPokéAPI) + 최신주요기술한글 + nativeShortDesc영어fallback, tooltip 구현. UI 동작 실제검증 더필요.
- 관장 사진 깨짐: server fullURL을client가다시URL템플릿으로감싼것이원인. normalize/fallback수정, 아래로컬PNG로교체. 상대 base스프라이트 폭20%/210px→15%/160px 축소;own25%/260→22%/230. 변형폼확대효과유지.
- 관리자 상단에 잘보이게: 상단관리자버튼 + 사이드바. 서버owner+비밀번호검증유지. UI는로그인된계정에진입보이되서버403은명시.
- 관리자 비밀번호 새 값은 **가장최근사용자메시지** 기준. 로컬ignored .dev.vars에만서버용저장(출력/클라이언트포함금지), ADMIN_EMAIL=second@sites.test 로QAidentity2를로컬테스트관리자로선택. **운영Sites환경의비밀번호는아직새값으로변경안함**. 최종출시시ADMIN_PASSWORD만nativeenvupdate하고기존ADMIN_EMAIL/다른Sites그대로.
- 틀리면 '비밀번호가 틀렸습니다.' 표시. API401/codeINVALID_ADMIN_PASSWORD 및UIinvalid-feedback rolealert실검증,맞으면200/HttpOnlySecurecookie/UI메뉴열림실검증.
- Bootstrap 적극활용: bootstrap@5.3.8 exact 설치, fullCSS를postcss로 .bootstrap-ui 안으로scope. script build-bootstrap-scoped.mjs/generated app/bootstrap-scoped.css/MITnotice보관. admin·eggshop적용,게임전투css격리. bootstrapJS는미사용.
- 되도록 한화면: 새 AdminConsole 3열+상단대상선택+하단savebar+기록별도탭. 1440x900에서 documentHeight900,saveBottom852,각panelclientHeight=scrollHeight=460(내부scroll0) 실제확인. outputs/admin-one-screen-1440x900.png. **viewport reset 완료**.

### 현재 앱 실제 연결
- app/rogue.tsx default는 app/rogue-classic.tsx로reexport. 구 v2 UI는 named LegacyRogue로보관(삭제안함). 새 /api/rogue-classic route 사용. 기존 /api/rogue legacy 보관. app/admin-panel.tsx default는새 app/admin-console.tsx로reexport,구 LegacyAdminPanel도보관.
- 새 RogueClassic UI: 5개슬롯/편성689DTO(종572+선택형태117)/실전/새기술결정/포획파티교체/3랜덤무료보상/유료즉시서비스/리롤/10웨이브interlude/route map/파티폼변화/알상점까지 연결.
- 새 lib/rogue-classic-game.mjs: actions.prepare/start/selectSlot/turn/capture/acceptCapture/learn/buyService/reroll/reward/skipReward/next/route/form/abandon/buyEgg/hatchEgg. document.classic만새코어저장. 구document.run/collection/inventory/coins 보관 (coins는이제meta상점지갑겸용).
- 시작:27종,고정default성격(실제원본 seed'default'배열),IV15EV0Lv5,10point6party,돈1000볼5. 성격23/27차이수정. 기본 moves가 last4이던것 first4로수정.
- ensureStarterSystem dexVersion3: .registered 필드로알/관리자등록과wild caught 분리. version1/2는기존관찰/포획데이터보관하며등록정책만명시마이그레이션. 기존origin gacha/admin은재등록보존. adminMoves예외허용.
- lib/rogue-egg-shop.mjs: 가격서버계산/재화서버차감/hiddeneggcontents/serverhatch/유전기bit+사탕+등록. 재부화거부. 즉시부화방식(사용자알구매요구에따름),원본의부화대기wave카운터와는다름(남은원본동등범위에기록).
- lib/rogue-classic-world.mjs:35바이옴정적풀,시간대,일부기후/연결,고정story스케줄,gym/rival/Elite/champ/evil 기본template/종/레벨생성. **원본동등완료아님**:랜덤트레이너없음,템플릿함수/후처리/라이벌finalreferencebalancing/evo강등&지연/전설reroll/luck등필수보완.

### 실제 새 native 엔진
- lib/rogue-battle-engine.mjs: source스탯/타입/PP초기화,스냅샷save/restore시sourceSpecies+baseSpecies재주입,커스텀instance이벤트callback복원,AI도동일clone. source영구Mega/Gmax,tera gating,더블actors/target/단일호환,KO직후XP/참가자,야생승리residual,포획코어.
- lib/rogue-ability-components.mjs,rogue-battle-continuity.mjs,rogue-battle-lifecycle.mjs,rogue-encounter-guards.mjs 연구코드를검토승격. 선택능력은Dex존재여부가드확장했으나 **192패시브모든고유효과동등검증완료아님**. 실제검증allowlist7과나머지구분필요. phase복합 suppressed/hardcoded rawAbility경계남음.
- continuity blockWaves와globalwave분리,새native적만add/team등록/입장,fakeoutwave첫턴/PP/boost/field/temporaryabilitytags유지. HP/PP/새기술boundary재동기화. trainer/비움변경은새B로리셋(현재순수source정책추가보완필요).
- lib/rogue-classic-growth.mjs:SourceXP곡선.325species+.675cubic(100도source식),EXPshare/Balance/Charm그룹별floor,KO즉시레벨업및후속새기술선택큐,friendship3/기절-5/candyfriendship3배. sourcepositiveNatureceil,WonderGuardHP1반영은pokemon-config에서rogueSourceId 있을때만.
- lib/rogue-transformations.mjs: sourceformdata&gatedtools/items로영구폼적용. GmaxCharizardHP118SpA134/Berserk,BlastoiseWaterSteel. Mega/Primal/Ultra/Gmax와Tera동시불가request+server가드. 폼옵션함수condition동적인것은아직미지원,비어있는condition정적변화위주.
- lib/rogue-classic-capture.mjs:sourceGen6 .1875 shake공식3checks,criticaldexchance/잠듦2.5/3xRogueball/shiny2/masterguarantee. native포획은ball1개소모/실패상대턴,야생한마리남을때,trainer/final포획불가. sourcebosssegment플레이아직부족.
- Capture직접XP후native성장stats재동기화는한번더검토필요(onFaint경로는구현/검증).
- **현재200층1단계승리후screen=finalphase에멈춤:2단계Eternamax action/UI/더블전환 미구현**. 새v3전체완주통과라고절대보고/배포하지말것.
- lib/rogue-classic-rewards.mjs:실제효과연결된지원registry 약50개,가중무료3/paid14서비스/리롤/道具스택/XP/PP/TM/formtools/돈. **원본모든보상/중첩/berries/TM등등가완료아님**. 소스전체poolweight/specialsystems 확장필수.
- 새 move-description.mjs/data826/script,power/accuracy/PP/priority/contact/targetDTO. MoveCard hover/focus/i tooltip. 신기술영어fallbackactualshortDesc.

### 관리자 새 파이프라인
- lib/rogue-admin.mjs: destination='starter'|'run' 필수,runSlot0..4. starter관리자등록(알등록예외)+adminCollection에실제편집레코드. run지급/수정은실제party/native전투rebuild,별도audit/revision. 파티6이면신규거절하고기존수정안내. 다른slot/탐험/legacy보호.
- lib/admin-mutations.ts Rogue분기는mutateRogueAdmin 호출. app/api/admin GET box+runSlots/destination/runSlot지원. auth오류메시지구분.
- 새 AdminConsole Bootstrap3열viewport그리드,새target모드/지급위치/slot선택. 서버종/폼/레벨/EXP/성격/ability/item/IV/EV/기술검증기존유지. 아직새파이프라인실API지급+수정/audit회귀테스트필요(순수unit통과).

### 자산 신규
- data/rogue-form-appearance.json + scripts/build-rogue-form-appearance.mjs:source선택폼202행(0포함)/nonbase117모두appID매핑. sourceform0shellosEast→app30039,scatterbugMeadow→app30276역전포함.
- pinnedSmogon실spritefilekeys201/202,nonbase116/117. **SpikyPichu확실한frontsprite 1누락**(metadata.omissions);임의base이미지가장안함. agent rogue_ui마지막턴capacity에러지만위파일은작성완료,root가읽고연결해서689catalog검증함. 재생성검증/저작권고지끝내야함.
- rogue-reference가crosswalk읽어nativeSpecies/sourceImage/sourceBack/shiny/SpriteKey주입. PokemonImage direct정확폼sourceImage지원,대체색상기본이미지오인방지. source이미지들의reducedmotion정지GIF처리검토필요.
- data/rogue-trainer-appearance.json363KB,script build-rogue-trainer-appearance.mjs. localPNG241개/191900bytes/80x80/HTTP200+SHA256검증. source272types중252매핑;gym74/E442/champ16전부. 미확인20개srcnull. root worldgenerator는selectedsrc+artist만DTO,클라이언트전체import없음. credit기본경로UI연결. **작가/권리조건종합출처페이지추가필요**.
- public/game/eggs/*.svg5개 owncodevector. trainerfallback.svg owngenericicon(실제원작얼굴이라고가장안함).

### 검증된 결과와 환경
- 최신 npm run typecheck통과. npmtest전체27개통과(rogue-admin추가후전체28개재실행은아직,관련3개지속통과).
- 새tests/rogue-classic-engine.test,rogue-classic-game.test,rogue-egg-shop.test,rogue-admin.test 존재.
- tests/release-classic-api.mjs 실제localDummy3 API로27초기등록→3party/10pt/Lv5/PP35→34/한국어설명/저장재조회/알구매부화/CSRF403 통과. slot5는이fixture사용. 재실행시이미알부화등록있으므로초기27절대assert는완화/독립신규fixture필요.
- 추가실증 .sites-runtime/integration-prototype/check.mjs 현재native7필수회귀통과:sourceGmax193HP/Berserk,source재주입,WaterSteel,레벨업직후PerishSong기절레벨rollback없음,SDPPHP유지→FakeOut→새상대패시브Levitate실면역.
- outputs/rogue-trainer-generation.md199줄,rogue-starter-gaps.md163줄 정확한sourcefacts. defaultPhaserRNG25줄/UTC일일Pokerus5 sourceID선정참조있음. **Pokerus현재앱미구현**.
- dev session64141은정상종료. 새 **session29643 npm run dev5173**,신규ignored .dev.vars서버바인딩반영됨. mockauth플러그인원복백업그대로(.sites-runtime/sites-vite-plugin.original.ts),최종패키징전mock원복+ignoredvars삭제 필수. 새pw파일존재하므로cat/GetContent출력금지.
- browser2/qaRogueTab7 localhostadmin 현재모드rogue/destinationrun/targetlocal_fresh/slot5선택,실제지급클릭안함. admin쿠키정상인증UI실증. 사용자다른localhost탭으로조작할수있으므로자동테스트는profile3고정·현재개인playDB변경주의.
- viewport는마지막CUA에서reset함. YouTube음소거유지(원본PokéRogue계정조작금지).
- 운영v4아직그대로. 이새코어는로컬개발본,이번변경은전혀배포하지않음. 원본동등/최종boss/모든능력아이템AI/관리자실API/PC모바일/자산licensesource고지완료후에만패키지/배포.

### 22:55 이후 추가 완료 (이전 finalphase/진화 미구현 메모 일부 대체)
- rogue-admin 실제 HTTP QA통과: 로컬dummyadmin2→dummyfresh3의slot5만PikaLv31지급→Lv67수정,nature/IV/EV/item/shiny/moves/nativebattle 재빌드/감사destination=run 검증. 운영데이터무변경. slot5party이제4마리.
- lib/rogue-evolution.mjs source544진화/15종정적condition 해석,수동진화API/partyUI/도구보상(일반·희귀) 연결. 자동진화안함,IV/HP/PP/스택소유자보존,새source종이native연속야생에서도실제반영(forceSpecies). Nincada→Ninjask시빈자리+normalball조건으로Shedinja생성·modifier복제/HP1/Wonderguard검증(원본은볼보유검사만,미소모).
- 진화후패시브종별변경반영. 여전히RandomForm시드가personality%value라originalPhaserseedoffset와완전같은seed재현아님;TreasureTracker보상/일부held조건관련registry나머지확장필요. nativeSleep등일부evo시상태세부보존은회귀확장필요.
- lib/rogue-boss.mjs 실제source지수식damagegate/4→5방벽/가중statboost,회복시shield재생안함. native엔진Pokemon.damage instancewrapper로실제적용(처음시도AfterDamage는native이벤트없어수정). bossboost는ignoreAbilities=true이므로직접단계증가+native로그. 원본수식테스트통과.
- lib/rogue-final-battle.mjs 최종200층이제같은적개체Eternatus4구간마지막index0→Eternamax5구간실전전환. phase1HP1이하기절방지,적회복/태그정리/상태치료/새기술Recover1PP,playerHP/PP/boost/field유지,기존lead재입장안함/newpartner만입장. 원본처럼pendingenemyMove만취소,파트너입장은residual끝에. format참조gen9doublescustomgame·activePerHalf2·p1.active2,p2.active1(빈enemy slotPadding은native크래시). snapshot왕복+2v1실턴+마지막KO승리까지syntheticfixture 테스트통과.
- 최종전Moves phase1Eternabeam5/SludgeBomb10/Flamethrower15/CosmicPower20,phase2DynamaxCannon5/CrossPoison20/Flamethrower15/Recover1. IV31level100explicitoverrideHP421→651,기본Pressure·NeutralGaspassiveOFF. MiniBlackHolemod1 지급,Residual도구1stack흡수/StickyHold/최대중첩가드/실제nativehelditem take&set 구현. **멀티nativehelditem은수신자가이미nativeitem을가진경우아직제한**,추가registry검증필요.
- 아직최종전PerishSong/DestinyBond직접faint/멀티히트세부phase/턴잔여치유순서등전체원본동등경계 추가검증필요. 전체완료배포허용아님.
- Source최종boss포획게이트:572starter중571caught기록,마스터볼은challenge없을때shield우회+phase1에서도가능. API/UIcaptureAllowed구현. 일반boss도masterballshield우회,WonderGuard예외/sourceIndex gate. egg-only등록정책과caught기록은별도.
- `classicMaxPP`가서버NPC roguePPMax.recover1지원. partner2대1AI signedtarget요청도실제activePerHalf로판정.
- 보스HPUI구간tick/남은shield수,적폼데이터바뀜에맞춘finalsnapshot반영. Eternamax라벨/거대배율 등시각전용세부마무리남음.
- lib/korean-text.mjs subject/object/topic/direction 추가. full-battle로그이름조사/능력치조사와p2'야생/상대'접두어개선. 전체전투메시지극본완료는아님.
- tests추가 rogue-boss.test.mjs,rogue-evolution.test.mjs,rogue-final-battle.test.mjs 통과. 최종전fixture는불법능력접근가능성/밸런스주장이아닌synthetic mechanics 검증임(코멘트명시),natural200완주검증은미완료.
- source조사추가 outputs/rogue-final-boss-rules.md142줄, .sites-runtime/final-transition-prototype/{README,transition,check,resume,results}. agentown프로토타입rawAPI통합은rootproduction에독립반영함.
- 최근typecheck통과. CSS/logic변경후전체npmtest+실브라우저regression다시필요. bootstrapOneScreen최종1440x900 body900/panel460=content460/savebar852검증스크린샷첨부commentary완료. viewportreset완료.

### 2026-11-03 이후 최우선 최신 상태
- 사용자 최신 기본 해금 변경: 초기 스타팅 27종 중 플레이어별 랜덤 1종만 등록. dexVersion4로 기존 egg/admin 획득은 보존, 이전 기본 26종만 잠금. 계정 기준 결정적 seed로 미저장 GET/새로고침에도 동일, 초기화는 새 random seed. 기본 종 1마리만 IV15/EV0/Lv5. 사용자 이전요청(포획은 스타터해금 아님, 알 부화/관리자지급으로해금) 유지.
- 새 탐험전용 채팅을 같은 포켓몬 프로젝트에 실제 생성: 01a19cdc-65e0-7ab1-b73b-3eda873a3a07. ADVENTURE_HANDOFF.md와 소유범위를 초기에 전달. 여기서는 로그라이크 및 공통시스템 작업 계속.
- 관리자 초기화/복구: db/schema.ts와 drizzle/0010_polite_jackpot.sql 추가, 로컬에만 마이그레이션 적용. lib/admin-player-reset.ts, components/admin-player-reset.tsx, admin API/UI 연결. 게임·닉네임 확인, 스냅샷 CAS, 트랜잭션 백업, 감사기록, 초기화 후 진행이 바뀌면 복구차단. 탐험은 온라인대전/미완료교환 중 차단. 실제 로컬 dummy3만 초기화→복구/오류/감사/계정프로필보존 양쪽게임 테스트통과. 운영DB에는 미적용.
- 알 상점은 사이드바·상단 '알 뽑기'로 직접 접근. 동일 종·폼·색상 중복 부화는 구매가25% 서버환급,중복에도 사탕·유전기·IV 갱신; 첫 신종/폼/색상은 환급없음. 단위테스트통과.
- 기술3개 이하일 때 빈 슬롯에 자동학습,4개가 차야 교체선택. 이전에대기중인저장도repair. native실전요청에도새기술반영.
- 더블배틀 기절한 슬롯은 대기, 벤치있으면 강제교체, 벤치없으면 살아있는 포켓몬만 행동. 교체 후 stale CPU명령 실행오류도 수정. 빈/기절 Pokemon과 HP바는 연출 종료 후 숨김. 실제 native전투테스트통과.
- 더블야생 적 둘 중 포획대상선택/볼 종류별 원본 atlas/서버 대상검증, 한 마리포획 후 남은적과 전투 유지. 빈파티공간이면새고유ID로자동추가;6마리면선택후교체/놓아주기. 강제교체/남은상대턴/스냅샷 검증. 관련 `tests/rogue-double-capture.test.mjs` 통과. 코드최근연결이므로 실제브라우저/전체200층 회귀는 아직 필요.
- BattlePanel 설명툴팁중복방지, 포획결과·승리패널 개선, boss-announcement/battle-polish CSS연결. 포켓몬 기절후sprite/HP HUD 숨김. 새기술비교 rogue-move-learn 및 웨이브완료 rogue-wave-clear UI를부모에연결.
- 원본 볼 atlas `public/game/balls/pb.png`/json은원본무수정, 전용metadata에권리조건(LicenseRef-FAIR-USE) 기록. Spiky-eared Pichu HGSS front/back/shiny4개의공식PokeAPI PNG가추가검증되어 202개명시적선택폼에실제front/back/shiny 식별경로 있음.
- Pokerus UTC일일5스타터 및 party전파/기본희귀도+행운 기록, Minun TM 원본정적필터 보정. 관장/트레이너 272종 template정적규칙,272종 species filter,561 member callback IR을독립AST추출. template일부연결했으나 species filter/member 1082 opcode/Rival후처리 전체런타임연결은미완성.
- 2026-11-03 latest: `npm run typecheck` 통과, `npm test` 34개 통과. 실제200층 자연완주/모바일/모든특성·중첩아이템·트레이너 고유효과와자산라이선스/운영관리자암호변경은 미완료. 공개사이트는 여전히기존 v4. 미완성출시 금지라는사용자조건 준수.
- dev server session 29643/port5173, 임시mockauth와무시된 .dev.vars에사용자지정신규관리자암호(출력금지) 포함. 최종패키징전 mock플러그인을 `.sites-runtime/sites-vite-plugin.original.ts`로복원, .dev.vars 제거. 출시때만 지정 Sites 프로젝트의 ADMIN_PASSWORD를사용자최신값으로native environment update하고 ADMIN_EMAIL/기존다른Sites보존.

## 알 교환권 전환 작업 (구현 중, 검증 전)
- 원작 1.12.2.3의 교환권 4종과 1/5/10/25회 사용, 기술·전설·색이 다른 모습 기계 구성을 참고했다. 원작 소스 코드를 복사하지 않고 별도로 구현했다.
- 기존 코인과 구입한 알을 보존하며, 관장·사천왕·챔피언과 200웨이브 완주를 통해 교환권을 지급한다. 기존에 이긴 상대에 대한 소급 지급은 하지 않는다.
- 신규 바우처 알은 중복 시 3,000코인 지급(기존 일반 알 12,000코인 기준 25%). 기존 코인 구매 알은 기존 결제액 기준 25% 환급을 유지한다.
- 현재 알 등급·종·유전기 확률, 최초 보스 보상과 반복 보상은 자체 구현이며 원작과 일치한다고 확인되지 않았다. 자동 웨이브 부화, 원작 전설 픽업·천장 및 업적별 보상은 미구현이다. 현재 수동 부화다.
- UI는 세 기계·교환권·보관 알을 함께 표시하는 반응형 화면으로 교체했다. 작은 화면은 읽기와 조작을 위해 내부 스크롤이 발생할 수 있다. 모든 화면 한 화면 표시는 아직 검증되지 않았다.
- 사용자 요청에 따라 이 변경의 테스트·빌드·실기기 확인은 수행하지 않았다. 독립 테스트 및 화면 검증이 필요하다. 배포하지 않았다.

## 2026-11-03 알 부화 진행 재개 (검증 전)
- 원작 고정 버전의 알 등급별 필요 웨이브 10/25/50/100과 최종 웨이브를 제외한 승리 후 진행을 참고해 남은 웨이브와 자동 부화를 연결했다. 기존 알은 저장된 진행도가 없으면 등급별 초기값으로 시작한다.
- 부화 결과와 중복 환급은 저장과 함께 처리하고, 순서대로 확인할 결과를 저장해 새로고침해도 확인 가능하도록 구현했다. 알 화면의 수동 부화 버튼은 남은 웨이브 표시로 교체했다.
- 원작 등급 기본 확률(204/44/7/1, 전설 UP 203/44/7/2), 등급별 천장 카운터와 유전기 확률을 참고해 수정했다. 알 종 선정·전설 픽업·숨겨진 특성 등은 원작과 완전히 같지 않다.
- 사용자 요청에 따라 테스트·빌드·브라우저 확인은 하지 않았다. 저장 경쟁, 알 여러 개 동시 부화, 새로고침, 포획 후 진행 및 작은 화면 검증이 필요하다. 배포하지 않았다.
- 알 종 후보는 원작 자료의 `eggTier`를 사용하고 비용별 가중치와 해금되지 않은 종 우선 천장 조건을 반영했다. 마나피 전용 알, 전설 픽업, 색 변종 후보 제한과 원작 RNG 순서는 아직 미구현이며 위 변경도 검증 전이다.
- 전설 UP 기계는 매일 바뀌는 픽업 종을 표시하고 전설 알의 50%에 픽업 종을 적용한다. 현재 픽업 순환은 독립 시드여서 원작의 당일 픽업과 같지 않다. UI·저장 검증은 남았다.
- 알의 숨겨진 특성은 해당 특성이 있을 때 1/192로 선택하고, 나머지는 일반 특성에서 선택하도록 수정했다. 관련 자료 해석 및 종별 예외는 미검증이다.
- 일반 알에서 마나피 알이 나올 가능성과 해당 알의 50웨이브 부화, 마나피 1/8·피오네 7/8 선택을 추가했다. 알 ID 기반 원작 RNG와 픽업 순환은 다르며 검증 전이다.

## 2026-11-03 교환권 보상 확장 (검증 전)
- 원작 자료에 있는 보상 후보의 일반·플러스·프리미엄 교환권과 리롤에 따른 가중치 감소를 기존 보상 풀에 추가했다. 전체 보상 풀과 확률은 아직 원작과 동일하지 않다.
- 첫 관장/사천왕 등 보상과 반복 승리의 교환권 등급 구분을 보완하고, 첫 클리어 골드·이후 클리어 프리미엄 및 종 계열별 첫 리본 플러스 보상을 추가했다. 원작의 모든 보스 분류 및 리본·도전 모드 조건은 아직 연결되지 않았다.
- 사용자 요청에 따라 테스트·빌드·브라우저 검증은 수행하지 않았으며 배포하지 않았다.
- 공식 저장소의 악의 조직 리더 설정을 참고해 조직 리더에게 보스 표시·보스 상금 배율·최초 및 재대결 교환권 지급을 추가했다. 기존 저장된 전투는 다음 전투 생성부터 새 메타데이터가 적용된다. 미검증이다.
- 알 뽑기 후 획득 개수, 기본 전설 등급 확률과 획득 경로를 화면에 표시하도록 추가했다. 천장 발동 시 실제 확률은 다르며 아직 UI 실기기 검증 전이다.

## 2026-11-03 전설 픽업 (검증 전)
- 공식 저장소의 UTC 일자·전체 후보 순환·시드 이동 방식과 Phaser 3.90 난수 기반 섞기 절차를 참고해 전설 픽업 결정 방식을 교체했다. 후보 순서·난수 출력이 원작과 일치하는지 대조하지 않았으므로 일치 완료로 보지 않는다. 기존 저장과 뽑아 둔 알은 변경하지 않는다.
- 테스트·브라우저 검증 및 배포는 하지 않았다.

## 2026-11-03 배틀 AI 추가 작업 (검증 전)
- 상대가 낼 수 있는 포켓몬이 없을 때 점수 계산에서 빈 대상을 안전하게 처리하고, 공격으로 상대를 쓰러뜨릴 수 있으면 우선도와 마무리 가치를 추가했다. 반동으로 자신의 기절 위험이 높으면 가치를 낮추고, 회복 후에도 즉시 쓰러질 위험이 큰 회복 선택을 낮췄다.
- 피해량 예측과 더블배틀·특수 기술의 결과는 실제 전투와 다를 수 있으며 원작 AI와 동일하다는 뜻이 아니다. 사용자 요청에 따라 테스트하지 않았다.
- 교환권 보상에는 외부 이미지 주소 대신 등급별 로컬 아이콘을 연결해 이미지 출처 장애 가능성을 줄였다. 화면 확인은 아직 하지 않았다.
- 스타터 목록을 함께 내려주는 요청에서 동일한 스타터 목록 계산을 두 번 하지 않도록 정리했다. 실측 성능과 응답 결과는 아직 검증하지 않았다.
- 참고한 고정 원본: https://github.com/pagefaultgames/pokerogue/tree/29441f7aa7482d9e816b253d324293788936dc3e ; 알 규칙 `src/data/egg.ts`, 확률 `src/data/balance/rates.ts`, 보상 `src/modifier/init-modifier-pools.ts`, 바우처 `src/system/voucher.ts`. 비교 기준은 고정 커밋이며 최신 beta와 동일하다고 가정하지 않는다.
- AI의 벽·압정 계열 보조기 평가는 아군/상대 진영을 구분하고 압정·독압정의 최대 중첩 수를 반영하도록 보완했다. 아이템·능력에 따른 세부 효용과 실제 AI 선택은 미검증이다.

## 탐험 모드 별도 작업 인계 (2026-11-03)
- 별도 대화에서 탐험 작업 사본 `C:/Users/USER/Documents/ChatGPT/포켓몬/adventure-work`의 진행 상황을 전달했다. 도시 생태 의뢰 3개 지점·일회성 보상과 선택 트레이너 2명을 추가했고, 해당 사본에서 전체 테스트 51개와 타입 검사가 통과했다고 보고받았다. 이 대화에서 독립 검증한 결과는 아니다.
- 탐험 작업은 원본이나 클라우드 브랜치에 통합·배포되지 않았다. 통합 전 각 사본의 변경과 저장 호환성을 검토하고 현재 작업을 덮어쓰지 않는다. 탐험 모드는 포켓로그를 참고하지 말라는 사용자의 별도 지시를 따른다.

## 2026-11-03 스타터 패시브 (구현·미검증)
- 사탕 비용을 서버에서 확인하고 패시브를 해금하는 동작과 스타터 선택 화면의 해금·사용 여부 설정을 연결했다. 기존 해금 저장은 유지하며 선택하지 않은 패시브는 런에 적용하지 않는다. 패시브 엔진은 일반 특성과 함께 적용하는 어댑터가 있으나 모든 특성 조합은 검증되지 않았다.
- 색이 다른 모습을 해금만 하고 일반 모습을 선택한 경우 행운이 잘못 적용되던 부분을 수정했다.
- 이전 클라이언트는 패시브 선택값이 없을 때 기존과 같이 해금된 패시브를 사용한다. 오류·저장 충돌·사탕 차감·배틀 능력 및 모바일 화면은 사용자 요청대로 테스트하지 않았다.
- 알 후보 목록을 등급별로 재사용하고 일일 픽업 결과를 날짜별로 캐시해 요청마다 같은 목록을 반복 계산하지 않도록 했다. 성능 향상은 측정하지 않았다.
- 매 전투 연출 생성마다 다시 만들던 기술 이름 인덱스를 재사용하도록 바꾸었다. 기존 중복 이름의 마지막 항목 우선 동작은 유지했으며 응답 속도는 측정하지 않았다.
- 알 보관함에 직접 선택 목록을 추가해 알이 많을 때 앞뒤 버튼만 여러 번 누르지 않아도 되도록 했다. 작은 화면의 실제 가독성은 미검증이다.
- 스타터 비용 감소의 서버 조건을 단순 포획 기록에서 실제 스타터 등록 여부로 바꿨다. 사용자가 정한 알 부화/관리자 지급 해금 규칙을 직접 요청에도 적용한다. 미검증이다.
- 알의 유전기 선택은 데이터에 실제로 존재하는 기술만 고르고, 없는 경우 해금했다고 표시하지 않도록 수정했다. 부화 결과에 실제 해금된 유전기 이름을 표시한다. 저장된 기존 알과 희귀 유전기 예외를 포함한 회귀 검증은 남았다.

## 2026-11-03 부화 결과 접근성 (검증 전)
- 알 뽑기 화면으로 바로 접속한 경우에도 확인하지 않은 부화 결과 수와 결과 화면으로 이동하는 버튼을 표시하도록 추가했다. 실제 화면 크기·저장 재개·여러 알 순서 검증은 수행하지 않았다.
- 알 뽑기 화면에 희귀·에픽·전설 기본 등급 확률을 표시하고 천장에 따라 달라질 수 있음을 함께 명시했다. 원작의 개별 종·색 변종 확률을 모두 표시한 것은 아니다.

## 2026-11-03 바이옴 필드 연결 (구현·미검증)
- 바이옴에서 뽑아 둔 필드(미스트·일렉트릭·그래스·사이코)를 새 전투의 시뮬레이터에 연결했다. 바이옴 필드는 지속 턴을 두지 않으며, 이미 특성 등으로 설정된 필드가 있다면 덮어쓰지 않는다.
- 전투 중 필드가 바뀌거나 사라진 뒤 별도 트레이너 전투로 전환되는 모든 경계의 원작 동등성, 시작 순서와 저장 재개는 아직 검증·보완이 필요하다. 사용자의 지시에 따라 테스트와 배포는 하지 않았다.
- 원작 `resetArenaEffects` 자료에 따라 새 트레이너 등 별도 전투로 넘어갈 때 직전 전투의 영구 날씨·필드만 이어가고 임시 효과를 제거하도록 연결했다. 새 바이옴은 새로 뽑은 조건을 사용한다. 기존 저장에 전투 스냅샷이 없는 경우 기존 바이옴 값으로 폴백한다. 직렬화 형태·특성 진입 순서·저장 재개는 아직 검증하지 않았다.
- 같은 바이옴에서 야생전이 싱글↔더블로 바뀌어 전투 객체를 새로 만들어야 할 때도 임시 날씨·필드의 남은 턴을 보존하도록 연결했다. 개별 포켓몬의 능력치 변화와 그 밖의 필드 태그는 이 형식 전환에서 완전히 보존되지 않으며, 실제 효과·턴 경계는 미검증이다.
- 진화 날씨 조건과 바이옴 표시가 최초 바이옴 날씨만 참조하지 않고, 가장 최근 전투에서 바뀐 날씨·필드 상태를 우선 참조하도록 수정했다. UI와 시뮬레이터 경계 테스트는 남아 있다.
- 바이옴 이동 시 다음 웨이브의 해질녘·밤에는 맑은 날씨를 뽑지 않도록 원작의 시간대 제한을 반영했다. 안개는 시뮬레이터 효과가 아직 연결되지 않아, 안개가 뽑히는 경우 실제 안개 효과로 동작하지 않는다. 숲의 야간 안개 가중치와 정확한 RNG 순서도 미구현이며 테스트하지 않았다.
- 전투 화면에 원시회귀 날씨·난기류의 한국어 이름을 추가하고, 날씨 또는 필드가 하나만 있을 때 빈 표시가 생기지 않도록 정리했다. 실제 표시 검증은 아직 하지 않았다.
- 전투 중 실제 활성 필드에 따라 배경 아래쪽에 유형별 색감을 더했다. 포켓몬과 체력 표시를 가리지 않도록 배경층에만 적용했으며, 화면 효과와 모바일 대비는 미검증이다.
- 스타터 사탕 사용에 성공하면 비용 감소 또는 패시브 해금 완료 문구를 접근 가능한 기존 상태 안내에 표시하도록 했다. 실패 시 기존 서버 오류 표시를 유지하며 검증 전이다.
- 원시회귀·난기류 날씨가 발생할 때 전투 로그에 각각 한국어 메시지를 표시하도록 추가했다. 메시지 흐름은 미검증이다.
- 전투에 바이옴 식별자를 기록해 구간 이동 직후 이전 구간의 날씨·필드가 새 바이옴 설명에 잠깐 표시되지 않게 했다. 식별자가 없는 과거 저장은 바이옴 기본값으로 표시한다. 미검증이다.
- 같은 바이옴 야생전에서 싱글·더블 형식이 바뀌어 새 전투 객체가 필요한 경우, 직전의 살아 있는 출전 포켓몬 순서와 능력치 랭크를 가능한 범위에서 이어가도록 추가했다. 임시 상태·입장 특성 재발동·대상 참조 등은 아직 완전한 연속성이 아니며, 원작 동등성과 직렬화·기절·교체 경계는 미검증이다.
- 트레이너 AI에 혼란·씨뿌리기·도발의 기본 효용을 추가했다. 이미 걸린 효과, 대타, 마이페이스와 풀 타입에 대한 일부 실패 조건을 고려하지만 모든 특성·도구·상태 예외와 전략은 아직 다루지 않으며 전투 테스트 전이다.
- 바이옴 눈 날씨를 시뮬레이터가 실제로 인식하는 `snowscape` 상태에 연결하고, 과거 저장의 `snow` 값도 새 전투에서 변환한다. 눈 진화 조건·화면 표기·전투 로그 역시 두 이름을 처리하며 날씨 로그의 대소문자를 정규화했다. 실제 방어력·저장 호환성은 테스트 전이다.
- 눈·모래바람·큰비·매우 강한 햇살·난기류에 각각 옅은 화면 색감을 추가했다. 기존 HP·기술 UI 가독성 및 모바일 화면은 미검증이다.
- 재개한 전투·바이옴 작업에는 `game-engine` 스킬의 입력·상태 갱신·렌더링 분리 및 프레임 경계 지침을 참고했다. 전투 규칙은 고정 원작 자료와 시뮬레이터 상태를 기준으로 별도 구현한다.
- 전설 기계에 오늘의 픽업 포켓몬 이미지를 추가하고, 뽑기 요청 시 화면에 표시된 픽업 종이 서버의 현재 UTC 픽업과 일치해야 교환권을 소모하게 했다. 날짜 변경으로 오래된 화면을 사용하면 새로 불러오라는 오류를 반환한다. 화면과 날짜 경계는 미검증이다.
- 원작의 화면·음원은 별도 저장소 https://github.com/pagefaultgames/pokerogue-assets 에 있다. 저장소 안내상 자산은 파일별 REUSE 예외를 확인해야 하며 기본 안내는 CC-BY-NC-SA-4.0이다. 로고 등은 별도 재사용 금지 표시가 있다. 이번 작업은 해당 저장소의 자산을 가져오지 않았고 픽업용 포켓몬 이미지는 기존 이미지 출처·폴백을 사용한다. 자산별 최종 권리 확인은 아직 남았다.
- 상태이상 적용 이벤트에 독·화상·마비·잠듦·얼음별 색상과 기호 효과를 추가했다. 실제 전투 이벤트의 대상 위치를 사용하며, 움직임 줄이기 설정을 따른다. 2대2 좌표·재생 시간·모바일 화면은 테스트 전이다.

## 2026-11-03 사용자가 제공한 포켓로그 ZIP 참고본
- `C:/Users/USER/Downloads/pokerogue-beta.zip`의 SHA-256은 `96051486E0198CDC6F7C63436D87531D4802AE1C147715EDEED77734303B76A9`, `package.json` 버전은 1.12.2.3이다. ZIP에는 실행 가능한 전체 서비스 구성에 필요한 `assets`·`locales` 서브모듈 파일이 들어 있지 않다.
- 원본 ZIP을 수정하거나 코드를 실행하지 않았다. `src`와 출처·라이선스 문서만 경로 검사 후 `work/pokerogue-user-beta-20261103`에 별도 참고용으로 풀었으며, ZIP의 환경변수 파일은 가져오지 않았다.
- 기존 고정 참고본과 줄바꿈을 통일해 비교한 결과 ZIP의 소스 중 527개는 내용이 같고, 57개는 Phaser import만 다르며, 58개에는 그 외 차이가 있고 ZIP에만 있는 소스 8개가 있다. ZIP에는 이전 참고본에만 있는 파일도 있으므로 이것이 전체 차이 목록은 아니다. 이 ZIP은 Phaser 4.2.1 의존성을 선언하며 이전 참고본은 Phaser 3.90이다.
- 알 확률·바우처·알 뽑기 화면의 핵심 파일은 동일하거나 Phaser import만 다르다. 부화·진화·테라 및 스프라이트 처리는 Phaser 4 렌더 노드로 변경된 부분이 있어 향후 시각 연출 작업 시 새 참고본을 우선 살펴본다. API·로그인·사용자 데이터 분리 등 이 게임의 구조가 달라 원본 코드를 그대로 교체하지 않았다.
- 해당 ZIP을 참고한 이후 변경도 테스트와 배포는 하지 않았다. 사용자의 개별 파일 권리 및 자산별 라이선스 확인은 별도로 남아 있다.
- 제공된 ZIP의 부화 연출 흐름(알 흔들림·균열·빛·색이 다른 모습의 반짝임)을 참고해 기존 자체 SVG/CSS에 균열, 빛줄기와 이로치 반짝임을 더했다. 원본 자산이나 Phaser 코드를 복사하지 않았다. 재생 타이밍·모바일 가독성은 테스트하지 않았다.
- 사용자가 제공한 ZIP의 포켓몬 행운 계산을 확인해, 기존 진행 중 저장에서도 일반 모습이 저장된 행운 숫자만으로 이로치 행운을 얻지 않도록 보상·야생 출현 계산을 보완했다. 저장 데이터를 수정하지 않고 계산 시 적용한다. 융합 포켓몬의 모든 행운 규칙은 별도 미구현·미검증이다.

## 2026-11-03 안개 날씨 (구현·미검증)
- 사용자가 제공한 ZIP의 `src/data/moves/move.ts`, `src/field/arena.ts` 및 안개 관련 참고 자료를 읽어, 안개 상태를 별도로 저장하고 수치 명중률 90% 적용, 날씨 무효 특성 확인, 다른 날씨로 교체, 안개제거, 솔라빔·솔라블레이드와 광합성·아침햇살·달의불빛의 기본 효과를 연결했다. 야간 숲 안개 후보와 UI 표시도 추가했다.
- 네이티브 시뮬레이터에 안개가 없어 별도 어댑터로 처리한다. 패시브 날씨 무효 특성, 모든 날씨 관련 기술·특성, 저장 복원과 더블배틀 이벤트 순서가 원작과 같은지는 확인되지 않았다. 참조용으로 ZIP의 안개·필드·알 관련 테스트 소스 네 파일만 추가로 풀어 읽었고 테스트는 실행하지 않았다. 배포하지 않았다.

## 탐험 모드 별도 작업 추가 인계 (2026-11-03)
- 별도 대화가 `C:/Users/USER/Documents/ChatGPT/포켓몬/adventure-work`에서 야생 정원·야간 배틀존·냐스퍼 고정 조우·호텔 NPC·분기와 메가 사건 보상·NPC 충돌을 추가했다고 전달했다. 해당 사본에서 테스트 57개·타입 검사·빌드 통과를 보고했으나 이 대화에서 독립 확인하지 않았다.
- 상태 필드와 실내 위치 값의 저장 호환성, 다른 클라우드 브랜치의 미푸시 커밋을 포함한 3방향 비교가 통합 전에 남아 있다. 원본이나 운영 사이트에 통합·배포하지 않았다. 탐험 작업에서는 포켓로그를 참고하지 않는다는 사용자 지시를 유지한다. 자세한 내용은 그 사본의 `ADVENTURE_PROGRESS.md`를 확인한다.
- 정정: 위 안개 구현 기록 중 안개제거와 광합성·아침햇살·달의불빛 효과가 연결됐다는 설명은 더 이상 유효하지 않다. 시뮬레이터의 저장 직렬화가 함수가 바뀐 기술을 저장하지 못할 수 있는 문제를 코드 검토에서 확인해 해당 부분을 제거했다. 이 기술들은 안개에서 아직 원작과 다르게 동작한다. 명중률·솔라빔 계열·다른 날씨로 교체는 구현했으나 여전히 테스트 전이다.
- ZIP의 환경설정이나 프로그램은 실행하지 않았다. 이후 안개·필드·알 동작을 읽기 위해 관련 테스트 소스 네 파일을 참고 폴더에 추가했으며 실행하지 않았다.
- 안개에서 광합성·아침햇살·달의불빛이 최대 HP의 1/4을 회복하도록 기술 함수 자체를 변경하지 않는 회복 이벤트 방식으로 다시 연결했다. 대기 무효 특성과 다른 회복 보정의 실행 순서는 아직 테스트하지 않았다. 안개제거는 여전히 미구현이다.
- 제공된 ZIP의 웨더볼 규칙을 참고해 안개에서도 노말 타입을 유지하면서 위력이 두 배가 되도록 추가했다. 안개제거, 모든 특성 연계 및 실제 피해 계산 검증은 남았다.
- 여러 알이 같은 웨이브에 부화할 때 결과 장면의 식별자를 알마다 바꿔 흔들림·빛·반짝임 연출이 다음 알에서도 다시 시작되도록 했다. 연속 재생·접근성은 미검증이다.
- 새 알 뽑기 요청을 시작할 때 이전 성공 문구를 지워, 날짜 변경이나 교환권 부족 오류 뒤에 오래된 성공 메시지가 남지 않도록 했다. UI 오류 흐름은 미검증이다.
- 안개 억제 판정에서 기본 특성뿐 아니라 패시브로 활성화된 날씨 무효화·에어록도 확인하도록 보완했다. 일반 날씨의 모든 패시브 억제 경로는 별도로 남아 있으며 이 판정도 미검증이다.
- 패시브 날씨 무효화·에어록이 안개 외의 기본 날씨에도 작동하도록 전투 시뮬레이터의 날씨 억제 조회를 보완했다. 특성 억제·패시브 조합, 직렬화 복원 및 날씨 변경 순서는 검증 전이다.
- 스타터 편성의 포인트 옆에 선택한 색이 다른 포켓몬에 따른 파티 행운을 표시했다. 일반 모습을 선택했을 때는 더하지 않으며 서버의 최대 14 제한과 맞췄다. 실제 보상 확률 및 화면 검증은 아직 하지 않았다.
- 주의: 현재 스타터 화면에는 이로치의 노랑·파랑·빨강 변종을 각각 고르는 기능이나 변종별 실제 이미지가 없다. 이로치를 선택할 때 저장된 최고 변종의 행운 수치를 사용하므로, 변종 선택과 표시를 구현하기 전까지는 원작과 완전히 동일하지 않다. ZIP의 자산 서브모듈이 없어 변종별 이미지 출처·조건 확인도 남았다.
- 트레이너 AI가 날씨 기술을 고려할 때 이미 같은 날씨인지, 날씨 억제 상태인지, 자신의 공격 타입·일부 날씨 특성과 어울리는지 확인하도록 추가했다. 모든 날씨 시너지·상대 이득·특수 날씨 예외는 아직 포함하지 않았고 전투 검증 전이다.
- 트레이너 AI가 독 상태의 면역을 확인할 때 맹독도 독 면역으로 취급하고, 신비의부적·대타·전기자석파의 땅 타입 면역·매직미러 일부를 고려하도록 보완했다. 특성 무시·상태 면역의 모든 예외와 실제 선택 결과는 미검증이다.

## 2026-11-03 공통 전투 초기 HP·상태 표시 (구현·미검증)
- 별도 탐험 작업에서 전달한 기존 HP 37/50이 전투 등장 이벤트에서 잠시 50/50으로 표시되는 문제를 공통 `createCombat` 경로에서 수정했다. 초기 출전 이벤트에 실제 시뮬레이터의 복원된 HP·최대 HP·상태를 반영하며, 이후 일반 교체 이벤트는 수정하지 않는다.
- 전투 시작 시 저장된 상태를 다시 보여주는 중복 상태이상 연출·로그를 제거하고, 예비 파티원 상태가 `setStatus`의 비활성 포켓몬 제한 때문에 누락되는 경로를 보완했다. 잠듦의 남은 턴은 기존 저장에 없으므로 새 전투 기준으로 설정한다.
- 이 내용은 탐험 스레드의 재현 보고와 코드 검토를 바탕으로 구현했으며, 사용자 요청대로 테스트·브라우저 확인은 하지 않았다. 초기 특성·아이템에 의한 상태 변화, 맹독·잠듦, 강제 교체, PvP 및 로그와 HP 일치 검증이 필요하다. 탐험 사본 및 운영 데이터를 변경하지 않았다.
- 포켓로그의 새 전투에서도 엔진이 파티 HP를 복원하기 전에 등장 로그를 만든 경우, 첫 등장 이벤트를 실제 복원 값으로 보정하도록 같은 처리를 추가했다. 이후 교체 이벤트와 이미 상태 복원 후에 생성된 등장 로그는 그대로 둔다.
- 새 클래식 전투에서 저장된 잠듦·맹독 상태를 복원할 때 필요한 잠듦 턴과 맹독 단계 초기값도 채웠다. 이전 저장에 잠듦 잔여 턴이 없으므로 새 전투 기준 값을 생성하며, 실제 상태 지속·특성 상호작용·HP 연출은 사용자 요청대로 테스트하지 않았다.
- 탐험 스레드는 별도 사본의 `lib/adventure-combat.mjs`에도 임시 초기 HP 표시 보정을 추가하고 격리 API·모바일 미리보기로 37/50 표시를 확인했다고 후속 전달했다. 이 대화에서는 직접 확인하지 않았다. 공통 수정과 사본 보정이 통합될 때 중복 적용 및 이벤트 순서를 반드시 3방향 비교해야 한다.

## 2026-11-03 더블배틀 빈 자리 처리 (구현·미검증)
- 더블배틀에서 교체할 포켓몬이 없어 첫 출전 자리가 비었을 때, 남은 포켓몬의 교체 후보를 계산하며 빈 자리를 역참조할 수 있는 경로를 수정했다. 실제 더블배틀·기절·교체 흐름은 사용자의 지시에 따라 테스트하지 않았다.
- 더블배틀에서 포획 후 파티를 정리할 때 빈 출전 자리를 역참조하지 않고, 실제 교체 가능 포켓몬이 있을 때만 강제 교체 요청을 만들도록 수정했다. 포획·교체·빈 자리 조합은 미검증이다.
- 안개제거가 실제 명중했을 때 안개를 없애고, 안개만 제거한 경우에도 성공으로 처리하도록 전투 호출 경계에서 연결했다. 임시 기술 함수를 `finally`에서 원복해 저장 직렬화에 남지 않도록 했다. 반사·방어·저장 경계 등 실제 동작은 테스트하지 않았다.
- 일격기처럼 시뮬레이터가 일반 명중률 조정 단계를 건너뛰는 기술에도 안개 명중률 보정을 별도로 연결했다. 필중·특성·레벨 조건과 중복 적용 여부는 아직 전투 검증 전이다.
- 포획으로 한 턴을 보낼 때 빈 자리에도 시뮬레이터의 기본 pass 형식으로 행동을 채우도록 바꿨다. 포획 후 상대 턴·더블배틀의 실제 실행은 미검증이다.
- 포획 후 강제 교체 요청은 빈 자리 자체가 아니라 네이티브 엔진이 실제로 교체 요청 플래그를 설정한 자리와 살아 있는 교체 후보가 함께 있을 때만 생성한다. 빈 자리에 새 포획 포켓몬이 생기는 모든 경계의 자동 출전·교체는 아직 검증 및 보완이 필요하다.
- 공통 전투의 저장 상태 복원은 출전 여부와 관계없이 상태를 직접 복원하고 `Update`에서 실제 특성 효과가 처리되도록 정리했다. 기존 상태를 새로 걸린 상태처럼 재발동해 로그를 만들지 않으며, 잠듦·맹독 상태값을 초기화한다. 특성에 의한 즉시 회복·빙결 폼 변화 등 경계는 별도 검증이 필요하다.
- 더블배틀에서 네이티브 엔진이 실제로 비어 있는 자리에 pass를 처리할 때 포켓몬 객체를 가정하는 부분을 클래식 전투 어댑터에서 보완했다. 살아 있는 포켓몬의 행동은 기존 검증을 그대로 따른다. 실제 빈 자리·강제 교체·직렬화 복원 테스트는 남아 있다.
- 네이티브 기절·교체 확인 중 실제 빈 출전 자리를 건너뛰도록 클래식 어댑터를 보완했다. 기존 기절 객체의 교체 플래그 동작은 유지한다. 빈 자리에서 새 파티원이 생기는 경우의 출전 선택과 전체 배틀 회귀는 여전히 미검증이다.
- 전설 기계의 픽업 50%는 전체 알이 아닌 전설 등급 알에서의 조건부 확률임을 화면 문구에 명확히 표시했다. 화면 확인은 아직 하지 않았다.
- 확률 표시 보충: 전설 알의 50% 확정 분기 외 나머지 일반 후보에서도 픽업 종이 나올 수 있으므로 실제 픽업 총 확률은 50%보다 높을 수 있다.
- 야생전 승리와 같은 턴에 내 포켓몬이 쓰러졌거나 강제 교체 상태가 남은 경우, 해당 조건을 지원하지 않는 기존 연속 전투 경로를 호출하지 않고 새 전투 경로로 전환하도록 가드했다. 살아 있는 기존 출전자를 우선 유지하고 가능한 랭크는 이어가지만, 교체 포켓몬 선택·모든 임시 효과 보존은 원작과 같지 않으며 미검증이다.
- 더블배틀 AI가 현재 전장에 있는 두 마리를 교체 후보로 잘못 세어 교체할 상대가 없는데 압정을 선택하지 않도록, 살아 있는 비출전 후보 수를 기준으로 바꿨다. 실제 선택 결과는 미검증이다.
- 회복봉인 상태의 포켓몬에게 회복 기술을 사용하려는 AI 선택을 낮추도록 보완했다. 모든 회복 불가 조건은 아직 포함하지 않았다.
- 제공된 ZIP의 보스 생성 규칙을 참고해 야생 보스의 IV를 두 값 중 높은 쪽에 75% 가깝게 생성하도록 보완했다. 전설·환상 출현으로 보스 구간이 생기는 경우에도 보스 상태를 함께 표시한다. 트레이너 개별 보스 IV, 원작과 정확한 RNG 순서 및 배틀 난이도는 아직 미검증이다.
- 포획 포켓몬을 아군으로 전환하면서 보스 표시를 제거하기 전에 원래 보스 여부를 별도 보존해, 보스 포획 시의 사탕 배율 판정에 전달하도록 수정했다. 아군에게 보스 실드는 부여하지 않는다. 실제 중복 포획·사탕 지급 및 저장 회귀는 미검증이다.
- 야생 보스의 두 번째 IV 세트는 ZIP의 비트 추출 구조를 참고해 난수 한 개에서 여섯 능력치를 얻도록 조정했다. 최초 IV 난수 생성과 전체 RNG 순서는 여전히 원작과 다르며 미검증이다.
- 날씨 AI에서 모래바람이 땅·강철 공격 자체를 강화한다고 간주하던 휴리스틱을 바로잡았다. 바위/얼음 타입의 방어 이점과 실제 불꽃·물 공격, 태양 충전 기술 및 일부 특성을 구분한다. 완전한 날씨 평가가 아니며 미검증이다.
- AI가 고정 회복 기술뿐 아니라 광합성·아침햇살·달의불빛·모래모으기도 날씨에 따라 예상 회복량을 계산하도록 추가했다. 날씨 억제·회복봉인과 위험한 상황의 기본 판단을 포함하지만 모든 특성·도구 및 실제 선택은 미검증이다.

## 2026-11-03 기술머신 보상 (구현·미검증)
- 제공된 ZIP의 기술머신 보상 자료를 참고해 위력 기반으로 추정하던 등급 대신 고정 원작 자료 `data/rogue-trainer-tms.json`의 COMMON/GREAT/ULTRA 등급을 사용한다. 배울 수 있는 종·폼 목록에서 이미 아는 기술, 현재 레벨까지 되새길 수 있는 해당 종 기술 및 이번 도전에서 사용한 기술머신을 제외하도록 연결했다.
- 기술머신 보상 가중치는 각 등급에서 2/3/11로 조정했다. 융합·도전 규칙·원작에서 미구현으로 표기한 기술의 완전한 제외와 모든 폼 호환성은 남았으며 실제 보상 생성·학습·저장 테스트는 하지 않았다.
- 기술머신과 기억버섯도 기술이 네 개 미만이면 기존 기술을 고르거나 덮어쓰지 않고 빈 자리에 자동으로 배우도록 서버와 보상 화면을 수정했다. 네 개일 때만 잊을 기술을 선택한다. 빈 자리·오래된 클라이언트·사탕 및 PP 유지와 구매 차감은 미검증이다.
- 기억버섯·기술머신으로 기존 기술을 잊을 때 기술 이력을 남기고 이전 기술의 PP/PP 상승값을 정리하며, 새로 배우는 기술은 기본 PP로 시작하도록 보완했다. 기술별 PP·재학습 경로와 저장 호환성은 미검증이다.
- 레벨업 기술 교체에서도 잊은 기술의 PP와 PP 상승값을 정리하도록 동일한 정책을 적용했다. 실제 배틀 PP와 재학습 검증은 하지 않았다.
- ZIP과 기존 고정 참고본의 기술머신 등급·트레이너 제한 목록·전용 기술 자료는 줄바꿈을 제외하면 동일했다. 기존 정적 추출 자료의 출처 표기를 유지하고 별도 데이터를 덮어쓰지 않았다.
- 트레이너 AI가 아군이 공격할 수 있는 더블배틀이나 상대의 지속 피해가 있는 상황에서, 큰 피해가 예상되면 방어 계열 기술을 고려하도록 추가했다. 연속 방어에 따른 실패 위험을 줄이기 위해 연속 사용 상태에서는 점수를 주지 않는다. 모든 우선도·확률·필중 예외 및 실제 선택은 미검증이다.

## 2026-11-03 트레이너 조건부 파티 처리 (구현·미검증)
- 기존 추출 자료의 트레이너 후처리에서 `if` 조건을 버리던 런타임 투영을 확장했다. 웨이브 번호·포켓몬 종·폼 번호와 정수의 동등 비교만 해석하고, 선택된 분기의 기존 지원 특성·성별·고정 기술 명령을 적용한다.
- 폼 변경·switch 및 해석할 수 없는 조건은 안전하게 표시자만 남기고 관련 처리를 계속 제한한다. 실제 폼 변경, 중첩 분기의 모든 의미, 트레이너별 기술·특성과 실행 결과는 아직 검증 전이다. 정적 자료 생성만 수행했으며 원작 코드를 실행하지 않았다.
- 트레이너 후처리에서 이미 기본 폼인 포켓몬을 다시 기본 폼으로 지정하는 명령은 실제 폼 변화가 없는 것으로 구분했다. 해당 조건 분기의 다른 지원 명령을 적용할 수 있다. 비기본 폼 변경과 정적 추출이 불가능한 폼 명령은 계속 제한하며 미검증이다.
- 트레이너 기술 후보를 만들 때 현재 포켓몬의 폼별 레벨 기술·기술머신 자료를 사용하고, 진화 전 계열만 기본 폼을 참조하도록 보완했다. 트레이너 후처리의 미구현 폼을 새로 생성하는 기능은 아니며 후보·가중치와 실제 전투는 미검증이다.
- 알 뽑기 화면에 희귀·에픽·전설 등급 보정까지 남은 뽑기 횟수를 표시했다. 전설 UP 기계의 누적 속도를 반영하며, 문구에서 일반 알에 보정이 적용된다는 조건을 명시한다. 실제 표기·보정 경계와 모바일 크기는 미검증이다.
- 초기 HP 보정을 이벤트 생성이 끝난 뒤가 아니라 첫 등장 이벤트를 해석하는 시점에 적용하도록 정리했다. 따라서 같은 초기 연출에 뒤따르는 회복·피해량도 복원된 HP에서 계산할 수 있다. 실제 시작 특성·회복 아이템과 이벤트 순서는 여전히 미검증이다.
- 기술머신 보상에 해당 기술의 설명·타입·위력·명중률을 연결했다. PC에서는 보상에 마우스를 올리면 설명을 볼 수 있고, 선택 상세에서는 모바일에서도 설명을 확인할 수 있다. 일부 기술의 한국어 설명은 원본 데이터가 없으면 기존 대체 설명을 사용하며, 실제 표시와 긴 문구는 미검증이다.
- 기술머신 설명에서 위력 0인 공격기는 변화 기술로 오표시하지 않고 변동 위력으로 구분한다. 표시 데이터와 상세 화면은 미검증이다.

## 2026-11-03 트레이너 정적 폼 일부 (구현·미검증)
- 트레이너 후처리에 조건문이 없고, 해당 종·폼의 로컬 매핑과 시뮬레이터 폼이 모두 존재할 때만 정적 폼을 적용하도록 추가했다. 폼의 종족값·타입·특성·전투 스프라이트를 함께 바꾸고, 원본 후처리가 폼 뒤에 기술을 다시 생성하도록 지시한 경우 기존 부분 기술 생성기를 다시 사용한다.
- 분기와 폼이 섞인 경우, 매핑되지 않은 스타모빌 등의 폼, 동적 formIndex 비교 및 특수 전용 기술 중 지원되지 않는 항목은 적용하지 않는다. 자동으로 원작과 동일하다고 보지 않으며 실제 외형·기술·배틀·저장 테스트는 수행하지 않았다.
- 폼 번호에 의존하지 않는 종·웨이브 조건에서 선택된 폼도 로컬·시뮬레이터 매핑이 확인되는 경우 적용할 수 있도록 범위를 좁혀 확장했다. 기존 폼 번호에 의존하는 분기와 미매핑 폼은 여전히 제외한다. 렌더링·전투·조건별 결과는 미검증이다.

## 2026-11-03 우라오스 거다이맥스 폼 (구현·미검증)
- 원작 ZIP의 폼 변경 자료에 따라 일격·연격 거다이맥스 폼을 각각 시뮬레이터/PokéAPI 폼에 매핑하고, 폼별 종족값·타입·특성·이미지와 지속 거다이맥스 표시가 연결되도록 수정했다.
- 같은 도구에 여러 폼 변경이 연결된 경우 현재 폼과 맞는 변경만 후보로 내놓는다. 매핑된 실제 이미지 접근성·변신 도구 획득·저장 재개·대전 효과는 아직 테스트하지 않았다. 현재 폼에 따라 다른 역변환/특수 조건은 여전히 미구현일 수 있다.

## 2026-11-03 마스터드 우라오스 조건부 폼 (구현·미검증)
- 제공된 원작 소스의 마스터드 우라오스 분기에 필요한 제한된 정수 범위 추첨과 고정 목록 추첨을 자체 시드 흐름으로 해석하도록 추가했다. 폼 변경 후의 폼 번호를 기준으로 조건부 기술을 선택하며, 일격/연격 거다이맥스의 매핑이 확인되는 경우에만 적용한다.
- 범위·목록이 정적인 지원 형태가 아니거나 폼 매핑이 없으면 관련 처리는 계속 제한한다. 원작과 RNG 시퀀스는 다르며, 실제 마스터드 전투·스프라이트·기술·재현성과 저장은 테스트하지 않았다.
- 트레이너의 고정 기술 슬롯을 순서대로 적용할 때, 이전 임시 기술 목록에 같은 기술이 있다는 이유로 지정 슬롯을 건너뛰지 않도록 보완했다. 최종 목록은 시뮬레이터 제약에 맞게 중복과 빈 값을 제거한다. 원작과의 완전한 기술 배치 및 전투는 미검증이다.
- 폼 식별자가 기본 종과 같을 때 실제 구분 가능한 이미지 또는 네이티브 폼을 확인하지 못하면 트레이너 폼 적용을 건너뛰도록 제한했다. 매핑된 별도 전투 스프라이트가 있으면 우선 사용한다. 실 이미지 로딩과 폼별 외형 정확도는 아직 미검증이다.
- 플레이어 폼 변경 시 기존 기본 모습의 직접 이미지 주소가 남아 실제 변신 스프라이트보다 우선 표시될 수 있는 경로를 수정했다. 색이 다른 폼의 전용 이미지가 없으면 일반 색 이미지를 강제하지 않고 기존 이미지 대체 경로를 사용한다. 트레이너 폼에도 같은 선택을 적용했다. 실제 폼별 이미지 로딩은 미검증이다.

## 탐험 모드 별도 작업 추가 인계 2 (2026-11-03)
- 별도 탐험 사본에서 야생 개체·랭크전 선택 목표·파트너 선물/메가스톤 상태를 추가하고 세 최종 진화형의 수동 메가진화를 해당 사본의 시뮬레이터에서 확인했다고 전달했다. 필드 렌더는 이동할 때만 연속 프레임을 요청하도록 바뀌었다고 한다.
- 해당 스레드가 사본 테스트 62개·타입 검사·빌드 통과를 보고했으며 이 대화에서 독립 확인하지 않았다. 실제 기기 성능, 기존 저장 필드 및 원본/클라우드 3방향 통합은 남았다. 상세는 `C:/Users/USER/Documents/ChatGPT/포켓몬/adventure-work/ADVENTURE_PROGRESS.md`를 참조하고, 아직 통합하거나 배포하지 않는다.
- 제공된 ZIP의 메뉴 규칙에 따라 웨이브 보상 선택 단계에서는 알 뽑기 버튼을 비활성화하고, 서버도 보상을 먼저 고르도록 요청을 거부한다. 새 스타터 편성 중에는 이전 슬롯의 보상 상태 때문에 막지 않는다. 보상·다중 부화·슬롯 전환 시 UI 및 서버 흐름은 미검증이다.

## 2026-11-03 여러 알 결과 보기 (구현·미검증)
- 두 개 이상 부화했을 때 한 마리씩 보기와 6개 단위 결과 페이지를 선택할 수 있게 했다. 등록·유전기·중복 환급은 이미 저장된 상태이며 요약의 모두 확인은 대기 중 결과 알림만 제거하고 부화 기록은 유지한다.
- 서버가 보이는 결과 ID 목록과 현재 대기 목록의 순서·개수를 비교하고 저장 리비전도 확인한다. 동시 탭·긴 이름·99개·모바일 한 화면·실제 부화 결과/코인 보존은 사용자의 지시에 따라 테스트하지 않았다.
- 이전 구현에서 저장된 부화 결과에 유전기 이름 필드가 없을 때 실제로 유전기가 없다고 단정하지 않고 `정보 없음`으로 표시한다. 과거 대기 결과의 화면 검증은 아직 하지 않았다.
- 트레이너 AI가 땅에 닿은 상대에게 미스트필드 상태이상 방지나 일렉트릭필드 수면 방지를 무시하고 상태이상 기술을 고르는 경우를 줄이도록 했다. 지형·특성 무시와 모든 기술별 예외는 미검증이다.
- 제공된 ZIP이 명시한 Phaser 4.2.1의 공개 난수기 자료를 코드 비교로 확인한 결과, 일일 픽업에 쓰는 시드 혼합·난수 생성·섞기의 구조는 현재 독립 구현과 같은 계열이다. 후보 목록 순서와 특정 날짜 결과의 실제 대조는 하지 않았으므로 픽업 일치 완료로 표시하지 않는다. 참고: https://github.com/phaserjs/phaser/blob/v4.2.1/src/math/random-data-generator/RandomDataGenerator.js (MIT).
- ZIP의 트레이너 폼 자료 중 제한된 정수 개수 추첨과 종 비교 기반 조건값을 추가로 해석하도록 확장했다. 추첨 결과의 폼이 실제 데이터·시뮬레이터에 매핑되지 않으면 건너뛰며, RNG 동등성·이미지·전투는 여전히 미검증이다.

## 2026-11-03 최신 기술 설명 (구현·미검증)
- 기존 로컬 한국어 설명이 없는 기술 중 18개에 전투 엔진의 기술 효과를 바탕으로 한국어 설명을 추가했다. 상세 설명은 기존 설명과 함께 전투·기술머신 화면에 사용된다.
- 전체 미번역 기술을 모두 채운 것은 아니며, 기술의 원작 차이·효과·표시는 별도로 확인해야 한다. 테스트는 실행하지 않았다.
- 최신 일반 기술의 한국어 설명을 추가하고, 기본 기술의 위력을 따르는 일반 Z기술은 공통 한국어 설명을 제공한다. 이는 전투 엔진의 데이터에 대한 설명이며 Z기술·특수 기술의 모든 플레이 가능 여부가 완료됐다는 뜻은 아니다. 여전히 일부 거다이맥스 기술 등은 원문 대체 설명이 남아 있고 테스트하지 않았다.
- 설치된 전투 엔진 자료에 있는 거다이맥스 전용 기술 33개의 효과 설명도 한국어로 추가했다. 이는 기술 데이터 설명이며, 현재 포켓로그 모드에서 모든 거다이맥스 전용 기술을 사용할 수 있거나 원작과 같은 효과가 완성됐다는 뜻이 아니다. 기술별 실제 사용·효과는 미검증이다.
- 외부 이미지에 의존하는 추가 볼 아이콘이 로드되지 않으면 깨진 이미지 대신 아이콘 대체 표시를 사용하도록 보완했다. 로그볼 등 기존 로컬 볼 아틀라스는 유지한다. 실제 네트워크 오류 화면은 미검증이다.
- HP 회복 이벤트의 실제 대상 위치에 회복 기호와 빛 효과를 추가했다. 색상 외에도 `+` 기호를 사용하고 움직임 줄이기 설정을 따른다. 2대2 위치·수치와 타이밍 및 모바일 대비는 미검증이다.

## 2026-11-03 잠듦 상태 이어가기 (구현·미검증)
- 클래식 전투에서 플레이어 포켓몬의 잠듦 잔여 턴을 저장하고, 다른 전투 객체를 만들 때 유효한 값이면 복원하도록 추가했다. 잠든 야생 포켓몬을 포획할 때도 그 값을 가져오며, 상태 회복·부활·구간 회복 시에는 관련 보조 상태를 지운다.
- 보조 필드가 없는 이전 저장은 기존처럼 새 잠듦 턴을 생성한다. 시뮬레이터와 원작의 초기 잠듦 확률, 얼음·맹독의 세부 턴 처리, 포획·회복·저장 재개·더블배틀 경계는 아직 같다고 확인하지 않았고 테스트하지 않았다.
- 여러 알을 한 마리씩 확인할 때마다 전체 스타터 목록을 다시 내려주던 처리를 줄여, 마지막 알을 확인할 때 목록을 갱신하도록 바꿨다. 전체 결과를 한 번에 확인할 때도 목록을 갱신한다. 응답 크기·체감 속도·선택 화면 동기화는 미측정/미검증이다.
- 저장된 기술 배열에 빈 문자열이나 빈 칸이 남아 실제 세 기술인데 길이가 네 개로 잡히는 경우도 자동 학습이 동작하도록 정규화했다. 기술머신·기억버섯 대상 목록에서도 빈 항목을 실제 기술로 세지 않는다. 과거 저장의 희소 배열과 PP 연결은 미검증이다.

## 2026-11-03 얼음 상태 (구현·미검증)
- 제공된 ZIP의 얼음 상태 규칙을 참고해, 클래식 전투에서 해빙 기술이 아닌 행동 시 1/4 확률로 풀리거나 최대 세 번째 행동 시도에 풀리도록 추가했다. 남은 횟수를 클래식 파티·포획 데이터에 저장하고, 이전 저장에는 3회를 기본으로 부여한다.
- 일반 시뮬레이터의 기본 얼음 이벤트가 중복 적용되지 않도록 상태를 풀거나 행동을 중단하는 이벤트 경계에서 처리한다. 풀죽음·기절·해빙 기술·간접 행동·특성·더블배틀 순서와 실제 확률은 아직 검증하지 않았으며, 원작의 모든 예외를 구현한 것은 아니다.
- 제공된 ZIP의 기본 잠듦 규칙에 맞춰 새로 잠든 클래식 포켓몬의 카운터를 1/3 확률로 2, 2/3 확률로 3으로 설정한다(행동 시 감소하며 실제로는 1~2회 행동을 쉰다). 잠자기는 네이티브의 고정 카운터를 유지하고, 기존 저장의 유효한 남은 턴은 변경하지 않는다. RNG 소비 순서·특성·전투 결과는 미검증이다.
- 상태이상이 치료되는 이벤트에도 대상 위치의 회복 효과를 사용하도록 연결했다. 개별 이벤트 타이밍과 더블배틀 대상은 미검증이다.

## 2026-11-03 마비 행동 불가 확률 (구현·미검증)
- 제공된 ZIP의 클래식 전투 마비 규칙을 참고해, 포켓몬 쇼다운 기본 1/4 대신 클래식 전투에서 1/8 확률로 행동하지 못하도록 어댑터를 추가했다. 기본 마비 속도 효과는 그대로 둔다.
- 네이티브 상태 핸들러 중 행동 불가 판정만 제외하고 별도 이벤트를 사용한다. 능력·간접 행동·이벤트 우선순위·RNG와 실제 상태 지속은 테스트하지 않았고 다른 게임 모드에는 적용하지 않았다.
- 트레이너가 요청한 비기본 폼을 매핑하지 못해 적용하지 않은 경우에는 배틀 표시 데이터에 미지원 상태를 남기고 화면에도 짧게 표시한다. 일부 해석 불가능한 조건에서 요청 폼 자체를 알 수 없는 경우까지 식별하는 것은 아직 미완성이다. UI 크기와 저장 데이터는 미검증이다.
- 원작의 호바귀·펌킨인 `jumbo` 폼 이름을 실제 데이터의 `super` 폼 식별자와 연결했다. 폼별 실제 이미지·크기·전투 데이터는 미검증이다.

## 2026-11-03 로컬 미리보기·전체화면 (구현·미검증)
- 포켓로그/탐험 공통 상단에 전체화면 전환·종료 버튼을 추가했다. 브라우저 Fullscreen API가 허용되지 않는 경우에는 브라우저 안쪽 영역만 채우는 대체 화면을 제공하고 그 차이를 안내한다. 외부 Escape 종료도 상태에 반영한다.
- 로컬 개발 서버를 `http://127.0.0.1:5173/`에서 실행했다. 로컬 앱에서 알 뽑기 화면의 변경 사항이 표시되는 것을 읽기 전용으로 확인했다. 전체화면 실제 전환, 모바일 기기·브라우저/임베드별 지원 및 전체 화면 가독성은 사용자의 테스트 연기 지시에 따라 아직 확인하지 않았다. 운영 배포는 하지 않았다.
- 전체화면 API를 쓰지 못해 브라우저 영역만 채운 경우에도 Escape 키나 버튼으로 돌아갈 수 있도록 했다. 로컬 화면에 버튼이 나타난 것은 읽기 전용으로 확인했지만, 실제 전환 및 모바일 기기 동작은 아직 테스트하지 않았다.
- 사용 중인 로컬 더블배틀 화면을 읽기 전용으로 확인해 전장 높이와 양쪽 스프라이트 최대 크기를 줄였다. 전투 정보·버튼을 압축하고 행동 확인 화면에서는 중복된 행동 선택 목록을 숨긴다(확인 화면의 수정 버튼은 유지). CSS 변경으로 현재 선택한 행동을 초기화하지 않도록 했다. 모든 해상도·긴 포켓몬 이름·모바일 및 실제 조작은 아직 검증하지 않았다.

- 2026-11-03: 더블배틀 강제 교체에서 자동 통과 자리를 상대 명령에 중복 제출하지 않도록 수정. 기절 상태를 재생 시작 시 HP로 정규화하고, 기절 연출 종료 후 스프라이트 재등장을 방지. 35개 바이옴별 프로젝트 제작 배경을 클래식 전투에 연결. 능력치 7종의 현재 랭크 표시 경로 확인. 타입 검사 통과; 실제 더블배틀 및 바이옴 전환 플레이 검증은 미실시.

- 2026-11-03: 위 상대 교체 오류의 실제 원인을 현재 43웨이브 저장 상태의 읽기 전용 메모리 복제로 재현했다. 플레이어 측 대상이 모두 쓰러진 직후 상대의 구멍파기 등 대상 지정 기술에 위치가 빠져 엔진이 거부하는 경우였다. 유효한 위치로 대체하도록 수정했고 같은 복제 상태의 행동이 오류 없이 진행됨을 확인했다. 사용자 저장 데이터는 변경하지 않았으며 브라우저 실전과 다른 기술·교체 조합은 미검증이다. 이전 강제 교체 수정만으로 원인이 해결되었다는 뜻은 아니다.
- 기절 연출 중 숨김 스타일이 즉시 적용되어 사라지는 효과가 끊기지 않도록 현재 기절 이벤트에 한해 표시를 유지한다. 브라우저 연출은 미검증이다.
- 더블배틀 빈 자리는 엔진이 위치별 pass를 요구하므로 상대 행동에서 명시적으로 유지했다. 이전에 추정한 pass 제거 수정은 되돌렸으며 실제 원인은 대상 없는 구멍파기 명령이다.

- 2026-11-03: 43웨이브에서 파티 6마리 HP가 0인데 내부 생존 수가 3으로 남아 전투가 종료되지 않는 저장을 확인했다. 기절 처리 후 승패 확인 시 실제 생존 포켓몬을 다시 세도록 수정했고, 기존에 멈춘 저장은 양쪽 상태를 서버에서 재확인한 후 패배 결과로 이어지는 복구 경로를 추가했다. 읽기 전용 저장의 메모리 복제본에서 패배 전환을 확인했으며, 실제 저장·브라우저 결과와 다른 전투 경계는 미검증이다.

- 2026-11-04: 기존 43웨이브 저장이 defeat로 전환된 것을 읽기 전용으로 확인했다. 엔진의 전투 시작 코드가 남은 수를 파티 전체 크기로 초기화하는 것을 확인하여 클래식 전투 시작 후와 저장 복원 시 실제 생존 수로 재계산한다. 이전의 승패 확인 시 재계산도 유지한다. 새 전투 및 각 경계의 실제 플레이는 미검증이다.

- 2026-11-04: 요청 변경에 따라 포획 시 해당 진화 계열의 스타터도 등록하며 기존 포획 횟수가 기록된 저장도 다음 조회 때 등록되게 했다. 최초 기본 스타터는 기존 무작위 한 마리를 유지한다. 야생 조우 시작 시 교체 가능한 출전 포켓몬별로 턴을 쓰지 않는 교체 선택을 추가했다. 스타터 상세 능력치·기술·사탕 영역을 압축했다. 단일 교체의 독립 메모리 흐름 및 타입 검사는 확인했으나 포획 이력 이전, 더블배틀·함정/특성/교체 효과 및 모바일 실화면은 미검증이다.
- 스타터 상세의 축소된 초상화 틀에 기존 큰 이미지 크기가 남아 그림이 튀어나오던 스타일을 수정했다. 실제 화면 크기별 확인은 아직 하지 않았다.
- 스타터 초상화가 컴포넌트의 해상도별 이미지 크기 규칙에 덮여 잘리는 경로를 보완하고 상세 설정 간격을 추가로 줄였다. 실제 사용자 화면 재확인은 아직 하지 않았다.

- 2026-11-04: 기술 설명 생성기가 최신 세대에서 삭제된 기술의 사용 불가 안내를 우선 선택하던 문제를 수정했다. 동일 자료의 이전 유효 한국어 설명으로 대체하며, 거품은 스피드 감소 가능성 안내로 바뀐다. 기술별 세대 차이와 실제 전투 효과는 별도 검증이 필요하다. 정보 아이콘을 PC에서 24px로 줄이고 터치 화면은 34px로 유지했다. 실제 화면은 미확인이다.
- 기술 설명 JSON을 직접 덮어쓰는 순간 Vite가 빈 파일을 읽어 오류 화면이 뜬 것을 확인했다. 생성 스크립트가 임시 파일을 완성한 뒤 교체하도록 바꾸고 데이터를 다시 생성했다.
- 특성·도구 발동 로그의 접두어를 기술 이름으로 잘못 해석해 영문 식별자가 나오는 문제를 수정하고, 저장된 현재 웨이브의 과거 로그에도 알려진 특성 한글 이름을 표시한다. 그 외 번역 누락은 계속 확인이 필요하다.

- 2026-11-04: 클래식 전투의 포켓몬 크기를 종·폼별 시뮬레이터 키 데이터로 보정하고 극단적인 크기는 제한했다. 이미지 투명 여백과 앞·뒷모습의 차이는 완전히 제거하지 못하며, 폼 및 싱글·더블·모바일 실제 화면 확인은 남았다.

- 2026-11-04: 전체화면과 브라우저 영역 채우기에서 전투 프레임의 고정 최대 폭을 풀고 전장 높이를 화면에 맞게 확장했다. 실제 전체화면·모바일 화면 검증은 남았다.
- 기술머신 보상 카드에 기술명·타입·위력·명중률과 설명을 직접 표시하도록 추가했다. 대상 선택 상세의 기존 설명도 유지한다. 길이가 긴 설명과 모바일 보상 화면은 미검증이다.

## 2026-11-04 클라우드 재개 확인
- 별도 워크트리 `/workspace/pokemon-cloud-resume`, `codex/classic-cloud-resume-20261104`를 통합 후보 `131ffa7a5cb082689b427e93f34ffe391711e52a`에 만들었다. Sites v9가 이 커밋으로 배포 성공한 상태를 읽기 전용 확인했으며 이번 작업에서 저장·배포하지 않았다. PC 스레드 종료 여부는 별도 확인 중이다.
- 기존 `/workspace/pokemon-classic` 미커밋 스타터 변경은 보존했다. 통합본과 세 UI 파일이 모두 다르므로 그대로 적용하지 않았다. 통합본의 스타터 상세 압축과 클라우드의 탭·이미지 여백 계산은 별도 접근이며 실제 비교·통합 여부는 미결이다. 캡처한 원본 이미지 다운로드도 이전에 실패했다.
- 통합본 전체 `npm test`는 실패 6건: 탐험 API 4건(HTTP 500), 클래식 연결 흐름 1건(새 전투 전 교체 선택 누락), 이전 코인 알 구매 테스트 1건(삭제된 export를 import). 탐험 API 500 원인은 확인하지 않았으며, 낡은 알 테스트는 기존 바우처 테스트와 대조 후 교체해야 한다. 기존 실패를 게임 자체의 오류로 단정하지 않는다.
- 클래식 연결 흐름 회귀 테스트를 현재 전투 전 교체와 보상 후 자동 진행에 맞췄다. 별도 JSON 복원 상태에서 실제 교체가 턴을 소비하지 않고 올바른 포켓몬이 출전함을 검사하고, 교체 여부 결정 전 행동이 거부되는 것도 확인했다. 해당 테스트와 `npm run typecheck` 통과. 더블배틀, 함정·교체 효과, 실제 브라우저와 200층 자연 진행은 검증하지 않았다. 게임 로직·계정·탐험 데이터는 바꾸지 않았다.
- 이로치 스타터: 기존 도감의 `highestShinyVariant`로 행운을 계산하면서 실제 파티에는 변종 번호를 쓰지 않아 빨강·파랑 변종도 기본 번호로 취급되던 누락을 수정했다. 새 도전에 한해 선택한 이로치의 기존 최고 등록 변종을 기록한다. 일반 색상은 행운·변종 0이며 기존 도전과 도감은 수정하지 않는다. 최고 변종 외 개별 선택, 색상별 실제 이미지와 야생 이로치 변종 생성은 아직 미구현이다. 예전 브랜치 `6009ae4`에서 같은 수정이 검증되었으나 통합 후보에서 해당 값이 빠진 것을 코드로 확인했다. 변종·행운, 일반 선택과 JSON 복원 테스트 통과.
- 오래된 코인 구매 API 테스트를 실제 교환권 뽑기, 비공개 알 내용, 중복 보상과 기존 유료 알 환급 보존, 재부화 방지 검사로 갱신했다. 사용자가 지정한 중복 환급은 유지한다. 탐험 API의 초기 HTTP 500은 테스트 하네스가 통합 후 동적 `@/lib/cloud-adventure/route` import를 해석하지 못하기 때문임을 확인했다. 이를 우회해도 테스트가 예전 응답·행동 규격과 달라지는 문제가 있어 원본 테스트를 변경하지 않았다. 운영 API 장애의 증거는 아니다.
- 수정 후 전체 검사는 130개 중 126개 통과, 위 탐험 하네스 4개 실패. 타입 검사 통과. 실제 기기 및 200층 자연 완주 검증은 남는다.
- 이로치 변종별 선택: 신규 포획·부화는 변종 비트를 저장하고 스타터 선택에서 해금된 번호만 고를 수 있도록 서버가 검증한다. 이전 저장에 비트가 없을 때는 기존 최고 변종만 확실히 해금된 것으로 읽고, 이후 다른 변종을 얻더라도 기존 최고 변종을 보존한다. 이전 클라이언트가 번호를 생략하면 기존과 같이 최고 변종을 사용한다. 일반 선택 행운 0, 선택 변종의 행운 1~3, 선택하지 않은 변종 거부, 구 저장 이전·JSON 저장 검사를 통과했다. 새로운 변종을 얻은 뒤 보상 확률에 영향을 줄 수 있으나 기존 진행 중 도전은 바꾸지 않는다.
- 스타터 상세 앞모습에 원본 `pagefaultgames/pokerogue-assets`의 고정 커밋 `fb8ccb6d0703ffe48cdf80a8102d5ed943c82dba` 팔레트/전용 아틀라스를 읽어 1프레임을 그리는 경로를 추가했다. Chromium에서 이상해씨 팔레트 변종과 이상해풀 전용 이미지 변종 각 1개가 생성됨을 확인했다. 현재 기본 폼의 스타터 상세 앞모습에만 적용하며 특수 폼·파티·전투 앞뒤·애니메이션은 미구현이다. 원본 접근 실패·미지원 폼은 기존 이미지로 대체하고 준비 중이라고 표시한다. 외부 GitHub 이미지 접근 및 CORS에 의존한다.
- 탐험 기존 엔진 회귀 테스트는 통합 후 래퍼의 동적 alias import를 테스트 로더가 처리하지 못하던 문제를 해당 기존 엔진 모듈에 직접 연결해 수정했다. 변경된 몬스터볼·상처약·기력의조각 가격을 테스트에 반영했다. 기존 엔진의 독립 SQLite 시나리오 네 개를 각각 통과했으며, 통합 래퍼와 다른 신규 엔진의 모든 실행 경로를 대체 검증한 것은 아니다. 운영 DB에는 접근하거나 수정하지 않았다.
- 변경 후 전체 `npm test` 130개 통과, 타입 검사 통과. 자동 테스트의 200층 일회성 전투 검사는 자연 완주가 아니며, 변종 이미지 전체 종·폼·전투 화면과 실제 기기 검증은 남아 있다. 변경은 로컬 브랜치에만 있으며 Sites 배포·푸시하지 않았다.

## 2026-11-04 이로치 변종 이미지·야생 조우 확장
- 포켓로그 에셋 `fb8ccb6d0703ffe48cdf80a8102d5ed943c82dba`의 폼별 masterlist, 앞·뒷면 atlas와 변종별 팔레트 또는 전용 atlas로 공통 포켓몬 이미지 경로를 확장했다. 스타터 상세·파티와 공통 이미지, 클래식 전투의 기존 이미지 경로에서 지원 폼의 변종을 표시한다. 전투 애니메이션은 atlas 프레임을 최대 12개로 샘플링한 근사 표시이며 원작의 프레임 타이밍 전체를 복제한 것은 아니다. 움직임 감소·애니메이션 끄기는 정지 프레임을 사용한다.
- 브라우저 독립 컴포넌트 픽스처에서 이상해씨 앞·뒷면 변종의 프레임 변화, 피카츄 파트너 폼 정지 이미지, 없는 에셋의 기존 이미지 대체, 움직임 감소 정지를 확인했다. 실제 전투·파티 전체 UI, 모든 종·폼, 성별별 스프라이트, 변신 후 별도 변종·네트워크 오류 및 모든 기기는 미검증이다. 폼 매핑에 없거나 변신 모습이 모호하면 임의의 기본 폼 변종을 그리지 않고 기존 이미지로 대체한다. 외부 GitHub 원본과 브라우저 CORS에 의존하며 접근 실패 시 화면에 기존 이미지를 표시하고 제목에 대체 사실을 남긴다.
- 새 도전에는 `wildVariantRule: source-v1`을 기록해 야생 이로치의 기존 1/1024 및 빛나는부적 배율에 원작 beta `7c088125`의 변종 6:3:1 추첨을 추가했다. 고정 자산 목록에 없는 종은 기본 이로치다. 이미 시작한 도전의 난수 순서와 규칙은 유지한다. 새 도전에서 이로치 포획 시 도감 변종·행운·사탕과 이후 난수 결과가 달라질 수 있다. 개별 확률 경계와 실제 생성·마스터볼 포획·도감 등록·JSON 복원, 기존 도전의 이전 경로를 검사했다. 모든 이벤트 및 원작 동일 시드 재현은 범위에 포함되지 않는다.
- 이번 최종 상태에서 `npm test` 131개 및 `npm run typecheck` 통과. 브라우저 확인은 픽스처 기준이며 200층 자연 완주, 전체 특수 폼과 실제 기기 검증을 의미하지 않는다. 푸시·배포 및 사용자 데이터 수정은 하지 않았다.

## 2026-11-04 알 뽑기 이로치 변종
- 포켓로그 beta `7c0881255af5cd51992e513ff93c2f71adbe40e0`의 [알 생성 코드](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/egg.ts)를 대조하여, 새 교환권 알에서 이로치 여부와 별도로 잠재 변종을 기본·파랑·빨강 6:3:1로 뽑고 파랑·빨강이면 변종이 있는 종을 후보로 제한한다. 잠재 변종은 이로치일 때 화면과 도감에 적용된다. 픽업과 마나피 등 고정 종이 우선되는 경우 변종 에셋이 없으면 기본 변종으로 안전하게 처리한다. 후보 제한 시 사용 가능한 종이 없으면 기존 후보를 유지하고 기본 변종으로 낮춘다.
- 기존 알과 계정 데이터는 건드리지 않는다. 새 알은 잠재 변종에 따라 종 후보가 바뀌며, 이로치의 변종·도감·행운·사탕 및 후속 난수 결과가 달라질 수 있다. 원본은 종 추첨 전에 변종과 이로치를 정하지만 이 구현의 난수 발생기·다른 알 세부 흐름은 원본과 완전히 같지 않다. 사탕으로 같은 종 알을 구매하는 기능과 관련 천장도 이 통합본에는 아직 없다. 사용자가 요청한 중복 코인 환급은 유지한다.
- 빨강 변종 신규 알의 후보·숨겨진 내용·기존 알 및 코인 보존, JSON 저장 후 부화·도감 등록, 부화 결과 변종 보존을 검사했다. 전설 픽업·마나피·후보 전수 및 실제 브라우저는 미검증이다.
- 통합본에 빠졌던 같은 종 사탕 알을 스타터 선택 화면과 저장 API에 연결했다. 해당 스타터의 사탕으로 고정 비용을 확인한 후 알을 받으며, 코인·교환권·기존 알·탐험 데이터는 수정하지 않는다. 99개 제한, 변경된 비용·미해금·사탕 부족 검사, 중복 요청의 기존 저장 revision 검사를 사용한다. 알에는 코인 결제액 0을 기록해 코인 환급을 만들지 않는다. 원본의 1/12 이로치 및 16~21회 천장, 미보유 변종 11회 천장과 잠재 변종, 부화까지의 웨이브 수를 반영했다. RNG 시드 순서·폼 전수 및 특별 사례는 미완료이며 같은 종 알의 기존 사탕 사용처가 추가된다. 원본 자료는 위 `egg.ts`, 비용표는 기존 독립 브랜치 `ecb000a` 기준이다.
- 스타터 상세를 설정·능력치, 기술, 사탕·강화 세 화면으로 나눠 새 알 버튼을 포함했다. 독립 브라우저 픽스처에서 1440×900, 390×844, 320×568의 각 화면이 내부 세로 넘침 없이 표시되었다. 실제 계정·터치 기기 및 모든 긴 이름·폼, 선택 이로치와 네트워크 실패는 아직 확인하지 않았다. 사탕 알 지급·실제 게임 액션·기존 알과 탐험 데이터 보존·중복 방지·천장·웨이브별 자동 부화 테스트가 통과했다.
- 추가 확인: 1024×768에서도 세 탭의 세로 넘침이 없도록 조정했고, 1024×768·320×568의 빨강 변종 선택과 320×568 사탕 알 버튼 클릭을 브라우저 픽스처에서 확인했다. 새 변경 전체 `npm test` 133개 및 `npm run typecheck`가 통과했다. 실제 계정 API와 모바일 기기 조작 검증, 자연 진행 200층은 여전히 남아 있다. 푸시와 운영 배포는 하지 않았다.

## 2026-11-04 알 특수 모습 보완
- 기존 독립 브랜치 `7a1e9ba`의 포켓로그 beta `7c088125` 대조 자료를 바탕으로 새 교환권 알과 사탕 알에 피츄의 삐쭉귀, 플라베베 색, 에써르 성별, 데인차·차데스 진품 등 확인된 종의 폼 추첨을 연결했다. 선택한 폼의 종·능력치·특성 슬롯·이미지·변종 정보를 보존하고 매핑되지 않은 폼은 안전하게 기본 폼을 유지한다. 이미 생성된 알과 기존 도감은 수정하지 않지만 새 알의 폼 및 이후 난수 결과가 달라질 수 있다.
- 경계 확률과 암수 선택, 흰 꽃 플라베베의 폼·IV·이로치·도감 등록 및 JSON 복원, 교환권·사탕 알 회귀를 검사했다. 모든 종·폼의 원본 완전 일치, 실제 부화 화면 및 지원하지 않는 폼은 미검증이다. 배포하지 않았다.
- 삐쭉귀 피츄 사탕 알의 실제 교환·직렬화·부화와 도감 모습 등록도 별도 검사했다. 전체 `npm test` 134개와 `npm run typecheck`가 통과했다. 자연 200층과 실제 계정·기기는 여전히 미검증이다.
