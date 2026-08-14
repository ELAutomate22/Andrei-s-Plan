import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata:Metadata={title:"LOCKED IN",description:"Build the life. Track the proof.",manifest:"/manifest.webmanifest",appleWebApp:{capable:true,statusBarStyle:"black-translucent",title:"LOCKED IN"},icons:{icon:"/icon.svg"}};
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#020503"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><body>{children}</body></html>}
