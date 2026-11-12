# 탐험 로열 일지 진행 안내

기존 일지는 랭크 V 이후의 승급전과 무한 로열이 구현되어도 준비 중이라고 표시하고, 미션 10 진행 중 미션 9의 오래된 안내를 계속 표시했다. V·F·E·D·C·B 및 A의 해당 배틀 단계에서는 기존 전투 엔진의 포인트 계산 함수를 사용해 현재 포인트와 게임 내 목표를 표시한다. 다른 이야기 단계에서는 상단 현재 목표를 확인하도록 안내하며, 미션 10 시작 후 미션 9 안내를 숨긴다. 기존 저장과 진행 판정, 점수·전투 규칙은 변경하지 않는다.

원작 로열의 포인트와 후반 보상 대전은 [Serebii 안내](https://www.serebii.net/legendsz-a/z-aroyale.shtml) 및 [무한 로열 안내](https://www.serebii.net/legendsz-a/mainmissions/theinfinitez-aroyale.shtml)를 참고했다. 점수의 실제 획득량과 배틀 존 배치는 프로젝트의 기존 임시 구현이며 원작과 완전히 같다고 보지 않는다. 사용자 요청대로 이 게임의 전투는 턴제다.


랭크 V 공용 배틀존의 Jaques·Anna·Warren 세 상대가 자동 선택 기술 대신 [상대 목록](https://www.serebii.net/legendsz-a/z-aroyale/rankv.shtml)에 기재된 기술을 사용한다. 출현 위치와 550점은 기존 임시값이며 원작에서 세 상대가 마젠타 6번지에 고정된다는 뜻은 아니다. Marie·Nils·Antoine도 같은 목록의 종·레벨·기술로 추가했다. 배틀존 안 위치는 초안이며 같은 방문에서 각 상대에게 한 번 승리할 수 있다. 당시에는 나머지 랭크 V 상대와 원작의 배틀존 선택·기술별 실시간 동작이 미구현이었다. 기존 진행 중 배틀 스냅샷은 수정하지 않는다.


[배틀존 자료](https://bulbapedia.bulbagarden.net/wiki/Battle_zone_%28Lumiose_City%29)의 후보 11곳에서 밤마다 한 곳을, 무한 로열 시작 후 세 곳을 선택한다. 현재 게임 시계의 한 밤 동안 자정과 재접속을 넘어 같은 선택을 유지하고 낮에는 다음 밤을 안내한다. 선택 순서와 세 구역 조합은 결정적인 임시 규칙이다. 다른 현장 진입점은 아직 없어 광장의 공용 접수처는 선택된 지역을 안내하면서 항상 기존 경기장으로 연결한다. 마젠타 6번지 코트는 자신이 선택된 밤에만 입장할 수 있다. 랭크 V의 나머지 Ezio·Emeline·Armand·Maé도 [상대 목록](https://www.serebii.net/legendsz-a/z-aroyale/rankv.shtml)의 팀·기술로 추가했다. 상대 위치·점수와 Ezio의 배달 보상 등 직업별 보너스는 미구현 또는 초안이다.


[원작 배틀존 목록](https://bulbapedia.bulbagarden.net/wiki/Battle_zone_%28Lumiose_City%29)의 나머지 열 구역에 기존 도시 지상에서 공용 로열 경기장으로 들어가는 경로를 추가했다. 본래 마젠타 6번지 입구를 포함해 11개 후보가 현장 입구를 갖는다. 선택된 밤에만 현장 입구가 열리고, 경기장을 나가면 해당 거리로 되돌아간다. 위치와 타일은 임시이며 기존의 통행 가능 좌표를 유지한다. 각 구역의 실제 경계·별도 경기장 지형과 정확한 상대 배치는 아직 구현하지 않았고, 구형 저장과 접근성을 위해 광장 공용 입구를 유지한다.


[로열 안내](https://www.serebii.net/legendsz-a/z-aroyale.shtml)는 승리한 웨이터·웨이트리스에게 말을 걸면 포켓몬을 회복할 수 있다고 설명하며, [랭크 V 목록](https://www.serebii.net/legendsz-a/z-aroyale/rankv.shtml)은 Anna를 웨이트리스로 분류한다. Anna를 이긴 후 말을 걸면 파티를 회복한다. 턴제 게임의 기존 회복 방식에 맞춰 HP·상태·PP를 회복하며, 횟수는 자료가 확인되지 않아 한 방문당 한 번으로 제한한 초안이다. 기존 세션 승리 이력은 유지한다.


랭크 F의 [상대 목록](https://www.serebii.net/legendsz-a/z-aroyale/rankf.shtml)에 기재된 웨이터 Malik과 웨이트리스 Alix의 팀과 기술을 추가했다. [로열 안내](https://www.serebii.net/legendsz-a/z-aroyale.shtml)에 따라 승리 후 대화로 파티를 회복할 수 있다. 상대 배치와 승리당 3,200점은 초안이며, 회복 횟수도 원작 근거가 부족해 각 상대마다 방문당 한 번으로 제한한다.


랭크 E의 Henri·Clarisse·Apolline 기술을 [상대 목록](https://www.serebii.net/legendsz-a/z-aroyale/ranke.shtml)에 맞추고 웨이터 Gianni의 팀·기술을 추가했다. 승리 후 대화로 파티를 회복할 수 있다. 상대 배치와 승리당 3,500점은 기존 초안이며 회복 횟수는 확인되지 않아 방문당 한 번으로 제한한다. 기존 전투 스냅샷은 바꾸지 않는다.


랭크 D·C의 기존 세 상대씩의 팀·기술을 [랭크 D](https://www.serebii.net/legendsz-a/z-aroyale/rankd.shtml)와 [랭크 C](https://www.serebii.net/legendsz-a/z-aroyale/rankc.shtml)에 맞췄다. Elise의 빠졌던 괴력몬을 추가하고 웨이터 Hector·웨이트리스 Lena와 승리 후 파티 회복을 연결했다. 배치와 승리 점수는 기존 초안이고 회복은 원작 횟수를 확인하지 못해 방문당 한 번이다. 현재 진행 중인 배틀 스냅샷은 변경하지 않는다.


[랭크 B 상대 목록](https://www.serebii.net/legendsz-a/z-aroyale/rankb.shtml)을 바탕으로 기존 Katrina·Eden의 빠진 세 번째 포켓몬과 메가스톤을 복원하고 Hank까지 기술을 맞췄다. 포켓몬센터 직원 Maëlle과 웨이터 Lorenzo도 추가했으며 승리 후 [로열 회복 안내](https://www.serebii.net/legendsz-a/z-aroyale.shtml)에 따라 파티를 회복해 준다. 배치·승리당 4,500점은 초안이고 회복 횟수는 확인되지 않아 방문당 한 번이다. 기존 전투 스냅샷은 변경하지 않는다.
