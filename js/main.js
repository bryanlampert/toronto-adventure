const game = new Phaser.Game(960, 600, Phaser.AUTO, 'game');
let toggleHud;
let playerBlob;

function Blob(game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'blob');
  this.anchor.set(0.5, 0.5);
  this.game.physics.arcade.enable(this);
  this.body.collideWorldBounds = true;
  this.animations.add('stop', [0]);
  this.animations.add('run', [1, 2], 8, true); // 8fps looped
  this.animations.add('jump', [3]);
  this.animations.add('fall', [4]);
  playerBlob = this;
}

Blob.prototype = Object.create(Phaser.Sprite.prototype);
Blob.prototype.constructor = Blob;
Blob.prototype.move = function (direction) {
  const SPEED = 200;
  this.body.velocity.x = direction * SPEED;
    if (this.body.velocity.x < 0) {
    this.scale.x = -1;
  }
  else if (this.body.velocity.x > 0) {
    this.scale.x = 1;
  }
};

Blob.prototype.jump = function () {
  const JUMP_SPEED = 645;

  let canJump = this.body.touching.down;
  if (canJump) {
    this.body.velocity.y = -JUMP_SPEED;
  }
  return canJump;
};
Blob.prototype.bounce = function () {
    const BOUNCE_SPEED = 200;
    this.body.velocity.y = -BOUNCE_SPEED;
};
Blob.prototype._getAnimationName = function () {
    let name = 'stop'; // default animation

    // jumping
    if (this.body.velocity.y < 0) {
        name = 'jump';
    }
    // falling
    else if (this.body.velocity.y >= 0 && !this.body.touching.down) {
        name = 'fall';
    }
    else if (this.body.velocity.x !== 0 && this.body.touching.down) {
        name = 'run';
    }

    return name;
};
Blob.prototype.update = function () {
    // update sprite animation, if it needs changing
    let animationName = this._getAnimationName();
    if (this.animations.name !== animationName) {
        this.animations.play(animationName);
    }
};

function Raccoon(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'raccoon');

    // anchor
    this.anchor.set(0.5);
    // animation
    this.animations.add('crawl', [0, 1, 2], 8, true);
    this.animations.add('die', [3, 4, 3, 4, 3, 4, 3, 3, 3, 3, 3, 3], 12);
    this.animations.play('crawl');

    // physic properties
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
    this.body.velocity.x = Raccoon.SPEED;
}

Raccoon.SPEED = 100;

// inherit from Phaser.Sprite
Raccoon.prototype = Object.create(Phaser.Sprite.prototype);
Raccoon.prototype.constructor = Raccoon;
Raccoon.prototype.update = function () {
    // check against walls and reverse direction if necessary
    if (this.body.touching.right || this.body.blocked.right) {
        this.body.velocity.x = -Raccoon.SPEED; // turn left
        this.scale.x = -1;
    }
    else if (this.body.touching.left || this.body.blocked.left) {
        this.body.velocity.x = Raccoon.SPEED; // turn right
        this.scale.x = 1;
    }
};
Raccoon.prototype.die = function () {
    this.body.enable = false;

    this.animations.play('die').onComplete.addOnce(function () {
        this.kill();
    }, this);
};


PlayState = {};

PlayState.init = function () {
  this.game.renderer.renderSession.roundPixels = true;

  this.keys = this.game.input.keyboard.addKeys({
    left: Phaser.KeyCode.LEFT,
    right: Phaser.KeyCode.RIGHT,
    up: Phaser.KeyCode.UP,
    space: Phaser.KeyCode.SPACEBAR
  });

  this.keys.preventDefault = true;

  this.keys.up.onDown.add(function() {
    let didJump = this.blob.jump();
    if (didJump) {
      this.sfx.jump.play();
    }
  }, this);
  this.keys.space.onDown.add(function() {
    let didJump = this.blob.jump();
    if (didJump) {
      this.sfx.jump.play();
    }
  }, this);

  this.tokenPickupCount = 0;
  this.hasPresto = false;
};

