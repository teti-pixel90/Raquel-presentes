/* =====================================================
   CONFIGURAÇÕES DA LOJA
===================================================== */

const mostrarPrecos = true;

const numeroWhatsapp = "5518997644881";


/* =====================================================
   PRODUTOS
===================================================== */

/* =====================================================
   PRODUTOS (carregados do Supabase)
===================================================== */

let produtosLoja = {};


async function carregarProdutosDoBanco() {

    const { data, error } =
        await supabaseClient
            .from("produtos")
            .select("*")
            .order("id");


    if (error) {

        console.error(
            "Erro ao carregar produtos do Supabase:",
            error
        );

        return;

    }


    produtosLoja = {};

    data.forEach(produto => {

        produtosLoja[produto.id] = produto;

    });

}


/* =====================================================
   CATEGORIAS
===================================================== */

const nomesCategorias = {

    roupas: "Roupas",
    bones: "Bonés",
    brinquedos: "Brinquedos",
    eletronicos: "Eletrônicos"

};


let categoriaAtual = "todos";


/* =====================================================
   VERIFICAR DISPONIBILIDADE
===================================================== */

function produtoDisponivel(produto) {

    return produto.disponivel !== false;

}


/* =====================================================
   ACESSO AO CARRINHO (localStorage)
===================================================== */

function obterCarrinho() {

    return JSON.parse(
        localStorage.getItem("carrinho")
    ) || [];

}


function salvarCarrinho(carrinho) {

    localStorage.setItem(
        "carrinho",
        JSON.stringify(carrinho)
    );

}


/* =====================================================
   PRODUTOS DA HOME
===================================================== */

function carregarProdutosInicio() {

    const lista =
        document.getElementById(
            "lista-produtos"
        );


    if (!lista) {
        return;
    }


    lista.innerHTML = "";


    const produtosOrdenados =
        Object.keys(produtosLoja).sort(
            (a, b) => {

                const produtoA =
                    produtosLoja[a];

                const produtoB =
                    produtosLoja[b];


                if (
                    produtoA.destaque &&
                    !produtoB.destaque
                ) {
                    return -1;
                }


                if (
                    !produtoA.destaque &&
                    produtoB.destaque
                ) {
                    return 1;
                }


                return Number(a) - Number(b);

            }
        );


    produtosOrdenados.forEach(id => {

        const produto =
            produtosLoja[id];


        const disponivel =
            produtoDisponivel(
                produto
            );


        const categoriaNome =
            nomesCategorias[
                produto.categoria
            ] || produto.categoria;


        let seloHTML = "";


        if (!disponivel) {

            seloHTML = `
                <span class="selo-disponivel selo-esgotado">
                    Esgotado
                </span>
            `;

        } else if (produto.destaque) {

            seloHTML = `
                <span class="selo-disponivel selo-destaque">
                    Destaque
                </span>
            `;

        } else {

            seloHTML = `
                <span class="selo-disponivel">
                    Disponível
                </span>
            `;

        }


        const precoHTML =
            mostrarPrecos

                ? `
                    <p class="preco">
                        ${formatarPreco(produto.preco)}
                    </p>
                `

                : "";


        const classeEsgotado =
            disponivel
                ? ""
                : " produto-esgotado";

        const classeDestaque =
            produto.destaque
                ? " produto-destaque"
                : "";


        lista.innerHTML += `

            <div
                class="produto${classeEsgotado}${classeDestaque}"
                data-categoria="${produto.categoria}"
            >

                <div class="produto-imagem-area">

                    ${seloHTML}

                    <img
                        src="${produto.imagem}"
                        alt="${produto.nome}"
                    >

                </div>


                <div class="produto-corpo">

                    <h3>
                        ${produto.nome}
                    </h3>


                    <p class="produto-categoria">
                        ${categoriaNome}
                    </p>


                    ${precoHTML}


                    <a
                        href="produto.html?id=${id}"
                        class="comprar"
                    >
                        ${
                            disponivel
                                ? "Ver produto"
                                : "Ver produto esgotado"
                        }
                    </a>

                </div>

            </div>

        `;

    });


    aplicarFiltrosProdutos();

}


