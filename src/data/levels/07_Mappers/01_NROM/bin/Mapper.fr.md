# `Mapper`

📄 /lib/Mapper.js 📄

Cette classe facilite l'implémentation des mappers NEEES.

## Utilisation

1. Crée une classe qui étend `Mapper`.
2. Surcharge et implémente les méthodes suivantes :
  - `cpuRead(address)`
  - `cpuWrite(address, value)`
  - `ppuRead(address)`
  - `ppuWrite(address, value)`
3. Utilise `$getPrgPage(page)` et `$getChrPage(page)` pour obtenir une page `PRG` ou `CHR` particulière.
  * Alternativement, tu peux accéder directement aux tableaux `prgPages` et `chrPages`.
4. Implémente `getSaveState()` et `setSaveState(saveState)` pour créer et restaurer correctement les états de sauvegarde.
5. Tu peux surcharger `prgRomPageSize()` et `chrRomPageSize()` pour changer la taille des pages.
6. Tu peux surcharger `onLoad()` pour exécuter des opérations lors du chargement d'une ROM.
7. Tu peux surcharger `tick()` pour exécuter des opérations à chaque scanline.
