# CLAUDE.md — Memória do projeto Meu Bolso

Este arquivo é a memória deste projeto. O Claude lê este arquivo toda vez que esta pasta é aberta.

## 1. O que é este projeto

O **Meu Bolso** é um app de gastos pessoais, feito na Formação Claude Pro.

- **Quem usa:** só eu, no celular e no computador.
- **O que ele faz:** registra gastos e mostra o total do mês, separado por categoria.
- **Na sexta:** ganha um assistente que lança o gasto a partir de uma frase (por exemplo, "almoço 32 reais") ou da foto do cupom fiscal.
- **Telas e categorias:** saem de uma entrevista que o Claude vai conduzir comigo. Nada de inventar telas ou categorias antes dessa entrevista.

## 2. Regras técnicas que não se discutem

- **Onde ficam os arquivos do app:** na pasta `app/`, e são estes:
  - `index.html` — a página do app
  - `estilo.css` — a aparência
  - `app.js` — o funcionamento
  - `configuracao.js` — os dados de conexão com o Supabase
  - `manifest.webmanifest` — permite instalar o app no celular
  - `icone.svg` — o ícone do app
- **Sem complicação:** sem Node, sem etapa de "build", sem framework. São arquivos simples que abrem direto no navegador.
- **Conexão com o Supabase (o banco de dados):** o cliente entra pela internet (CDN), com esta linha exata:
  `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>`
- **Entrada no app:** por e-mail e senha, **sem** confirmação de e-mail.
- **Proteção dos dados:** as tabelas `gastos` e `resumos` têm proteção por linha (cada pessoa só enxerga as próprias linhas).
- **Chaves que podem ficar em arquivo:** a URL do projeto e a chave pública do Supabase ficam em `app/configuracao.js`, dentro de `window.MEU_BOLSO`.
- **Chaves que NUNCA entram em arquivo nenhum:** a chave secreta do Supabase e a chave do Gemini.
- **Na raiz da pasta:**
  - `netlify.toml` — publica a pasta `app` no Netlify.
  - `.gitignore` — deixa de fora `.env`, `.netlify` e `node_modules`.
- **Celular primeiro:** a tela pensada primeiro é a do celular, com 390 px de largura. O computador vem depois.
- **Erros:** todo erro aparece como uma frase em português dizendo o que fazer (por exemplo, "Sem internet. Confira a conexão e tente de novo.").

## 3. O que este app nunca faz

- Nunca pede, guarda ou mostra senha de banco, número de conta ou número de cartão.
- Nunca guarda a foto do cupom (lê, extrai o gasto e descarta).
- Nunca envia e-mail ou mensagem.
- Nunca usa dado de outra pessoa.

## 4. Como trabalhar comigo

- **Plano antes:** antes de alterar qualquer arquivo, diga o plano em até dez linhas e espere a minha aprovação.
- **Uma mudança por vez:** faça uma mudança de cada vez e mostre a diferença (o que saiu e o que entrou).
- **Entregas em arquivo:** toda entrega vai para um arquivo. Na conversa, mostre só os caminhos dos arquivos.
- **Linguagem:** fale em português, para quem não programa. Sem jargão; quando um termo técnico for inevitável, explique em uma frase.
