"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { AuthScreen } from "@/features/auth/AuthScreen";
import { synchronize } from "@/lib/cloud-sync";
import { createSeedData } from "@/lib/seed";
import { clearUserCache, loadEnvelope, saveEnvelope, validateImport, writeJournal } from "@/lib/persistence";
import { recordChanges } from "@/lib/sync";
import { authorizedEmail, supabase } from "@/lib/supabase";
import type { AppData, DailyLog, SyncEnvelope, SyncStatus } from "@/lib/types";

interface AppContextValue{data:AppData;ready:boolean;user:User;syncStatus:SyncStatus;lastSyncedAt?:string;update:(recipe:(draft:AppData)=>AppData)=>void;updateLog:(id:string,recipe:(log:DailyLog)=>DailyLog)=>void;backup:()=>void;importBackup:(file:File)=>Promise<void>;syncNow:()=>Promise<void>;signOut:()=>Promise<void>}
const AppContext=createContext<AppContextValue|null>(null);
export function AppProvider({children}:{children:ReactNode}){
 const[data,setData]=useState<AppData>(createSeedData),[ready,setReady]=useState(false),[authReady,setAuthReady]=useState(false),[user,setUser]=useState<User|null>(null),[syncStatus,setSyncStatus]=useState<SyncStatus>("saving-local"),[lastSyncedAt,setLastSyncedAt]=useState<string>(),[recovery,setRecovery]=useState(false);
 const envelopeRef=useRef<SyncEnvelope|null>(null),userRef=useRef<User|null>(null),syncTimer=useRef<ReturnType<typeof setTimeout>|null>(null),syncing=useRef<Promise<void>|null>(null);
 const syncNow=useCallback(async()=>{if(syncing.current)return syncing.current;const client=supabase,currentUser=userRef.current,local=envelopeRef.current;if(!client||!currentUser||!local)return;if(!navigator.onLine){setSyncStatus("offline");return}const job=(async()=>{setSyncStatus("syncing");try{const result=await synchronize(client,currentUser.id,envelopeRef.current??local);envelopeRef.current=result;setData(result.data);writeJournal(result);await saveEnvelope(result);setLastSyncedAt(result.updatedAt);setSyncStatus("synced")}catch{setSyncStatus(navigator.onLine?"error":"offline")}finally{syncing.current=null}})();syncing.current=job;return job},[]);
 const scheduleSync=useCallback(()=>{if(syncTimer.current)clearTimeout(syncTimer.current);syncTimer.current=setTimeout(()=>void syncNow(),450)},[syncNow]);
 useEffect(()=>{let active=true;loadEnvelope(createSeedData()).then(envelope=>{if(!active)return;envelopeRef.current=envelope;setData(envelope.data);setSyncStatus(envelope.pending?(navigator.onLine?"syncing":"offline"):"synced");setReady(true)}).catch(()=>{if(active){setSyncStatus("error");setReady(true)}});return()=>{active=false}},[]);
 useEffect(()=>{if(!supabase){setAuthReady(true);return}supabase.auth.getSession().then(({data:sessionData})=>{const next=sessionData.session?.user??null;if(next&&next.email?.toLowerCase()!==authorizedEmail){void supabase?.auth.signOut();userRef.current=null;setUser(null)}else{userRef.current=next;setUser(next)}setAuthReady(true)});const{data:listener}=supabase.auth.onAuthStateChange((event,session)=>{const next=session?.user??null;if(next&&next.email?.toLowerCase()!==authorizedEmail){void supabase?.auth.signOut();return}if(event==="PASSWORD_RECOVERY")setRecovery(true);userRef.current=next;setUser(next);setAuthReady(true)});return()=>listener.subscription.unsubscribe()},[]);
 useEffect(()=>{if(user&&ready)void syncNow()},[user,ready,syncNow]);
 useEffect(()=>{if(!user||!supabase)return;const channel=supabase.channel(`user-state-${user.id}`).on("postgres_changes",{event:"*",schema:"public",table:"user_state",filter:`user_id=eq.${user.id}`},()=>scheduleSync()).subscribe();const online=()=>void syncNow();const visible=()=>{if(document.visibilityState==="visible")void syncNow()};window.addEventListener("online",online);window.addEventListener("focus",online);document.addEventListener("visibilitychange",visible);return()=>{window.removeEventListener("online",online);window.removeEventListener("focus",online);document.removeEventListener("visibilitychange",visible);void supabase?.removeChannel(channel)}},[user,scheduleSync,syncNow]);
 useEffect(()=>()=>{if(syncTimer.current)clearTimeout(syncTimer.current)},[]);
 const update=useCallback((recipe:(draft:AppData)=>AppData)=>{const current=envelopeRef.current;if(!current)return;const next=recordChanges(current,recipe(current.data));if(next===current)return;envelopeRef.current=next;setData(next.data);setSyncStatus("saving-local");try{writeJournal(next);setSyncStatus(navigator.onLine?"syncing":"offline");void saveEnvelope(next).catch(()=>setSyncStatus("error"));scheduleSync()}catch{setSyncStatus("error")}},[scheduleSync]);
 const updateLog=useCallback((id:string,recipe:(log:DailyLog)=>DailyLog)=>update(current=>({...current,dailyLogs:current.dailyLogs.map(log=>log.id===id?recipe(log):log)})),[update]);
 const backup=useCallback(()=>{const payload={...data,settings:{...data.settings,lastBackupAt:new Date().toISOString()}};update(()=>payload);const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}));const anchor=document.createElement("a");anchor.href=url;anchor.download=`locked-in-backup-${new Date().toISOString().slice(0,10)}.json`;anchor.click();URL.revokeObjectURL(url)},[data,update]);
 const importBackup=useCallback(async(file:File)=>{const parsed=validateImport(JSON.parse(await file.text()));update(()=>parsed);await syncNow()},[update,syncNow]);
 const signOut=useCallback(async()=>{await syncNow();await supabase?.auth.signOut();userRef.current=null;setUser(null);clearUserCache()},[syncNow]);
 const value=useMemo(()=>user?{data,ready,user,syncStatus,lastSyncedAt,update,updateLog,backup,importBackup,syncNow,signOut}:null,[data,ready,user,syncStatus,lastSyncedAt,update,updateLog,backup,importBackup,syncNow,signOut]);
 if(!ready||!authReady)return <div className="boot"><span>LI</span><b>RESTORING YOUR PROGRESS</b><i/></div>;
 if(!user||recovery)return <AuthScreen recovery={recovery} onRecoveryComplete={()=>setRecovery(false)}/>;
 return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export function useApp(){const value=useContext(AppContext);if(!value)throw new Error("useApp must be inside AppProvider");return value}
