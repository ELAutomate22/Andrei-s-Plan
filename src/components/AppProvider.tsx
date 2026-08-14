"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createSeedData } from "@/lib/seed";
import { loadData, saveData, validateImport } from "@/lib/persistence";
import type { AppData, DailyLog } from "@/lib/types";
interface AppContextValue { data: AppData; ready: boolean; update:(recipe:(draft:AppData)=>AppData)=>void; updateLog:(id:string,recipe:(log:DailyLog)=>DailyLog)=>void; backup:()=>void; importBackup:(file:File)=>Promise<void>; }
const AppContext=createContext<AppContextValue|null>(null);
export function AppProvider({children}:{children:ReactNode}){const [data,setData]=useState<AppData>(createSeedData);const[ready,setReady]=useState(false);const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>{loadData().then(stored=>{if(stored)setData(stored);setReady(true);}).catch(()=>setReady(true));if("serviceWorker"in navigator)navigator.serviceWorker.register("/sw.js").catch(()=>undefined);},[]);
 const persist=useCallback((next:AppData)=>{if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>saveData(next).catch(()=>undefined),100);},[]);
 const update=useCallback((recipe:(draft:AppData)=>AppData)=>setData(current=>{const next=recipe(current);persist(next);return next;}),[persist]);
 const updateLog=useCallback((id:string,recipe:(log:DailyLog)=>DailyLog)=>update(current=>({...current,dailyLogs:current.dailyLogs.map(log=>log.id===id?recipe(log):log)})),[update]);
 const backup=useCallback(()=>{const payload={...data,settings:{...data.settings,lastBackupAt:new Date().toISOString()}};update(()=>payload);const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}));const anchor=document.createElement("a");anchor.href=url;anchor.download=`locked-in-backup-${new Date().toISOString().slice(0,10)}.json`;anchor.click();URL.revokeObjectURL(url);},[data,update]);
 const importBackup=useCallback(async(file:File)=>{const parsed=validateImport(JSON.parse(await file.text()));setData(parsed);await saveData(parsed);},[]);
 const value=useMemo(()=>({data,ready,update,updateLog,backup,importBackup}),[data,ready,update,updateLog,backup,importBackup]);return <AppContext.Provider value={value}>{children}</AppContext.Provider>;}
export function useApp(){const value=useContext(AppContext);if(!value)throw new Error("useApp must be inside AppProvider");return value;}
