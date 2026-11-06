# 탐험·모험 참고 저장소 조사

2026-11-06 확인. 각 링크의 자료 범위와 진행 상태는 확인한 시점의 것이다.

- [pret/pokeemerald](https://github.com/pret/pokeemerald/tree/731ad5bfd6e6f265508d0efcca0ba42f9dcf5881)는 포켓몬 에메랄드 역분석 프로젝트다. [필드 이동 코드](https://github.com/pret/pokeemerald/blob/731ad5bfd6e6f265508d0efcca0ba42f9dcf5881/src/field_player_avatar.c)는 정지·방향 전환·이동·충돌을 구분한다. [대화창 코드](https://github.com/pret/pokeemerald/blob/731ad5bfd6e6f265508d0efcca0ba42f9dcf5881/src/field_message_box.c)는 대화 프레임과 텍스트 표시 상태를 나눈다. Z-A의 맵이나 콘텐츠 자료는 아니다. 저장소 루트에서 LICENSE 파일을 확인하지 못했으며, 공개 저장소라는 사실만으로 코드·이미지 복제 허가를 추정하지 않는다.
- [pret/pokeplatinum](https://github.com/pret/pokeplatinum/tree/80c83a6f1df01bf7404b6d50979bb286ce101433)은 README에서 진행 중인 플라티나 역분석 프로젝트라고 설명한다. 저장소 루트에서 LICENSE 파일을 확인하지 못했다. 구현·자산의 복제 권한은 확인하지 않았다.
- [PokeZ-ARecomp](https://github.com/Hexveil404/PokeZ-ARecomp/tree/dfb47e9d8130d6ecde1c0afa1010fb1a102e50f6)은 자체 설명상 Z-A를 PC에서 실행하는 정적 재컴파일러·런타임 프로젝트다. 게임의 코드·맵·자산·폰트를 포함하지 않고 사용자의 게임 파일이 필요하다. Windows 지원과 별도로 Linux는 실험 단계다. [개발 도구](https://github.com/Hexveil404/PokeZ-ARecomp/blob/dfb47e9d8130d6ecde1c0afa1010fb1a102e50f6/docs/dev-tools.md)는 개인 게임 파일에서 실행한 기록과 프레임을 분석할 수 있으나, 문서는 게임 파일·기록·캡처를 Git에 올리지 말라고 명시한다. 저장소의 [MIT 라이선스](https://github.com/Hexveil404/PokeZ-ARecomp/blob/dfb47e9d8130d6ecde1c0afa1010fb1a102e50f6/LICENSE)는 자체 코드 범위에 적용되며 Nintendo 자산이나 서드파티 라이브러리에 대한 허가가 아니다.

## 적용 및 경계

정지·방향별 필드 표현이라는 일반적인 2D 구성은 참고하되, 캐릭터 도트는 이 프로젝트에서 독자적으로 작성했다. 실제 Z-A 맵 형상·위치와 장면 대사는 이 저장소들만으로 확인하지 못했으므로 별도 원작 지도·영상과 대조해야 한다. 어느 저장소의 코드·게임 자산도 복사하지 않았다. 세부 원작 충실성 및 실기기 검증은 남아 있다.

PokeZ-ARecomp의 상위 프로젝트에서 남은 자료는 Z-A 자료로 간주하지 않는다. 특히 `tools/rando/map_pieces.json`의 TailCave 등은 미르시티 지도가 아니다. 원작 데이터 추출물이나 게임 캡처를 이 저장소에 반입하지 않는다.
