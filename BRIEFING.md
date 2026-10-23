# BRIEFING — meu-bolso

Resultado da entrevista de 8 perguntas. Formato CLARO.

## C — Contexto

- **Nome do app:** meu-bolso.
- **Quem usa:** só eu, no celular e no computador.
- **Onde lanço mais:** na mesa de casa, com calma, geralmente lançando os gastos do dia de uma vez.
- **Sensação ao abrir:** branco e azul, bem clean. Muito espaço em branco, poucos elementos, nada de enfeite.

## L — Limites

- **Toques máximos para lançar um gasto:** 3 (da tela aberta até o gasto salvo; digitar o valor não conta como toque).
- **O que mais me faria abandonar o app:** ter que preencher campos demais. Por isso, o lançamento só pede **valor e categoria**. A data é hoje, automaticamente. Descrição é opcional e nunca obrigatória.
- **O que o app nunca faz:**
  - Nunca compartilha minhas informações com terceiros.
  - Nunca pede, guarda ou mostra senha de banco, número de conta ou cartão.
  - Nunca guarda a foto do cupom.
  - Nunca envia e-mail ou mensagem.
  - Nunca usa dado de outra pessoa.
  - Nunca pergunta quanto eu ganho, devo ou tenho.

## A — Ação

**Uma tela só**, de cima para baixo:

1. **O que aparece nos primeiros 5 segundos (topo da tela):**
   - Total gasto **no mês** (em destaque, número grande).
   - Total gasto **na semana**.
   - Total gasto **hoje**.
2. **Lançamento à mão (logo abaixo dos totais):**
   - Campo de valor.
   - Botões das categorias, um toque escolhe.
   - Botão "Salvar".
   - Caminho: tocar no valor → digitar → tocar na categoria → tocar em "Salvar" (3 toques).
3. **Lista do mês:**
   - Total do mês por categoria.
   - Lista dos gastos do mês, do mais recente para o mais antigo (data, categoria, valor).
4. **Espaço do assistente (chega na sexta):**
   - Um lugar reservado na tela para lançar o gasto por uma frase ou pela foto do cupom.
   - Até sexta, fica como um aviso discreto: "Em breve: lance por frase ou foto do cupom."

**Categorias (com os meus nomes):**

1. Alimentação
2. Transporte
3. Lazer
4. Futilidades
5. Outros

## R — Resultado

Ao abrir o app, em até 5 segundos, sem rolar a tela do celular, eu respondo à pergunta **"quanto eu já gastei?"**: vejo o total do mês, da semana e de hoje.

## O — Observáveis (5 testes que provam que o app está pronto)

1. **Teste dos 5 segundos:** abro o app no celular (390 px) e vejo os totais do mês, da semana e de hoje sem rolar a tela.
2. **Teste dos 3 toques:** lanço um gasto de Alimentação com no máximo 3 toques, e ele aparece na lista e soma nos três totais na hora.
3. **Teste das categorias:** os botões mostram exatamente Alimentação, Transporte, Lazer, Futilidades e Outros, e o total por categoria bate com a soma dos gastos da lista.
4. **Teste da privacidade:** entro com outra conta de teste e não vejo nenhum gasto da primeira; nenhum campo do app pede renda, dívida, banco, conta, cartão ou senha.
5. **Teste do erro em português:** desligo a internet, tento salvar um gasto e aparece uma frase em português dizendo o que fazer.
