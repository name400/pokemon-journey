'use client';

import {useEffect, useRef, useState, type ComponentProps} from 'react';
import {Shield, Sparkles} from 'lucide-react';
import PokemonImage from './pokemon-image';

export type BossAnnouncementMon = NonNullable<ComponentProps<typeof PokemonImage>['mon']> & {
  boxId?: string;
  level?: number;
  formId?: number | string;
  formKey?: string;
  rogueFormIndex?: number;
  battleSprite?: string;
  rogueBossSegments?: number;
  rogueBossSegmentIndex?: number;
};
export type BossAnnouncementProps = {
  boss: BossAnnouncementMon | null | undefined;
  encounterKey: string;
  reducedMotion?: boolean;
};

export const BOSS_ANNOUNCEMENT_DURATION = 1750;
/** HP, level, shields and turn/revision are intentionally absent from this key. */
export function bossAnnouncementIdentity(boss: BossAnnouncementMon | null | undefined, encounterKey: string): string {
  if(!boss)return '';
  const encounter = boss.boxId || encounterKey;
  if(!encounter)return '';
  const form = boss.battleAppearance ?? boss.battleSprite ?? boss.formKey ?? boss.formId ?? boss.rogueFormIndex ?? boss.artId ?? boss.id;
  return JSON.stringify([String(encounter),String(boss.id),String(form)]);
}
export function bossAnnouncementShields(boss: BossAnnouncementMon): number | null {
  if(Number.isFinite(boss.rogueBossSegmentIndex))return Math.max(0,Math.floor(boss.rogueBossSegmentIndex!));
  if(Number.isFinite(boss.rogueBossSegments))return Math.max(0,Math.floor(boss.rogueBossSegments!) - 1);
  return null;
}
/** Client-session deduplication also survives a parent unmount/remount. */
export class BossAnnouncementLedger {
  private seen = new Set<string>();
  has(identity: string) {return this.seen.has(identity);}
  claim(identity: string) {
    if(!identity || this.seen.has(identity))return false;
    this.seen.add(identity);
    if(this.seen.size > 512)this.seen.delete(this.seen.values().next().value!);
    return true;
  }
}
const announcements = new BossAnnouncementLedger();

export default function BossAnnouncement({boss,encounterKey,reducedMotion=false}: BossAnnouncementProps) {
  const identity = bossAnnouncementIdentity(boss,encounterKey);
  if(!boss || !boss.name || !identity)return null;
  return <BossEntry key={identity} boss={boss} identity={identity} reducedMotion={reducedMotion}/>;
}

function BossEntry({boss,identity,reducedMotion}: {boss: BossAnnouncementMon; identity: string; reducedMotion: boolean}) {
  const [visible,setVisible] = useState(() => !announcements.has(identity));
  const eligible = useRef(visible);
  const startTime = useRef<number | null>(null);
  useEffect(() => {
    if(!eligible.current)return;
    const firstPass = startTime.current === null;
    if(firstPass && !announcements.claim(identity)) {
      const duplicateTimer = setTimeout(() => setVisible(false),0);
      return () => clearTimeout(duplicateTimer);
    }
    // StrictMode's effect replay resumes the same deadline instead of restarting it.
    startTime.current ??= Date.now();
    const remaining = Math.max(0,startTime.current + BOSS_ANNOUNCEMENT_DURATION - Date.now());
    const timer = setTimeout(() => setVisible(false),remaining);
    return () => clearTimeout(timer);
  }, [identity]);
  if(!visible)return null;
  const shields = bossAnnouncementShields(boss);
  return <aside className="bs-boss-announcement" data-reduced-motion={reducedMotion || undefined} data-boss-identity={identity} role="status" aria-live="polite" aria-atomic="true" style={{pointerEvents:'none'}}>
    <span className="bs-boss-intro-portrait" aria-hidden="true"><PokemonImage mon={boss} variant="sprite" facing="front" eager alt=""/></span>
    <span className="bs-boss-intro-copy"><span className="bs-boss-intro-eyebrow"><Sparkles size={11} aria-hidden="true"/>보스 등장</span><strong>{boss.name}</strong><span className="bs-boss-intro-meta">{Number.isFinite(boss.level) && <span>Lv.{boss.level}</span>}{shields !== null && <span><Shield size={12} aria-hidden="true"/>실드 {shields}개</span>}</span></span>
    <span className="bs-boss-intro-rule" aria-hidden="true"/>
  </aside>;
}
