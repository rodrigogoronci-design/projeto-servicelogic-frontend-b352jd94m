-- Create SQL Server Credentials Table
CREATE TABLE public.credenciais_sql_server (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    server_ip TEXT NOT NULL,
    database_name TEXT NOT NULL,
    username TEXT NOT NULL,
    password_encrypted TEXT NOT NULL,
    table_name TEXT NOT NULL DEFAULT 'DWBI_PBIv2_Conhecimento',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create SQL Data Cache Table
CREATE TABLE public.cache_dados_sql (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create SQL Execution Logs Table
CREATE TABLE public.log_execucoes_sql (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    operation_type TEXT NOT NULL,
    status TEXT NOT NULL,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.credenciais_sql_server ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cache_dados_sql ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_execucoes_sql ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies
CREATE POLICY "auth_user_credenciais_sql" ON public.credenciais_sql_server
    FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "auth_user_cache_sql" ON public.cache_dados_sql
    FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "auth_user_logs_sql" ON public.log_execucoes_sql
    FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());
