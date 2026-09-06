-- P6-0 etape 4 : correction. calculate_payment_status() (057b) ne traduisait
-- que 'carte'->'card' et 'autre'->'other', laissant especes/virement tels
-- quels. Or les 3 paiements reels ont method='cash' (backfill du
-- 04/05/2026), pas 'especes' -- un nouveau paiement en especes aurait donc
-- cree exactement la meme fragmentation de vocabulaire que P6-0 corrige.
-- Traduction complete vers l'ensemble anglais deja utilise par les
-- donnees reelles.

CREATE OR REPLACE FUNCTION calculate_payment_status()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
begin
  if new.montant_total is null then
    return new;
  end if;

  if new.statut in ('rembourse', 'annule') then
    return new;
  end if;

  if new.montant_recu <= 0 then
    new.statut = 'non_paye';
    new.status = 'pending';
  elsif new.montant_recu >= new.montant_total then
    new.statut = 'paye';
    new.montant_recu = new.montant_total;
    new.status = 'paid';
  else
    new.statut = 'partiel';
    new.status = 'partial';
  end if;

  new.amount = new.montant_recu;
  new.amount_xaf = new.montant_recu;
  new.currency = coalesce(new.devise, 'XAF');

  new.method = case new.mode_paiement
    when 'especes'  then 'cash'::payment_method
    when 'virement' then 'bank_transfer'::payment_method
    when 'carte'    then 'card'::payment_method
    when 'autre'    then 'other'::payment_method
    else new.mode_paiement
  end;

  return new;
end;
$function$;
