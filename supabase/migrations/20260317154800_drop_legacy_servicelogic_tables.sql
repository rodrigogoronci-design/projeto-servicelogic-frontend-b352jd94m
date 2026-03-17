-- Drop legacy Servicelogic tables and their associated dependencies

-- We use CASCADE to ensure that any dependent objects such as RLS policies, 
-- foreign key constraints, or triggers specifically attached to these tables 
-- are automatically dropped alongside them.

-- Drop dados_importados (depends on configuracao_relatorios)
DROP TABLE IF EXISTS public.dados_importados CASCADE;

-- Drop log_execucoes (depends on configuracao_relatorios)
DROP TABLE IF EXISTS public.log_execucoes CASCADE;

-- Drop configuracao_relatorios
DROP TABLE IF EXISTS public.configuracao_relatorios CASCADE;

-- Drop credenciais_servicelogic
DROP TABLE IF EXISTS public.credenciais_servicelogic CASCADE;
