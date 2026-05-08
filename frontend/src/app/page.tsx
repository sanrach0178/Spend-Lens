import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Clock, TrendingDown } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto w-full py-20">
        
        {/* Hero Section */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-balance">
            You&apos;re probably overpaying for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
              AI tools.
            </span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-xl sm:text-2xl text-muted-foreground text-balance">
            Get a free 60-second audit of your AI stack. See exactly where you&apos;re wasting money and what to do about it.
          </p>

          <div className="pt-4 flex justify-center">
            <Link href="/audit">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                Audit My Stack
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 w-full max-w-3xl border-t border-border pt-12 animate-in fade-in duration-1000 delay-300">
          <div className="flex flex-col items-center space-y-3">
            <div className="bg-primary/10 p-3 rounded-full">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <p className="font-medium text-lg">Used by 500+ startups</p>
          </div>
          
          <div className="flex flex-col items-center space-y-3">
            <div className="bg-emerald-500/10 p-3 rounded-full">
              <TrendingDown className="h-6 w-6 text-emerald-400" />
            </div>
            <p className="font-medium text-lg">Average $340/mo saved</p>
          </div>

          <div className="flex flex-col items-center space-y-3">
            <div className="bg-blue-500/10 p-3 rounded-full">
              <Clock className="h-6 w-6 text-blue-400" />
            </div>
            <p className="font-medium text-lg">Takes 60 seconds</p>
          </div>
        </div>

      </div>
    </main>
  );
}
