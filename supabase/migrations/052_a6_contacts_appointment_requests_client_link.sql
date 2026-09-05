-- A6 Lot 2 : rattachement des boites de reception (contacts, appointment_requests)
-- vers l'entite personne canonique (clients). contact_demandes exclue : 0 ligne,
-- aucune route n'y ecrit (voir docs/DETTE.md).

ALTER TABLE contacts
  ADD COLUMN client_record_id uuid REFERENCES clients(id);

ALTER TABLE appointment_requests
  ADD COLUMN client_record_id uuid REFERENCES clients(id);

CREATE INDEX idx_contacts_client_record_id ON contacts(client_record_id);
CREATE INDEX idx_appointment_requests_client_record_id ON appointment_requests(client_record_id);
