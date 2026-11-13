import {learnableMoves,tutorMoves} from '../pokemon-config.mjs';
import {RESEARCH_TM_REWARDS,hasResearchTm,canLearnResearchTm} from './adventure-research.mjs';
import {STORY_TMS,canLearnStoryTm} from './adventure-story-tm.mjs';

// Check the actual current form and inventory with the move hypothetically
// removed. Existing learnability helpers reject a move the Pokémon knows.
export function alphaMoveReplacementWarning(mon,slot,world,inventory){
 const name=mon?.adventureAlphaMove;
 if(typeof name!=='string'||!name||!Array.isArray(mon?.moves)||mon.moves[slot]!==name)return null;
 const forgotten={...mon,moves:mon.moves.filter(move=>move!==name)};
 const research=RESEARCH_TM_REWARDS.filter(tm=>tm.move===name&&hasResearchTm(world,tm.level));
 const story=STORY_TMS.filter(tm=>tm.move===name&&Number(inventory?.[tm.id])>0);
 const owned=[...new Set([...research,...story].map(tm=>tm.number))];
 const usable=[...new Set([...research.filter(tm=>canLearnResearchTm(world,forgotten,tm.level)),...story.filter(tm=>canLearnStoryTm(inventory,forgotten,tm.id))].map(tm=>tm.number))];
 const paths=[];
 if(learnableMoves(forgotten,forgotten.level).includes(name))paths.push('레벨 기술 다시 배우기');
 if(usable.length)paths.push(`보유 기술머신 ${usable.join('·')}`);
 if(tutorMoves(forgotten).includes(name))paths.push('포켓몬센터 기술 교습소 (1,500코인)');
 const tmText=owned.length?`해당 기술머신 보유: ${owned.join('·')}${usable.length?'':'. 현재 이 폼의 학습 가능 여부는 확인되지 않았습니다'}.`:'현재 구현된 해당 기술머신을 보유하고 있지 않습니다.';
 return `우두머리 고유 기술 ${name}을(를) 잊으려 합니다.\n${tmText}\n${paths.length?`현재 게임에서 다시 배우는 경로: ${paths.join(' / ')}.`:'현재 게임에서 다시 배울 수 있는 경로가 확인되지 않았습니다.'}\n정말 교체하시겠습니까?`;
}
