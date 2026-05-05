# NEXUS RCA — BRIEF DÉTAILLÉ POUR CLAUDE CODE

> Ce document complète `CLAUDE.md` avec des détails techniques, des exemples de code et des scénarios précis.
> À consulter pour tout ce qui n'est pas couvert dans `CLAUDE.md`.

---

## 🎯 MISSION GLOBALE

Tu travailles sur **Nexus RCA**, une SaaS d'agence internationale en production avec de vrais clients qui paient.

Ton rôle : **ajouter ce qui manque, corriger les bugs, ne JAMAIS casser l'existant**.

**Ne te prends pas pour un designer** : le branding est défini, intouchable. Tu es un développeur qui exécute des features précises avec rigueur.

---

## 🚨 RÈGLES ABSOLUES (rappel)

Voir `CLAUDE.md` pour les règles principales. Ce document détaille les cas spécifiques.

---

## 📐 PATTERNS DE DESIGN À RÉUTILISER

### Pattern 1 — Hero page publique premium

```tsx
<section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 sm:py-28 lg:py-32">
  {/* Effets de gradient orange discrets */}
  <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-nexus-orange-500/10 blur-3xl" />
  <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-nexus-orange-500/5 blur-3xl" />

  <div className="container relative mx-auto px-6">
    {/* Badge orange en haut */}
    <span className="inline-block rounded-full bg-nexus-orange-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-nexus-orange-300">
      Service Nexus
    </span>

    {/* Titre court et premium */}
    <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
      Visa & e-Visa
    </h1>

    {/* Sous-titre descriptif */}
    <p className="mt-6 max-w-2xl text-lg text-slate-300">
      Accompagnement complet pour vos demandes de visa et e-visa internationaux.
    </p>

    {/* CTA */}
    <div className="mt-8 flex flex-wrap gap-4">
      <Link href="/demande/complet" className="rounded-xl bg-nexus-orange-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-nexus-orange-600">
        Démarrer ma demande
      </Link>
      <Link href="/contact" className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/10">
        Nous contacter
      </Link>
    </div>
  </div>
</section>
```

### Pattern 2 — Stat card

```tsx
<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
  <div className="flex items-start justify-between">
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium text-slate-500">Label</p>
      <p className="mt-1 font-display text-2xl font-bold text-nexus-blue-950">42</p>
      <p className="mt-0.5 text-xs text-slate-500">sublabel</p>
    </div>
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-lg">
      <Icon className="h-5 w-5" />
    </div>
  </div>
</div>
```

### Pattern 3 — Hero dashboard (interne)

```tsx
<div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 p-6 shadow-xl sm:p-8">
  <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-nexus-orange-500/20 blur-3xl" />
  <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-nexus-orange-500/10 blur-3xl" />

  <div className="relative flex flex-wrap items-center gap-6">
    {/* Avatar avec initiales */}
    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-2xl font-bold text-white shadow-2xl">
      {initiales}
    </div>

    <div className="min-w-0 flex-1">
      <span className="inline-block rounded-full bg-nexus-orange-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-nexus-orange-300">
        Espace [rôle]
      </span>
      <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
        Bonjour, {prenom}
      </h1>
      <p className="mt-1 text-sm text-slate-300">
        Sous-titre court
      </p>
    </div>
  </div>
</div>
```

### Pattern 4 — Bouton primaire orange

```tsx
<button className="rounded-xl bg-nexus-orange-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-nexus-orange-600 active:scale-95">
  Texte
</button>
```

### Pattern 5 — Bouton secondaire

```tsx
<button className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-nexus-blue-950 transition hover:bg-slate-50">
  Texte
</button>
```

---

## 🛠️ TYPESCRIPT — PATTERNS RÉCURRENTS

### Cast pour colonnes Supabase non typées

```typescript
// Quand le type Profile ne contient pas la colonne 'poste' qui existe en DB
const profileAny = profile as unknown as Record<string, unknown>;
const profilePoste = (profileAny.poste as string) || "Agent Nexus";
```

### Helper sanitize PDF

```typescript
function sanitizeForPdf(text: string): string {
  if (!text) return "";
  return text
    .replace(/\u202f/g, " ")  // espace insécable étroit
    .replace(/\u00a0/g, " ")  // espace insécable
    .replace(/\u2009/g, " ")
    .replace(/\u200a/g, " ")
    .replace(/\u2007/g, " ")
    .replace(/\u2060/g, "")
    .replace(/\u00e9/g, "e").replace(/\u00e8/g, "e").replace(/\u00ea/g, "e")
    .replace(/\u00e0/g, "a").replace(/\u00e2/g, "a")
    .replace(/\u00ee/g, "i").replace(/\u00ef/g, "i")
    .replace(/\u00f4/g, "o").replace(/\u00f6/g, "o")
    .replace(/\u00f9/g, "u").replace(/\u00fb/g, "u").replace(/\u00fc/g, "u")
    .replace(/\u00e7/g, "c")
    .replace(/\u00c9/g, "E").replace(/\u00c0/g, "A").replace(/\u00c7/g, "C")
    .replace(/[^\x20-\x7E]/g, "?");
}
```