PlayState.preload = function () {
  this.game.load.json('level:1', 'data/level01.json');

  this.game.load.image('background', 'images/background.jpg');
  this.game.load.image('ground', 'images/ground.png');
  this.game.load.image('concrete-platform', 'images/concrete-platform.png');
  this.game.load.image('concrete-platform2', 'images/concrete-platform2.png');
  this.game.load.image('concrete-platform4', 'images/concrete-platform4.png');
  this.game.load.image('concrete-platform6', 'images/concrete-platform6.png');
  this.game.load.image('concrete-platform8', 'images/concrete-platform8.png');
  this.game.load.image('girder-sm', 'images/girder-sm.png');
  this.game.load.image('girder-md', 'images/girder-md.png');
  this.game.load.image('girder-lg', 'images/girder-lg.png');
  this.game.load.image('moving-girder-sm', 'images/moving-girder-sm.png');
  this.game.load.image('invisible-wall', 'images/invisible_wall.png');
  this.game.load.image('invisible-floor', 'images/invisible_floor.png');
  this.game.load.image('icon:token', 'images/token_icon.png');
  this.game.load.image('font:numbers', 'images/numbers.png');
  this.game.load.image('presto', 'images/presto.png');
  this.game.load.image('skyscraper', 'images/skyscraper.png');

  this.game.load.spritesheet('blob', 'images/blob.png', 36, 42);
  this.game.load.spritesheet('token', 'images/token_animated.png', 22, 22);
  this.game.load.spritesheet('raccoon', 'images/raccoon.png', 42, 32);
  this.game.load.spritesheet('icon:presto', 'images/presto-hud.png', 45, 30);

  this.game.load.audio('sfx:jump', 'audio/jump.wav');
  this.game.load.audio('sfx:token', 'audio/token.wav');
  this.game.load.audio('sfx:stomp', 'audio/stomp.wav');
  this.game.load.audio('sfx:death', 'audio/death.mp3');
  this.game.load.audio('sfx:presto', 'audio/getPresto.wav');
};


PlayState.create = function () {
  this.game.add.tileSprite(0, 0, 900, 719, 'background');
  game.world.setBounds(0, -100, 5000, 700);
  this.sfx = {
    jump: this.game.add.audio('sfx:jump'),
    token: this.game.add.audio('sfx:token'),
    stomp: this.game.add.audio('sfx:stomp'),
    death: this.game.add.audio('sfx:death'),
    presto: this.game.add.audio('sfx:presto')
  };

  this.game.add.image(0, -150, 'background');
  this.game.stage.backgroundColor = "#01368c";
  this._loadLevel(this.game.cache.getJSON('level:1'));
  this._createHud();
  this.game.camera.follow(playerBlob)
  this.game.camera.deadzone = new Phaser.Rectangle(200, 0, 300, 100)
};

PlayState.update = function () {
  this._handleCollisions();
  this._handleInput();
  this.tokenFont.text = `x${this.tokenPickupCount}`;
  this.prestoIcon.frame = this.hasPresto ? 1 : 0;
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
  this.bgDecoration = this.game.add.group();
  this.platforms = this.game.add.group();
  this.tokens = this.game.add.group();
  this.raccoons = this.game.add.group();
  this.enemyWalls = this.game.add.group();
  this.invisibleFloor = this.game.add.group();

  this.movingPlatforms = this.add.physicsGroup();
  this.movingPlatforms.setAll('body.allowGravity', false);
  this.movingPlatforms.setAll('body.immovable', true);

  data.platforms.forEach(this._spawnPlatform, this);
  this._spawnCharacters({blob: data.blob, raccoons: data.raccoons});
  data.tokens.forEach(this._spawnToken, this);
  this._spawnPresto(data.presto.x, data.presto.y);
  this._spawnFloor(data.floor.x, data.floor.y);
  this._spawnMovingVert(data.movingPlatform.x, data.movingPlatform.y);
  //enable gravity
  const GRAVITY = 1200;
  this.game.physics.arcade.gravity.y = GRAVITY;
};

PlayState._spawnPlatform = function (platform) {
  let sprite = this.platforms.create(platform.x, platform.y, platform.image);
  this.game.physics.enable(sprite);
  sprite.body.allowGravity = false;
  sprite.body.immovable = true;
  this._spawnEnemyWall(platform.x, platform.y, 'left');
  this._spawnEnemyWall(platform.x + sprite.width, platform.y, 'right');
};

PlayState._spawnCharacters = function (data) {
    // spawn hero
  this.blob = new Blob(this.game, data.blob.x, data.blob.y);
  this.game.add.existing(this.blob);
    data.raccoons.forEach(function (raccoon) {
    let sprite = new Raccoon(this.game, raccoon.x, raccoon.y);
    this.raccoons.add(sprite);
  }, this);
};

PlayState._spawnToken = function (token) {
    let sprite = this.tokens.create(token.x, token.y, 'token');
    sprite.anchor.set(0.5, 0.5);
    sprite.animations.add('rotate', [0, 1, 2, 1], 6, true); // 6fps, looped
    sprite.animations.play('rotate');
    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;
};

