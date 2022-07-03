# *Shicka* <img width="100" height="100" alt="" src="doc/logotypes/shicka-200x200.png" align="right"/>

Bot for the official *Super Bear Adventure* *Discord* server

## Dependencies

The bot uses *Discord.js 13.8.1* and requires *Node.js 16.15.0* or more

## Configuring the bot

```shell
$ export SHICKA_DISCORD_TOKEN=<your-discord-token-here>
$ export SHICKA_SALT=<your-salt-here>
```

## Starting the bot

```shell
$ node shicka.js
```

## Features

### Grants

- `/chat <channel> <content>` sends the given content and the given attachments in the given channel (only available in the `🔧・console`, `#🔎・logs`, and `#🛡・moderators-room` channels)

- `/chat <message> <channel> <content>` edits the given message with the given content and the given attachments in the given channel (only available in the `🔧・console`, `#🔎・logs`, and `#🛡・moderators-room` channels)

- `/emoji <base> <style>` draws the given base emoji with the given style (only available in the `🔧・console`, `#🔎・logs`, `#🛡・moderators-room`, and `#🍪・cookie-room` channels)

### Commands

- `/about` gives the link to this repository on `github.com`

- `/bear <bear>` gives the gold time, the location, and the outfits of the given bear

- `/count` gives the number of members of the guild

- `/help` gives the feature list of this bot

- `/leaderboard` gives the links to the speedrun leaderboards of the game on `www.speedrun.com`

- `/mission` gives the schedule of the next three missions in the shop

- `/mission <mission>` gives the schedule of at least the next two occurences of the given mission in the shop

- `/outfit` gives the schedule of the next six sets of outfits in the shop

- `/outfit <outfit>` gives the schedule of at least the next two occurrences of the given outfit in the shop

- `/raw <type> <identifier>` gives the datum of the given type with the given identifier

- `/roadmap` gives the link to the todo list of the game on `trello.com`

- `/store` gives the links to the online stores of the game on `shop.spreadshirt.net` and `shop.spreadshirt.com`

- `/tracker` gives the links to the issue trackers of the game on `github.com` and `trello.com`

- `/trailer` gives the links to the trailers of the game on `www.youtube.com`

- `/update` checks the latest releases of the game on `play.google.com` and `itunes.apple.com`

### Feeds

- The latest world records of the game on `www.speedrun.com` are regularly published in the `#🏅・records` channel

### Triggers

- Some suggestions that violate the rule 7 will be flagged as such in the `#💡・game-suggestions` channel