/* =====================================================
   FILTROS
===================================================== */

function filtrarProdutos(categoria) {

    categoriaAtual =
        categoria;


    document.querySelectorAll(
        ".categorias button"
    ).forEach(botao => {

        botao.classList.toggle(
            "categoria-ativa",
            botao.dataset.categoria === categoria
        );

    });


    aplicarFiltrosProdutos();

}


function buscarProdutos() {

    aplicarFiltrosProdutos();

}


function aplicarFiltrosProdutos() {

    const busca =
        document.getElementById(
            "busca"
        );


    const termo =
        busca
            ? busca.value
                .toLowerCase()
                .trim()
            : "";


    const produtos =
        document.querySelectorAll(
            ".produto"
        );


    produtos.forEach(produto => {

        const categoria =
            produto.getAttribute(
                "data-categoria"
            );


        const texto =
            produto.innerText
                .toLowerCase();


        const categoriaCorreta =
            categoriaAtual === "todos" ||
            categoria === categoriaAtual;


        const buscaCorreta =
            termo === "" ||
            texto.includes(termo);


        produto.style.display =
            categoriaCorreta &&
            buscaCorreta
                ? "flex"
                : "none";

    });

}


/* =====================================================
   PÁGINA DO PRODUTO
===================================================== */

function carregarProduto() {

    const nomeElemento =
        document.getElementById(
            "produto-nome"
        );


    if (!nomeElemento) {
        return;
    }


    const parametros =
        new URLSearchParams(
            window.location.search
        );


    const id =
        parametros.get("id");


    const produto =
        produtosLoja[id];


    if (!produto) {

        nomeElemento.innerText =
            "Produto não encontrado";

        return;

    }


    const imagem =
        document.getElementById(
            "produto-imagem"
        );


    const preco =
        document.getElementById(
            "produto-preco"
        );


    const descricao =
        document.getElementById(
            "produto-descricao"
        );


    if (imagem) {

        imagem.src =
            produto.imagem;

        imagem.alt =
            produto.nome;

    }


    nomeElemento.innerText =
        produto.nome;


    if (preco) {

        if (mostrarPrecos) {

            preco.innerText =
                formatarPreco(produto.preco);

            preco.style.display =
                "block";

        } else {

            preco.style.display =
                "none";

        }

    }


    if (descricao) {

        descricao.innerText =
            produto.descricao;

    }


    configurarStatusProduto(
        produto
    );


    carregarOpcoesProduto(
        produto
    );


    atualizarWhatsappProduto(
        produto
    );


    document.title =
        produto.nome +
        " - Raquel Presentes";

}


/* =====================================================
   STATUS DA PÁGINA DO PRODUTO
===================================================== */

function configurarStatusProduto(produto) {

    const botaoCarrinho =
        document.getElementById(
            "adicionar-carrinho"
        );


    const selo =
        document.querySelector(
            ".produto-selo-detalhe"
        );


    const disponivel =
        produtoDisponivel(
            produto
        );


    if (selo) {

        selo.classList.remove(
            "selo-esgotado",
            "selo-destaque"
        );


        if (!disponivel) {

            selo.innerText =
                "Esgotado";

            selo.classList.add(
                "selo-esgotado"
            );

        } else if (produto.destaque) {

            selo.innerText =
                "Destaque";

            selo.classList.add(
                "selo-destaque"
            );

        } else {

            selo.innerText =
                "Disponível";

        }

    }


    if (!botaoCarrinho) {
        return;
    }


    if (!disponivel) {

        botaoCarrinho.disabled =
            true;

        botaoCarrinho.innerText =
            "Produto esgotado";

        botaoCarrinho.classList.add(
            "btn-esgotado"
        );

    } else {

        botaoCarrinho.disabled =
            false;

        botaoCarrinho.innerText =
            "Adicionar ao carrinho";

        botaoCarrinho.classList.remove(
            "btn-esgotado"
        );

    }

}


