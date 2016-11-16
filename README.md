# stocks[bot]
stocks[bot] is a Slack bot that listens for messages with $[symbol] and returns the current stock price and daily change, as retrieved from Yahoo Finance's API.

## Getting the API token for your Slack channel
To allow the stocks[bot] to connect your Slack channel you must provide him an API key. To retrieve it you need to add a new Bot in your Slack organization by visiting the following url: https://*yourorganization*.slack.com/services/new/bot. Ensure you are logged to your Slack organization in your browser and you have the admin rights to add a new bot.

You will find your API key under the field API Token, copy it in a safe place and get ready to use it.

## Configuration
Set the `BOT_API_KEY` environment variable with the API key

## Launching the bot
```bash
$ npm start
```
Don't forget to set your `BOT_API_KEY` environment variable before doing so.

## Attribution
[NorrisBot from Luciano Mammino](https://github.com/lmammino/norrisbot) // [© Luciano Mammino](NORRISBOT_LICENSE)
