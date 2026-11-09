# Format iNEEES

Un fichier iNEEES se compose des sections suivantes, dans l'ordre :

<table style="margin-bottom: 16px; text-align: center;">
  <tr>
    <td>🗣️</td>
    <td style="width: 50px">🧸</td>
    <td style="width: 200px">🤖</td>
		<td style="width: 150px">👾</td>
  </tr>
</table>

- 🗣️ En-tête (`16` octets)
- 🧸 Rembourrage, si présent (`0` ou `512` octets)
- 🤖 Données PRG-ROM (`16384` \* `x` octets)
  - `x` = octet `4` de l'en-tête
- 👾 Données CHR-ROM (`8192` \* `y` octets)
  - `y` = octet `5` de l'en-tête

## 🗣️ En-tête

Le format de l'en-tête est le suivant :

<div class="embed-image" style="margin-bottom: 16px"><img alt="Header" src="assets/header.png" style="width: 75%" /></div>

- `0-3`: Constante `$4E $45 $53 $1A`
- `4`: Taille de la 🤖 PRG-ROM en unités de `16` Kio
- `5`: Taille de la 👾 CHR-ROM en unités de `8` Kio (valeur `0` signifie que la carte utilise `8` Kio de 👾 CHR-RAM)
- `6`: Flags 6 - 🗜️ Mapper (quartet inférieur), 🚽 mirroring, 🔋 sauvegardes (PRG-RAM), 🧸 rembourrage
- `7`: Flags 7 - 🗜️ Mapper (quartet supérieur), 🧸 rembourrage
- `8-15`: 🧸 Rembourrage inutilisé

🗜️ Les cartes de cartouche sont divisées en classes appelées **mappers** selon leur hardware similaire, chacune ayant un numéro sur 8 bits.

🚽 Chaque cartouche définit également un **type de mirroring** qui affecte directement l'agencement de l'écran et la gestion du scrolling.

Pour l'instant :

- 🗜️ L'id du mapper peut être n'importe quel nombre entre `0` et `255`.
- 🚽 Le type de mirroring peut être : `HORIZONTAL`, `VERTICAL`, `FOUR_SCREEN`.

### Flags 6

```
76543210
||||||||
|||||||+- Mirroring: 0: HORIZONTAL (pour le scrolling vertical)
|||||||              1: VERTICAL (pour le scrolling horizontal)
||||||+-- 1: La cartouche contient de la PRG-RAM (pour les fichiers de sauvegarde)
|||||+--- 1: Le fichier contient 512 octets de rembourrage avant les données PRG-ROM
||||+---- 1: Ignorer le bit 0 et utiliser le mirroring FOUR_SCREEN
++++----- Quartet inférieur du numéro de mapper
```

### Flags 7

```
76543210
||||||||
||||||||
||||||||
||||||||
||||||||
||||++++- Rembourrage inutilisé
++++----- Quartet supérieur du numéro de mapper
```
