# Bug de limite de page

Le mode d'adressage **Indirect** contient un bug.

Si l'adresse tombe sur une limite de page `($aaFF)`, il récupère l'octet de poids faible depuis `$aaFF` comme prévu, mais prend l'octet de poids fort depuis `$aa00` (au lieu de `$ab00`).

Donc, au lieu d'appeler simplement `read16(address)`, l'implémentation du mode **Indirect** doit ressembler à ceci :

```javascript
buildU16(
  read(
    lowByteOf(address) === 0xff
      ? buildU16(highByteOf(address), 0x00)
      : address + 1
  ),
  read(address)
);
```
