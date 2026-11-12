# Génération de bruit

- Le 💥 Canal Bruit dispose d'un **registre à décalage** de 15 bits cadencé périodiquement.
- Au **démarrage**, le registre à décalage est chargé avec la valeur `1`.
- Le bit `7` de 🌪️ NoiseForm est le **flag de mode**, qui affecte le motif de bruit.
- Les bits `0-3` de 🌪️ NoiseForm servent d'index dans une table fixe de "périodes de bruit", qui est :

```javascript
[2, 4, 8, 16, 32, 48, 64, 80, 101, 127, 190, 254, 381, 508, 1017, 2034]
```

- Si l'**index de période** est -par exemple- `3`, la **période de bruit** sera `16`. Cela signifie que le registre à décalage sera cadencé une fois tous les `16` cycles APU (appels à `step()`).

- Quand le registre à décalage de 15 bits est cadencé, les actions suivantes se produisent dans l'ordre :

  - un bit de `feedback` est calculé :
    - si le flag de mode est activé => `bit 0 ^ bit 6`
    - si le flag de mode est désactivé => `bit 0 ^ bit 1`
  - le registre à décalage est **décalé à droite** d'un bit (`>> 1`)
  - le bit `14`, le bit le plus à gauche, est remplacé par le bit de `feedback` calculé précédemment

<div style="text-align: center">
  <img alt="noise" src="assets/bitshifts/noise.gif" width="134" height="115" />
  <pre>Exemple avec le flag de mode ACTIVÉ</pre>
</div>

- Le sample de sortie du canal est le **volume d'enveloppe**, ou `0` si l'une des conditions suivantes est vraie :
  - le bit `0` du registre à décalage est activé
  - le compteur de longueur est à `0`
