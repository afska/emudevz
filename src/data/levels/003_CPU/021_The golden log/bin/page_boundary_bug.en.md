# CPU: Page boundary bug

The **Indirect** addressing mode has a bug.

If the address falls on a page boundary `($aaFF)`, it fetches the least significant byte from
`$aaFF` as expected, but takes the most significant byte from `$aa00` (instead of `$ab00`).

So, instead of `read16(address)`, the implementation should be like this:

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
