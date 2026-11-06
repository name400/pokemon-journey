# 이상한 꿈의 기존 중복 기술 교정

과거 이상한 꿈 변환 직후 보상 화면에 머물러 있는 저장만 대상으로 한다. 같은 기술 ID이면서 영문·한국어 등 서로 다른 이름이 동일한 네이티브 기술 이름으로 확인되는 경우, 첫 슬롯을 유지하고 중복 슬롯을 제거한다. 기술 PP·PP업은 변경하지 않고 교정 전 기술 목록과 PP 정보를 같은 도전의 `dreamMoveAliasBackups`에 보관한다.

전투·다른 구간으로 진행된 저장, 진행 중인 선택, 융합, 스케치·슬롯별 PP, 기술 랜덤화, 미확인 기술·폼별 이름·비정상 백업 등은 자동 교정하지 않는다. 다른 저장 슬롯은 조회하거나 수정하지 않는다. 백업은 게임 화면 응답에 포함하지 않는다.

격리된 실제 이벤트·저장 코덱·다음 전투와 SQLite API를 검사했다. GET은 교정된 화면을 만들지만 DB에 쓰지 않는다. 이후 유효한 POST에서 교정과 백업이 해당 도전의 수정과 함께 저장되며, 실패한 요청이나 동시 수정 충돌은 기존 저장을 덮어쓰지 않는다. 운영 데이터는 직접 변경하지 않았다. 이미 다음 구간으로 진행한 저장과 근거가 불충분한 사례의 복구 방식은 남아 있으며, 운영·실기기 검증도 별도다.

## 진행된 저장의 사용자 확인 정리

변환 이후 출처를 확정할 수 없는 저장은 자동 변경하지 않는다. 파티 화면에서 서로 다른 표시가 동일한 원본 기술 ID와 이름으로 확인되면 후보와 양쪽 이름을 보여준다. 종료된 스케치 스냅샷에서 이름이 같게 정규화된 경우는 아래의 별도 선택 조건을 따른다. 사용자가 명시적으로 확인하면 뒤쪽 중복 칸만 지우고 기존 기술 목록, 원본 ID, PP와 PP업을 해당 도전의 복구 기록에 남긴다. 다른 파티원과 슬롯은 변경하지 않는다. 기존 복구 기록이 있거나 일치하지 않는 전투 스냅샷, 대화·선택 대기, 검증되지 않은 융합, 확인할 수 없는 스케치 슬롯, 기술 무작위화, 불명확한 이름 등이 있으면 후보 자체를 표시하지 않는다. 종료된 전투 스냅샷은 아래의 엄격한 일치 조건을 만족하는 경우에 한하여 복구한다.

API 검사에서 읽기 전용 조회, 확인 누락, 성공 저장, 동시 수정 충돌을 검증했다. 브라우저 및 실제 사용자 저장에서의 검증은 하지 않았다.

## 검증된 융합체

명시적으로 확인된 DNA 융합체는 사용자 확인 정리를 지원한다. 융합 데이터가 손상되었거나 지원하지 않는 표현은 제외한다. 격리 검사에서 기증자 데이터, 기술 목록 백업과 PP를 보존하고 저장 복구 후 다음 전투 및 분리를 확인했다. 검증된 융합·스케치 결합과 엄격한 조건의 종료 전투 스냅샷을 아래와 같이 지원한다. 브라우저 및 운영 저장 실사용은 미검증이다.

## 스케치 슬롯별 PP

스케치가 허용하는 동일 기술의 중복은 정상일 수 있으므로 자동 삭제하지 않는다. 슬롯별 PP가 온전하고 서로 다른 두 표시가 같은 기술 이름과 ID를 가리키는 한 쌍에 한하여 사용자가 PP를 확인하고 지울 슬롯을 직접 선택할 수 있다. 나머지 슬롯과 순서를 유지하며 원본 슬롯별 PP와 삭제된 위치를 복구 기록에 남긴다. 스케치 기술 자체의 중복, 여러 중복 쌍, 손상·미지원 메타데이터와 미검증 융합 스케치는 제외한다. 동일 표기의 중복은 종료된 스냅샷의 슬롯별 PP가 일치하는 경우에만 아래 확인 절차로 표시한다. API에서 PP 비교 실패 시 저장 불변, 성공 시 선택 슬롯 및 복구 기록, 다음 전투 PP를 검사했다. 브라우저·운영 저장은 미검증이다.

