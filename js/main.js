PlayState = {};

PlayState.preload = function () {
  this.game.load.json('level:1', 'data/level01.json');

  this.game.load.image('background', 'images/background.png');
  this.game.load.image('ground', 'images/ground.png');
};

PlayState.create = function () {
  this.game.add.image(0, -150, 'background');
  this._loadLevel(this.game.cache.getJSON('level:1'));
};

PlayState._loadLevel = function (data) {
  data.platforms.forEach(this._spawnPlatform, this);
};

PlayState._spawnPlatform = function (platform) {
  this.game.add.sprite(platform.x, platform.y, platform.image);
};

window.onload = function () {
  let game = new Phaser.Game(960, 600, Phaser.AUTO, 'game');
  game.state.add('play', PlayState);
  game.state.start('play');
};