/* =====================================================
   COR E TAMANHO
===================================================== */

function carregarOpcoesProduto(produto) {

    const areaCor =
        document.getElementById("area-cor");

    const grupoCor =
        document.getElementById("produto-cor");

    const areaTamanho =
        document.getElementById("area-tamanho");

    const grupoTamanho =
        document.getElementById("produto-tamanho");


    if (
        !areaCor ||
        !grupoCor ||
        !areaTamanho ||
        !grupoTamanho
    ) {
        return;
    }


    areaCor.style.display = "none";
    areaTamanho.style.display = "none";

    grupoCor.innerHTML = "";
    grupoTamanho.innerHTML = "";

    grupoCor.dataset.valor = "";
    grupoTamanho.dataset.valor = "";


    if (
        !produto.estoque ||
        typeof produto.estoque !== "object"
    ) {
        return;
    }


    const chaves =
        Object.keys(produto.estoque);


    const formatoAntigo =
        chaves.length > 0 &&
        chaves.every(
            chave =>
                ["P", "M", "G", "GG"]
                    .includes(chave)
        );


    /* ==========================================
       ESTOQUE ANTIGO — SOMENTE TAMANHO
    ========================================== */

    if (formatoAntigo) {

        areaTamanho.style.display =
            "block";


        const ordemTamanhos =
            ["P", "M", "G", "GG"];


        ordemTamanhos.forEach(
            tamanho => {

                const quantidade =
                    Number(
                        produto.estoque[tamanho]
                    ) || 0;


                const botao =
                    document.createElement(
                        "button"
                    );


                botao.type =
                    "button";

                botao.className =
                    "opcao-botao";


                if (quantidade > 0) {

                    botao.textContent =
                        `${tamanho} (${quantidade})`;

                } else {

                    botao.textContent =
                        tamanho;

                    botao.classList.add(
                        "esgotado"
                    );

                    botao.disabled =
                        true;

                }


                if (quantidade > 0) {

                    botao.addEventListener(
                        "click",
                        function () {

                            grupoTamanho
                                .querySelectorAll(
                                    ".opcao-botao"
                                )
                                .forEach(
                                    outroBotao =>
                                        outroBotao
                                            .classList
                                            .remove(
                                                "selecionado"
                                            )
                                );


                            botao.classList.add(
                                "selecionado"
                            );


                            grupoTamanho.dataset.valor =
                                tamanho;

                        }
                    );

                }


                grupoTamanho.appendChild(
                    botao
                );

            }
        );


        return;
    }


    /* ==========================================
       ESTOQUE NOVO — COR + TAMANHO
    ========================================== */

    const cores =
        chaves.filter(
            cor => {

                const tamanhos =
                    produto.estoque[cor];


                if (
                    !tamanhos ||
                    typeof tamanhos !== "object" ||
                    Array.isArray(tamanhos)
                ) {
                    return false;
                }


                return Object.values(tamanhos)
                    .some(
                        quantidade =>
                            Number(quantidade) > 0
                    );

            }
        );


    if (!cores.length) {
        return;
    }


    areaCor.style.display =
        "block";

    areaTamanho.style.display =
        "block";


    cores.forEach(
        cor => {

            const botao =
                document.createElement(
                    "button"
                );


            botao.type =
                "button";

            botao.className =
                "opcao-botao";

            botao.textContent =
                cor;


            botao.addEventListener(
                "click",
                function () {

                    grupoCor
                        .querySelectorAll(
                            ".opcao-botao"
                        )
                        .forEach(
                            outroBotao =>
                                outroBotao
                                    .classList
                                    .remove(
                                        "selecionado"
                                    )
                        );


                    botao.classList.add(
                        "selecionado"
                    );


                    grupoCor.dataset.valor =
                        cor;


                    grupoTamanho.dataset.valor =
                        "";


                    atualizarTamanhos(
                        produto
                    );

                }
            );


            grupoCor.appendChild(
                botao
            );

        }
    );

}


