# Rendu d'arrière-plans

- Une 🏞️📖 name table est une matrice de `32x30` _index de tiles_ 🕊️.
- Comme la résolution de l'écran est de `256x240` et que chaque 🕊️ tile fait `8x8` pixels, ces `32x30` tiles couvrent toute la surface de l'écran ✨.
- Chaque _index de tile_ 🕊️ occupe `1` octet, et il y a `64` octets de _métadonnées de couleur_ 🖍️ à la fin de la name table.
- Donc, chaque name table totalise `1024` octets (`32*30*1 + 64`).
- La 🐏 VRAM contient `2` 🏞️📖 name tables.
  - (disponible aux adresses PPU `$2000-$27FF`)

<div class="embed-image"><img alt="Name table memory" src="assets/graphics/name_tables.png" style="width: 100%" /></div>

#### Exemple de name table

<div class="embed-image"><img alt="Name table" src="assets/graphics/nametable_debug.png" style="width: 75%" /></div>

#### Rendu

##### ⬛️⬜️ Niveaux de gris

- Trouve l'emplacement de la 🏞️📖 name table :
  - Les `2` premiers bits de 🎛️ PPUCtrl contiennent le `nameTableId`.
  - La table sera à l'adresse PPU `0x2000 + nameTableId * 1024`.
- Détermine quelle 🏞️📖 pattern table utiliser (`0` ou `1`) :
  - C'est dans le bit `4` de 🎛️ PPUCtrl.
- Chacun des `960` octets suivants sera un _index de tile_ 🕊️ (`0-255`).
  - Ignore les _métadonnées de couleur_ 🖍️ pour l'instant.
- Au cycle `0` de chaque scanline visible (`0-239`), dessine une rangée de pixels (composée de `32` tiles chacune).
  - Utilise une 🎨 palette fixe :
    - `[0xff000000, 0xff555555, 0xffaaaaaa, 0xffffffff]`.

##### 🎨🌈 Ajout des couleurs

###### **Obtenir les ids de palette**

- Chaque section de `"métadonnées de couleur"` est une 🖍️📖 table d'attributs qui définit quelle 🎨 palette chaque tile doit utiliser.
- Les 🎨 palettes ont `4` couleurs et sont assignées à des `blocs` de `2x2` tiles.

<div class="embed-image"><img alt="Palette blocks" src="assets/graphics/palette-blocks.gif" style="width: 75%" /></div>

- La grille rouge illustre les `blocs` de palettes. Remarque que tous les tiles de chaque bloc `2x2` partagent la même palette.
- Pour encoder ces données, l'écran est d'abord divisé en `métablocs` de `4x4` tiles.

<div class="embed-image"><img alt="Palette metablocks" src="assets/graphics/palette-metablocks.gif" style="width: 75%" /></div>

- La grille verte représente les `métablocs`. Il y en a `64`, `1` octet par `métabloc`.
- Chaque octet contient :
  - Bits `0,1` : _id de palette_ 🎨 du `bloc 0` (haut-gauche).
  - Bits `2,3` : _id de palette_ 🎨 du `bloc 1` (haut-droit).
  - Bits `4,5` : _id de palette_ 🎨 du `bloc 2` (bas-gauche).
  - Bits `6,7` : _id de palette_ 🎨 du `bloc 3` (bas-droit).

###### **Lecture des données de palette**

- Une 🎨 palette est un tableau de `4` _index de couleur_ 🖍️ (`0-63`), pointant vers la 👑🎨 palette maîtresse codée en dur.
- Chaque _index de couleur_ 🖍️ occupe `1` octet, donc chaque 🎨 palette totalise `4` octets.
- La 🐏 Palette RAM contient `4` palettes pour les arrière-plans et `4` palettes pour les sprites.
  - (les palettes d'arrière-plan sont disponibles aux adresses PPU `$3F00-$3F0F`)

<div class="embed-image"><img alt="Palette RAM" src="assets/graphics/palette_ram.png" style="width: 100%" /></div>
