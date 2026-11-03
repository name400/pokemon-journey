'use client';

import { useState, useSyncExternalStore } from 'react';
import appearanceData from '@/data/pokemon-appearance.json';

type ImagePokemon = {
  id: number | string;
  sourceImage?:string|null;
  rogueFormKey?:string|null;
  sourceBackImage?:string|null;
  sourceStaticImage?:string|null;
  sourceShinyImage?:string|null;
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
  if (!mon||mon.sourceAppearanceMissing||mon.rogueFormKey?.endsWith('-starmobile')) return 0;
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

export default function PokemonImage({ mon, className = '', alt, eager = false, variant = 'art', facing = 'front', frozen = false }: {
  mon: ImagePokemon | null | undefined;
  className?: string;
  alt?: string;
  eager?: boolean;
  variant?: ImageVariant;
  facing?: ImageFacing;
  frozen?: boolean;
}) {
  const id = pokemonArtId(mon);
  const shiny = !!mon?.shiny;
  const reducedMotion = useSyncExternalStore(
    variant === 'battle' ? subscribeMotion : noSubscription,
    variant === 'battle' ? reducedSnapshot : staticSnapshot,
    staticSnapshot,
  );
  const staticImage = reducedMotion || frozen;
  const direct=mon?.sourceAppearanceMissing?null:staticImage&&mon?.sourceStaticImage?mon.sourceStaticImage:facing==='back'?mon?.sourceBackImage||mon?.sourceImage:shiny?mon?.sourceShinyImage||mon?.sourceImage:mon?.sourceImage;
  const resourceKey = `${direct||''}:${id}:${shiny}:${variant}:${facing}:${staticImage}`;
  const [failed, setFailed] = useState({ key: '', index: 0 });
  // A form, transformation, shiny toggle, or variant change immediately starts its own
  // fallback chain. No effect/extra render is needed to reset an old image's error state.
  const fallback = failed.key === resourceKey ? failed.index : 0;
  const sources = [...(direct?[direct]:[]),...pokemonImageSources(id, shiny, variant, facing, staticImage)];

  return <img
    key={resourceKey}
    width="128"
    height="128"
    loading={eager ? 'eager' : 'lazy'}
    fetchPriority={eager ? 'high' : 'auto'}
    decoding="async"
    className={className}
    src={sources[Math.min(fallback, sources.length - 1)]}
    alt={alt ?? `${mon?.name || '포켓몬'}${shiny ? ' · 색이 다른 모습' : ''}`}
    onError={() => {
      if (fallback >= sources.length - 1) return;
      setFailed(previous => ({
        key: resourceKey,
        index: Math.min(sources.length - 1, previous.key === resourceKey ? previous.index + 1 : 1),
      }));
    }}
  />;
}
