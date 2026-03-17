-- Drop existing permissive policies
DROP POLICY IF EXISTS "authenticated_all_usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "authenticated_all_cred" ON public.credenciais_sistema_legado;
DROP POLICY IF EXISTS "authenticated_all_conf" ON public.configuracao_relatorios;
DROP POLICY IF EXISTS "authenticated_all_dados" ON public.dados_importados;
DROP POLICY IF EXISTS "authenticated_all_log" ON public.log_execucoes;

-- Create restrictive policies based on user_id
CREATE POLICY "authenticated_user_usuarios" ON public.usuarios FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "authenticated_user_cred" ON public.credenciais_sistema_legado FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "authenticated_user_conf" ON public.configuracao_relatorios FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "authenticated_user_dados" ON public.dados_importados FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "authenticated_user_log" ON public.log_execucoes FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Add relatorio_id to dados_importados to link configurations easily
ALTER TABLE public.dados_importados ADD COLUMN relatorio_id UUID REFERENCES public.configuracao_relatorios(id) ON DELETE SET NULL;
