// Mirrors the adventure's server clock without importing the evolution data
// into the client bundle. One in-game hour lasts 50 real seconds.
export function adventureClockTime(now){
 const seconds=Math.floor(now/1000)%1200,hour=Math.floor(seconds/50),day=Math.floor(now/1200000);
 return {hour,period:hour>=6&&hour<18?'day':'night',dusk:hour>=17&&hour<19,fullMoon:day%28===14};
}
export function nextAdventureHourDelay(now){return Math.max(100,50000-(now%50000)+25);}