/* =====================================================
   TAMANHOS
===================================================== */

function atualizarTamanhos(produto) {

    const grupoCor =
        document.getElementById(
            "produto-cor"
        );

    const grupoTamanho =
        document.getElementById(
            "produto-tamanho"
        );


    if (
        !grupoCor ||
        !grupoTamanho
    ) {
        return;
    }


    const cor =
        grupoCor.dataset.valor || "";


    grupoTamanho.innerHTML = "";

    grupoTamanho.dataset.valor =
        "";


    if (!cor) {
        return;
    }


    const estoqueCor =
        produto.estoque?.[cor];


    if (
        !estoqueCor ||
        typeof estoqueCor !== "object"
    ) {
        return;
    }


    const ordemTamanhos =
        ["P", "M", "G", "GG"];


    ordemTamanhos.forEach(
        tamanho => {

            const quantidade =
                Number(
                    estoqueCor[tamanho]
                ) || 0;


            const botao =
                document.createElement(
                    "button"
                );


            botao.type =
                "button";

            botao.className =
                "opcao-botao";


            if (quantidade > 0) {

                botao.textContent =
                    `${tamanho} (${quantidade})`;

            } else {

                botao.textContent =
                    tamanho;

                botao.classList.add(
                    "esgotado"
                );

                botao.disabled =
                    true;

            }


            if (quantidade > 0) {

                botao.addEventListener(
                    "click",
                    function () {

                        grupoTamanho
                            .querySelectorAll(
                                ".opcao-botao"
                            )
                            .forEach(
                                outroBotao =>
                                    outroBotao
                                        .classList
                                        .remove(
                                            "selecionado"
                                        )
                            );


                        botao.classList.add(
                            "selecionado"
                        );


                        grupoTamanho.dataset.valor =
                            tamanho;

                    }
                );

            }


            grupoTamanho.appendChild(
                botao
            );

        }
    );

}

/* =====================================================
   WHATSAPP PRODUTO
===================================================== */

function atualizarWhatsappProduto(produto) {

    const botao =
        document.getElementById(
            "produto-whatsapp"
        );


    if (!botao) {
        return;
    }


    let mensagem =
        `Olá! Vi o ${produto.nome} no site da Raquel Presentes`;


    if (mostrarPrecos) {

        mensagem +=
            ` por ${formatarPreco(produto.preco)}`;

    }


    if (
        produtoDisponivel(
            produto
        )
    ) {

        mensagem +=
            " e gostaria de saber mais.";

    } else {

        mensagem +=
            " e gostaria de saber se haverá reposição.";

    }


    botao.href =
        "https://wa.me/" +
        numeroWhatsapp +
        "?text=" +
        encodeURIComponent(
            mensagem
        );

}


/* =====================================================
   ADICIONAR AO CARRINHO
===================================================== */

