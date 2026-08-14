"use client";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Cloud, KeyRound, LockKeyhole, Mail } from "lucide-react";
import { authorizedEmail, cloudConfigured, supabase } from "@/lib/supabase";

type Mode="signin"|"signup"|"forgot"|"recovery";
export function AuthScreen({recovery=false,onRecoveryComplete}:{recovery?:boolean;onRecoveryComplete:()=>void}){
 const[mode,setMode]=useState<Mode>(recovery?"recovery":"signin"),[password,setPassword]=useState(""),[confirm,setConfirm]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState(""),[error,setError]=useState("");
 const submit=async(event:FormEvent)=>{event.preventDefault();if(!supabase)return;setBusy(true);setError("");setMessage("");try{
  if(mode==="signin"){const{error:e}=await supabase.auth.signInWithPassword({email:authorizedEmail,password});if(e)throw e}
  if(mode==="signup"){if(password.length<12)throw new Error("Use at least 12 characters.");if(password!==confirm)throw new Error("Passwords do not match.");const{error:e}=await supabase.auth.signUp({email:authorizedEmail,password,options:{emailRedirectTo:window.location.origin}});if(e)throw e;setMessage("Check your Yahoo inbox to confirm the private account, then sign in.")}
  if(mode==="forgot"){const{error:e}=await supabase.auth.resetPasswordForEmail(authorizedEmail,{redirectTo:window.location.origin});if(e)throw e;setMessage("Password reset instructions were sent to your Yahoo inbox.")}
  if(mode==="recovery"){if(password.length<12)throw new Error("Use at least 12 characters.");if(password!==confirm)throw new Error("Passwords do not match.");const{error:e}=await supabase.auth.updateUser({password});if(e)throw e;setMessage("Password updated.");onRecoveryComplete()}
 }catch(value){setError(value instanceof Error?value.message:"Authentication failed.")}finally{setBusy(false)}};
 if(!cloudConfigured)return <div className="auth-screen"><div className="auth-grid"/><section className="auth-card"><span className="auth-mark">LI</span><span className="eyebrow">CLOUD SETUP REQUIRED</span><h1>SYNC IS<br/><i>NOT CONNECTED.</i></h1><p>Add the Supabase project URL and publishable key to the build environment before signing in.</p></section></div>;
 return <div className="auth-screen"><div className="auth-grid"/><section className="auth-card"><span className="auth-mark">LI</span><span className="eyebrow"><Cloud size={14}/> PRIVATE CROSS-DEVICE SYNC</span><h1>{mode==="recovery"?<>SET A NEW<br/><i>PASSWORD.</i></>:<>YOUR PROGRESS.<br/><i>LOCKED IN.</i></>}</h1><p>{mode==="signup"?"Create the one authorized account for this operating system.":mode==="forgot"?"We will send a secure recovery link to your approved inbox.":mode==="recovery"?"Choose a strong password for your private account.":"Sign in to load the same progress on this device."}</p><form onSubmit={submit}>
  {mode!=="recovery"&&<label><Mail/>Authorized email<input value={authorizedEmail} readOnly type="email"/></label>}
  {mode!=="forgot"&&<label><LockKeyhole/>Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" autoComplete={mode==="signin"?"current-password":"new-password"} minLength={12} required/></label>}
  {(mode==="signup"||mode==="recovery")&&<label><KeyRound/>Confirm password<input value={confirm} onChange={e=>setConfirm(e.target.value)} type="password" autoComplete="new-password" minLength={12} required/></label>}
  {error&&<div className="auth-error" role="alert">{error}</div>}{message&&<div className="auth-success" role="status">{message}</div>}
  <button className="button" disabled={busy}>{busy?"Please wait…":mode==="signin"?"Sign in":mode==="signup"?"Create private account":mode==="forgot"?"Send reset link":"Update password"}</button>
 </form>{mode==="signin"?<div className="auth-links"><button onClick={()=>setMode("signup")}>Create account</button><button onClick={()=>setMode("forgot")}>Forgot password?</button></div>:mode!=="recovery"&&<button className="auth-back" onClick={()=>setMode("signin")}><ArrowLeft/>Back to sign in</button>}<small>Offline changes are preserved on this device and merged after sign-in.</small></section></div>;
}
