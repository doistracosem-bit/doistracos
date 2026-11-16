# Dois Traços — Landing page

Site do estúdio Dois Traços: branding, identidade visual, campanhas e web design.

Feito em HTML, CSS e JavaScript puro, sem dependências nem etapa de build.

## Estrutura

```
index.html          página
css/style.css       estilos
js/main.js          animações, carrossel, pacotes, formulário
assets/             logo, símbolo e capas dos projetos
```

## Onde editar

Tudo em `js/main.js`:

- `WHATSAPP` (primeira linha): número usado em todos os botões de WhatsApp.
- `EMAIL_CONTATO`: e-mail que recebe o formulário (via FormSubmit).
- `PACOTES`: nomes, preços e entregas da seção de pacotes.
- `PROJETOS`: projetos do carrossel. A capa vai em `assets/projetos/`.

## Formulário

O envio usa o serviço gratuito [FormSubmit](https://formsubmit.co).
No primeiro envio feito pelo site já publicado, chega um e-mail de confirmação
em doistracosem@gmail.com: clique em "Activate Form" uma única vez.

## Publicar

- **GitHub Pages:** Settings › Pages › Source: "Deploy from a branch" › branch `main`, pasta `/ (root)`.
- **Netlify / Vercel:** importe este repositório; não há comando de build e a pasta de publicação é a raiz.
