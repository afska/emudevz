# Rendu de sprites

- Une 🛸📖 table OAM est un tableau de `64` entrées 🛸 OAM.
- Chaque entrée 🛸 OAM représente un sprite et occupe `4` octets.
- La 🐏 OAM RAM contient la table OAM complète (`256` octets).
  - (accessible uniquement via 🏠 OAMAddr / 📝 OAMData / ⚡ OAMDMA)
- Si le bit `5` de 🎛️ PPUCtrl (_hauteur des sprites_) est activé, les sprites sont rendus en mode `8x16` au lieu de `8x8`.

## Format d'une entrée OAM

- Octet `0` : coordonnée **Y** du sprite (moins `1`).
- Octet `1` : _index de tile_ 🕊️ du sprite.
  - En mode `8x8` :
    - Cet octet est l'_index de tile_ réel.
    - La pattern table est obtenue depuis le bit `3` de 🎛️ PPUCtrl (_sélection pattern table sprites_).
  - En mode `8x16` :
    - L'_index de tile_ du _tile supérieur_ est cet octet avec son premier bit à zéro (`byte1 & 0b11111110`).
    - L'_index de tile_ du _tile inférieur_ est l'index du tile supérieur plus `1`.
    - La pattern table est obtenue depuis le premier bit (`byte1 & 0b00000001`).
- Octet `2` : Attributs du sprite.
  - Bits `0-1` : Id de palette.
  - Bit `5` : Priorité (`0` : devant le background, `1` : derrière le background).
  - Bit `6` : Retournement horizontal.
  - Bit `7` : Retournement vertical.
- Octet `3` : coordonnée **X** du sprite.
