/* ==========================================================
   Dois Traços: interações e animações
   ========================================================== */

// WhatsApp da Dois Traços (DDI + DDD + número, só dígitos)
const WHATSAPP = "5516994215925";
// E-mail que recebe o formulário de contato (enviado pelo serviço gratuito FormSubmit)
const EMAIL_CONTATO = "doistracosem@gmail.com";

(function () {
  const doc = document.documentElement;
  doc.classList.add("js");

  const menosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- Entrada da página ---------- */
  const comecar = () => requestAnimationFrame(() => doc.classList.add("carregou"));
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 900))]).then(comecar);
  } else {
    window.addEventListener("load", comecar);
  }

  /* ---------- Links de WhatsApp com mensagem pronta para cada contexto ---------- */
  const MENSAGENS = {
    geral: "Olá! Conheci a Dois Traços pelo site e gostaria de conversar sobre um projeto para minha marca.",
    branding: "Olá! Gostaria de desenvolver a identidade visual da minha marca com a Dois Traços. Podemos conversar?",
    campanha: "Olá! Tenho interesse em desenvolver uma campanha criativa com a Dois Traços. Gostaria de saber como funciona.",
    lancamento: "Olá! Estou planejando um lançamento e gostaria de conversar sobre a direção visual do projeto.",
    personalizado: "Olá! Conheci a Dois Traços pelo site e gostaria de solicitar uma proposta personalizada para o meu projeto.",
  };
  document.querySelectorAll("[data-whatsapp]").forEach((a) => {
    const texto = MENSAGENS[a.dataset.whatsapp] || MENSAGENS.geral;
    a.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
  });

  /* ---------- Hero: fundo e símbolo acompanham levemente o mouse ---------- */
  const hero = document.querySelector(".hero");
  if (hero && window.matchMedia("(pointer: fine)").matches && !menosMovimento.matches) {
    let quadroHero = 0;
    hero.addEventListener("pointermove", (e) => {
      if (quadroHero) return;
      quadroHero = requestAnimationFrame(() => {
        quadroHero = 0;
        const r = hero.getBoundingClientRect();
        hero.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5) * 2);
        hero.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5) * 2);
      });
    });
    hero.addEventListener("pointerleave", () => {
      hero.style.setProperty("--px", 0);
      hero.style.setProperty("--py", 0);
    });
  }

  /* ---------- Faixa de serviços: repete os itens para o giro não ter emenda ---------- */
  const trilho = document.querySelector(".faixa__trilho");
  if (trilho) {
    const originais = [...trilho.children];
    for (let n = 0; n < 3; n++) {
      originais.forEach((li) => {
        const copia = li.cloneNode(true);
        copia.setAttribute("aria-hidden", "true");
        trilho.appendChild(copia);
      });
    }
  }

  /* ---------- Menu em cartões (adaptado do CardNav, React Bits) ----------
     A altura do painel e a entrada dos cartões seguem uma mola:
     abre com um leve "quique" e fecha sem quicar. */
  (function () {
    const raiz = document.getElementById("card-nav");
    if (!raiz) return;
    const painel = raiz.querySelector(".card-nav__panel");
    const barra = raiz.querySelector(".card-nav__bar");
    const conteudo = raiz.querySelector(".card-nav__content");
    const botao = raiz.querySelector(".card-nav__menu");
    const palavraAbrir = raiz.querySelector(".card-nav__word--open");
    const palavraFechar = raiz.querySelector(".card-nav__word--close");
    const cartoes = [...raiz.querySelectorAll(".card-nav__card")];
    const ctaLargo = raiz.querySelector(".card-nav__cta-wrap");
    const focaveis = () => conteudo.querySelectorAll("a, button");

    const AJUSTE = { stagger: 0.12, bounce: 0.2, speed: 1 };
    const ESTREITO = 560;
    const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
    const limita = (v, a, b) => Math.min(b, Math.max(a, v));
    const suave = (t) => 1 - (1 - t) ** 3;

    let aberto = false;
    let estreito = false;
    const estado = { p: 0, v: 0, altura: conteudo.offsetHeight };
    let raf = 0;
    let ultimo = 0;

    const itensAnimados = () => (estreito ? [...cartoes, ctaLargo] : cartoes);

    function desenhar() {
      const alturaBarra = parseFloat(getComputedStyle(raiz).getPropertyValue("--cn-bar")) || 60;
      painel.style.height = `${alturaBarra + Math.max(0, estado.p) * estado.altura}px`;
      const itens = itensAnimados();
      const n = itens.length;
      const atraso = n > 1 ? Math.min(AJUSTE.stagger, 0.7 / (n - 1)) : 0;
      const faixa = 1 - atraso * (n - 1);
      itens.forEach((el, i) => {
        const local = limita((estado.p - i * atraso) / Math.max(faixa, 0.05), 0, 1);
        const e = suave(local);
        el.style.transform = `translateY(${(1 - e) * 26}px) scale(${0.97 + 0.03 * e})`;
        el.style.opacity = `${e}`;
      });
    }

    function passo(agora) {
      raf = 0;
      const dt = ultimo ? Math.min(0.05, (agora - ultimo) / 1000) : 1 / 60;
      ultimo = agora;
      const alvo = aberto ? 1 : 0;
      if (menosMovimento.matches) {
        estado.p = alvo; estado.v = 0;
      } else {
        const k = 160 * AJUSTE.speed * AJUSTE.speed;
        const zeta = aberto ? 1 - 0.68 * AJUSTE.bounce : 1;
        const passos = Math.ceil(dt / (1 / 240));
        const h = dt / passos;
        for (let i = 0; i < passos; i++) {
          estado.v += (-k * (estado.p - alvo) - 2 * zeta * Math.sqrt(k) * estado.v) * h;
          estado.p += estado.v * h;
        }
      }
      const pronto = Math.abs(estado.p - alvo) < 0.0005 && Math.abs(estado.v) < 0.002;
      if (pronto) { estado.p = alvo; estado.v = 0; }
      desenhar();
      if (pronto && alvo === 0) raiz.removeAttribute("data-shown");
      if (!pronto) raf = requestAnimationFrame(passo);
    }

    const acordar = () => { if (!raf) { ultimo = 0; raf = requestAnimationFrame(passo); } };

    function definirAberto(valor) {
      if (valor === aberto) return;
      aberto = valor;
      raiz.toggleAttribute("data-open", aberto);
      if (aberto) raiz.setAttribute("data-shown", "");
      botao.setAttribute("aria-expanded", String(aberto));
      palavraAbrir.setAttribute("aria-hidden", String(aberto));
      palavraFechar.setAttribute("aria-hidden", String(!aberto));
      conteudo.setAttribute("aria-hidden", String(!aberto));
      focaveis().forEach((el) => { if (aberto) el.removeAttribute("tabindex"); else el.setAttribute("tabindex", "-1"); });
      estado.altura = conteudo.offsetHeight;
      acordar();
    }

    botao.addEventListener("click", () => definirAberto(!aberto));
    conteudo.addEventListener("click", (e) => { if (e.target.closest("a")) definirAberto(false); });
    document.addEventListener("pointerdown", (e) => { if (aberto && !raiz.contains(e.target)) definirAberto(false); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && aberto) { definirAberto(false); botao.focus(); }
    });

    // Layout estreito: logo à esquerda, botão de conversa vai para o fim do menu
    const medir = () => {
      const agora = raiz.offsetWidth < ESTREITO;
      if (agora !== estreito) {
        estreito = agora;
        raiz.toggleAttribute("data-narrow", estreito);
      }
      estado.altura = conteudo.offsetHeight;
      desenhar();
    };
    if ("ResizeObserver" in window) {
      new ResizeObserver(medir).observe(raiz);
      new ResizeObserver(() => { estado.altura = conteudo.offsetHeight; desenhar(); }).observe(conteudo);
    } else {
      window.addEventListener("resize", medir);
    }
    focaveis().forEach((el) => el.setAttribute("tabindex", "-1"));
    medir();

    // Entrada: a barra se desenrola a partir do centro
    if (!menosMovimento.matches && painel.animate) {
      const w = painel.offsetWidth;
      const h = painel.offsetHeight;
      painel.animate(
        [
          { clipPath: `inset(0px ${Math.max(0, (w - h) / 2)}px round ${h / 2}px)`, opacity: 0 },
          { clipPath: "inset(0px 0px round 18px)", opacity: 1 },
        ],
        { duration: 820, easing: EASE, fill: "backwards" }
      );
      [...barra.children].forEach((filho, i) => {
        filho.animate(
          [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: 560, delay: 220 + i * 70, easing: EASE, fill: "backwards" }
        );
      });
    }
  })();

  /* ---------- Pacotes e valores ----------
     Para mudar um pacote, edite esta lista: nome, preço e entregas.
     O resumo, o botão e a mensagem do WhatsApp se atualizam sozinhos. */
  const PACOTES = {
    branding: {
      nome: "Branding",
      icone: '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>',
      pacotes: [
        { nome: "Essência", preco: 590, cta: "Quero começar minha marca", prazo: "7 a 10 dias úteis",
          itens: ["Logotipo principal e versão alternativa", "Paleta de cores e tipografia", "2 aplicações de marca", "Mini guia visual", "1 rodada de ajustes"] },
        { nome: "Presença", preco: 1190, cta: "Quero fortalecer minha marca", prazo: "10 a 15 dias úteis",
          itens: ["Briefing e pesquisa visual simplificada", "Logotipo e variações", "Paleta de cores, tipografia e elementos gráficos", "4 aplicações de marca", "3 templates para redes sociais", "Guia de identidade visual", "2 rodadas de ajustes"] },
        { nome: "Autoridade", preco: 2190, cta: "Quero construir minha autoridade", prazo: "15 a 20 dias úteis",
          itens: ["Diagnóstico simplificado de marca", "Conceito e direção visual", "Identidade visual completa", "6 aplicações de marca", "6 templates para redes sociais", "Manual de identidade visual", "2 rodadas de ajustes"] },
      ],
    },
    campanhas: {
      nome: "Campanhas",
      icone: '<path d="M3 11v2a1 1 0 0 0 1 1h3l5 4V6L7 10H4a1 1 0 0 0-1 1z"/><path d="M16 9a3 3 0 0 1 0 6"/><path d="M19 6a7 7 0 0 1 0 12"/>',
      cta: "Quero criar minha campanha",
      pacotes: [
        { nome: "Start", preco: 390, prazo: "5 a 7 dias úteis", itens: ["Conceito visual simplificado", "4 peças digitais estáticas", "1 rodada de ajustes"] },
        { nome: "Pro", preco: 790, prazo: "7 a 10 dias úteis", itens: ["Key visual", "8 peças digitais estáticas", "2 rodadas de ajustes"] },
        { nome: "Full", preco: 1490, prazo: "12 a 15 dias úteis", itens: ["Direção criativa", "15 peças digitais estáticas", "2 rodadas de ajustes"] },
      ],
    },
    social: {
      nome: "Social Media",
      icone: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
      cta: "Quero melhorar minha presença digital",
      mensal: true,
      nota: "Os planos incluem design, não gestão completa das redes sociais.",
      pacotes: [
        { nome: "Essencial", preco: 490, itens: ["8 posts estáticos mensais"] },
        { nome: "Estratégico", preco: 790, itens: ["12 posts estáticos", "4 stories estáticos"] },
        { nome: "Premium", preco: 1190, itens: ["16 posts estáticos", "8 stories estáticos"] },
      ],
    },
    lancamentos: {
      nome: "Lançamentos",
      icone: '<path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2"/><path d="M14.5 4.5c3-1.5 5.5-1.5 5.5-1.5s0 2.5-1.5 5.5L12 15l-3-3 5.5-7.5z"/><path d="M9 12H5l2.5-3.5H11"/><path d="M12 15v4l3.5-2.5V13"/>',
      cta: "Quero preparar meu lançamento",
      prazoEstimado: true,
      pacotes: [
        { nome: "Launch Start", preco: 790, prazo: "10 dias úteis", itens: ["Identidade visual básica do lançamento", "6 criativos estáticos"] },
        { nome: "Launch Pro", preco: 1490, prazo: "15 dias úteis", itens: ["Key visual", "12 criativos estáticos"] },
        { nome: "Launch Full", preco: 2490, prazo: "20 dias úteis", itens: ["Direção visual", "20 criativos estáticos"] },
      ],
    },
    web: {
      nome: "Web Design",
      icone: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M7 6.5h.01"/><path d="M10 6.5h.01"/>',
      cta: "Quero criar meu site",
      pacotes: [
        { nome: "Landing Start", preco: 690, itens: ["Landing page de até 4 seções", "Design responsivo", "Integração com WhatsApp"] },
        { nome: "Landing Pro", preco: 1290, itens: ["Landing page de até 7 seções", "Design responsivo", "Integração com WhatsApp", "SEO técnico básico"] },
        { nome: "Site Institucional", preco: 2490, itens: ["Site de até 5 páginas", "Design responsivo", "Formulário de contato", "Integração com WhatsApp"] },
      ],
    },
  };

  (function () {
    const secao = document.getElementById("pacotes");
    if (!secao) return;
    const abas = [...secao.querySelectorAll(".pacotes__aba")];
    const lista = secao.querySelector(".pacotes__lista");
    const notaCategoria = secao.querySelector(".pacotes__nota-categoria");
    const resumo = secao.querySelector(".pacotes__resumo");
    const r = {
      categoria: resumo.querySelector(".resumo__categoria"),
      nome: resumo.querySelector(".resumo__nome"),
      valor: resumo.querySelector(".resumo__valor"),
      periodo: resumo.querySelector(".resumo__periodo"),
      itens: resumo.querySelector(".resumo__itens"),
      prazo: resumo.querySelector(".resumo__prazo"),
      cta: resumo.querySelector(".resumo__cta"),
      corpo: resumo.querySelector(".resumo__corpo"),
    };
    const moeda = (v) => v.toLocaleString("pt-BR");
    const check = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
    let atual = "branding";

    function precoTexto(cat, p) { return `R$ ${moeda(p.preco)}${cat.mensal ? "/mês" : ""}`; }

    function mostrarResumo(chave, indice, animar) {
      const cat = PACOTES[chave];
      const p = cat.pacotes[indice];
      const preencher = () => {
        r.categoria.textContent = cat.nome;
        r.nome.textContent = p.nome;
        r.valor.textContent = moeda(p.preco);
        r.periodo.textContent = cat.mensal ? "/mês" : "";
        r.itens.innerHTML = "";
        p.itens.forEach((t) => {
          const li = document.createElement("li");
          li.innerHTML = check;
          li.append(t + ".");
          r.itens.appendChild(li);
        });
        if (p.prazo) {
          r.prazo.hidden = false;
          r.prazo.textContent = `${cat.prazoEstimado ? "Prazo estimado" : "Prazo"}: ${p.prazo}`;
        } else if (cat.mensal) {
          r.prazo.hidden = false;
          r.prazo.textContent = "Plano mensal";
        } else {
          r.prazo.hidden = true;
        }
        r.cta.textContent = p.cta || cat.cta;
        const msg = `Olá! Conheci a Dois Traços pelo site e tenho interesse no pacote ${p.nome}, da categoria ${cat.nome}, no valor de ${precoTexto(cat, p)}. Gostaria de conversar sobre a contratação.`;
        r.cta.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
      };
      if (animar && !menosMovimento.matches) {
        r.corpo.classList.add("trocando");
        setTimeout(() => { preencher(); r.corpo.classList.remove("trocando"); }, 160);
      } else {
        preencher();
      }
    }

    function montarLista(chave, animar) {
      const cat = PACOTES[chave];
      lista.querySelectorAll(".pacote").forEach((el) => el.remove());
      lista.setAttribute("aria-labelledby", "aba-" + (chave === "social" ? "social" : chave === "web" ? "web" : chave));
      cat.pacotes.forEach((p, i) => {
        const id = `pacote-${chave}-${i}`;
        const label = document.createElement("label");
        label.className = "pacote" + (animar && !menosMovimento.matches ? " pacote--entrando" : "");
        label.style.setProperty("--i", i);
        label.htmlFor = id;
        const qtd = p.itens.length;
        const meta = p.prazo
          ? `${qtd} ${qtd === 1 ? "entrega" : "entregas"} · ${p.prazo}`
          : qtd <= 2 ? p.itens.join(" + ") : `${p.itens[0]} · ${qtd} entregas`;
        label.innerHTML = `
          <input type="radio" name="pacote" id="${id}" value="${i}"${i === 1 ? " checked" : ""}>
          <span class="pacote__icone" aria-hidden="true"><svg viewBox="0 0 24 24">${cat.icone}</svg></span>
          <span class="pacote__texto"><span class="pacote__nome">${p.nome}</span><span class="pacote__meta">${meta}</span></span>
          <span class="pacote__preco">R$ ${moeda(p.preco)}${cat.mensal ? '<small>/mês</small>' : ""}</span>
          <span class="pacote__radio" aria-hidden="true"></span>`;
        label.querySelector("input").addEventListener("change", () => mostrarResumo(chave, i, true));
        lista.appendChild(label);
      });
      notaCategoria.hidden = !cat.nota;
      notaCategoria.textContent = cat.nota || "";
      // O pacote do meio começa selecionado
      mostrarResumo(chave, 1, animar);
    }

    function selecionarAba(aba, focar) {
      const chave = aba.dataset.categoria;
      abas.forEach((a) => {
        const ativa = a === aba;
        a.setAttribute("aria-selected", String(ativa));
        a.tabIndex = ativa ? 0 : -1;
      });
      if (focar) aba.focus();
      // rola só a barra de abas (no celular), sem mexer na página
      const barra = aba.parentElement;
      const alvoX = aba.offsetLeft - (barra.clientWidth - aba.offsetWidth) / 2;
      barra.scrollTo({ left: Math.max(0, alvoX), behavior: menosMovimento.matches ? "auto" : "smooth" });
      if (chave !== atual) { atual = chave; montarLista(chave, true); }
    }

    abas.forEach((aba, i) => {
      aba.addEventListener("click", () => selecionarAba(aba, false));
      aba.addEventListener("keydown", (e) => {
        let alvo = null;
        if (e.key === "ArrowRight") alvo = abas[(i + 1) % abas.length];
        if (e.key === "ArrowLeft") alvo = abas[(i - 1 + abas.length) % abas.length];
        if (e.key === "Home") alvo = abas[0];
        if (e.key === "End") alvo = abas[abas.length - 1];
        if (alvo) { e.preventDefault(); selecionarAba(alvo, true); }
      });
    });

    montarLista(atual, false);
  })();

  /* ---------- Fundo vivo nas seções ----------
     Leva o fundo da primeira dobra para o resto do site: dois traços que se
     desenham quando a seção aparece, um brilho que corre por eles, uma grade
     de pontos e uma luz suave, sempre nas bordas para não atrapalhar a leitura. */
  (function () {
    const CAMINHOS = {
      direita: [
        "M -40 880 C 600 905, 1150 860, 1330 640 S 1400 200, 1480 -40",
        "M -40 930 C 640 945, 1200 905, 1385 690 S 1450 260, 1510 0",
      ],
      esquerda: [
        "M 1480 880 C 840 905, 290 860, 110 640 S 40 200, -40 -40",
        "M 1480 930 C 800 945, 240 905, 55 690 S -10 260, -70 0",
      ],
    };
    const SECOES = [
      { seletor: "#servicos", lado: "direita" },
      { seletor: ".juntos", lado: "esquerda" },
      { seletor: "#processo", lado: "direita", tom: "escuro" },
      { seletor: "#projetos", lado: "esquerda" },
      { seletor: "#pacotes", lado: "direita" },
      { seletor: "#duvidas", lado: "esquerda" },
      { seletor: "#contato", lado: "direita", tom: "escuro" },
    ];
    const camadas = [];

    SECOES.forEach(({ seletor, lado, tom }) => {
      const secao = document.querySelector(seletor);
      if (!secao) return;
      const [a, b] = CAMINHOS[lado];
      const camada = document.createElement("div");
      camada.className = `fundo-vivo fundo-vivo--${lado}${tom ? " fundo-vivo--" + tom : ""}`;
      camada.setAttribute("aria-hidden", "true");
      camada.innerHTML = `
        <span class="fundo-vivo__pontos"></span>
        <span class="fundo-vivo__luz"></span>
        <svg class="fundo-vivo__tracos" viewBox="0 0 1440 900" preserveAspectRatio="none" focusable="false">
          <path class="fv-a" pathLength="1000" vector-effect="non-scaling-stroke" d="${a}"/>
          <path class="fv-b" pathLength="1000" vector-effect="non-scaling-stroke" d="${b}"/>
          <path class="fv-fluxo fv-fluxo--a" pathLength="1000" vector-effect="non-scaling-stroke" d="${a}"/>
          <path class="fv-fluxo fv-fluxo--b" pathLength="1000" vector-effect="non-scaling-stroke" d="${b}"/>
        </svg>`;
      secao.classList.add("tem-fundo-vivo");
      secao.prepend(camada);
      camadas.push({ secao, camada });
    });

    if (!camadas.length) return;

    if ("IntersectionObserver" in window) {
      const obs = new IntersectionObserver((ents) => {
        ents.forEach((en) => {
          const camada = en.target.querySelector(":scope > .fundo-vivo");
          if (!camada) return;
          if (en.isIntersecting) camada.classList.add("fundo-vivo--ativo");
          camada.classList.toggle("fundo-vivo--visivel", en.isIntersecting);
        });
      }, { rootMargin: "0px 0px -15% 0px" });
      camadas.forEach(({ secao }) => obs.observe(secao));
    } else {
      camadas.forEach(({ camada }) => camada.classList.add("fundo-vivo--ativo", "fundo-vivo--visivel"));
    }

    // Profundidade: as camadas andam um pouco mais devagar que a página
    if (menosMovimento.matches) return;
    let pedido = 0;
    const mover = () => {
      pedido = 0;
      const vh = window.innerHeight;
      camadas.forEach(({ secao, camada }) => {
        const r = secao.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const desvio = (r.top + r.height / 2 - vh / 2) * -0.06;
        camada.style.setProperty("--fv-y", `${desvio.toFixed(1)}px`);
      });
    };
    window.addEventListener("scroll", () => { if (!pedido) pedido = requestAnimationFrame(mover); }, { passive: true });
    window.addEventListener("resize", mover);
    mover();
  })();

  /* ---------- Frase "Criatividade sem direção é só barulho." ----------
     Enquanto a seção está parada na tela, a rolagem conduz o efeito:
     a primeira frase sai do desfoque e entra em foco, palavra por palavra;
     depois a segunda frase acende palavra por palavra e o destaque ganha um traço. */
  (function () {
    const secao = document.querySelector(".juntos");
    if (!secao) return;
    const ruido = secao.querySelector(".juntos__ruido");
    const resto = secao.querySelector(".juntos__resto");
    const destaque = secao.querySelector(".juntos__destaque");

    // separa em palavras (e letras, no caso do "barulho"), mantendo o texto acessível
    const separar = (el, comLetras) => {
      const pedacos = [];
      const percorrer = (no) => {
        [...no.childNodes].forEach((filho) => {
          if (filho.nodeType === 3) {
            const frag = document.createDocumentFragment();
            filho.textContent.split(/(\s+)/).forEach((parte) => {
              if (!parte) return;
              if (/^\s+$/.test(parte)) { frag.append(" "); return; }
              const palavra = document.createElement("span");
              palavra.className = "juntos__palavra";
              if (comLetras) {
                [...parte].forEach((ch) => {
                  const l = document.createElement("span");
                  l.className = "juntos__letra";
                  l.textContent = ch;
                  palavra.appendChild(l);
                  pedacos.push(l);
                });
              } else {
                palavra.textContent = parte;
                pedacos.push(palavra);
              }
              frag.appendChild(palavra);
            });
            filho.replaceWith(frag);
          } else if (filho.nodeType === 1) {
            percorrer(filho);
          }
        });
      };
      percorrer(el);
      return pedacos;
    };

    const frase = secao.querySelector(".juntos__frase");
    frase.setAttribute("aria-label", frase.textContent.replace(/\s+/g, " ").trim());
    const focos = separar(ruido, false);
    const palavras = separar(resto, false);
    [ruido, resto].forEach((el) => el.setAttribute("aria-hidden", "true"));

    if (menosMovimento.matches) {
      palavras.forEach((p) => p.classList.add("acesa"));
      destaque.classList.add("sublinhado");
      return;
    }

    const limita = (v) => Math.min(1, Math.max(0, v));
    const suave = (t) => 1 - Math.pow(1 - t, 3);

    let pedido = 0;
    function atualizar() {
      pedido = 0;
      const r = secao.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      // 0 quando a seção chega ao topo, 1 quando o "palco" vai sair
      const palco = secao.querySelector(".juntos__palco");
      const curso = Math.max(1, r.height - palco.offsetHeight);
      const p = limita((-r.top + vh * 0.2) / (curso + vh * 0.2));

      // fase 1 (0 → 0,45): a primeira frase entra em foco, palavra por palavra
      const n = focos.length;
      focos.forEach((w, i) => {
        const e = suave(limita((p / 0.45) * 1.6 - (i / n) * 0.6));
        const f = 1 - e;
        w.style.filter = f > 0.01 ? `blur(${(f * 14).toFixed(1)}px)` : "";
        w.style.opacity = (0.12 + 0.88 * e).toFixed(3);
        w.style.transform = f > 0.01 ? `translateY(${(f * 18).toFixed(1)}px) scale(${(1 + f * 0.04).toFixed(3)})` : "";
      });

      // fase 2 (0,45 → 0,9): a segunda frase acende palavra por palavra
      const fase2 = limita((p - 0.45) / 0.45);
      const acesas = Math.round(fase2 * palavras.length);
      palavras.forEach((w, i) => w.classList.toggle("acesa", i < acesas));

      // fase 3: traço sob o destaque
      destaque.classList.toggle("sublinhado", fase2 >= 0.98);
    }

    window.addEventListener("scroll", () => { if (!pedido) pedido = requestAnimationFrame(atualizar); }, { passive: true });
    window.addEventListener("resize", atualizar);
    atualizar();
  })();

  /* ---------- Revelar blocos ao rolar ---------- */
  const revelar = document.querySelectorAll(".revelar");
  if ("IntersectionObserver" in window && !menosMovimento.matches) {
    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach((ent) => {
        if (ent.isIntersecting) { ent.target.classList.add("visivel"); obs.unobserve(ent.target); }
      });
    }, { rootMargin: "0px 0px -12% 0px" });
    revelar.forEach((el) => obs.observe(el));
  } else {
    revelar.forEach((el) => el.classList.add("visivel"));
  }

  /* ---------- Projetos: carrossel com as capas do Behance ----------
     Para incluir um projeto novo do Behance, acrescente um item nesta lista:
     título, descrição curta, link do projeto e o endereço da capa
     (salve a imagem na pasta assets/projetos e use o caminho dela). */
  const PROJETOS = [
    { titulo: "Orbit", descricao: "Branding para inteligência artificial",
      link: "https://www.behance.net/gallery/253005027/Orbit-Artificial-Intelligence-Branding",
      capa: "assets/projetos/orbit.jpg", posicao: "left center" },
    { titulo: "Lume", descricao: "Padaria e café: identidade visual",
      link: "https://www.behance.net/gallery/252990317/Lume-Bakery-Coffee-House",
      capa: "assets/projetos/lume.jpg", posicao: "left center" },
    { titulo: "Renner × Guaraná Antarctica", descricao: "Redesign de coleção",
      link: "https://www.behance.net/gallery/252896865/Renner-Guarana-Antarctica-Collection-Redesign",
      capa: "assets/projetos/renner-guarana.jpg" },
    { titulo: "Byway®", descricao: "Branding",
      link: "https://www.behance.net/gallery/252846633/Byway-Branding",
      capa: "assets/projetos/byway.jpg" },
    { titulo: "Flux Energy Drink", descricao: "Design de marca",
      link: "https://www.behance.net/gallery/247733153/Flux-Energy-Drink-Brand-Design",
      capa: "assets/projetos/flux.jpg" },
  ];

  (function () {
    const raiz = document.querySelector(".carrossel");
    if (!raiz || !PROJETOS.length) return;
    const palco = raiz.querySelector(".carrossel__palco");
    const titulo = raiz.querySelector(".carrossel__titulo");
    const descricao = raiz.querySelector(".carrossel__descricao");
    const contador = raiz.querySelector(".carrossel__contador");
    const total = PROJETOS.length;
    const doisDigitos = (n) => String(n).padStart(2, "0");
    let atual = 0;

    const cartoes = PROJETOS.map((p, i) => {
      const a = document.createElement("a");
      a.className = "carrossel__cartao";
      a.href = p.link;
      a.target = "_blank";
      a.rel = "noopener";
      a.setAttribute("aria-label", `${p.titulo}: ver projeto no Behance`);
      a.innerHTML = `
        <span class="carrossel__reserva" aria-hidden="true"><span>${p.titulo}</span></span>
        <img src="${p.capa}" alt="" style="object-position: ${p.posicao || "center"}" loading="lazy" decoding="async">
        <span class="carrossel__ver" aria-hidden="true">Ver no Behance <svg viewBox="0 0 24 24"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg></span>`;
      const img = a.querySelector("img");
      img.addEventListener("error", () => a.classList.add("sem-capa"));
      img.addEventListener("load", () => a.classList.add("com-capa"));
      // cartão lateral: clicar traz para o centro em vez de abrir o link
      a.addEventListener("click", (e) => {
        if (i !== atual) { e.preventDefault(); ir(i); }
      });
      palco.appendChild(a);
      return a;
    });

    function posicao(i) {
      let d = i - atual;
      if (d > total / 2) d -= total;
      if (d < -total / 2) d += total;
      return d;
    }

    function ir(i) {
      atual = (i + total) % total;
      cartoes.forEach((c, k) => {
        const d = posicao(k);
        c.dataset.pos = String(Math.max(-3, Math.min(3, d)));
        c.style.order = String(d);
        c.tabIndex = d === 0 ? 0 : -1;
        c.setAttribute("aria-hidden", String(d !== 0));
      });
      const p = PROJETOS[atual];
      titulo.textContent = p.titulo;
      descricao.textContent = p.descricao;
      contador.textContent = `${doisDigitos(atual + 1)} / ${doisDigitos(total)}`;
      raiz.classList.remove("trocou");
      void raiz.offsetWidth;
      raiz.classList.add("trocou");
    }

    raiz.querySelectorAll(".carrossel__botao").forEach((b) => {
      b.addEventListener("click", () => ir(atual + Number(b.dataset.direcao)));
    });
    palco.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); ir(atual + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); ir(atual - 1); }
    });

    // arrastar com o dedo no celular
    let inicioX = null;
    palco.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") inicioX = e.clientX; });
    palco.addEventListener("pointerup", (e) => {
      if (inicioX === null) return;
      const dx = e.clientX - inicioX;
      inicioX = null;
      if (Math.abs(dx) > 40) ir(atual + (dx < 0 ? 1 : -1));
    });

    ir(0);
  })();

  /* ---------- Dúvidas: abrir e fechar com suavidade ---------- */
  document.querySelectorAll(".acordeao details").forEach((det) => {
    const resumo = det.querySelector("summary");
    const corpo = det.querySelector(".acordeao__resposta");
    resumo.addEventListener("click", (e) => {
      if (menosMovimento.matches || !corpo.animate) return;
      e.preventDefault();
      if (det.open) {
        const a = corpo.animate([{ height: corpo.offsetHeight + "px" }, { height: "0px" }], { duration: 300, easing: "ease-out" });
        a.onfinish = () => { det.open = false; };
      } else {
        det.open = true;
        corpo.animate([{ height: "0px" }, { height: corpo.offsetHeight + "px" }], { duration: 350, easing: "cubic-bezier(.2,.7,.2,1)" });
      }
    });
  });

  /* ---------- Formulário: valida e abre o WhatsApp ---------- */
  const form = document.getElementById("formulario");
  const status = form.querySelector(".formulario__status");

  function validar(campo) {
    const erro = document.getElementById(campo.id + "-erro");
    const ok = campo.value.trim().length > 1;
    campo.setAttribute("aria-invalid", String(!ok));
    if (erro) {
      erro.hidden = ok;
      if (!ok) campo.setAttribute("aria-describedby", erro.id); else campo.removeAttribute("aria-describedby");
    }
    return ok;
  }

  form.querySelectorAll("input[required]").forEach((c) => {
    c.addEventListener("blur", () => { if (c.value) validar(c); });
    c.addEventListener("input", () => { if (c.getAttribute("aria-invalid") === "true") validar(c); });
  });

  /* Listas de seleção próprias (no lugar do <select> do navegador):
     abrem com clique, Enter, Espaço ou setas; Esc fecha; letras pulam para a opção. */
  const seletores = [...form.querySelectorAll("[data-seletor]")].map((raiz) => {
    const botao = raiz.querySelector(".seletor__botao");
    const lista = raiz.querySelector(".seletor__lista");
    const valor = raiz.querySelector(".seletor__valor");
    const campo = raiz.querySelector('input[type="hidden"]');
    const opcoes = [...lista.querySelectorAll(".seletor__opcao")];
    let ativa = -1;

    const marcarAtiva = (i) => {
      opcoes.forEach((o, k) => o.classList.toggle("ativa", k === i));
      ativa = i;
      if (i >= 0) {
        lista.setAttribute("aria-activedescendant", opcoes[i].id);
        opcoes[i].scrollIntoView({ block: "nearest" });
      }
    };
    const abrir = () => {
      fecharTodos(raiz);
      raiz.classList.add("aberto");
      botao.setAttribute("aria-expanded", "true");
      const sel = opcoes.findIndex((o) => o.getAttribute("aria-selected") === "true");
      marcarAtiva(sel >= 0 ? sel : 0);
      lista.focus({ preventScroll: true });
    };
    const fechar = (devolverFoco) => {
      if (!raiz.classList.contains("aberto")) return;
      raiz.classList.remove("aberto");
      botao.setAttribute("aria-expanded", "false");
      if (devolverFoco) botao.focus();
    };
    const escolher = (i) => {
      const o = opcoes[i];
      opcoes.forEach((x) => x.setAttribute("aria-selected", String(x === o)));
      campo.value = o.dataset.valor;
      valor.textContent = o.dataset.valor;
      valor.classList.remove("vazio");
      raiz.classList.add("preenchido");
      fechar(true);
    };
    const limpar = () => {
      opcoes.forEach((x) => x.setAttribute("aria-selected", "false"));
      campo.value = "";
      valor.textContent = valor.dataset.vazio;
      valor.classList.add("vazio");
      raiz.classList.remove("preenchido");
    };

    botao.addEventListener("click", () => (raiz.classList.contains("aberto") ? fechar(true) : abrir()));
    botao.addEventListener("keydown", (e) => {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) { e.preventDefault(); abrir(); }
    });
    opcoes.forEach((o, i) => {
      o.addEventListener("click", () => escolher(i));
      o.addEventListener("pointermove", () => { if (ativa !== i) marcarAtiva(i); });
    });
    lista.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); marcarAtiva(Math.min(opcoes.length - 1, ativa + 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); marcarAtiva(Math.max(0, ativa - 1)); }
      else if (e.key === "Home") { e.preventDefault(); marcarAtiva(0); }
      else if (e.key === "End") { e.preventDefault(); marcarAtiva(opcoes.length - 1); }
      else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (ativa >= 0) escolher(ativa); }
      else if (e.key === "Escape") { e.preventDefault(); fechar(true); }
      else if (e.key === "Tab") { fechar(false); }
      else if (e.key.length === 1) {
        const letra = e.key.toLowerCase();
        const i = opcoes.findIndex((o, k) => k > ativa && o.dataset.valor.toLowerCase().startsWith(letra));
        const j = i >= 0 ? i : opcoes.findIndex((o) => o.dataset.valor.toLowerCase().startsWith(letra));
        if (j >= 0) marcarAtiva(j);
      }
    });
    return { raiz, fechar, limpar };
  });
  function fecharTodos(exceto) { seletores.forEach((s) => { if (s.raiz !== exceto) s.fechar(false); }); }
  document.addEventListener("pointerdown", (e) => {
    seletores.forEach((s) => { if (!s.raiz.contains(e.target)) s.fechar(false); });
  });

  // O campo de contato obrigatório acompanha a preferência de resposta
  const preferencia = () => form.querySelector('input[name="resposta"]:checked').value;
  const marcarObrigatorio = () => {
    const porEmail = preferencia() === "E-mail";
    form.email.placeholder = porEmail ? "E-mail*" : "E-mail";
    form.whatsapp.placeholder = porEmail ? "WhatsApp" : "WhatsApp*";
    [form.email, form.whatsapp].forEach((c) => {
      c.removeAttribute("aria-invalid");
      const erro = document.getElementById(c.id + "-erro");
      if (erro) erro.hidden = true;
    });
  };
  form.querySelectorAll('input[name="resposta"]').forEach((r) => r.addEventListener("change", marcarObrigatorio));
  marcarObrigatorio();

  function validarContato(campo) {
    const v = campo.value.trim();
    const ok = campo === form.email
      ? /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
      : v.replace(/\D/g, "").length >= 10;
    campo.setAttribute("aria-invalid", String(!ok));
    const erro = document.getElementById(campo.id + "-erro");
    if (erro) { erro.hidden = ok; if (!ok) campo.setAttribute("aria-describedby", erro.id); else campo.removeAttribute("aria-describedby"); }
    return ok;
  }
  [form.email, form.whatsapp].forEach((c) => c.addEventListener("input", () => {
    if (c.getAttribute("aria-invalid") === "true") validarContato(c);
  }));

  const botaoEnviar = form.querySelector(".formulario__botao");
  const rotuloBotao = botaoEnviar.querySelector(".formulario__rotulo");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const canal = preferencia();
    const contatoPrincipal = canal === "E-mail" ? form.email : form.whatsapp;
    const okNome = validar(form.nome);
    const okContato = validarContato(contatoPrincipal);
    if (!okNome || !okContato) {
      (!okNome ? form.nome : contatoPrincipal).focus();
      status.textContent = "Faltam alguns dados. Confira os campos marcados.";
      return;
    }

    const v = (campo) => campo.value.trim();
    const nomeCompleto = [v(form.nome), v(form.sobrenome)].filter(Boolean).join(" ");
    const dados = {
      _subject: `Novo contato pelo site: ${nomeCompleto}`,
      _template: "table",
      _captcha: "false",
      Nome: nomeCompleto,
      "Prefere resposta por": canal,
      WhatsApp: v(form.whatsapp) || "Não informado",
      "E-mail": v(form.email) || "Não informado",
      "Tipo de projeto": v(form.servico) || "Não informado",
      "Para quando": v(form.prazo) || "Não informado",
      "Instagram ou site": v(form.marca) || "Não informado",
      Ideia: v(form.mensagem) || "Não informada",
    };
    if (v(form.email)) dados._replyto = v(form.email);

    botaoEnviar.disabled = true;
    rotuloBotao.textContent = "Enviando...";
    status.textContent = "";
    try {
      const resposta = await fetch(`https://formsubmit.co/ajax/${EMAIL_CONTATO}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(dados),
      });
      const json = await resposta.json().catch(() => ({}));
      if (!resposta.ok || String(json.success) === "false") throw new Error(json.message || "falha");
      form.reset();
      seletores.forEach((s) => s.limpar());
      marcarObrigatorio();
      form.classList.add("enviado");
      status.textContent = canal === "E-mail"
        ? "Recebemos sua ideia! Vamos responder no seu e-mail em breve."
        : "Recebemos sua ideia! Vamos te chamar no WhatsApp em breve.";
    } catch (erro) {
      const link = document.createElement("a");
      link.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(MENSAGENS.geral)}`;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "fale com a gente pelo WhatsApp";
      status.append("Não conseguimos enviar agora. Tente de novo em instantes ou ", link, ".");
    } finally {
      botaoEnviar.disabled = false;
      rotuloBotao.textContent = "Enviar minha ideia";
    }
  });

  /* ---------- Ano no rodapé ---------- */
  const ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();
})();
