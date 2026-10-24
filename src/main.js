
import Phaser from 'phaser';
import './style.css';

const WIDTH = 900;
const HEIGHT = 450;
const GROUND_Y = 375;

const COLORS = {
  sky: 0x080e1d,
  moon: 0xd5e4ef,
  cyan: 0x67f6eb,
  gold: 0xffd16b,
  purple: 0x9c79e8,
  stone: 0x293047,
};

class JungleScene extends Phaser.Scene {
  constructor() {
    super('JungleScene');
  }

  create() {
    this.isGameOver = false;
    this.score = 0;
    this.bananasCollected = 0;
    this.speed = 270;
    this.lastObstacleTime = 0;
    this.nextObstacleDelay = 1600;
    this.lastBananaTime = 0;
    this.nextBananaDelay = 1800;
    this.elapsed = 0;

    this.createTextures();
    this.createBackground();
    this.createGround();
    this.createMonkey();

    this.obstacles = this.physics.add.group();
    this.bananas = this.physics.add.group();

    this.physics.add.overlap(
      this.monkey,
      this.obstacles,
      () => this.endGame()
    );

    this.physics.add.overlap(
      this.monkey,
      this.bananas,
      (_monkey, banana) => this.collectBanana(banana)
    );

    this.createInterface();

    this.input.keyboard.on('keydown-SPACE', () => this.jump());
    this.input.keyboard.on('keydown-UP', () => this.jump());
    this.input.on('pointerdown', () => this.jump());
  }

  createTextures() {
    // ALIEN MONKEY
    const g = this.make.graphics({ x: 0, y: 0 });

    // Tail
    g.lineStyle(7, 0x4c9b9b, 1);
    g.beginPath();
    g.arc(64, 42, 18, -1.4, 2.3, false);
    g.strokePath();

    // Legs
    g.fillStyle(0x327f83);
    g.fillEllipse(29, 69, 13, 22);
    g.fillEllipse(51, 69, 13, 22);

    // Body
    g.fillStyle(0x285f70);
    g.fillEllipse(40, 51, 43, 42);

    g.fillStyle(0x429fa2);
    g.fillEllipse(40, 50, 23, 28);

    // Arms
    g.fillStyle(0x367f89);
    g.fillEllipse(16, 51, 12, 29);
    g.fillEllipse(64, 51, 12, 29);

    // Ears
    g.fillStyle(0x368b91);
    g.fillCircle(12, 29, 12);
    g.fillCircle(68, 29, 12);

    // Head
    g.fillStyle(0x316e7e);
    g.fillEllipse(40, 28, 56, 47);

    // Alien antennae
    g.lineStyle(3, 0x5ed5d0);
    g.lineBetween(29, 11, 22, 0);
    g.lineBetween(51, 11, 58, 0);

    g.fillStyle(COLORS.cyan);
    g.fillCircle(22, 3, 4);
    g.fillCircle(58, 3, 4);

    // Glowing eyes
    g.fillStyle(0x08262f);
    g.fillEllipse(28, 28, 19, 15);
    g.fillEllipse(52, 28, 19, 15);

    g.fillStyle(COLORS.cyan);
    g.fillEllipse(29, 28, 12, 10);
    g.fillEllipse(51, 28, 12, 10);

    // Mouth
    g.lineStyle(2, 0x081f2b);
    g.lineBetween(35, 43, 45, 43);

    g.generateTexture('alienMonkey', 88, 85);
    g.destroy();

    // BROKEN STONE PILLAR
    const pillar = this.make.graphics({ x: 0, y: 0 });

    pillar.fillStyle(0x111a2d);
    pillar.fillRect(4, 10, 44, 65);

    pillar.fillStyle(0x35415b);
    pillar.fillRect(10, 17, 32, 58);

    pillar.fillStyle(0x485471);
    pillar.fillRect(2, 12, 48, 11);
    pillar.fillRect(0, 66, 52, 9);

    pillar.lineStyle(3, 0x131b2c);
    pillar.lineBetween(25, 22, 19, 40);
    pillar.lineBetween(19, 40, 32, 54);

    pillar.fillStyle(COLORS.cyan);
    pillar.fillRect(14, 29, 4, 14);

    pillar.generateTexture('pillar', 52, 75);
    pillar.destroy();

    // ALIEN CRYSTALS
    const crystal = this.make.graphics({ x: 0, y: 0 });

    crystal.fillStyle(0x15283c);
    crystal.fillTriangle(0, 62, 19, 7, 36, 62);
    crystal.fillTriangle(24, 62, 48, 0, 64, 62);

    crystal.fillStyle(0x389fa9);
    crystal.fillTriangle(10, 62, 19, 7, 28, 62);
    crystal.fillTriangle(34, 62, 48, 0, 54, 62);

    crystal.fillStyle(COLORS.cyan);
    crystal.fillTriangle(17, 38, 19, 7, 23, 38);
    crystal.fillTriangle(45, 35, 48, 0, 51, 35);

    crystal.generateTexture('crystal', 64, 65);
    crystal.destroy();

    // MECHANICAL DEBRIS
    const wreck = this.make.graphics({ x: 0, y: 0 });

    wreck.fillStyle(0x182233);
    wreck.fillRoundedRect(2, 13, 74, 42, 7);

    wreck.fillStyle(0x41475b);
    wreck.fillRoundedRect(9, 18, 59, 30, 5);

    wreck.fillStyle(0x10192b);
    wreck.fillRect(25, 18, 20, 30);

    wreck.fillStyle(0xe6a956);
    wreck.fillRect(14, 26, 8, 5);
    wreck.fillRect(55, 26, 8, 5);

    wreck.lineStyle(4, 0x69738b);
    wreck.lineBetween(7, 11, 25, 0);
    wreck.lineBetween(61, 11, 73, 2);

    wreck.generateTexture('wreck', 78, 57);
    wreck.destroy();

    // COLLECTIBLE BANANA
    const banana = this.make.graphics({ x: 0, y: 0 });

    banana.lineStyle(10, COLORS.gold);
    banana.beginPath();
    banana.arc(19, 13, 13, 0.2, 2.65, false);
    banana.strokePath();

    banana.lineStyle(3, 0xfff0a6);
    banana.beginPath();
    banana.arc(19, 13, 13, 0.5, 2.3, false);
    banana.strokePath();

    banana.generateTexture('banana', 40, 35);
    banana.destroy();

    // SMALL BACKGROUND STAR
    const star = this.make.graphics({ x: 0, y: 0 });
    star.fillStyle(0xb9d6ed);
    star.fillCircle(3, 3, 2);
    star.generateTexture('star', 6, 6);
    star.destroy();
  }