## 융합과 스케치의 결합

기존의 검증된 DNA 융합과 슬롯별 PP가 확인된 스케치 조건을 함께 만족하면 사용자 선택 정리를 지원한다. 기증자 정보, 삭제 전 슬롯과 PP를 보존한다. 양쪽 슬롯 선택, 저장 복구, 다음 전투의 PP, 융합 분리 및 손상된 기증자와 전투 스냅샷 제외를 격리 검사했다. 운영 저장과 브라우저는 미검증이다.

## 종료된 전투 스냅샷

전투 종료 후 진행 화면에서, 사용자가 선택한 일반 기술 별칭의 파티·전투 파티·네이티브 기술 ID/PP/PP업과 선택 슬롯의 안전성이 모두 일치할 때만 정리한다. 제거 전 전투 기술·슬롯 PP업을 백업하고, 남는 동일 기술에 사용 이력을 합쳐 보존한다. 날씨·능력치 변화·PRNG·다른 포켓몬과 상대 기록은 수정하지 않는다. 실제 격리 야생 전투 종료 → 정리 → 저장 복원 → 연속 전투, API 경쟁 저장 실패 및 다른 슬롯 보존을 검사했다. 일반 기술에서 서로 다른 슬롯 PP, 변신·진행 중 선택·알 수 없는 스냅샷은 제외한다. 전투 중의 제한된 처리 범위는 아래를 따른다. 스케치의 서로 다른 슬롯 PP는 아래 조건을 따른다. 운영 저장·브라우저 실사용은 미검증이다.

## 종료된 스케치 전투 스냅샷

종료된 스냅샷·파티·전투 파티의 슬롯별 PP와 기술 순서가 정확히 일치하고 선택 슬롯과 네이티브 기록이 안전한 경우, 중복된 두 기술 중 안전하게 제거할 수 있는 슬롯과 PP를 사용자에게 보여 준다. 스케치에서 같은 기술 두 칸은 의도된 구성일 수 있음을 안내하며, 실제 선택 전에는 변경하지 않는다. 전투 결과에서 이름이 동일하게 정규화된 경우에도 적용하되 스케치 기술 자체의 중복은 제외한다. 원래 슬롯별 PP·기술·전투 상태를 백업하고 남는 슬롯의 기술 사용 이력을 보존한다. 검증된 융합체, 재접속 후 연속 전투, API 경쟁 저장, 잘못된 선택과 불일치 스냅샷을 검사했다. 브라우저와 운영 저장은 미검증이다.

## 진행 중인 일반 야생 전투의 대기 포켓몬

일반 야생전·트레이너전·라이벌전과 검증된 트레이너의 시험·이상한 꿈 이벤트의 명령 선택 화면에서 턴 처리·대화·강제 교체가 없고, 대기 포켓몬의 파티/전투/네이티브 기술 및 PP가 엄격히 일치하는 경우에만 사용자가 정리할 수 있다. 스케치는 두 네이티브 기술 배열과 슬롯별 PP도 서로 일치해야 한다. 전투 화면에 조건부 버튼을 표시하며 확인 전 자동 변경하지 않는다. 출전 포켓몬과 활성 효과가 있는 대기 포켓몬은 제외한다. 기존 행동 요청·턴·날씨·난수·출전 포켓몬을 보존하고 일반·스케치·융합 스케치 대기 포켓몬의 다음 교체를 격리 검사했다. 챌린지는 원본 지원 제한 ID 0, 1, 4–10, 12에 한해 진행 기록과 전투 제한이 정확히 일치하고 출전 가능 여부를 판별할 수 있을 때 지원한다. 특성 무작위화는 파티 전원의 저장 시드·특성·패시브가 재계산 결과와 일치할 때만 지원하며 융합체는 주체와 기증자를 각각 검증한다. 기술 무작위화와 불일치·알 수 없는 제한은 제외한다. 동시 저장 충돌도 검사했다. 격리 Chromium의 1280×800과 390×844 화면에서 야생·트레이너전의 일반·스케치 및 비랜덤·특성 무작위화 챌린지의 버튼·취소·확인·전투 복귀를 검사했으며 실제 기기와 운영 저장은 미검증이다.