### Format money sans Unicode

```typescript
// Pour PDF (espaces normaux)
function formatMoneyPdf(amount: number, currency = "XAF"): string {
  return `${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ${currency}`;
}

// Pour HTML email (toLocaleString OK)
function formatMoneyHtml(amount: number, currency = "XAF"): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} ${currency}`;
}
```

### API route avec logs explicites

```typescript
export async function POST(request: NextRequest) {
  console.log("===== [FEATURE_NAME] START =====");
  
  try {
    // ... logique
    console.log("[FEATURE_NAME] Étape 1 OK");
    
    if (!process.env.RESEND_API_KEY) {
      console.error("[FEATURE_NAME] ❌ RESEND_API_KEY manquante");
      return NextResponse.json({ error: "Config manquante" }, { status: 500 });
    }
    
    // ... suite
    console.log("[FEATURE_NAME] ✅ SUCCESS");
    console.log("===== [FEATURE_NAME] END =====");
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[FEATURE_NAME] EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

### Email Resend avec fallback

```typescript
const FROM_PRIMARY = "Nexus RCA <noreply@nexusrca.com>";
const FROM_FALLBACK = "Nexus RCA <onboarding@resend.dev>";

let emailSent = false;
const resend = new Resend(process.env.RESEND_API_KEY);

// Tentative 1
try {
  const result = await resend.emails.send({
    from: FROM_PRIMARY,
    to: clientEmail,
    subject,
    html,
    attachments,
  });
  
  if (!result.error) {
    emailSent = true;
    console.log("[FEATURE] ✅ Email sent via", FROM_PRIMARY, "ID:", result.data?.id);
  }
} catch (e) {
  console.error("[FEATURE] Tentative 1 failed:", e);
}

// Fallback
if (!emailSent) {
  try {
    const result = await resend.emails.send({
      from: FROM_FALLBACK,
      to: clientEmail,
      subject,
      html,
      attachments,
    });
    if (!result.error) {
      emailSent = true;
      console.log("[FEATURE] ✅ Email sent via FALLBACK");
    }
  } catch (e) {
    console.error("[FEATURE] Fallback failed:", e);
  }
}
```

---

## 🗄️ SUPABASE — TIPS

### Tables principales

```sql
-- profiles : utilisateurs (clients, agents, admins)
profiles (id, prenom, nom, email, role, poste, actif, created_at)

-- clients : clients gérés par agents (différent de profiles)
clients (id, prenom, nom, email, telephone, ville, pays, created_at, agent_id)

-- demandes : dossiers clients
demandes (id, reference, client_id, agent_id, service, statut, urgence, ...)

-- appointments : RDV (migration 016)
appointments (id, reference, client_id, agent_id, date_rdv, heure_rdv, service, statut, ...)

-- payments : paiements encaissés
payments (id, client_id, montant, devise, statut, notes, description, created_by, created_at)
-- ⚠️ PAS de colonne 'methode'

-- payment_links : liens publics paiement (migration 017)
payment_links (id, reference, client_id, montant, devise, statut, methode_choisie, numero_transaction, ...)

-- expenses : dépenses
expenses (id, montant, devise, categorie, description, statut, created_by, ...)

-- transferts : transferts d'argent
transferts (id, montant, devise, beneficiaire, statut, ...)

-- quick_sales : ventes caisse rapide
quick_sales (id, montant, devise, description, methode_paiement, ...)
```

### RLS — bonnes pratiques

```typescript
// ❌ NE PAS FAIRE — .or() peut échouer silencieusement avec RLS
const { data } = await supabase
  .from("demandes")
  .select("*")
  .or(`agent_id.eq.${profile.id},client_id.eq.${profile.id}`);

// ✅ FAIRE — appels séparés ou .eq()
const { data: demandesAgent } = await supabase
  .from("demandes")
  .select("*")
  .eq("agent_id", profile.id);

const { data: demandesClient } = await supabase
  .from("demandes")
  .select("*")
  .eq("client_id", profile.id);
```

### Statuts en français

⚠️ Dans la DB, les statuts sont en **français masculin** :
- `nouveau` (PAS `nouvelle`)
- `en_cours`
- `complete`
- `annule`
- `termine`

---

## 📦 PDF GÉNÉRATION

### Template de base

```typescript
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

async function generatePdf(data: { ... }): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Couleurs Nexus
  const nexusBlue = rgb(0.047, 0.11, 0.251);   // #0C1C40
  const nexusOrange = rgb(1, 0.4, 0);           // #FF6600
  const grayDark = rgb(0.15, 0.2, 0.3);
  const grayMid = rgb(0.4, 0.45, 0.5);
  const white = rgb(1, 1, 1);

  // ⚠️ TOUJOURS sanitize avant drawText
  const drawSafeText = (text: string, options: Parameters<typeof page.drawText>[1]) => {
    page.drawText(sanitizeForPdf(text), options);
  };

  // Header navy
  page.drawRectangle({ x: 0, y: height - 130, width, height: 130, color: nexusBlue });
  page.drawRectangle({ x: 0, y: height - 130, width: 6, height: 130, color: nexusOrange });
  drawSafeText("NEXUS RCA", { x: 50, y: height - 55, size: 24, font: helveticaBold, color: white });

  // ... contenu ...

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes).toString("base64");
}
```

---

## 📧 EMAIL TEMPLATES

### Template de base HTML

```html
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f1f5f9;">
  <table cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f1f5f9;padding:24px 0;">
    <tr><td align="center">
      <table cellspacing="0" cellpadding="0" border="0" width="600" style="background:#fff;border-radius:16px;overflow:hidden;">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#0C1C40 0%,#1a2a5e 100%);padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">{title}</h1>
        </td></tr>
        
        <!-- Body -->
        <tr><td style="padding:32px 40px;">
          <p style="margin:0 0 20px 0;font-size:16px;color:#0C1C40;">Bonjour <strong>{nom}</strong>,</p>
          <!-- contenu -->
        </td></tr>
        
        <!-- Footer -->
        <tr><td style="background:#0C1C40;padding:24px 40px;text-align:center;">
          <p style="margin:0;font-size:14px;font-weight:700;color:#fff;">NEXUS RCA</p>
          <p style="margin:4px 0;font-size:12px;color:#94a3b8;">+236 73 26 96 92 · contact@nexusrca.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
```

---

## 🎯 ROADMAP — DÉTAILS DES FEATURES

### Priorité 1 — WhatsApp Twilio
**Pourquoi** : 90% des clients RCA utilisent WhatsApp. Email est secondaire.

**Implémentation** :
- Créer compte Twilio
- Variables env nouvelles : `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`
- Helper `sendWhatsApp(to, message)` dans `lib/twilio.ts`
- Intégrer dans : RDV créé, paiement confirmé, demande urgente

**Coût** : ~$50/mois (Twilio sandbox gratuit pour tests)

### Priorité 2 — Stripe activation
**Pourquoi** : Diaspora paie en CAD/EUR/USD depuis l'étranger.

**Implémentation** :
- Compte Stripe Business Canada (validation 2-7 jours)
- Variables : `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- Webhook `/api/stripe/webhook` pour confirmation auto
- Activer méthode Stripe dans `/payer/[reference]` (actuellement disabled)

### Priorité 3 — Messagerie interne
**Migration** :
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demande_id UUID REFERENCES demandes(id),
  sender_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Composants** :
- `<MessageThread demandeId={...} />` — liste messages
- `<MessageInput />` — formulaire envoi
- Realtime Supabase pour notifs instantanées

### Priorité 4 — Multi-langue FR/EN
**Lib** : `next-intl` (bien intégré App Router)

**Structure** :
```
messages/
├── fr.json
└── en.json
```

### Priorité 5 — Cron rapports mensuels
**Vercel cron** :
```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/monthly-report",
    "schedule": "0 8 1 * *"
  }]
}
```

### Priorité 6 — Search global
**Composant** : `<GlobalSearch />` dans `DashboardShell`
**Recherche transverse** : clients, demandes, RDV, paiements
**API** : `/api/search?q=...` retourne résultats catégorisés

### Priorité 7 — Notifications cloche
**Migration** :
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  type TEXT, -- 'rdv_new', 'payment_declared', 'demande_urgent'
  title TEXT,
  link TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Priorité 8 — Export Excel
**Lib** : `xlsx` ou `exceljs`
**Multi-onglets** : Paiements, Dépenses, RDV, Demandes

---

## 🚦 CHECKLIST AVANT CHAQUE PUSH

- [ ] J'ai lu CLAUDE.md
- [ ] J'ai lu les fichiers concernés AVANT de modifier
- [ ] Le design respecte le branding Nexus (couleurs, polices, tailles)
- [ ] Les titres ne dépassent pas `text-6xl`
- [ ] Pas de nouveaux titres marketing inventés
- [ ] TypeScript strict (pas de `any`)
- [ ] Logs `[FEATURE_NAME]` explicites
- [ ] Try/catch sur API routes
- [ ] Sanitize si génération PDF
- [ ] Variables env nouvelles documentées
- [ ] Migration SQL fournie si nouvelle table
- [ ] Build passe localement (`npm run build`)
- [ ] Récap des changements à Thierry
- [ ] Commit message clair

---

## 📞 STYLE DE COMMUNICATION AVEC THIERRY

### ✅ DO
- Étapes numérotées
- Code dans blocs délimités
- Pas de blabla
- Récap en fin de réponse : "Fichiers modifiés : X, Y. Push avec : ..."

### ❌ DON'T
- "Je pense que peut-être on pourrait..."
- "Voici une longue explication théorique de..."
- "J'ai pris la liberté de refactorer aussi..."
- Modifications silencieuses non documentées

---

**FIN DU BRIEF — Bonne chance, Claude Code. Sois rigoureux, pose des questions, ne casse rien. 🐢**
