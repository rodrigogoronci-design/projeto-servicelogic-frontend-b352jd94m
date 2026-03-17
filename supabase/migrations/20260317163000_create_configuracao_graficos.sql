-- Create configuracao_graficos table
CREATE TABLE public.configuracao_graficos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    nome_grafico TEXT NOT NULL,
    nome_tabela TEXT NOT NULL,
    campos_selecionados JSONB NOT NULL DEFAULT '[]'::jsonb,
    tipo_grafico TEXT NOT NULL,
    descricao TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.configuracao_graficos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "auth_user_configuracao_graficos_select" 
    ON public.configuracao_graficos 
    FOR SELECT TO authenticated 
    USING (usuario_id = auth.uid());

CREATE POLICY "auth_user_configuracao_graficos_insert" 
    ON public.configuracao_graficos 
    FOR INSERT TO authenticated 
    WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "auth_user_configuracao_graficos_update" 
    ON public.configuracao_graficos 
    FOR UPDATE TO authenticated 
    USING (usuario_id = auth.uid()) 
    WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "auth_user_configuracao_graficos_delete" 
    ON public.configuracao_graficos 
    FOR DELETE TO authenticated 
    USING (usuario_id = auth.uid());