## 특성 무작위화 챌린지

파티 전원의 원본 특성 무작위화 단계와 저장 시드를 확인하고, 현재 특성·패시브가 재계산 결과와 일치하는 파티에 한해 사용자가 직접 기술을 정리할 수 있다. 융합체는 주체와 기증자 모두 별도로 검증한다. 정리로 특성·패시브·시드를 바꾸지 않는다. 기술 무작위화, 특성 덮어쓰기 및 불일치 저장은 제외한다. 세 단계, 일반·스케치 대기 포켓몬과 검증된 융합체, 저장 복구·다음 교체·동시 저장을 검사했다. 격리 Chromium에서 PC와 모바일 크기로 일반·스케치·융합 확인 및 취소를 검사했으며 실제 기기·운영 저장은 미검증이다.

## 트레이너의 시험 이벤트 전투

이미 선택된 트레이너의 시험 전투에서 이벤트 종류·단계·선택·트레이너 ID와 도주·포획 금지를 확인한 뒤, 대기 포켓몬의 중복 기술을 사용자 확인으로 정리할 수 있다. 대화·강제 교체 중인 경우와 검증되지 않은 챌린지 결합은 제외한다. 지원되는 챌린지 제한은 별도로 확인해 적용한다. 이벤트 출현 조건은 변경하지 않았다. 실제 이벤트 선택 → 전투 → 승리 → 알·보상 경로와 저장·동시 저장 충돌을 격리 검사했다. 브라우저 검사는 가상 화면이며 운영 저장·실제 기기는 미검증이다.

## 이상한 꿈의 대체 트레이너 전투

이미 선택된 이상한 꿈 배틀에서 이벤트 종류·단계·선택·트레이너 이름과 전투 조건이 일치하고 챌린지가 없을 때, 대기 포켓몬의 중복 기술을 사용자 확인으로 정리할 수 있다. 출현 조건은 변경하지 않는다. 실제 이벤트 선택 → 대체 트레이너 전투 → 승리 → 패시브·보상 경로, 저장·동시 저장 충돌과 일반·스케치 대기 슬롯을 격리 검사했다. 격리 Chromium의 PC·모바일 화면에서 확인·취소·전투 복귀를 검사했으며 실제 기기와 운영 저장은 미검증이다.

## 트레이너의 시험과 챌린지 결합

이미 시작된 트레이너의 시험 전투에서 기존의 비랜덤 챌린지와 검증된 특성 무작위화 챌린지도 대기 포켓몬 사용자 확인 정리를 지원한다. 이벤트 출현 조건은 변경하지 않는다. 파티·전투 제한과 특성 무작위화 시드를 확인하고 기존 기록을 보존한다. 실제 이벤트 선택과 한 턴, 이후 합성한 전투 종료·재접속·승리 보상 및 저장 충돌을 격리 검사했다. 전체 자연 플레이와 운영 저장은 검증하지 않았다.


## 야생 미스터리 전투 공통 경로

수수께끼 상자, 열매, 싸울까 도망갈까, 희귀 품종의 기존 전투에서 검증된 대기 포켓몬의 중복 기술을 확인 후 정리한다. 이벤트 종류·상대·대기 상태·파티 및 전투 스냅샷이 일치해야 하며, 시작 효과가 대기 중이면 허용하지 않는다. 희귀 품종의 이미 끝난 외부 선제 기술은 전투 기록이 정확히 일치하는 경우에만 허용한다. 기존 이벤트 출현 정책은 바꾸지 않는다.

