# CPU: Instrucciones

#### Referencia

- 🚫: La instrucción `"no"` recibe _argumentos_.
- 🐏: La instrucción recibe una `"address"` como _argumento_.
- 🔢: La instrucción recibe un `"value"` como _argumento_.

#### 🔢 Aritméticas

| Código | Nombre                                             | Arg | Descripción                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------ | -------------------------------------------------- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ADC`  | Sumar con Carry                                    | 🔢  | Suma el contenido de un `value` a `[A]` junto con la bandera Carry (`[A]` = `[A]` + `value` + `C`), actualizando las banderas `Z` y `N`.<br><br>Las banderas `C` y `V` son activadas en caso de overflow sin signo y con signo respectivamente.<br><br>El overflow sin signo ocurre cuando el resultado es >= `256` (usar `byte.overflows(...)`).<br>El overflow con signo ocurre cuando `Positivo + Positivo = Negativo` o `Negativo + Negativo = Positivo`. |
| `ASL`  | Desplazamiento Aritmético a Izquierda              | 🐏  | Desplaza todos los bits del valor contenido en una `address` un lugar hacia la izquierda. El bit `7` es colocado en la bandera `C` y el bit `0` es rellenado con `0`.<br><br><div class="embed-image"><img alt="ASL" src="assets/bitshifts/ASL.gif" /></div><br>Las banderas `Z` y `N` se actualizan usando el resultado.                                                                                                                                     |
| `ASLa` | Desplazamiento Aritmético a Izquierda (Acumulador) | 🚫  | Como `ASL`, pero funciona con `[A]` en vez de con una dirección de memoria.                                                                                                                                                                                                                                                                                                                                                                                   |
| `DEC`  | Decrementar Memoria                                | 🐏  | Sustrae uno del valor contenido en la `address`, actualizando las banderas `Z` y `N`.                                                                                                                                                                                                                                                                                                                                                                         |
| `DEX`  | Decrementar Registro X                             | 🚫  | Sustrae uno de `[X]`, actualizando las banderas `Z` y `N`.                                                                                                                                                                                                                                                                                                                                                                                                    |
| `DEY`  | Decrementar Registro Y                             | 🚫  | Sustrae uno de `[Y]`, actualizando las banderas `Z` y `N`.                                                                                                                                                                                                                                                                                                                                                                                                    |
| `INC`  | Incrementar Memoria                                | 🐏  | Suma uno al valor contenido en una `address`, actualizando las banderas `Z` y `N`.                                                                                                                                                                                                                                                                                                                                                                            |
| `INX`  | Incrementar Registro X                             | 🚫  | Suma uno a `[X]`, actualizando las banderas `Z` y `N`.                                                                                                                                                                                                                                                                                                                                                                                                        |
| `INY`  | Incrementar Registro Y                             | 🚫  | Suma uno a `[Y]`, actualizando las banderas `Z` y `N`.                                                                                                                                                                                                                                                                                                                                                                                                        |
| `LSR`  | Desplazamiento Lógico a Derecha                    | 🐏  | Desplaza todos los bits del valor contenido en una `address` un lugar hacia la derecha. El bit `0` es colocado en la bandera `C` y el bit `7` es rellenado con `0`.<br><br><div class="embed-image"><img alt="LSR" src="assets/bitshifts/LSR.gif" /></div><br>Las banderas `Z` y `N` se actualizan usando el resultado.                                                                                                                                       |
| `LSRa` | Desplazamiento Lógico a Derecha (Acumulador)       | 🚫  | Como `LSR`, pero funciona con `[A]` en vez de con una dirección de memoria.                                                                                                                                                                                                                                                                                                                                                                                   |
| `ROL`  | Rotar Izquierda                                    | 🐏  | Mueve todos los bits del valor contenido en una `address` un lugar hacia la izquierda. El bit `7` es colocado en la bandera `C` y el bit `0` es rellenado con el valor anterior de la bandera `C`.<br><br><div class="embed-image"><img alt="ROL" src="assets/bitshifts/ROL.gif" /></div><br>Las banderas `Z` y `N` se actualizan usando el resultado.                                                                                                        |
| `ROLa` | Rotar Izquierda (Acumulador)                       | 🚫  | Como `ROL`, pero funciona con `[A]` en vez de con una dirección de memoria.                                                                                                                                                                                                                                                                                                                                                                                   |
| `ROR`  | Rotar Derecha                                      | 🐏  | Mueve todos los bits del valor contenido en una `address` un lugar hacia la derecha. El bit `0` es colocado en la bandera `C` y el bit `7` es rellenado con el valor anterior de la bandera `C`.<br><br><div class="embed-image"><img alt="ROR" src="assets/bitshifts/ROR.gif" /></div><br>Las banderas `Z` y `N` se actualizan usando el resultado.                                                                                                          |
| `RORa` | Rotar Derecha (Acumulador)                         | 🚫  | Como `ROR`, pero funciona con `[A]` en vez de con una dirección de memoria.                                                                                                                                                                                                                                                                                                                                                                                   |
| `SBC`  | Sustraer con Carry                                 | 🔢  | Sustrae el contenido de un `value` a `[A]` junto con el `not` de la bandera Carry (`[A]` = `[A]` - `value` - `!C`).<br><br>Las banderas `Z`, `N`, `C` (activada si no hay que "tomar prestado"), y `V` (activada cuando el signo quedó mal) se actualizan.<br><br>Puede ser implementada como una llamada a `ADC` con la representación negativa de `value` - 1.<br>Ej:<br>`SBC(cpu, value) { ADC(cpu, 256 - value - 1) }`                                    |

#### 🐏 Datos

| Código | Nombre                         | Arg | Descripción                                                                      |
| ------ | ------------------------------ | --- | -------------------------------------------------------------------------------- |
| `CLC`  | Limpiar Bandera Carry          | 🚫  | Asigna `C` = `0`.                                                                |
| `CLD`  | Limpiar Decimal Mode           | 🚫  | Asigna `D` = `0`.                                                                |
| `CLI`  | Limpiar Interrupt Disable      | 🚫  | Asigna `I` = `0`.                                                                |
| `CLV`  | Limpiar Bandera Overflow       | 🚫  | Asigna `V` = `0`.                                                                |
| `LDA`  | Cargar Acumulador              | 🔢  | Carga un `value` en `[A]`, actualizando las banderas `Z` y `N`.                  |
| `LDX`  | Cargar Registro X              | 🔢  | Carga un `value` en `[X]`, actualizando las banderas `Z` y `N`.                  |
| `LDY`  | Cargar Registro Y              | 🔢  | Carga un `value` en `[Y]`, actualizando las banderas `Z` y `N`.                  |
| `PHA`  | Agregar Acumulador             | 🚫  | Agrega `[A]` a la pila.                                                          |
| `PHP`  | Agregar Estado del Procesador  | 🚫  | Agrega las banderas (como un byte, con el bit `4` encendido) a la pila.          |
| `PLA`  | Sacar Acumulador               | 🚫  | Saca un byte de la pila y lo pone en `[A]`, actualizando las banderas `Z` y `N`. |
| `PLP`  | Sacar Estado del Procesador    | 🚫  | Saca un byte de la pila y lo pone en el registro de banderas.                    |
| `SEC`  | Encender Bandera Carry         | 🚫  | Asigna `C` = `1`.                                                                |
| `SED`  | Encender Bandera Decimal       | 🚫  | Asigna `D` = `1`.                                                                |
| `SEI`  | Encender Interrupt Disable     | 🚫  | Asigna `I` = `1`.                                                                |
| `STA`  | Almacenar Acumulador           | 🐏  | Almacena el contenido de `[A]` en una `address`.                                 |
| `STX`  | Almacenar Registro X           | 🐏  | Almacena el contenido de `[X]` en una `address`.                                 |
| `STY`  | Almacenar Registro Y           | 🐏  | Almacena el contenido de `[Y]` en una `address`.                                 |
| `TAX`  | Transferir Acumulador a X      | 🚫  | Copia `[A]` a `[X]`, actualizando las banderas `Z` y `N`.                        |
| `TAY`  | Transferir Accumulator a Y     | 🚫  | Copia `[A]` a `[Y]`, actualizando las banderas `Z` y `N`.                        |
| `TSX`  | Transferir Puntero de Pila a X | 🚫  | Copia `[SP]` a `[X]`, actualizando las banderas `Z` y `N`.                       |
| `TXA`  | Transferir X a Accumulator     | 🚫  | Copia `[X]` a `[A]`, actualizando las banderas `Z` y `N`.                        |
| `TXS`  | Transferir X a Puntero de Pila | 🚫  | Copia `[X]` a `[SP]`, **SIN** actualizar ninguna bandera.                        |
| `TYA`  | Transferir Y a Accumulator     | 🚫  | Copia `[Y]` a `[A]`, actualizando las banderas `Z` y `N`.                        |

#### ✅ Verificaciones

| Código | Nombre              | Arg | Descripción                                                                                                                                                                                                                                                                             |
| ------ | ------------------- | --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BIT`  | Comprobar Bits      | 🔢  | Comprueba si uno o más bits están encendidos en un `value`.<br><br>La bandera `Z` se actualiza encendiéndose si el valor ANDeado con el registro `[A]` es `0` (`Z` = (`value` & `[A]`) == `0`).<br><br>Los bits `7` y `6` del valor se copian a las banderas `N` y `V` respectivamente. |
| `CMP`  | Comparar            | 🔢  | Compara `[A]` con un `value`, actualizando las banderas:<br><br>`Z` (si `[A]` == `value`), `N` (si el bit `7` de (`[A]` - `value`) está encendido) y `C` (si `[A]` >= `value`).                                                                                                         |
| `CPX`  | Comparar Registro X | 🔢  | Compara `[X]` con un `value`, actualizando las banderas:<br><br>`Z` (si `[X]` == `value`), `N` (si el bit `7` de (`[X]` - `value`) está encendido) y `C` (si `[X]` >= `value`).                                                                                                         |
| `CPY`  | Comparar Registro Y | 🔢  | Compara `[Y]` con un `value`, actualizando las banderas:<br><br>`Z` (si `[Y]` == `value`), `N` (si el bit `7` de (`[Y]` - `value`) está encendido) y `C` (si `[Y]` >= `value`).                                                                                                         |
| `AND`  | AND Lógico          | 🔢  | Realiza un AND lógico "bit por bit" entre `[A]` y un `value` (`[A]` & `value`), almacenando el resultado en `[A]` y actualizando las banderas `Z` y `N`.                                                                                                                                |
| `EOR`  | OR Exclusivo        | 🔢  | Realiza un OR exclusivo "bit por bit" entre `[A]` y un `value` (`[A]` ^ `value`), almacenando el resultado en `[A]` y actualizando las banderas `Z` y `N`.                                                                                                                              |
| `ORA`  | OR Lógico Inclusivo | 🔢  | Realiza un OR lógico inclusivo "bit por bit" entre `[A]` y un `value` (`[A]` \| `value`), almacenando el resultado en `[A]` y actualizando las banderas `Z` y `N`.                                                                                                                      |