  createBackground() {
    this.cameras.main.setBackgroundColor('#080e1d');

    // Atmospheric sky
    this.add.rectangle(
      WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, COLORS.sky
    ).setDepth(-20);

    // Stars
    for (let i = 0; i < 65; i++) {
      const x = Phaser.Math.Between(0, WIDTH);
      const y = Phaser.Math.Between(10, 285);

      this.add.image(x, y, 'star')
        .setAlpha(Phaser.Math.FloatBetween(0.2, 0.8))
        .setDepth(-18);
    }

    // Moon glow
    this.add.circle(710, 95, 83, 0x7e9ebd, 0.07)
      .setDepth(-17);

    this.add.circle(710, 95, 62, 0xa5bfd5, 0.13)
      .setDepth(-16);

    this.add.circle(710, 95, 46, COLORS.moon, 0.85)
      .setDepth(-15);

    this.add.circle(697, 86, 9, 0xa4b8c9, 0.32)
      .setDepth(-14);

    this.add.circle(728, 109, 7, 0x9bafc2, 0.3)
      .setDepth(-14);

    this.createScrollingLayer(
      'farCity', 1800, 0x121b2d, 0.13, -12
    );

    this.createScrollingLayer(
      'nearCity', 1400, 0x202b40, 0.34, -10
    );

    this.createScrollingLayer(
      'alienTrees', 1200, 0x172d37, 0.65, -7
    );

    // Ground-level atmospheric haze
    this.add.rectangle(
      WIDTH / 2, 338, WIDTH, 76, 0x4d8a96, 0.08
    ).setDepth(-5);
  }

