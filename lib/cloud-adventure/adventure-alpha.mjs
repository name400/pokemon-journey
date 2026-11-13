import {Battle} from '@pkmn/sim';
import {configure,moveNameByKey,rules} from '../pokemon-config.mjs';

// Confirmed Z-A exclusive moves for the wild alpha species represented in the
// current adventure. Keys are project form IDs, never broad species fallbacks.
// https://bulbapedia.bulbagarden.net/wiki/List_of_alpha_Pok%C3%A9mon_in_Legends:_Z-A_by_exclusive_move
const alphaMoveKeys={
 // Species newly reachable through surveyed grass encounters in Zones 1–20.
 1:'sludgebomb',4:'thunderpunch',7:'icepunch',13:'electroweb',14:'electroweb',23:'darkpulse',64:'energyball',66:'rockslide',79:'icywind',92:'psychic',93:'thunderbolt',95:'ironhead',115:'poweruppunch',121:'blizzard',123:'closecombat',127:'stoneedge',133:'dig',152:'dazzlinggleam',158:'dragonclaw',172:'swift',173:'psyshock',179:'dig',180:'icepunch',214:'stoneedge',225:'waterpulse',227:'rocktomb',228:'mudshot',282:'thunderbolt',302:'poisonjab',304:'earthpower',305:'shadowclaw',306:'earthquake',307:'poisonjab',308:'shadowball',315:'shadowball',322:'zenheadbutt',353:'psychic',361:'waterpulse',371:'thunderfang',406:'swift',407:'dazzlinggleam',427:'dig',448:'icepunch',449:'thunderfang',450:'icefang',459:'waterpulse',498:'wildcharge',504:'bulletseed',529:'rocksmash',531:'dazzlinggleam',543:'spikes',545:'earthquake',551:'firefang',560:'poisonjab',569:'focusblast',582:'flashcannon',587:'energyball',608:'darkpulse',618:'sludgebomb',650:'rocktomb',660:'gunkshot',664:'protect',665:'irondefense',666:'dazzlinggleam',669:'swift',670:'gigadrain',671:'psychic',672:'zenheadbutt',673:'playrough',674:'icepunch',677:'energyball',679:'headbutt',687:'poisonjab',689:'poweruppunch',691:'surf',703:'earthpower',707:'psychic',708:'poisonjab',780:'fireblast',870:'poisonjab',
 15:'outrage',16:'uturn',24:'earthquake',25:'irontail',35:'psychic',69:'toxic',70:'energyball',80:'icebeam',120:'icebeam',129:'hydropump',167:'dig',181:'dazzlinggleam',208:'earthquake',229:'sludgebomb',303:'stoneedge',310:'icefang',319:'zenheadbutt',323:'stoneedge',354:'dazzlinggleam',373:'earthquake',428:'closecombat',460:'earthpower',505:'gunkshot',530:'focusblast',544:'rocktomb',552:'aerialace',659:'earthpower',661:'swift',662:'uturn',667:'thunderfang',668:'wildcharge',675:'poisonjab',676:'zenheadbutt',678:'thunderbolt',10025:'earthpower',688:'xscissor',693:'icebeam',709:'rockslide',711:'fireblast',713:'stoneedge'};

// Preserve the existing wild-IV policy (all 31), which satisfies Z-A's minimum
// of three perfect IVs, until the remaining-IV distribution is verified.
export function makeAdventureAlpha(mon){
 const alphaMove=moveNameByKey[alphaMoveKeys[mon.id]]||null;
 const moves=alphaMove?[alphaMove,...(mon.moves||[]).filter(move=>move!==alphaMove)].slice(0,4):mon.moves;
 // Snapshot only the moves this newly generated alpha knows. Later learned moves
 // still require their own level or Seed of Mastery; existing saves are untouched.
 const mastered=[...new Set([...(Array.isArray(mon.adventurePlusMastered)?mon.adventurePlusMastered:[]),...(moves||[]).map(name=>rules.moves[name]?.key).filter(Boolean)])];
 return configure({...mon,moves,adventurePlusMastered:mastered,evs:{...mon.evs,hp:252},adventureAlpha:true,...(alphaMove?{adventureAlphaMove:alphaMove}:{})});
}

// Operate only on the newly created adventure battle snapshot. Captured data and
// other game modes retain normal Pokémon stats; Showdown serializes these values.
export function applyAdventureAlphaBattleStats(combat){
 const battle=Battle.fromJSON(combat.snapshot);
 const sides=combat.format==='mission10-multi-v1'?[[1,battle.p2],[3,battle.p4]]:[[1,battle.p2]];
 for(const [index,side] of sides)for(const mon of combat.teams[index]||[]){
  if(mon.adventureAlpha!==true)continue;
  const actor=side.pokemon.find(p=>p.set.trainerToken===String(mon.boxId));
  if(!actor)throw Error('우두머리 배틀 정보를 확인하세요.');
  for(const key of ['atk','def','spa','spd']){actor.storedStats[key]*=2;actor.baseStoredStats[key]*=2;}
 }
 const formatid=combat.snapshot.formatid;combat.snapshot=battle.toJSON();if(formatid)combat.snapshot.formatid=formatid;return combat;
}
