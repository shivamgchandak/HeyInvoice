import Image from "next/image";
import Link from "next/link";
import logo from "@/public/logo.png";
import { buttonVariants } from "@/components/ui/button";
import { RainbowButton } from "@/components/ui/rainbow-button";

export function Navbar(){
    return(
        <div className="flex items-center justify-between py-5">
            <Link href="/" className="flex items-center gap-2">
                <Image src={logo} alt="Logo" className="size-15"/>
                <p className="text-2xl font-bold">Hey<span className="text-blue-500">Invoice</span></p>
            </Link>
            <Link href="/login"><RainbowButton>Get Started</RainbowButton></Link>
        </div>
    )
}