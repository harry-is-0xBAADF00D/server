/**
 * Stores information about an Ngram in the tree.
 */
function NgramContext() {
  this.before = {};
  this.after = {};
  this.starting = false;
  this.ending = false;
}

/**
 * Get tokens that are known to come before the token.
 *
 * Result is returned as a token->quantity dictionary, where quantity is the
 * number of times the token has been known to come before.
 */
NgramContext.prototype.getTokensBefore = function () {
  return this.before;
}

/**
 * Get tokens that are known to come after the token.
 *
 * Result is returned as a token->quantity dictionary, where quantity is the
 * number of times the token has been known to come after.
 */
NgramContext.prototype.getTokensAfter = function () {
  return this.after;
}

/**
 * Whether the ngram can start a string of tokens.
 */
NgramContext.prototype.canStart = function () {
  return this.starting;
}

/**
 * Whether the ngram can end a string of tokens.
 */
NgramContext.prototype.canEnd = function () {
  return this.ending;
}

/**
 * Store an instance in which a token has come before the ngram.
 */
NgramContext.prototype.addTokenBefore = function (token) {
  if (!(token in this.before)) {
    this.before[token] = 0;
  }
  this.before[token] += 1;
}

/**
 * Store an instance in which a token has come after the ngram.
 */
NgramContext.prototype.addTokenAfter = function (token) {
  if (!(token in this.after)) {
    this.after[token] = 0;
  }
  this.after[token] += 1;
}

/**
 * Store that the ngram once started a sequence of tokens.
 */
NgramContext.prototype.permitStarting = function () {
  this.starting = true;
}

/**
 * Store that the ngram once ended a sequence of tokens.
 */
NgramContext.prototype.permitEnding = function () {
  this.ending = true;
}


/**
 * A model that stores possible token orders as Markov order ngrams that have
 * tokens that can come before and after.
 *
 * Optionally, once can provide the Markov order to use; 4 is typically good for
 * natural language generation.
 */
function Model(options) {
  this.options = options || {};
  this.options.order = options.order || 4;

  this.ngrams = {};
}

/**
 * Learn orderings from a sequence of tokens.
 */
Model.prototype.learn = function (tokens) {
  if (tokens.length < this.options.order) {
    return;
  }

  for (var ngramStart = 0; ngramStart <= tokens.length - this.options.order; ngramStart++) {
    var ngram = tokens.slice(ngramStart, ngramStart + this.options.order);
    var context = this._getNgramContext(ngram);

    // starting
    if (ngramStart === 0) {
      context.permitStarting();
    } else {
      context.addTokenBefore(tokens[ngramStart - 1]);
    }

    // ending
    if (ngramStart === tokens.length - this.options.order) {
      context.permitEnding();
    } else {
      context.addTokenAfter(tokens[ngramStart + this.options.order]);
    }
  }
}

/**
 * Generate a plausible sequence of tokens from our model.
 */
Model.prototype.generate = function () {
  var allNgrams = this._getAllNgrams();

  if (allNgrams.length === 0) {
    throw Error('Model untrained');
  }

  var middleNgram = randomChoice(allNgrams);
  var tokens = middleNgram.slice(); // clone()-ish

  var currentNgram = middleNgram;
  var currentNgramContext = this._getNgramContext(currentNgram);
  while (!currentNgramContext.canStart()) {
    var beforeQuantities = currentNgramContext.getTokensBefore();
    var tokensBefore = flattenQuantities(beforeQuantities);
    var tokenBefore = randomChoice(tokensBefore); // TODO: rank in some way
    currentNgram = [ tokenBefore ].concat(currentNgram.slice(0, currentNgram.length - 1));
    currentNgramContext = this._getNgramContext(currentNgram);
    tokens.unshift(tokenBefore); // add at index 0
  }

  var currentNgram = middleNgram;
  var currentNgramContext = this._getNgramContext(currentNgram);
  while (!currentNgramContext.canEnd()) {
    var afterQuantities = currentNgramContext.getTokensAfter();
    var tokensAfter = flattenQuantities(afterQuantities);
    var tokenAfter = randomChoice(tokensAfter);
    currentNgram = currentNgram.slice(1).concat([ tokenAfter ]);
    currentNgramContext = this._getNgramContext(currentNgram);
    tokens.push(tokenAfter); // add at end of list
  }

  return tokens;
}

/**
 * Follows the internal tree to get known information about an ngram.
 */
Model.prototype._getNgramContext = function (ngram) {
  var ngramLevel = this.ngrams;
  for (var tokenIndex = 0; tokenIndex < ngram.length - 1; tokenIndex++) {
    var token = ngram[tokenIndex];
    if (!(token in ngramLevel)) {
      ngramLevel[token] = {};
    }
    ngramLevel = ngramLevel[token];
  }

  var lastToken = ngram[ngram.length - 1];
  if (!(lastToken in ngramLevel)) {
    ngramLevel[lastToken] = new NgramContext();
  }
  return ngramLevel[lastToken];
}

/**
 * Walk the tree to recover all ngrams.
 */
Model.prototype._getAllNgrams = function (_level, _depth) {
  if (_level === undefined) {
    _level = this.ngrams;
    _depth = this.options.order;
  }

  var tokens = Object.keys(_level);

  if (_depth === 1) {
    var inArray = [];
    for (var tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
      var token = tokens[tokenIndex];
      inArray.push([ token ]);
    }
    return tokens;
  }

  var allNgrams = [];
  for (var tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
    var tokenBefore = [ tokens[tokenIndex] ];
    var finishingParts = this._getAllNgrams(_level[tokenBefore], _depth - 1);
    for (var finPartIndex = 0; finPartIndex < finishingParts.length; finPartIndex++) {
      var finishingPart = finishingParts[finPartIndex];
      allNgrams.push(tokenBefore.concat(finishingPart));
    }
  }

  return allNgrams;
}

/**
 * Convert a dictionary of value->quantity into a flat list of all the values.
 */
function flattenQuantities(quantities) {
  var flattened = [];
  var values = Object.keys(quantities);
  for (var valueIndex = 0; valueIndex < values.length; valueIndex++) {
    var value = values[valueIndex];
    var quantity = quantities[value];
    for (var i = 0; i < quantity; i++) {
      flattened.push(value);
    }
  }
  return flattened;
}

/**
 * Pick a random element from an array because the usual method in JavaScript
 * isn't exactly verbose about its functionality until you look closely.
 */
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// export model
exports.Model = Model;
