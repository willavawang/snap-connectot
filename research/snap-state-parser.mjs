/* Marvel Snap local-state parser. No authentication or network requests.
   Input: JSON parsed from a user-controlled game-state file.
   All outputs are derived from supplied data; no invented balances. */
export function inspectState(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('Expected a JSON object');
  const fields = Object.keys(input);
  const shape = Object.fromEntries(fields.map(k => [k, Array.isArray(input[k]) ? 'array' : input[k] === null ? 'null' : typeof input[k]]));
  return {source:'local game-state JSON', fields:shape};
}
export function inspectCollectionState(input) {
  const result=inspectState(input);
  const keys=Object.keys(input);
  const candidates=keys.filter(k=>/card|variant|collection|deck|booster|split/i.test(k));
  return {...result, candidateFields:candidates};
}
export function inspectShopState(input) {
  const result=inspectState(input);
  const candidates=Object.keys(input).filter(k=>/credit|gold|token|currency|balance|shop/i.test(k));
  return {...result, candidateFields:candidates};
}
