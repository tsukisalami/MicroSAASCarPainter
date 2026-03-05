import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      shopId: string | null;
    };
  }

  interface User {
    shopId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    shopId?: string | null;
  }
}
