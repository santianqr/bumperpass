import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet";
  import { AlignJustify } from "lucide-react";
  import Link from "next/link";
  
  const links = [
    { href: "/", text: "Search Now!" },
    { href: "/services", text: "Services" },
    { href: "/about", text: "About" },
    { href: "/account", text: "Account" },
    { href: "/account/dashboard", text: "User Dashboard" },
    { href: "/account/settings", text: "Settings" },
  ];
  
  type HeaderButtonProps = {
    classname?: string;
  };
  
  export function HeaderButton({ classname }: HeaderButtonProps) {
    return (
      <div className={classname}>
        <Sheet>
          <SheetTrigger asChild className="text-primary">
            <AlignJustify />
          </SheetTrigger>
          <SheetContent side={"left"}>
            <SheetHeader>
              <SheetTitle>Bumperpass Navigation Options</SheetTitle>
              <SheetDescription></SheetDescription>
            </SheetHeader>
            <div className="flex flex-col">
              {links.map((link, index) => (
                <Link key={index} href={link.href}>
                  {link.text}
                </Link>
              ))}
            </div>
            <SheetFooter>
              <SheetClose></SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    );
  }