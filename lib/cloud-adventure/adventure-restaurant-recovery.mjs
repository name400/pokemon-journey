// Only known course snapshots can be cancelled from missing-party recovery.
// Unknown or contradictory saved formats must not be silently discarded.
const courses=[
 {field:'zaLeNahRun',district:'lumiose-vert-sector6',interior:'leNah',count:3,flags:[]},
 {field:'zaLeYeahRun',district:'lumiose-rouge-sector3',interior:'leYeah',count:5,flags:['tripleV1']},
 {field:'zaLeWowRun',district:'lumiose-rouge-sector2',interior:'leWow',count:10,flags:[]},
 {field:'zaSushiRun',district:'lumiose-rouge-north',interior:'sushi',count:5,flags:['tripleV2','multiV1']},
];
export function missingPartyRestaurantCourse(world){
 const active=courses.filter(c=>world?.[c.field]!==undefined&&world?.[c.field]!==null&&world?.[c.field]!==false);
 if(!active.length)return null;
 if(active.length!==1)return {kind:'unknown'};
 const c=active[0],v=world[c.field],allowed=['course','repeat',...c.flags];
 if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).some(k=>!allowed.includes(k))||!Number.isInteger(v.course)||v.course<0||v.course>=c.count||typeof v.repeat!=='boolean'||c.flags.some(k=>v[k]!==undefined&&typeof v[k]!=='boolean')||world.area!==3||world.district!==c.district||world.interior!==c.interior)return {kind:'unknown'};
 return {kind:'ready',field:c.field};
}
