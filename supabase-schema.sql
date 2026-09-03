-- =====================================================
-- TABELA DE PRODUTOS
-- =====================================================

create table produtos (
    id bigint generated always as identity primary key,
    nome text not null,
    preco numeric(10, 2) not null,
    imagem text,
    categoria text not null,
    descricao text,
    disponivel boolean not null default true,
    destaque boolean not null default false,
    estoque jsonb,
    criado_em timestamptz not null default now()
);

-- Liga a segurança por linha (RLS) — sem isso, por padrão
-- o Supabase já bloqueia tudo, mas deixamos explícito.
alter table produtos enable row level security;


-- =====================================================
-- POLÍTICAS DE ACESSO
-- =====================================================

-- Qualquer visitante do site (sem login) pode LER os produtos.
create policy "qualquer_pessoa_pode_ver"
on produtos for select
to anon, authenticated
using (true);

-- Só quem estiver autenticado (você, logado no admin) pode
-- inserir, editar ou apagar produtos.
create policy "admin_pode_inserir"
on produtos for insert
to authenticated
with check (true);

create policy "admin_pode_editar"
on produtos for update
to authenticated
using (true);

create policy "admin_pode_apagar"
on produtos for delete
to authenticated
using (true);


-- =====================================================
-- MIGRAR OS 4 PRODUTOS QUE JÁ EXISTEM NO SCRIPTS.JS
-- (rode isso depois de criar a tabela acima)
-- =====================================================

insert into produtos (nome, preco, imagem, categoria, descricao, disponivel, destaque, estoque) values
(
    'Camisa Polo', 59.90, 'Img/produto1.webp', 'roupas',
    'Polo em piquet de algodão, corte reto e gola canelada. Boa pedida pra quem quer um presente que sirva pro dia a dia e também pra sair.',
    true, true,
    '{"Preto": ["P", "M", "G"], "Branco": ["M", "GG"], "Azul": ["G"]}'
),
(
    'Boné Casual', 49.90, 'Img/produto2.webp', 'bones',
    'Boné de aba curva com regulagem por fivela, tamanho único. Presente rápido de acertar — combina com praticamente qualquer estilo.',
    true, true,
    '{"Preto": true, "Branco": true, "Azul": true}'
),
(
    'Carrinho Infantil', 39.90, 'Img/produto3.webp', 'brinquedos',
    'Carrinho em miniatura com rodas soltas e acabamento resistente, indicado a partir dos 3 anos. Um clássico que raramente decepciona.',
    true, false,
    null
),
(
    'Fone Bluetooth', 79.90, 'Img/produto4.jpg', 'eletronicos',
    'Fone sem fio com bateria de longa duração e conexão automática por Bluetooth. Ótimo presente pra quem vive no celular ou no trabalho remoto.',
    true, false,
    '{"Preto": true, "Branco": true}'
);
