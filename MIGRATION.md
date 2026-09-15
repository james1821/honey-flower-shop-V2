# Supabase → Firebase migration

This project now runs entirely on Firebase's **free Spark plan**: Firebase Auth for
login/signup, Firestore for the database, and Firebase Storage for images. Supabase is no
longer used anywhere in the code.

> ⚠️ **Rotate your Supabase service role key.** The `.env` file in the project you uploaded
> contained a live Supabase `service_role` key, which bypasses all Row Level Security. Since
> that file has now been shared, go to Supabase → Project Settings → API and roll (regenerate)
> that key, whether or not you keep using Supabase.

## 1. Create the Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
   Free "Spark" plan is fine — nothing in this app requires Blaze/billing.
2. In the project, go to **Build → Authentication → Get started**, and enable the
   **Email/Password** sign-in provider.
3. Go to **Build → Firestore Database → Create database**. Choose **Production mode** (the
   rules file in this repo replaces the defaults) and pick a region close to your customers.
4. Go to **Build → Storage → Get started**. Same region choice as Firestore.
5. Go to **Project settings (gear icon) → General → Your apps → Add app → Web (`</>`)**.
   Register the app (no need to set up Firebase Hosting unless you want it). Copy the
   `firebaseConfig` values shown.

## 2. Configure the app

Fill in `.env` with the values from step 1.5:

```
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
```

These are all safe to expose in client-side code (like the old Supabase anon key) — access
control is enforced by `firestore.rules` and `storage.rules`, not by hiding these values.

```bash
npm install
npm run dev
```

## 3. Deploy the security rules and indexes

The rules in `firestore.rules` / `storage.rules` and the composite indexes in
`firestore.indexes.json` need to be deployed to your Firebase project — they don't apply
automatically just by being in the repo.

```bash
npm install -g firebase-tools    # if you don't already have it
firebase login
firebase use --add               # pick your new project, give it an alias like "default"
firebase deploy --only firestore:rules,firestore:indexes,storage:rules
```

Without this step, every read/write from the app will be rejected by Firestore's default
"locked" rules.

## 4. Seed data

You have two options:

**A. Bring over your existing Supabase data** with `scripts/migrate-from-supabase.mjs`. See
the comment block at the top of that file for setup steps (it needs your Supabase service
role key and a Firebase Admin service account key, both used only locally on your machine —
neither is ever sent anywhere else). It copies categories, products (with variants embedded),
delivery options, promo codes, gallery items, the popup banner, and orders (with line items
embedded). It does **not** copy Supabase Auth users/passwords or `profiles` rows — see the
note in that file for why, and step 5 below for recreating your admin account.

**B. Start fresh** — just add categories, delivery options, and products from the admin panel
once you have an admin account (step 5).

## 5. Create your first admin account

1. Register a normal account on the site at `/auth/register`.
2. In the Firebase Console, go to **Firestore Database → Data**, open the `users` collection,
   find the document with your account's uid (its ID matches the uid shown in
   **Authentication → Users**), and change its `role` field from `customer` to `admin`.
3. Log out and back in (or just reload) — you'll now see **Admin Dashboard** in the nav and
   can reach `/admin`.

There's no Supabase-style database trigger to do this automatically on Firebase's free plan,
so promoting the first admin is always a one-time manual step in the console.

## 6. Image uploads

The admin Products, Gallery, and Popup Banner pages now use a file picker instead of a URL
field. Every image is compressed and resized in the browser (down to ~1600px on the long
edge, ~0.6MB target) before it's uploaded to Firebase Storage — this keeps Storage usage and
page-load weight low, which matters on the free Spark plan's storage/bandwidth quota.

If you migrated existing products via the script above, their `images` will still be the old
external URLs (Unsplash, a CDN, etc.) — those keep working fine as plain links. Re-upload a
photo from the admin panel any time you want it actually hosted on Firebase Storage instead.

## What changed technically, if you're curious

- **Auth**: `supabase.auth.*` → Firebase Auth (`signInWithEmailAndPassword`,
  `createUserWithEmailAndPassword`). Signup also writes a `users/{uid}` Firestore profile doc,
  since Firebase has no equivalent to Supabase's "run this trigger when an auth user is
  created."
- **Database**: Postgres tables → Firestore collections. Since Firestore can't do SQL joins,
  a few things are denormalized: a product stores its `category` and `variants` directly on
  the product document, and an order stores its line `items` directly on the order document
  (matching how the UI always fetched them together anyway).
- **Order numbers**: Postgres had a sequence/trigger generating `order_number`; Firestore has
  no equivalent, so it's now generated by an atomic counter document (`counters/orders`)
  incremented inside the same transaction that creates the order.
- **Images**: previously just a pasted URL; now uploaded to Firebase Storage with client-side
  compression via `browser-image-compression`, through the new `AdminImageUploader` component
  and `useImageUpload` composable.
- **Access control**: Supabase Row Level Security policies → `firestore.rules` /
  `storage.rules`, using a `users/{uid}.role == 'admin'` check in place of Postgres role
  checks.

## One honest caveat about "doesn't sleep"

Firestore and Firebase Auth are always-on managed services — there's no server process to
sleep, same as it was with Supabase's own database/auth (those weren't sleeping before
either). Where "sleeping" free tiers usually bite people is a **serverless compute** layer
(e.g. Cloud Functions, or a Render/Railway free-tier Node server) spinning down after
inactivity. This app has no server API routes (`server/` is empty — it already talked to the
backend directly from the browser, same as it does now with Firestore), so there's nothing
here that can cold-start or sleep on you.
