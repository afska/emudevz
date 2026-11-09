# Instructions

#### Référence

- 🚫 : L'instruction ne reçoit `"aucun"` _argument_.
- 🐏 : L'instruction reçoit une `"adresse"` mémoire comme _argument_.
- 🔢 : L'instruction reçoit une `"valeur"` comme _argument_.

#### 🧮 Arithmétique

| Code   | Nom                                       | Arg | Description                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------ | ----------------------------------------- | --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ADC`  | Additionner avec retenue (Add with Carry) | 🔢  | Additionne le contenu d'une `valeur` à `[A]` avec le flag Carry (`[A]` = `[A]` + `valeur` + `C`), en mettant aussi à jour les flags `Z` et `N`.<br><br>Les flags `C` et `V` sont activés en cas de débordement non signé et signé respectivement.<br><br>Le débordement non signé survient quand le résultat est >= `256` (utilise `byte.overflows(...)`).<br>Le débordement signé survient quand `Positif + Positif = Négatif` ou `Négatif + Négatif = Positif`. |
| `ASL`  | Décalage arithmétique gauche              | 🐏  | Décale tous les bits de la valeur à une `adresse` d'un cran vers la gauche. Le bit `7` est placé dans le flag `C` et le bit `0` est mis à `0`.<br><br><div class="embed-image"><img alt="ASL" src="assets/bitshifts/ASL.gif" width="186" height="115" /></div><br>Les flags `Z` et `N` sont mis à jour avec le résultat.                                                                                                            |
| `ASLa` | Décalage arithmétique gauche (Accumulateur) | 🚫  | Comme `ASL`, mais travaille avec `[A]` au lieu d'une adresse mémoire.                                                                                                                                                                                                                                                                                                                                                              |
| `DEC`  | Décrémenter la mémoire                    | 🐏  | Soustrait un à la valeur à une `adresse`, en mettant aussi à jour les flags `Z` et `N`.                                                                                                                                                                                                                                                                                                                                             |
| `DEX`  | Décrémenter le registre X                 | 🚫  | Soustrait un à `[X]`, en mettant aussi à jour les flags `Z` et `N`.                                                                                                                                                                                                                                                                                                                                                                 |
| `DEY`  | Décrémenter le registre Y                 | 🚫  | Soustrait un à `[Y]`, en mettant aussi à jour les flags `Z` et `N`.                                                                                                                                                                                                                                                                                                                                                                 |
| `INC`  | Incrémenter la mémoire                    | 🐏  | Ajoute un à la valeur à une `adresse`, en mettant aussi à jour les flags `Z` et `N`.                                                                                                                                                                                                                                                                                                                                                |
| `INX`  | Incrémenter le registre X                 | 🚫  | Ajoute un à `[X]`, en mettant aussi à jour les flags `Z` et `N`.                                                                                                                                                                                                                                                                                                                                                                    |
| `INY`  | Incrémenter le registre Y                 | 🚫  | Ajoute un à `[Y]`, en mettant aussi à jour les flags `Z` et `N`.                                                                                                                                                                                                                                                                                                                                                                    |
| `LSR`  | Décalage logique droit                    | 🐏  | Décale tous les bits de la valeur à une `adresse` d'un cran vers la droite. Le bit `0` est placé dans le flag `C` et le bit `7` est mis à `0`.<br><br><div class="embed-image"><img alt="LSR" src="assets/bitshifts/LSR.gif" width="186" height="115"/></div><br>Les flags `Z` et `N` sont mis à jour avec le résultat.                                                                                                             |
| `LSRa` | Décalage logique droit (Accumulateur)     | 🚫  | Comme `LSR`, mais travaille avec `[A]` au lieu d'une adresse mémoire.                                                                                                                                                                                                                                                                                                                                                               |
| `ROL`  | Rotation à gauche                         | 🐏  | Déplace tous les bits de la valeur à une `adresse` d'un cran vers la gauche. Le bit `7` est placé dans le flag `C` et le bit `0` est rempli avec l'ancienne valeur du flag `C`.<br><br><div class="embed-image"><img alt="ROL" src="assets/bitshifts/ROL.gif" width="186" height="115" /></div><br>Les flags `Z` et `N` sont mis à jour avec le résultat.                                                                           |
| `ROLa` | Rotation à gauche (Accumulateur)          | 🚫  | Comme `ROL`, mais travaille avec `[A]` au lieu d'une adresse mémoire.                                                                                                                                                                                                                                                                                                                                                               |
| `ROR`  | Rotation à droite                         | 🐏  | Déplace tous les bits de la valeur à une `adresse` d'un cran vers la droite. Le bit `0` est placé dans le flag `C` et le bit `7` est rempli avec l'ancienne valeur du flag `C`.<br><br><div class="embed-image"><img alt="ROR" src="assets/bitshifts/ROR.gif" width="186" height="115" /></div><br>Les flags `Z` et `N` sont mis à jour avec le résultat.                                                                          |
| `RORa` | Rotation à droite (Accumulateur)          | 🚫  | Comme `ROR`, mais travaille avec `[A]` au lieu d'une adresse mémoire.                                                                                                                                                                                                                                                                                                                                                               |
| `SBC`  | Soustraire avec retenue (Sub with Carry)  | 🔢  | Soustrait le contenu d'une `valeur` de `[A]` avec le complément du flag Carry.<br><br>Les flags `Z`, `N`, `C` (activé s'il n'y a pas eu d'emprunt), et `V` (activé quand le signe est incorrect) sont mis à jour.<br><br>Peut être implémenté comme un appel `ADC` avec la représentation négative de `valeur` - 1.<br>Ex :<br>`SBC(cpu, value) { ADC(cpu, 256 - value - 1) }`                                                      |

#### 📈 Données

| Code  | Nom                                         | Arg | Description                                                                      |
| ----- | ------------------------------------------- | --- | -------------------------------------------------------------------------------- |
| `CLC` | Effacer le flag Carry                       | 🚫  | Met `C` = `0`.                                                                   |
| `CLD` | Effacer le mode décimal                     | 🚫  | Met `D` = `0`.                                                                   |
| `CLI` | Effacer le masque d'interruption            | 🚫  | Met `I` = `0`.                                                                   |
| `CLV` | Effacer le flag Overflow                    | 🚫  | Met `V` = `0`.                                                                   |
| `LDA` | Charger l'accumulateur                      | 🔢  | Charge une `valeur` dans `[A]`, en mettant aussi à jour les flags `Z` et `N`.    |
| `LDX` | Charger le registre X                       | 🔢  | Charge une `valeur` dans `[X]`, en mettant aussi à jour les flags `Z` et `N`.    |
| `LDY` | Charger le registre Y                       | 🔢  | Charge une `valeur` dans `[Y]`, en mettant aussi à jour les flags `Z` et `N`.    |
| `PHA` | Empiler l'accumulateur                      | 🚫  | Empile `[A]` sur la pile.                                                        |
| `PHP` | Empiler le registre de flags                | 🚫  | Empile les flags (comme un octet, avec le bit `4` activé) sur la pile.           |
| `PLA` | Dépiler vers l'accumulateur                 | 🚫  | Dépile un octet de la pile dans `[A]`, en mettant aussi à jour les flags `Z` et `N`. |
| `PLP` | Dépiler vers le registre de flags           | 🚫  | Dépile un octet de la pile dans le registre de flags.                            |
| `SEC` | Activer le flag Carry                       | 🚫  | Met `C` = `1`.                                                                   |
| `SED` | Activer le flag décimal                     | 🚫  | Met `D` = `1`.                                                                   |
| `SEI` | Activer le masque d'interruption            | 🚫  | Met `I` = `1`.                                                                   |
| `STA` | Stocker l'accumulateur                      | 🐏  | Stocke le contenu de `[A]` à une `adresse`.                                      |
| `STX` | Stocker le registre X                       | 🐏  | Stocke le contenu de `[X]` à une `adresse`.                                      |
| `STY` | Stocker le registre Y                       | 🐏  | Stocke le contenu de `[Y]` à une `adresse`.                                      |
| `TAX` | Transférer l'accumulateur vers X            | 🚫  | Copie `[A]` dans `[X]`, en mettant aussi à jour les flags `Z` et `N`.            |
| `TAY` | Transférer l'accumulateur vers Y            | 🚫  | Copie `[A]` dans `[Y]`, en mettant aussi à jour les flags `Z` et `N`.            |
| `TSX` | Transférer le pointeur de pile vers X       | 🚫  | Copie `[SP]` dans `[X]`, en mettant aussi à jour les flags `Z` et `N`.           |
| `TXA` | Transférer X vers l'accumulateur            | 🚫  | Copie `[X]` dans `[A]`, en mettant aussi à jour les flags `Z` et `N`.            |
| `TXS` | Transférer X vers le pointeur de pile       | 🚫  | Copie `[X]` dans `[SP]`, **SANS** mettre à jour aucun flag.                      |
| `TYA` | Transférer Y vers l'accumulateur            | 🚫  | Copie `[Y]` dans `[A]`, en mettant aussi à jour les flags `Z` et `N`.            |

#### ✅ Tests

| Code  | Nom                          | Arg | Description                                                                                                                                                                                                                                                             |
| ----- | ---------------------------- | --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BIT` | Test de bit                  | 🔢  | Teste si un ou plusieurs bits sont activés dans une `valeur`.<br><br>Le flag `Z` est mis à jour pour être activé si la valeur ET logique `[A]` vaut `0` (`Z` = (`valeur` & `[A]`) == `0`).<br><br>Les bits `7` et `6` de la valeur sont copiés dans les flags `N` et `V` respectivement. |
| `CMP` | Comparer                     | 🔢  | Compare `[A]` avec une `valeur`, en mettant à jour `Z`, `N` et `C` comme suit :<br><br>`Z` = `[A]` == `valeur`<br>`N` = (si le bit `7` de (`[A]` - `valeur`) est activé)<br>`C` = `[A]` >= `valeur`                                                                    |
| `CPX` | Comparer le registre X       | 🔢  | Compare `[X]` avec une `valeur`, en mettant à jour `Z`, `N` et `C` comme suit :<br><br>`Z` = `[X]` == `valeur`<br>`N` = (si le bit `7` de (`[X]` - `valeur`) est activé)<br>`C` = `[X]` >= `valeur`                                                                    |
| `CPY` | Comparer le registre Y       | 🔢  | Compare `[Y]` avec une `valeur`, en mettant à jour `Z`, `N` et `C` comme suit :<br><br>`Z` = `[Y]` == `valeur`<br>`N` = (si le bit `7` de (`[Y]` - `valeur`) est activé)<br>`C` = `[Y]` >= `valeur`                                                                    |
| `AND` | ET logique                   | 🔢  | Effectue un ET logique "bit à bit" entre `[A]` et une `valeur` (`[A]` & `valeur`), stocke le résultat dans `[A]` et met à jour les flags `Z` et `N`.                                                                                                                    |
| `EOR` | OU exclusif                  | 🔢  | Effectue un OU exclusif "bit à bit" entre `[A]` et une `valeur` (`[A]` ^ `valeur`), stocke le résultat dans `[A]` et met à jour les flags `Z` et `N`.                                                                                                                   |
| `ORA` | OU inclusif logique          | 🔢  | Effectue un OU inclusif logique "bit à bit" entre `[A]` et une `valeur` (`[A]` \| `valeur`), stocke le résultat dans `[A]` et met à jour les flags `Z` et `N`.                                                                                                          |

