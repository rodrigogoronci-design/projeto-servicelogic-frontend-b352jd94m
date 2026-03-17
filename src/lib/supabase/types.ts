// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      cache_dados_sql: {
        Row: {
          data: Json
          id: string
          updated_at: string
          usuario_id: string
        }
        Insert: {
          data?: Json
          id?: string
          updated_at?: string
          usuario_id: string
        }
        Update: {
          data?: Json
          id?: string
          updated_at?: string
          usuario_id?: string
        }
        Relationships: []
      }
      credenciais_sql_server: {
        Row: {
          created_at: string
          database_name: string
          id: string
          password_encrypted: string
          server_ip: string
          table_name: string
          updated_at: string
          username: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          database_name: string
          id?: string
          password_encrypted: string
          server_ip: string
          table_name?: string
          updated_at?: string
          username: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          database_name?: string
          id?: string
          password_encrypted?: string
          server_ip?: string
          table_name?: string
          updated_at?: string
          username?: string
          usuario_id?: string
        }
        Relationships: []
      }
      log_execucoes_sql: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          operation_type: string
          status: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          operation_type: string
          status: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          operation_type?: string
          status?: string
          usuario_id?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          created_at: string
          email: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          nome: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: cache_dados_sql
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   data: jsonb (not null, default: '{}'::jsonb)
//   updated_at: timestamp with time zone (not null, default: now())
// Table: credenciais_sql_server
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   server_ip: text (not null)
//   database_name: text (not null)
//   username: text (not null)
//   password_encrypted: text (not null)
//   table_name: text (not null, default: 'DWBI_PBIv2_Conhecimento'::text)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: log_execucoes_sql
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   operation_type: text (not null)
//   status: text (not null)
//   error_message: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: usuarios
//   id: uuid (not null)
//   nome: text (not null)
//   email: text (not null)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: cache_dados_sql
//   PRIMARY KEY cache_dados_sql_pkey: PRIMARY KEY (id)
//   FOREIGN KEY cache_dados_sql_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
//   UNIQUE cache_dados_sql_usuario_id_key: UNIQUE (usuario_id)
// Table: credenciais_sql_server
//   PRIMARY KEY credenciais_sql_server_pkey: PRIMARY KEY (id)
//   FOREIGN KEY credenciais_sql_server_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: log_execucoes_sql
//   PRIMARY KEY log_execucoes_sql_pkey: PRIMARY KEY (id)
//   FOREIGN KEY log_execucoes_sql_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: usuarios
//   FOREIGN KEY usuarios_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY usuarios_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: cache_dados_sql
//   Policy "auth_user_cache_sql" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: credenciais_sql_server
//   Policy "auth_user_credenciais_sql" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: log_execucoes_sql
//   Policy "auth_user_logs_sql" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: usuarios
//   Policy "authenticated_user_usuarios" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (id = auth.uid())
//     WITH CHECK: (id = auth.uid())

// --- INDEXES ---
// Table: cache_dados_sql
//   CREATE UNIQUE INDEX cache_dados_sql_usuario_id_key ON public.cache_dados_sql USING btree (usuario_id)
