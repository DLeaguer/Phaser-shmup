(Phaser => {  //sanity check 
	console.log(Phaser);
}) (window.Phaser);


let player;
let cursors;
let playerBullets;
let enemies;
let enemyBullets;


(Phaser => {
  const GAME_WIDTH = 460;
  const GAME_HEIGHT = 600;
  const GAME_CONTAINER_ID = 'game';

  const game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO, GAME_CONTAINER_ID, { preload, create, update });

  function preload() {

  };

const INITIAL_MOVESPEED = 4;
  function create() {
  	game.physics.startSystem(Phaser.Physics.ARCADE);
  	cursors = game.input.keyboard.createCursorKeys();
  	cursors.fire = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
  	cursors.fire.onUp.add( handlePlayerFire );
  	player = game.add.sprite(100, 100, GFX, 8);
  	player.moveSpeed = INITIAL_MOVESPEED;
  	playerBullets = game.add.group();
  	enemies = game.add.group();
  	enemyBullets = game.add.group();
  	enemyBullets.enableBody = true;

  };

  function update() {
  	handlePlayerMovement();
  	handleBulletAnimations();
  	handleEnemyActions();
  	handleCollisions();
  	randomlySpawnEnemy();

  	cleanup();
  };

  function cleanup() {
    playerBullets.children
      .filter( bullet => bullet.y < 0 )
      .forEach( bullet => bullet.destroy() );
  };



const GFX = 'gfx';

function preload() {
  game.load.spritesheet(GFX, 'assets/shmup-spritesheet-140x56-28x28-tile.png', 28, 28);
};

  function handlePlayerMovement() {
  	let movingH = Math.sqrt(2);
    let movingV = Math.sqrt(2);
  if( cursors.up.isDown || cursors.down.isDown){
    movingH = 1; // slow down diagonal movement
  }
  if( cursors.left.isDown || cursors.right.isDown){
    movingV = 1; 
}
    switch( true ){
      case cursors.left.isDown:
        player.x -= player.moveSpeed * movingH;
        break;
      case cursors.right.isDown:
        player.x += player.moveSpeed * movingH;
        break;
    }
    switch( true ){
      case cursors.down.isDown:
        player.y += player.moveSpeed * movingH;
        break;
      case cursors.up.isDown:
        player.y -= player.moveSpeed * movingH;
        break;
    }
  };

  function handlePlayerFire() {
  // console.log("fire");
  	playerBullets.add( game.add.sprite(player.x, player.y, GFX, 7) );
};

const PLAYER_BULLET_SPEED = 6;

function handleBulletAnimations() {
  playerBullets.children.forEach( bullet => bullet.y -= PLAYER_BULLET_SPEED );
};



const ENEMY_SPAWN_FREQ = 100; // higher is less frequent

const randomGenerator = new Phaser.RandomDataGenerator();

  function randomlySpawnEnemy() {
    if(randomGenerator.between(0, ENEMY_SPAWN_FREQ) === 0) {
      let randomX = randomGenerator.between(0, GAME_WIDTH);
      enemies.add( game.add.sprite(randomX, -24, GFX, 0));
    }
  }

  const ENEMY_FIRE_FREQ = 30; // higher is less frequent

  function randomEnemyFire(enemy) {
    if( randomGenerator.between(0, ENEMY_FIRE_FREQ) === 0 ){
      let enemyBullet = game.add.sprite(enemy.x, enemy.y, GFX, 9);
      enemyBullet.checkWorldBounds = true;
      enemyBullet.outOfBoundsKill = true;
      enemyBullets.add( enemyBullet );
    }
  };

 const ENEMY_BULLET_ACCEL = 100;

function handleBulletAnimations() {
  playerBullets.children.forEach( bullet => bullet.y -= PLAYER_BULLET_SPEED );
  enemyBullets.children.forEach( bullet =>  {
    game.physics.arcade.accelerateToObject(bullet, player, ENEMY_BULLET_ACCEL);
  });
};



   const ENEMY_SPEED = 4.5;

  function handleEnemyActions() {
    enemies.children.forEach( enemy => enemy.y += ENEMY_SPEED );
    enemies.children.forEach( enemy => randomEnemyFire(enemy) );
  };

function removeBullet(bullet) {
    return bullet.destroy();
  }

  function destroyEnemy(enemy) {
    return enemy.kill();
  }

  function handleCollisions() {
    // check if any bullets touch any enemies
    let enemiesHit = enemies.children
      .filter( enemy => enemy.alive )
      .filter( enemy => 
        playerBullets.children.some( 
          bullet => enemy.overlap(bullet) 
        ) 
      );

    if( enemiesHit.length ){
      // clean up bullets that land
      playerBullets.children
        .filter( bullet => bullet.overlap(enemies) )
        .forEach( removeBullet );

      enemiesHit.forEach( destroyEnemy );
    }
    // check if enemies hit the player
    enemiesHit = enemies.children
      .filter( enemy => enemy.overlap(player) );

    if( enemiesHit.length){
      handlePlayerHit();

      enemiesHit.forEach( destroyEnemy );
    }
  };

   function handlePlayerHit() {
    gameOver();
  };

  function gameOver() {
    game.state.destroy();
    game.add.text(90, 200, 'You Pau Cuz', { fill: '#FFFFFF' });
    let playAgain = game.add.text(120, 300, 'Try One Mo Time', { fill: '#FFFFFF' });
  playAgain.inputEnabled = true;
  playAgain.events.onInputUp.add(_ => {
    window.location.reload();
  });
  };




})(window.Phaser);
