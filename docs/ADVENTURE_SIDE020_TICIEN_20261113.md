# 구역 6 열매 전략 의뢰

[Serebii](https://www.serebii.net/legendsz-a/sidemissions/aberrycleverplan.shtml)는 구역 6 배틀코트의 Ticien이 오랭열매를 지닌 레벨 22 파비코와 요가랑을 사용하며 오랭열매 10개와 경험사탕 XS 2개를 준다고 기재한다. [의뢰 목록](https://bulbapedia.bulbagarden.net/wiki/Side_Mission)은 미션 8의 Lida 배틀 뒤 해금과 900원 보상을 명시한다. Serebii의 해금 표현은 미션 8 승급전이 결정된 뒤로 달라 정확한 시점에 차이가 있다. 기존 게임에서는 Lida 배틀 완료와 그 이후 랭크로 판정한다.

구역의 기존 지상 통행 칸에 Ticien과 상호작용을 추가하고 기존 턴제 전투의 열매 효과를 사용한다. Faye와 함께 있을 수 있고 구형 좌표·지하·옥상은 유지한다. 정확한 인물 위치는 2D 초안이며 원작의 실시간 전투와 AI는 재현하지 않는다.

승리 시 900원은 한 번 지급하고, 가방이 가득 차면 열매와 사탕을 별도로 보관해 공간이 생긴 만큼 수령한다. 분할 보관은 게임의 가방 한도를 위한 처리다. 격리 SQLite API에서 해금·기권·재도전·승리·부분 수령·재접속·중복 요청을, 배틀 엔진에서 열매 사용과 스냅샷 복원을 확인했다. 구역 6 통행 및 구형 위치와 이동 예측도 대표 검사했다. 원작 실기, 운영 D1, Sites 병합본과 실제 브라우저 화면은 검사하지 않았다.

후속 대조: [Thonky 공략](https://www.thonky.com/pokemon-legends-z-a/side-mission-020-a-berry-clever-plan)은 전투 상금 1,056원과 의뢰 보상 900원을 별도로 기재한다. 새 전투에서는 둘 다 지급하고 금색 인형은 전투 상금에만 적용한다. 이전에 시작한 전투와 완료 저장은 기존 보상 상태를 유지한다. 이 수치는 2차 자료이며 실기에서 확인하지 않았다.

## 해금·편성 재대조

[Thonky](https://www.thonky.com/pokemon-legends-z-a/side-mission-020-a-berry-clever-plan)는 메인 미션 8 시작 후, [Serebii](https://www.serebii.net/legendsz-a/sidemissions/aberrycleverplan.shtml)는 승급 상대가 결정된 뒤, [Bulbapedia 의뢰 표](https://bulbapedia.bulbagarden.net/wiki/Task_%28Legends%3A_Z-A%29)는 Lida와 배틀한 뒤로 설명한다. 경계가 서로 달라 실기 확인 없이 기존 `zaLidaStage >= 2` 및 후속 진행 저장 호환 조건은 유지했다. 세 자료는 원작 실기 대조를 대신하지 않는다.

현재 Ticien의 파비코·요가랑은 둘 다 레벨 22와 오랭열매를 갖고, 의뢰 보상 900원·오랭열매 10개·경험사탕 XS 2개를 지급한다. 별도 전투 상금 1,056원은 `cff6272f`에서 이미 연결됐다. 격리 API에서 선행 조건, 포기·재도전, 보상 일부 보관·중복 거절과 일반/구형 전투 상금을 대표 재검사했다. 이 결과로 실제 해금 시점을 확정하지 않는다.
