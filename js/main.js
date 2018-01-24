function Blob(game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'blob');
  this.anchor.set(0.5, 0.5);
  this.game.physics.enable(this);
  this.body.collideWorldBounds = true;
}

Blob.prototype = Object.create(Phaser.Sprite.prototype);
Blob.prototype.constructor = Blob;
Blob.prototype.move = function (direction) {
    const SPEED = 200;
    this.body.velocity.x = direction * SPEED;
};

PlayState = {};

PlayState.init = function () {
  this.game.renderer.renderSession.roundPixels = true;
  this.keys = this.game.input.keyboard.addKeys({
    left: Phaser.KeyCode.LEFT,
    right: Phaser.KeyCode.RIGHT
  });
};

PlayState.preload = function () {
  this.game.load.json('level:1', 'data/level01.json');

  this.game.load.image('background', 'images/background.png');
  this.game.load.image('ground', 'images/ground.png');
  this.game.load.image('concrete-platform', 'images/concrete-platform.png');
  this.game.load.image('blob', 'images/blob.png');
};

PlayState.create = function () {
  this.game.add.image(0, -150, 'background');
  this._loadLevel(this.game.cache.getJSON('level:1'));
};

PlayState.update = function () {
  this._handleCollisions();
  this._handleInput();
};

PlayState._handleInput = function () {
  if (this.keys.left.isDown) { // move hero left
    this.blob.move(-1);
  }
  else if (this.keys.right.isDown) { // move hero right
    this.blob.move(1);
  }
  else {
    this.blob.move(0);
  }
};

PlayState._loadLevel = function (data) {
  this.platforms = this.game.add.group();

  data.platforms.forEach(this._spawnPlatform, this);
  this._spawnCharacters({blob: data.blob});

  //enable gravity
  const GRAVITY = 1200;
  this.game.physics.arcade.gravity.y = GRAVITY;
};

PlayState._spawnPlatform = function (platform) {
  let sprite = this.platforms.create(platform.x, platform.y, platform.image);
  this.game.physics.enable(sprite);
  sprite.body.allowGravity = false;
  sprite.body.immovable = true;
};

PlayState._spawnCharacters = function (data) {
    // spawn hero
    this.blob = new Blob(this.game, data.blob.x, data.blob.y);
    this.game.add.existing(this.blob);
};

PlayState._handleCollisions = function() {
  this.game.physics.arcade.collide(this.blob, this.platforms);
}

window.onload = function () {
  let game = new Phaser.Game(960, 600, Phaser.AUTO, 'game');
  game.state.add('play', PlayState);
  game.state.start('play');
};

