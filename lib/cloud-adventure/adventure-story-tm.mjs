import storyTmCompatibility from '../../data/adventure-za-story-tm.json' with {type:'json'};
import storyTmFormCompatibility from '../../data/adventure-za-story-tm-forms.json' with {type:'json'};
// Z-A 2.0 base species and reviewed regional forms:
// https://github.com/Fortelle/pokemon-learnsets/tree/79351bcf414276f82efda89c474f9de6e837af06/raw/legendsza%402.0.0
export const STORY_TMS=[
 // https://www.serebii.net/attackdex-sv/liquidation.shtml (Z-A TM076)
 {id:'za-tm076',number:'076',move:'아쿠아브레이크',learners:storyTmCompatibility['076']},
 // Serebii lists only Galarian Meowth for species 52; its form is listed separately.
 // https://www.serebii.net/attackdex-sv/x-scissor.shtml
 {id:'za-tm081',number:'081',move:'시저크로스',learners:storyTmCompatibility['081']},
 {id:'za-tm090',number:'090',move:'악의파동',learners:storyTmCompatibility['090']},
 {id:'za-tm047',number:'047',move:'고속이동',learners:storyTmCompatibility['047']},
 {id:'za-tm045',number:'045',move:'탁쳐서떨구기',learners:storyTmCompatibility['045']},
 {id:'za-tm025',number:'025',move:'깨물어부수기',learners:storyTmCompatibility['025']},
 {id:'za-tm089',number:'089',move:'독압정',learners:storyTmCompatibility['089']},
 {id:'za-tm013',number:'013',move:'냉동빔',learners:storyTmCompatibility['013']},
 {id:'za-tm056',number:'056',move:'이판사판태클',learners:storyTmCompatibility['056']},
 {id:'za-tm034',number:'034',move:'깜짝베기',learners:storyTmCompatibility['034']},
 {id:'za-tm039',number:'039',move:'방전',learners:storyTmCompatibility['039']},
 {id:'za-tm005',number:'005',move:'울부짖기',learners:storyTmCompatibility['005']},
 {id:'za-tm103',number:'103',move:'분발',learners:storyTmCompatibility['103']},
 {id:'za-tm022',number:'022',move:'제비반환',learners:storyTmCompatibility['022']},
 {id:'za-tm041',number:'041',move:'물의파동',learners:storyTmCompatibility['041']},
 {id:'za-tm040',number:'040',move:'씨기관총',learners:storyTmCompatibility['040']},
 {id:'za-tm051',number:'051',move:'신비의부적',learners:storyTmCompatibility['051']},
 {id:'za-tm066',number:'066',move:'볼트체인지',learners:storyTmCompatibility['066']},
 {id:'za-tm011',number:'011',move:'벌크업',learners:storyTmCompatibility['011']},
 {id:'za-tm020',number:'020',move:'치근거리기',learners:storyTmCompatibility['020']},
 {id:'za-tm100',number:'100',move:'더스트슈트',learners:storyTmCompatibility['100']},
 {id:'za-tm104',number:'104',move:'플레어드라이브',learners:storyTmCompatibility['104']},
];
export function storyTm(id){return STORY_TMS.find(tm=>tm.id===id)||null;}
export function canLearnStoryTm(bag,mon,id){const tm=storyTm(id);if(!tm||!(Number(bag?.[id])>0)||!mon||mon.moves?.includes(tm.move))return false;if(mon.id===mon.speciesId)return tm.learners.includes(mon.speciesId);const form=storyTmFormCompatibility[mon.id];return !!form&&form.speciesId===mon.speciesId&&form.tms.includes(tm.number);}
