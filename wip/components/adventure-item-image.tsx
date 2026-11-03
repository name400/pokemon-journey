'use client';
import {useState} from 'react';
import itemSprites from '@/data/adventure-item-sprites.json';
import {ADVENTURE_GOODS} from '@/lib/adventure-economy.mjs';

const goodsSprites=Object.fromEntries(ADVENTURE_GOODS.map(item=>[item.id,item.sprite]));
export default function AdventureItemImage({id,className=''}:{id:string;className?:string}){
 const [failed,setFailed]=useState(''),slug=goodsSprites[id]||(itemSprites as Record<string,string>)[id];
 const source=slug&&failed!==id?`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${slug}.png`:'/game/items/item-fallback.svg';
 return <img className={className} src={source} alt="" loading="lazy" decoding="async" onError={()=>setFailed(id)}/>;
}
