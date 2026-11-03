// Adapted Korean summaries of the pinned PokéRogue encounter; the short battle
// acceptance lines are from pokerogue-locales 3281813012d8520a2216fb80ed7ec7a77bd8ab6e.
// Source: https://github.com/pagefaultgames/pokerogue-locales/blob/3281813012d8520a2216fb80ed7ec7a77bd8ab6e/ko/mystery-encounters/a-trainers-test-dialogue.json
const lines={
 120:{intro:'나는 맥이야! 알 하나를 맡아줄 강한 트레이너를 찾고 있어. 나를 이기면 더 귀한 알을 줄게.',accept:'좋아, 불타오르는걸!',rest:'지친 포켓몬부터 돌봐줄게. 알도 하나 받아 줘.'},
 121:{intro:'나는 모미야. 두 알 중 하나를 맡아줄 사람을 찾고 있어. 승부에서 이기면 더 희귀한 알을 줄게.',accept:'준비 됐겠지!',rest:'포켓몬들이 지쳐 보이네. 내가 치료를 도와줄게.'},
 122:{intro:'…나는 미정이야. 알 하나를 맡아줄래? 내게 이긴다면 더 희귀한 알을 줄게.',accept:'…알겠어.',rest:'…포켓몬들을 회복시켜 줄게.'},
 123:{intro:'안녕, 미루야! 알 하나를 맡길 사람을 찾고 있어. 미루보다 강하다면 더 희귀한 알을 줄게!',accept:'승부하는 거지? 야호!',rest:'승부는 다음에 하자! 포켓몬들을 치료해 줄게.'},
 124:{intro:'나는 현이야. 희귀한 알을 맡아줄 트레이너를 찾고 있어. 나를 이기면 더 귀한 알을 주겠다.',accept:'그 얼굴… 승부다.',rest:'포켓몬들의 회복을 도와주겠다. 알도 맡아 줘.'},
};
export const legacyStatTrainerDialogue=id=>lines[id]||null;
