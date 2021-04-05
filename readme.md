# Shicka

Bot for the official *Super Bear Adventure* *Discord* server

## Dependencies

The bot uses *Discord.js 12* and requires *Node.js 15.0.0* or more

## Configuring the bot

```shell
$ export SHICKA_DISCORD_TOKEN=<your-token-here>
$ export SHICKA_PREFIX="?"
$ export SHICKA_SALT="0"
```

## Starting the bot

```shell
$ node shicka.js
```

## Features

### Commands

- `?about` gives the link to this repository on `github.com`

- `?chat <channel> <text>` writes the given text and uploads the given attachments in the given channel (only available in the `#📰logs` and `#🛡moderators-room` channels)

- `?count` gives the number of members of the guild

- `?emoji <base> <style>` draws the given base emoji with the given style (only available in the `#📰logs`, `#🛡moderators-room`, and `#🍪cookie-room` channels)

- `?help` gives the list of features of this bot

- `?mission` gives the schedule of the next three missions

- `?mission <mission>` gives the schedule of at least the next two occurences of the given mission

- `?raw <type> <identifier>` gives the datum of the given type with the given identifier (only available in the `#📰logs` and `#🛡moderators-room` channels)

- `?roadmap` gives the link to the todo list of the game on `trello.com`

- `?shop` gives the schedule of the next six sets of items in the shop

- `?shop <item>` gives the schedule of at least the next two occurrences of the given item in the shop

- `?speedrun` gives the link to the game on `speedrun.com`

- `?tracker` gives the link to the issue tracker of the game on `trello.com`

- `?trailer` gives the link to the trailer of the game on `youtube.com`

- `?update` checks the latest release of the game on `play.google.com` and `itunes.apple.com`

### Feeds

- The latest world records of the game on `speedrun.com` are regularly published in the dedicated channel

### Triggers

- Some suggestions that violate the rule 7 will be flagged as such in the dedicated channel