격리 테스트는 이벤트 선택·전투·포획 및 보상, 일반/스케치와 검증된 챌린지, 저장 충돌과 다른 슬롯 보존을 검사한다. 브라우저 검사는 데스크톱과 모바일 크기 에뮬레이션이며 실기기·운영 저장 검증은 아니다. 기술 무작위화, 출전 중 포켓몬, 불일치 스냅샷 및 미검증 이벤트는 계속 보류한다.

벌레 마니아의 기존 트레이너전에서도 상대 3마리, 이벤트·보상 상태 및 전투 대기 상태가 일치할 때 대기 포켓몬 기술을 사용자 확인 후 정리한다. 일반과 스케치 저장 후 전투 승리·기술 가르치기까지 격리 검증한다. 챌린지 및 불일치 상태는 보류한다.

수상한 거래 전투에서 남은 대기 포켓몬은 상대와 거래 기록이 일치하면 사용자 확인 후 정리한다. 거래로 떠난 포켓몬과 포획 결과, 저장 복구 및 다른 슬롯을 검사한다. 챌린지와 불일치 저장은 보류한다.

잠만보·순간이동의 야생 전투에서도 상대와 이벤트 상태가 일치하면 대기 포켓몬 기술을 사용자 확인 후 정리한다. 잠만보 선제 공격은 검증된 완료 기록만 허용한다. 포획·보상, 다른 슬롯과 API 저장을 검사한다. 선제 공격 대기나 불일치 기록은 제외한다.

쓰레기 더미·춤 수업의 야생 전투는 각각 비축하기와 잠재댄스 선제 기술 완료 기록이 검증되면 대기 포켓몬 기술 정리를 허용한다. 포획·보상, 이벤트 상태, 다른 슬롯과 API 저장을 검사한다. 기록 불일치나 선제 효과 대기는 제외한다. 단단지의 스텔스록 선제 기술 기록은 별도 검토가 필요하다.

단단지·절대 탐욕 보스 전투에서는 첫 턴 후 명령 대기 상태의 대기 포켓몬만 사용자 확인 후 정리한다. 실제 이벤트 선택·첫 턴·정리·저장 복구·승리·보상 및 API 저장을 일반·스케치에 대해 검사한다. 선제 효과 직후와 챌린지는 지원하지 않는다.

후속: 단단지의 스텔스록·위액 및 상대 능력치 상승이 기록과 일치하거나, 절대 탐욕의 볼가득넣기가 완료된 경우에는 첫 턴 전에도 대기 기술 정리를 허용한다. 시작 상태·정리·승리·보상·API 저장과 누락/불일치 거부를 격리 검사했다. 효과가 다른 방식으로 기록되거나 챌린지가 결합된 경우는 보류한다.

수수께끼 도전자와 Winstrate는 트레이너·상대 팀·이벤트 단계가 일치할 때 대기 기술 정리를 허용한다. 도전자 세 난이도의 표시, Winstrate 다섯 라운드의 표시와 연속전 완료, 저장·보상·API를 검사한다. 챌린지 결합과 기록 불일치는 보류한다.

마자용 미니게임은 선택 참가자·상대·턴이 일치하는 동안 대기 기술 정리만 허용한다. 교체/도망/포획 제한, 3턴 결과, API 및 다른 저장 슬롯을 검사한다. 챌린지와 일치하지 않는 기록은 보류한다.

훈련 전투에서는 보관된 훈련생과 도구, 전투 상대의 기록이 일치하는 경우에만 다른 대기 포켓몬을 사용자 확인 후 정리한다. 세 훈련 선택의 표시, 개체값 훈련의 실제 승리와 보관 포켓몬·도구 복원 및 API 저장을 격리 검사한다. 챌린지와 기록 불일치는 보류한다.

