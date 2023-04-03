# CPU: Page boundary bug

El modo de direccionamiento **Indirect** tiene una falla:

Si la dirección cae en el borde de una página `($aaFF)`, lee el byte menos significativo de `$aaFF` como es esperado, pero toma el byte más significativo de `$aa00` (en vez de `$ab00`).

Así que, en vez de `read16(address)`, la implementación debería ser algo así:

```
buildU16(
  read(
    lowByteOf(address) === 0xff
      ? buildU16(highByteOf(address), 0x00)
      : address + 1
  ),
  read(address)
);
```
