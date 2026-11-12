# Flags

Le **registre de flags**, aussi appelé **processor status** (ou simplement **P**), contient plusieurs flags CPU dans `1` octet :

```raw
 _______________________________
| 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
|---|---|---|---|---|---|---|---|
| N | V | 1 | b | D | I | Z | C |
 ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
```

| Bit | Flag | Description |
| --- | ---- | ----------- |
| `0` | `Carry` | Activé quand une opération arithmétique non signée dépasse `255`, ou quand une soustraction n'a pas besoin d'emprunter. Aussi utilisé par les décalages et rotations. |
| `1` | `Zero` | Activé quand le dernier résultat est `0`. |
| `2` | `Interrupt Disable` | Quand activé, les interruptions masquables (`IRQ`) sont désactivées. |
| `3` | `Decimal` | Active le mode décimal sur un 6502 normal, mais inutilisé sur la NEEES. |
| `4` | `b` | Pas un vrai flag, mais selon la source, ce bit sera poussé sur la pile comme `1` ou `0`. Les interruptions logicielles (`BRK`) et les instructions `PHP` le poussent `b` comme `1`. Les interruptions matérielles (`IRQ` et `NMI`) le poussent `b` comme `0`. |
| `5` | `1` | Pas un vrai flag. Toujours `1`. |
| `6` | `Overflow` | Activé quand une opération arithmétique déborde en calcul signé, comme `Positif + Positif = Négatif` ou `Négatif + Négatif = Positif`. |
| `7` | `Negative` | Activé lorsque le dernier résultat a son bit `7` positionné (nombre négatif). |
