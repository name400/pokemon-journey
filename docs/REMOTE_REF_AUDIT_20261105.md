# 2026-11-05 원격 HEAD 교차 확인

QA가 작업 브랜치의 원격 HEAD가 `c9f0c01`로 돌아갔다고 보고해 원격 쓰기를 중지하고 확인했다. 이 중지 구간에는 원격 쓰기·강제 push·reset·삭제를 하지 않았다. Mega 다음 작업은 아직 읽기 조사 상태였고 로컬 작업 트리는 깨끗했다.

- `git ls-remote --symref origin HEAD refs/heads/cloud/pokerogue-continue-20261105 refs/heads/main`의 작업 브랜치는 `6726fef092710e398f74f6d4f4eb8c24fc9bc448`이었다.
- GitHub 커넥터의 Git ref GET과 branches 목록 GET도 같은 작업 브랜치 SHA를 반환했다.
- 기본 브랜치는 `main`, 당시 기본 HEAD는 `55e513e57b1cf1a30eb6e9f9547344f19d65b752`로 작업 브랜치와 구분했다. main 객체는 읽기 fetch만 했으며 작업 브랜치는 이동하지 않았다.
- 로컬 HEAD도 `6726fef`였고 `git merge-base --is-ancestor`로 `c9f0c01`, 부활 수정 `998d8d1`, 사파리 수정 `6037c54`가 모두 그 조상임을 확인했다.
- 로컬 최근 이력은 `c292473 → 6037c54 → 3b6f797 → 6726fef`이며 이 세 push는 본 작업의 일반 push 결과와 원격 SHA 일치 확인 기록이 있다.

부모 채팅은 이후 QA가 이전 로컬 사본의 ref를 원격 HEAD로 착각한 것이 원인이라고 확인했고, 원격 쓰기 중지를 해제했다. 과거 사본 `c9f0c01`에 아직 없는 수정 두 개의 결함이 재현되는 것은 최신 원격이 되돌아갔다는 근거가 아니었다. 이 환경의 origin fetch 설정은 인계 태그만 가져오므로 `git fetch origin`만으로 브랜치 추적 ref가 갱신된다고 가정해서도 안 된다.

공개 push 이벤트 API를 통한 과거 실행 주체 조회는 네트워크 터널403으로 차단돼 반복하거나 우회하지 않았다. 커밋 작성자를 push 실행자로 간주하지 않았다. 현재 원격의 되돌림이나 제3자의 변경은 관측되지 않았다.

후속 QA는 전체 SHA로 격리 사본을 고정하고, 조회한 원격 URL·정확한 ref·SHA·시각을 함께 기록한다. 현재 cloud의 로컬/원격은 같아 merge나 ref 복구가 필요 없다. main과 cloud는 조회한 객체에서 공통 조상이 없는 별도 스냅샷 이력이므로 main을 임의 병합하거나 allow-unrelated-histories를 사용하지 않는다. 이후 cloud 작업이 갈라지면 별도 통합 브랜치에서 일반 merge와 검증을 준비하고 강제 push 없이 처리한다. 사용자 저장과 원격 기존 이력은 보존한다.
