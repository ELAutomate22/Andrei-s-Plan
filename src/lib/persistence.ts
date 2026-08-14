import { z } from "zod";
import type { AppData } from "./types";
const DB="locked-in-db",STORE="app",KEY="primary";
function openDb():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const request=indexedDB.open(DB,1);request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(STORE))request.result.createObjectStore(STORE);};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
export async function loadData():Promise<AppData|null>{const db=await openDb();return new Promise((resolve,reject)=>{const r=db.transaction(STORE,"readonly").objectStore(STORE).get(KEY);r.onsuccess=()=>resolve((r.result as AppData|undefined)??null);r.onerror=()=>reject(r.error);});}
export async function saveData(data:AppData):Promise<void>{const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).put(data,KEY);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});}
export function validateImport(value:unknown):AppData{const schema=z.object({version:z.literal(1),settings:z.object({name:z.string()}).passthrough(),cycles:z.array(z.object({id:z.string()}).passthrough()),dailyLogs:z.array(z.object({id:z.string(),date:z.string()}).passthrough())}).passthrough();return schema.parse(value) as unknown as AppData;}
