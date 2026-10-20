# Merge Strike

Jogo de defesa estilo "merge shooter", deitado (landscape), feito em HTML + CSS + JavaScript puro.

## Como rodar
Abra o `index.html` no navegador (duplo clique). Se algum navegador bloquear algo, rode um servidor local:
`python3 -m http.server 8000` e abra http://localhost:8000

## Controles
- **P** ou **Esc** pausam e continuam o jogo; o botão de 3 traços no topo também pausa.
- Configurações (menu inicial e pausa): volume, tremor de tela, números de dano, efeitos visuais, tela cheia e apagar progresso.

## Estrutura
- `index.html` - página e menus
- `style.css` - visual
- `script.js` - todo o código (config e fases, ícones, salvamento, áudio, lógica, desenho, tutorial, menus)
- `assets/` - sprites (turrets, forest, graveyard, ruins)

## Ajustes rápidos
- Número de ondas por fase: `MAXW` em `script.js` (seção config)
- Vida/velocidade dos monstros por fase: `hm` e `vm` em cada fase de `STAGES`
- Preço da evolução: função `upCost()` em `game.js`
- Para apagar o save: `localStorage.removeItem('mergestrike_save_v1')` no console

## Créditos
Os sprites vêm de pacotes baixados no itch.io (torres, Forest Monsters, Flying Forest Enemies, Zombie, Skeleton, Rat e Golem). Confira a licença de cada pacote e inclua os créditos dos autores aqui antes de publicar.
Os golens verde e roxo são recolorações do golem azul.
