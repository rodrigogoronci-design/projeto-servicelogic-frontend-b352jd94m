-- Migration to adhere to Servicelogic technical specifications

-- 1. credenciais_servicelogic
ALTER TABLE IF EXISTS public.credenciais_sistema_legado RENAME TO credenciais_servicelogic;

ALTER TABLE public.credenciais_servicelogic RENAME COLUMN user_id TO usuario_id;
ALTER TABLE public.credenciais_servicelogic RENAME COLUMN password TO password_encrypted;
ALTER TABLE public.credenciais_servicelogic RENAME COLUMN updated_at TO atualizado_em;

ALTER TABLE public.credenciais_servicelogic ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public.credenciais_servicelogic DROP CONSTRAINT IF EXISTS credenciais_sistema_legado_user_id_fkey;
ALTER TABLE public.credenciais_servicelogic ADD CONSTRAINT credenciais_servicelogic_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE;


-- 2. configuracao_relatorios
ALTER TABLE public.configuracao_relatorios RENAME COLUMN user_id TO usuario_id;
ALTER TABLE public.configuracao_relatorios RENAME COLUMN created_at TO criado_em;

ALTER TABLE public.configuracao_relatorios ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.configuracao_relatorios ADD COLUMN IF NOT EXISTS data_inicial DATE;
ALTER TABLE public.configuracao_relatorios ADD COLUMN IF NOT EXISTS data_final DATE;

UPDATE public.configuracao_relatorios 
SET data_inicial = (parametros->>'dataInicial')::DATE,
    data_final = (parametros->>'dataFinal')::DATE
WHERE parametros IS NOT NULL AND parametros ? 'dataInicial';

ALTER TABLE public.configuracao_relatorios DROP COLUMN IF EXISTS parametros;

UPDATE public.configuracao_relatorios SET frequencia_horas = 24 WHERE frequencia_horas IS NULL;
ALTER TABLE public.configuracao_relatorios ALTER COLUMN frequencia_horas TYPE INTEGER USING frequencia_horas::INTEGER;
ALTER TABLE public.configuracao_relatorios ALTER COLUMN frequencia_horas SET NOT NULL;

ALTER TABLE public.configuracao_relatorios DROP CONSTRAINT IF EXISTS configuracao_relatorios_user_id_fkey;
ALTER TABLE public.configuracao_relatorios ADD CONSTRAINT configuracao_relatorios_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE;


-- 3. dados_importados
ALTER TABLE public.dados_importados RENAME COLUMN user_id TO usuario_id;
ALTER TABLE public.dados_importados RENAME COLUMN relatorio_id TO configuracao_relatorio_id;
ALTER TABLE public.dados_importados RENAME COLUMN payload TO dados;

UPDATE public.dados_importados SET dados = '{}'::jsonb WHERE dados IS NULL;
ALTER TABLE public.dados_importados ALTER COLUMN dados SET NOT NULL;
ALTER TABLE public.dados_importados ALTER COLUMN status SET DEFAULT 'processado';

ALTER TABLE public.dados_importados DROP CONSTRAINT IF EXISTS dados_importados_user_id_fkey;
ALTER TABLE public.dados_importados DROP CONSTRAINT IF EXISTS dados_importados_relatorio_id_fkey;
ALTER TABLE public.dados_importados ADD CONSTRAINT dados_importados_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.dados_importados ADD CONSTRAINT dados_importados_configuracao_relatorio_id_fkey FOREIGN KEY (configuracao_relatorio_id) REFERENCES public.configuracao_relatorios(id) ON DELETE SET NULL;


-- 4. log_execucoes
ALTER TABLE public.log_execucoes RENAME COLUMN user_id TO usuario_id;
ALTER TABLE public.log_execucoes RENAME COLUMN relatorio_id TO configuracao_relatorio_id;

ALTER TABLE public.log_execucoes DROP CONSTRAINT IF EXISTS log_execucoes_user_id_fkey;
ALTER TABLE public.log_execucoes DROP CONSTRAINT IF EXISTS log_execucoes_relatorio_id_fkey;
ALTER TABLE public.log_execucoes ADD CONSTRAINT log_execucoes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.log_execucoes ADD CONSTRAINT log_execucoes_configuracao_relatorio_id_fkey FOREIGN KEY (configuracao_relatorio_id) REFERENCES public.configuracao_relatorios(id) ON DELETE CASCADE;


-- 5. Row Level Security Policies
-- Drop old permissive and restrictive policies
DROP POLICY IF EXISTS "authenticated_all_cred" ON public.credenciais_servicelogic;
DROP POLICY IF EXISTS "authenticated_all_conf" ON public.configuracao_relatorios;
DROP POLICY IF EXISTS "authenticated_all_dados" ON public.dados_importados;
DROP POLICY IF EXISTS "authenticated_all_log" ON public.log_execucoes;

DROP POLICY IF EXISTS "authenticated_user_cred" ON public.credenciais_servicelogic;
DROP POLICY IF EXISTS "authenticated_user_conf" ON public.configuracao_relatorios;
DROP POLICY IF EXISTS "authenticated_user_dados" ON public.dados_importados;
DROP POLICY IF EXISTS "authenticated_user_log" ON public.log_execucoes;

-- Create new strict policies based on usuario_id
CREATE POLICY "auth_user_credenciais" ON public.credenciais_servicelogic FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());
CREATE POLICY "auth_user_configuracoes" ON public.configuracao_relatorios FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());
CREATE POLICY "auth_user_dados" ON public.dados_importados FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());
CREATE POLICY "auth_user_logs" ON public.log_execucoes FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());
