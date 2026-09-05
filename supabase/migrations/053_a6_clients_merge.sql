-- A6 Lot 3 : dedoublonnage. Fusion toujours humaine, jamais automatique
-- (voir docs/AUDIT_CRM.md). Aucune suppression : la fiche absorbee reste
-- en base, marquee par merged_into_id, reversible.

ALTER TABLE clients
  ADD COLUMN merged_into_id uuid REFERENCES clients(id);

CREATE INDEX idx_clients_merged_into_id ON clients(merged_into_id);
