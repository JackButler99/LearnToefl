import {NextResponse,type NextRequest} from "next/server";
import {isPortfolioDemo} from "./lib/demo-mode";

export function middleware(request:NextRequest){
 if(!isPortfolioDemo())return NextResponse.next();
 const path=request.nextUrl.pathname;
 if(path==="/api"||path.startsWith("/api/"))return NextResponse.json({error:"Deployment ini hanya menyediakan demo portfolio. API aplikasi tidak diaktifkan."},{status:403,headers:{"Cache-Control":"no-store"}});
 if(request.method!=="GET"&&request.method!=="HEAD")return new NextResponse(null,{status:405,headers:{Allow:"GET, HEAD"}});
 if(path==="/"||path==="/demo"||path.startsWith("/demo/fonts/")||path==="/favicon.ico"||path.startsWith("/_next/"))return NextResponse.next();
 return NextResponse.redirect(new URL("/demo",request.url));
}
export const config={matcher:["/((?!_next/static|_next/image|favicon.ico).*)"]};
