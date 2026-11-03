export const hasOwnKey=(object,key)=>typeof key==='string'&&Object.prototype.hasOwnProperty.call(object,key);
