# Sushi High Roller: multi-opponent courses

[Original course reference](https://www.serebii.net/legendsz-a/sidemissions/fullcourseofbattles%3Ahighrolling.shtml) describes three opponents at once. The existing turn-based simulator supports two simultaneous enemy slots and a reserve, so new five-course runs use two active foes and the third enters later. This is an approximation, not the original three-active battle. The existing opponent data and reward conditions remain in place.

A `multiV1` flag is set only when starting a new run. An old saved run without it keeps the sequential format, including any already saved battle. Battle results preserve the existing course progression, experience, research count, reward claim and loss recovery. No migration rewrites existing Pokémon or completion flags.

The API tests cover two targets, reload and forfeiture, a legacy course, and both five-course reward paths. For repeatable progression/reward testing, the enemies are set to 1 HP and asleep; that does not establish normal-play difficulty or balance. A separate test exercises an unmodified opening turn.

## 세 상대 동시 전투

[원작 코스 안내](https://www.thonky.com/pokemon-legends-z-a/side-mission-073-full-course-of-battles-high-rolling)는 각 코스의 세 포켓몬이 동시에 나온다고 명시한다. 새로 시작한 최초 코스와 재도전은 세 자리 턴제 엔진으로 세 상대를 동시에 표시하고 각각 선택할 수 있다. `tripleV2`는 새 코스에만 기록하며 이미 진행 중인 `multiV1` 두 상대 코스와 버전 없는 순차 코스는 기존 방식으로 마친다. 플레이어의 파티만 보유함에 반영하고 가상의 빈 아군 칸과 상대를 보유함에 넣지 않는다.

첫 코스의 세 대상·재접속·기권, 구형 두 형식의 복원, 최초 및 유료 재도전 다섯 코스의 승리·회복 제한·보상 및 중복 거절을 격리 API로 검사했다. 코스 보상 검사는 상대를 잠재우고 HP를 조정했으므로 자연 난이도 전체 검증은 아니다. 별도 세 자리 엔진 검사에서 광역기·교체·대상·재접속을 확인했다. 원작의 실시간 전투, 실제 기기·운영 D1 및 이 식당의 PC·모바일 브라우저는 검증하지 않았다.