  createScrollingLayer(key, width, color, speedFactor, depth) {
    const g = this.make.graphics({ x: 0, y: 0 });

    if (key === 'alienTrees') {
      for (let x = 0; x < width; x += 105) {
        const h = Phaser.Math.Between(75, 145);

        g.fillStyle(color);
        g.fillRect(x + 38, 360 - h, 12, h);

        g.fillEllipse(x + 44, 360 - h, 80, 95);

        g.lineStyle(4, 0x284450);
        g.lineBetween(x + 44, 360 - h, x + 16, 360 - h - 35);
      }
    } else {
      const near = key === 'nearCity';

      for (let x = 0; x < width; x += near ? 88 : 112) {
        const h = Phaser.Math.Between(
          near ? 115 : 80,
          near ? 240 : 180
        );

        const w = near ? 68 : 88;

        g.fillStyle(color);
        g.fillRect(x, 365 - h, w, h);

        // Gothic pointed roof
        g.fillTriangle(
          x - 7, 365 - h,
          x + w / 2, 365 - h - 35,
          x + w + 7, 365 - h
        );

        // Spires
        g.fillRect(x + w / 2 - 3, 365 - h - 54, 6, 35);

        // Glowing windows
        g.fillStyle(near ? 0x9e875f : 0x42556c, near ? 0.65 : 0.3);

        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 2; col++) {
            g.fillRect(
              x + 17 + col * 25,
              365 - h + 23 + row * 28,
              6,
              11
            );
          }
        }
      }
    }

    g.generateTexture(key, width, 380);
    g.destroy();

    const layer = this.add.tileSprite(
      WIDTH / 2, 190, WIDTH, 380, key
    );

    layer.setDepth(depth);

    if (!this.scrollingLayers) this.scrollingLayers = [];

    this.scrollingLayers.push({
      sprite: layer,
      factor: speedFactor
    });
  }

  createGround() {
    this.add.rectangle(
      WIDTH / 2, GROUND_Y + 39, WIDTH, 78, 0x111827
    ).setDepth(1);

    this.add.rectangle(
      WIDTH / 2, GROUND_Y + 2, WIDTH, 7, 0x596078
    ).setDepth(2);

    this.add.rectangle(
      WIDTH / 2, GROUND_Y + 8, WIDTH, 4, 0x222e43
    ).setDepth(2);

    this.groundDetails = [];

    for (let x = 0; x < WIDTH + 90; x += 90) {
      const line = this.add.rectangle(
        x, GROUND_Y + 32, 3, 44, 0x303b51
      ).setDepth(2);

      this.groundDetails.push(line);
    }

    // Invisible solid physics floor
    const floor = this.add.zone(
      WIDTH / 2,
      GROUND_Y + 10,
      WIDTH,
      20
    );

    this.physics.add.existing(floor, true);
    this.floor = floor;
  }

  createMonkey() {
    this.monkey = this.physics.add.sprite(
      125,
      GROUND_Y - 39,
      'alienMonkey'
    );

    this.monkey.setDepth(5);
    this.monkey.setCollideWorldBounds(true);

    this.monkey.body.setSize(43, 65);
    this.monkey.body.setOffset(19, 12);

    this.physics.add.collider(this.monkey, this.floor);

    // Small glow under the alien
    this.monkeyGlow = this.add.ellipse(
      125, GROUND_Y - 1, 65, 12, COLORS.cyan, 0.16
    ).setDepth(3);
  }

  createInterface() {
    const textStyle = {
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      color: '#e7edf7',
      stroke: '#08101d',
      strokeThickness: 3
    };

    this.scoreText = this.add.text(
      20, 17, 'DISTANCE  0', {
        ...textStyle,
        fontSize: '23px'
      }
    ).setDepth(20);

    this.bananaText = this.add.text(
      20, 51, 'BANANAS  0', {
        ...textStyle,
        fontSize: '19px',
        color: '#ffda83'
      }
    ).setDepth(20);

    try {
      this.bestScore = Number(
        localStorage.getItem('alienMonkeyBest') || 0
      );
    } catch {
      this.bestScore = 0;
    }

    this.bestText = this.add.text(
      WIDTH - 20, 20, `BEST  ${this.bestScore}`, {
        ...textStyle,
        fontSize: '19px'
      }
    ).setOrigin(1, 0).setDepth(20);

    this.gameOverPanel = this.add.rectangle(
      WIDTH / 2, HEIGHT / 2 - 5,
      455, 205, 0x0b1324, 0.94
    ).setStrokeStyle(2, COLORS.cyan, 0.7)
      .setDepth(29)
      .setVisible(false);

    this.gameOverText = this.add.text(
      WIDTH / 2,
      HEIGHT / 2 - 5,
      '',
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: '25px',
        fontStyle: 'bold',
        color: '#e8f4ff',
        align: 'center',
        lineSpacing: 11
      }
    ).setOrigin(0.5)
      .setDepth(30)
      .setVisible(false);
  }

  jump() {
    if (this.isGameOver) {
      this.scene.restart();
      return;
    }

    if (this.monkey.body.blocked.down ||
        this.monkey.body.touching.down) {
      this.monkey.setVelocityY(-660);
    }
  }

  spawnObstacle() {
    const types = ['pillar', 'crystal', 'wreck'];
    const type = Phaser.Utils.Array.GetRandom(types);

    const sizes = {
      pillar: { width: 52, height: 75 },
      crystal: { width: 64, height: 65 },
      wreck: { width: 78, height: 57 }
    };

    const info = sizes[type];

    const obstacle = this.obstacles.create(
      WIDTH + 65,
      GROUND_Y - info.height / 2,
      type
    );

    obstacle.setDepth(4);
    obstacle.body.setAllowGravity(false);
    obstacle.setImmovable(true);

    obstacle.body.setSize(
      info.width * 0.72,
      info.height * 0.83
    );

    obstacle.setVelocityX(-this.speed);
  }

  spawnBanana() {
    const height = Phaser.Math.Between(85, 145);

    const banana = this.bananas.create(
      WIDTH + 45,
      GROUND_Y - height,
      'banana'
    );

    banana.setDepth(6);
    banana.body.setAllowGravity(false);
    banana.body.setSize(29, 25);
    banana.setVelocityX(-this.speed);

    banana.baseY = banana.y;
    banana.phase = Phaser.Math.FloatBetween(0, Math.PI * 2);
  }

  collectBanana(banana) {
    if (this.isGameOver || !banana.active) return;

    banana.destroy();

    this.bananasCollected++;
    this.score += 25;

    this.bananaText.setText(
      `BANANAS  ${this.bananasCollected}`
    );
  }

  update(time, delta) {
    if (this.isGameOver) return;

    const dt = Math.min(delta, 50);
    this.elapsed += dt;

    this.score += dt * 0.012;

    this.speed = Math.min(
      550,
      270 + this.score * 0.22
    );

    this.scoreText.setText(
      `DISTANCE  ${Math.floor(this.score)}`
    );

    // Parallax scenery
    for (const layer of this.scrollingLayers) {
      layer.sprite.tilePositionX +=
        this.speed * layer.factor * dt / 1000;
    }

    // Moving floor details
    for (const line of this.groundDetails) {
      line.x -= this.speed * dt / 1000;

      if (line.x < -45) {
        line.x += 990;
      }
    }

    // Character running animation
    const onGround =
      this.monkey.body.blocked.down ||
      this.monkey.body.touching.down;

    if (onGround) {
      this.monkey.setAngle(
        Math.sin(this.elapsed * 0.025) * 3
      );
    } else {
      this.monkey.setAngle(-10);
    }

    this.monkeyGlow.setAlpha(onGround ? 0.16 : 0.06);

    // Spawn obstacles
    if (time - this.lastObstacleTime > this.nextObstacleDelay) {
      this.spawnObstacle();
      this.lastObstacleTime = time;

      const minDelay = Math.max(
        1050,
        1450 - this.score * 0.16
      );

      this.nextObstacleDelay = Phaser.Math.Between(
        Math.floor(minDelay),
        Math.floor(minDelay + 550)
      );
    }

    // Spawn bananas
    if (time - this.lastBananaTime > this.nextBananaDelay) {
      this.spawnBanana();
      this.lastBananaTime = time;

      this.nextBananaDelay = Phaser.Math.Between(1600, 2600);
    }

    // Phaser 4-compatible group iteration
    for (const obstacle of [...this.obstacles.getChildren()]) {
      if (!obstacle || !obstacle.active) continue;

      obstacle.setVelocityX(-this.speed);

      if (obstacle.x < -100) {
        obstacle.destroy();
      }
    }

    for (const banana of [...this.bananas.getChildren()]) {
      if (!banana || !banana.active) continue;

      banana.setVelocityX(-this.speed);

      banana.setY(
        banana.baseY +
        Math.sin(this.elapsed * 0.006 + banana.phase) * 6
      );

      if (banana.x < -60) {
        banana.destroy();
      }
    }
  }

  endGame() {
    if (this.isGameOver) return;

    this.isGameOver = true;
    this.physics.pause();

    const finalScore = Math.floor(this.score);

    if (finalScore > this.bestScore) {
      this.bestScore = finalScore;

      try {
        localStorage.setItem(
          'alienMonkeyBest',
          String(finalScore)
        );
      } catch {
        // Game remains playable if storage is unavailable.
      }
    }

    this.bestText.setText(`BEST  ${this.bestScore}`);

    this.gameOverText.setText(
      `RUN ENDED\n\n` +
      `Distance: ${finalScore}\n` +
      `Bananas: ${this.bananasCollected}\n\n` +
      `SPACE / TAP TO RESTART`
    );

    this.gameOverPanel.setVisible(true);
    this.gameOverText.setVisible(true);
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: '#080e1d',

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
