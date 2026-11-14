import storyTmCompatibility from '../../data/adventure-za-story-tm.json' with {type:'json'};
import storyTmFormCompatibility from '../../data/adventure-za-story-tm-forms.json' with {type:'json'};
// Z-A 2.0 base species and reviewed regional forms:
// https://github.com/Fortelle/pokemon-learnsets/tree/79351bcf414276f82efda89c474f9de6e837af06/raw/legendsza%402.0.0
export const STORY_TMS=[
 // Z-A TM088 base species, checked against Serebii's Z-A TM list.
 {id:'za-tm088',number:'088',move:'압정뿌리기',learners:[52,53,211,214,225,227,315,361,362,383,406,407,444,445,478,543,544,545,568,569,650,651,652,656,657,658,659,660,678,703,707,719,767,768,801,863,904,969,970]},
 // Legends: Z-A TM043 base-form compatibility (Serebii Fly AttackDex).
 {id:'za-tm043',number:'043',move:'공중날기',learners:[6,16,17,18,41,42,83,142,149,169,225,227,333,334,373,380,381,384,396,397,398,623,649,661,662,663,701,714,715,717,780,821,822,823,865,931,973]},
 // Reviewed base species; Alolan Marowak is a form, not base species 105.
 // https://www.serebii.net/attackdex-sv/will-o-wisp.shtml — Z-A TM057.
 {id:'za-tm057',number:'057',move:'도깨비불',learners:[4,5,6,92,93,94,136,150,228,229,255,256,257,280,281,282,302,322,323,334,353,354,359,383,475,478,479,485,491,498,499,500,513,514,562,563,607,608,609,653,654,655,661,662,663,667,668,708,709,710,711,721,778,802,827,828,867,935,936,937,952,971,972]},
 // https://www.serebii.net/attackdex-sv/whirlwind.shtml — reviewed base forms.
 {id:'za-tm094',number:'094',move:'날려버리기',learners:[16,17,18,41,42,142,149,169,227,325,326,384,396,397,398,449,450,661,662,663,666,714,715,780,973]},
 // Independently reviewed ZA TM085 base species; not an exhaustive list.
 // https://www.serebii.net/attackdex-sv/substitute.shtml (Legends: Z-A TM085)
 {id:'za-tm085',number:'085',move:'대타출동',learners:[1,2,3,4,5,6,7,8,9,15,16,17,18,23,24,25,26,35,36,39,40,41,42,52,53,56,57,63,64,65,66,67,68,69,70,71,79,80,83,92,93,94,95,104,105,115,120,121,122,123,127,130,133,134,135,136,137,142,147,148,149,152,153,154,158,159,160,167,168,169,172,173,174,179,180,181,196,197,280,281,282,447,448,470,471,475,498,499,500,650,651,652,653,654,655,656,657,658,700]},
 // https://www.serebii.net/attackdex-sv/flamethrower.shtml (Z-A TM062)
 {id:'za-tm062',number:'062',move:'화염방사',learners:storyTmCompatibility['062']},
 // https://www.serebii.net/attackdex-sv/firespin.shtml (Z-A TM072)
 {id:'za-tm072',number:'072',move:'회오리불꽃',learners:storyTmCompatibility['072']},
 // https://www.serebii.net/attackdex-sv/dazzlinggleam.shtml (Z-A TM092)
 {id:'za-tm092',number:'092',move:'매지컬샤인',learners:storyTmCompatibility['092']},
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
// Only explicitly reviewed project form IDs; never infer a form from its species.
// https://www.dittobase.com/legends-za/moves/will-o-wisp
const TM088_FORMS=Object.freeze({10107:52,10108:53,10161:52,10234:211});
const TM057_FORMS=Object.freeze({
 10008:479,10009:479,10010:479,10011:479,10012:479,
 10027:710,10028:710,10029:710,10030:711,10031:711,10032:711,
 10034:6,10035:6,10038:94,10043:150,10044:150,10048:229,
 10050:257,10051:282,10056:354,10057:359,10066:302,10067:334,
 10068:475,10078:383,10087:323,10115:105,10143:778,10179:562,
 10285:478,10286:500,10291:609,10293:655,10295:668,10307:359,
 10311:485,10312:491,10320:952,
});
export function canLearnStoryTm(bag,mon,id){const tm=storyTm(id);if(!tm||!(Number(bag?.[id])>0)||!mon||mon.moves?.includes(tm.move))return false;if(mon.id===mon.speciesId)return tm.learners.includes(mon.speciesId);if(tm.number==='088'&&Object.hasOwn(TM088_FORMS,mon.id))return TM088_FORMS[mon.id]===mon.speciesId;if(tm.number==='043'&&mon.id===10166)return mon.speciesId===83;if(tm.number==='057'&&Object.hasOwn(TM057_FORMS,mon.id))return TM057_FORMS[mon.id]===mon.speciesId;const form=storyTmFormCompatibility[mon.id];return !!form&&form.speciesId===mon.speciesId&&form.tms.includes(tm.number);}
