import Image from "next/image";
import { Navbar } from "@/components/header-navbar";
import { HeaderPopover } from "@/components/header-popover";
import Link from "next/link";
import { HeaderButton } from "./header-button";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 mx-auto w-full max-w-screen-2xl border-b border-border/40 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-center md:justify-between">
        <HeaderButton classname="cursor-pointer block md:hidden absolute left-0" />
        <Link href="/">
          <Image
            src="/logo_long.webp"
            alt="logo_long"
            width={150}
            height={150}
          />
        </Link>
        <div className="hidden items-center space-x-6 md:flex">
          <Navbar />
          <HeaderPopover />
        </div>
      </div>
    </header>
  );
}
