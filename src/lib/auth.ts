import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from './prisma';
import { compare } from 'bcryptjs';

// Extend the built-in types
declare module 'next-auth' {
  interface Session {
    user: {
      isClient: boolean;
      id: string;
      email?: string | null;
      name?: string | null;
      phone?: string | null;
      bio?: string | null;
      profession?: string | null;
    };
  }

  interface User {
    id: string;
    email: string | null;
    name: string | null;
    phone?: string | null;
    bio?: string | null;
    profession?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string | null;
    name: string | null;
    phone?: string | null;
    bio?: string | null;
    profession?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }
          // First check if it's a client
          const client = await prisma.client.findUnique({
            where: { email: credentials.email },
          });

          if (client) {
            const isPasswordValid = await compare(credentials.password, client.password);
            if (isPasswordValid) {
              return {
                id: client.id,
                email: client.email,
                name: client.name,
                isClient: true,
              };
            }
          }

          // If not a client, check if it's a user
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (user && user.password) {
            const isPasswordValid = await compare(credentials.password, user.password);
            if (isPasswordValid) {
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                isClient: false,
              };
            }
          }
          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.isClient = user.isClient;
      }
      if (!token.id && token.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: token.email as string } });
        if (dbUser) {
          token.id = dbUser.id;
          token.phone = dbUser.phone;
          token.bio = dbUser.bio;
          token.profession = dbUser.profession;
          token.name = dbUser.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.phone = token.phone as string | null;
        session.user.bio = token.bio as string | null;
        session.user.profession = token.profession as string | null;
        session.user.isClient = token.isClient as boolean;
      }
      return session;
    },
  },
  events: {
    async signOut() {
      // Clear any server-side session data if needed
    },
  },
  debug: true, // Enable debug mode
};
