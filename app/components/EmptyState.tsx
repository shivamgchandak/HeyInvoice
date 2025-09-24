import { buttonVariants } from "@/components/ui/button";
import { Ban, PlusCircle } from "lucide-react";
import Link from "next/link";
import thumbdown from "@/public/thumbs-down.gif";
import Image from "next/image";

interface iAppProps {
  title: string;
  description: string;
  buttontext?: string;
  href?: string;
  background?: boolean;
}

export function EmptyState({
  title,
  description,
  buttontext,
  href,
  background = false,
}: iAppProps) {
  return (
    <div className="relative flex flex-col flex-1 h-full items-center justify-center overflow-hidden rounded-md border-2 border-dashed p-8 text-center animate-in fade-in-50">
      
      {background && (
        <div className="absolute inset-0 -z-10">
          <Image
            src={thumbdown}
            alt="Background"
            className="w-full h-full object-cover opacity-20"
            fill
          />
        </div>
      )}

      <div className="flex flex-col items-center justify-center z-10">
        <div className="flex items-center justify-center size-20 rounded-full bg-primary/10">
          <Ban className="size-10 text-primary" />
        </div>
        <h2 className="mt-6 text-xl font-semibold">{title}</h2>
        <p className="mb-8 mt-2 text-sm max-w-md mx-auto text-center">
          {description}
        </p>
        {buttontext && href && (
          <Link href={href} className={buttonVariants()}>
            <PlusCircle className="size-4 mr-2" />
            {buttontext}
          </Link>
        )}
      </div>
    </div>
  );
}
