import type { SupabaseClient } from "@supabase/supabase-js";
import { envelopesEqual, mergeEnvelopes } from "./sync";
import { validateImport } from "./persistence";
import type { FieldClockMap, SyncEnvelope } from "./types";

interface CloudRow{payload:unknown;clocks:FieldClockMap;tombstones:FieldClockMap;revision:number;updated_at:string}
function remoteEnvelope(row:CloudRow,deviceId:string):SyncEnvelope{return{version:1,data:validateImport(row.payload),clocks:row.clocks??{},tombstones:row.tombstones??{},revision:row.revision,deviceId,updatedAt:row.updated_at,pending:false}}
const rowValues=(userId:string,envelope:SyncEnvelope,revision:number)=>({user_id:userId,payload:envelope.data,clocks:envelope.clocks,tombstones:envelope.tombstones,revision});

export async function synchronize(client:SupabaseClient,userId:string,initial:SyncEnvelope):Promise<SyncEnvelope>{
 let local=initial;
 for(let attempt=0;attempt<4;attempt++){
  const{data,error}=await client.from("user_state").select("payload,clocks,tombstones,revision,updated_at").eq("user_id",userId).maybeSingle();
  if(error)throw error;
  if(!data){
   const revision=1;const{data:created,error:createError}=await client.from("user_state").insert(rowValues(userId,local,revision)).select("payload,clocks,tombstones,revision,updated_at").single();
   if(createError){if(createError.code==="23505")continue;throw createError}
   return{...remoteEnvelope(created as CloudRow,local.deviceId),pending:false};
  }
  const remote=remoteEnvelope(data as CloudRow,local.deviceId);const merged=mergeEnvelopes(local,remote);
  if(envelopesEqual(merged,remote)&&!local.pending)return{...merged,revision:remote.revision,pending:false,updatedAt:remote.updatedAt};
  const nextRevision=remote.revision+1;
  const{data:updated,error:updateError}=await client.from("user_state").update(rowValues(userId,merged,nextRevision)).eq("user_id",userId).eq("revision",remote.revision).select("payload,clocks,tombstones,revision,updated_at").maybeSingle();
  if(updateError)throw updateError;if(!updated){local=merged;continue}
  return{...remoteEnvelope(updated as CloudRow,local.deviceId),pending:false};
 }
 throw new Error("Cloud data changed repeatedly. Please retry sync.");
}
