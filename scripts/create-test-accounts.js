// L2 — Creation des comptes TEST_ (9 roles + client), un par role.
// Reutilise le patron deja valide de app/api/team/create-member/route.ts
// (auth.admin.createUser + upsert profiles), en JS simple (pas de ts-node
// dans les devDependencies) execute une seule fois en local.
//
// Usage : node scripts/create-test-accounts.js
//
// Ne committe jamais les mots de passe generes : affiches une seule fois
// dans la sortie de ce script, a transmettre a Thierry hors depot.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  const content = fs.readFileSync(envPath, "utf8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    env[key] = value; // dernier doublon gagne, comme dotenv
  }
  return env;
}

function generatePassword() {
  return crypto.randomBytes(12).toString("base64url") + "!A1";
}

const env = loadEnvLocal();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("[CREATE_TEST_ACCOUNTS] Variables Supabase manquantes dans .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Service reel existant (voir migration 044 / seed P8) — pour que les
// portees .service de TEST_chefservice / TEST_agent soient exercees.
const VISA_SERVICE_ID = "47c30955-d162-473e-87a6-bad02edeacd0";

const ACCOUNTS = [
  { role: "super_admin", prenom: "Test", nom: "SuperAdmin" },
  { role: "admin", prenom: "Test", nom: "Admin" },
  { role: "dg", prenom: "Test", nom: "DG" },
  { role: "daf", prenom: "Test", nom: "DAF" },
  { role: "chef_service", prenom: "Test", nom: "ChefService", service_id: VISA_SERVICE_ID },
  { role: "agent", prenom: "Test", nom: "Agent", service_id: VISA_SERVICE_ID },
  { role: "comptable", prenom: "Test", nom: "Comptable" },
  { role: "moderateur", prenom: "Test", nom: "Moderateur" },
  { role: "partenaire", prenom: "Test", nom: "Partenaire" },
  // Espace Accueil & Caisse (11/09/2026) — role cree apres le lot L2,
  // ajoute ici pour tester le Poste de reception / Comptoir POS.
  { role: "accueil_caisse", prenom: "Test", nom: "AccueilCaisse" },
  { role: "client", prenom: "Test", nom: "Client" },
];

async function main() {
  const results = [];

  for (const account of ACCOUNTS) {
    const email = `test.${account.role.replace(/_/g, "")}@nexusrca.test`;
    const password = generatePassword();

    const { data: existing } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      console.log(`[SKIP] ${email} existe deja (id=${existing.id})`);
      results.push({ ...account, email, id: existing.id, password: "(deja existant, non regenere)" });
      continue;
    }

    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { prenom: account.prenom, nom: account.nom, role: account.role, is_test: true },
    });

    if (createError || !created?.user) {
      console.error(`[ERREUR] auth.admin.createUser(${email}):`, createError?.message);
      continue;
    }

    const userId = created.user.id;

    const profilePayload = {
      id: userId,
      email,
      nom: account.nom,
      prenom: account.prenom,
      role: account.role,
      actif: true,
      is_test: true,
    };
    if (account.service_id) profilePayload.service_id = account.service_id;

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(profilePayload, { onConflict: "id" });

    if (profileError) {
      console.error(`[ERREUR] upsert profiles(${email}):`, profileError.message);
      await supabase.auth.admin.deleteUser(userId);
      continue;
    }

    if (account.role === "client") {
      const { error: clientError } = await supabase.from("clients").insert({
        nom: account.nom,
        prenom: account.prenom,
        email,
        profile_id: userId,
        is_test: true,
      });
      if (clientError) {
        console.error(`[ERREUR] insert clients(${email}):`, clientError.message);
      }
    }

    console.log(`[OK] ${account.role} -> ${email} (id=${userId})`);
    results.push({ ...account, email, id: userId, password });
  }

  console.log("\n=== RÉCAPITULATIF (mots de passe — à transmettre hors dépôt) ===");
  for (const r of results) {
    console.log(`${r.role.padEnd(14)} ${r.email.padEnd(32)} ${r.password}`);
  }
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
