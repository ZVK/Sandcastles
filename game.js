var sprites = {
 ship: { sx: 190, sy: 0, w: 37, h: 42, frames: 1 },
 missile: { sx: 10, sy: 30, w: 20, h: 7, frames: 1 },
 missile2: { sx: 0, sy: 30, w: 10, h: 20, frames: 1 },
 enemy_purple: { sx: 37, sy: 0, w: 42, h: 43, frames: 1 },
 enemy_bee: { sx: 79, sy: 0, w: 37, h: 43, frames: 1 },
 enemy_ship: { sx: 116, sy: 0, w: 42, h: 43, frames: 1 },
 enemy_circle: { sx: 158, sy: 0, w: 32, h: 33, frames: 1 },
 explosion: { sx: 0, sy: 64, w: 64, h: 64, frames: 12 },
 enemy_missile: { sx: 9, sy: 42, w: 3, h: 20, frames: 1, },
 extra_life: {sx: 0, sy: 0, w:37, h:42, frames: 1},
};

var enemies = {
  straight: { x: 0,   y: -50, sprite: 'enemy_ship', health: 10, 
              E: 100 },
  ltr:      { x: 0,   y: -100, sprite: 'enemy_purple', health: 10, 
              B: 75, C: 1, E: 100, missiles: 4  },
  circle:   { x: 250,   y: -50, sprite: 'enemy_circle', health: 10, 
              A: 0,  B: -100, C: 1, E: 20, F: 100, G: 1, H: Math.PI/2 },
  wiggle:   { x: 100, y: -50, sprite: 'enemy_bee', health: 20, 
              B: 50, C: Math.random()*6, E: 100, firePercentage: 0.001, missiles: 2 },
  step:     { x: 0,   y: -50, sprite: 'enemy_circle', health: 10,
              B: 150, C: 1.2, E: 75 }              
};

var powerups  = {
  life:     { x: 0, y: -50, sprite: "extra_life", E: 100, firePercentage: 0}
};

var OBJECT_PLAYER = 1,
    OBJECT_PLAYER_PROJECTILE = 4,
    OBJECT_ENEMY = 8,
    OBJECT_ENEMY_PROJECTILE = 4,
    OBJECT_POWERUP = 16;

var startGame = function() {
  var ua = navigator.userAgent.toLowerCase();

  // Only 1 row of stars
  if(ua.match(/android/)) {
    Game.setBoard(0,new Starfield(50,0.6,100,true));
  } else {
    Game.setBoard(0,new Starfield(20,0.4,100,true));
    Game.setBoard(1,new Starfield(50,0.6,100));
    Game.setBoard(2,new Starfield(100,1.0,50));
  }  
  Game.setBoard(3,new TitleScreen("Sandcastles", 
                                  "Press fire to start playing",
                                  playGame));
};

var levels = [[//level0
 // Start,   End, Gap,  Type,   Override
  [ 0,      7200,  1800, 'wiggle' ], 
  [ 0,      7200,  1800, 'circle' ], 
  [ 7200,   14400, 1800, 'step', { x: 50 } ],
  [ 14400,  21600, 1800, 'ltr' ],
  [ 15000,  16000, 1450, 'wiggle'],
  [ 15500,  16500, 1275, 'wiggle', { x: 150 }],       
  [ 14400,  21600, 1200, 'circle' ],
  [ 21600,  36000, 1800, 'step', { x: 50 } ],
  [ 36000,  43200, 3600, 'wiggle', { x: 90 } ],
  [ 50400,  64800, 1500, 'wiggle', { x: 10 } ],
  [ 60400,  64800, 4700, 'wiggle', { x: 90 } ],  
  [ 57600,  60800, 1800, 'step', { x: 150 }],
  [ 60000,   65000, 900, 'circle', { x: 50 } ],  
  [ 64800,  69900, 3600, 'wiggle', { x: 100 }]
],[//level1
  [0,     4000,   1200,  'step'],
  [6000,  8000,   4000,  'ltr'],
  [7000,  9000,   1000,  'circle'],
  [9000,  12000,   2500,  'straight', { x: 50 } ],
  [9000,  12000,   2000,  'wiggle', { x: 150 } ],  
  [10000,  14000,   4000,  'straight', { x: 100 } ],
  [10000,  14000,   4000,  'wiggle', { x: 200 } ],  
  [12000,  16000,   900,  'straight', { x: 150 } ],    
  [12000,  16000,   900,  'wiggle', { x: 250 } ],
  [18000,  26000,   200,  'circle', { x: 150 } ],    
  [19000,  27000,   300,  'circle', { x: 250 } ]  
]];

