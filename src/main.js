
import Phaser from 'phaser';
import './style.css';

const WIDTH = 900;
const HEIGHT = 450;
const GROUND_Y = 375;

class JungleScene extends Phaser.Scene {
  constructor() {
    super('JungleScene');
  }

  create() {
    this.isGameOver = false;
    this.score = 0;
    this.speed = 280;
    this.lastObstacleTime = 0;
    this.nextObstacleDelay = 1500;

    this.createBackground();
    this.createTextures();
    this.createMonkey();

    this.obstacles = this.physics.add.group();

    this.physics.add.overlap(
      this.monkey,
      this.obstacles,
      () => this.endGame()
    );

    this.createInterface();

    // Keyboard controls
    this.input.keyboard.on('keydown-SPACE', () => {
      this.jump();
    });

    this.input.keyboard.on('keydown-UP', () => {
      this.jump();
    });

    // Mouse and touchscreen controls
    this.input.on('pointerdown', () => {
      this.jump();
    });
  }

  createBackground() {
    this.cameras.main.setBackgroundColor('#b9eddb');

    // Sun
    this.add.circle(740, 85, 38, 0xffdc7a);

    // Distant trees
    for (let x = 40; x < WIDTH; x += 120) {
      this.add.rectangle(
        x,
        GROUND_Y - 75,
        18,
        150,
        0x7b9b69
      );

      this.add.circle(
        x,
        GROUND_Y - 160,
        62,
        0x76c991
      );
    }

    // Ground
    this.add.rectangle(
      WIDTH / 2,
      GROUND_Y + 38,
      WIDTH,
      76,
      0x5a9942
    );

    // Grass line
    this.add.rectangle(
      WIDTH / 2,
      GROUND_Y,
      WIDTH,
      8,
      0x3c7c35
    );
  }

  createTextures() {
    // Monkey
    const monkeyGraphics = this.make.graphics({
      x: 0,
      y: 0
    });

    monkeyGraphics.fillStyle(0x8b4a29);
    monkeyGraphics.fillCircle(32, 32, 27);

    monkeyGraphics.fillStyle(0xdba46b);
    monkeyGraphics.fillCircle(32, 38, 18);

    monkeyGraphics.fillStyle(0xffffff);
    monkeyGraphics.fillCircle(23, 26, 6);
    monkeyGraphics.fillCircle(41, 26, 6);

    monkeyGraphics.fillStyle(0x222222);
    monkeyGraphics.fillCircle(24, 26, 3);
    monkeyGraphics.fillCircle(42, 26, 3);

    monkeyGraphics.generateTexture('monkey', 64, 64);
    monkeyGraphics.destroy();

    // Log obstacle
    const logGraphics = this.make.graphics({
      x: 0,
      y: 0
    });

    logGraphics.fillStyle(0x92532d);
    logGraphics.fillRoundedRect(0, 0, 46, 65, 8);

    logGraphics.fillStyle(0x6e3d22);
    logGraphics.fillRect(12, 0, 6, 65);

    logGraphics.generateTexture('log', 46, 65);
    logGraphics.destroy();
  }

  createMonkey() {
    this.monkey = this.physics.add.sprite(
      120,
      GROUND_Y - 32,
      'monkey'
    );

    this.monkey.setCollideWorldBounds(true);

    this.monkey.body.setSize(44, 52);
    this.monkey.body.setOffset(10, 6);

    // Invisible physics floor
    const floor = this.add.zone(
      WIDTH / 2,
      GROUND_Y + 10,
      WIDTH,
      20
    );

    this.physics.add.existing(floor, true);

    this.physics.add.collider(
      this.monkey,
      floor
    );
  }

  createInterface() {
    this.scoreText = this.add.text(
      20,
      20,
      'Score: 0',
      {
        fontSize: '26px',
        color: '#23462d',
        fontStyle: 'bold'
      }
    );

    this.bestScore = Number(
      localStorage.getItem('monkeyBest') || 0
    );

    this.bestText = this.add.text(
      20,
      55,
      `Best: ${this.bestScore}`,
      {
        fontSize: '18px',
        color: '#23462d'
      }
    );

    this.gameOverText = this.add.text(
      WIDTH / 2,
      150,
      '',
      {
        fontSize: '30px',
        color: '#ffffff',
        backgroundColor: '#254f37',
        padding: {
          x: 20,
          y: 12
        },
        align: 'center'
      }
    );

    this.gameOverText
      .setOrigin(0.5)
      .setDepth(10)
      .setVisible(false);
  }

  jump() {
    if (this.isGameOver) {
      this.scene.restart();
      return;
    }

    // Only jump while touching the ground
    if (this.monkey.body.blocked.down) {
      this.monkey.setVelocityY(-650);
    }
  }

  spawnObstacle() {
    const obstacle = this.obstacles.create(
      WIDTH + 40,
      GROUND_Y - 32,
      'log'
    );

    obstacle.body.setAllowGravity(false);
    obstacle.setImmovable(true);
    obstacle.setVelocityX(-this.speed);
  }

  update(time, delta) {
    if (this.isGameOver) return;

    // Increase score
    this.score += delta * 0.01;

    // Gradually increase difficulty
    this.speed = Math.min(
      520,
      280 + this.score * 0.3
    );

    this.scoreText.setText(
      `Score: ${Math.floor(this.score)}`
    );

    // Spawn obstacles
    if (
      time - this.lastObstacleTime >
      this.nextObstacleDelay
    ) {
      this.spawnObstacle();

      this.lastObstacleTime = time;

      this.nextObstacleDelay =
        Phaser.Math.Between(1250, 1900);
    }


    // Move obstacles
    const obstacles = this.obstacles.getChildren();

    for (const obstacle of obstacles) {
      if (!obstacle || !obstacle.active) continue;

      obstacle.setVelocityX(-this.speed);

      if (obstacle.x < -60) {
        obstacle.destroy();
      }
    }

  }

  endGame() {
    if (this.isGameOver) return;

    this.isGameOver = true;

    this.physics.pause();

    const finalScore = Math.floor(this.score);

    if (finalScore > this.bestScore) {
      localStorage.setItem(
        'monkeyBest',
        finalScore
      );
    }

    this.gameOverText.setText(
      `Game Over!\n` +
      `Score: ${finalScore}\n` +
      `Tap or press Space to restart`
    );

    this.gameOverText.setVisible(true);
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: WIDTH,
  height: HEIGHT,

  backgroundColor: '#b9eddb',

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },

  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        x: 0,
        y: 1500
      },
      debug: false
    }
  },

  scene: JungleScene
});
