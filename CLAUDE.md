## Base de conhecimento ExtoDev (MCP `extodev`)

Este repositório faz parte do ecossistema ExtoApp. Antes de começar qualquer
tarefa, use o servidor MCP `extodev`:

1. **No início da sessão**, chame `check_pending("hub")`. Se houver
   pendências em aberto, liste-as para mim e **pergunte se devo aplicá-las**
   antes de seguir com o pedido atual. Não aplique sozinho sem confirmação.
2. Para entender arquitetura/padrões, use `get_doc` e `list_systems` em vez de
   supor. A fonte de verdade é o MCP, não o meu palpite.
3. **Quando eu fizer uma mudança que afete outro sistema** (ex: algo que a
   API ou a Recepção precisem se ajustar), registre com `add_pending` —
   informando `origin="hub"`, os `targets` e a `instruction` para cada
   sistema afetado.
4. **Ao concluir** a parte deste sistema numa pendência, chame
   `complete_pending(<id>, "hub", done_by="<seu nome>")`.
5. **Enquanto estiver trabalhando nesta sessão**, documente e mantenha
   atualizado no MCP o que for relevante — sem esperar eu pedir:
   - Mudou/descobriu algo sobre a estrutura, fluxos ou decisões deste sistema?
     Atualize `get_doc("projects/hub")` via `upsert_doc` (crie o doc se ainda
     não existir; hoje já existe conteúdo mais aprofundado em `get_doc("hub")`,
     mantenha esse também atualizado se editar por lá).
   - Definiu ou mudou um padrão que vale pra mais de um sistema (ex: cliente
     HTTP, SSO, um componente/token visual)? Atualize `patterns` (ou
     `design-system`, se for algo visual) via `upsert_doc`.
   - Tomou uma decisão de arquitetura (nova dependência, mudança de fluxo de
     dados, escolha de infra)? Registre em `architecture` via `upsert_doc`.
   - Trate os docs do MCP como a fonte de verdade **viva** — atualize no
     mesmo momento em que a mudança acontece, não como tarefa final da sessão
     (fácil de esquecer se deixar pra depois).

### Exemplo de fluxo

- A API mudou um endpoint que este app consome.
  → o Claude chama `check_pending("hub")` no início da sessão, vê a
    pendência, me mostra e pergunta se aplico. Ao terminar:
    `complete_pending("<id>", "hub", done_by="Eduardo")`.