function adicionarAoCarrinho() {

    const parametros =
        new URLSearchParams(
            window.location.search
        );


    const id =
        parametros.get("id");


    const produto =
        produtosLoja[id];


    if (!produto) {
        return;
    }


    if (
        !produtoDisponivel(produto)
    ) {

        alert(
            "Este produto está esgotado."
        );

        return;
    }


    let cor = "";
    let tamanho = "";
    let quantidadeDisponivel =
        Infinity;


    if (
        produto.estoque &&
        typeof produto.estoque === "object"
    ) {

        const chaves =
            Object.keys(
                produto.estoque
            );


        const formatoAntigo =
            chaves.length > 0 &&
            chaves.every(
                chave =>
                    ["P", "M", "G", "GG"]
                        .includes(chave)
            );


        const grupoTamanho =
            document.getElementById(
                "produto-tamanho"
            );


        tamanho =
            grupoTamanho
                ? grupoTamanho.dataset.valor || ""
                : "";


        if (formatoAntigo) {

            if (!tamanho) {

                alert(
                    "Selecione o tamanho."
                );

                return;
            }


            quantidadeDisponivel =
                Number(
                    produto.estoque[tamanho]
                ) || 0;

        } else {

            const grupoCor =
                document.getElementById(
                    "produto-cor"
                );


            cor =
                grupoCor
                    ? grupoCor.dataset.valor || ""
                    : "";


            if (!cor) {

                alert(
                    "Selecione a cor."
                );

                return;
            }


            if (!tamanho) {

                alert(
                    "Selecione o tamanho."
                );

                return;
            }


            quantidadeDisponivel =
                Number(
                    produto
                        .estoque?.[cor]?.[tamanho]
                ) || 0;

        }


        if (
            quantidadeDisponivel <= 0
        ) {

            alert(
                "Esta opção está esgotada."
            );

            return;
        }

    }


    let carrinho =
        obterCarrinho();


    const produtoExistente =
        carrinho.find(
            item =>

                item.id === id &&

                item.cor === cor &&

                item.tamanho === tamanho
        );


    if (produtoExistente) {

        if (
            produtoExistente.quantidade >=
            quantidadeDisponivel
        ) {

            alert(
                "Você já adicionou todo o estoque disponível dessa opção."
            );

            return;
        }


        produtoExistente.quantidade +=
            1;

    } else {

        carrinho.push({

            id: id,

            nome: produto.nome,

            preco: produto.preco,

            imagem: produto.imagem,

            cor: cor,

            tamanho: tamanho,

            quantidade: 1

        });

    }


    salvarCarrinho(
        carrinho
    );


    atualizarContadorCarrinho();


    alert(
        "Produto adicionado ao carrinho!"
    );


    window.location.href =
        "carrinho.html";

}

/* =====================================================
   CARRINHO
===================================================== */

function carregarCarrinho() {

    const listaCarrinho =
        document.getElementById(
            "lista-carrinho"
        );


    if (!listaCarrinho) {
        return;
    }


    const totalCarrinho =
        document.getElementById(
            "total-carrinho"
        );


    const finalizarWhatsapp =
        document.getElementById(
            "finalizar-whatsapp"
        );


    const dadosPedido =
        document.getElementById(
            "dados-pedido"
        );


    const carrinho =
        obterCarrinho();


    listaCarrinho.innerHTML =
        "";


    let total = 0;


    if (carrinho.length === 0) {

        listaCarrinho.innerHTML =
            "<p>Seu carrinho está vazio.</p>";


        if (totalCarrinho) {

            totalCarrinho.innerText =
                mostrarPrecos
                    ? "Total: R$ 0,00"
                    : "Consulte os valores";

        }


        if (finalizarWhatsapp) {

            finalizarWhatsapp.style.display =
                "none";

        }


        if (dadosPedido) {

            dadosPedido.style.display =
                "none";

        }


        atualizarContadorCarrinho();

        return;

    }


    if (finalizarWhatsapp) {

        finalizarWhatsapp.style.display =
            "block";

    }


    if (dadosPedido) {

        dadosPedido.style.display =
            "block";

    }


    carrinho.forEach(
        (item, indice) => {

            const precoNumero =
                item.preco;


            total +=
                precoNumero *
                item.quantidade;


            let detalhes = "";


            if (item.cor) {

                detalhes +=
                    `<p>Cor: ${item.cor}</p>`;

            }


            if (item.tamanho) {

                detalhes +=
                    `<p>Tamanho: ${item.tamanho}</p>`;

            }


            const precoHTML =
                mostrarPrecos

                    ? `
                        <p>
                            ${formatarPreco(item.preco)}
                        </p>
                    `

                    : "";


            listaCarrinho.innerHTML += `

                <div class="item-carrinho">

                    <img
                        src="${item.imagem}"
                        alt="${item.nome}"
                    >


                    <div class="info-carrinho">

                        <h3>
                            ${item.nome}
                        </h3>


                        ${precoHTML}


                        ${detalhes}


                        <div class="quantidade-carrinho">

                            <button
                                onclick="alterarQuantidade(${indice}, -1)"
                            >
                                −
                            </button>


                            <span>
                                ${item.quantidade}
                            </span>


                            <button
                                onclick="alterarQuantidade(${indice}, 1)"
                            >
                                +
                            </button>

                        </div>


                        <button
                            class="remover-carrinho"
                            onclick="removerDoCarrinho(${indice})"
                        >
                            Remover
                        </button>

                    </div>

                </div>

            `;

        }
    );


    if (totalCarrinho) {

        totalCarrinho.innerText =
            mostrarPrecos

                ? "Total: " +
                  formatarPreco(
                      total
                  )

                : "Consulte os valores";

    }


    atualizarContadorCarrinho();

}