광대·화산 더블 전투는 첫 턴 이후 양측·상대 구성이 일치하는 상태의 대기 기술을 정리한다. 격리 테스트는 선제 후 실제 턴과 저장을 거쳐 합성 승리 상태의 복구·이벤트 결과, API와 다른 슬롯을 확인한다. 실제 승리 플레이, 시작 직후와 챌린지 조합은 이 검사에서 확인하지 않았다.

후속: 광대·화산은 첫 턴 전에도 두 출전 포켓몬 각각의 도발·회오리불꽃 기록과 마지막 외부 기술이 일치하는 경우 대기 기술 정리를 지원한다. 양쪽 기록, PRNG, 파티, 저장 및 API를 검사하고 효과 누락·출처 불일치는 거부한다. 선제 효과 면역·실패·대체 기록과 챌린지는 지원하지 않는다.

브리더는 선택된 한 마리 외 파티를 별도 보관하므로 전투 파티와 분리된 확인 화면 및 공통 별칭 정리 경로를 제공한다. 대화·명령 처리 대기 상태와 소유권·도구·파티 식별자·전투 상대가 일치해야 하며, 기존 기술과 PP 백업 및 사용자 확인·revision 비교를 유지한다. 격리 테스트는 정상/스케치, 승패 후 파티·도구 복원, 다른 슬롯과 동시 저장 충돌 및 PC·모바일 화면 취소/확인을 검사했다. 실기기와 실제 계정 저장은 검증하지 않았다.

후속: 화산은 검증된 단일 세대·반전 챌린지에서 시작 직후 및 첫 턴 이후 대기 기술 정리를 지원한다. 챌린지 제한·양쪽 전투 상태·저장 및 합성 승리 결과를 보존하며 불일치 제한과 기술 무작위화는 거부한다. 광대는 기존 출현 정책상 챌린지에서 허용되지 않으며 새로 활성화하지 않았다.

후속: 화산 선제 공격을 타오르는불꽃으로 흡수한 경우, 각 슬롯의 특성·효과 출처와 외부 공격 기록이 정확히 일치하면 대기 기술 정리를 허용한다. 첫 슬롯·둘째 슬롯·양쪽 흡수, 일반·스케치와 검증된 챌린지, 저장/API 및 불일치 거부를 검사했다. 다른 면역과 빗나감은 별도 근거 없이 허용하지 않는다.

후속: 화산의 양쪽 선제 공격이 전투 프로토콜에 순서·대상과 함께 기록되어 있고 활성 포켓몬 및 남은 효과와 일치하면, 첫 슬롯·둘째 슬롯·양쪽 빗나감과 노릇노릇바디 면역도 지원한다. 일반·스케치, 검증된 챌린지, 저장/API와 누락·순서 변경·효과 불일치 거부를 검사했다. 기록이 불완전한 옛 저장은 보류한다.

기술 무작위화 챌린지는 동일한 무작위 결과가 정상적으로 겹칠 수 있어 자동 변경하지 않는다. 전투 스냅샷이 없는 보상·구간 이동에서 파티 전체의 시드·무작위화 수준이 챌린지와 일치하고 스케치·융합이 없는 경우에만 사용자가 별칭을 확인해 정리한다. 테스트는 실제 시드 생성 기술, 두 무작위화 수준, 기술·TM 맵, PP·이력, 보존·동시 저장 충돌 및 PC/모바일 화면을 검사했다. 전투 스냅샷, 스케치·융합, 불일치 기록 및 실기기는 보류한다.

후속: 기술 무작위화의 종료된 전투 스냅샷은 챌린지·시드와 파티·전투팀·기술 슬롯·PP·PP업이 일치하면 사용자 확인 후 함께 정리한다. 실제 전투 종료·저장 복구·다음 전투, 사용 이력과 PRNG, API 및 PC/모바일 화면을 검사했다. 진행 중 전투, 스케치·융합과 불일치 기록은 보류한다.

