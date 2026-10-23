// meu-bolso — funcionamento do app.
(function () {
  "use strict";

  var cfg = window.MEU_BOLSO;
  var $ = function (id) { return document.getElementById(id); };

  if (!window.supabase || !cfg) {
    document.body.innerHTML =
      '<p class="msg" style="padding:24px">Não foi possível carregar o app. Confira a internet e recarregue a página.</p>';
    return;
  }

  var banco = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_CHAVE_PUBLICA);
  var usuario = null;
  var categoriaEscolhida = null;
  var gastos = [];

  // ---------- Utilidades ----------

  var moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

  function dataLocal(d) {
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var dia = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + dia;
  }

  function hoje() { return dataLocal(new Date()); }

  function inicioDoMes() {
    var d = new Date();
    return dataLocal(new Date(d.getFullYear(), d.getMonth(), 1));
  }

  function fimDoMes() {
    var d = new Date();
    return dataLocal(new Date(d.getFullYear(), d.getMonth() + 1, 0));
  }

  // A semana começa na segunda-feira.
  function inicioDaSemana() {
    var d = new Date();
    var recuo = (d.getDay() + 6) % 7;
    return dataLocal(new Date(d.getFullYear(), d.getMonth(), d.getDate() - recuo));
  }

  function dataCurta(iso) {
    var p = iso.split("-");
    return p[2] + "/" + p[1];
  }

  function lerValor(texto) {
    var limpo = String(texto).replace(/[^\d,.-]/g, "");
    // "1.234,56" -> "1234.56"; "12,5" -> "12.5"; "12.5" continua
    if (limpo.indexOf(",") >= 0) limpo = limpo.replace(/\./g, "").replace(",", ".");
    var n = Number(limpo);
    return isFinite(n) ? Math.round(n * 100) / 100 : NaN;
  }

  // Todo erro vira uma frase em português dizendo o que fazer.
  function traduzirErro(erro) {
    var m = String((erro && (erro.message || erro.error_description)) || erro || "").toLowerCase();
    if (!navigator.onLine || m.indexOf("failed to fetch") >= 0 || m.indexOf("network") >= 0)
      return "Sem internet. Confira a conexão e tente de novo.";
    if (m.indexOf("invalid login") >= 0)
      return "E-mail ou senha incorretos. Confira e tente de novo.";
    if (m.indexOf("already registered") >= 0 || m.indexOf("already exists") >= 0)
      return "Este e-mail já tem conta. Toque em Entrar.";
    if (m.indexOf("password") >= 0 && (m.indexOf("6") >= 0 || m.indexOf("short") >= 0 || m.indexOf("weak") >= 0))
      return "A senha precisa ter pelo menos 6 caracteres. Escolha outra.";
    if (m.indexOf("email") >= 0 && m.indexOf("invalid") >= 0)
      return "Este e-mail não parece válido. Confira e tente de novo.";
    if (m.indexOf("email not confirmed") >= 0)
      return "O Supabase está pedindo confirmação de e-mail. Desligue essa opção no painel do Supabase e tente de novo.";
    if (m.indexOf("rate limit") >= 0 || m.indexOf("too many") >= 0)
      return "Muitas tentativas seguidas. Espere um minuto e tente de novo.";
    if (m.indexOf("row-level security") >= 0 || m.indexOf("permission") >= 0 || m.indexOf("jwt") >= 0)
      return "Sua sessão não tem permissão para isso. Saia e entre de novo.";
    return "Algo deu errado. Tente de novo em instantes.";
  }

  function mostrarMsg(el, texto, tipo) {
    el.textContent = texto || "";
    el.className = "msg" + (tipo ? " " + tipo : "");
  }

  // ---------- Telas ----------

  function mostrarEntrada() {
    usuario = null;
    $("tela-app").hidden = true;
    $("tela-entrada").hidden = false;
  }

  function mostrarApp(u) {
    usuario = u;
    $("tela-entrada").hidden = true;
    $("tela-app").hidden = false;
    $("data").value = hoje();
    carregarTudo();
  }

  // ---------- Entrada ----------

  function lerCredenciais() {
    var email = $("email").value.trim();
    var senha = $("senha").value;
    if (!email || !senha) {
      mostrarMsg($("msg-entrada"), "Preencha o e-mail e a senha.", "erro");
      return null;
    }
    return { email: email, password: senha };
  }

  function ocupado(sim) {
    $("btn-entrar").disabled = sim;
    $("btn-criar").disabled = sim;
  }

  $("form-entrada").addEventListener("submit", async function (e) {
    e.preventDefault();
    var cred = lerCredenciais();
    if (!cred) return;
    ocupado(true);
    mostrarMsg($("msg-entrada"), "Entrando…");
    var r = await banco.auth.signInWithPassword(cred);
    ocupado(false);
    if (r.error) return mostrarMsg($("msg-entrada"), traduzirErro(r.error), "erro");
    mostrarMsg($("msg-entrada"), "");
  });

  $("btn-criar").addEventListener("click", async function () {
    var cred = lerCredenciais();
    if (!cred) return;
    ocupado(true);
    mostrarMsg($("msg-entrada"), "Criando sua conta…");
    var r = await banco.auth.signUp(cred);
    ocupado(false);
    if (r.error) return mostrarMsg($("msg-entrada"), traduzirErro(r.error), "erro");
    if (!r.data.session) {
      return mostrarMsg($("msg-entrada"),
        "Conta criada, mas o Supabase está pedindo confirmação de e-mail. Desligue essa opção no painel do Supabase e toque em Entrar.",
        "erro");
    }
    mostrarMsg($("msg-entrada"), "");
  });

  $("btn-sair").addEventListener("click", async function () {
    await banco.auth.signOut();
  });

  banco.auth.onAuthStateChange(function (_evento, sessao) {
    if (sessao && sessao.user) {
      if (!usuario || usuario.id !== sessao.user.id) mostrarApp(sessao.user);
    } else {
      mostrarEntrada();
    }
  });

  // ---------- Categorias ----------

  function montarCategorias() {
    var caixa = $("categorias");
    caixa.innerHTML = "";
    cfg.CATEGORIAS.forEach(function (nome) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = nome;
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", "false");
      b.addEventListener("click", function () {
        categoriaEscolhida = nome;
        Array.prototype.forEach.call(caixa.children, function (c) {
          c.setAttribute("aria-checked", String(c === b));
        });
      });
      caixa.appendChild(b);
    });
  }

  // ---------- Dados ----------

  async function carregarTudo() {
    await Promise.all([carregarGastos(), carregarResumo()]);
  }

  async function carregarGastos() {
    // Busca desde o que vier antes: começo do mês ou começo da semana.
    var desde = inicioDaSemana() < inicioDoMes() ? inicioDaSemana() : inicioDoMes();
    var r = await banco
      .from("gastos")
      .select("id, data, descricao, valor, categoria, origem")
      .gte("data", desde)
      .lte("data", fimDoMes())
      .order("data", { ascending: false })
      .order("criado_em", { ascending: false });
    if (r.error) {
      $("lista-vazia").hidden = false;
      $("lista-vazia").textContent = traduzirErro(r.error);
      return;
    }
    gastos = r.data || [];
    desenhar();
  }

  async function carregarResumo() {
    var r = await banco
      .from("resumos")
      .select("texto")
      .order("criado_em", { ascending: false })
      .limit(1);
    var texto = !r.error && r.data && r.data[0] && r.data[0].texto;
    $("cartao-resumo").hidden = !texto;
    $("texto-resumo").textContent = texto || "";
  }

  // ---------- Desenho ----------

  function soma(lista) {
    return lista.reduce(function (t, g) { return t + Number(g.valor || 0); }, 0);
  }

  function desenhar() {
    var mes0 = inicioDoMes(), sem0 = inicioDaSemana(), dia = hoje();
    var doMes = gastos.filter(function (g) { return g.data >= mes0; });

    $("total-mes").textContent = moeda.format(soma(doMes));
    $("total-semana").textContent = moeda.format(soma(gastos.filter(function (g) { return g.data >= sem0 && g.data <= dia; })));
    $("total-hoje").textContent = moeda.format(soma(gastos.filter(function (g) { return g.data === dia; })));

    desenharBarras(doMes);
    desenharLista(doMes);
  }

  function desenharBarras(doMes) {
    var porCat = {};
    cfg.CATEGORIAS.forEach(function (c) { porCat[c] = 0; });
    doMes.forEach(function (g) {
      var c = porCat.hasOwnProperty(g.categoria) ? g.categoria : "Outros";
      porCat[c] += Number(g.valor || 0);
    });
    var maior = Math.max.apply(null, cfg.CATEGORIAS.map(function (c) { return porCat[c]; })) || 1;

    var caixa = $("barras");
    caixa.innerHTML = "";
    cfg.CATEGORIAS.forEach(function (c) {
      var linha = document.createElement("div");
      linha.className = "barra-linha";

      var topo = document.createElement("div");
      topo.className = "barra-topo";
      var nome = document.createElement("span");
      nome.textContent = c;
      var valor = document.createElement("span");
      valor.className = "barra-valor";
      valor.textContent = moeda.format(porCat[c]);
      topo.append(nome, valor);

      var trilho = document.createElement("div");
      trilho.className = "barra-trilho";
      var cheio = document.createElement("div");
      cheio.className = "barra-cheia";
      cheio.style.width = (porCat[c] / maior * 100) + "%";
      trilho.appendChild(cheio);

      linha.append(topo, trilho);
      caixa.appendChild(linha);
    });
  }

  function desenharLista(doMes) {
    var ul = $("lista");
    ul.innerHTML = "";
    $("lista-vazia").textContent = "Nenhum gasto neste mês ainda.";
    $("lista-vazia").hidden = doMes.length > 0;

    doMes.forEach(function (g) {
      var li = document.createElement("li");

      var info = document.createElement("div");
      info.className = "item-info";
      var titulo = document.createElement("span");
      titulo.className = "item-titulo";
      titulo.textContent = g.descricao || g.categoria;
      var detalhe = document.createElement("span");
      detalhe.className = "item-detalhe";
      detalhe.textContent = dataCurta(g.data) + " · " + g.categoria;
      info.append(titulo, detalhe);

      var valor = document.createElement("span");
      valor.className = "item-valor";
      valor.textContent = moeda.format(Number(g.valor || 0));

      var apagar = document.createElement("button");
      apagar.type = "button";
      apagar.className = "apagar";
      apagar.textContent = "Apagar";
      apagar.setAttribute("aria-label", "Apagar gasto de " + moeda.format(Number(g.valor || 0)));
      apagar.addEventListener("click", function () { apagarGasto(g, apagar); });

      li.append(info, valor, apagar);
      ul.appendChild(li);
    });
  }

  // ---------- Lançar à mão ----------

  $("form-gasto").addEventListener("submit", async function (e) {
    e.preventDefault();
    var msg = $("msg-gasto");
    var valor = lerValor($("valor").value);
    var data = $("data").value || hoje();

    if (!(valor > 0)) return mostrarMsg(msg, "Digite um valor maior que zero, por exemplo 12,50.", "erro");
    if (!categoriaEscolhida) return mostrarMsg(msg, "Toque em uma categoria.", "erro");

    mostrarMsg(msg, "Salvando…");
    var r = await banco.from("gastos").insert({
      dono: usuario.id,
      data: data,
      descricao: $("descricao").value.trim() || null,
      valor: valor,
      categoria: categoriaEscolhida,
      origem: "manual"
    });
    if (r.error) return mostrarMsg(msg, traduzirErro(r.error), "erro");

    $("valor").value = "";
    $("descricao").value = "";
    $("data").value = hoje();
    categoriaEscolhida = null;
    Array.prototype.forEach.call($("categorias").children, function (c) {
      c.setAttribute("aria-checked", "false");
    });
    mostrarMsg(msg, "Gasto salvo.", "ok");
    setTimeout(function () { if (msg.textContent === "Gasto salvo.") mostrarMsg(msg, ""); }, 2500);
    carregarGastos();
  });

  async function apagarGasto(g, botao) {
    if (!confirm("Apagar o gasto de " + moeda.format(Number(g.valor || 0)) + "?")) return;
    botao.disabled = true;
    var r = await banco.from("gastos").delete().eq("id", g.id);
    if (r.error) {
      botao.disabled = false;
      alert(traduzirErro(r.error));
      return;
    }
    carregarGastos();
  }

  // ---------- Assistente (chega na sexta) ----------

  var AVISO_ASSISTENTE = "O assistente chega na sexta.";

  $("form-assistente").addEventListener("submit", function (e) {
    e.preventDefault();
    mostrarMsg($("msg-assistente"), AVISO_ASSISTENTE, "aviso");
  });

  $("btn-foto").addEventListener("click", function () {
    mostrarMsg($("msg-assistente"), AVISO_ASSISTENTE, "aviso");
  });

  // ---------- Início ----------

  montarCategorias();
  banco.auth.getSession().then(function (r) {
    if (!(r.data && r.data.session)) mostrarEntrada();
  });
})();
