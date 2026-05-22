import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";

type GoogleTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
};

const DEMO_USERNAME = "user";
const DEMO_PASSWORD = "user";

async function refreshGoogleAccessToken(token: JWT): Promise<JWT> {
  try {
    const clientId = process.env.AUTH_GOOGLE_ID;
    const clientSecret = process.env.AUTH_GOOGLE_SECRET;

    if (!clientId || !clientSecret || !token.refreshToken) {
      return { ...token, error: "RefreshAccessTokenError" };
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens =
      (await response.json()) as Partial<GoogleTokenResponse> & {
        error?: string;
      };

    if (!response.ok || !refreshedTokens.access_token || !refreshedTokens.expires_in) {
      return { ...token, error: "RefreshAccessTokenError" };
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: Math.floor(Date.now() / 1000 + refreshedTokens.expires_in),
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 90, // 90 days
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 90, // 90 days
  },
  providers: [
    Credentials({
      name: "Demo Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = String(credentials?.username ?? "").trim();
        const password = String(credentials?.password ?? "");

        if (username !== DEMO_USERNAME || password !== DEMO_PASSWORD) {
          return null;
        }

        return {
          id: "demo-user",
          name: "Demo User",
          email: "user@local.demo",
        };
      },
    }),
    Google({
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          response_type: "code",
          scope:
            "openid email profile https://www.googleapis.com/auth/drive",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        return Boolean(profile?.email_verified);
      }

      return true;
    },
    async jwt({ token, account }) {
      if (account?.provider === "google") {
        return {
          ...token,
          accessToken: account.access_token,
          expiresAt: account.expires_at,
          refreshToken: account.refresh_token ?? token.refreshToken,
          error: undefined,
        };
      }

      if (!token.expiresAt || Date.now() < token.expiresAt * 1000 - 60_000) {
        return token;
      }

      return refreshGoogleAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;

      if (session.user && token.sub) {
        session.user.id = token.sub;
      }

      return session;
    },
  },
});
