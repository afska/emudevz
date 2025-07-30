# Noise Generation

- The 💥 Noise Channel has a 15-bit **shift register** that is clocked periodically.
- 🌪️ NoiseForm's bit `7` is the **mode flag**, which affects the noise pattern.
- 🌪️ NoiseForm's bits `0-3` make an index to a fixed "noise periods" table, which is:

```javascript
[2, 4, 8, 16, 32, 48, 64, 80, 101, 127, 190, 254, 381, 508, 1017, 2034]
```

- If the **period index** is -for example- `3`, the **noise period** will be `16`. This means the shift register will be clocked once every `16` APU cycles (`step()` calls).

- When the 15-bit shift register is clocked, the following actions occur in order:

  - a `feedback` bit is calculated:
    - if the mode flag is set => `bit 0 ^ bit 6`
    - if the mode flag is clear => `bit 0 ^ bit 1`
  - the shift register is **shifted right** by one bit (`>> 1`)
  - bit `14`, the leftmost bit, is replaced with the `feedback` bit calculated earlier

<div style="text-align: center">
  <img alt="noise" src="assets/bitshifts/noise.gif" width="134" height="115" />
  <pre>Example with mode flag ON</pre>
</div>

- The channel's output sample is the **envelope volume**, or `0` if either:
  - bit `0` of the shift register is set
  - the length counter is `0`
