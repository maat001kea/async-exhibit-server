# Clerk Setup Guide

## 1. Ét gruppemedlem opretter Clerk

1. Gå til [https://clerk.com](https://clerk.com/)
2. Opret en konto med GitHub
3. Klik på **"Create Application"**
4. Navngiv appen fx `AsyncExhibit`
5. Gå til **Settings > Authentication** og:
   - Slå _kun_ **GitHub** til som login-provider
   - Deaktiver Email, Google mv.
6. Gå til **API Keys** og kopier:
   - `Clerk Publishable Key`
   - `Clerk Secret Key`

## 2. Del `.env` med gruppen

Del og sæt disse værdier i en `.env.local`-fil:

```bash
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

```

## 3. Installer Clerk

```bash
npm install @clerk/nextjs
```

## 4. Tilføj ClerkProvider i `app/layout.js`

```jsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="da">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

## 5. Middleware: Beskyt alt som udgangspunkt

Lav en ny fil i `src/` som du kalder `middleware.ts` og indsæt følgende:

```jsx
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Liste over offentlige ruter
// Her kan du tilføje flere ruter, som ikke skal beskyttes
const isPublicRoute = createRouteMatcher([
  "/", // forside
  "/events(.*)", // event routes
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
```

Her er alle routes beskyttet pånær "/" (root) og alle "/event" routes samt "/sign-in" og "/sign-up" routes.

---

## Arbejd med betinget UI med login-status

På diverse sider kan du nu bruge `SignedIn` og `SignedOut` til at vise forskellige UI-elementer afhængigt af login-status.

```jsx
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="p-6">
      <SignedIn>
        <p>Velkommen tilbage!</p>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <p>Du er ikke logget ind.</p>
      </SignedOut>
    </main>
  );
}
```

## Lav Sign In og Sign Up routes

Hvis en bruger, der ikke er logget ind, prøver at tilgå en beskyttet route, vil de blive sendt til `/sign-in` eller `/sign-up`.

For at lave disse routes skal du oprette to filer i hhv. `app/sign-in/[[...sign-in]]/page.jsx` og `app/sign-up/[[...sign-up]]/page.jsx`.

```jsx
// app/sign-in/[[...sign-in]]/page.jsx
import { SignIn } from "@clerk/nextjs";
export default function Page() {
  return <SignIn />;
}
```

```jsx
// app/sign-up/[[...sign-up]]/page.jsx
import { SignUp } from "@clerk/nextjs";
export default function Page() {
  return <SignUp />;
}
```

## Tilføj følgende til `.env.local`

```bash
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```