후속: 기술 무작위화의 진행 중 일반 야생전·트레이너전에서는 파티 전체 시드·챌린지 제한과 대기 포켓몬 기술·PP가 일치하고 실행 큐가 비어 있으면 사용자 확인 후 정리한다. 실제 전투 계속, 저장/API, 다른 슬롯과 PC/모바일 화면을 검사했다. 출전 중 슬롯·이벤트 전투·스케치·융합 및 불일치는 보류한다.

후속: 기술 무작위화는 상자·열매·싸울까 도망갈까·희귀 품종·잠만보·순간이동·화산 이벤트에서 검증된 대기 포켓몬도 지원한다. 두 무작위화 수준 및 반전 챌린지를 검사했다. 여섯 이벤트는 실제 포획, 화산은 합성 승리 복구로 검사했다. API·PC/모바일 화면과 제한·PRNG 보존을 검사했으며 출전 중 슬롯·스케치·융합과 다른 이벤트는 보류한다.

후속: 기술 무작위화에 검증 가능한 스케치 규칙·슬롯별 PP가 공존하는 저장은 사용자가 정리할 슬롯을 직접 고를 수 있다. 합성 저장으로 무스냅샷·종료·진행 중 대기 슬롯, 양쪽 무작위화 수준, PP 불일치 거부, API 및 PC/모바일 화면을 검사했다. 실제 플레이에서 해당 조합이 생기는 전체 경로와 실기기는 검증하지 않았다. 출전 슬롯·융합은 보류한다.

후속: 기술 무작위화의 기본 융합체는 주체·기증자 시드와 융합 정보가 모두 일치하면 확인 후 정리한다. 양쪽 종의 주체 역할, 두 무작위화 수준, 특성 무작위화 결합, 무스냅샷·종료·일반 전투 대기, 분리·API 및 PC/모바일 화면을 격리 검사한다. 이벤트 전투, 융합과 스케치 동시 결합, 출전 슬롯, 특수 폼 전체 및 불일치 기록은 보류한다.

후속: 기술 무작위화 기본 융합체의 스케치 슬롯도 주체·기증자 시드와 PP가 일치하면 사용자가 직접 선택해 정리한다. 합성 저장으로 양쪽 주체, 기술·특성 무작위화, 전투 전후 대기 상태, 분리, API 및 PC/모바일 화면을 검사했다. 이벤트 융합·특수 폼 전체·출전 슬롯, 실플레이에서의 조합 생성 경로는 보류한다.

후속: 기술 무작위화 기본 융합체는 상자·열매·싸울까 도망갈까·희귀 품종·잠만보·순간이동·화산 전투의 검증된 대기 슬롯에서 정리한다. 두 주체 방향·두 무작위화 수준, 여섯 실제 포획·분리 미리보기 및 열매 실제 분리, 화산 합성 승리, API·PC/모바일 화면을 검사했다. 이벤트 내 융합 스케치·특수 폼 전체·출전 슬롯 및 불일치 기록은 보류한다.

후속: 기술 무작위화 융합체의 스케치 슬롯은 7개 검토 야생 이벤트에서 주체·기증자 시드와 PP가 일치하면 사용자가 직접 선택해 정리한다. 합성 조합 저장으로 두 주체·두 무작위화 수준, 여섯 실제 포획, 열매 실제 분리, 화산 합성 승리 및 API·PC/모바일 화면을 검사했다. 실플레이에서 해당 조합이 생성되는 전체 경로, 다른 이벤트·특수 폼 전체·출전 슬롯은 보류한다.

후속: 기술·특성 무작위화 융합에서 폼 메타데이터 286개(지속 폼 191, 정적 변형 95)의 양쪽 역할을 전투 없는 저장에서 검사했다. 메가리자몽 X·거다이맥스 리자몽·물 아르세우스·서쪽 바다 깝질무(422)의 양쪽 역할을 일반 전투 전후, 스케치, 열매 실제 포획·분리 및 화산 합성 승리로 검사했다. API와 PC/모바일 에뮬레이션 대표 화면도 검사했다. 폼 이름·종 식별자가 불일치하면 정리를 거부한다. 나머지 폼의 전투·이벤트, 실기기와 실제 플레이 조합은 전수 검증하지 않았다.

