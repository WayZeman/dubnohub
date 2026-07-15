import "next-auth";
import "next-auth/jwt";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: Role;
    createdAt?: Date;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
      createdAt?: Date;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    createdAt?: string;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    role: Role;
    createdAt: Date;
  }
}
