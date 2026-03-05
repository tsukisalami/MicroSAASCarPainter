import { auth } from "@/lib/auth";

export async function Header() {
  const session = await auth();

  return (
    <header className="flex h-16 items-center justify-end border-b bg-card px-6">
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium">{session?.user?.name}</p>
          <p className="text-xs text-muted-foreground">
            {session?.user?.email}
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
          {session?.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
        </div>
      </div>
    </header>
  );
}
