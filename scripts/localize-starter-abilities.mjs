import fs from 'node:fs';
const path='data/starter-option-descriptions.json',data=JSON.parse(fs.readFileSync(path,'utf8')),ko={};
const put=(keys,text)=>{for(const key of keys.split(','))ko[key]=text;};
put('noability','별도의 특성 효과가 없습니다.');
put('airlock,cloudnine','필드에 있는 동안 날씨로 인한 효과를 무효화합니다. 날씨 자체가 사라지는 것은 아닙니다.');
put('battlearmor,shellarmor','상대의 공격이 급소에 맞지 않습니다.');
put('clearbody,fullmetalbody,whitesmoke','다른 포켓몬의 효과로 능력치 랭크가 내려가지 않습니다.');
put('chlorophyll','햇살이 강할 때 스피드가 2배가 됩니다.');
put('dazzling,queenlymajesty,armortail','자신과 같은 편을 향한 상대의 선제공격 기술을 막습니다.');
put('defiant','상대에게 능력치 랭크가 내려갈 때마다 공격이 2랭크 올라갑니다.');
put('competitive','상대에게 능력치 랭크가 내려갈 때마다 특수공격이 2랭크 올라갑니다.');
put('emergencyexit,wimpout','공격을 받아 HP가 최대 HP의 절반 이하가 되면 교체합니다.');
put('filter,prismarmor,solidrock','효과가 굉장한 공격으로 받는 피해가 3/4로 줄어듭니다.');
put('furcoat','방어가 2배가 됩니다.');
put('hugepower,purepower','공격이 2배가 됩니다.');
put('grimneigh','공격으로 상대를 쓰러뜨리면 특수공격이 1랭크 올라갑니다.');
put('chillingneigh,moxie','공격으로 상대를 쓰러뜨리면 공격이 1랭크 올라갑니다.');
put('heavymetal','몸무게가 2배가 됩니다.');
put('lightmetal','몸무게가 절반이 됩니다.');
put('innerfocus','풀죽지 않으며 위협의 효과를 받지 않습니다.');
put('insomnia,vitalspirit','잠듦 상태가 되지 않습니다. 이미 잠든 상태에서 이 특성을 얻으면 깨어납니다.');
put('ironbarbs,roughskin','접촉 공격을 한 상대에게 상대 최대 HP의 1/8만큼 피해를 줍니다.');
put('keeneye,illuminate','다른 포켓몬에게 명중률이 떨어지지 않고 상대의 회피율 랭크를 무시합니다.');
put('libero,protean','내보낸 후 처음 사용하는 기술의 타입으로 자신의 타입이 바뀝니다. 교체할 때마다 다시 발동할 수 있습니다.');
put('moldbreaker,teravolt,turboblaze','기술을 사용할 때 상대의 방어에 관여하는 특성을 무시합니다.');
put('multiscale,shadowshield','HP가 가득 차 있으면 공격으로 받는 피해가 절반이 됩니다.');
put('powerofalchemy,receiver','같은 편이 쓰러지면 그 포켓몬의 특성을 이어받습니다.');
put('propellertail,stalwart','다른 효과로 자신의 기술 대상이 바뀌지 않습니다.');
put('raindish','비가 내리면 매 턴 종료 시 최대 HP의 1/16을 회복합니다.');
put('sandstream','등장하면 날씨를 모래바람으로 만듭니다.');
put('snowwarning','등장하면 날씨를 눈으로 만듭니다.');
put('scrappy','노말·격투 기술로 고스트타입을 공격할 수 있으며 위협의 효과를 받지 않습니다.');
put('slushrush','눈이 내리면 스피드가 2배가 됩니다.');
put('stormdrain','물 기술을 자신에게 끌어들여 무효화하고 특수공격을 1랭크 올립니다.');
put('lightningrod','전기 기술을 자신에게 끌어들여 무효화하고 특수공격을 1랭크 올립니다.');
put('tanglinghair,gooey','접촉 공격을 한 상대의 스피드를 1랭크 내립니다.');
put('waterabsorb','물 기술을 무효화하고 최대 HP의 1/4을 회복합니다.');
put('voltabsorb','전기 기술을 무효화하고 최대 HP의 1/4을 회복합니다.');
put('ballfetch,honeygather','기본 전투 엔진에서는 별도의 전투 중 효과가 없습니다.');
for(const [key,type] of [['aerilate','비행'],['galvanize','전기'],['pixilate','페어리'],['refrigerate','얼음'],['dragonize','드래곤']])put(key,`노말타입 기술이 ${type}타입으로 바뀌고 위력이 1.2배가 됩니다.`);
for(const [key,type] of [['dragonsmaw','드래곤'],['firemane','불꽃'],['rockypayload','바위'],['steelworker','강철']])put(key,`${type}타입으로 공격할 때 공격에 사용하는 능력치가 1.5배가 됩니다.`);
for(const [key,terrain] of [['electricsurge','일렉트릭필드'],['grassysurge','그래스필드'],['mistysurge','미스트필드'],['psychicsurge','사이코필드']])put(key,`등장하면 ${terrain}를 펼칩니다.`);
for(const [key,stat] of [['beadsofruin','특수방어'],['swordofruin','방어'],['tabletsofruin','공격'],['vesselofruin','특수공격']])put(key,`필드에서 같은 특성을 지니지 않은 다른 포켓몬의 ${stat}가 3/4로 줄어듭니다.`);
for(const [key,stat] of [['embodyaspectcornerstone','방어'],['embodyaspecthearthflame','공격'],['embodyaspectteal','스피드'],['embodyaspectwellspring','특수방어']])put(key,`등장하면 ${stat}가 1랭크 올라갑니다.`);
const lines=`adaptability|타입이 같은 기술의 보정이 1.5배에서 2배로 높아집니다.
aftermath|접촉 기술로 쓰러지면 공격한 상대에게 상대 최대 HP의 1/4만큼 피해를 줍니다.
analytic|턴에서 마지막으로 행동하면 공격 기술의 위력이 1.3배가 됩니다.
angerpoint|자신이 급소에 맞으면 공격 랭크가 최대까지 올라갑니다. 대타출동이 맞은 경우에는 발동하지 않습니다.
angershell|HP가 절반 이하가 되면 공격·특수공격·스피드가 1랭크 오르고 방어·특수방어가 1랭크 내려갑니다.
anticipation|등장할 때 상대가 효과가 굉장한 기술이나 일격필살기를 지녔으면 위험을 감지합니다.
arenatrap|공중에 떠 있지 않은 상대가 스스로 교체할 수 없게 합니다.
aromaveil|자신과 같은 편을 헤롱헤롱·사슬묶기·앵콜·회복봉인·도발·트집의 효과로부터 보호합니다.
asoneglastrier|긴장감과 백의울음의 효과를 동시에 지닙니다.
asonespectrier|긴장감과 흑의울음의 효과를 동시에 지닙니다.
aurabreak|필드에 있는 동안 다크오라·페어리오라의 위력 보정을 3/4로 뒤집습니다.
auraguard|접촉 기술로 받는 피해가 절반이 됩니다.
baddreams|매 턴 종료 시 잠든 상대에게 상대 최대 HP의 1/8만큼 피해를 줍니다.
battery|같은 편이 사용하는 특수 기술의 위력이 1.3배가 됩니다.
battlebond|공격으로 상대를 쓰러뜨리면 공격·특수공격·스피드가 각각 1랭크 올라갑니다. 한 전투에 한 번 발동합니다.
beastboost|공격으로 상대를 쓰러뜨리면 자신의 가장 높은 능력치가 1랭크 올라갑니다.
berserk|공격을 받아 HP가 절반 이하로 내려가면 특수공격이 1랭크 올라갑니다.
bigpecks|다른 포켓몬의 효과로 방어 랭크가 내려가지 않습니다.
bulletproof|구슬·폭탄 계열 기술의 공격을 받지 않습니다.
cheekpouch|나무열매를 먹으면 열매 효과에 더해 최대 HP의 1/3을 회복합니다.
colorchange|공격 기술에 맞으면 자신의 타입이 그 기술과 같은 타입으로 바뀝니다.
comatose|항상 잠든 것으로 취급되지만 정상적으로 행동할 수 있고 다른 상태이상에 걸리지 않습니다.
commander|같은 편에 어써러셔가 있으면 그 안에 들어가 공격받거나 행동할 수 없게 되고, 어써러셔의 모든 기본 능력치를 2랭크 올립니다.
compoundeyes|사용하는 기술의 명중률이 1.3배가 됩니다.
contrary|능력치 랭크가 오르는 효과는 내려가고 내려가는 효과는 올라가도록 뒤집습니다.
corrosion|타입과 관계없이 상대를 독·맹독 상태로 만들 수 있습니다.
costar|등장하면 같은 편의 능력치 랭크 변화를 복사합니다.
cottondown|공격에 맞으면 필드의 다른 포켓몬 모두의 스피드를 1랭크 내립니다.
cudchew|나무열매를 먹으면 다음 턴 종료 시 같은 나무열매를 다시 먹습니다.
curiousmedicine|등장하면 같은 편의 능력치 랭크 변화를 모두 0으로 되돌립니다.
cursedbody|공격에 맞으면 30% 확률로 그 기술을 사슬묶기 상태로 만듭니다.
cutecharm|접촉 공격을 한 이성의 상대를 30% 확률로 헤롱헤롱 상태로 만듭니다.
damp|필드에 있는 동안 대폭발·자폭·깜짝헤드·미스트버스트·유폭을 막습니다.
dancer|다른 포켓몬이 춤 기술을 쓰면 같은 기술을 이어서 사용합니다.
darkaura|필드에 있는 동안 모든 포켓몬의 악타입 기술 위력이 약 4/3배가 됩니다.
dauntlessshield|등장하면 방어가 1랭크 올라갑니다. 한 전투에 한 번 발동합니다.
defeatist|HP가 절반 이하이면 공격과 특수공격이 절반이 됩니다.
deltastream|등장하면 특성이 유효한 동안 강한 난기류를 일으킵니다.
desolateland|등장하면 특성이 유효한 동안 아주 강한 햇살을 만듭니다.
disguise|따라큐의 탈이 처음 받는 공격을 막고, 대신 최대 HP의 1/8만큼 피해를 받습니다.
download|등장할 때 상대의 방어와 특수방어를 비교해 더 낮은 쪽을 공략할 공격 능력치를 1랭크 올립니다.
drizzle|등장하면 비를 내리게 합니다.
drought|등장하면 햇살을 강하게 만듭니다.
dryskin|물 기술을 받으면 최대 HP의 1/4을 회복합니다. 비에서 매 턴 1/8 회복하고, 강한 햇살에서는 1/8 피해를 받으며 불꽃 공격에 더 약해집니다.
earlybird|잠듦 상태의 남은 턴이 평소보다 2배 빠르게 줄어듭니다.
eartheater|땅 기술을 무효화하고 최대 HP의 1/4을 회복합니다.
eelevate|땅 기술을 무효화하며, 공격으로 상대를 쓰러뜨리면 자신의 가장 높은 능력치를 1랭크 올립니다.
effectspore|접촉 공격을 한 상대를 30% 확률로 독·마비·잠듦 중 하나로 만듭니다.
electromorphosis|공격에 맞으면 충전 상태가 되어 다음 전기 공격을 강화합니다.
fairyaura|필드에 있는 동안 모든 포켓몬의 페어리타입 기술 위력이 약 4/3배가 됩니다.
flamebody|접촉 공격을 한 상대를 30% 확률로 화상 상태로 만듭니다.
flareboost|화상 상태이면 특수 기술의 위력이 1.5배가 됩니다.
flashfire|불꽃 기술을 무효화하고, 한 번 받으면 자신의 불꽃 공격을 1.5배로 강화합니다.
flowergift|체리꼬가 강한 햇살 아래 있으면 자신과 같은 편의 공격·특수방어가 1.5배가 됩니다.
flowerveil|같은 편 풀타입 포켓몬을 다른 포켓몬에 의한 능력치 하락과 상태이상으로부터 보호합니다.
fluffy|접촉 기술로 받는 피해는 절반이 되지만 불꽃 기술로 받는 피해는 2배가 됩니다.
forecast|캐스퐁의 타입과 모습이 날씨에 맞게 바뀝니다. 모래바람에는 별도 모습이 없습니다.
forewarn|등장하면 상대가 가진 기술 중 위력이 가장 높은 기술을 알아냅니다.
friendguard|같은 편이 다른 포켓몬의 공격으로 받는 피해를 3/4로 줄입니다.
frisk|등장하면 상대 포켓몬들의 지닌 물건을 확인합니다.
galewings|HP가 가득 차 있으면 비행 기술의 우선도가 1 올라갑니다.
gluttony|보통 HP 1/4 이하에서 먹는 나무열매를 HP 절반 이하부터 먹습니다.
goodasgold|상대의 변화 기술 효과를 받지 않습니다.
gorillatactics|공격이 1.5배가 되지만 처음 사용한 기술만 계속 선택할 수 있습니다.
grasspelt|그래스필드가 펼쳐져 있으면 방어가 1.5배가 됩니다.
guarddog|위협을 받으면 공격이 내려가는 대신 1랭크 오르고 강제 교체 효과를 받지 않습니다.
gulpmissile|윽우지가 파도타기·잠수로 먹이를 물고 있을 때 맞으면 상대 최대 HP의 1/4 피해를 줍니다. 모습에 따라 방어 하락 또는 마비도 일으킵니다.
guts|상태이상이 있으면 공격이 1.5배가 되며 화상에 의한 물리 피해 감소를 무시합니다.
hadronengine|등장하면 일렉트릭필드를 펼치고, 일렉트릭필드에서 특수공격이 약 4/3배가 됩니다.
harvest|사용한 나무열매를 턴 종료 시 50% 확률로 되찾습니다. 강한 햇살에서는 반드시 되찾습니다.
healer|턴 종료 시 같은 편의 상태이상을 30% 확률로 치료합니다.
heatproof|불꽃 공격을 받을 때 상대의 공격 능력치를 절반으로 계산하고 화상 피해도 절반으로 줄입니다.
hospitality|등장하면 같은 편의 HP를 그 포켓몬 최대 HP의 1/4만큼 회복합니다.
hungerswitch|모르페코가 턴 종료 시 배부른모양과 배고픈모양으로 번갈아 바뀝니다.
hustle|공격이 1.5배가 되지만 물리 기술의 명중률은 0.8배가 됩니다.
hydration|비가 내리면 턴 종료 시 자신의 상태이상을 치료합니다.
hypercutter|다른 포켓몬의 효과로 공격 랭크가 내려가지 않습니다.
icebody|눈이 내리면 매 턴 종료 시 최대 HP의 1/16을 회복합니다.
iceface|빙큐보의 아이스페이스가 첫 물리 공격을 막습니다. 눈이 내리는 조건에서 아이스페이스가 복구됩니다.
icescales|특수 공격으로 받는 피해가 절반이 됩니다.
illusion|직접 공격에 맞기 전까지 파티 맨 뒤 포켓몬의 모습으로 보입니다.
immunity|독 상태가 되지 않습니다. 독에 걸린 상태에서 이 특성을 얻으면 치료됩니다.
imposter|등장하면 마주 보는 상대 포켓몬으로 변신합니다.
infiltrator|상대의 대타출동·리플렉터·빛의장막·신비의부적·흰안개·오로라베일을 무시합니다.
innardsout|공격으로 쓰러지면 쓰러지기 직전에 남아 있던 HP만큼 공격한 상대에게 피해를 줍니다.
intimidate|등장하면 상대의 공격을 1랭크 내립니다.
intrepidsword|등장하면 공격이 1랭크 올라갑니다. 한 전투에 한 번 발동합니다.
ironfist|펀치 기술의 위력이 1.2배가 됩니다. 기습은 해당하지 않습니다.
justified|악타입 공격을 받으면 공격이 1랭크 올라갑니다.
klutz|지닌 물건의 효과가 없어집니다. 단, 교정깁스는 예외이며 내던지기를 쓸 수 없습니다.
leafguard|강한 햇살에서 상태이상에 걸리지 않으며 잠자기도 실패합니다.
levitate|땅 기술을 받지 않습니다. 중력·뿌리박기·떨어뜨리기·검은철구 등의 효과로 무효화될 수 있습니다.
limber|마비 상태가 되지 않습니다. 마비에 걸린 상태에서 이 특성을 얻으면 치료됩니다.
lingeringaroma|접촉 공격을 한 상대의 특성을 가시지않는향기로 바꿉니다.
liquidooze|자신에게서 HP를 흡수한 상대가 회복하는 대신 같은 양의 피해를 받습니다.
liquidvoice|소리 기술이 물타입으로 바뀝니다.
longreach|자신의 공격이 상대에게 접촉하지 않습니다.
magicbounce|일부 변화 기술을 막고 기술을 사용한 상대에게 반사합니다.
magicguard|직접 공격 이외의 피해를 받지 않습니다.
magician|지닌 물건이 없을 때 공격을 맞힌 상대의 물건을 빼앗습니다.
magmaarmor|얼음 상태가 되지 않습니다. 얼어 있을 때 이 특성을 얻으면 치료됩니다.
magnetpull|상대 강철타입 포켓몬이 스스로 교체하지 못하게 합니다.
marvelscale|상태이상이 있으면 방어가 1.5배가 됩니다.
megalauncher|파동 기술의 위력이 1.5배가 됩니다. 치유파동은 대상 최대 HP의 3/4을 회복합니다.
megasol|자신의 기술을 사용할 때 강한 햇살의 효과가 있는 것처럼 처리합니다.
merciless|독에 걸린 상대를 공격하면 반드시 급소에 맞습니다.
mimicry|필드에 맞춰 타입이 바뀌며 필드가 끝나면 원래 타입으로 돌아갑니다.
mindseye|노말·격투 기술이 고스트타입에게 맞고, 명중률 하락과 상대의 회피율 랭크를 무시합니다.
minus|같은 편에 마이너스 또는 플러스 특성이 있으면 특수공격이 1.5배가 됩니다.
mirrorarmor|자신이 받을 능력치 랭크 하락을 원인을 제공한 상대에게 돌려줍니다.
moody|매 턴 무작위 기본 능력치 하나가 2랭크 오르고 다른 하나는 1랭크 내려갑니다. 명중률·회피율은 제외됩니다.
motordrive|전기 기술을 무효화하고 스피드를 1랭크 올립니다.
multitype|아르세우스의 타입이 지닌 플레이트에 맞춰 바뀝니다.
mummy|접촉 공격을 한 상대의 특성을 미라로 바꿉니다.
myceliummight|변화 기술을 같은 우선도 안에서 마지막에 사용하지만 상대의 특성을 무시합니다.
naturalcure|교체하면 자신의 상태이상이 치료됩니다.
neuroforce|효과가 굉장한 공격으로 주는 피해가 추가로 1.25배가 됩니다.
neutralizinggas|필드에 있는 동안 다른 특성의 효과를 무효화합니다.
noguard|자신이 사용하거나 자신을 대상으로 사용되는 기술이 반드시 명중합니다.
normalize|자신의 기술을 노말타입으로 바꾸고 위력을 1.2배로 높입니다.
oblivious|헤롱헤롱과 도발 상태가 되지 않으며 위협의 효과를 받지 않습니다.
opportunist|상대의 능력치 랭크가 오르면 같은 상승 효과를 복사합니다.
orichalcumpulse|등장하면 햇살을 강하게 만들고, 강한 햇살에서 공격이 약 4/3배가 됩니다.
overcoat|가루 기술·모래바람 피해·포자의 효과를 받지 않습니다.
owntempo|혼란에 걸리지 않으며 위협의 효과를 받지 않습니다.
parentalbond|공격 기술로 두 번 공격합니다. 두 번째 타격의 피해는 1/4로 줄어듭니다.
pastelveil|자신과 같은 편을 독으로부터 보호합니다. 등장하면 같은 편의 독도 치료합니다.
perishbody|접촉 공격을 받으면 자신과 공격한 상대에게 멸망의노래 효과가 시작됩니다.
pickpocket|물건이 없는 상태에서 접촉 공격을 받으면 공격한 상대의 물건을 빼앗습니다.
pickup|물건이 없으면 인접한 포켓몬이 이번 턴에 사용한 물건을 주울 수 있습니다.
piercingdrill|접촉 기술이 상대의 방어 기술을 뚫고 평소 피해의 1/4을 줍니다.
plus|같은 편에 플러스 또는 마이너스 특성이 있으면 특수공격이 1.5배가 됩니다.
poisonheal|독에 걸려 있으면 독 피해 대신 매 턴 최대 HP의 1/8을 회복합니다.
poisonpoint|접촉 공격을 한 상대를 30% 확률로 독 상태로 만듭니다.
poisonpuppeteer|복숭악동이 상대를 독으로 만들면 그 상대를 혼란 상태로도 만듭니다.
poisontouch|접촉 공격을 맞히면 30% 확률로 상대를 독으로 만듭니다.
powerconstruct|지가르데 10%·50%폼이 턴 종료 시 HP 절반 이하이면 퍼펙트폼으로 바뀝니다.
powerspot|같은 편이 사용하는 기술의 위력이 1.3배가 됩니다.
prankster|변화 기술의 우선도가 1 올라갑니다. 이 효과로 우선도가 오른 변화 기술은 악타입에게 통하지 않습니다.
pressure|상대가 자신을 대상으로 기술을 쓰면 그 기술의 PP를 1 추가로 소모시킵니다.
primordialsea|등장하면 특성이 유효한 동안 강한 비를 내리게 합니다.
protosynthesis|강한 햇살 또는 부스트에너지로 가장 높은 능력치가 1.3배가 됩니다. 가장 높은 능력치가 스피드이면 1.5배입니다.
punkrock|소리 기술의 위력이 1.3배가 되며 받는 소리 기술의 피해는 절반이 됩니다.
purifyingsalt|상태이상에 걸리지 않으며 고스트 공격을 받을 때 상대의 공격 능력치를 절반으로 계산합니다.
quarkdrive|일렉트릭필드 또는 부스트에너지로 가장 높은 능력치가 1.3배가 됩니다. 스피드이면 1.5배입니다.
quickdraw|공격 기술을 쓸 때 30% 확률로 같은 우선도 안에서 먼저 행동합니다.
quickfeet|상태이상이 있으면 스피드가 1.5배가 되며 마비로 인한 스피드 감소를 무시합니다.
rattled|벌레·악·고스트 공격을 받거나 위협을 받으면 스피드가 1랭크 올라갑니다.
reckless|반동 또는 빗나감 반동이 있는 기술의 위력이 1.2배가 됩니다. 몸부림은 제외됩니다.
regenerator|교체하면 최대 HP의 1/3을 회복합니다.
ripen|일부 나무열매를 먹을 때 그 효과가 2배가 됩니다.
rivalry|동성 상대에게 주는 공격 피해는 1.25배, 이성 상대에게는 0.75배가 됩니다.
rkssystem|실버디의 타입이 지닌 메모리에 맞춰 바뀝니다.
rockhead|기술 반동 피해를 받지 않습니다. 몸부림·생명의구슬·빗나감 반동은 예외입니다.
runaway|야생 전투의 도망 판정을 반드시 성공시킵니다. 트레이너전 등 도망이 금지된 전투에는 적용되지 않습니다.
sandforce|모래바람에서 땅·바위·강철 공격의 위력이 1.3배가 되며 모래바람 피해를 받지 않습니다.
sandrush|모래바람에서 스피드가 2배가 되며 모래바람 피해를 받지 않습니다.
sandspit|공격에 맞으면 모래바람을 일으킵니다.
sandveil|모래바람에서 회피율이 1.25배가 되며 모래바람 피해를 받지 않습니다.
sapsipper|풀 기술을 무효화하고 공격을 1랭크 올립니다.
schooling|약어리의 HP가 1/4보다 많으면 군집의 모습, 그 이하이면 단독의 모습으로 바뀝니다.
screencleaner|등장하면 양쪽 필드의 리플렉터·빛의장막·오로라베일을 없앱니다.
seedsower|공격에 맞으면 그래스필드를 펼칩니다.
serenegrace|기술의 추가 효과가 발생할 확률이 2배가 됩니다.
shadowtag|상대가 스스로 교체하지 못하게 합니다. 같은 특성을 지닌 상대는 예외입니다.
sharpness|베기 기술의 위력이 1.5배가 됩니다.
shedskin|매 턴 종료 시 약 1/3 확률로 자신의 상태이상을 치료합니다.
sheerforce|추가 효과가 있는 공격 기술의 위력이 1.3배가 되지만 해당 추가 효과는 발생하지 않습니다.
shielddust|다른 포켓몬의 공격에 붙은 추가 효과를 받지 않습니다.
shieldsdown|메테노가 등장할 때와 턴 종료 시 HP 절반 이하이면 코어 형태, 그보다 많으면 유성 형태로 바뀝니다.
simple|자신에게 적용되는 능력치 랭크 변화량이 2배가 됩니다.
skilllink|연속 공격 기술이 최대 횟수로 명중합니다.
slowstart|등장한 뒤 5턴 동안 공격과 스피드가 절반이 됩니다.
sniper|급소에 맞힌 공격의 피해가 추가로 1.5배가 됩니다.
snowcloak|눈이 내리면 회피율이 1.25배가 됩니다.
solarpower|강한 햇살에서 특수공격이 1.5배가 되지만 매 턴 최대 HP의 1/8을 잃습니다.
soulheart|다른 포켓몬이 쓰러지면 특수공격이 1랭크 올라갑니다.
soundproof|다른 포켓몬이 사용하는 소리 기술을 받지 않습니다.
speedboost|필드에서 한 턴을 마칠 때마다 스피드가 1랭크 올라갑니다.
spicyspray|공격에 맞으면 공격한 상대를 화상 상태로 만듭니다.
stakeout|이번 턴에 교체해 들어온 상대를 공격할 때 공격 능력치가 2배로 계산됩니다.
stall|같은 우선도의 기술을 쓰는 포켓몬 중에서 늦게 행동합니다.
stamina|공격 기술에 맞으면 방어가 1랭크 올라갑니다.
stancechange|킬가르도가 공격 기술을 쓰면 블레이드폼으로, 킹실드를 쓰면 실드폼으로 바뀝니다.
static|접촉 공격을 한 상대를 30% 확률로 마비시킵니다.
steadfast|풀죽으면 스피드가 1랭크 올라갑니다.
steamengine|불꽃·물 공격을 받으면 스피드가 6랭크 올라갑니다.
steelyspirit|자신과 같은 편의 강철 기술 위력이 1.5배가 됩니다.
stench|원래 풀죽음 효과가 없는 공격 기술에 10% 확률의 풀죽음 효과가 붙습니다.
stickyhold|다른 포켓몬의 공격이나 특성으로 지닌 물건을 잃지 않습니다.
strongjaw|물기 계열 기술의 위력이 1.5배가 됩니다. 벌레먹기는 제외됩니다.
sturdy|HP가 가득 찬 상태에서 한 번의 공격에 쓰러지지 않고 HP 1로 버팁니다. 일격필살기도 받지 않습니다.
suctioncups|상대의 기술이나 물건 때문에 강제로 교체되지 않습니다.
superluck|급소에 맞힐 확률의 랭크가 1 올라갑니다.
supersweetsyrup|등장하면 상대의 회피율을 1랭크 내립니다. 한 전투에 한 번 발동합니다.
supremeoverlord|쓰러진 같은 편 한 마리마다 기술 위력이 10%씩 올라갑니다. 최대 5마리까지 계산합니다.
surgesurfer|일렉트릭필드에서 스피드가 2배가 됩니다.
swarm|HP가 최대의 1/3 이하이면 벌레 공격에 사용하는 능력치가 1.5배가 됩니다.
sweetveil|자신과 같은 편이 잠들지 않게 합니다. 이미 잠든 포켓몬을 깨우지는 않습니다.
swiftswim|비가 내리면 스피드가 2배가 됩니다.
symbiosis|같은 편이 물건을 사용하면 자신이 지닌 물건을 즉시 그 포켓몬에게 건넵니다.
synchronize|다른 포켓몬 때문에 화상·독·마비에 걸리면 그 상태이상을 원인을 제공한 상대에게도 옮깁니다.
tangledfeet|혼란 상태이면 회피율이 2배가 됩니다.
technician|위력 60 이하인 기술의 위력이 1.5배가 됩니다. 몸부림에도 적용됩니다.
telepathy|같은 편의 공격으로 피해를 받지 않습니다.
teraformzero|테라파고스가 테라스탈하면 날씨와 필드를 없앱니다. 한 전투에 한 번 발동합니다.
terashell|테라파고스의 HP가 가득 차 있으면 무효인 공격을 제외한 받는 공격의 상성이 0.5배로 계산됩니다.
terashift|테라파고스가 등장하면 테라스탈폼으로 바뀝니다.
thermalexchange|불꽃 공격을 받으면 공격이 1랭크 오르며 화상에 걸리지 않습니다.
thickfat|불꽃·얼음 공격을 받을 때 상대의 공격 능력치를 절반으로 계산합니다.
tintedlens|효과가 별로인 공격으로 주는 피해가 2배가 됩니다.
toughclaws|접촉 기술의 위력이 1.3배가 됩니다.
toxicboost|독에 걸려 있으면 물리 기술의 위력이 1.5배가 됩니다.
toxicchain|공격 기술을 맞히면 30% 확률로 상대를 맹독 상태로 만듭니다.
toxicdebris|물리 공격을 받으면 상대 필드에 독압정을 설치합니다.
trace|등장할 때 또는 복사할 수 있게 되었을 때 인접한 상대의 특성을 무작위로 복사합니다.
transistor|전기 공격에 사용하는 공격 능력치가 1.3배가 됩니다.
triage|회복 기술의 우선도가 3 올라갑니다.
truant|기술을 사용하는 턴과 게으름을 피우는 턴이 번갈아 옵니다.
unaware|피해를 주거나 받을 때 상대의 능력치 랭크 변화를 무시합니다.
unburden|지닌 물건을 잃으면 스피드가 2배가 됩니다. 교체하거나 새 물건·특성을 얻으면 효과가 사라집니다.
unnerve|필드에 있는 동안 상대가 나무열매를 사용하지 못하게 합니다.
unseenfist|접촉 기술이 상대의 방어 기술을 무시합니다. 다이월은 예외입니다.
victorystar|자신과 같은 편의 기술 명중률이 1.1배가 됩니다.
wanderingspirit|접촉 공격을 한 상대와 자신의 특성을 서로 바꿉니다.
waterbubble|물 기술의 위력이 2배가 되며 화상에 걸리지 않고 받는 불꽃 공격을 약화합니다.
watercompaction|물 공격을 받으면 방어가 2랭크 올라갑니다.
waterveil|화상에 걸리지 않습니다. 이미 화상인 상태에서 이 특성을 얻으면 치료됩니다.
weakarmor|물리 공격을 받으면 방어가 1랭크 내려가고 스피드가 2랭크 올라갑니다.
wellbakedbody|불꽃 기술을 무효화하고 방어를 2랭크 올립니다.
windpower|바람 기술을 받거나 순풍이 불기 시작하면 충전 상태가 됩니다.
windrider|바람 기술을 무효화하며, 바람 기술을 받거나 순풍이 불기 시작하면 공격이 1랭크 올라갑니다.
wonderguard|효과가 굉장한 공격과 간접 피해만 받습니다.
wonderskin|자신에게 사용되는 명중 판정이 있는 변화 기술의 명중률을 50%로 만듭니다.
zenmode|불비달마가 턴 종료 시 HP 절반 이하이면 달마모드, 그보다 많으면 노말모드로 바뀝니다.
zerotohero|마이티폼이 아닌 돌핀맨이 교체하면 마이티폼으로 바뀝니다.
mountaineer|등장한 턴에는 바위 공격과 스텔스록의 피해를 피합니다.
rebound|등장한 턴에는 일부 변화 기술을 막고 사용한 상대에게 반사합니다.
persistent|자신이 사용한 중력·회복봉인·신비의부적·순풍·룸 계열 효과의 지속시간이 2턴 늘어납니다.`;
for(const line of lines.split('\n')){const [key,text]=line.split('|');put(key,text);}
ko.ballfetch='필드에 나와 있으면 포획에 실패한 볼을 턴 종료 시 주워 돌려받습니다. 한 포켓몬당 전투마다 한 번 발동합니다.';
ko.honeygather='승리 후 해당 웨이브 기본 금액의 20%에 해당하는 돈을 모읍니다. 살아 있는 파티 포켓몬에게 적용되며 도주·패배 때는 받지 않습니다.';
for(const key of ['blaze','overgrow','torrent'])ko[key]=data.abilities[key];
const missing=Object.keys(data.abilities).filter(key=>!ko[key]);if(missing.length){console.log('Missing translations:',missing.join(','));process.exitCode=1;}else{data.abilities=Object.fromEntries(Object.keys(data.abilities).map(key=>[key,ko[key]]));fs.writeFileSync(path,JSON.stringify(data));console.log('Localized '+Object.keys(data.abilities).length+' ability descriptions.');}
