// Brief adaptations, not verbatim transcripts. Encounter/victory/defeat source:
// https://github.com/pagefaultgames/pokerogue-locales/blob/3281813012d8520a2216fb80ed7ec7a77bd8ab6e/ko/dialogue.json
const named={
 63:{intro:'처음 보는 트레이너네. 나와 배틀하자!',win:'정말 강하구나!'},
 200:{intro:'내 바위 포켓몬의 단단한 힘을 보여주겠어!',win:'네 힘이 내 단단한 방어를 뚫었구나!',loss:'방어를 살린 전투가 내 방식이지.'},
 201:{intro:'물 포켓몬으로 거침없이 공격할 거야!',win:'대단한 실력이야. 인정할게!',loss:'내 물 포켓몬의 움직임을 봤지?'},
 202:{intro:'내 전기 포켓몬의 힘을 보여주겠어요!',win:'놀라워요! 당신의 팀은 강하군요!',loss:'찌릿한 전기 배틀이었어요!'},
 203:{intro:'포켓몬들의 배틀 실력도 한번 봐 주세요.',win:'아, 제 패배예요.',loss:'편안하고 즐거운 승부였어요.'},
 207:{intro:'로켓단 보스의 힘을 직접 보여주마!',win:'내가 지다니… 믿을 수 없군.',loss:'다시는 나를 가로막지 마라.'},
 303:{intro:'기다리고 있었다. 네 실력을 시험하겠다.',win:'나를 넘어섰군. 훌륭하다!',loss:'넌 약하지 않다. 다시 도전해라.'},
 353:{intro:'여행하며 얻은 모든 것을 이번 승부에 보여줘.',win:'챔피언인 내가 패배하다니…',loss:'즐거운 승부였어. 고마워!'},
 355:{intro:'너의 도전을 받아들여 온 힘으로 싸울게.',win:'멋진 포켓몬 배틀도 끝이 나는구나.',loss:'포켓몬을 아끼는 마음은 잊지 마.'},
};
const rival={
 1:{intro:'꿈을 향해 떠나는 거구나. 떠나기 전에 나와 실력을 겨뤄 보자!',win:'정말 강하네. 네 꿈을 향해 힘내!'},
 2:{intro:'다시 만났네! 그동안 훈련했으니 재대결하자.',win:'이번에도 졌구나. 더 열심히 훈련해야겠어.'},
 3:{intro:'계속 이겨 온 네가 앞으로도 준비됐는지 내게 보여줘.',win:'쉬지 않고 훈련했는데도 네게 닿지 못했어…'},
 4:{intro:'너를 이기기 위해 훈련했어. 이제 시작하자.',win:'너는 대체 얼마나 강해진 거야…?'},
 5:{intro:'…',win:'…'},
 6:{intro:'우리가 만난 이유가 있을 거야. 앞으로 나아갈 힘을 내게 보여줘.',win:'내 역할은 여기까지야. 모든 일이 끝나면 꼭 집으로 돌아와.'},
};
export function classicTrainerDialogue(encounter,phase){if(!encounter?.trainer||!['intro','win','loss'].includes(phase)||encounter.kind==='mystery')return null;const id=encounter.trainer.id,lines=encounter.kind==='rival'?rival[id-374]:named[id],message=lines?.[phase];return message?`${encounter.trainer.name}: ${message}`:null;}
