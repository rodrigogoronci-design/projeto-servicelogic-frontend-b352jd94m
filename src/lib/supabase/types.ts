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
      configuracao_relatorios: {
        Row: {
          ativo: boolean | null
          caminho_relatorio: string
          created_at: string
          frequencia_horas: number | null
          id: string
          nome_relatorio: string
          parametros: Json | null
          sistema_origem: string
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          caminho_relatorio: string
          created_at?: string
          frequencia_horas?: number | null
          id?: string
          nome_relatorio: string
          parametros?: Json | null
          sistema_origem?: string
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          caminho_relatorio?: string
          created_at?: string
          frequencia_horas?: number | null
          id?: string
          nome_relatorio?: string
          parametros?: Json | null
          sistema_origem?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'configuracao_relatorios_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      credenciais_sistema_legado: {
        Row: {
          id: string
          password: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          id?: string
          password: string
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          id?: string
          password?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: 'credenciais_sistema_legado_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      dados_importados: {
        Row: {
          data_importacao: string
          error_details: string | null
          id: string
          payload: Json | null
          registros: number | null
          relatorio_id: string | null
          source: string | null
          status: string
          user_id: string
        }
        Insert: {
          data_importacao?: string
          error_details?: string | null
          id?: string
          payload?: Json | null
          registros?: number | null
          relatorio_id?: string | null
          source?: string | null
          status: string
          user_id: string
        }
        Update: {
          data_importacao?: string
          error_details?: string | null
          id?: string
          payload?: Json | null
          registros?: number | null
          relatorio_id?: string | null
          source?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'dados_importados_relatorio_id_fkey'
            columns: ['relatorio_id']
            isOneToOne: false
            referencedRelation: 'configuracao_relatorios'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'dados_importados_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      log_execucoes: {
        Row: {
          data_execucao: string
          id: string
          mensagem_erro: string | null
          relatorio_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          data_execucao?: string
          id?: string
          mensagem_erro?: string | null
          relatorio_id?: string | null
          status: string
          user_id: string
        }
        Update: {
          data_execucao?: string
          id?: string
          mensagem_erro?: string | null
          relatorio_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'log_execucoes_relatorio_id_fkey'
            columns: ['relatorio_id']
            isOneToOne: false
            referencedRelation: 'configuracao_relatorios'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'log_execucoes_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
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
// Table: configuracao_relatorios
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   nome_relatorio: text (not null)
//   sistema_origem: text (not null, default: 'Servicelogic'::text)
//   caminho_relatorio: text (not null)
//   parametros: jsonb (nullable, default: '{}'::jsonb)
//   frequencia_horas: numeric (nullable, default: 24)
//   ativo: boolean (nullable, default: true)
//   created_at: timestamp with time zone (not null, default: now())
// Table: credenciais_sistema_legado
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   username: text (not null)
//   password: text (not null)
//   updated_at: timestamp with time zone (not null, default: now())
// Table: dados_importados
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   data_importacao: timestamp with time zone (not null, default: now())
//   status: text (not null)
//   registros: numeric (nullable, default: 0)
//   source: text (nullable, default: 'Servicelogic'::text)
//   error_details: text (nullable)
//   payload: jsonb (nullable, default: '{}'::jsonb)
//   relatorio_id: uuid (nullable)
// Table: log_execucoes
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   relatorio_id: uuid (nullable)
//   data_execucao: timestamp with time zone (not null, default: now())
//   status: text (not null)
//   mensagem_erro: text (nullable)
// Table: usuarios
//   id: uuid (not null)
//   nome: text (not null)
//   email: text (not null)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: configuracao_relatorios
//   PRIMARY KEY configuracao_relatorios_pkey: PRIMARY KEY (id)
//   FOREIGN KEY configuracao_relatorios_user_id_fkey: FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: credenciais_sistema_legado
//   PRIMARY KEY credenciais_sistema_legado_pkey: PRIMARY KEY (id)
//   FOREIGN KEY credenciais_sistema_legado_user_id_fkey: FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: dados_importados
//   PRIMARY KEY dados_importados_pkey: PRIMARY KEY (id)
//   FOREIGN KEY dados_importados_relatorio_id_fkey: FOREIGN KEY (relatorio_id) REFERENCES configuracao_relatorios(id) ON DELETE SET NULL
//   FOREIGN KEY dados_importados_user_id_fkey: FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: log_execucoes
//   PRIMARY KEY log_execucoes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY log_execucoes_relatorio_id_fkey: FOREIGN KEY (relatorio_id) REFERENCES configuracao_relatorios(id) ON DELETE CASCADE
//   FOREIGN KEY log_execucoes_user_id_fkey: FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: usuarios
//   FOREIGN KEY usuarios_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY usuarios_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: configuracao_relatorios
//   Policy "authenticated_user_conf" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//     WITH CHECK: (user_id = auth.uid())
// Table: credenciais_sistema_legado
//   Policy "authenticated_user_cred" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//     WITH CHECK: (user_id = auth.uid())
// Table: dados_importados
//   Policy "authenticated_user_dados" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//     WITH CHECK: (user_id = auth.uid())
// Table: log_execucoes
//   Policy "authenticated_user_log" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//     WITH CHECK: (user_id = auth.uid())
// Table: usuarios
//   Policy "authenticated_user_usuarios" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (id = auth.uid())
//     WITH CHECK: (id = auth.uid())
