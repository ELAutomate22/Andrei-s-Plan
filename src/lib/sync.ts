import type { AppData, FieldClock, FieldClockMap, SyncEnvelope } from "./types";

const clone=<T>(value:T):T=>structuredClone(value);
const token=(value:string)=>value.replaceAll("~","~0").replaceAll("/","~1");
const pathFor=(parent:string,key:string)=>`${parent}/${token(key)}`;
const isRecord=(value:unknown):value is Record<string,unknown>=>typeof value==="object"&&value!==null&&!Array.isArray(value);
const isIdArray=(value:unknown[]):value is Array<Record<string,unknown>&{id:string}>=>value.every(item=>isRecord(item)&&typeof item.id==="string");

export function compareClocks(a?:FieldClock,b?:FieldClock):number{
 if(!a)return b?-1:0;if(!b)return 1;
 return a.at-b.at||a.sequence-b.sequence||a.deviceId.localeCompare(b.deviceId);
}
function latest(...values:Array<FieldClock|undefined>):FieldClock|undefined{return values.reduce<FieldClock|undefined>((best,item)=>compareClocks(item,best)>0?item:best,undefined)}
function clockUnder(map:FieldClockMap,path:string):FieldClock|undefined{const prefix=`${path}/`;let result=map[path];for(const[key,value]of Object.entries(map))if(key.startsWith(prefix)&&compareClocks(value,result)>0)result=value;return result}
function valueClock(envelope:SyncEnvelope,path:string):FieldClock|undefined{return latest(envelope.clocks[path],envelope.tombstones[path])}
function nextClock(envelope:SyncEnvelope):FieldClock{const previous=Object.values(envelope.clocks).concat(Object.values(envelope.tombstones)).filter(c=>c.deviceId===envelope.deviceId).reduce((max,c)=>Math.max(max,c.sequence),0);return{at:Date.now(),sequence:previous+1,deviceId:envelope.deviceId}}

function flatten(value:unknown,path:string,result:Record<string,unknown>):void{
 if(Array.isArray(value)){
  if(isIdArray(value)){for(const item of value)flatten(item,pathFor(path,item.id),result);return}
  result[path]=value;return;
 }
 if(isRecord(value)){const entries=Object.entries(value);if(!entries.length){result[path]=value;return}for(const[key,item]of entries)flatten(item,pathFor(path,key),result);return}
 result[path]=value;
}
function flattened(data:AppData):Record<string,unknown>{const result:Record<string,unknown>={};flatten(data,"",result);return result}
const equal=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);

export function createEnvelope(data:AppData,deviceId:string,pending=true):SyncEnvelope{
 const clock:FieldClock={at:pending?Date.now():0,sequence:1,deviceId};const clocks:FieldClockMap={};
 for(const path of Object.keys(flattened(data)))clocks[path]=clock;
 return{version:1,data:clone(data),clocks,tombstones:{},revision:0,deviceId,updatedAt:new Date(clock.at).toISOString(),pending};
}

export function recordChanges(envelope:SyncEnvelope,nextData:AppData):SyncEnvelope{
 const before=flattened(envelope.data),after=flattened(nextData),clock=nextClock(envelope);const clocks={...envelope.clocks},tombstones={...envelope.tombstones};let changed=false;
 for(const path of new Set([...Object.keys(before),...Object.keys(after)])){
  if(!(path in after)){tombstones[path]=clock;delete clocks[path];changed=true}
  else if(!(path in before)||!equal(before[path],after[path])){clocks[path]=clock;delete tombstones[path];changed=true}
 }
 if(!changed)return envelope;
 return{...envelope,data:clone(nextData),clocks,tombstones,pending:true,updatedAt:new Date(clock.at).toISOString()};
}

function mergeValue(aValue:unknown,bValue:unknown,path:string,a:SyncEnvelope,b:SyncEnvelope):unknown{
 if(aValue===undefined){return compareClocks(clockUnder(a.tombstones,path),clockUnder(b.clocks,path))>=0?undefined:clone(bValue)}
 if(bValue===undefined){return compareClocks(clockUnder(b.tombstones,path),clockUnder(a.clocks,path))>=0?undefined:clone(aValue)}
 if(Array.isArray(aValue)&&Array.isArray(bValue)&&isIdArray(aValue)&&isIdArray(bValue)){
  const aMap=new Map(aValue.map(item=>[item.id,item])),bMap=new Map(bValue.map(item=>[item.id,item]));const merged:unknown[]=[];
  for(const id of new Set([...aMap.keys(),...bMap.keys()])){const itemPath=pathFor(path,id);const item=mergeValue(aMap.get(id),bMap.get(id),itemPath,a,b);if(item!==undefined)merged.push(item)}
  return merged;
 }
 if(isRecord(aValue)&&isRecord(bValue)){
  const result:Record<string,unknown>={};for(const key of new Set([...Object.keys(aValue),...Object.keys(bValue)])){const item=mergeValue(aValue[key],bValue[key],pathFor(path,key),a,b);if(item!==undefined)result[key]=item}return result;
 }
 return compareClocks(valueClock(a,path),valueClock(b,path))>=0?clone(aValue):clone(bValue);
}

export function mergeEnvelopes(local:SyncEnvelope,remote:SyncEnvelope):SyncEnvelope{
 const data=mergeValue(local.data,remote.data,"",local,remote) as AppData;
 const clocks:{[path:string]:FieldClock}={...remote.clocks};for(const[path,clock]of Object.entries(local.clocks))if(compareClocks(clock,clocks[path])>0)clocks[path]=clock;
 const tombstones:{[path:string]:FieldClock}={...remote.tombstones};for(const[path,clock]of Object.entries(local.tombstones))if(compareClocks(clock,tombstones[path])>0)tombstones[path]=clock;
 for(const[path,clock]of Object.entries(clocks))if(compareClocks(tombstones[path],clock)>=0)delete clocks[path];
 return{version:1,data,clocks,tombstones,revision:Math.max(local.revision,remote.revision),deviceId:local.deviceId,updatedAt:new Date(Math.max(Date.parse(local.updatedAt)||0,Date.parse(remote.updatedAt)||0)).toISOString(),pending:local.pending};
}

export function envelopesEqual(a:SyncEnvelope,b:SyncEnvelope):boolean{return equal(a.data,b.data)&&equal(a.clocks,b.clocks)&&equal(a.tombstones,b.tombstones)}
