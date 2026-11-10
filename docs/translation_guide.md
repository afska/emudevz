# Translation guide

If you want to add support for other languages, you should change these files (example: Japanese - `ja`):

- Create a locale file in `src/data/locales/ja.js` with all the UI translations.
  - You can run `node scripts/sort-locales.js` to sort keys alphabetically.
  - Add a `language_ja` key to all the language files to localize the language name.
  - Don't translate keys starting with `zoom_`.
  - Keys ending with `_before` and `_after` will have some text in between: for example, `performance_tips_remove_logs_before`/`performance_tips_remove_logs_after` will be rendered as: `${before} console.log ${after}`, finally showing `Remove any console.log(...) calls`.
- Change `src/locales.js` so it includes the new `ja` key and the correct `TimeAgo` instance.
- Update `src/data/dictionaryEntries.js` to include translations for `ja`.
  - You can run `node scripts/sort-dictionary.js` to sort keys alphabetically.
- Add a `ja.yml` to each level in `src/data/levels` for the chat script.
  - See `docs/chat_syntax.md` for some other considerations about the chat format.
  - Use the same emojis as the English version.
  - Ensure the JS scripts are the same (besides small details like linking to `.ja.md` files instead of `.en.md`) and the final translated file ends up with the same number of lines as the English version.
  - Also, ensure the JS code snippets shown to the user are the same, but comments should be translated.
  - System messages starting with `<! ` should also be translated.
  - For addresses where the address space is explicit (e.g. `$PPU $3F00`), keep the dollar sign before `PPU`, since this allows rendering the `$PPU` as a dictionary link, which links to the `PPU address` entry.
  - The final credits shouldn't be localized.
- Change the `meta.json` file in each level to localize the `name` and the console `subtitle` keys.
  - In the `FAQ` level, also update the `links` key.
- Change the `chapter.json` file in each chapter to localize the `name` and `description` keys.
- Add localized documentation files (look for `*.en.md` files and create equivalent `*.ja.md` files) and update the `copy.js` scripts to copy them.
  - Don't localize files that simply end with `*.md` (without a language suffix), as these typically just contain an image and it's fine to have just one version for all languages.
- Localize all unit tests in `src/data/levels/$tests` and the `test.js` files.
- Create a file in `src/data/levels/02_Assembly/$help/ja.txt` with help for the Assembly chapter.
  - Each line should correspond to the same line in the other languages.
  - Add `$help/ja.txt` to `scripts/package-levels.js`.
- In `The golden log` level, the `golden` key references a UI label (`Search files...`), make sure its text matches.
- Add your language to the language list in `README.md`.

## Notes

- Please run a basic consistency check with `node scripts/check-localization.js`.
  - Add your language at the top of the script!

- When adding the `ja:` key in an object, please do it alphabetically. For example:
```json
	"name": {
		"en": "🏁 Flags",
		"es": "🏁 Banderas",
		"ja": "🏁 フラッグ",
		"ru": "🏁 Флаги"
	}
```

- Some languages might require some rework in the game. RTL languages might be too difficult to support.

- The _ImGui_ parts of the game (Debugger, AudioTester) don't support localization.

## Style

### Tone

The tone should be casual/informal. Definitely not like a boss, since there's no hierarchy or sense of authority. Like a friend I guess, or more like an online friend since these people don't know each other in real life. They are like two people in an IRC channel talking about a common interest. One is doing the investigation / reverse engineering and the other one (the player) doing the coding part.

Communication is friendly. There are some jokes in the game but they are clearly marked as jokes due to the emoji overuse, which is kind of part of the style xD.

### Gender

Something I tried when writing the Spanish localization was to avoid using gendered words at all. In English, 'are you ready?' is fine, but in Spanish I'd have to write '¿estás listo?' (masculine) or '¿estás lista?' (feminine), so in those cases I rephrased the whole thing to something like "¿comenzamos?" (shall we begin?). Similarly, the NPC avoids revealing their gender during the whole game.

For technical gendered words (`NEEES`, `CPU`, `PPU`, `APU`, `background`, `sprites`, `name table`, `samples`, etc), be consistent with their gender (for example, in Spanish, don't mix `la CPU` and `el CPU`).

## Test your translation!

The fastest way to test your translation would be to import a finished save file to localhost and set the advanced setting `"instant": true` to remove any typewriter effects.
