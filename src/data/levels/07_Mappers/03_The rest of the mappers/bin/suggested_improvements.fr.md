# Améliorations suggérées pour ton émulateur

<div class="embed-image"><img alt="Achievement" src="assets/graphics/achievement_complete.png" style="width: 30%; margin: 16px" /></div>

Félicitations d'être arrivé jusqu'ici ! Maintenant que tu as le contrôle total sur l'émulateur et peux tout modifier à ta guise, il y a beaucoup de domaines dans lesquels tu peux l'améliorer. Ces améliorations n'ont même pas besoin de démolir les composants que tu as construits tout au long du jeu, car l'émulateur que tu as créé est étonnamment capable. Il n'est peut-être pas le plus précis, mais ne le sous-estime pas, ni toi-même ! Beaucoup de jeux fonctionneront correctement tant que tu gères bien l'émulation du mapper.

Voici quelques améliorations suggérées que tu peux apporter à l'émulation sans changements majeurs à l'architecture globale :

#### 🎮 Manette

Certains jeux ne répondront pas aux entrées avec l'implémentation actuelle de ta manette. Les chapitres précédents n'en ont pas beaucoup parlé, mais il existe un concept appelé `open bus`, ce qui signifie que certains bits d'un octet peuvent être parasites lors de la lecture, car rien n'est connecté à ces bits. Dans le cas des entrées de la manette, rappelle-toi que seul le premier bit (bit `0`) était utilisé. Ça fonctionne pour `99%` des jeux, mais une poignée de jeux attend voir de l'open bus lors de la lecture des ports de la manette.

L'octet de poids fort de l'adresse est typiquement la dernière chose sur le bus, donc dans beaucoup de cas (mais pas tous), c'est aussi ce qui est utilisé pour l'open bus. Dans le cas des entrées de la manette, comme ça implique de lire depuis `$4016` et `$4017`, l'open bus pour ces adresses est `$40`.

Une implémentation simple serait de changer la valeur de retour de ta méthode `onRead()` en :

```js
return 0x40 | +isPressed;
```

En ajoutant ça à ton émulation de manette, les jeux impliquant `des gens qui livrent des journaux`, `un personnage en colère nommé Max`, et quelques autres devraient maintenant accepter les entrées !

#### ✋ Interruptions

En post-jeu, tu peux ajouter autant de mappers NEEES que tu veux. Cependant, à mesure que tu implémentes les IRQ de l'APU, améliores la précision du moment où ta PPU envoie des NMI, ou ajoutes des mappers plus complexes qui envoient leurs propres IRQ, comme `MMC3`, tu remarqueras que la façon dont ton émulateur envoie des interruptions au CPU est très simple et pourrait ne pas suffire pour tout gérer.

##### Requête, service, acquittement

BrokenNEEES exécute normalement une instruction (prenant `N` cycles) puis exécute `N * 3` points PPU pour rattraper. Si une NMI survient pendant l'un de ces points, le CPU saute immédiatement vers le _gestionnaire d'interruption_. Cette dernière partie n'est pas idéale. Un vrai CPU fonctionne plutôt comme ça :
```
- Démarrage
- Récupérer la prochaine instruction      < <
- Décoder l'instruction                    | |
- Exécuter l'instruction                   | |
- Y a-t-il une interruption en attente ? --non |
-   |---oui---> Traiter l'interruption   ---|
```

