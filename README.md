[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/K3K11VCDK)

Need to prefix statblock special abilities section with '@' for it to read them. If you do not use @ nothing bad will happen, it just won't know what the special abilities are and will ignore them.

If you make it an @- it will be added as a hindrance, @+ will be added as an edge and just @ will be added to description. 

It does NOT search through your items, only through compendiums, so it might end up creating multiple copies of an item if you never add the new item to your compendium.

Because of the localization, if you try to import English statblocks while you have a Spanish setting activated, then it will fail. Same with Spanish in English settings.

Future Features:

1.2.9:
- @- and @+ looks in compendiums but doesn't write to compendiums

1.2.8:
- @- and @+ don't look in compendiums or add to compendiums, they are purely new items every time

1.2.7:
- T(A) to just Toughness
- @- and @+ to do edges/hindrances
- 

1.2.0 Release:
- Gear Parsing for Weapons/Shields/Armor (DONE)

1.1.0 Release:

- Exclude Compendiums (DONE)
- Create Compendiums for Imported Items (DONE)
- T (A) rather than T + A read out (DONE)

Future:
- Auto equip items on import (DONE)
- Allow parsing of any suported language while in any langauge setting
- Add IMG path to text file parsing
- Parse Size from special abilities
- Bulk Import
- Option to add Special Abilities as Edges
- Theme based paring for vareity of books
- Replace hardcoding Str => @str replacement in damage parser with dynamic one that pulls from localization
- Parse armor that has only one value in it : ArmorName (+2)

Adminstrative todos;

- Make a video of how to use this
