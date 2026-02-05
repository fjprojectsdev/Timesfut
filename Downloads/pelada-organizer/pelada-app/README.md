# Pelada Organizer (Fut + Vôlei)

## Rodar (Expo)
1. Instale Node 18+ e o Expo CLI.
2. Na pasta do projeto:
   - `npm install`
   - `npm start`

## Rodar no Android Studio
1. Abra a pasta `pelada-app/android` no Android Studio.
2. Aguarde o Gradle sincronizar.
3. Rode em emulador ou device.

## Login
- Organizador: entra com PIN (padrão `1234`).
- Convidado: entra em modo somente leitura para acompanhar times e jogos.

## Como funciona
- Selecione a modalidade (Fut / Vôlei).
- Em **Chegadas**, adicione jogadores e escolha FUT/VÔLEI (ou ambos).
- Em **Times**, ajuste jogadores por time, gere times e inicie os jogos.
- Em **Jogo**, clique em "A venceu" ou "B venceu".
  - Vencedor fica.
  - Perdedor vai inteiro para o fim da fila.
  - A lista "Últimos derrotados" é usada para reposição quando algum time ficar incompleto.

## Reposição
- Só ocorre quando necessário (ex.: jogador foi embora e deixou time incompleto).
- Primeiro usa "soltos".
- Se não houver soltos, puxa 1 jogador do time que perdeu mais recentemente
  (ordem em "Últimos derrotados"), sem mexer em times que estão em jogo (config padrão).
- Há botão manual “Recompor” em times incompletos.

## Histórico e Backup
- **Histórico** mostra partidas por modalidade.
- **Backup** permite exportar/importar o estado em JSON.

## Observações
- MVP simples, UI enxuta e prática para usar na quadra.
