# Shicka

Bot for the official *Super Bear Adventure* *Discord* server

## Dependencies

The bot uses *Discord.js 12* and requires *Node.js 12.17.0* or more

## Configuring the bot

```shell
$ export SHICKA_DISCORD_TOKEN=<your-token-here>
$ export SHICKA_PREFIX="?"
```

## Starting the bot

```shell
$ node shicka.js
```

## Features

### Commands

- `?about` gives the link to this repository

- `?count` gives the number of members of the guild

- `?help` gives the list of features of this bot

- `?speedrun` gives the link to the game on `speedrun.com`

- `?tracker` gives the link to the issue tracker of the game

- `?trailer` gives the link to the trailer of the game

- `?update` checks the latest release of the game on `play.google.com`

### Feeds

- The latest world records of the game on `speedrun.com` are regularly published in the dedicated channel

### Triggers

- Some words that violate the rule 7 will be flagged as such
