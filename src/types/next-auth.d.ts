import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      profession?: string | null;
      phone?: string | null;
      bio?: string | null;
      isClient?: boolean;
      image?: string | null;
    };
  }

  interface User {
    profession?: string | null;
    isClient?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    profession?: string | null;
    isClient?: boolean;
  }
}
