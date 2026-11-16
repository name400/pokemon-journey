'use client';
import {useEffect,useRef} from 'react';
import './adventure-battle-popup.css';

// A battle is resolved through the battle controls; the backdrop and Escape
// must not silently dismiss a live or unacknowledged battle.
export default function AdventureBattlePopup({children}:{children:React.ReactNode}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const dialog=ref.current;if(dialog&&!dialog.open)dialog.showModal();return()=>{if(dialog?.open)dialog.close();};},[]);
 return <dialog ref={ref} className="adv-battle-popup" aria-label="포켓몬 배틀" onCancel={event=>event.preventDefault()}>{children}</dialog>;
}
