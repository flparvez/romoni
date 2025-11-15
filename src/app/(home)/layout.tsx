import BottomBar from "@/components/Header/Bottom";
import { Suspense } from "react";

// this is layout file for homepage
export default function Layout({ children }: { children: React.ReactNode }) {
                return <>
                
                
                {children}
                
                   <Suspense fallback={<div>Loading...</div>}>
                            <BottomBar />
                        </Suspense>
                </>;
}
