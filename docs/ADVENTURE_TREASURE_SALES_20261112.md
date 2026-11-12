# 탐험 귀중품 판매

스시 재도전의 큰금구슬과 르 와우 재도전의 경단진주, 필드의 진주·금구슬 등은 기존 가방에 저장됐지만 처분할 수 없었다. 프렌들리숍에 보유 귀중품의 수량별 판매를 연결했다. [진주](https://bulbapedia.bulbagarden.net/wiki/Pearl_(item)) 1,000, [큰진주](https://bulbapedia.bulbagarden.net/wiki/Big_Pearl) 4,000, [경단진주](https://bulbapedia.bulbagarden.net/wiki/Pearl_String) 10,000, [금구슬](https://bulbapedia.bulbagarden.net/wiki/Nugget) 5,000, [큰금구슬](https://bulbapedia.bulbagarden.net/wiki/Big_Nugget) 20,000코인은 각 자료의 Z-A 판매가다. 다른 도구는 아직 판매할 수 없다.

서버가 실제 상점 접근·허용 품목·1~99개 수량·재고를 확인한다. 월드 리비전, 재고 차감, 코인 지급은 하나의 저장 트랜잭션에서 처리하며 코인 안전 정수 범위를 넘는 요청도 거부한다. 기존 가방·파티와 수령 이력은 변환하지 않고, 미수령 보상은 먼저 수령해야 판매할 수 있다. 격리 SQLite API에서 정상 거래, 재접속, 오래된 리비전·재고 부족·부적절한 장소 및 코인 범위 초과를 확인했다. 격리 브라우저의 390px·1280px 화면에서 버튼과 수량 전달을 확인했으며 실제 운영 기기와 D1 운영 환경은 검증하지 않았다.