PlayState._spawnPresto = function (x, y) {
    this.presto = this.bgDecoration.create(x, y, 'presto');
    this.presto.anchor.set(0.5, 0.5);
    this.game.physics.enable(this.presto);
    this.presto.body.allowGravity = false;
    this.presto.y -= 3;
    this.game.add.tween(this.presto)
        .to({y: this.presto.y + 6}, 800, Phaser.Easing.Sinusoidal.InOut)
        .yoyo(true)
        .loop()
        .start();
};

PlayState._spawnMovingVert = function (x, y) {
  this.platform = this.movingPlatforms.create(x, y, 'moving-girder-sm');
  this.platform.anchor.set(0.5, 0.5);
  this.game.physics.enable(this.platform);
  this.platform.y -= 50;
  this.game.add.tween(this.platform)
      .to({y: this.presto.y}, 800, Phaser.Easing.Sinusoidal.InOut)
      .yoyo(true)
      .loop()
      .start();
  this.game.physics.arcade.collide(this.blob, this.platform);
};

PlayState._spawnFloor = function(x, y) {
  this.floor = this.invisibleFloor.create(x, y, 'invisible-floor');
  this.floor.anchor.set(0.5, 0.5);
  this.game.physics.enable(this.floor);
  this.floor.body.allowGravity = false;
  this.floor.renderable = true;
};

PlayState._spawnEnemyWall = function (x, y, side) {
    let sprite = this.enemyWalls.create(x, y, 'invisible-wall');
    // anchor and y displacement
    sprite.anchor.set(side === 'left' ? 1 : 0, 1);

    // physic properties
    this.game.physics.enable(sprite);
    sprite.body.immovable = true;
    sprite.body.allowGravity = false;
    sprite.renderable = true;
};

PlayState._handleCollisions = function() {
  // console.log(this.platforms)
  this.game.physics.arcade.collide(this.raccoons, this.platforms);
  this.game.physics.arcade.collide(this.raccoons, this.enemyWalls);
  this.game.physics.arcade.collide(this.blob, this.platforms);
  this.game.physics.arcade.overlap(this.blob, this.tokens, this._onBlobVsToken,
    null, this);
  this.game.physics.arcade.overlap(this.blob, this.raccoons,
    this._onBlobVsEnemy, null, this);
  this.game.physics.arcade.overlap(this.blob, this.presto, this._onBlobVsPresto,
        null, this);
  this.game.physics.arcade.overlap(this.blob, this.floor, this._onBlobVsFall,
        null, this);
  this.game.physics.arcade.overlap(this.racoons, this.floor, this._onEnemyVsFall,
        null, this);
};

PlayState._onBlobVsToken = function (blob, token) {
  this.sfx.token.play();
  token.kill();
  this.tokenPickupCount++;
};

PlayState._onBlobVsEnemy = function (blob, enemy) {
  if (blob.body.velocity.y > 0) { // kill enemies when hero is falling
    blob.bounce();
    enemy.die();
    this.sfx.stomp.play();
  }
  else { //game over, restart
    this.sfx.death.play();
    this.game.state.restart();
  }
};

PlayState._onBlobVsFall = function (blob, floor) {
  this.sfx.death.play();
  this.game.state.restart();
}

PlayState._onEnemyVsFall = function (enemy, floor) {
  enemy.kill();
}

PlayState._onBlobVsPresto = function (blob, presto) {
    this.sfx.presto.play();
    presto.kill();
    this.hasPresto = true;
};

PlayState._createHud = function () {
  this.prestoIcon = this.game.make.image(0, 21, 'icon:presto');
  this.prestoIcon.anchor.set(0, 0.5);
  const NUMBERS_STR = '0123456789X ';
  this.tokenFont = this.game.add.retroFont('font:numbers', 20, 26,
    NUMBERS_STR, 6);
  let tokenIcon = this.game.make.image(this.prestoIcon.width + 7, 2, 'icon:token');
  let tokenScoreImg = this.game.make.image(tokenIcon.x + tokenIcon.width,
    tokenIcon.height / 2, this.tokenFont);
  tokenScoreImg.anchor.set(0, 0.5);


  this.hud = this.game.add.group();
  this.hud.add(tokenIcon);
  this.hud.position.set(10, 10);
  this.hud.add(tokenScoreImg);
  this.hud.add(this.prestoIcon);
  // this.prestoIcon.fixedToCamera = true;
  this.hud.fixedToCamera = true;

};

window.onload = function () {
 // let game = new Phaser.Game(960, 600, Phaser.AUTO, 'game');
  game.state.add('play', PlayState);
  game.state.start('play');
};

