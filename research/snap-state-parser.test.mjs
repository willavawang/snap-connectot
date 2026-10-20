import assert from 'node:assert/strict';
import {inspectState,inspectCollectionState,inspectShopState} from './snap-state-parser.mjs';
assert.deepEqual(inspectState({cards:[],n:2}).fields,{cards:'array',n:'number'});
assert.deepEqual(inspectCollectionState({Collection:[],Cards:{},unrelated:1}).candidateFields,['Collection','Cards']);
assert.deepEqual(inspectShopState({Credits:500,Gold:100,secret:'redacted'}).candidateFields,['Credits','Gold']);
assert.throws(()=>inspectState(null),TypeError);
assert.throws(()=>inspectState([]),TypeError);
console.log('4 parser tests passed');
