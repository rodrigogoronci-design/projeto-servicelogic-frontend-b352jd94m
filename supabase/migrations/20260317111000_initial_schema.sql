DO $$
DECLARE
  admin_id uuid := gen_random_uuid();
BEGIN
  -- Insert Admin
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud,
    confirmation_token, recovery_token, email_change_token_new,
    email_change, email_change_token_current,
    phone, phone_change, phone_change_token, reauthentication_token
  ) VALUES (
    admin_id, '00000000-0000-0000-0000-000000000000', 'admin@servicelogic.com',
    crypt('admin123', gen_salt('bf')), NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}', '{"name": "Administrador"}',
    false, 'authenticated', 'authenticated',
    '', '', '', '', '', NULL, '', '', ''
  );

  -- Create custom tables
  CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  INSERT INTO public.usuarios (id, nome, email) VALUES (admin_id, 'Administrador', 'admin@servicelogic.com');

  CREATE TABLE public.credenciais_sistema_legado (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE public.configuracao_relatorios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
    nome_relatorio TEXT NOT NULL,
    sistema_origem TEXT NOT NULL DEFAULT 'Servicelogic',
    caminho_relatorio TEXT NOT NULL,
    parametros JSONB DEFAULT '{}'::jsonb,
    frequencia_horas NUMERIC DEFAULT 24,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE public.dados_importados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
    data_importacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL,
    registros NUMERIC DEFAULT 0,
    source TEXT DEFAULT 'Servicelogic',
    error_details TEXT,
    payload JSONB DEFAULT '{}'::jsonb
  );

  CREATE TABLE public.log_execucoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
    relatorio_id UUID REFERENCES public.configuracao_relatorios(id) ON DELETE CASCADE,
    data_execucao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL,
    mensagem_erro TEXT
  );

  -- Add Seeds
  INSERT INTO public.configuracao_relatorios (id, user_id, nome_relatorio, sistema_origem, caminho_relatorio, frequencia_horas, ativo)
  VALUES 
    ('11111111-1111-1111-1111-111111111111'::uuid, admin_id, 'Faturamento Consolidado', 'Servicelogic', '/api/export/fat', 24, true),
    ('22222222-2222-2222-2222-222222222222'::uuid, admin_id, 'Clientes Ativos', 'Servicelogic', '/api/export/clientes', 12, true);

  INSERT INTO public.dados_importados (id, user_id, data_importacao, status, registros, source, error_details)
  VALUES 
    (gen_random_uuid(), admin_id, NOW() - interval '1 day', 'processado', 1250, 'Servicelogic Legado', null),
    (gen_random_uuid(), admin_id, NOW() - interval '2 hours', 'erro', 0, 'API Externa', 'Timeout connection (3000ms)');

  INSERT INTO public.log_execucoes (id, user_id, relatorio_id, data_execucao, status, mensagem_erro)
  VALUES 
    (gen_random_uuid(), admin_id, '11111111-1111-1111-1111-111111111111'::uuid, NOW() - interval '1 day', 'sucesso', null),
    (gen_random_uuid(), admin_id, '22222222-2222-2222-2222-222222222222'::uuid, NOW() - interval '2 hours', 'erro', 'Falha na autenticação do sistema legado');

END $$;

-- RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credenciais_sistema_legado ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracao_relatorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dados_importados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_execucoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_all_usuarios" ON public.usuarios FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_cred" ON public.credenciais_sistema_legado FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_conf" ON public.configuracao_relatorios FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_dados" ON public.dados_importados FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_log" ON public.log_execucoes FOR ALL TO authenticated USING (true) WITH CHECK (true);

