var Model = require('./markov').Model;

function LyricsModel(options) {
  this.options = options || {};
  this.options.order = this.options.order || 4;

  this.model = new Model(this.options);
}

LyricsModel.prototype.learn = function (line) {
  // extract tokens
  var tokens = [];
  var buffer = [];
  var wasAlphanumeric = null;

  for (var chrIndex = 0; chrIndex < line.length; chrIndex++) {
    var chr = line[chrIndex];
    var alphanumeric = (chr.match(/^[0-9a-zA-Z]+$/) !== null);
    if (buffer.length === 0) {
      buffer = [ chr ];
      wasAlphanumeric = alphanumeric;
    } else if (alphanumeric !== wasAlphanumeric) {
      tokens.push(buffer.join(''));
      buffer = [ chr ];
      wasAlphanumeric = alphanumeric;
    } else {
      buffer.push(chr);
    }
  }

  if (buffer.length > 0) {
    tokens.push(buffer.join(''));
  }

  if (tokens.length < this.options.order) {
    // too short, nothing we can learn here
    return;
  }

  this.model.learn(tokens);
}

LyricsModel.prototype.generate = function (line) {
  return this.model.generate().join('');
}

exports.LyricsModel = LyricsModel;