후속: 일반 단일 야생전 첫 턴에 미행동·비변신·잠금 없는 출전 포켓몬의 기술 별칭은 사용자 확인 후 정리한다. 전투팀·네이티브 기술 슬롯과 명령 요청을 원자적으로 갱신하며 실패 시 저장하지 않는다. 대표 일반/무작위화 포켓몬, 행동 계속, 저장 충돌·재생성 실패 및 PC/모바일 에뮬레이션 화면을 검사한다. 이후 턴·더블·트레이너·이벤트 및 출전 중 스케치·융합, 실기기는 보류한다.

후속: 같은 첫 턴의 미행동·비변신·잠금 없는 출전 정리를 단일 트레이너·라이벌전에도 연결한다. 대표 일반·무작위화 포켓몬, 대화·교체 대기 거부, 명령 갱신과 실제 행동·저장/API 및 PC/모바일 에뮬레이션을 검사했다. 이후 턴·더블·이벤트, 출전 스케치·융합과 실기기는 보류한다.

Fresh active lead review also supports the first idle turn of verified single trainer-test and weird-dream battles. It requires matching event metadata, no unresolved opening action, dialogue or switch selection, and the same strict untransformed, unused move-slot checks. Representative isolated snapshots check request refresh, reloaded continuation, RNG and unrelated save preservation, plus rejection of ambiguous states. Real-device and natural event play remain unverified; unverified event opening outcomes remain excluded.

Fresh idle single-battle active Sketch review supports explicit removal of a verified duplicate slot while preserving the other slot’s PP and retaining a backup. Representative randomized fixture and mismatched/stale records were tested; ambiguous switched-active histories remain excluded.

Fresh idle single-battle active fusion, including a representative combined randomization and Sketch case, supports confirmed review when donor and battle records agree. The donor, unsplice preview, move/PP records and combat state are preserved; invalid donor records or mismatched snapshots remain blocked. Other fusion forms and natural gameplay have not been exhaustively verified.

Fresh idle ordinary double battles support confirmed active-slot review when both player positions and requests match, with no queued actions. Both positions were tested through actual battle continuation; changed active slots, wait requests, queued actions and later turns are rejected. Natural gameplay and physical devices remain unverified.

Clown and volcano double battles permit active review only when both opening effects and exact sources are verified and the selected active has no unrelated volatile effect. Representative both-position continuations and damaged evidence were tested. Selected-active misses and verified Flash Fire / Well-Baked Body are supported when both opening traces, weather and enemy boosts agree; natural gameplay and physical devices remain unverified.

Later idle ordinary single-battle active review is supported for an unchanged lead with unused duplicate slots and matching recorded history. Representative turn-two wild and trainer tests preserve the prior move, PP, usage and combat state; locked, changed or ambiguous histories remain blocked. Previously used or ambiguous switched-active cases are not supported.

Later idle ordinary double-battle review supports either active slot when both requests agree and the selected Pokémon has not switched or used the duplicate. Representative turn-two tests checked both actors, preserved history and rejected mismatched partner state.

Later ordinary-battle active review also supports validated fusion and Sketch when duplicate slots remain unused and all recorded PP, donor and combat history agree. Representative single battles with combined ability/move randomization were checked; double and other form combinations have not been exhaustively verified.

Later active review allows trainer-test, weird-dream and verified wild-event records only when no opening move or volatile effect remains and unused duplicate/history checks pass. Representative berries and fight-or-flight turn-two continuations and mismatched-event rejections were tested. Other event and form combinations were not exhaustively verified.

Newly switched active Pokémon with no prior move use can be reviewed only when the immediately previous active slot, switch log, move slots and direct history agree. Representative single wild and trainer battles were tested through a switch, review, reload and next action. Previously used and ambiguous cases remain blocked.
