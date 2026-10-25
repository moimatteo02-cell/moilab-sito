// Always start from the original imported selling price, never from a derived price.
export function blankPrice(original){
 if(!Number.isFinite(original))return null;
 const cents=Math.round(original*100)-1000;
 return cents>0?Math.round(cents*1.5)/100:null;
}
export function blankMargin(selling,cost){return Math.round((selling-cost)*100)/100;}
