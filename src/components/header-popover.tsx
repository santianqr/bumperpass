import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HeaderAvatar } from "./header-avatar";
import { UserCog, FolderSearch2, Settings, LogOut } from "lucide-react";
import Link from "next/link";

const menu = [
  {
    icon: <UserCog size={18} />,
    label: "Account",
    href: "/account",
  },
  {
    icon: <FolderSearch2 size={18} />,
    label: "User Dashboard",
    href: "/account/dashboard",
  },
  {
    icon: <Settings size={18} />,
    label: "Settings",
    href: "/account/settings",
  },
  {
    icon: <LogOut size={18} />,
    label: "Log out",
    href: "/api/auth/signout",
  },
];

export function HeaderPopover() {
  return (
    <Popover>
      <PopoverTrigger>
          <HeaderAvatar />
      </PopoverTrigger>
      <PopoverContent className="w-44 space-y-1 text-sm text-foreground/60">
        {menu.map((option, index) => (
          <Link
            key={index}
            className="flex items-center space-x-2"
            href={option.href}
          >
            {option.icon}
            <span>{option.label}</span>
          </Link>
        ))}
      </PopoverContent>
    </Popover>
  );
}
