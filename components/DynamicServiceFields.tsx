"use client";

import { Input, Select } from "@/components/ui/Input";
import type { ServiceType } from "@/types";

interface DynamicFieldsProps {
  serviceType: ServiceType;
  details: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}

function getStr(obj: Record<string, unknown>, key: string): string {
  const v = obj[key];
  return typeof v === "string" ? v : "";
}
function getBool(obj: Record<string, unknown>, key: string): boolean {
  return obj[key] === true;
}
function getNum(obj: Record<string, unknown>, key: string, fallback = 0): number {
  const v = obj[key];
  return typeof v === "number" ? v : fallback;
}

export function DynamicServiceFields({
  serviceType,
  details,
  onChange,
}: DynamicFieldsProps) {
  const wrapClass =
    "rounded-2xl border border-nexus-orange-200 bg-nexus-orange-50/50 p-5";
  const titleClass =
    "mb-4 text-sm font-bold uppercase tracking-wide text-nexus-orange-700";

  switch (serviceType) {
    case "visa":
      return (
        <div className={wrapClass}>
          <p className={titleClass}>🛂 Détails du visa</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Type de visa"
              value={getStr(details, "type_visa")}
              onChange={(e) => onChange("type_visa", e.target.value)}
            >
              <option value="">— Choisir —</option>
              <option value="tourisme">Tourisme</option>
              <option value="etudes">Études</option>
              <option value="affaires">Affaires</option>
              <option value="travail">Travail</option>
              <option value="transit">Transit</option>
              <option value="regroupement">Regroupement familial</option>
            </Select>
            <Input
              label="Date de voyage souhaitée"
              type="date"
              value={getStr(details, "date_voyage")}
              onChange={(e) => onChange("date_voyage", e.target.value)}
            />
            <Select
              label="Passeport disponible ?"
              value={getBool(details, "passeport_disponible") ? "oui" : "non"}
              onChange={(e) =>
                onChange("passeport_disponible", e.target.value === "oui")
              }
            >
              <option value="non">Non, à faire</option>
              <option value="oui">Oui, valide</option>
            </Select>
            <Select
              label="Documents déjà prêts ?"
              value={getStr(details, "documents_status")}
              onChange={(e) => onChange("documents_status", e.target.value)}
            >
              <option value="">— État des documents —</option>
              <option value="aucun">Aucun document prêt</option>
              <option value="partiel">Certains documents prêts</option>
              <option value="complet">Dossier complet prêt</option>
            </Select>
          </div>
        </div>
      );

    case "billet":
    case "hotel":
      return (
        <div className={wrapClass}>
          <p className={titleClass}>
            {serviceType === "billet" ? "✈️ Détails du vol" : "🏨 Détails de l'hôtel"}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {serviceType === "billet" && (
              <Input
                label="Ville de départ"
                placeholder="ex : Bangui"
                value={getStr(details, "ville_depart")}
                onChange={(e) => onChange("ville_depart", e.target.value)}
              />
            )}
            <Input
              label="Destination"
              placeholder="ex : Montréal, Paris..."
              value={getStr(details, "destination")}
              onChange={(e) => onChange("destination", e.target.value)}
            />
            <Input
              label="Date aller / arrivée"
              type="date"
              value={getStr(details, "date_depart")}
              onChange={(e) => onChange("date_depart", e.target.value)}
            />
            <Input
              label="Date retour / départ"
              type="date"
              value={getStr(details, "date_retour")}
              onChange={(e) => onChange("date_retour", e.target.value)}
            />
            <Input
              label="Nombre de voyageurs"
              type="number"
              min={1}
              max={20}
              value={getNum(details, "voyageurs", 1)}
              onChange={(e) =>
                onChange("voyageurs", parseInt(e.target.value) || 1)
              }
            />
            {serviceType === "billet" ? (
              <Select
                label="Classe"
                value={getStr(details, "classe")}
                onChange={(e) => onChange("classe", e.target.value)}
              >
                <option value="">— Choisir —</option>
                <option value="economique">Économique</option>
                <option value="premium">Premium economy</option>
                <option value="business">Business</option>
                <option value="premiere">Première</option>
              </Select>
            ) : (
              <Select
                label="Standing hôtel"
                value={getStr(details, "standing")}
                onChange={(e) => onChange("standing", e.target.value)}
              >
                <option value="">— Choisir —</option>
                <option value="economique">Économique</option>
                <option value="3etoiles">3 étoiles</option>
                <option value="4etoiles">4 étoiles</option>
                <option value="luxe">Luxe / 5 étoiles</option>
              </Select>
            )}
          </div>
        </div>
      );

    case "tcf":
    case "etudes":
      return (
        <div className={wrapClass}>
          <p className={titleClass}>
            {serviceType === "tcf" ? "📝 Détails TCF" : "🎓 Détails études"}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={serviceType === "tcf" ? "Pays visé" : "Pays d'études visé"}
              placeholder="ex : Canada"
              value={getStr(details, "pays_vise")}
              onChange={(e) => onChange("pays_vise", e.target.value)}
            />
            <Select
              label="Niveau d'études"
              value={getStr(details, "niveau")}
              onChange={(e) => onChange("niveau", e.target.value)}
            >
              <option value="">— Choisir —</option>
              <option value="licence">Licence / Bachelor</option>
              <option value="master">Master</option>
              <option value="doctorat">Doctorat / PhD</option>
              <option value="formation_pro">Formation professionnelle</option>
              <option value="cegep">Cégep / DEC (Québec)</option>
            </Select>
            <Input
              label="Domaine / Filière"
              placeholder="ex : Informatique, Médecine..."
              value={getStr(details, "domaine")}
              onChange={(e) => onChange("domaine", e.target.value)}
            />
            <Input
              label="Rentrée / date cible"
              type="month"
              value={getStr(details, "annee_cible")}
              onChange={(e) => onChange("annee_cible", e.target.value)}
            />
            {serviceType === "etudes" && (
              <div className="sm:col-span-2">
                <Input
                  label="Établissement visé (si connu)"
                  placeholder="ex : Université de Montréal"
                  value={getStr(details, "etablissement_vise")}
                  onChange={(e) =>
                    onChange("etablissement_vise", e.target.value)
                  }
                />
              </div>
            )}
          </div>
        </div>
      );

    case "financement":
    case "partenariat":
      return (
        <div className={wrapClass}>
          <p className={titleClass}>
            {serviceType === "financement"
              ? "💼 Détails du projet"
              : "🤝 Détails partenariat"}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nom du projet"
              placeholder="ex : AgriTech Centrafrique"
              value={getStr(details, "nom_projet")}
              onChange={(e) => onChange("nom_projet", e.target.value)}
            />
            <Select
              label="Secteur d'activité"
              value={getStr(details, "secteur")}
              onChange={(e) => onChange("secteur", e.target.value)}
            >
              <option value="">— Choisir —</option>
              <option value="agriculture">Agriculture / Agro-alimentaire</option>
              <option value="tech">Tech / Numérique</option>
              <option value="commerce">Commerce</option>
              <option value="services">Services</option>
              <option value="btp">BTP / Immobilier</option>
              <option value="transport">Transport / Logistique</option>
              <option value="energie">Énergie</option>
              <option value="sante">Santé</option>
              <option value="education">Éducation</option>
              <option value="autre">Autre</option>
            </Select>
            <Select
              label="Stade du projet"
              value={getStr(details, "stade")}
              onChange={(e) => onChange("stade", e.target.value)}
            >
              <option value="">— Choisir —</option>
              <option value="idee">Idée</option>
              <option value="prototype">Prototype / MVP</option>
              <option value="lancement">Lancement</option>
              <option value="croissance">Croissance</option>
              <option value="etabli">Établi / expansion</option>
            </Select>
            {serviceType === "financement" && (
              <Input
                label="Montant recherché"
                placeholder="ex : 50 000 000 FCFA"
                value={getStr(details, "montant_recherche")}
                onChange={(e) => onChange("montant_recherche", e.target.value)}
              />
            )}
            <div className="sm:col-span-2">
              <Input
                label="Objectif principal"
                placeholder={
                  serviceType === "financement"
                    ? "ex : acquérir du matériel agricole"
                    : "ex : trouver un partenaire logistique en Europe"
                }
                value={getStr(details, "objectif")}
                onChange={(e) => onChange("objectif", e.target.value)}
              />
            </div>
          </div>
        </div>
      );

    case "administratif":
      return (
        <div className={wrapClass}>
          <p className={titleClass}>📋 Détails administratifs</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Type de document"
              value={getStr(details, "type_document")}
              onChange={(e) => onChange("type_document", e.target.value)}
            >
              <option value="">— Choisir —</option>
              <option value="cv">CV (format canadien)</option>
              <option value="lettre_motivation">Lettre de motivation</option>
              <option value="traduction">Traduction FR ↔ EN</option>
              <option value="formulaire">Remplissage formulaire officiel</option>
              <option value="redaction">Rédaction document</option>
              <option value="impression">Impression / scan / reliure</option>
              <option value="autre">Autre</option>
            </Select>
            <Select
              label="Délai souhaité"
              value={getStr(details, "delai")}
              onChange={(e) => onChange("delai", e.target.value)}
            >
              <option value="">— Choisir —</option>
              <option value="24h">Sous 24h</option>
              <option value="48h">Sous 48h</option>
              <option value="semaine">Dans la semaine</option>
              <option value="flexible">Flexible</option>
            </Select>
            <div className="sm:col-span-2">
              <Input
                label="Besoin exact"
                placeholder="ex : traduire un relevé de notes + diplôme"
                value={getStr(details, "besoin")}
                onChange={(e) => onChange("besoin", e.target.value)}
              />
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