#### 🔀 Bifurcaciones

| Código | Nombre                      | Arg | Descripción                                                            |
| ------ | --------------------------- | --- | ---------------------------------------------------------------------- |
| `BCC`  | Saltar si no Carry          | 🐏  | Si la bandera `C` está apagada, salta a una `address`.                 |
| `BCS`  | Saltar si Carry             | 🐏  | Si la bandera `C` está encendida, salta a una `address`.               |
| `BEQ`  | Saltar si Igual             | 🐏  | Si la bandera `Z` está encendida, salta a una `address`.               |
| `BMI`  | Saltar si Negativo          | 🐏  | Si la bandera `N` está encendida, salta a una `address`.               |
| `BNE`  | Saltar si Distinto          | 🐏  | Si la bandera `Z` está apagada, salta a una `address`.                 |
| `BPL`  | Saltar si Positivo          | 🐏  | Si la bandera `N` está apagada, salta a una `address`.                 |
| `BVC`  | Saltar si no Overflow       | 🐏  | Si la bandera `V` está apagada, salta a una `address`.                 |
| `BVS`  | Saltar si Overflow          | 🐏  | Si la bandera `V` está encendida, salta a una `address`.               |
| `JMP`  | Saltar                      | 🐏  | Salta a una `address`.                                                 |
| `JSR`  | Saltar a Subrutina          | 🐏  | Pone el `[PC]` actual (menos uno) en la pila y salta a una `address`.  |
| `RTI`  | Retornar desde Interrupción | 🚫  | Saca el registro de banderas de la pila, luego saca `[PC]` de la pila. |
| `RTS`  | Retornar desde Subrutina    | 🚫  | Saca `[PC]` (más uno) de la pila.                                      |

<br />

Todas las instrucciones de bifurcación **condicionales** deben incrementar `cpu.extraCycles` si saltan, o asignarle `0` en caso contrario.

#### 🧙‍♂️ Sistema

| Código | Nombre              | Arg | Descripción                                                                                                                                                                                                  |
| ------ | ------------------- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `BRK`  | Forzar Interrupción | 🚫  | Fuerza la generación de una solicitud de interrupción.<br><br>El `[PC]` y las banderas (con el bit `4` encendido) se ponen en la pila, luego el vector de interrupciones IRQ en `$FFFE/F` se carga a `[PC]`. |
| `NOP`  | No Operar           | 🚫  | No causa ningún tipo de cambio.                                                                                                                                                                              |
