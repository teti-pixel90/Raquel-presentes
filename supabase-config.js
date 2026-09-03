/* =====================================================
   CONEXÃO COM O SUPABASE

   Troque os dois valores abaixo pelos do SEU projeto:
   Painel do Supabase → Project Settings → API

   SUPABASE_URL   → campo "Project URL"
   SUPABASE_CHAVE → campo "anon public" (a chave pública,
                    NÃO a "service_role" — essa nunca vai
                    no código do site)
===================================================== */

const SUPABASE_URL = "https://zvqixibwvzgkriqfpzoq.supabase.co";
const SUPABASE_CHAVE = "sb_publishable_LSF7g6m1qeSmwWshfUaOOQ_n0efLCi1";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_CHAVE
);
