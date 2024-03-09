import { CircleUser, ChevronDown } from "lucide-react";
import { getServerAuthSession } from "@/server/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
//import { useSession } from "next-auth/react";

export async function HeaderAvatar() {
  const session = await getServerAuthSession();
  //const { data: session } = useSession();
  
  return session ? (
    <Avatar className="block h-[2rem] w-[2rem]">
      <AvatarImage src="https://github.com/santianqr.png" alt="user_image" />
      <AvatarFallback className="text-foreground">SQ</AvatarFallback>
    </Avatar>
  ) : (
    <div className="flex items-center text-foreground/60">
      <CircleUser />
      <ChevronDown size={12} />
    </div>
  );
}
