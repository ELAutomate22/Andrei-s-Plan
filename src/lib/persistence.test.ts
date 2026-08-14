import { afterEach, describe, expect, it } from "vitest";
import { writeJournal } from "./persistence";
import { createSeedData } from "./seed";
import { createEnvelope, recordChanges } from "./sync";

describe("immediate close-safe journal",()=>{
 const values=new Map<string,string>();
 afterEach(()=>{values.clear();Reflect.deleteProperty(globalThis,"localStorage")});
 it("writes a completed tick synchronously before returning",()=>{Object.defineProperty(globalThis,"localStorage",{configurable:true,value:{getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>values.set(key,value),removeItem:(key:string)=>values.delete(key)}});const seed=createSeedData();const next=recordChanges(createEnvelope(seed,"phone",false),{...seed,dailyLogs:seed.dailyLogs.map((log,index)=>index?log:{...log,completions:{...log.completions,bible:true}})});writeJournal(next);const saved=JSON.parse(values.get("locked-in-sync-journal-v1")!);expect(saved.data.dailyLogs[0].completions.bible).toBe(true);expect(saved.pending).toBe(true)});
});