var currentLevel = 0;


var playGame = function() {
  var board = new GameBoard();
  board.add(new PlayerShip());
  board.add(new Level(levels[currentLevel],nextLevel)); 
  Game.setBoard(3,board);
  Game.setBoard(5,new GamePoints(0));
};

var nextLevel = function() {
  currentLevel++;
  if(currentLevel < levels.length){
    var l = currentLevel+1;
    Game.setBoard(3,new TitleScreen("Level "+l,
                                    "Press fire to play",
                                    playGame));
  }else{
  winGame;
  }
}

var winGame = function() {
  currentLevel = 0;
  Game.setBoard(3,new TitleScreen("The Sea is Free!", 
                                  "Press fire to play again",
                                  playGame));
};

var loseGame = function() {
  //currentLevel = 0;
  Game.setBoard(3,new TitleScreen("Washed Up!", 
                                  "Press fire to play again",
                                  playGame));
};

var Starfield = function(speed,opacity,numStars,clear) {

  // Set up the offscreen canvas
  var stars = document.createElement("canvas");
  stars.width = Game.width; 
  stars.height = Game.height;
  var starCtx = stars.getContext("2d");

  var offset = 0;

  // If the clear option is set, 
  // make the background black instead of transparent
  if(clear) {
    starCtx.fillStyle = "#000033";
    starCtx.fillRect(0,0,stars.width,stars.height);
  }

  // Now draw a bunch of random 2 pixel
  // rectangles onto the offscreen canvas

  starCtx.globalAlpha = opacity;
  for(var i=0;i<numStars;i++) {
    starCtx.beginPath();
    starCtx.arc(Math.floor(Math.random()*stars.width),
                     Math.floor(Math.random()*stars.height),
                     Math.random() * 7,
                     0,
                     2 * Math.PI,
                     false);
    starCtx.fillStyle = "#002266";
    starCtx.fill();
  }

  // This method is called every frame
  // to draw the starfield onto the canvas
  this.draw = function(ctx) {
    var intOffset = Math.floor(offset);
    var remaining = stars.height - intOffset;

    // Draw the top half of the starfield
    if(intOffset > 0) {
      ctx.drawImage(stars,
                0, remaining,
                stars.width, intOffset,
                0, 0,
                stars.width, intOffset);
    }

    // Draw the bottom half of the starfield
    if(remaining > 0) {
      ctx.drawImage(stars,
              0, 0,
              stars.width, remaining,
              0, intOffset,
              stars.width, remaining);
    }
  };
  // This method is called to update
  // the starfield
  this.step = function(dt) {
    offset += dt * speed;
    offset = offset % stars.height;
  };
};

var PlayerShip = function() { 
  this.setup('ship', { vx: 0, reloadTime: 0.25, maxVel: 200 });

  this.reload = this.reloadTime;
  this.x = Game.width/2 - this.w / 2;
  this.y = Game.height - Game.playerOffset - this.h;

  this.step = function(dt) {
    if(Game.keys['left']) { this.vx = -this.maxVel; }
    else if(Game.keys['right']) { this.vx = this.maxVel; }      
    else { this.vx = 0; }

    this.x += this.vx * dt;

    if(this.x < 0) { this.x = 0; }
    else if(this.x > Game.width - this.w) { 
      this.x = Game.width - this.w;
    }
    
    if(Game.keys['up']) { this.vy = this.maxVel; }
    else if(Game.keys['down']) { this.vy = -this.maxVel; }  
    else {this.vy = 0; }
    
    this.y -= this.vy * dt;
    
    if(this.y < 0) { this.y = 0; }
    else if(this.y > Game.height - this.h) {
      this.y = Game.height - this.h
    }
    
    this.reload-=dt;
    if(Game.keys['fire'] && this.reload < 0) {
      Game.keys['fire'] = false;
      this.reload = this.reloadTime;

      //this.board.add(new PlayerMissile(this.x,this.y+this.h/2));
      this.board.add(new PlayerMissile(this.x+this.w/2,this.y+this.h/2));
    }

  };
};

PlayerShip.prototype = new Sprite();
PlayerShip.prototype.type = OBJECT_PLAYER;

PlayerShip.prototype.hit = function(damage) {
  if(this.board.remove(this)) {
    loseGame();
  }
};


