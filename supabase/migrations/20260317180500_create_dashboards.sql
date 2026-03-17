CREATE TABLE public.dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    nome TEXT NOT NULL,
    descricao TEXT,
    configuracao_layout JSONB NOT NULL DEFAULT '[]'::jsonb,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_user_dashboards_select" 
    ON public.dashboards 
    FOR SELECT TO authenticated 
    USING (usuario_id = auth.uid());

CREATE POLICY "auth_user_dashboards_insert" 
    ON public.dashboards 
    FOR INSERT TO authenticated 
    WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "auth_user_dashboards_update" 
    ON public.dashboards 
    FOR UPDATE TO authenticated 
    USING (usuario_id = auth.uid()) 
    WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "auth_user_dashboards_delete" 
    ON public.dashboards 
    FOR DELETE TO authenticated 
    USING (usuario_id = auth.uid());
