const game = new Phaser.Game(960, 600, Phaser.AUTO, 'game');
let toggleHud;
let playerBlob;
let livesCount = 3;
let tokenPickupCount = 0;
let JUMP_SPEED = 645;
let text;
let SPEED = 200;

WebFontConfig = {
  active: function() {
    game.time.events.add(Phaser.Timer.SECOND, createText, this);
  },
  google: {
    families: ["Press Start 2P"]
  }
};

// Loads the webfont by adding dummy font first
function createText() {
  text = game.add.text(game.world.centerX, game.world.centerY, "loading font");
  text.destroy();
}

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
  this.body.velocity.x = direction * SPEED;
    if (this.body.velocity.x < 0) {
    this.scale.x = -1;
  }
  else if (this.body.velocity.x > 0) {
    this.scale.x = 1;
  }
};

Blob.prototype.jump = function () {
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
const LEVEL_COUNT = 3;

PlayState.init = function (data) {
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

  this.hasPresto = false;

  this.level = (data.level || 0) % LEVEL_COUNT;
};

PlayState.preload = function () {
  this.game.load.json('level:0', 'data/level00.json');
  this.game.load.json('level:1', 'data/level01.json');
  this.game.load.json('level:2', 'data/level02.json');

  this.game.load.image('progressBar', 'images/progress-bar.png');
  this.game.load.image('background-0', 'images/background.png');
  this.game.load.image('background-1', 'images/background2.png');
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
  this.game.load.image('skyscraper', 'images/skyscraper.png');
  this.game.load.image('tile-60', 'images/tile-60.png');
  this.game.load.image('tile-105', 'images/tile-105.png');
  this.game.load.image('tile-150', 'images/tile-150.png');
  this.game.load.image('invisible-wall', 'images/invisible_wall.png');
  this.game.load.image('invisible-floor', 'images/invisible_floor.png');
  this.game.load.image('font:numbers', 'images/numbers.png');
  this.game.load.image('presto', 'images/presto.png');
  this.game.load.image('icon:token', 'images/token_icon.png');
  this.game.load.image('icon:heart', 'images/heart.png');
  this.game.load.image('spring', 'images/spring.png');
  this.game.load.image('rental', 'images/rental.png');
  this.game.load.image('construction', 'images/construction.png', 300, 150);
  this.game.load.image('enter-transit', 'images/open-door.png');
  this.game.load.image('spike', 'images/spike.png');

  this.game.load.spritesheet('streetcar', 'images/streetcar.png', 250, 150);
  this.game.load.spritesheet('blob', 'images/blob.png', 36, 42);
  this.game.load.spritesheet('token', 'images/token_animated.png', 22, 22);
  this.game.load.spritesheet('heart', 'images/heart_animated.png', 22, 22);
  this.game.load.spritesheet('raccoon', 'images/raccoon.png', 42, 32);
  this.game.load.spritesheet('rail', 'images/third-rail-animated.png', 960, 30);
  this.game.load.spritesheet('icon:presto', 'images/presto-hud.png', 45, 30);

  this.game.load.audio('sfx:jump', 'audio/jump.wav');
  this.game.load.audio('sfx:token', 'audio/token.wav');
  this.game.load.audio('sfx:stomp', 'audio/stomp.wav');
  this.game.load.audio('sfx:death', 'audio/death.mp3');
  this.game.load.audio('sfx:presto', 'audio/getPresto.wav');
  this.game.load.audio('sfx:nextLevel', 'audio/nextLevel.wav');
  this.game.load.audio('sfx:heart', 'audio/heart.wav');
  this.game.load.audio('sfx:bonus', 'audio/bonus.wav');

  this.game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');

  this.stage.backgroundColor = '#000';
  this.progress = this.game.add.text(this.game.world.centerX, this.game.world.centerY - 30, 'Loading \n    00%', {fill: 'white'});
  this.progress.anchor.setTo(0.5, 0.5);
  // If we want to add a loading bar, add the below:
  // this._loadingBar = this.add.sprite(this.world.centerX - 288 / 2, this.world.centerY, "progressBar");
  // this._loadingBar.anchor.setTo(0, 0);
  // this.load.setPreloadSprite(this._loadingBar, 0);
  this.game.load.onFileComplete.add(this._fileComplete, this);
};

PlayState._fileComplete = function (progress, cacheKey, success, totalLoaded, totalFiles) {
  this.progress.text = "Loading \n   " + progress + "%";
};


PlayState.create = function () {
  game.world.setBounds(0, -100, 5000, 700);
  this.sfx = {
    jump: this.game.add.audio('sfx:jump'),
    token: this.game.add.audio('sfx:token'),
    stomp: this.game.add.audio('sfx:stomp'),
    death: this.game.add.audio('sfx:death'),
    presto: this.game.add.audio('sfx:presto'),
    nextLevel: this.game.add.audio('sfx:nextLevel'),
    heart: this.game.add.audio('sfx:heart'),
    bonus: this.game.add.audio('sfx:bonus')
  };
  if (this.level == 0) {
    this.game.add.image(0, -100, 'background-0');
  } else if (this.level == 1) {
    this.game.add.image(0, -100, 'background-1');
  }
  this.game.stage.backgroundColor = "#fff";
  this._loadLevel(this.game.cache.getJSON(`level:${this.level}`));
  this._createHud();
  this.game.camera.follow(playerBlob)
  this.game.camera.deadzone = new Phaser.Rectangle(200, 0, 300, 100)
  // livesCount = 3;

  this.progress.kill();
};

PlayState.update = function () {
  this._handleCollisions();
  this._handleInput();
  this.tokenFont.text = `x${tokenPickupCount}`;
  this.livesFont.text = `x${livesCount}`;
  this.prestoIcon.frame = this.hasPresto ? 1 : 0;
  if (this.hasPresto) {
    this.entrance.renderable = true;
  } else {
    this.entrance.renderable = false;
  }
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
  this.construction = this.game.add.group();
  this.invisibleFloor = this.game.add.group();
  this.hearts = this.game.add.group();
  this.springs = this.game.add.group();
  this.rental = this.game.add.group();
  this.spike = this.game.add.group();
  this.rails = this.game.add.group();

  this.movingPlatforms = this.add.physicsGroup();
  this.movingPlatforms.setAll('body.allowGravity', false);
  this.movingPlatforms.setAll('body.immovable', true);

  data.platforms.forEach(this._spawnPlatform, this);
  this._spawnCharacters({blob: data.blob, raccoons: data.raccoons});
  data.tokens.forEach(this._spawnToken, this);
  data.hearts.forEach(this._spawnHeart, this);
  data.springs.forEach(this._spawnSpring, this);
  data.rentals.forEach(this._spawnRental, this);
  data.spikes.forEach(this._spawnSpikes, this);
  data.rails.forEach(this._spawnRails, this);
  this._spawnPresto(data.presto.x, data.presto.y);
  this._spawnStreetcar(data.streetcar.x, data.streetcar.y);
  this._spawnConstruction(data.construction.x, data.construction.y);
  this._spawnFloor(data.floor.x, data.floor.y);
  this._spawnNextLevelEntrance(data.entrance.x, data.entrance.y);
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

PlayState._spawnConstruction = function(x, y) {
  this.construction = this.construction.create(x, y, 'construction');
  this.construction.anchor.set(0.5, 0.5);
  this.game.physics.enable(this.construction);
  this.construction.body.allowGravity = false;
  this.construction.renderable = true;
};

PlayState._spawnHeart = function(heart) {
  let sprite = this.hearts.create(heart.x, heart.y, 'heart');
  sprite.anchor.set(0.5, 0.5);
  sprite.animations.add('rotate', [0, 1, 2, 1], 5, true);
  sprite.animations.play('rotate');
  this.game.physics.enable(sprite);
  sprite.body.allowGravity = false;
  sprite.y -= 10;
  this.game.add.tween(sprite)
      .to({y: sprite.y + 25}, 900, Phaser.Easing.Sinusoidal.InOut)
      .yoyo(true)
      .loop()
      .start();
};

PlayState._spawnSpring = function(spring) {
  let sprite = this.springs.create(spring.x, spring.y, 'spring');
  sprite.anchor.set(0.5, 0.5);
  this.game.physics.enable(sprite);
  sprite.body.allowGravity = false;
  sprite.y -= 10;
  this.game.add.tween(sprite)
      .to({y: sprite.y + 25}, 900, Phaser.Easing.Sinusoidal.InOut)
      .yoyo(true)
      .loop()
      .start();
};

PlayState._spawnRental = function(rental) {
  let sprite = this.rental.create(rental.x, rental.y, 'rental');
  sprite.anchor.set(0.5, 0.5);
  this.game.physics.enable(sprite);
  sprite.body.allowGravity = false;
  sprite.y -= 10;
  this.game.add.tween(sprite)
      .to({y: sprite.y + 25}, 900, Phaser.Easing.Sinusoidal.InOut)
      .yoyo(true)
      .loop()
      .start();
};

PlayState._spawnSpikes = function(spike) {
  let sprite = this.spike.create(spike.x, spike.y, 'spike');
  sprite.anchor.set(0.5, 0.5);
  this.game.physics.enable(sprite);
  sprite.body.allowGravity = false;
};

PlayState._spawnRails = function(rail) {
  let sprite = this.rails.create(rail.x, rail.y, 'rail');
  sprite.anchor.set(0, 0);
  sprite.animations.add('flash', [0, 0, 1, 0, 1], 5, true);
  sprite.animations.play('flash');
  this.game.physics.enable(sprite);
  sprite.body.allowGravity = false;
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
  this.floor.renderable = false;
};

PlayState._spawnNextLevelEntrance = function (x,y) {
  this.entrance = this.bgDecoration.create(x, y, 'enter-transit');
  this.entrance.anchor.setTo(0.5, 1);
  this.game.physics.enable(this.entrance);
  this.entrance.body.allowGravity = false;
};

PlayState._spawnEnemyWall = function (x, y, side) {
    let sprite = this.enemyWalls.create(x, y, 'invisible-wall');
    // anchor and y displacement
    sprite.anchor.set(side === 'left' ? 1 : 0, 1);

    // physic properties
    this.game.physics.enable(sprite);
    sprite.body.immovable = true;
    sprite.body.allowGravity = false;
    sprite.renderable = false;
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
  this.game.physics.arcade.overlap(this.blob, this.entrance, this._onBlobVsNextLevel,
    function (blob, entrance) {
        return this.hasPresto && blob.body.touching.down;
    }, this);
  this.game.physics.arcade.overlap(this.blob, this.hearts, this._onBlobVsLives,
        null, this);
  this.game.physics.arcade.overlap(this.blob, this.construction, this._onBlobVsFallOnConstruction,
    null, this);
  this.game.physics.arcade.overlap(this.blob, this.springs, this._onBlobVsSprings,
        null, this);
  this.game.physics.arcade.overlap(this.blob, this.rental, this._onBlobVsNewRental,
        null, this);
  this.game.physics.arcade.overlap(this.blob, this.spike, this._onBlobVsSpike,
        null, this);
  this.game.physics.arcade.overlap(this.blob, this.rails, this._onBlobVsRail,
        null, this);
};

PlayState._onBlobVsToken = function (blob, token) {
  this.sfx.token.play();
  token.kill();
  tokenPickupCount++;
  if (tokenPickupCount % 50 == 0) {
    this.sfx.heart.play();
    livesCount++;
  }
};

PlayState._onBlobVsFallOnConstruction = function (blob, construction) {
  this.sfx.death.play();
  this._killPlayer();
};

PlayState._onBlobVsSpike = function (blob, spike) {
  this.sfx.death.play();
  this._killPlayer();
};

PlayState._onBlobVsRail = function (blob, rail) {
  this.sfx.death.play();
  this._killPlayer();
};

PlayState._onBlobVsEnemy = function (blob, enemy) {
  if (blob.body.velocity.y > 0) { // kill enemies when hero is falling
    blob.bounce();
    enemy.die();
    this.sfx.stomp.play();
  }
  else { //game over, restart
    this.sfx.death.play();
    this._killPlayer();
  }
};

PlayState._onBlobVsFall = function (blob, floor) {
  this.sfx.death.play();
  this._killPlayer();
};

PlayState._onEnemyVsFall = function (enemy, floor) {
  enemy.kill();
};

PlayState._onBlobVsPresto = function (blob, presto) {
  this.sfx.presto.play();
  presto.kill();
  this.hasPresto = true;
};

PlayState._onBlobVsLives = function (blob, heart) {
  this.sfx.heart.play();
  heart.kill();
  livesCount++;
};

PlayState._onBlobVsSprings = function (blob, spring) {
  this.sfx.bonus.play();
  spring.kill();
  if (this.level == 0) {
    text = game.add.text(blob.x + 10, blob.y, 'The snow melted.. \n You found a new spring in your step!');
    text.anchor.setTo(0.5);
    text.font = 'Press Start 2P';
    text.fontSize = 15;
    text.padding.set(10, 16);
    setTimeout(function() {
      text.destroy();
    }, 4000);
  }
  JUMP_SPEED = 1000;
  setTimeout(function() {
    JUMP_SPEED = 645;
  }, 10000);
};

PlayState._onBlobVsNewRental = function (blob, rental) {
  this.sfx.bonus.play();
  rental.kill();
  if (this.level == 1) {
    text = game.add.text(blob.x + 60, blob.y, 'You found a new rental agreement!!\n Hurry to the listing to make sure you get there first!');
    text.anchor.setTo(0.5);
    text.font = 'Press Start 2P';
    text.fontSize = 15;
    text.padding.set(10, 16);
    setTimeout(function() {
      text.destroy();
    }, 6000);
  } else if (this.level == 2 && rental.x == "3948") {
    text = game.add.text(blob.x + 60, blob.y, 'You found another rental agreement!!\n Hurry to the listing and watch out for the \n THIRD RAIL!');
    text.anchor.setTo(0.5);
    text.font = 'Press Start 2P';
    text.fontSize = 15;
    text.padding.set(10, 16);
    setTimeout(function() {
      text.destroy();
    }, 6000);
  }
  SPEED = 300;
  setTimeout(function() {
    SPEED = 200;
  }, 10000);
};

PlayState._onBlobVsNextLevel = function (blob, entrance) {
  this.sfx.nextLevel.play();
  this.game.state.restart(true, false, {level: this.level + 1});
};

PlayState._spawnStreetcar = function (x, y) {
    this.streetcar = this.bgDecoration.create(x, y, 'streetcar');
    this.streetcar.anchor.setTo(0.5, 1);
    this.game.physics.enable(this.streetcar);
    this.streetcar.body.allowGravity = false;
};

PlayState._killPlayer = function() {
  livesCount--;
  this.blob.kill();
  JUMP_SPEED = 645;
  SPEED = 200;
  if (livesCount == 0) {
    alert('You lost, game over!');
    livesCount = 3;
    tokenPickupCount = 0;
    game.state.start('play', true, false, {level: 0});
  } else {
    this.game.state.restart(
      true,
      false,
      {level: this.level,
        livesCount: livesCount,
        tokenPickupCount: tokenPickupCount
      }
    );
  }
};

PlayState._createHud = function () {
  this.prestoIcon = this.game.make.image(0, 21, 'icon:presto');
  this.prestoIcon.anchor.set(0, 0.5);
  const NUMBERS_STR = '0123456789X ';
  this.tokenFont = this.game.add.retroFont('font:numbers', 20, 26,
    NUMBERS_STR, 6);
  this.livesFont = this.game.add.retroFont('font:numbers', 20, 26,
    NUMBERS_STR, 6);
  let tokenIcon = this.game.make.image(this.prestoIcon.width + 7, 2, 'icon:token');
  let tokenScoreImg = this.game.make.image(tokenIcon.x + tokenIcon.width,
    tokenIcon.height / 2, this.tokenFont);
  tokenScoreImg.anchor.set(0, 0.5);

  let livesIcon = this.game.make.image(this.prestoIcon.width + 7, 50, 'icon:heart');
  let livesCountImg = this.game.make.image(livesIcon.x + livesIcon.width,
    70, this.livesFont);
  livesCountImg.anchor.set(0, 0.5);


  this.hud = this.game.add.group();
  this.hud.add(tokenIcon);
  this.hud.position.set(10, 10);
  this.hud.add(tokenScoreImg);
  this.hud.add(this.prestoIcon);
  this.hud.add(livesIcon);
  this.hud.add(livesCountImg);
  this.hud.fixedToCamera = true;

};

window.onload = function () {
  game.state.add('play', PlayState);
  game.state.start('play', true, false, {level: 2});
};