/* =====================================================
   ENTREGA
===================================================== */

function configurarEntrega() {

    const tipoEntrega =
        document.getElementById(
            "tipo-entrega"
        );


    const dadosEntrega =
        document.getElementById(
            "dados-entrega"
        );


    if (
        !tipoEntrega ||
        !dadosEntrega
    ) {
        return;
    }


    tipoEntrega.onchange =
        function () {

            dadosEntrega.style.display =
                tipoEntrega.value ===
                "Entrega"
                    ? "block"
                    : "none";

        };

}


/* =====================================================
   PAGAMENTO
===================================================== */

function configurarPagamento() {

    const formaPagamento =
        document.getElementById(
            "forma-pagamento"
        );


    const dadosTroco =
        document.getElementById(
            "dados-troco"
        );


    const precisaTroco =
        document.getElementById(
            "precisa-troco"
        );


    const areaValorTroco =
        document.getElementById(
            "area-valor-troco"
        );


    const valorTroco =
        document.getElementById(
            "valor-troco"
        );


    if (
        !formaPagamento ||
        !dadosTroco ||
        !precisaTroco ||
        !areaValorTroco
    ) {
        return;
    }


    formaPagamento.onchange =
        function () {

            if (
                formaPagamento.value ===
                "Dinheiro"
            ) {

                dadosTroco.style.display =
                    "block";

            } else {

                dadosTroco.style.display =
                    "none";

                areaValorTroco.style.display =
                    "none";

                precisaTroco.value =
                    "";

                if (valorTroco) {

                    valorTroco.value =
                        "";

                }

            }

        };


    precisaTroco.onchange =
        function () {

            areaValorTroco.style.display =
                precisaTroco.value ===
                "Sim"
                    ? "block"
                    : "none";

        };

}


/* =====================================================
   FINALIZAR PEDIDO
===================================================== */

