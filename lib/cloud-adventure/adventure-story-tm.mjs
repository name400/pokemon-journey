import storyTmCompatibility from '../../data/adventure-za-story-tm.json' with {type:'json'};
import storyTmFormCompatibility from '../../data/adventure-za-story-tm-forms.json' with {type:'json'};
import {knowsAdventureMove} from './adventure-move-identity.mjs';
import {adventureTmIdentityConsistent} from './adventure-tm-identity.mjs';
// Z-A 2.0 base species and reviewed regional forms:
// https://github.com/Fortelle/pokemon-learnsets/tree/79351bcf414276f82efda89c474f9de6e837af06/raw/legendsza%402.0.0
export const STORY_TMS=[
 // Legends: Z-A TM095, base species from the Z-A table; unlisted forms remain unverified.
 // https://www.serebii.net/attackdex-sv/taunt.shtml
 {id:'za-tm095',number:'095',move:'도발',learners:[39,40,41,42,52,53,56,57,63,64,65,92,93,94,95,122,130,134,136,142,150,169,174,197,199,208,211,227,228,229,246,247,248,280,281,282,302,303,307,308,318,319,325,326,335,336,353,354,358,359,433,439,470,471,475,478,479,485,491,498,499,500,509,510,511,512,513,514,515,516,538,539,551,552,553,559,560,582,583,584,587,607,608,609,638,639,640,647,656,657,658,667,668,674,675,678,686,687,688,689,700,701,714,715,717,720,721,739,740,767,768,778,807,821,822,823,827,828,849,852,853,863,866,867,877,904,931,936,937,942,943,944,945,967,973,978,979]},
 // Selected base species reviewed against Z-A TM075; other species and forms remain unverified.
 // https://www.serebii.net/attackdex-sv/dragonpulse.shtml
 {id:'za-tm075',number:'075',move:'용의파동',learners:[4,5,6,7,8,9,95,130,142,147,148,149,181,208,248,253,254,306,333,334,336,349,350,371,372,373,380,381,383,384,443,444,445,448,485,559,560,604,690,691,692,693,695,696,697,704,705,706,714,715,718,780,867,936,967,978,996,997,998]},
 // Representative verified species; additional compatible species remain to be reviewed.
 // https://www.serebii.net/attackdex-sv/electroweb.shtml
 {id:'za-tm101',number:'101',move:'일렉트릭네트',learners:[13,14,15,25,26,135,137,167,168,172,179,180,181,233,474,479,587,604,618,649,694,695,801,807,849,877]},
 // Selected base forms cross-checked; remaining species need review.
 // https://www.serebii.net/attackdex-sv/earthpower.shtml
 // https://www.dittobase.com/legends-za/moves/earth-power
 {id:'za-tm052',number:'052',move:'대지의힘',learners:[3,104,105,142,150,152,153,154,208,246,247,248,258,259,260,304,305,306,322,323,326,383,384,443,444,445,449,450,460,485,530,551,552,553,618,622,623,639,647,659,660,667,668,696,697,698,699,703,718,719,721,769,770,780,867,932,933,934,970]},
 // https://www.serebii.net/attackdex-sv/metronome.shtml — confirmed base forms.
 {id:'za-tm099',number:'099',move:'손가락흔들기',learners:[35,36,39,40,52,53,56,57,63,64,65,66,67,68,80,93,94,122,149,150,173,199,280,281,282,302,307,308,353,354,448,475]},
 // Legends: Z-A TM048 base forms cross-checked against Serebii and Dittobase.
 // https://www.serebii.net/attackdex-sv/self-destruct.shtml
 {id:'za-tm048',number:'048',move:'자폭',learners:[39,40,92,93,94,95,120,121,137,150,208,211,233,316,317,323,358,362,375,376,433,474,562,563,568,569,582,583,584,615,622,623,649,684,685,703,710,711,721,801,808,809,867,904,969,970]},
 // Confirmed base species; additional forms and species are not inferred.
 // https://www.serebii.net/attackdex-sv/reflect.shtml (Z-A TM031)
 {id:'za-tm031',number:'031',move:'리플렉터',learners:[16,17,18,25,26,35,36,39,40,63,64,65,69,70,71,120,121,122,137,150,152,153,154,172,173,174,179,180,181,196,197,199,233,280,281,282,302,307,308,325,326,358,375,376,433,439,474,475,478,479,517,518,531,615,622,623,650,651,652,655,677,678,679,680,681,682,683,686,687,698,699,700,703,707,708,709,823,866,936,937,944,945,957,958,959,969,970]},
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
 {id:'za-tm085',number:'085',move:'대타출동',learners:[1,2,3,4,5,6,7,8,9,15,16,17,18,23,24,25,26,35,36,39,40,41,42,52,53,56,57,63,64,65,66,67,68,69,70,71,79,80,83,92,93,94,95,104,105,115,120,121,122,123,127,130,133,134,135,136,137,142,147,148,149,150,152,153,154,158,159,160,167,168,169,172,173,174,179,180,181,196,197,199,208,212,214,227,228,229,233,246,247,248,252,253,254,255,256,257,258,259,260,280,281,282,302,303,304,305,306,307,308,309,310,315,318,319,322,323,333,334,353,354,371,372,373,375,376,396,397,398,406,407,427,428,443,444,445,447,448,459,460,470,471,475,479,498,499,500,607,608,609,650,651,652,653,654,655,656,657,658,700]},
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
// Explicit species/form IDs; other forms are never inferred from species.
// https://www.dittobase.com/legends-za/moves/self-destruct
// Explicit ZA TM031 forms confirmed independently; never infer from species.
const TM031_FORMS=Object.freeze({10100:26,10168:122,10008:479,10009:479,10010:479,10011:479,10012:479});
const TM048_FORMS=Object.freeze({10179:562,10234:211,10027:710,10028:710,10029:710,10030:711,10031:711,10032:711,30075:649,30076:649,30077:649,30078:649,10147:801});
// Form identity is checked separately; Galarian Yamask does not imply Unovan Yamask.
const TM052_FORMS=Object.freeze({10115:105,10179:562,10180:618});
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
// Explicitly reviewed regional and cosmetic forms; do not infer from the base species.
// Hisuian forms explicitly checked; other forms are not inferred.
// https://www.dittobase.com/legends-za/moves/dragon-pulse
const TM095_FORMS=Object.freeze({10107:52,10161:52,10108:53,10168:122,10234:211,10008:479,10009:479,10010:479,10011:479,10012:479});
const TM075_FORMS=Object.freeze({10241:705,10242:706,10258:978,10259:978});
const TM101_FORMS=Object.freeze({10100:26,10008:479,10009:479,10010:479,10011:479,10012:479,10147:801,10184:849,10187:877,30075:649,30076:649,30077:649,30078:649});
export function canLearnStoryTm(bag,mon,id){const tm=storyTm(id);if(!tm||!(Number(bag?.[id])>0)||!adventureTmIdentityConsistent(mon)||knowsAdventureMove(mon,tm.move))return false;if(mon.id===mon.speciesId)return tm.learners.includes(mon.speciesId);if(tm.number==='095'&&Object.hasOwn(TM095_FORMS,mon.id))return TM095_FORMS[mon.id]===mon.speciesId;if(tm.number==='075'&&Object.hasOwn(TM075_FORMS,mon.id))return TM075_FORMS[mon.id]===mon.speciesId;if(tm.number==='101'&&Object.hasOwn(TM101_FORMS,mon.id))return TM101_FORMS[mon.id]===mon.speciesId;if(tm.number==='031'&&Object.hasOwn(TM031_FORMS,mon.id))return TM031_FORMS[mon.id]===mon.speciesId;if(tm.number==='048'&&Object.hasOwn(TM048_FORMS,mon.id))return TM048_FORMS[mon.id]===mon.speciesId;if(tm.number==='052'&&Object.hasOwn(TM052_FORMS,mon.id))return TM052_FORMS[mon.id]===mon.speciesId;if(tm.number==='088'&&Object.hasOwn(TM088_FORMS,mon.id))return TM088_FORMS[mon.id]===mon.speciesId;if(tm.number==='043'&&mon.id===10166)return mon.speciesId===83;if(tm.number==='057'&&Object.hasOwn(TM057_FORMS,mon.id))return TM057_FORMS[mon.id]===mon.speciesId;const form=storyTmFormCompatibility[mon.id];return !!form&&form.speciesId===mon.speciesId&&form.tms.includes(tm.number);}
