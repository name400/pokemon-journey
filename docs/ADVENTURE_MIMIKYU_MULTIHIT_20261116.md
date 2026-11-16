# 따라큐 연속 타격 검증과 자료 불일치

현재 ZA 턴제 전투에서 새 전투에 적용된 구현은 탈이 멀쩡할 때 첫 타격의 실제 피해를 최대 HP 1/8로 제한하고, 탈이 벗겨진 뒤 같은 연속 기술의 다음 타격은 일반 피해를 적용한다. 고드름침을 통한 대표 회귀에서 첫 타격·다음 타격·폼 변경을 확인했다. 이미 진행 중인 구형 전투와 포켓로그의 규칙은 변경하지 않았다.

이 결과는 **현재 구현의 동작 검사**다. [Bulbapedia의 ZA 배틀 설명](https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_battle_%28Legends%3A_Z-A%29)은 피해를 1/8로 제한한다고 설명하지만, 같은 사이트의 [탈 설명](https://bulbapedia.bulbagarden.net/wiki/Disguise_%28Ability%29)과 [DittoBase](https://www.dittobase.com/legends-za/pokedex/mimikyu)는 1/8의 피해로 바뀐다고 설명한다. 약한 공격에 대한 결과가 서로 다르며 연속 타격의 원작 경계도 실기나 원본 데이터로 확인하지 못했다. 현재 방식은 턴제 근사로 유지하고 추가 근거가 확보되면 다시 판단한다.
