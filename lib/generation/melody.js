var Model = require('./markov').Model;
var Note = require('../melody/melodies').Note;

function MelodyModel(options) {
  this.options = options || {};
  this.options.order = this.options.order || 4;

  this.pitchModel = new Model(this.options);
  this.durationModel = new Model(this.options);
}

MelodyModel.prototype.learn = function (melody) {
  var pitches = [];
  var durations = [];

  for (var noteIndex = 0; noteIndex < melody.length; noteIndex++) {
    var note = melody[noteIndex];
    pitches.push(note.getPitch());
    durations.push(note.getDuration());
  }

  this.pitchModel.learn(pitches);
  this.durationModel.learn(durations);
}

MelodyModel.prototype.generate = function () {
  var pitches = this.pitchModel.generate();
  var durations = this.durationModel.generate();

  while (pitches.length < durations.length) {
    pitches = pitches.concat(pitches);
  }

  while (durations.length < pitches.length) {
    durations = durations.concat(durations);
  }

  var notes = [];
  for (var i = 0; i < Math.min(pitches.length, durations.length); i++) {
    notes.push(new Note(pitches[i], durations[i]));
  }
  return notes;
}

exports.MelodyModel = MelodyModel;
