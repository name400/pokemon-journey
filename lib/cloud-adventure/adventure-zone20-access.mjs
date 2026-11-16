// Keep existing mission 42 restrictions and legacy mission 38 unlocks intact.
export function zone20GeneralAccess(s){return !!(s?.zaMission38Complete||s?.zaMission37Complete===true)&&!(s?.zaMission42Stage>=1&&!s?.zaMission42Complete);}
export function zone20DirectionalAccess(s){return zone20GeneralAccess(s)||[1,3,4].includes(s?.zaMission42Stage);}
