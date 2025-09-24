import { RainbowButton } from "@/components/ui/rainbow-button";
import Image from "next/image";
import Link from "next/link";
import hero from "@/public/hero.png";

export function Hero() {
    return (
        <section className="relative flex flex-col items-center justify-center py-12 lg:py-20">
            <div className="text-center">
                <span className="text-sm text-primary font-medium tracking-tight bg-primary/10 px-4 py-2 rounded-full">
                    Introducing HeyInvoice 1.0
                </span>
                <h1 className="mt-8 text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tighter">
                    Invoicing made <span className="block -mt-2 bg-gradient-to-l from-blue-500 via-teal-500 to-green-500 text-transparent bg-clip-text">super easy!</span>
                </h1>
                <p className="max-w-xl mx-auto mt-4 lg:text-lg text-muted-foreground">
                    Creating can be a pain! We at HeyInvoice make it super easy for you to get paid in time!
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
