import {shopItems} from './shop-catalog.mjs';
import {adventureItemPrice} from './adventure-economy.mjs';

// Clone instead of changing the shared catalog used by the other game.
export const adventureShopItems=shopItems.map(item=>({...item,price:adventureItemPrice(item)}));