#### 🔀 Branchement

| Code  | Nom                                  | Arg | Description                                                                                             |
| ----- | ------------------------------------ | --- | ------------------------------------------------------------------------------------------------------- |
| `BCC` | Brancher si Carry effacé             | 🐏  | Si le flag `C` est effacé, saute à une `adresse` **(\*)**.                                                       |
| `BCS` | Brancher si Carry activé             | 🐏  | Si le flag `C` est activé, saute à une `adresse` **(\*)**.                                                       |
| `BEQ` | Brancher si égal                     | 🐏  | Si le flag `Z` est activé, saute à une `adresse` **(\*)**.                                                       |
| `BMI` | Brancher si négatif                  | 🐏  | Si le flag `N` est activé, saute à une `adresse` **(\*)**.                                                       |
| `BNE` | Brancher si différent                | 🐏  | Si le flag `Z` est effacé, saute à une `adresse` **(\*)**.                                                       |
| `BPL` | Brancher si positif                  | 🐏  | Si le flag `N` est effacé, saute à une `adresse` **(\*)**.                                                       |
| `BVC` | Brancher si Overflow effacé          | 🐏  | Si le flag `V` est effacé, saute à une `adresse` **(\*)**.                                                       |
| `BVS` | Brancher si Overflow activé          | 🐏  | Si le flag `V` est activé, saute à une `adresse` **(\*)**.                                                       |
| `JMP` | Sauter                               | 🐏  | Saute à une `adresse`.                                                                                  |
| `JSR` | Sauter à un sous-programme           | 🐏  | Empile le `[PC]` courant (moins un) sur la pile et saute à une `adresse`.                               |
| `RTI` | Retour d'interruption                | 🚫  | Dépile un octet de la pile dans le registre de flags, puis dépile une valeur 16 bits et la stocke dans `[PC]`. |
| `RTS` | Retour de sous-programme             | 🚫  | Dépile une valeur 16 bits de la pile et stocke cette valeur (plus un) dans `[PC]`.                      |

<br />

**(\*)** Toutes les instructions de branchement **conditionnel** doivent incrémenter `cpu.extraCycles` si elles branchent, ou lui assigner `0` sinon. Cela ne s'applique pas aux instructions qui sautent toujours (comme `JMP`, `JSR`, `RTI`, ou `RTS`).

#### 🧙‍♂️ Système

| Code  | Nom                      | Arg | Description                                                                                                                                                                                |
| ----- | ------------------------ | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `BRK` | Forcer une interruption  | 🚫  | Incrémente `[PC]` et force la génération d'une interruption logicielle.<br><br>Le `[PC]` et les flags (avec le bit `4` activé) sont empilés, puis le vecteur d'interruption BRK à `$FFFE/F` est chargé dans `[PC]`. |
| `NOP` | Aucune opération         | 🚫  | Ne provoque aucun changement.                                                                                                                                                              |
