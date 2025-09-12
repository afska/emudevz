# Controller

The NEEES has support for `2` controllers, mapped to CPU addresses `$4016` (player `1`) and `$4017` (player `2`).

## 🎮 Usage

Reading a controller's address reports `1` when a button is pressed or `0` when it isn't, and the buttons advance in a particular order. This means that, to get the state of all buttons, the games have to read `8` times.

The buttons advance as follows:

`A` -> `B` -> `Select` -> `Start` -> `Up` -> `Down` -> `Left` -> `Right`

After reading the state of the `Right` button, future reads will return `1` until the game resets the sequence by writing `1` and then `0` to `$4016` (see below).

## 🔄 Strobe mode

When writing to `$4016` (player `1`'s controller address), the **first bit** of the written value configures the `strobe mode`:
- with the strobe bit `on`, reads always report the status of button `A`
- with the strobe bit `off`, reads advance through the previously mentioned sequence

When turning the strobe bit `on`, the sequence **resets** to button `A` **on both controllers**.

Writing to `$4017` doesn't affect controllers; it controls an APU register called 🧮  APUFrameCounter.
