# Définitions

<hr />

- 🕊️ **Tile** : Une grille de pixels `8x8` en _niveaux de gris_ représentant un **motif**. Les tiles sont stockés dans des 🕊️📖 pattern tables.

<div class="embed-image"><img alt="Tile" src="assets/graphics/tile_grayscale.png" style="width: 30%" /></div>
  
- 🕊️📖 **Pattern table** : Une liste de 🕊️ tiles, stockée dans la 👾 CHR-ROM ou la 👾 CHR-RAM.

<div class="embed-image"><img alt="Pattern table" src="assets/graphics/tiles_grayscale.png" style="width: 30%" /></div>

<hr />

- 🏞️ **Background** : Une **image statique** derrière les sprites, stockée dans une 🏞️📖 name table.

- 🏞️📖 **Name table** : Une carte d'**index de tiles** pour les backgrounds, stockée dans la 🐏 VRAM.

- 🖍️📖 **Attribute tables** : Une carte d'**index de palettes** pour les backgrounds, stockée à la fin de chaque 🏞️📖 name table.

<div class="embed-image"><img alt="Background" src="assets/graphics/background.png" style="width: 30%" /></div>

<hr />

- 🛸 **Sprite** : Un **objet de jeu** au-dessus (ou derrière !) du background, pouvant être déplacé ou retourné, stocké dans la 🛸📖 OAM. Il peut utiliser un 🕊️ tile (`8x8`) ou deux (`8x16`).

- 🛸📖 **OAM** : _(Object Attribute Memory)_ Une liste de sprites, stockée dans la 🐏 OAM RAM.

<div class="embed-image"><img alt="Sprites" src="assets/graphics/sprites.png" style="width: 30%" /></div>

<hr />

- 🎨 **Palette** : Une liste de `4` couleurs, stockée dans la 🐏 Palette RAM, où chaque couleur est un pointeur vers la palette maîtresse. Il y a `8` palettes : `4` pour le background et `4` pour les sprites.

- 👑🎨 **Palette maîtresse** : Une liste de 64 **couleurs**, `codée en dur`. Les palettes y font référence via des index de `$00` à `$3F`.

<div class="embed-image"><img alt="Master palette" src="assets/graphics/colors.png" style="width: 50%" /></div>

<hr />

#### Régions mémoire PPU

- 🐏 VRAM (`2` Kio)
- 🐏 Palette RAM (`32` octets)
- 🐏 OAM RAM (`256` octets)
