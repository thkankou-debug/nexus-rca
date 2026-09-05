export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      affectations_hist: {
        Row: {
          changed_by: string | null
          created_at: string
          demande_id: string
          id: string
          new_agent_id: string | null
          previous_agent_id: string | null
          reason: string | null
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          demande_id: string
          id?: string
          new_agent_id?: string | null
          previous_agent_id?: string | null
          reason?: string | null
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          demande_id?: string
          id?: string
          new_agent_id?: string | null
          previous_agent_id?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affectations_hist_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affectations_hist_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affectations_hist_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes_avec_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affectations_hist_new_agent_id_fkey"
            columns: ["new_agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affectations_hist_previous_agent_id_fkey"
            columns: ["previous_agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_settings: {
        Row: {
          cle: string
          id: string
          updated_at: string
          updated_by: string | null
          valeur: Json
        }
        Insert: {
          cle: string
          id?: string
          updated_at?: string
          updated_by?: string | null
          valeur?: Json
        }
        Update: {
          cle?: string
          id?: string
          updated_at?: string
          updated_by?: string | null
          valeur?: Json
        }
        Relationships: [
          {
            foreignKeyName: "agency_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_requests: {
        Row: {
          admin_notes: string | null
          alternative_availability: string | null
          appointment_object: string
          assigned_to: string | null
          city: string
          consent_accuracy: boolean
          consent_contact: boolean
          consent_validation: boolean
          country: string
          created_at: string
          duration: string
          email: string
          file_number: string | null
          full_name: string
          has_documents_ready: string | null
          has_existing_file: string | null
          id: string
          language: string | null
          meeting_type: string
          phone: string
          preferred_date: string
          preferred_time: string
          reference: string | null
          service: string
          situation: string
          specific_subject: string
          status: string
          timezone: string | null
          updated_at: string
          urgency: string
        }
        Insert: {
          admin_notes?: string | null
          alternative_availability?: string | null
          appointment_object: string
          assigned_to?: string | null
          city: string
          consent_accuracy?: boolean
          consent_contact?: boolean
          consent_validation?: boolean
          country: string
          created_at?: string
          duration?: string
          email: string
          file_number?: string | null
          full_name: string
          has_documents_ready?: string | null
          has_existing_file?: string | null
          id?: string
          language?: string | null
          meeting_type: string
          phone: string
          preferred_date: string
          preferred_time: string
          reference?: string | null
          service: string
          situation: string
          specific_subject: string
          status?: string
          timezone?: string | null
          updated_at?: string
          urgency?: string
        }
        Update: {
          admin_notes?: string | null
          alternative_availability?: string | null
          appointment_object?: string
          assigned_to?: string | null
          city?: string
          consent_accuracy?: boolean
          consent_contact?: boolean
          consent_validation?: boolean
          country?: string
          created_at?: string
          duration?: string
          email?: string
          file_number?: string | null
          full_name?: string
          has_documents_ready?: string | null
          has_existing_file?: string | null
          id?: string
          language?: string | null
          meeting_type?: string
          phone?: string
          preferred_date?: string
          preferred_time?: string
          reference?: string | null
          service?: string
          situation?: string
          specific_subject?: string
          status?: string
          timezone?: string | null
          updated_at?: string
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_requests_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          agent_id: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          client_email: string
          client_id: string | null
          client_nom: string
          client_telephone: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          duree_minutes: number
          id: string
          notes_agent: string | null
          notes_client: string | null
          rdv_date: string
          rdv_heure: string
          reference: string | null
          service_type: string
          statut: string
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_email: string
          client_id?: string | null
          client_nom: string
          client_telephone?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          duree_minutes?: number
          id?: string
          notes_agent?: string | null
          notes_client?: string | null
          rdv_date: string
          rdv_heure: string
          reference?: string | null
          service_type: string
          statut?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_email?: string
          client_id?: string | null
          client_nom?: string
          client_telephone?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          duree_minutes?: number
          id?: string
          notes_agent?: string | null
          notes_client?: string | null
          rdv_date?: string
          rdv_heure?: string
          reference?: string | null
          service_type?: string
          statut?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_value: Json | null
          old_value: Json | null
          user_agent: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bureaux: {
        Row: {
          adresse: string
          created_at: string
          email: string | null
          horaires: string | null
          id: string
          nom: string
          pays: string
          status: string
          telephone: string | null
          updated_at: string
          ville: string
        }
        Insert: {
          adresse: string
          created_at?: string
          email?: string | null
          horaires?: string | null
          id?: string
          nom: string
          pays: string
          status?: string
          telephone?: string | null
          updated_at?: string
          ville: string
        }
        Update: {
          adresse?: string
          created_at?: string
          email?: string | null
          horaires?: string | null
          id?: string
          nom?: string
          pays?: string
          status?: string
          telephone?: string | null
          updated_at?: string
          ville?: string
        }
        Relationships: []
      }
      caisse_sessions: {
        Row: {
          actual_balance: number | null
          agent_id: string
          closed_at: string | null
          created_at: string
          discrepancy: number | null
          expected_balance: number | null
          id: string
          notes: string | null
          opened_at: string
          opening_balance: number
          status: string
        }
        Insert: {
          actual_balance?: number | null
          agent_id: string
          closed_at?: string | null
          created_at?: string
          discrepancy?: number | null
          expected_balance?: number | null
          id?: string
          notes?: string | null
          opened_at?: string
          opening_balance?: number
          status?: string
        }
        Update: {
          actual_balance?: number | null
          agent_id?: string
          closed_at?: string | null
          created_at?: string
          discrepancy?: number | null
          expected_balance?: number | null
          id?: string
          notes?: string | null
          opened_at?: string
          opening_balance?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "caisse_sessions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories_compta: {
        Row: {
          code: string
          created_at: string
          id: string
          label: string
          status: string
          type: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          label: string
          status?: string
          type: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          label?: string
          status?: string
          type?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          actif: boolean
          adresse: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          nom: string
          notes: string | null
          numero_identification: string | null
          pays: string | null
          prenom: string | null
          profile_id: string | null
          raison_sociale: string | null
          reference: string | null
          telephone: string | null
          telephone_2: string | null
          type: Database["public"]["Enums"]["client_type"]
          updated_at: string
          ville: string | null
        }
        Insert: {
          actif?: boolean
          adresse?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          nom: string
          notes?: string | null
          numero_identification?: string | null
          pays?: string | null
          prenom?: string | null
          profile_id?: string | null
          raison_sociale?: string | null
          reference?: string | null
          telephone?: string | null
          telephone_2?: string | null
          type?: Database["public"]["Enums"]["client_type"]
          updated_at?: string
          ville?: string | null
        }
        Update: {
          actif?: boolean
          adresse?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          nom?: string
          notes?: string | null
          numero_identification?: string | null
          pays?: string | null
          prenom?: string | null
          profile_id?: string | null
          raison_sociale?: string | null
          reference?: string | null
          telephone?: string | null
          telephone_2?: string | null
          type?: Database["public"]["Enums"]["client_type"]
          updated_at?: string
          ville?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          agent_id: string
          amount: number
          created_at: string
          demande_id: string | null
          id: string
          payment_id: string | null
          rate: number | null
          status: string
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          agent_id: string
          amount: number
          created_at?: string
          demande_id?: string | null
          id?: string
          payment_id?: string | null
          rate?: number | null
          status?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          agent_id?: string
          amount?: number
          created_at?: string
          demande_id?: string | null
          id?: string
          payment_id?: string | null
          rate?: number | null
          status?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes_avec_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments_with_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_documents: {
        Row: {
          created_at: string
          description: string | null
          file_size_bytes: number | null
          id: string
          mime_type: string | null
          name: string
          storage_path: string
          type: string
          updated_at: string
          uploaded_by: string | null
          version: string | null
          visible_to: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          name: string
          storage_path: string
          type: string
          updated_at?: string
          uploaded_by?: string | null
          version?: string | null
          visible_to?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          name?: string
          storage_path?: string
          type?: string
          updated_at?: string
          uploaded_by?: string | null
          version?: string | null
          visible_to?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_demandes: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_address: string | null
          message: string
          nom_complet: string
          notes_admin: string | null
          organisation: string | null
          statut: string
          telephone: string | null
          traite_at: string | null
          traite_par: string | null
          type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
          message: string
          nom_complet: string
          notes_admin?: string | null
          organisation?: string | null
          statut?: string
          telephone?: string | null
          traite_at?: string | null
          traite_par?: string | null
          type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          message?: string
          nom_complet?: string
          notes_admin?: string | null
          organisation?: string | null
          statut?: string
          telephone?: string | null
          traite_at?: string | null
          traite_par?: string | null
          type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string
          email: string
          id: string
          ip: string | null
          message: string
          nom: string
          notes_internes: string | null
          processed_at: string | null
          processed_by: string | null
          reference: string | null
          source: string | null
          status: string
          sujet: string
          telephone: string | null
          traite: boolean | null
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip?: string | null
          message: string
          nom: string
          notes_internes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reference?: string | null
          source?: string | null
          status?: string
          sujet: string
          telephone?: string | null
          traite?: boolean | null
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip?: string | null
          message?: string
          nom?: string
          notes_internes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reference?: string | null
          source?: string | null
          status?: string
          sujet?: string
          telephone?: string | null
          traite?: boolean | null
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contenus_site: {
        Row: {
          cle: string
          contenu: Json
          created_at: string
          id: string
          section: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          cle: string
          contenu?: Json
          created_at?: string
          id?: string
          section: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          cle?: string
          contenu?: Json
          created_at?: string
          id?: string
          section?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contenus_site_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      demande_documents: {
        Row: {
          categorie: string | null
          created_at: string
          demande_id: string
          file_name: string
          file_size_bytes: number
          id: string
          mime_type: string
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          categorie?: string | null
          created_at?: string
          demande_id: string
          file_name: string
          file_size_bytes: number
          id?: string
          mime_type: string
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          categorie?: string | null
          created_at?: string
          demande_id?: string
          file_name?: string
          file_size_bytes?: number
          id?: string
          mime_type?: string
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "demande_documents_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demande_documents_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes_avec_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demande_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      demande_documents_requests: {
        Row: {
          created_at: string
          demande_id: string
          description: string | null
          fulfilled_at: string | null
          fulfilled_by_document_id: string | null
          id: string
          requested_by: string | null
          statut: string
          type_document: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          demande_id: string
          description?: string | null
          fulfilled_at?: string | null
          fulfilled_by_document_id?: string | null
          id?: string
          requested_by?: string | null
          statut?: string
          type_document: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          demande_id?: string
          description?: string | null
          fulfilled_at?: string | null
          fulfilled_by_document_id?: string | null
          id?: string
          requested_by?: string | null
          statut?: string
          type_document?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "demande_documents_requests_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demande_documents_requests_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes_avec_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demande_documents_requests_fulfilled_by_document_id_fkey"
            columns: ["fulfilled_by_document_id"]
            isOneToOne: false
            referencedRelation: "demande_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demande_documents_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      demande_messages: {
        Row: {
          author_id: string | null
          author_name: string
          author_role: string
          content: string
          created_at: string
          demande_id: string
          id: string
          read_by_recipient: boolean
        }
        Insert: {
          author_id?: string | null
          author_name: string
          author_role: string
          content: string
          created_at?: string
          demande_id: string
          id?: string
          read_by_recipient?: boolean
        }
        Update: {
          author_id?: string | null
          author_name?: string
          author_role?: string
          content?: string
          created_at?: string
          demande_id?: string
          id?: string
          read_by_recipient?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "demande_messages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demande_messages_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demande_messages_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes_avec_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      demande_notes: {
        Row: {
          author_id: string | null
          author_name: string
          author_role: string
          content: string
          created_at: string
          demande_id: string
          id: string
        }
        Insert: {
          author_id?: string | null
          author_name: string
          author_role: string
          content: string
          created_at?: string
          demande_id: string
          id?: string
        }
        Update: {
          author_id?: string | null
          author_name?: string
          author_role?: string
          content?: string
          created_at?: string
          demande_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "demande_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demande_notes_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demande_notes_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes_avec_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      demande_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          demande_id: string
          id: string
          notes: string | null
          step: number
          step_label: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          demande_id: string
          id?: string
          notes?: string | null
          step: number
          step_label: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          demande_id?: string
          id?: string
          notes?: string | null
          step?: number
          step_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "demande_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demande_status_history_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demande_status_history_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes_avec_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      demandes: {
        Row: {
          adresse: string | null
          agent_id: string | null
          amount_estimated: number | null
          archived_at: string | null
          budget_estimatif: string | null
          categorie_demande: string | null
          categorie_dossier: string | null
          client_id: string | null
          client_record_id: string | null
          consentement_documents: boolean
          consentement_examen: boolean
          consentement_recontact: boolean
          created_at: string
          current_step: number | null
          current_step_label: string | null
          date_naissance: string | null
          date_souhaitee: string | null
          deadline: string | null
          description: string
          destination: string | null
          details_service: Json
          dossier_existant: boolean | null
          email: string
          employeur: string | null
          id: string
          informations_complementaires: string | null
          langue_preferee: string | null
          nationalite: string | null
          niveau_etudes: string | null
          nom_complet: string
          notes_internes: string | null
          numero_dossier_existant: string | null
          objet: string | null
          pays: string
          pays_concerne: string | null
          profession: string | null
          reference: string | null
          service: string
          service_id: string | null
          sexe: string | null
          situation_matrimoniale: string | null
          source: string | null
          statut: Database["public"]["Enums"]["demande_status"]
          telephone: string
          traitement_prioritaire: boolean
          type_procedure: string | null
          updated_at: string
          urgence: Database["public"]["Enums"]["urgence_level"]
          ville: string | null
        }
        Insert: {
          adresse?: string | null
          agent_id?: string | null
          amount_estimated?: number | null
          archived_at?: string | null
          budget_estimatif?: string | null
          categorie_demande?: string | null
          categorie_dossier?: string | null
          client_id?: string | null
          client_record_id?: string | null
          consentement_documents?: boolean
          consentement_examen?: boolean
          consentement_recontact?: boolean
          created_at?: string
          current_step?: number | null
          current_step_label?: string | null
          date_naissance?: string | null
          date_souhaitee?: string | null
          deadline?: string | null
          description: string
          destination?: string | null
          details_service?: Json
          dossier_existant?: boolean | null
          email: string
          employeur?: string | null
          id?: string
          informations_complementaires?: string | null
          langue_preferee?: string | null
          nationalite?: string | null
          niveau_etudes?: string | null
          nom_complet: string
          notes_internes?: string | null
          numero_dossier_existant?: string | null
          objet?: string | null
          pays: string
          pays_concerne?: string | null
          profession?: string | null
          reference?: string | null
          service: string
          service_id?: string | null
          sexe?: string | null
          situation_matrimoniale?: string | null
          source?: string | null
          statut?: Database["public"]["Enums"]["demande_status"]
          telephone: string
          traitement_prioritaire?: boolean
          type_procedure?: string | null
          updated_at?: string
          urgence?: Database["public"]["Enums"]["urgence_level"]
          ville?: string | null
        }
        Update: {
          adresse?: string | null
          agent_id?: string | null
          amount_estimated?: number | null
          archived_at?: string | null
          budget_estimatif?: string | null
          categorie_demande?: string | null
          categorie_dossier?: string | null
          client_id?: string | null
          client_record_id?: string | null
          consentement_documents?: boolean
          consentement_examen?: boolean
          consentement_recontact?: boolean
          created_at?: string
          current_step?: number | null
          current_step_label?: string | null
          date_naissance?: string | null
          date_souhaitee?: string | null
          deadline?: string | null
          description?: string
          destination?: string | null
          details_service?: Json
          dossier_existant?: boolean | null
          email?: string
          employeur?: string | null
          id?: string
          informations_complementaires?: string | null
          langue_preferee?: string | null
          nationalite?: string | null
          niveau_etudes?: string | null
          nom_complet?: string
          notes_internes?: string | null
          numero_dossier_existant?: string | null
          objet?: string | null
          pays?: string
          pays_concerne?: string | null
          profession?: string | null
          reference?: string | null
          service?: string
          service_id?: string | null
          sexe?: string | null
          situation_matrimoniale?: string | null
          source?: string | null
          statut?: Database["public"]["Enums"]["demande_status"]
          telephone?: string
          traitement_prioritaire?: boolean
          type_procedure?: string | null
          updated_at?: string
          urgence?: Database["public"]["Enums"]["urgence_level"]
          ville?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "demandes_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demandes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demandes_client_record_id_fkey"
            columns: ["client_record_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demandes_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      devis: {
        Row: {
          accepted_at: string | null
          amount: number
          client_record_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          demande_id: string | null
          id: string
          reference: string | null
          sent_at: string | null
          status: string
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          accepted_at?: string | null
          amount?: number
          client_record_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          demande_id?: string | null
          id?: string
          reference?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          accepted_at?: string | null
          amount?: number
          client_record_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          demande_id?: string | null
          id?: string
          reference?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "devis_client_record_id_fkey"
            columns: ["client_record_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devis_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devis_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devis_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes_avec_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      devis_lignes: {
        Row: {
          amount: number
          description: string
          devis_id: string
          id: string
          ordre: number
          quantity: number
          unit_price: number
        }
        Insert: {
          amount?: number
          description: string
          devis_id: string
          id?: string
          ordre?: number
          quantity?: number
          unit_price?: number
        }
        Update: {
          amount?: number
          description?: string
          devis_id?: string
          id?: string
          ordre?: number
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "devis_lignes_devis_id_fkey"
            columns: ["devis_id"]
            isOneToOne: false
            referencedRelation: "devis"
            referencedColumns: ["id"]
          },
        ]
      }
      documents_requis: {
        Row: {
          created_at: string
          description: string | null
          id: string
          nom: string
          obligatoire: boolean
          ordre_affichage: number
          service_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          nom: string
          obligatoire?: boolean
          ordre_affichage?: number
          service_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          nom?: string
          obligatoire?: boolean
          ordre_affichage?: number
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_requis_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      dossier_etapes: {
        Row: {
          code: string
          created_at: string
          id: string
          label: string
          ordre: number
          service_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          label: string
          ordre?: number
          service_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          label?: string
          ordre?: number
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dossier_etapes_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      dossier_partages: {
        Row: {
          created_at: string
          demande_id: string
          id: string
          partenaire_id: string
          shared_by: string | null
        }
        Insert: {
          created_at?: string
          demande_id: string
          id?: string
          partenaire_id: string
          shared_by?: string | null
        }
        Update: {
          created_at?: string
          demande_id?: string
          id?: string
          partenaire_id?: string
          shared_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dossier_partages_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dossier_partages_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes_avec_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dossier_partages_partenaire_id_fkey"
            columns: ["partenaire_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dossier_partages_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      echeanciers: {
        Row: {
          amount: number
          created_at: string
          demande_id: string | null
          due_date: string
          facture_id: string | null
          id: string
          paid_at: string | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          demande_id?: string | null
          due_date: string
          facture_id?: string | null
          id?: string
          paid_at?: string | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          demande_id?: string | null
          due_date?: string
          facture_id?: string | null
          id?: string
          paid_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "echeanciers_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "echeanciers_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes_avec_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "echeanciers_facture_id_fkey"
            columns: ["facture_id"]
            isOneToOne: false
            referencedRelation: "factures"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_notes: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          employee_id: string
          id: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          employee_id: string
          id?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          employee_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_notes_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_onboarding: {
        Row: {
          completed_at: string | null
          completion_pct: number
          created_at: string
          created_by: string | null
          employee_id: string
          id: string
          notes: string | null
          started_at: string
          template_id: string | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          completion_pct?: number
          created_at?: string
          created_by?: string | null
          employee_id: string
          id?: string
          notes?: string | null
          started_at?: string
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          completion_pct?: number
          created_at?: string
          created_by?: string | null
          employee_id?: string
          id?: string
          notes?: string | null
          started_at?: string
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_onboarding_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_onboarding_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_onboarding_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "onboarding_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          adresse: string | null
          created_at: string
          date_embauche: string
          date_naissance: string | null
          departement: string
          email: string
          frequence_paie: string
          id: string
          nom_complet: string
          notes_internes: string | null
          numero_cni: string | null
          poste: string
          profile_id: string | null
          salaire_base: number
          statut: string
          telephone: string | null
          type_contrat: string | null
          updated_at: string
        }
        Insert: {
          adresse?: string | null
          created_at?: string
          date_embauche: string
          date_naissance?: string | null
          departement: string
          email: string
          frequence_paie?: string
          id?: string
          nom_complet: string
          notes_internes?: string | null
          numero_cni?: string | null
          poste: string
          profile_id?: string | null
          salaire_base: number
          statut?: string
          telephone?: string | null
          type_contrat?: string | null
          updated_at?: string
        }
        Update: {
          adresse?: string | null
          created_at?: string
          date_embauche?: string
          date_naissance?: string | null
          departement?: string
          email?: string
          frequence_paie?: string
          id?: string
          nom_complet?: string
          notes_internes?: string | null
          numero_cni?: string | null
          poste?: string
          profile_id?: string | null
          salaire_base?: number
          statut?: string
          telephone?: string | null
          type_contrat?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          categorie: Database["public"]["Enums"]["expense_category"]
          created_at: string
          date_depense: string
          devise: string
          employee_id: string | null
          employee_nom: string
          fournisseur: string | null
          id: string
          mode_paiement: Database["public"]["Enums"]["payment_method"]
          montant: number
          motif: string
          motif_rejet: string | null
          notes_internes: string | null
          preuve_nom: string | null
          preuve_path: string | null
          reference: string | null
          statut: Database["public"]["Enums"]["expense_status"]
          updated_at: string
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          categorie?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          date_depense: string
          devise?: string
          employee_id?: string | null
          employee_nom: string
          fournisseur?: string | null
          id?: string
          mode_paiement?: Database["public"]["Enums"]["payment_method"]
          montant: number
          motif: string
          motif_rejet?: string | null
          notes_internes?: string | null
          preuve_nom?: string | null
          preuve_path?: string | null
          reference?: string | null
          statut?: Database["public"]["Enums"]["expense_status"]
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          categorie?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          date_depense?: string
          devise?: string
          employee_id?: string | null
          employee_nom?: string
          fournisseur?: string | null
          id?: string
          mode_paiement?: Database["public"]["Enums"]["payment_method"]
          montant?: number
          motif?: string
          motif_rejet?: string | null
          notes_internes?: string | null
          preuve_nom?: string | null
          preuve_path?: string | null
          reference?: string | null
          statut?: Database["public"]["Enums"]["expense_status"]
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      facture_lignes: {
        Row: {
          amount: number
          description: string
          facture_id: string
          id: string
          ordre: number
          quantity: number
          unit_price: number
        }
        Insert: {
          amount?: number
          description: string
          facture_id: string
          id?: string
          ordre?: number
          quantity?: number
          unit_price?: number
        }
        Update: {
          amount?: number
          description?: string
          facture_id?: string
          id?: string
          ordre?: number
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "facture_lignes_facture_id_fkey"
            columns: ["facture_id"]
            isOneToOne: false
            referencedRelation: "factures"
            referencedColumns: ["id"]
          },
        ]
      }
      factures: {
        Row: {
          amount: number
          client_record_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          demande_id: string | null
          devis_id: string | null
          due_date: string | null
          id: string
          reference: string | null
          status: string
          updated_at: string
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          amount?: number
          client_record_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          demande_id?: string | null
          devis_id?: string | null
          due_date?: string | null
          id?: string
          reference?: string | null
          status?: string
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          amount?: number
          client_record_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          demande_id?: string | null
          devis_id?: string | null
          due_date?: string | null
          id?: string
          reference?: string | null
          status?: string
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "factures_client_record_id_fkey"
            columns: ["client_record_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "factures_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "factures_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "factures_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes_avec_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "factures_devis_id_fkey"
            columns: ["devis_id"]
            isOneToOne: false
            referencedRelation: "devis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "factures_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      faq: {
        Row: {
          categorie: string | null
          created_at: string
          id: string
          ordre_affichage: number
          question: string
          reponse: string
          status: string
          updated_at: string
        }
        Insert: {
          categorie?: string | null
          created_at?: string
          id?: string
          ordre_affichage?: number
          question: string
          reponse: string
          status?: string
          updated_at?: string
        }
        Update: {
          categorie?: string | null
          created_at?: string
          id?: string
          ordre_affichage?: number
          question?: string
          reponse?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      holidays_car: {
        Row: {
          created_at: string
          date: string
          fixed: boolean
          id: string
          label: string
          year: number
        }
        Insert: {
          created_at?: string
          date: string
          fixed?: boolean
          id?: string
          label: string
          year: number
        }
        Update: {
          created_at?: string
          date?: string
          fixed?: boolean
          id?: string
          label?: string
          year?: number
        }
        Relationships: []
      }
      hr_documents: {
        Row: {
          created_at: string
          description: string | null
          employee_id: string
          file_size_bytes: number | null
          id: string
          mime_type: string | null
          nom: string
          storage_path: string
          subcategory: string | null
          type: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          employee_id: string
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          nom: string
          storage_path: string
          subcategory?: string | null
          type: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          employee_id?: string
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          nom?: string
          storage_path?: string
          subcategory?: string | null
          type?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_quotes: {
        Row: {
          agent_id: string | null
          comments: string | null
          country_residence: string | null
          coverage_types: Json | null
          created_at: string
          date_depart: string | null
          date_retour: string | null
          destination: string
          duration_days: number | null
          email: string
          estimate_currency: string | null
          estimate_max: number | null
          estimate_min: number | null
          full_name: string
          id: string
          num_travelers: number
          reference: string
          source_ip: string | null
          source_url: string | null
          status: string
          traveler_ages: Json | null
          updated_at: string
          urgency: string
          user_agent: string | null
          visa_certificate_required: boolean | null
          whatsapp: string
        }
        Insert: {
          agent_id?: string | null
          comments?: string | null
          country_residence?: string | null
          coverage_types?: Json | null
          created_at?: string
          date_depart?: string | null
          date_retour?: string | null
          destination: string
          duration_days?: number | null
          email: string
          estimate_currency?: string | null
          estimate_max?: number | null
          estimate_min?: number | null
          full_name: string
          id?: string
          num_travelers?: number
          reference: string
          source_ip?: string | null
          source_url?: string | null
          status?: string
          traveler_ages?: Json | null
          updated_at?: string
          urgency?: string
          user_agent?: string | null
          visa_certificate_required?: boolean | null
          whatsapp: string
        }
        Update: {
          agent_id?: string | null
          comments?: string | null
          country_residence?: string | null
          coverage_types?: Json | null
          created_at?: string
          date_depart?: string | null
          date_retour?: string | null
          destination?: string
          duration_days?: number | null
          email?: string
          estimate_currency?: string | null
          estimate_max?: number | null
          estimate_min?: number | null
          full_name?: string
          id?: string
          num_travelers?: number
          reference?: string
          source_ip?: string | null
          source_url?: string | null
          status?: string
          traveler_ages?: Json | null
          updated_at?: string
          urgency?: string
          user_agent?: string | null
          visa_certificate_required?: boolean | null
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_quotes_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_balances: {
        Row: {
          acquired_days: number
          created_at: string
          employee_id: string
          id: string
          leave_type_id: string
          updated_at: string
          used_days: number
          year: number
        }
        Insert: {
          acquired_days?: number
          created_at?: string
          employee_id: string
          id?: string
          leave_type_id: string
          updated_at?: string
          used_days?: number
          year: number
        }
        Update: {
          acquired_days?: number
          created_at?: string
          employee_id?: string
          id?: string
          leave_type_id?: string
          updated_at?: string
          used_days?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "leave_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_balances_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          created_at: string
          doc_url: string | null
          employee_id: string
          end_date: string
          half_day_end: boolean
          half_day_start: boolean
          id: string
          leave_type_id: string
          reason: string | null
          requested_at: string
          requested_by: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          start_date: string
          statut: string
          total_days: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          doc_url?: string | null
          employee_id: string
          end_date: string
          half_day_end?: boolean
          half_day_start?: boolean
          id?: string
          leave_type_id: string
          reason?: string | null
          requested_at?: string
          requested_by?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date: string
          statut?: string
          total_days: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          doc_url?: string | null
          employee_id?: string
          end_date?: string
          half_day_end?: boolean
          half_day_start?: boolean
          id?: string
          leave_type_id?: string
          reason?: string | null
          requested_at?: string
          requested_by?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date?: string
          statut?: string
          total_days?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_types: {
        Row: {
          active: boolean
          code: string
          color_hex: string
          created_at: string
          id: string
          label: string
          max_days_year: number
          paid: boolean
          requires_doc: boolean
        }
        Insert: {
          active?: boolean
          code: string
          color_hex?: string
          created_at?: string
          id?: string
          label: string
          max_days_year?: number
          paid?: boolean
          requires_doc?: boolean
        }
        Update: {
          active?: boolean
          code?: string
          color_hex?: string
          created_at?: string
          id?: string
          label?: string
          max_days_year?: number
          paid?: boolean
          requires_doc?: boolean
        }
        Relationships: []
      }
      monthly_reports: {
        Row: {
          error_message: string | null
          file_size_bytes: number | null
          generated_at: string
          generated_by: string | null
          id: string
          metrics: Json
          period_end: string
          period_month: number
          period_start: string
          period_year: number
          recipients: string[]
          status: string
          storage_path: string | null
          trigger: string
        }
        Insert: {
          error_message?: string | null
          file_size_bytes?: number | null
          generated_at?: string
          generated_by?: string | null
          id?: string
          metrics?: Json
          period_end: string
          period_month: number
          period_start: string
          period_year: number
          recipients?: string[]
          status: string
          storage_path?: string | null
          trigger: string
        }
        Update: {
          error_message?: string | null
          file_size_bytes?: number | null
          generated_at?: string
          generated_by?: string | null
          id?: string
          metrics?: Json
          period_end?: string
          period_month?: number
          period_start?: string
          period_year?: number
          recipients?: string[]
          status?: string
          storage_path?: string | null
          trigger?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_prefs: {
        Row: {
          created_at: string
          email_enabled: boolean
          id: string
          push_enabled: boolean
          sms_enabled: boolean
          updated_at: string
          user_id: string
          whatsapp_enabled: boolean
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean
          id?: string
          push_enabled?: boolean
          sms_enabled?: boolean
          updated_at?: string
          user_id: string
          whatsapp_enabled?: boolean
        }
        Update: {
          created_at?: string
          email_enabled?: boolean
          id?: string
          push_enabled?: boolean
          sms_enabled?: boolean
          updated_at?: string
          user_id?: string
          whatsapp_enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "notification_prefs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          category: string | null
          created_at: string
          id: string
          link: string | null
          message: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_tasks: {
        Row: {
          category: string
          completed_at: string | null
          completed_by: string | null
          created_at: string
          description: string | null
          due_date: string | null
          employee_onboarding_id: string
          id: string
          label: string
          mandatory: boolean
          notes: string | null
          task_order: number
          updated_at: string
        }
        Insert: {
          category?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          employee_onboarding_id: string
          id?: string
          label: string
          mandatory?: boolean
          notes?: string | null
          task_order?: number
          updated_at?: string
        }
        Update: {
          category?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          employee_onboarding_id?: string
          id?: string
          label?: string
          mandatory?: boolean
          notes?: string | null
          task_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_tasks_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_tasks_employee_onboarding_id_fkey"
            columns: ["employee_onboarding_id"]
            isOneToOne: false
            referencedRelation: "employee_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_templates: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          default_tasks: Json
          description: string | null
          id: string
          name: string
          type_contrat: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          default_tasks?: Json
          description?: string | null
          id?: string
          name: string
          type_contrat?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          default_tasks?: Json
          description?: string | null
          id?: string
          name?: string
          type_contrat?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partenaires: {
        Row: {
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          nom: string
          ordre_affichage: number
          site_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          nom: string
          ordre_affichage?: number
          site_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          nom?: string
          ordre_affichage?: number
          site_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_events: {
        Row: {
          actor_id: string | null
          actor_kind: string
          created_at: string
          event_type: string
          from_status: Database["public"]["Enums"]["payment_status"] | null
          id: string
          payload: Json | null
          payment_id: string
          to_status: Database["public"]["Enums"]["payment_status"] | null
        }
        Insert: {
          actor_id?: string | null
          actor_kind?: string
          created_at?: string
          event_type: string
          from_status?: Database["public"]["Enums"]["payment_status"] | null
          id?: string
          payload?: Json | null
          payment_id: string
          to_status?: Database["public"]["Enums"]["payment_status"] | null
        }
        Update: {
          actor_id?: string | null
          actor_kind?: string
          created_at?: string
          event_type?: string
          from_status?: Database["public"]["Enums"]["payment_status"] | null
          id?: string
          payload?: Json | null
          payment_id?: string
          to_status?: Database["public"]["Enums"]["payment_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_events_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_events_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments_with_client"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_links: {
        Row: {
          appointment_id: string | null
          client_email: string
          client_id: string | null
          client_nom: string
          client_telephone: string | null
          created_at: string
          created_by: string | null
          demande_id: string | null
          description: string | null
          devise: string
          expires_at: string
          id: string
          methode_choisie: string | null
          montant: number
          notes_client: string | null
          notes_staff: string | null
          numero_transaction: string | null
          paid_declared_at: string | null
          payment_id: string | null
          public_token: string
          reference: string
          service: string
          statut: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          appointment_id?: string | null
          client_email: string
          client_id?: string | null
          client_nom: string
          client_telephone?: string | null
          created_at?: string
          created_by?: string | null
          demande_id?: string | null
          description?: string | null
          devise?: string
          expires_at?: string
          id?: string
          methode_choisie?: string | null
          montant: number
          notes_client?: string | null
          notes_staff?: string | null
          numero_transaction?: string | null
          paid_declared_at?: string | null
          payment_id?: string | null
          public_token?: string
          reference: string
          service: string
          statut?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          appointment_id?: string | null
          client_email?: string
          client_id?: string | null
          client_nom?: string
          client_telephone?: string | null
          created_at?: string
          created_by?: string | null
          demande_id?: string | null
          description?: string | null
          devise?: string
          expires_at?: string
          id?: string
          methode_choisie?: string | null
          montant?: number
          notes_client?: string | null
          notes_staff?: string | null
          numero_transaction?: string | null
          paid_declared_at?: string | null
          payment_id?: string | null
          public_token?: string
          reference?: string
          service?: string
          statut?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_links_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_links_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_links_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_links_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes_avec_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_links_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_links_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments_with_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_links_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          agent_id: string | null
          amount: number | null
          amount_xaf: number | null
          cash_receipt_no: string | null
          client_email: string | null
          client_id: string | null
          client_nom: string
          client_record_id: string | null
          client_telephone: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          date_paiement: string
          demande_id: string | null
          description: string | null
          devise: string
          dossier_id: string | null
          id: string
          metadata: Json | null
          method: Database["public"]["Enums"]["payment_method"] | null
          mode_paiement: Database["public"]["Enums"]["payment_method"]
          montant_recu: number
          montant_total: number
          notes_internes: string | null
          om_transaction_id: string | null
          paid_at: string | null
          preuve_nom: string | null
          preuve_path: string | null
          reference: string | null
          service: string
          status: Database["public"]["Enums"]["payment_status"] | null
          statut: Database["public"]["Enums"]["payment_status"]
          stripe_payment_id: string | null
          stripe_session_id: string | null
          updated_at: string
          validated_at: string | null
          validated_by: string | null
          voided_at: string | null
        }
        Insert: {
          agent_id?: string | null
          amount?: number | null
          amount_xaf?: number | null
          cash_receipt_no?: string | null
          client_email?: string | null
          client_id?: string | null
          client_nom: string
          client_record_id?: string | null
          client_telephone?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          date_paiement?: string
          demande_id?: string | null
          description?: string | null
          devise?: string
          dossier_id?: string | null
          id?: string
          metadata?: Json | null
          method?: Database["public"]["Enums"]["payment_method"] | null
          mode_paiement?: Database["public"]["Enums"]["payment_method"]
          montant_recu?: number
          montant_total: number
          notes_internes?: string | null
          om_transaction_id?: string | null
          paid_at?: string | null
          preuve_nom?: string | null
          preuve_path?: string | null
          reference?: string | null
          service: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          statut?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
          voided_at?: string | null
        }
        Update: {
          agent_id?: string | null
          amount?: number | null
          amount_xaf?: number | null
          cash_receipt_no?: string | null
          client_email?: string | null
          client_id?: string | null
          client_nom?: string
          client_record_id?: string | null
          client_telephone?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          date_paiement?: string
          demande_id?: string | null
          description?: string | null
          devise?: string
          dossier_id?: string | null
          id?: string
          metadata?: Json | null
          method?: Database["public"]["Enums"]["payment_method"] | null
          mode_paiement?: Database["public"]["Enums"]["payment_method"]
          montant_recu?: number
          montant_total?: number
          notes_internes?: string | null
          om_transaction_id?: string | null
          paid_at?: string | null
          preuve_nom?: string | null
          preuve_path?: string | null
          reference?: string | null
          service?: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          statut?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
          voided_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_client_record_id_fkey"
            columns: ["client_record_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes_avec_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "demandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "demandes_avec_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pays_destinations: {
        Row: {
          code_iso: string | null
          continent: string | null
          created_at: string
          id: string
          nom: string
          ordre_affichage: number
          status: string
        }
        Insert: {
          code_iso?: string | null
          continent?: string | null
          created_at?: string
          id?: string
          nom: string
          ordre_affichage?: number
          status?: string
        }
        Update: {
          code_iso?: string | null
          continent?: string | null
          created_at?: string
          id?: string
          nom?: string
          ordre_affichage?: number
          status?: string
        }
        Relationships: []
      }
      payslip_validation_history: {
        Row: {
          action: string
          created_at: string
          id: string
          note: string | null
          payslip_id: string
          performed_by: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          note?: string | null
          payslip_id: string
          performed_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          note?: string | null
          payslip_id?: string
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payslip_validation_history_payslip_id_fkey"
            columns: ["payslip_id"]
            isOneToOne: false
            referencedRelation: "payslips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payslip_validation_history_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payslips: {
        Row: {
          cotisations: Json
          created_at: string
          created_by: string | null
          details_lignes: Json
          employee_id: string
          id: string
          mois_libelle: string
          notes_admin: string | null
          notes_super_admin: string | null
          pdf_url: string | null
          periode_debut: string
          periode_fin: string
          reference: string
          salaire_brut: number
          salaire_net: number
          statut: string
          submitted_at: string | null
          updated_at: string
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          cotisations?: Json
          created_at?: string
          created_by?: string | null
          details_lignes?: Json
          employee_id: string
          id?: string
          mois_libelle: string
          notes_admin?: string | null
          notes_super_admin?: string | null
          pdf_url?: string | null
          periode_debut: string
          periode_fin: string
          reference: string
          salaire_brut: number
          salaire_net: number
          statut?: string
          submitted_at?: string | null
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          cotisations?: Json
          created_at?: string
          created_by?: string | null
          details_lignes?: Json
          employee_id?: string
          id?: string
          mois_libelle?: string
          notes_admin?: string | null
          notes_super_admin?: string | null
          pdf_url?: string | null
          periode_debut?: string
          periode_fin?: string
          reference?: string
          salaire_brut?: number
          salaire_net?: number
          statut?: string
          submitted_at?: string | null
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payslips_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payslips_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payslips_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_reviews: {
        Row: {
          created_at: string
          employee_id: string
          formation_plan: string | null
          id: string
          manager_assessment: Json | null
          manager_assessment_submitted_at: string | null
          manager_id: string | null
          meeting_date: string | null
          meeting_notes: string | null
          notes_finales: string | null
          objectives: Json | null
          period_id: string
          self_assessment: Json | null
          self_assessment_submitted_at: string | null
          signed_employee_at: string | null
          signed_manager_at: string | null
          statut: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          formation_plan?: string | null
          id?: string
          manager_assessment?: Json | null
          manager_assessment_submitted_at?: string | null
          manager_id?: string | null
          meeting_date?: string | null
          meeting_notes?: string | null
          notes_finales?: string | null
          objectives?: Json | null
          period_id: string
          self_assessment?: Json | null
          self_assessment_submitted_at?: string | null
          signed_employee_at?: string | null
          signed_manager_at?: string | null
          statut?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          formation_plan?: string | null
          id?: string
          manager_assessment?: Json | null
          manager_assessment_submitted_at?: string | null
          manager_id?: string | null
          meeting_date?: string | null
          meeting_notes?: string | null
          notes_finales?: string | null
          objectives?: Json | null
          period_id?: string
          self_assessment?: Json | null
          self_assessment_submitted_at?: string | null
          signed_employee_at?: string | null
          signed_manager_at?: string | null
          statut?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_reviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "review_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          actif: boolean
          availability_status: string
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          nom: string
          notes_internes: string | null
          pays: string | null
          poste: string | null
          prenom: string | null
          role: Database["public"]["Enums"]["user_role"]
          service_id: string | null
          specialites: string[] | null
          telephone: string | null
          updated_at: string
        }
        Insert: {
          actif?: boolean
          availability_status?: string
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          nom: string
          notes_internes?: string | null
          pays?: string | null
          poste?: string | null
          prenom?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          service_id?: string | null
          specialites?: string[] | null
          telephone?: string | null
          updated_at?: string
        }
        Update: {
          actif?: boolean
          availability_status?: string
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          nom?: string
          notes_internes?: string | null
          pays?: string | null
          poste?: string | null
          prenom?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          service_id?: string | null
          specialites?: string[] | null
          telephone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      quick_sales: {
        Row: {
          agent_id: string | null
          client_email: string | null
          client_nom: string | null
          client_record_id: string | null
          client_telephone: string | null
          created_at: string
          created_by: string | null
          date_paiement: string
          description: string | null
          devise: string
          id: string
          mode_paiement: Database["public"]["Enums"]["payment_method"]
          montant_total: number
          notes_internes: string | null
          prix_unitaire: number
          quantite: number
          reference: string | null
          type_service: Database["public"]["Enums"]["quick_service_type"]
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          client_email?: string | null
          client_nom?: string | null
          client_record_id?: string | null
          client_telephone?: string | null
          created_at?: string
          created_by?: string | null
          date_paiement?: string
          description?: string | null
          devise?: string
          id?: string
          mode_paiement?: Database["public"]["Enums"]["payment_method"]
          montant_total: number
          notes_internes?: string | null
          prix_unitaire: number
          quantite?: number
          reference?: string | null
          type_service: Database["public"]["Enums"]["quick_service_type"]
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          client_email?: string | null
          client_nom?: string | null
          client_record_id?: string | null
          client_telephone?: string | null
          created_at?: string
          created_by?: string | null
          date_paiement?: string
          description?: string | null
          devise?: string
          id?: string
          mode_paiement?: Database["public"]["Enums"]["payment_method"]
          montant_total?: number
          notes_internes?: string | null
          prix_unitaire?: number
          quantite?: number
          reference?: string | null
          type_service?: Database["public"]["Enums"]["quick_service_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quick_sales_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quick_sales_client_record_id_fkey"
            columns: ["client_record_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quick_sales_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_hits: {
        Row: {
          created_at: string
          id: number
          rl_key: string
        }
        Insert: {
          created_at?: string
          id?: never
          rl_key: string
        }
        Update: {
          created_at?: string
          id?: never
          rl_key?: string
        }
        Relationships: []
      }
      rendez_vous: {
        Row: {
          client_id: string | null
          created_at: string
          date_rdv: string
          demande_id: string | null
          duree_minutes: number | null
          id: string
          notes: string | null
          statut: string | null
          sujet: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          date_rdv: string
          demande_id?: string | null
          duree_minutes?: number | null
          id?: string
          notes?: string | null
          statut?: string | null
          sujet: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          date_rdv?: string
          demande_id?: string | null
          duree_minutes?: number | null
          id?: string
          notes?: string | null
          statut?: string | null
          sujet?: string
        }
        Relationships: [
          {
            foreignKeyName: "rendez_vous_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rendez_vous_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rendez_vous_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes_avec_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      review_periods: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string
          id: string
          label: string
          start_date: string
          statut: string
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date: string
          id?: string
          label: string
          start_date: string
          statut?: string
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string
          id?: string
          label?: string
          start_date?: string
          statut?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "review_periods_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          key: string
          label: string
          updated_at: string
          updated_by: string | null
          value_json: Json | null
          value_number: number | null
          value_text: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key: string
          label: string
          updated_at?: string
          updated_by?: string | null
          value_json?: Json | null
          value_number?: number | null
          value_text?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          label?: string
          updated_at?: string
          updated_by?: string | null
          value_json?: Json | null
          value_number?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rh_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission: string
          role: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission: string
          role: string
        }
        Update: {
          created_at?: string
          id?: string
          permission?: string
          role?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          categorie: string
          created_at: string
          delai_indicatif: string | null
          description: string | null
          devise: string
          id: string
          nom: string
          ordre_affichage: number
          slug: string
          status: string
          tarif_montant: number | null
          tarif_type: string
          updated_at: string
        }
        Insert: {
          categorie: string
          created_at?: string
          delai_indicatif?: string | null
          description?: string | null
          devise?: string
          id?: string
          nom: string
          ordre_affichage?: number
          slug: string
          status?: string
          tarif_montant?: number | null
          tarif_type?: string
          updated_at?: string
        }
        Update: {
          categorie?: string
          created_at?: string
          delai_indicatif?: string | null
          description?: string | null
          devise?: string
          id?: string
          nom?: string
          ordre_affichage?: number
          slug?: string
          status?: string
          tarif_montant?: number | null
          tarif_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      stripe_webhook_log: {
        Row: {
          created_at: string
          error: string | null
          event_type: string
          id: string
          payload: Json
          processed: boolean
          processed_at: string | null
        }
        Insert: {
          created_at?: string
          error?: string | null
          event_type: string
          id: string
          payload: Json
          processed?: boolean
          processed_at?: string | null
        }
        Update: {
          created_at?: string
          error?: string | null
          event_type?: string
          id?: string
          payload?: Json
          processed?: boolean
          processed_at?: string | null
        }
        Relationships: []
      }
      taches: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          demande_id: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string
          status: string
          titre: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          demande_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          titre: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          demande_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          titre?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "taches_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "taches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "taches_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "taches_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes_avec_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      temoignages: {
        Row: {
          auteur_nom: string
          auteur_role: string | null
          contenu: string
          created_at: string
          id: string
          note: number | null
          source: string | null
          status: string
          updated_at: string
          verifie: boolean
        }
        Insert: {
          auteur_nom: string
          auteur_role?: string | null
          contenu: string
          created_at?: string
          id?: string
          note?: number | null
          source?: string | null
          status?: string
          updated_at?: string
          verifie?: boolean
        }
        Update: {
          auteur_nom?: string
          auteur_role?: string | null
          contenu?: string
          created_at?: string
          id?: string
          note?: number | null
          source?: string | null
          status?: string
          updated_at?: string
          verifie?: boolean
        }
        Relationships: []
      }
      transferts: {
        Row: {
          agent_id: string | null
          beneficiaire_nom: string
          beneficiaire_pays: string
          beneficiaire_telephone: string | null
          beneficiaire_ville: string | null
          client_record_id: string | null
          created_at: string
          created_by: string | null
          devise: string
          effectue_at: string | null
          expediteur_nom: string
          expediteur_piece_identite: string | null
          expediteur_telephone: string | null
          frais_transfert: number | null
          id: string
          mode_transfert: Database["public"]["Enums"]["transfert_mode"]
          montant_envoye: number
          motif_rejet: string | null
          notes: string | null
          numero_reference_externe: string | null
          reference: string | null
          statut: Database["public"]["Enums"]["transfert_statut"]
          updated_at: string
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          agent_id?: string | null
          beneficiaire_nom: string
          beneficiaire_pays: string
          beneficiaire_telephone?: string | null
          beneficiaire_ville?: string | null
          client_record_id?: string | null
          created_at?: string
          created_by?: string | null
          devise?: string
          effectue_at?: string | null
          expediteur_nom: string
          expediteur_piece_identite?: string | null
          expediteur_telephone?: string | null
          frais_transfert?: number | null
          id?: string
          mode_transfert: Database["public"]["Enums"]["transfert_mode"]
          montant_envoye: number
          motif_rejet?: string | null
          notes?: string | null
          numero_reference_externe?: string | null
          reference?: string | null
          statut?: Database["public"]["Enums"]["transfert_statut"]
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          agent_id?: string | null
          beneficiaire_nom?: string
          beneficiaire_pays?: string
          beneficiaire_telephone?: string | null
          beneficiaire_ville?: string | null
          client_record_id?: string | null
          created_at?: string
          created_by?: string | null
          devise?: string
          effectue_at?: string | null
          expediteur_nom?: string
          expediteur_piece_identite?: string | null
          expediteur_telephone?: string | null
          frais_transfert?: number | null
          id?: string
          mode_transfert?: Database["public"]["Enums"]["transfert_mode"]
          montant_envoye?: number
          motif_rejet?: string | null
          notes?: string | null
          numero_reference_externe?: string | null
          reference?: string | null
          statut?: Database["public"]["Enums"]["transfert_statut"]
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transferts_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transferts_client_record_id_fkey"
            columns: ["client_record_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transferts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transferts_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          permission: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          permission: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          permission?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      visa_express_requests: {
        Row: {
          created_at: string
          document_paths: string[]
          email: string
          id: string
          ip: string | null
          nom_complet: string
          notes: string | null
          pays_destination: string
          reference: string
          status: string
          type_visa: string
          updated_at: string
          urgence: string
          user_agent: string | null
          whatsapp: string
        }
        Insert: {
          created_at?: string
          document_paths?: string[]
          email: string
          id?: string
          ip?: string | null
          nom_complet: string
          notes?: string | null
          pays_destination: string
          reference: string
          status?: string
          type_visa: string
          updated_at?: string
          urgence: string
          user_agent?: string | null
          whatsapp: string
        }
        Update: {
          created_at?: string
          document_paths?: string[]
          email?: string
          id?: string
          ip?: string | null
          nom_complet?: string
          notes?: string | null
          pays_destination?: string
          reference?: string
          status?: string
          type_visa?: string
          updated_at?: string
          urgence?: string
          user_agent?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
    }
    Views: {
      demandes_avec_documents: {
        Row: {
          agent_id: string | null
          budget_estimatif: string | null
          client_id: string | null
          consentement_documents: boolean | null
          consentement_examen: boolean | null
          consentement_recontact: boolean | null
          created_at: string | null
          date_souhaitee: string | null
          description: string | null
          destination: string | null
          details_service: Json | null
          email: string | null
          id: string | null
          langue_preferee: string | null
          nom_complet: string | null
          nombre_documents: number | null
          notes_internes: string | null
          objet: string | null
          pays: string | null
          pays_concerne: string | null
          service: string | null
          source: string | null
          statut: Database["public"]["Enums"]["demande_status"] | null
          telephone: string | null
          traitement_prioritaire: boolean | null
          updated_at: string | null
          urgence: Database["public"]["Enums"]["urgence_level"] | null
          ville: string | null
        }
        Insert: {
          agent_id?: string | null
          budget_estimatif?: string | null
          client_id?: string | null
          consentement_documents?: boolean | null
          consentement_examen?: boolean | null
          consentement_recontact?: boolean | null
          created_at?: string | null
          date_souhaitee?: string | null
          description?: string | null
          destination?: string | null
          details_service?: Json | null
          email?: string | null
          id?: string | null
          langue_preferee?: string | null
          nom_complet?: string | null
          nombre_documents?: never
          notes_internes?: string | null
          objet?: string | null
          pays?: string | null
          pays_concerne?: string | null
          service?: string | null
          source?: string | null
          statut?: Database["public"]["Enums"]["demande_status"] | null
          telephone?: string | null
          traitement_prioritaire?: boolean | null
          updated_at?: string | null
          urgence?: Database["public"]["Enums"]["urgence_level"] | null
          ville?: string | null
        }
        Update: {
          agent_id?: string | null
          budget_estimatif?: string | null
          client_id?: string | null
          consentement_documents?: boolean | null
          consentement_examen?: boolean | null
          consentement_recontact?: boolean | null
          created_at?: string | null
          date_souhaitee?: string | null
          description?: string | null
          destination?: string | null
          details_service?: Json | null
          email?: string | null
          id?: string | null
          langue_preferee?: string | null
          nom_complet?: string | null
          nombre_documents?: never
          notes_internes?: string | null
          objet?: string | null
          pays?: string | null
          pays_concerne?: string | null
          service?: string | null
          source?: string | null
          statut?: Database["public"]["Enums"]["demande_status"] | null
          telephone?: string | null
          traitement_prioritaire?: boolean | null
          updated_at?: string | null
          urgence?: Database["public"]["Enums"]["urgence_level"] | null
          ville?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "demandes_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demandes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments_with_client: {
        Row: {
          agent_id: string | null
          client_email: string | null
          client_id: string | null
          client_nom: string | null
          client_record_id: string | null
          client_reference: string | null
          client_telephone: string | null
          client_type: Database["public"]["Enums"]["client_type"] | null
          created_at: string | null
          created_by: string | null
          date_paiement: string | null
          demande_id: string | null
          description: string | null
          devise: string | null
          id: string | null
          linked_client_nom: string | null
          linked_client_prenom: string | null
          linked_client_raison_sociale: string | null
          mode_paiement: Database["public"]["Enums"]["payment_method"] | null
          montant_recu: number | null
          montant_total: number | null
          notes_internes: string | null
          preuve_nom: string | null
          preuve_path: string | null
          reference: string | null
          service: string | null
          statut: Database["public"]["Enums"]["payment_status"] | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_client_record_id_fkey"
            columns: ["client_record_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes_avec_documents"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      auth_role: { Args: never; Returns: string }
      find_available_agent: { Args: { target_date: string }; Returns: string }
      gen_demande_ref: { Args: never; Returns: string }
      gen_insurance_quote_ref: { Args: never; Returns: string }
      get_occupied_slots: {
        Args: { target_date: string }
        Returns: {
          rdv_heure: string
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_permission: { Args: { perm: string }; Returns: boolean }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      is_staff: { Args: { user_id: string }; Returns: boolean }
      map_service_to_categorie: { Args: { p_service: string }; Returns: string }
    }
    Enums: {
      client_type: "particulier" | "entreprise" | "institution"
      demande_status:
        | "nouveau"
        | "en_cours"
        | "en_attente"
        | "complete"
        | "annule"
        | "incomplet"
        | "en_traitement"
        | "nouvelle_demande"
        | "qualification"
        | "documents_demandes"
        | "dossier_incomplet"
        | "etude_faisabilite"
        | "devis_envoye"
        | "devis_accepte"
        | "paiement_attente"
        | "traitement"
        | "transmis_partenaire"
        | "decision_recue"
        | "termine"
        | "refuse"
        | "archive"
      expense_category:
        | "fournitures"
        | "transport"
        | "communication"
        | "restauration"
        | "hebergement"
        | "materiel"
        | "logiciel"
        | "marketing"
        | "maintenance"
        | "frais_bancaires"
        | "salaires"
        | "loyer"
        | "electricite"
        | "internet"
        | "autre"
      expense_status: "en_attente" | "valide" | "rejete"
      payment_method:
        | "especes"
        | "virement"
        | "mobile_money"
        | "western_union"
        | "moneygram"
        | "carte"
        | "cheque"
        | "autre"
        | "stripe"
        | "orange_money"
        | "mtn_money"
        | "cash"
        | "bank_transfer"
      payment_status:
        | "non_paye"
        | "partiel"
        | "paye"
        | "rembourse"
        | "annule"
        | "pending"
        | "paid"
        | "failed"
        | "validated"
        | "refunded"
        | "voided"
      quick_service_type:
        | "photocopie"
        | "impression"
        | "scan"
        | "numerisation"
        | "plastification"
        | "saisie_document"
        | "assistance_formulaire"
        | "photo_identite"
        | "autre"
      transfert_mode:
        | "western_union"
        | "moneygram"
        | "mobile_money"
        | "virement_bancaire"
        | "ria"
        | "wise"
        | "autre"
      transfert_statut:
        | "en_attente"
        | "valide"
        | "rejete"
        | "effectue"
        | "annule"
      urgence_level: "faible" | "normale" | "elevee" | "critique"
      user_role:
        | "super_admin"
        | "admin"
        | "agent"
        | "client"
        | "dg"
        | "daf"
        | "chef_service"
        | "comptable"
        | "moderateur"
        | "partenaire"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      client_type: ["particulier", "entreprise", "institution"],
      demande_status: [
        "nouveau",
        "en_cours",
        "en_attente",
        "complete",
        "annule",
        "incomplet",
        "en_traitement",
        "nouvelle_demande",
        "qualification",
        "documents_demandes",
        "dossier_incomplet",
        "etude_faisabilite",
        "devis_envoye",
        "devis_accepte",
        "paiement_attente",
        "traitement",
        "transmis_partenaire",
        "decision_recue",
        "termine",
        "refuse",
        "archive",
      ],
      expense_category: [
        "fournitures",
        "transport",
        "communication",
        "restauration",
        "hebergement",
        "materiel",
        "logiciel",
        "marketing",
        "maintenance",
        "frais_bancaires",
        "salaires",
        "loyer",
        "electricite",
        "internet",
        "autre",
      ],
      expense_status: ["en_attente", "valide", "rejete"],
      payment_method: [
        "especes",
        "virement",
        "mobile_money",
        "western_union",
        "moneygram",
        "carte",
        "cheque",
        "autre",
        "stripe",
        "orange_money",
        "mtn_money",
        "cash",
        "bank_transfer",
      ],
      payment_status: [
        "non_paye",
        "partiel",
        "paye",
        "rembourse",
        "annule",
        "pending",
        "paid",
        "failed",
        "validated",
        "refunded",
        "voided",
      ],
      quick_service_type: [
        "photocopie",
        "impression",
        "scan",
        "numerisation",
        "plastification",
        "saisie_document",
        "assistance_formulaire",
        "photo_identite",
        "autre",
      ],
      transfert_mode: [
        "western_union",
        "moneygram",
        "mobile_money",
        "virement_bancaire",
        "ria",
        "wise",
        "autre",
      ],
      transfert_statut: [
        "en_attente",
        "valide",
        "rejete",
        "effectue",
        "annule",
      ],
      urgence_level: ["faible", "normale", "elevee", "critique"],
      user_role: [
        "super_admin",
        "admin",
        "agent",
        "client",
        "dg",
        "daf",
        "chef_service",
        "comptable",
        "moderateur",
        "partenaire",
      ],
    },
  },
} as const
