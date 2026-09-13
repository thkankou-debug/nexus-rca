-- ============================================================================
-- 039 — INDEX SUR LES 42 CLÉS ÉTRANGÈRES NON COUVERTES (P1c point 3)
-- Purement additif, aucun risque fonctionnel. Liste extraite directement de
-- pg_constraint/pg_index (pas de l'advisor en langage naturel), vérifiée à
-- 42 lignes exactement, cohérente avec l'audit P0.
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_appointment_requests_assigned_to ON public.appointment_requests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_appointments_cancelled_by ON public.appointments(cancelled_by);
CREATE INDEX IF NOT EXISTS idx_appointments_confirmed_by ON public.appointments(confirmed_by);
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON public.clients(created_by);
CREATE INDEX IF NOT EXISTS idx_company_documents_uploaded_by ON public.company_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_contact_demandes_traite_par ON public.contact_demandes(traite_par);
CREATE INDEX IF NOT EXISTS idx_contact_demandes_user_id ON public.contact_demandes(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_processed_by ON public.contacts(processed_by);
CREATE INDEX IF NOT EXISTS idx_demande_documents_uploaded_by ON public.demande_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_demande_documents_requests_fulfilled_by_document_id ON public.demande_documents_requests(fulfilled_by_document_id);
CREATE INDEX IF NOT EXISTS idx_demande_documents_requests_requested_by ON public.demande_documents_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_demande_messages_author_id ON public.demande_messages(author_id);
CREATE INDEX IF NOT EXISTS idx_demande_notes_author_id ON public.demande_notes(author_id);
CREATE INDEX IF NOT EXISTS idx_demande_status_history_changed_by ON public.demande_status_history(changed_by);
CREATE INDEX IF NOT EXISTS idx_employee_notes_created_by ON public.employee_notes(created_by);
CREATE INDEX IF NOT EXISTS idx_employee_onboarding_created_by ON public.employee_onboarding(created_by);
CREATE INDEX IF NOT EXISTS idx_employee_onboarding_template_id ON public.employee_onboarding(template_id);
CREATE INDEX IF NOT EXISTS idx_expenses_validated_by ON public.expenses(validated_by);
CREATE INDEX IF NOT EXISTS idx_hr_documents_uploaded_by ON public.hr_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_leave_balances_leave_type_id ON public.leave_balances(leave_type_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_leave_type_id ON public.leave_requests(leave_type_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_requested_by ON public.leave_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_leave_requests_reviewed_by ON public.leave_requests(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_generated_by ON public.monthly_reports(generated_by);
CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_completed_by ON public.onboarding_tasks(completed_by);
CREATE INDEX IF NOT EXISTS idx_onboarding_templates_created_by ON public.onboarding_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_payment_links_appointment_id ON public.payment_links(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_created_by ON public.payment_links(created_by);
CREATE INDEX IF NOT EXISTS idx_payment_links_demande_id ON public.payment_links(demande_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_payment_id ON public.payment_links(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_verified_by ON public.payment_links(verified_by);
CREATE INDEX IF NOT EXISTS idx_payslip_validation_history_performed_by ON public.payslip_validation_history(performed_by);
CREATE INDEX IF NOT EXISTS idx_payslips_created_by ON public.payslips(created_by);
CREATE INDEX IF NOT EXISTS idx_payslips_validated_by ON public.payslips(validated_by);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_manager_id ON public.performance_reviews(manager_id);
CREATE INDEX IF NOT EXISTS idx_quick_sales_created_by ON public.quick_sales(created_by);
CREATE INDEX IF NOT EXISTS idx_rendez_vous_client_id ON public.rendez_vous(client_id);
CREATE INDEX IF NOT EXISTS idx_rendez_vous_demande_id ON public.rendez_vous(demande_id);
CREATE INDEX IF NOT EXISTS idx_review_periods_created_by ON public.review_periods(created_by);
CREATE INDEX IF NOT EXISTS idx_rh_settings_updated_by ON public.rh_settings(updated_by);
CREATE INDEX IF NOT EXISTS idx_transferts_created_by ON public.transferts(created_by);
CREATE INDEX IF NOT EXISTS idx_transferts_validated_by ON public.transferts(validated_by);
