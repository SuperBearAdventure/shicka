# Shicka

Bot for the official *Super Bear Adventure* *Discord* server

## Dependencies

The bot uses *Discord.js 12* and requires *Node.js 12.17.0* or more

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

- `?about` gives the link to this repository

- `?chat <channel> <text>` writes the given text in the given channel (only available in the `#bot` and `#moderation` channels)

- `?count` gives the number of members of the guild

- `?help` gives the list of features of this bot

- `?mission` gives the schedule of the next three missions

- `?roadmap` gives the link to todo list of the game

- `?shop` gives the schedule of the next six sets of items in the shop (only available in the `#bot` and `#moderation` channels for now)

- `?speedrun` gives the link to the game on `speedrun.com`

- `?tracker` gives the link to the issue tracker of the game

- `?trailer` gives the link to the trailer of the game

- `?update` checks the latest release of the game on `play.google.com` and `itunes.apple.com`

### Feeds

- The latest world records of the game on `speedrun.com` are regularly published in the dedicated channel

### Triggers

- Some words that violate the rule 7 will be flagged as such
