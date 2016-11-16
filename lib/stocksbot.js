'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var Bot = require('slackbots');
var request = require('request');
var _ = require('underscore');

/**
 * Constructor function. It accepts a settings object which should contain the following keys:
 *      token : the API token of the bot (mandatory)
 *      name : the name of the bot (will default to "StocksBot")
 *
 * @param {object} settings
 * @constructor
 *
 * @author Luciano Mammino <lucianomammino@gmail.com>
 */
var StocksBot = function Constructor(settings) {
    this.settings = settings;
    this.settings.name = 'stocks';
    this.user = null;
};

// inherits methods and properties from the Bot constructor
util.inherits(StocksBot, Bot);

/**
 * Run the bot
 * @public
 */
StocksBot.prototype.run = function () {
    StocksBot.super_.call(this, this.settings);

    this.on('start', this._onStart);
    this.on('message', this._onMessage);
};

/**
 * On Start callback, called when the bot connects to the Slack server and access the channel
 * @private
 */
StocksBot.prototype._onStart = function () {
    this._loadBotUser();
};

/**
 * On message callback, called when a message (of any type) is detected with the real time messaging API
 * @param {object} message
 * @private
 */
StocksBot.prototype._onMessage = function (message) {
    if (this._isChatMessage(message) &&
        this._isChannelConversation(message) &&
        !this._isFromStocksBot(message) &&
        this._isMentioningStocks(message)
    ) {
        this._replyWithRandomJoke(message);
    }
};

/**
 * Replyes to a message with a random Joke
 * @param {object} originalMessage
 * @private
 */
StocksBot.prototype._replyWithRandomJoke = function (originalMessage) {
    var self = this;
    var message = originalMessage.text;
    var channel = self._getChannelById(originalMessage.channel);
    var symbols = message.match(/\$([a-zA-Z]{1,5})/g);
    if(symbols) {
      _.each(symbols, function(symbol){
        var symbolRegexp = /\$([a-zA-Z]{1,5})/;
        var symbol = symbolRegexp.exec(symbol);
        var stock = self._getStockPrice(symbol[1].toUpperCase(), channel);
      });
    }
};

StocksBot.prototype._getStockPrice = function (symbol, channel) {
  var self = this;
  var url = 'http://finance.yahoo.com/d/quotes.csv?s=' + symbol + '&f=ncl1'
  request(url, function(err, res, body){
    if(err) {
      return null;
    } else {
      var symbolRegexp = /\"([\w \,\.]*)\",\"([0-9\+\-\. \%]*)\"\,([\d\.]*)/;
      var shareData = symbolRegexp.exec(body);
      if(!shareData) {
        return null;
      }
      var company = shareData[1];
      var change = shareData[2].replace(/^\+/, "+$").replace(/^\-/, "-$").replace(" - ", " / ");
      var current = shareData[3];
      var color = change.match(/\+/) ? "#3d9400" : "#dd4b39";
      var stock = { company:company, change:change, current:current, color:color };
      var text = "$" + stock.current + " (" + stock.change + ")";
      var message = { attachments: JSON.stringify([{ fallback: company + " - " + text, color: stock.color, title:"<https://finance.yahoo.com/quote/" + symbol + "|" + stock.company + " (" + symbol + ")>", text: text, mrkdwn: true }]) }
      self.postMessageToChannel(channel.name, "", message);
    }
  });
}
/**
 * Loads the user object representing the bot
 * @private
 */
StocksBot.prototype._loadBotUser = function () {
    var self = this;
    this.user = this.users.filter(function (user) {
      self.user = user;
      return user.name === 'stocks';
    })[0];
};

/**
 * Sends a welcome message in the channel
 * @private
 */
StocksBot.prototype._welcomeMessage = function () {
  this.postMessageToChannel(this.channels[0].name, 'Check a stock price with $[symbol]', {as_user: true});
};

/**
 * Util function to check if a given real time message object represents a chat message
 * @param {object} message
 * @returns {boolean}
 * @private
 */
StocksBot.prototype._isChatMessage = function (message) {
  return message.type === 'message' && Boolean(message.text);
};

/**
 * Util function to check if a given real time message object is directed to a channel
 * @param {object} message
 * @returns {boolean}
 * @private
 */
StocksBot.prototype._isChannelConversation = function (message) {
  return typeof message.channel === 'string' && message.channel[0] === 'C';
};

/**
 * Util function to check if a given real time message is mentioning a stock $[symbol]
 * @param {object} message
 * @returns {boolean}
 * @private
 */
StocksBot.prototype._isMentioningStocks = function (message) {
  return message.text.match(/\$[a-zA-Z]{1,5}/gi);
};

/**
 * Util function to check if a given real time message has ben sent by the StocksBot
 * @param {object} message
 * @returns {boolean}
 * @private
 */
StocksBot.prototype._isFromStocksBot = function (message) {
  return message.user === this.user.id;
};

/**
 * Util function to get the name of a channel given its id
 * @param {string} channelId
 * @returns {Object}
 * @private
 */
StocksBot.prototype._getChannelById = function (channelId) {
  return this.channels.filter(function (item) {
    return item.id === channelId;
  })[0];
};

module.exports = StocksBot;
