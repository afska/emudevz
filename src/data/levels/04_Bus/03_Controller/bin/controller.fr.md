# Manette

La NEEES prend en charge `2` manettes, mappées aux adresses CPU `$4016` (joueur `1`) et `$4017` (joueur `2`).

## 🎮 Utilisation

Lire l'adresse d'une manette renvoie `1` si un bouton est pressé ou `0` sinon, et les boutons avancent dans un ordre précis. Ainsi, pour obtenir l'état de tous les boutons, les jeux doivent lire `8` fois.

Les boutons avancent comme suit :

`A` -> `B` -> `Select` -> `Start` -> `Up` -> `Down` -> `Left` -> `Right`

Après avoir lu l'état du bouton `Right`, les lectures suivantes retournent `1` jusqu'à ce que le jeu réinitialise la séquence en écrivant `1` puis `0` à `$4016` (voir ci-dessous).

## 🔄 Mode strobe

Lors d'une écriture à `$4016` (l'adresse de la manette du joueur `1`), le **premier bit** de la valeur écrite configure le `mode strobe` :
- avec le bit strobe `activé`, les lectures signalent toujours l'état du bouton `A`
- avec le bit strobe `désactivé`, les lectures avancent dans la séquence mentionnée précédemment

En activant le bit strobe, la séquence **se réinitialise** au bouton `A` **sur les deux manettes**.

Écrire à `$4017` n'affecte pas les manettes ; cela contrôle un registre APU appelé 🧮  APUFrameCounter.