Donc, dans la réalité, la PPU (qui tourne en parallèle) ne ferait que _demander_ l'interruption. Le CPU finirait son instruction courante avant de la traiter. Quand un périphérique _demande_ une interruption, il peut continuer à la demander jusqu'à ce qu'elle soit _acquittée_. Acquitter une interruption signifie effacer la condition qui a causé la demande. Traiter l'interruption (sauter vers le _gestionnaire d'interruption_) ne l'acquitte pas nécessairement, donc l'interruption peut rester en attente jusqu'à ce que le registre approprié soit lu ou écrit.

##### Solution proposée

Plusieurs périphériques peuvent envoyer des IRQ au CPU :
- l'APU (qui peut envoyer deux IRQ différents !)
- le mapper (typiquement des compteurs de cycles CPU ou de scanlines)
- le CPU lui-même, quand `BRK` est exécuté

Pour les gérer tous, ainsi que NMI et RESET, tu pourrais envisager de réécrire la façon dont la classe `Emulator` envoie des interruptions.

La classe `Emulator` fournit plusieurs fonctions `onIntr` dans `_clockAPU(...)`, `_clockPPU(...)`, etc., mais elles détournent immédiatement le CPU vers une interruption alors que ce n'est peut-être pas le meilleur moment. Au lieu de ça, fais en sorte que ces fonctions `onIntr` "mettent en file d'attente" les interruptions pour que le CPU les gère à sa convenance, avec un système de priorités.

Priorités d'interruption suggérées, de la plus haute à la plus basse, et qui doit gérer l'acquittement :

| Interruption              | Qui l'acquitte                                                       | Priorité (plus bas = plus haute) |
| ------------------------- | -------------------------------------------------------------------- | -------------------------------- |
| RESET                     | CPU                                                                  | `0`                              |
| NMI                       | CPU                                                                  | `1`                              |
| BRK (IRQ)                 | CPU                                                                  | `2`                              |
| APU Frame counter (IRQ)   | Registres APU (quand accédés par le CPU)                             | `3`                              |
| APU DMC terminé (IRQ)     | Registres APU (quand écrits par le CPU)                              | `4`                              |
| Mapper (IRQ)              | Mapper (quand le CPU écrit dans un registre spécifique au mapper)    | `5`                              |

<br />

Envoyer les interruptions de cette façon permet aussi une émulation plus précise des IRQ des mappers, car les jeux peuvent indiquer au mapper ou à d'autres hardware que les interruptions ont été gérées et/ou annulées. Sur la vraie NEEES, les périphériques enverraient sinon leur signal d'interruption en continu. Gérer les interruptions de cette façon permettrait aussi à ta PPU de signaler le VBlank au cycle `1` comme prévu, au lieu du cycle `0` comme un chapitre précédent te l'avait indiqué.

Cette liste de suggestions ne fournit pas un tutoriel complet, mais envisage d'ajouter quelque chose comme un pseudo-registre à ton CPU appelé `PendingInterrupts`, qui garde une trace des interruptions en attente. Ça peut être fait avec `InMemoryRegister` pour les suivre toutes, ou avec un booléen par source d'interruption : Reset, NMI, BRK, APU frame, APU DMC, et le mapper. Puis fournis des méthodes simples comme `raise(id)` et `acknowledge(id)` qui activent et effacent ces booléens. Ensuite, dans la méthode `step()` de ton CPU, au lieu de retourner `this._addCycles(operation)`, retourne un appel de méthode comme `this._checkInterrupts(cycles)`. Dans cette méthode, vérifie quelle interruption de plus haute priorité est prête, et si l'une d'elles l'est, fais prendre l'interruption à ton CPU (`this.interrupt(...)`) et retourne le paramètre `cycles`, en le modifiant si l'interruption a été prise.

Bien sûr, il y a beaucoup de façons de gérer les interruptions en attente et de les acquitter, donc n'hésite pas à apprendre et expérimenter ! Les périphériques internes ont été choisis comme priorités les plus hautes dans cet exemple.

#### 🖥️ PPU

Il y a aussi beaucoup de domaines dans lesquels la PPU peut être améliorée. Cependant, un tel sujet serait bien trop étendu et hors scope pour ce petit document de suggestions. Voici plutôt deux courts exemples de choses qui peuvent être améliorées :

- Tiles fantômes dans `BackgroundRenderer` : La vraie PPU de la NEEES récupère en réalité plus de `32` tiles par scanline, mais n'en fait pas grand-chose, et certains mappers comme `MMC2` et `MMC4` guettent cela ! Pour simplifier, les chapitres précédents n'en récupéraient que `32`. Effectuer ces récupérations autrement inutilisées permettra à certains jeux utilisant `MMC2` et `MMC4` de fonctionner sans bugs graphiques. Dans `BackgroundRenderer::renderScanline()`, fais continuer la boucle jusqu'à `x < 272` et ne trace les pixels de background que quand `x < 256` (laisse la boucle faire tout le reste, aucun autre changement nécessaire). Après ça, tu remarqueras que le jeu impliquant `un outsider qui aspire à être le meilleur boxeur` ne devrait plus avoir un ring de boxe corrompu/glitché !

- `SpriteRenderer` : Si tu finis par améliorer ta PPU pour que le `jeu de boxe` fonctionne, il y a un petit changement à apporter au rendu de sprites. Tu remarqueras que le boxeur adverse se transformera en un fouillis de tiles glitchés lors de ses attaques spéciales. Pour corriger ça, tu peux simplement empêcher la méthode `_evaluate()` de retourner une liste de sprites inversée. Cependant ! Ça crée des problèmes dans d'autres jeux, comme le `troisième jeu du plombier`, qui veut la liste de sprites inversée pour pouvoir mettre des ennemis derrière des tuyaux, créant l'illusion d'ennemis qui surgissent d'eux. Donc pour concilier ça, tu pourrais soit :
    - Réécrire entièrement le rendu des sprites pour améliorer la précision, soit :
    - (Note que c'est un hack et pas précis !) Écrire une petite méthode qui retourne `true` si l'id du mapper est `9` ou `10`, puis utiliser ce résultat pour conditionner l'inversion de la liste de sprites ou non. Ça permettrait au `troisième jeu du plombier` et au `jeu de boxe` d'être affichés correctement.

#### 🔊 APU

Tu as peut-être remarqué dans certains jeux utilisant des samples DPCM qu'il y a des parasites ou du bruit dans certains cas. Pour corriger ça, modifie `DPCM.js` et ajoute `this.isActive = false` à la méthode `stop()`. C'est plus facilement testable dans le `jeu de boxe` : quand la foule arrête d'acclamer, tu entendras facilement un bourdonnement parasite sans ce correctif.
