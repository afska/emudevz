# Translation guide

If you want to add support for other languages, you should do the following (example: Japanese - `ja`):

- Create a locale file in `src/data/locales/ja.js` with all the UI translations.
  - Add a `language_ja` key to all the language files to localize the language name.
  - Keys ending with `_before` and `_after` will have some text in between: for example, `performance_tips_remove_logs_before`/`performance_tips_remove_logs_after` will be rendered as: `${before} console.log ${after}`, finally showing `Remove any console.log(...) calls`.
- Update `src/data/dictionaryEntries.js` to include translations for `ja`.
  - Entry names are pipe-separated.
  - A `_` prefix means "hidden alias" (it matches in the same way, but doesn't appear in the entry's "also known as" subtitle).
  - The `also` key **overrides** the name list for a specific language. That means, if you want some English words to still match, you need to add them manually.
- Add a `ja.yml` to each level in `src/data/levels` for the chat script.
  - See `docs/chat_syntax.md` for some additional considerations about the chat format.
  - Use the same emojis as the English version.
  - To test your changes, you need to **rebuild the levels** with `npm run package`.
  - Remember that emojis need an extra space to render correctly!
  - Ensure the JS scripts are the same (besides small details like linking to `.ja.md` files instead of `.en.md`) and the final translated file ends up with the same number of lines as the English version.
  - Also, ensure the JS code snippets shown to the user are the same, but comments should be translated.
  - System messages starting with `<! ` should also be translated.
  - For addresses where the address space is explicit (e.g. `$PPU $3F00`), keep the dollar sign before `PPU`, since this allows rendering the `$PPU` as a dictionary link, which links to the `PPU address` entry.
  - The final credits shouldn't be localized.
- Change the `meta.json` file in each level to localize the `name` key.
  - Use the same emojis as the English version.
- Change the `chapter.json` file in each chapter to localize the `name` and `description` keys.
- Add localized documentation files (look for `*.en.md` files and create equivalent `*.ja.md` files).
  - Don't localize files that simply end with `*.md` (without a language suffix), as these typically just contain an image and it's fine to have just one version for all languages.
- Localize all unit tests in `src/data/levels/$tests` and the `test.js` files.
  - Tests with the same English name must use the same translation.
- Create a file in `src/data/levels/02_Assembly/$help/ja.txt` with help for the Assembly chapter.
  - Each line should correspond to the same line in the other languages.
  - Add `$help/ja.txt` to `scripts/package-levels.js`.
- In `The golden log` level, the `golden` key references a UI label (`Search files...`), make sure its text matches the translated label.

## Notes

- Please run regular consistency checks with `node scripts/check-localization.js ja`.

- After the game introduces a concept (e.g. "Backgrounds" or "Sprites"), it tries to use that same word consistently so the dictionary can recognize those words, highlight them, and link them to their definitions. If your language has two different ways of saying a technical word, please pick one and use it consistently.

- Don't translate names like "EmuDevz", "BrokenNEEES", or "Supporter Pack".

- Some languages might require some rework in the game. RTL languages might be too difficult to support.

- The _ImGui_ parts of the game (Debugger, AudioTester) don't support localization.

## Style

### Tone

The tone should be casual/informal. Definitely not like a boss, since there's no hierarchy or sense of authority. Like a friend I guess, or more like an online friend since these people don't know each other in real life. They are like two people in an IRC channel talking about a common interest. One is doing the investigation / reverse engineering and the other one (the player) doing the coding part.

Communication is friendly. There are some jokes in the game but they are clearly marked as jokes due to the emoji overuse, which is kind of part of the style xD.

### Gender

Something I tried when writing the Spanish localization was to avoid using gendered words at all. In English, 'are you ready?' is fine, but in Spanish I'd have to write '¿estás listo?' (masculine) or '¿estás lista?' (feminine), so in those cases I rephrased the whole thing to something like "¿comenzamos?" (shall we begin?). Similarly, the NPC avoids revealing their gender during the whole game.

For technical terms with grammatical gender (`NEEES`, `CPU`, `PPU`, `APU`, `background`, `sprites`, `name table`, `samples`, etc), be consistent with their gender (for example, in Spanish, don't mix `la CPU` and `el CPU`).

## Test your translation

The fastest way to test your translation would be to import a finished save file to localhost and set the advanced setting `"instant": true` to remove any typewriter effects.

## Upload your translation

You can pack your translation and upload it to our [community](https://discord.gg/mFGDxSxEJu)'s `#translations` channel!

To do it, run the following script:

```bash
node scripts/generate-lang-pack.js --code ja --name Japanese --version 1
# this will generate a file named `ja.emudevz-lang`
```

Before uploading, please ensure your translation pack works in the [base game](https://afska.github.io/emudevz) by loading the file in the Settings menu.

⚠️ Keep in mind that the only official languages EmuDevz will support are _English_ and _Spanish_, since I cannot read other languages and therefore I cannot review or maintain them!
