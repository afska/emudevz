# Chat syntax

```yml
---
main:
  messages:
  - this is an example chat script
  - |-
    `main` is the initial state and `end` is the final state
  - words between <angular brackets> are highlighted
  - the same occurs with ~tildes~
  responses:
  - tell me more [more]
  - ok, enough [end]

more:
  run: |-
    // this runs when the `more` state is reached

    // configure level to win on `end`
    set((m) => m.chat.winOnEnd = true);

    // call methods on the {{Bottom}} layout directly
    {{Bottom}}.setSelectedCells([]);
  messages:
  - numbers like 23, or $FE29 are also highlighted
  - "**bold** and __italics__ are supported"
  - you can display code with `backticks`
  - and include javascript snippets, ```javascript console.log("hello world");```
  - <{compilation.png}>
  - ^^ this renders `media/compilation.png` as an image
  - <{smaller.png;8x8}>
  - ^^ this renders a smaller image
  - |-
    messages can have
    multiple lines!
  - |+
    this is the same,
    but with an extra newline at the end
  - emojis 🧠  need an extra <space> to display correctly
  - <! this is a system message
  - "{10}ah, and this message takes 1000ms to appear"
  responses:
  - (*) consumable question! [consumable]
  - what else can I do? [whatelse]

consumable:
  run-after-messages: |-
    // this runs after the messages are printed!
    set((m) => m.$condition = true);
  messages:
  - this question will not appear the next time the responses from `more` are included
  responses:
  - ...more

whatelse:
  messages:
  - you can include all the messages from `main` again!
  - ...main
  responses:
  - <m.$condition> this response only appears when `m.$condition` [end]
  - can I listen to events? [events]

events:
  messages:
  - yeah!
  - if the code uses `bus.emit("some_event")`
  - you can wait until it's triggered
  events:
  - some_event [triggered]

triggered:
  run-after-messages: |-
    $.goTo("main"); // goes back to `main`
    // to see what's available here, check out `codeEval.js`
  messages:
  - yeah!
  - now we've covered all the chat features
  responses: []
```
