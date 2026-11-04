'use client';
import {Fragment} from 'react';
const labels:Record<string,string>={hp:'HP',atk:'공격',def:'방어',spa:'특공',spd:'특방',spe:'스피드'};
type Reading={boxId:string;name:string;stats:{stat:string;value:number;improved:boolean;perfect:boolean}[]};
export default function RogueIvScanner({readings}:{readings?:Reading[]}){
 if(!readings?.length)return null;
 return <details className="bs-iv-scanner" open><summary>야생 포켓몬 IV 스캐너</summary>{readings.map(mon=><p key={mon.boxId}><b>{mon.name}</b> · {mon.stats.map((stat,index)=><Fragment key={stat.stat}>{index>0?' · ':''}<span className={stat.perfect?'is-perfect':stat.improved?'is-improved':undefined}>{labels[stat.stat]} {stat.value}{stat.perfect?' ★':stat.improved?' ↑':''}</span></Fragment>)}</p>)}</details>;
}
