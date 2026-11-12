# Rendu de tiles

- Une 🕊️📖 pattern table est une liste de `256` 🕊️ tiles consécutifs.
- Chaque 🕊️ tile occupe `16` octets...
- ...donc chaque pattern table fait `4096` octets.
- La 👾 CHR-ROM dans la 💾 cartouche contient `2` 🕊️📖 pattern tables.
  - (disponible aux adresses PPU `$0000-$1FFF`)

<div class="embed-image"><img alt="Pattern table memory" src="assets/graphics/tile_bitplanes.png" style="width: 100%" /></div>

#### Exemple de pattern table

<div class="embed-image"><img alt="Pattern table" src="assets/graphics/tiles_grayscale.png" style="width: 30%" /></div>

#### Rendu

- Un 🕊️ tile est une grille de pixels `8x8` en _niveaux de gris_.
- Ces pixels peuvent être `0`, `1`, `2` ou `3` selon leur couleur.
  - (en binaire : `00`, `01`, `10` ou `11`)

Pour encoder les pixels, les `16` octets de données du tile sont divisés en **deux** **plans de bits** de `8 octets` (<strong style="color: #7723ec">plan bas</strong> et <strong style="color: #4eeebf">plan haut</strong>).

Voici un exemple d'encodage d'un tile pour **½** (fraction moitié) :

```
$41 $C2 $44 $48 $10 $20 $40 $80 $01 $02 $04 $08 $16 $21 $42 $87
```

<div class="embed-image"><img alt="Encoded tile" src="assets/graphics/one_half_fraction2.png" style="width: 75%" /></div>

Chaque bit du premier plan contrôle le <strong style="color: #7723ec">bit 0</strong> de la couleur d'un pixel ; le bit correspondant dans le second plan contrôle le <strong style="color: #4eeebf">bit 1</strong>.
