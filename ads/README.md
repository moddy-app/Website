# Discord ad GIFs

One animated illustration per module, 550 × 300, in French and English, for
the ads posted as Discord messages (the ad's text goes in the message, not in
the picture). They are drawn with the website's own CSS (`global.css`,
`home-page.css`, Google Sans, Material Symbols, the Memoji avatars) in the
Moddy blue theme, dark mode.

| File | Module | What it shows |
|---|---|---|
| `automod-images.gif` | AutoMod AI | A hacked account posts a crypto scam, then an NSFW picture (a peach): without Moddy it stays, with Moddy it is removed at once |
| `automod-context.gif` | AutoMod AI | Same word in a joke and in a threat: a word filter blocks both, AutoMod AI only the threat |
| `automod-avatar.gif` | AutoMod AI | A member joins with an explicit profile picture (a banana), caught on arrival |
| `brocoli.gif` | Brocoli | The home page's conversation |
| `altguard.gif` | AltGuard | The home page's demo: a member passes, a second account is blocked |
| `bump-reminder.gif` | Bump Reminder | Moddy's reminders for DISBOARD, DiscordL and French.gg in one channel; each time someone bumps and the directory answers |
| `auto-restore-roles.gif` | Auto-Restore Roles | A member leaves, comes back, gets their roles again (except the excluded one) |
| `social-notifications.gif` | Social Notifications | Twitch, YouTube, Bluesky and RSS posts arriving in #announcements |
| `voice-transcription.gif` | Voice Transcription | A voice message turned into text with the Transcribe button |

The finished GIFs are in `gifs/fr/` and `gifs/en/`.

## Rendering them again

```sh
cd site && npm install --legacy-peer-deps && npm run build:prod   # the CSS, fonts and avatars
cd ../ads && npm install
node render.mjs                         # every ad, fr + en
node render.mjs bump-reminder --lang fr # one ad, one language
node render.mjs --theme light           # light mode, in gifs/<lang>/light/
node render.mjs --serve                 # preview: http://localhost:8100/ad.html?ad=altguard&lang=fr
```

- `ads.js`: the scenes (markup + timeline), one per ad.
- `ads.css`: only what `home-page.css` doesn't already draw.
- `i18n/fr.json`, `i18n/en.json`: every visible string.
- `emoji/`: Twemoji, Discord's emoji set (CC-BY 4.0, https://github.com/jdecked/twemoji),
  standing in for the explicit pictures.
- `bots/`: the directories' avatars (DISBOARD, DiscordL, French.gg), cropped round.
- `render.mjs`: serves the page, steps a virtual clock one frame at a time
  (25 fps) and turns the frames into a GIF with ffmpeg. The frames are exact
  whatever the machine's speed.
