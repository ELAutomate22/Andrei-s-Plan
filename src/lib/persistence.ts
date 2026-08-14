import { z } from "zod";
import { createEnvelope, mergeEnvelopes } from "./sync";
import type { AppData, SyncEnvelope } from "./types";
const DB="locked-in-db",STORE="app",KEY="primary",SYNC_KEY="sync-primary",JOURNAL="locked-in-sync-journal-v1",DEVICE="locked-in-device-id";
function openDb():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const request=indexedDB.open(DB,1);request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(STORE))request.result.createObjectStore(STORE);};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
export async function loadData():Promise<AppData|null>{const db=await openDb();return new Promise((resolve,reject)=>{const r=db.transaction(STORE,"readonly").objectStore(STORE).get(KEY);r.onsuccess=()=>resolve((r.result as AppData|undefined)??null);r.onerror=()=>reject(r.error);});}
export async function saveData(data:AppData):Promise<void>{const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).put(data,KEY);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});}
export function validateImport(value:unknown):AppData{const schema=z.object({version:z.literal(1),settings:z.object({name:z.string()}).passthrough(),cycles:z.array(z.object({id:z.string()}).passthrough()),dailyLogs:z.array(z.object({id:z.string(),date:z.string()}).passthrough())}).passthrough();return schema.parse(value) as unknown as AppData;}

function readStore<T>(key:string):Promise<T|null>{return openDb().then(db=>new Promise((resolve,reject)=>{const r=db.transaction(STORE,"readonly").objectStore(STORE).get(key);r.onsuccess=()=>resolve((r.result as T|undefined)??null);r.onerror=()=>reject(r.error)}))}
function writeStore<T>(key:string,value:T):Promise<void>{return openDb().then(db=>new Promise((resolve,reject)=>{const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).put(value,key);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)}))}
export function getDeviceId():string{const existing=localStorage.getItem(DEVICE);if(existing)return existing;const id=crypto.randomUUID();localStorage.setItem(DEVICE,id);return id}
function validEnvelope(value:unknown):value is SyncEnvelope{if(!value||typeof value!=="object")return false;const item=value as Partial<SyncEnvelope>;try{validateImport(item.data);return item.version===1&&typeof item.deviceId==="string"&&typeof item.revision==="number"&&typeof item.updatedAt==="string"&&!!item.clocks&&!!item.tombstones}catch{return false}}
export function writeJournal(envelope:SyncEnvelope):void{localStorage.setItem(JOURNAL,JSON.stringify(envelope))}
export function clearUserCache():void{localStorage.removeItem(JOURNAL)}
export async function saveEnvelope(envelope:SyncEnvelope):Promise<void>{writeJournal(envelope);await writeStore(SYNC_KEY,envelope)}
export async function loadEnvelope(seed:AppData):Promise<SyncEnvelope>{
 const deviceId=getDeviceId();let journal:SyncEnvelope|null=null;
 try{const raw=localStorage.getItem(JOURNAL);const parsed=raw?JSON.parse(raw):null;if(validEnvelope(parsed))journal={...parsed,deviceId}}catch{localStorage.removeItem(JOURNAL)}
 const stored=await readStore<SyncEnvelope>(SYNC_KEY).catch(()=>null);const normalized=validEnvelope(stored)?{...stored,deviceId}:null;
 if(journal&&normalized)return mergeEnvelopes(journal,normalized);
 if(journal)return journal;if(normalized)return normalized;
 const legacy=await loadData().catch(()=>null);return createEnvelope(legacy??seed,deviceId,!!legacy);
}
