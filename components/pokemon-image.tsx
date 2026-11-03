'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import appearanceData from '@/data/pokemon-appearance.json';

type ImagePokemon = {
  id: number | string;
  sourceImage?:string|null;
  sourceBackImage?:string|null;
  sourceShinyImage?:string|null;
  sourceShinyBackImage?:string|null;
  rogueSourceId?:number;
  sourceAppearanceMissing?:boolean;
  artId?: number | string;
  battleAppearance?: string | null;
  battleArtId?: number | string | null;
  name?: string;
  shiny?: boolean;
};
type AppearanceData = {
  artById: Record<string, number>;
  artByBattleKey: Record<string, number>;
};
const appearances: AppearanceData = appearanceData;
const spriteRoot = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
type ImageVariant = 'art' | 'sprite' | 'battle';
type ImageFacing = 'front' | 'back';
type SpriteFit = {scale:number; x:number; y:number};
const spriteFitCache = new Map<string, Promise<SpriteFit | null>>();
function spriteFit(src:string):Promise<SpriteFit | null>{
  // Animated frames can have different bounds; keep their original canvas intact.
  if (/\.gif(?:[?#]|$)/i.test(src)) return Promise.resolve(null);
  const cached=spriteFitCache.get(src);if(cached)return cached;
  const task=new Promise<SpriteFit|null>(resolve=>{
    const image=new Image();image.crossOrigin='anonymous';
    image.onerror=()=>resolve(null);
    image.onload=()=>{try{
      const canvas=document.createElement('canvas'),size=96;canvas.width=size;canvas.height=size;
      const context=canvas.getContext('2d',{willReadFrequently:true});if(!context){resolve(null);return;}
      context.drawImage(image,0,0,size,size);const pixels=context.getImageData(0,0,size,size).data;
      let left=size,top=size,right=-1,bottom=-1;
      for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(pixels[(y*size+x)*4+3]>24){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
      if(right<left||bottom<top){resolve(null);return;}
      const scale=Math.max(1,Math.min(1.8,size*.82/Math.max(right-left+1,bottom-top+1)));
      resolve({scale,x:((size-1)/2-(left+right)/2)/size*100,y:((size-1)/2-(top+bottom)/2)/size*100});
    }catch{resolve(null);}};
    image.src=src;
  });
  spriteFitCache.set(src,task);return task;
}
let motionQuery: MediaQueryList | null = null;
function reducedMotionQuery() {
  if (typeof window === 'undefined' || !window.matchMedia) return null;
  return motionQuery ||= window.matchMedia('(prefers-reduced-motion: reduce)');
}
function subscribeMotion(onChange: () => void) {
  const query = reducedMotionQuery();
  query?.addEventListener('change', onChange);
  return () => query?.removeEventListener('change', onChange);
}
const noSubscription = () => () => {};
const reducedSnapshot = () => reducedMotionQuery()?.matches ?? true;
const staticSnapshot = () => true;

export function pokemonArtId(mon: ImagePokemon | null | undefined): number | string {
  if (!mon||mon.sourceAppearanceMissing) return 0;
  if (mon.battleAppearance) return mon.battleArtId || appearances.artByBattleKey[mon.battleAppearance] || 0;
  return appearances.artById[mon.id] || mon.artId || mon.id;
}

export function pokemonImageSources(id: number | string, shiny: boolean, variant: ImageVariant, facing: ImageFacing, reducedMotion: boolean): string[] {
  if (!id) return ['/pokemon-placeholder.svg'];
  const color = shiny ? 'shiny/' : '';
  const direction = facing === 'back' ? 'back/' : '';
  const front = `${spriteRoot}/${color}${id}.png`;
  const facingSprite = `${spriteRoot}/${direction}${color}${id}.png`;
  const sources = variant === 'battle'
    ? [
      ...(!reducedMotion ? [`${spriteRoot}/other/showdown/${direction}${color}${id}.gif`] : []),
      facingSprite, front, `${spriteRoot}/other/official-artwork/${color}${id}.png`, '/pokemon-placeholder.svg',
    ]
    : variant === 'sprite'
      ? [facingSprite, front, '/pokemon-placeholder.svg']
      : [`${spriteRoot}/other/official-artwork/${color}${id}.png`, front, '/pokemon-placeholder.svg'];
  return [...new Set(sources)];
}

export default function PokemonImage({ mon, className = '', alt, eager = false, variant = 'art', facing = 'front', frozen = false, normalizeSprite = false }: {
  mon: ImagePokemon | null | undefined;
  className?: string;
  alt?: string;
  eager?: boolean;
  variant?: ImageVariant;
  facing?: ImageFacing;
  frozen?: boolean;
  normalizeSprite?: boolean;
}) {
  const id = pokemonArtId(mon);
  const shiny = !!mon?.shiny;
  const reducedMotion = useSyncExternalStore(
    variant === 'battle' ? subscribeMotion : noSubscription,
    variant === 'battle' ? reducedSnapshot : staticSnapshot,
    staticSnapshot,
  );
  const staticImage = reducedMotion || frozen;
  const direct=mon?.sourceAppearanceMissing?null:shiny&&mon?.rogueSourceId!=null?(facing==='back'?mon.sourceShinyBackImage:mon.sourceShinyImage):facing==='back'?mon?.sourceBackImage||mon?.sourceImage:shiny?mon?.sourceShinyImage||mon?.sourceImage:mon?.sourceImage;
  const resourceKey = `${direct||''}:${id}:${shiny}:${variant}:${facing}:${staticImage}`;
  const [failed, setFailed] = useState({ key: '', index: 0 });
  const [fit, setFit] = useState<{src:string; value:SpriteFit | null}>({src:'',value:null});
  const imageRef = useRef<HTMLImageElement>(null);
  // A form, transformation, shiny toggle, or variant change immediately starts its own
  // fallback chain. No effect/extra render is needed to reset an old image's error state.
  const fallback = failed.key === resourceKey ? failed.index : 0;
  const sources = [...(direct?[direct]:[]),...pokemonImageSources(id, shiny, variant, facing, staticImage)];
  const currentSource = sources[Math.min(fallback, sources.length - 1)];
  useEffect(()=>{if(!normalizeSprite||!imageRef.current?.complete)return;let active=true;void spriteFit(currentSource).then(value=>{if(active&&value)setFit(previous=>previous.src===currentSource?previous:{src:currentSource,value});});return()=>{active=false;};},[normalizeSprite,currentSource]);

  return <img
    key={resourceKey}
    ref={imageRef}
    width="128"
    height="128"
    loading={eager ? 'eager' : 'lazy'}
    fetchPriority={eager ? 'high' : 'auto'}
    decoding="async"
    className={className}
    src={currentSource}
    style={normalizeSprite&&fit.src===currentSource&&fit.value?{transform:`scale(${fit.value.scale}) translate(${fit.value.x}%, ${fit.value.y}%)`}:undefined}
    alt={alt ?? `${mon?.name || '포켓몬'}${shiny ? ' · 색이 다른 모습' : ''}`}
    onLoad={event=>{if(!normalizeSprite)return;const element=event.currentTarget,src=element.getAttribute('src')||'';void spriteFit(src).then(value=>{if(value&&element.isConnected&&element.getAttribute('src')===src)setFit(previous=>previous.src===src?previous:{src,value});});}}
    onError={() => {
      if (fallback >= sources.length - 1) return;
      setFailed(previous => ({
        key: resourceKey,
        index: Math.min(sources.length - 1, previous.key === resourceKey ? previous.index + 1 : 1),
      }));
    }}
  />;
}
