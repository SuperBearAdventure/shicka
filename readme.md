# *Shicka* <img width="100" height="100" alt="" src="doc/logotypes/shicka-200x200.png" align="right"/>

Bot for the official *Super Bear Adventure* *Discord* server

## Dependencies

The bot uses *Discord.js 14.13.0* and requires *TypeScript 5.1.6* or more and *Node.js 16.15.0* or more.

## Configuring the bot

```shell
$ export SHICKA_DISCORD_TOKEN=<your-discord-token-here>
$ export SHICKA_OUTFIT_GENERATOR_SALT=<your-outfit-generator-salt-here>
$ export SHICKA_ROADMAP_INTENT_CHANNEL=<your-roadmap-intent-channel-here>
$ export SHICKA_TRACKER_INTENT_CHANNEL=<your-tracker-intent-channel-here>
$ export SHICKA_RECORD_DEFAULT_CHANNEL=<your-record-default-channel-here>
$ export SHICKA_RULE7_DEFAULT_ALERT_ACTION_CHANNEL=<your-rule7-default-alert-action-channel-here>
$ export SHICKA_RULE7_DEFAULT_EXEMPT_CHANNELS=<your-rule7-default-exempt-channels-here>
$ export SHICKA_RULE7_DEFAULT_EXEMPT_ROLES=<your-rule7-default-exempt-roles-here>
$ export SHICKA_RULE7_REACTION_EMOJI=<your-rule7-reaction-emoji-here>
$ export SHICKA_RULE7_OVERRIDE_RULES_CHANNEL=<your-rule7-override-rules-channel-here>
$ export SHICKA_BYE_OVERRIDE_SYSTEM_CHANNEL=<your-bye-override-system-channel-here>
$ export SHICKA_HEY_OVERRIDE_SYSTEM_CHANNEL=<your-hey-override-system-channel-here>
```

## Linting the bot

```shell
$ npm run lint
```

## Building the bot

```shell
$ npm run build
```

## Starting the bot

```shell
$ npm start
```

## Features

### Commands

- `/about` gives the link to this repository on `github.com`

- `/bear <bear>` gives the gold time, the location, and the outfits of the given bear

- `/chat post <channel> <content>` sends the given content in the given channel (only available to administrator members by default)

- `/chat patch <channel> <message> <content>` edits the given message with the given content in the given channel (only available to administrator members by default)

- `/chat attach <channel> <message> <position> <attachment>` adds at the given position the given attachment to the given message in the given channel (only available to administrator members by default)

- `/chat detach <channel> <message> <position>` removes at the given position the attachment from the given message in the given channel (only available to administrator members by default)

- `/count` gives the number of members of the guild

- `/emoji <base> <style>{6}` draws the given base emoji with the given styles (only available to administrator members by default)

- `/help` gives the feature list of this bot

- `/leaderboard` gives the links to the speedrun leaderboards of the game on `www.speedrun.com`

- `/mission` gives the schedule of the next three missions in the shop

- `/mission <mission>` gives the schedule of at least the next two occurences of the given mission in the shop

- `/outfit` gives the schedule of the next six sets of outfits in the shop

- `/outfit <outfit>` gives the schedule of at least the next two occurrences of the given outfit in the shop

- `/raw <type> <identifier>` gives the datum of the given type with the given identifier

- `/roadmap` gives the link to the todo list of the game on `trello.com`

- `/soundtrack` gives the links to the music pieces of the game on `www.youtube.com`

- `/store` gives the links to the online stores of the game on `superbearadventure.myspreadshop.net` and `superbearadventure.myspreadshop.com`

- `/tracker` gives the links to the issue trackers of the game on `github.com` and `trello.com`

- `/trailer` gives the links to the trailers of the game on `www.youtube.com`

- `/update` gives the links to the latest updates of the game on `play.google.com` and `apps.apple.com`

### Hooks

- `record` posts the latest world records of the game on `www.speedrun.com` in the given channel (set to `$SHICKA_RECORD_DEFAULT_CHANNEL` by default)

### Rules

- `rule7` flags messages which violate the rule 7 as such in the given channel (set to `$SHICKA_RULE7_DEFAULT_ALERT_ACTION_CHANNEL` by default) except when posted in any of the given exempted channels (set to `$SHICKA_RULE7_DEFAULT_EXEMPT_CHANNELS` by default), when posted by non-administrator members having any of the given exempted roles (set to `$SHICKA_RULE7_DEFAULT_EXEMPT_ROLES` by default) or when posted by administrator members
