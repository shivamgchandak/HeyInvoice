import { RainbowButton } from "@/components/ui/rainbow-button";
import Image from "next/image";
import Link from "next/link";
import hero from "@/public/hero.png";

export function Hero() {
    return (
        <section className="relative flex flex-col items-center justify-center py-12 lg:py-20 overflow-hidden">
            {/* Decorative background blobs */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 size-[28rem] rounded-full bg-gradient-to-br from-blue-500/20 via-teal-500/15 to-emerald-500/20 blur-3xl" />
                <div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 size-[24rem] rounded-full bg-gradient-to-br from-fuchsia-500/15 via-violet-500/15 to-blue-500/15 blur-3xl" />
            </div>

            <div className="text-center animate-fade-in-up">
                <span className="inline-flex items-center gap-2 text-sm text-primary font-medium tracking-tight bg-primary/10 px-4 py-2 rounded-full ring-1 ring-primary/20">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    Introducing HeyInvoice 2.0
                </span>
                <h1 className="mt-8 text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tighter">
                    Invoicing made{" "}
                    <span className="block -mt-2 gradient-text">
                        super easy!
                    </span>
                </h1>
                <p className="max-w-xl mx-auto mt-4 lg:text-lg text-muted-foreground">
                    Add multiple line items, get gorgeous PDFs, and send polished emails — all in seconds. We make getting paid feel effortless.
                </p>
                <div className="mt-7 mb-123">
                    <Link href="/login">
                        <RainbowButton>Get Unlimited Access</RainbowButton>
                    </Link>
                </div>
            </div>

            <div className="relative items-center w-full py-12 mx-auto -mt-125">
                <div className="absolute top-0 left-0 right-0 h-40 lg:h-60 bg-gradient-to-br from-blue-500 via-teal-500 to-green-500 opacity-30 rounded-t-lg blur-2xl z-0 pointer-events-none" />
                <Image
                    src={hero}
                    alt="hero"
                    className="relative object-cover w-full border rounded-lg lg:rounded-2xl shadow-2xl z-10"
                />
            </div>
        </section>
    );
}