function finalizarPedido(event) {

    event.preventDefault();


    const carrinho =
        obterCarrinho();


    if (!carrinho.length) {

        alert(
            "Seu carrinho está vazio."
        );

        return;

    }


    const nomeElemento =
        document.getElementById(
            "cliente-nome"
        );


    const entregaElemento =
        document.getElementById(
            "tipo-entrega"
        );


    const pagamentoElemento =
        document.getElementById(
            "forma-pagamento"
        );


    const nome =
        nomeElemento.value.trim();


    const tipoEntrega =
        entregaElemento.value;


    const formaPagamento =
        pagamentoElemento.value;


    if (!nome) {

        alert(
            "Digite seu nome."
        );

        return;

    }


    if (!tipoEntrega) {

        alert(
            "Escolha entrega ou retirada."
        );

        return;

    }


    if (!formaPagamento) {

        alert(
            "Escolha a forma de pagamento."
        );

        return;

    }


    let endereco = "";
    let cidade = "";


    if (
        tipoEntrega ===
        "Entrega"
    ) {

        endereco =
            document
                .getElementById(
                    "cliente-endereco"
                )
                .value
                .trim();


        cidade =
            document
                .getElementById(
                    "cliente-cidade"
                )
                .value
                .trim();


        if (
            !endereco ||
            !cidade
        ) {

            alert(
                "Preencha o endereço e a cidade."
            );

            return;

        }

    }


    let precisaTroco = "";
    let valorTroco = "";


    if (
        formaPagamento ===
        "Dinheiro"
    ) {

        precisaTroco =
            document
                .getElementById(
                    "precisa-troco"
                )
                .value;


        if (!precisaTroco) {

            alert(
                "Informe se precisa de troco."
            );

            return;

        }


        if (
            precisaTroco ===
            "Sim"
        ) {

            valorTroco =
                document
                    .getElementById(
                        "valor-troco"
                    )
                    .value;


            if (!valorTroco) {

                alert(
                    "Informe para quanto precisa de troco."
                );

                return;

            }

        }

    }


    let total = 0;


    let mensagem =
        "Olá! Gostaria de fazer este pedido:\n\n";


    carrinho.forEach(item => {

        mensagem +=
            `${item.quantidade}x ${item.nome}\n`;


        if (item.cor) {

            mensagem +=
                `Cor: ${item.cor}\n`;

        }


        if (item.tamanho) {

            mensagem +=
                `Tamanho: ${item.tamanho}\n`;

        }


        if (mostrarPrecos) {

            const subtotal =
                item.preco *
                item.quantidade;


            total +=
                subtotal;


            mensagem +=
                `Subtotal: ${formatarPreco(subtotal)}\n`;

        }


        mensagem += "\n";

    });


    if (mostrarPrecos) {

        mensagem +=
            `Total: ${formatarPreco(total)}\n\n`;

    }


    mensagem +=
        `Nome: ${nome}\n`;


    mensagem +=
        `Recebimento: ${tipoEntrega}\n`;


    mensagem +=
        `Pagamento: ${formaPagamento}\n`;


    if (
        tipoEntrega ===
        "Entrega"
    ) {

        mensagem +=
            `Endereço: ${endereco}\n`;


        mensagem +=
            `Cidade: ${cidade}\n`;

    }


    if (
        formaPagamento ===
        "Dinheiro"
    ) {

        mensagem +=
            `Precisa de troco: ${precisaTroco}\n`;


        if (
            precisaTroco ===
            "Sim"
        ) {

            mensagem +=
                `Troco para: R$ ${valorTroco}\n`;

        }

    }


    window.location.href =
        "https://wa.me/" +
        numeroWhatsapp +
        "?text=" +
        encodeURIComponent(
            mensagem
        );

}


/* =====================================================
   QUANTIDADE
===================================================== */

function alterarQuantidade(
    indice,
    mudanca
) {

    let carrinho =
        obterCarrinho();


    if (!carrinho[indice]) {
        return;
    }


    carrinho[indice].quantidade +=
        mudanca;


    if (
        carrinho[indice].quantidade <=
        0
    ) {

        carrinho.splice(
            indice,
            1
        );

    }


    salvarCarrinho(carrinho);


    carregarCarrinho();

    atualizarContadorCarrinho();

}


/* =====================================================
   REMOVER
===================================================== */

function removerDoCarrinho(indice) {

    let carrinho =
        obterCarrinho();


    carrinho.splice(
        indice,
        1
    );


    salvarCarrinho(carrinho);


    carregarCarrinho();

    atualizarContadorCarrinho();

}


/* =====================================================
   CONTADOR
===================================================== */

function atualizarContadorCarrinho() {

    const contador =
        document.getElementById(
            "contador-carrinho"
        );


    if (!contador) {
        return;
    }


    const carrinho =
        obterCarrinho();


    let quantidade = 0;


    carrinho.forEach(item => {

        quantidade +=
            Number(
                item.quantidade
            ) || 0;

    });


    contador.innerText =
        quantidade;

}


/* =====================================================
   PREÇO
===================================================== */

function formatarPreco(valor) {

    return valor.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


/* =====================================================
   INICIAR
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        await carregarProdutosDoBanco();

        carregarProdutosInicio();

        carregarProduto();

        carregarCarrinho();

        atualizarContadorCarrinho();

        configurarEntrega();

        configurarPagamento();

    }
);
