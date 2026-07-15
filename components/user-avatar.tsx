import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  name?: string | null;
  image?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "size-8",
  md: "size-10",
  lg: "size-16",
};

function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function UserAvatar({
  name,
  image,
  size = "md",
  className,
}: UserAvatarProps) {
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {image ? <AvatarImage src={image} alt={name ?? "User"} /> : null}
      <AvatarFallback className="bg-muted text-xs font-medium">
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