var PlayerMissile = function(x,y) {
  this.setup('missile',{ vy: -2000, damage: 10 });
  this.x = x - this.w/2;
  this.y = y - this.h; 
};

PlayerMissile.prototype = new Sprite();
PlayerMissile.prototype.type = OBJECT_PLAYER_PROJECTILE;

PlayerMissile.prototype.step = function(dt)  {
  this.y += this.vy * dt;
  var collision = this.board.collide(this,OBJECT_ENEMY);
  var intercept = this.board.collide(this,OBJECT_ENEMY_PROJECTILE);
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  } else if(this.y < -this.h) { 
      this.board.remove(this); 
  }
  if(intercept) {
    intercept.hit(this.damage);
    this.board.remove(this);
    Game.points = Game.points + 1000
  } else if (this.y < -this.h) {
      this.board.remove(this);   
  }
};


var Enemy = function(blueprint,override) {
  this.merge(this.baseParameters);
  this.setup(blueprint.sprite,blueprint);
  this.merge(override);
};

Enemy.prototype = new Sprite();
Enemy.prototype.type = OBJECT_ENEMY;

Enemy.prototype.baseParameters = { A: 0, B: 0, C: 0, D: 0, 
                                   E: 0, F: 0, G: 0, H: 0,
                                   t: 0, reloadTime: 0.75, 
                                   reload: 0 };

Enemy.prototype.step = function(dt) {
  this.t += dt;

  this.vx = this.A + this.B * Math.sin(this.C * this.t + this.D);
  this.vy = this.E + this.F * Math.sin(this.G * this.t + this.H);

  this.x += this.vx * dt;
  this.y += this.vy * dt;

  var collision = this.board.collide(this,OBJECT_PLAYER);
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  }

  if(Math.random() < 0.01 && this.reload <= 0) {
    this.reload = this.reloadTime;
    if(this.missiles == 2) {
      this.board.add(new EnemyMissile(this.x+this.w-2,this.y+this.h));
      this.board.add(new EnemyMissile(this.x+2,this.y+this.h));
    } else {
      this.board.add(new EnemyMissile(this.x+this.w/2,this.y+this.h));
    }

  }
  this.reload-=dt;

  if(this.y > Game.height ||
     this.x < -this.w ||
     this.x > Game.width) {
       this.board.remove(this);
  }
};

Enemy.prototype.hit = function(damage) {
  this.health -= damage;
  if(this.health <=0) {
    if(this.board.remove(this)) {
      Game.points += this.points || 100;
      this.board.add(new Explosion(this.x + this.w/2, 
                                   this.y + this.h/2));
    }
  }
};

var ExtraLife  = function (x,y){
  this.setup('extra_life',{ vy:200, damage: -10});
  this.x = x - this.w/2;
  this.y = y;
}
ExtraLife.prototype = new Sprite();
ExtraLife.prototype.type = OBJECT_POWERUP;
ExtraLife.prototype.step = function(dt) {
  var collision = this.board.collide(this,OBJECT_PLAYER);
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  }else if(this.y > Game.height){
    this.board.remove(this);
  }
}

var EnemyMissile = function(x,y) {
  this.setup('enemy_missile',{ vy: 200, damage: 10 });
  this.x = x - this.w/2;
  this.y = y;
};

EnemyMissile.prototype = new Sprite();
EnemyMissile.prototype.type = OBJECT_ENEMY_PROJECTILE;

EnemyMissile.prototype.step = function(dt)  {
  var intercept = this.board.collide(this,OBJECT_ENEMY_PROJECTILE);
  this.y += this.vy * dt;
  var collision = this.board.collide(this,OBJECT_PLAYER);
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  } else if(this.y > Game.height) {
      this.board.remove(this); 
  }
  if(intercept) {
    intercept.hit(this.damage);
    this.board.remove(this);
    console.log("hit");
  } else if(this.y > Game.height) {
      this.board.remove(this);
  }
};



var Explosion = function(centerX,centerY) {
  this.setup('explosion', { frame: 0 });
  this.x = centerX - this.w/2;
  this.y = centerY - this.h/2;
};

Explosion.prototype = new Sprite();

Explosion.prototype.step = function(dt) {
  this.frame++;
  if(this.frame >= 12) {
    this.board.remove(this);
  }
};

window.addEventListener("load", function() {
  Game.initialize("game",sprites,startGame);
});


