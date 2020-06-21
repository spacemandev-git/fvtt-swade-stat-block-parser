Need to prefix statblock special abilities section with '@' for it to read them. If you do not use @ nothing bad will happen, it just won't know what the special abilities are and will ignore them.

It does NOT search through your items, only through compendiums, so it might end up creating multiple copies of an item if you never add the new item to your compendium.

Until swade-system incorporates display for toughness:armor:mod, it is HIGHLY reccomended to use swade-autocalc module else, you will think that the toughness this spits out is less than the inputted toughness. THIS IS INTENTIONAL, it will subtract ARMOR from the TOUGHNESS value so Toughness: 14 (4) becomes Toughess: 10, Armor: 4 which is as it should be

Because of the localization, if you try to import English statblocks while you have a Spanish setting activated, then it will fail. Same with Spanish in English settings.

Future Features:

1.1.0 Release:

- Exclude Compendiums (DONE)
- Create Compendiums for Imported Items (DONE)
- Gear Parsing for Weapons/Shields/Armor
- T (A) rather than T + A read out (DONE)
- Auto equip items on import

Future:
- Allow parsing of any suported language while in any langauge setting
- Add IMG path to text file parsing
- Parse Size from special abilities
- T(A) vs T+A option
- Bulk Import
- Option to add Special Abilities as Edges

Adminstrative todos;

- Make a video of how to use this
