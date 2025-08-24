import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "./ui/dropdown-menu";
  import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
  import { LogOut, Settings, User as UserIcon } from "lucide-react";
  import { User } from "firebase/auth";

  interface UserMenuProps {
    user: User | null;
    onSignOut: () => void;
  }

  export default function UserMenu({ user, onSignOut }: UserMenuProps) {
    const getInitials = (name: string | null | undefined) => {
      if (!name) return "U";
      return name.split(" ").map((n) => n[0]).join("").toUpperCase();
    };

    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className="h-10 w-10 cursor-pointer">
            <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "User"} />
            <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.displayName || "User"}</p>
              <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }