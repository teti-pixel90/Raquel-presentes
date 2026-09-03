/* =====================================================
   ELEMENTOS
===================================================== */

const telaLogin = document.getElementById("tela-login");
const telaPainel = document.getElementById("tela-painel");
const formLogin = document.getElementById("form-login");
const loginErro = document.getElementById("login-erro");
const adminUsuario = document.getElementById("admin-usuario");
const btnSair = document.getElementById("btn-sair");

const formTitulo = document.getElementById("form-titulo");
const produtoIdEdicao = document.getElementById("produto-id-edicao");
const btnSalvar = document.getElementById("btn-salvar");
const btnCancelarEdicao = document.getElementById("btn-cancelar-edicao");
const adminStatus = document.getElementById("admin-status");
const adminLista = document.getElementById("admin-lista");

const inputImagemArquivo = document.getElementById("f-imagem-arquivo");
const inputImagemAtual = document.getElementById("f-imagem-atual");
const previewImagem = document.getElementById("admin-preview-imagem");
const previewImg = document.getElementById("admin-preview-img");
const previewTexto = document.getElementById("admin-preview-texto");
const btnRemoverImagem = document.getElementById("btn-remover-imagem");

const categoriaSelect = document.getElementById("f-categoria");
const blocoEstoque = document.getElementById("bloco-estoque");

const listaCores = document.getElementById("lista-cores");
const btnAdicionarCor = document.getElementById("btn-adicionar-cor");


const STORAGE_BUCKET = "produtos";
const LIMITE_IMAGEM_BYTES = 5 * 1024 * 1024;


/* =====================================================
   ESTOQUE / CATEGORIAS
===================================================== */

function atualizarEstoquePorCategoria() {
    if (categoriaSelect.value === "roupas") {
        blocoEstoque.style.display = "block";
    } else {
        blocoEstoque.style.display = "none";
    }
}

categoriaSelect.addEventListener(
    "change",
    atualizarEstoquePorCategoria
);

atualizarEstoquePorCategoria();


/* =====================================================
   CORES / TAMANHOS
===================================================== */

function criarGrupoCor(cor = "", tamanhos = {}) {

    const grupo = document.createElement("div");

    grupo.className = "grupo-cor";

    grupo.innerHTML = `

        <label>Cor</label>

        <input
            type="text"
            class="estoque-cor"
            placeholder="Ex: Preto"
            value="${escaparAtributo(cor)}"
        >


        <div class="admin-linha-dupla">

            <div>

                <label>P</label>

                <input
                    type="number"
                    class="estoque-p"
                    min="0"
                    value="${Number(tamanhos.P) || 0}"
                >

            </div>


            <div>

                <label>M</label>

                <input
                    type="number"
                    class="estoque-m"
                    min="0"
                    value="${Number(tamanhos.M) || 0}"
                >

            </div>

        </div>


        <div class="admin-linha-dupla">

            <div>

                <label>G</label>

                <input
                    type="number"
                    class="estoque-g"
                    min="0"
                    value="${Number(tamanhos.G) || 0}"
                >

            </div>


            <div>

                <label>GG</label>

                <input
                    type="number"
                    class="estoque-gg"
                    min="0"
                    value="${Number(tamanhos.GG) || 0}"
                >

            </div>

        </div>


        <button
            type="button"
            class="admin-botao-secundario btn-remover-cor"
        >
            Remover cor
        </button>

    `;


    grupo
        .querySelector(".btn-remover-cor")
        .addEventListener("click", function () {

            const grupos =
                listaCores.querySelectorAll(".grupo-cor");

            if (grupos.length === 1) {

                grupo.querySelector(
                    ".estoque-cor"
                ).value = "";

                grupo.querySelector(
                    ".estoque-p"
                ).value = 0;

                grupo.querySelector(
                    ".estoque-m"
                ).value = 0;

                grupo.querySelector(
                    ".estoque-g"
                ).value = 0;

                grupo.querySelector(
                    ".estoque-gg"
                ).value = 0;

                return;
            }

            grupo.remove();

        });


    return grupo;
}


function escaparAtributo(valor) {

    return String(valor ?? "")

        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

}


function resetarGruposCores() {

    listaCores.innerHTML = "";

    listaCores.appendChild(
        criarGrupoCor()
    );

}


function carregarGruposCores(estoque) {

    listaCores.innerHTML = "";


    if (
        !estoque ||
        typeof estoque !== "object"
    ) {

        listaCores.appendChild(
            criarGrupoCor()
        );

        return;
    }


    const chaves = Object.keys(estoque);


    const formatoAntigo =
        chaves.length > 0 &&
        chaves.every(
            chave =>
                ["P", "M", "G", "GG"]
                    .includes(chave)
        );


    if (formatoAntigo) {

        listaCores.appendChild(
            criarGrupoCor("", estoque)
        );

        return;
    }


    chaves.forEach(cor => {

        const tamanhos = estoque[cor];

        if (
            tamanhos &&
            typeof tamanhos === "object" &&
            !Array.isArray(tamanhos)
        ) {

            listaCores.appendChild(
                criarGrupoCor(
                    cor,
                    tamanhos
                )
            );

        }

    });


    if (
        !listaCores.querySelector(
            ".grupo-cor"
        )
    ) {

        listaCores.appendChild(
            criarGrupoCor()
        );

    }

}


function montarEstoqueDoFormulario() {

    const estoque = {};


    const grupos =
        listaCores.querySelectorAll(
            ".grupo-cor"
        );


    for (const grupo of grupos) {

        const cor =
            grupo
                .querySelector(".estoque-cor")
                .value
                .trim();


        if (!cor) {

            throw new Error(
                "Preencha o nome de todas as cores."
            );

        }


        if (
            Object.prototype
                .hasOwnProperty
                .call(
                    estoque,
                    cor
                )
        ) {

            throw new Error(
                `A cor "${cor}" foi cadastrada mais de uma vez.`
            );

        }


        estoque[cor] = {

            P:
                Number(
                    grupo
                        .querySelector(".estoque-p")
                        .value
                ) || 0,

            M:
                Number(
                    grupo
                        .querySelector(".estoque-m")
                        .value
                ) || 0,

            G:
                Number(
                    grupo
                        .querySelector(".estoque-g")
                        .value
                ) || 0,

            GG:
                Number(
                    grupo
                        .querySelector(".estoque-gg")
                        .value
                ) || 0

        };

    }


    return estoque;

}


btnAdicionarCor.addEventListener(
    "click",
    function () {

        listaCores.appendChild(
            criarGrupoCor()
        );

    }
);


/* =====================================================
   SESSÃO / LOGIN
===================================================== */

async function verificarSessao() {

    const { data } =
        await supabaseClient.auth.getSession();


    if (data.session) {

        mostrarPainel(
            data.session.user
        );

    } else {

        telaLogin.style.display = "block";
        telaPainel.style.display = "none";

    }

}


formLogin.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        loginErro.textContent = "";


        const email =
            document
                .getElementById("login-email")
                .value
                .trim();


        const senha =
            document
                .getElementById("login-senha")
                .value;


        const { data, error } =
            await supabaseClient.auth
                .signInWithPassword({

                    email: email,
                    password: senha

                });


        if (error) {

            loginErro.textContent =
                "Não foi possível entrar. Confira o email e a senha.";

            return;
        }


        mostrarPainel(
            data.user
        );

    }
);


btnSair.addEventListener(
    "click",
    async function () {

        await supabaseClient.auth.signOut();

        telaLogin.style.display = "block";
        telaPainel.style.display = "none";

    }
);


function mostrarPainel(usuario) {

    telaLogin.style.display = "none";
    telaPainel.style.display = "block";

    adminUsuario.textContent =
        "Logado como " +
        usuario.email;

    carregarListaAdmin();

}


/* =====================================================
   LISTAR PRODUTOS
===================================================== */

async function carregarListaAdmin() {

    const { data, error } =
        await supabaseClient

            .from("produtos")

            .select("*")

            .order("id");


    if (error) {

        adminLista.innerHTML =
            "<p>Erro ao carregar produtos.</p>";

        return;
    }


    adminLista.innerHTML = "";


    data.forEach(produto => {

        const linha =
            document.createElement("div");


        linha.className =
            "admin-produto-linha";


        linha.innerHTML = `

            <img
                src="${produto.imagem}"
                alt="${produto.nome}"
            >

            <div class="admin-produto-info">

                <h3>
                    ${produto.nome}
                    ${produto.destaque
                        ? " · Destaque"
                        : ""}
                </h3>

                <p>
                    ${formatarPrecoAdmin(produto.preco)}
                    ·
                    ${produto.categoria}
                    ·
                    ${produto.disponivel
                        ? "Disponível"
                        : "Esgotado"}
                </p>

            </div>


            <div class="admin-produto-acoes">

                <button class="editar">
                    Editar
                </button>

                <button class="apagar">
                    Apagar
                </button>

            </div>

        `;


        linha
            .querySelector(".editar")
            .addEventListener(
                "click",
                () =>
                    preencherFormularioEdicao(
                        produto
                    )
            );


        linha
            .querySelector(".apagar")
            .addEventListener(
                "click",
                () =>
                    apagarProduto(
                        produto.id,
                        produto.nome,
                        produto.imagem
                    )
            );


        adminLista.appendChild(
            linha
        );

    });

}


function formatarPrecoAdmin(valor) {

    return Number(valor)
        .toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

}


/* =====================================================
   IMAGENS / SUPABASE STORAGE
===================================================== */

inputImagemArquivo.addEventListener(
    "change",
    function () {

        const arquivo =
            inputImagemArquivo.files[0];


        if (!arquivo) {

            mostrarPreviewImagem(
                inputImagemAtual.value,
                inputImagemAtual.value
                    ? "Foto atual"
                    : ""
            );

            return;
        }


        if (
            !arquivo.type
                .startsWith("image/")
        ) {

            adminStatus.textContent =
                "Escolha um arquivo de imagem válido.";

            inputImagemArquivo.value = "";

            return;
        }


        if (
            arquivo.size >
            LIMITE_IMAGEM_BYTES
        ) {

            adminStatus.textContent =
                "A imagem é muito grande. Use uma foto de até 5 MB.";

            inputImagemArquivo.value = "";

            return;
        }


        const urlTemporaria =
            URL.createObjectURL(
                arquivo
            );


        mostrarPreviewImagem(
            urlTemporaria,
            arquivo.name
        );

    }
);


function mostrarPreviewImagem(
    url,
    texto = ""
) {

    if (!url) {

        previewImagem.style.display =
            "none";

        previewImg.removeAttribute(
            "src"
        );

        previewTexto.textContent = "";

        btnRemoverImagem.style.display =
            "none";

        return;
    }


    previewImg.src = url;

    previewTexto.textContent =
        texto;

    previewImagem.style.display =
        "flex";

    btnRemoverImagem.style.display =
        "inline-block";

}


function sanitizarNomeArquivo(nome) {

    return nome

        .normalize("NFD")

        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .toLowerCase()

        .replace(
            /[^a-z0-9._-]/g,
            "-"
        )

        .replace(
            /-+/g,
            "-"
        );

}


async function enviarImagemParaStorage(
    arquivo
) {

    const { data: sessaoData } =
        await supabaseClient.auth
            .getSession();


    const usuario =
        sessaoData.session?.user;


    if (!usuario) {

        throw new Error(
            "Sessão expirada. Entre novamente no painel."
        );

    }


    const nomeSeguro =
        sanitizarNomeArquivo(
            arquivo.name ||
            "produto.jpg"
        );


    const caminho =
        `${usuario.id}/${Date.now()}-${nomeSeguro}`;


    const { error: uploadError } =
        await supabaseClient.storage

            .from(STORAGE_BUCKET)

            .upload(
                caminho,
                arquivo,
                {
                    cacheControl:
                        "3600",

                    upsert:
                        false,

                    contentType:
                        arquivo.type
                }
            );


    if (uploadError) {

        throw uploadError;

    }


    const { data: urlData } =
        supabaseClient.storage

            .from(STORAGE_BUCKET)

            .getPublicUrl(
                caminho
            );


    if (
        !urlData?.publicUrl
    ) {

        throw new Error(
            "Não foi possível obter a URL pública da imagem."
        );

    }


    return {

        url:
            urlData.publicUrl,

        caminho:
            caminho

    };

}


function obterCaminhoStorageDaUrl(
    url
) {

    if (
        !url ||
        typeof url !== "string"
    ) {

        return null;
    }


    const marcador =
        `/storage/v1/object/public/${STORAGE_BUCKET}/`;


    const indice =
        url.indexOf(
            marcador
        );


    if (
        indice === -1
    ) {

        return null;
    }


    const caminho =
        url
            .slice(
                indice +
                marcador.length
            )
            .split("?")[0];


    return decodeURIComponent(
        caminho
    );

}


async function apagarImagemDoStorage(
    url
) {

    const caminho =
        obterCaminhoStorageDaUrl(
            url
        );


    if (!caminho) {
        return;
    }


    const { error } =
        await supabaseClient.storage

            .from(STORAGE_BUCKET)

            .remove(
                [caminho]
            );


    if (error) {

        console.warn(
            "Não foi possível apagar a imagem antiga:",
            error.message
        );

    }

}


/* =====================================================
   CRIAR / EDITAR
===================================================== */

btnSalvar.addEventListener(
    "click",
    async function (event) {

        event.preventDefault();


        adminStatus.textContent = "";

        btnSalvar.disabled = true;


        const idEmEdicao =
            produtoIdEdicao.value;


        const imagemAnterior =
            inputImagemAtual.value.trim();


        const arquivoNovo =
            inputImagemArquivo.files[0];


        let estoqueProduto = null;


        if (
            categoriaSelect.value ===
            "roupas"
        ) {

            try {

                estoqueProduto =
                    montarEstoqueDoFormulario();

            } catch (erro) {

                adminStatus.textContent =
                    erro.message;

                btnSalvar.disabled =
                    false;

                return;
            }

        }


        const produto = {

            nome:
                document
                    .getElementById("f-nome")
                    .value
                    .trim(),

            preco:
                parseFloat(
                    document
                        .getElementById("f-preco")
                        .value
                ),

            categoria:
                document
                    .getElementById("f-categoria")
                    .value,

            imagem:
                imagemAnterior,

            descricao:
                document
                    .getElementById("f-descricao")
                    .value
                    .trim(),

            disponivel:
                document
                    .getElementById("f-disponivel")
                    .checked,

            destaque:
                document
                    .getElementById("f-destaque")
                    .checked,

            estoque:
                estoqueProduto

        };


        if (
            !produto.nome ||
            !produto.descricao ||
            Number.isNaN(
                produto.preco
            )
        ) {

            adminStatus.textContent =
                "Preencha todos os campos obrigatórios.";

            btnSalvar.disabled =
                false;

            return;
        }


        if (
            !arquivoNovo &&
            !imagemAnterior
        ) {

            adminStatus.textContent =
                "Escolha uma foto para o produto.";

            btnSalvar.disabled =
                false;

            return;
        }


        let imagemNovaEnviada =
            null;


        try {

            if (arquivoNovo) {

                adminStatus.textContent =
                    "Enviando foto...";


                imagemNovaEnviada =
                    await enviarImagemParaStorage(
                        arquivoNovo
                    );


                produto.imagem =
                    imagemNovaEnviada.url;

            }


            adminStatus.textContent =
                "Salvando produto...";


            let resultado;


            if (idEmEdicao) {

                resultado =
                    await supabaseClient

                        .from("produtos")

                        .update(produto)

                        .eq(
                            "id",
                            idEmEdicao
                        );

            } else {

                resultado =
                    await supabaseClient

                        .from("produtos")

                        .insert(
                            produto
                        );

            }


            if (
                resultado.error
            ) {

                if (
                    imagemNovaEnviada
                ) {

                    await apagarImagemDoStorage(
                        imagemNovaEnviada.url
                    );

                }


                throw resultado.error;

            }


            if (
                imagemNovaEnviada &&
                imagemAnterior &&
                imagemAnterior !==
                imagemNovaEnviada.url
            ) {

                await apagarImagemDoStorage(
                    imagemAnterior
                );

            }


            adminStatus.textContent =
                "Produto salvo com sucesso.";


            limparFormulario();


            await carregarListaAdmin();


        } catch (erro) {

            adminStatus.textContent =
                "Erro ao salvar: " +
                (
                    erro.message ||
                    "erro desconhecido"
                );

        } finally {

            btnSalvar.disabled =
                false;

        }

    }
);


/* =====================================================
   EDITAR PRODUTO
===================================================== */

function preencherFormularioEdicao(
    produto
) {

    formTitulo.textContent =
        "Editar produto";


    produtoIdEdicao.value =
        produto.id;


    document
        .getElementById("f-nome")
        .value =
        produto.nome;


    document
        .getElementById("f-preco")
        .value =
        produto.preco;


    document
        .getElementById("f-categoria")
        .value =
        produto.categoria;


    atualizarEstoquePorCategoria();


    carregarGruposCores(
        produto.estoque
    );


    inputImagemArquivo.value =
        "";


    inputImagemAtual.value =
        produto.imagem || "";


    document
        .getElementById("f-descricao")
        .value =
        produto.descricao;


    document
        .getElementById("f-disponivel")
        .checked =
        produto.disponivel;


    document
        .getElementById("f-destaque")
        .checked =
        produto.destaque;


    mostrarPreviewImagem(

        produto.imagem,

        "Foto atual — escolha outra apenas se quiser trocar"

    );


    btnCancelarEdicao.style.display =
        "inline-block";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


btnCancelarEdicao.addEventListener(
    "click",
    limparFormulario
);


/* =====================================================
   LIMPAR FORMULÁRIO
===================================================== */

function limparFormulario() {

    formTitulo.textContent =
        "Novo produto";


    produtoIdEdicao.value =
        "";


    document
        .getElementById("f-nome")
        .value =
        "";


    document
        .getElementById("f-preco")
        .value =
        "";


    document
        .getElementById("f-categoria")
        .value =
        "roupas";


    resetarGruposCores();


    atualizarEstoquePorCategoria();


    inputImagemArquivo.value =
        "";


    inputImagemAtual.value =
        "";


    document
        .getElementById("f-descricao")
        .value =
        "";


    document
        .getElementById("f-disponivel")
        .checked =
        true;


    document
        .getElementById("f-destaque")
        .checked =
        false;


    mostrarPreviewImagem("");


    btnCancelarEdicao.style.display =
        "none";

}


/* =====================================================
   APAGAR
===================================================== */

async function apagarProduto(
    id,
    nome,
    imagemUrl
) {

    const confirmar =
        window.confirm(

            "Apagar \"" +
            nome +
            "\"? Essa ação não pode ser desfeita."

        );


    if (!confirmar) {
        return;
    }


    const { error } =
        await supabaseClient

            .from("produtos")

            .delete()

            .eq(
                "id",
                id
            );


    if (error) {

        adminStatus.textContent =
            "Erro ao apagar: " +
            error.message;

        return;
    }


    await apagarImagemDoStorage(
        imagemUrl
    );


    adminStatus.textContent =
        "Produto apagado com sucesso.";


    carregarListaAdmin();

}


/* =====================================================
   REMOVER IMAGEM
===================================================== */

btnRemoverImagem.addEventListener(
    "click",
    function () {

        inputImagemArquivo.value =
            "";


        mostrarPreviewImagem(

            inputImagemAtual.value,

            inputImagemAtual.value
                ? "Foto atual"
                : ""

        );

    }
);


/* =====================================================
   INICIAR
===================================================== */

resetarGruposCores();

verificarSessao();