import {rogueRetryActions} from './adventure-rogue-retry.mjs';
// These positions and level are provisional. See the mission 15–18 source audit.
export const MISSION15_CASES=[
 {n:16,id:'mission16-beedrill',name:'메가독침붕',species:10090,stone:'beedrillite',district:'lumiose-rooftop',tile:'d',label:'옥상'},
 {n:17,id:'mission17-hawlucha',name:'메가루차불',species:10300,stone:'hawluchanite',district:'lumiose-north-boulevard',tile:'d',label:'북쪽 큰길'},
 {n:18,id:'mission18-banette',name:'메가다크펫',species:10056,stone:'banettite',district:'lumiose-site',tile:'d',label:'공사 현장'},
];
export function mission15Complete(s){return MISSION15_CASES.every(c=>s[`zaMission${c.n}Complete`]===true);}
export function mission15Case(s){if(!s.interior&&s.district==='lumiose-jaune-sector9')return MISSION15_CASES.find(c=>c.n===18);if(!s.interior&&s.district==='lumiose-mission16-roof')return MISSION15_CASES.find(c=>c.n===16);if(!s.interior&&s.district==='lumiose-magenta-sector3-roof')return MISSION15_CASES.find(c=>c.n===17);return MISSION15_CASES.find(c=>c.district===s.district&&!s.interior);}
export function mission15CaseDialogue(s){const c=mission15Case(s);if(!c)return null;if(s[`zaMission${c.n}RewardPending`]===true)return {name:`폭주 ${c.name} (위치 초안)`,text:'사건 보상을 받자.',action:'claimMission15Stone',label:'메가스톤 받기'};if(s.zaMission15Stage===2&&!s[`zaMission${c.n}Complete`])return {name:`폭주 ${c.name} (위치 초안)`,text:'동료와 함께 폭주 메가진화를 진정시키자. 원작 경로는 확인 중이다.',...rogueRetryActions(s,c.id,'battleMission15Case',`${c.name}와 배틀`)};return null;}
