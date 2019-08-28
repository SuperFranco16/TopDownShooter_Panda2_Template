game.module(
	'game.main'
)
.body(function() {
	game.addAsset('bg.jpg');
	game.addAsset('player.png');
	game.addAsset('player_bullet.png');
	game.addAsset('Enemy.png');
	game.addAsset('explosion.png');
	game.createScene('Main', {
		init: function() {
			var ths = this;
			this.world = new game.Physics(0, 0);
			this.container = new game.Container();
			this.container.addTo(this.stage);
			//BackGround
			this.bg = new game.Sprite('bg.jpg').addTo(this.container);
			//Player
			this.player = new game.Player(200, 300);
			//Enemy
			game.Timer.add(1500, function() {
				new game.Enemy(Math.floor(game.scene.player.body.position.x + 
                                          (Math.random(Math.random(-1000, -600),Math.random(600, 1000)))), game.scene.player.body.position.y + 
                                          (Math.random(-800, 800)));
            }, true);
            
			// Left wall
			new game.Wall(0, 810, 30, 1650);
			// Right wall
			new game.Wall(2060, 810, 30, 1650);
			// Top wall
			new game.Wall(1030, 0, 2060, 30);
			// Bottom wall
			new game.Wall(1030, 1640, 2060, 30);
			
            //BackScreen
			this.blackscreen = new game.Graphics();
			this.blackscreen.fillColor = '#000000';
			this.blackscreen.alpha = 0;
			this.blackscreen.drawRect(0, 0, game.width, game.height);
			
            //Score, When you kill the enemy, you get 10 score.
			this.score = 0;
			this.scoretxt = new game.SystemText('Score : ' + this.score);
			this.scoretxt.size = 36;
			this.scoretxt.color = '#fdfdfd';
			this.scoretxt.position.set(16, 0);
			this.scoretxt.addTo(this.stage);
			
            //How To Play
            new game.Dialogue(16, 50, '-Press WASD to move');
			new game.Dialogue(16, 80, '-Press P Pause the Game');
			new game.Dialogue(16, 110, '-Mouse to aim and shoot');      
      
      
            //Camera Follow Player
			this.camera = new game.Camera(this.player.sprite);
			this.camera.position.set(this.player.sprite);
			this.camera.limit.x = 0;
			this.camera.limit.y = 0;
			this.camera.limit.width = game.width - 500;
			this.camera.limit.height = game.height + 200;
            this.camera.acceleration = 20;
			this.camera.addTo(this.container);
		},
		keydown: function(key) {
			if (key === 'P') {
				if (this.paused) {
					this.resume();
					this.blackscreen.remove();
				} else {
					this.pause();
					this.blackscreen.addTo(this.stage);
					this.blackscreen.alpha = 0.5;
				}
			}
		},
		update: function() {}
	});
	game.createClass('Player', {
		selectTime: true,
		speed: 400,
		init: function(x, y) {
			var ths = this;
			this.sprite = new game.Sprite('player.png');
			this.sprite.anchorCenter();
			this.sprite.position.set(x, y);
			this.sprite.addTo(game.scene.container);
			this.body = new game.Body();
			this.body.collisionGroup = game.Body.PLAYER;
			this.body.collideAgainst = [game.Body.WALL, game.Body.ENEMY];
			this.body.position.set(x, y);
			var shape = new game.Rectangle(this.sprite.width / 2.5, this.sprite.height / 2.5);
			this.body.addShape(shape);
			this.body.addTo(game.scene.world);
			this.body.collide = this.collide.bind(this);
			this.worldPosition = new game.Vector();
		},
		play: function(anim) {
			if (this.sprite.currentAnim === this.sprite.anims[anim]) return;
			this.sprite.play(anim);
		},
		collide: function(body) {
			if (body.collisionGroup === game.Body.ENEMY) {
				return false;
			}
			return true;
		},
		shoot: function() {
			var bullet = new game.playerbullet('player_bullet.png', 0, 0, this.sprite.position.x, this.sprite.position.y);
			bullet.addTo(game.scene.container);
			var angle = game.input.mouse.angle(this.worldPosition);
			bullet.rotation = angle - Math.PI / 2;
			bullet.body.velocity.x = 2000 * Math.cos(angle - Math.PI);
			bullet.body.velocity.y = 2000 * Math.sin(angle - Math.PI);
			this.sprite.swap(bullet);
		},
		reset: function(speed) {
			var ths = this;
			this.selectTime = false;
			if (!this.selectTime) {
				game.Timer.add(speed, function() {
					ths.selectTime = true;
				});
			}
		},
		update: function() {
			if (game.scene.isMouseDown && this.selectTime) {
				this.shoot();
				this.reset(300);
			}
			this.worldPosition.copy(this.sprite.position);
			this.worldPosition.subtract(game.scene.camera.position);
			var angle = game.input.mouse.angle(this.worldPosition);
			this.sprite.rotation = angle - Math.PI / 2;
			if (game.keyboard.down('A')) {
				this.body.velocity.x = -this.speed;
			} else if (game.keyboard.down('D')) {
				this.body.velocity.x = this.speed;
			} else {
				this.body.velocity.x = 0;
			}
			// Set y velocity based on up and down keys
			if (game.keyboard.down('W')) this.body.velocity.y = -this.speed;
			else if (game.keyboard.down('S')) this.body.velocity.y = this.speed;
			else this.body.velocity.y = 0;
			/*
			  this.sprite.rotation= this.sprite.position.angle(game.scene.circle2.position);
			*/
			this.sprite.position.x = this.body.position.x;
			this.sprite.position.y = this.body.position.y;
		}
	});
	game.createClass('Enemy', {
		immortal: false,
		alive: true,
		health: 3,
		speed: 400,
		selectTime: true,
		init: function(x, y) {
			var ths = this;
			// Play animation
			this.sprite = new game.Sprite('Enemy.png');
			this.sprite.anchorCenter();
			this.sprite.position.set(x, y);
			this.sprite.addTo(game.scene.container);
			this.body = new game.Body();
			this.body.collisionGroup = game.Body.ENEMY;
			this.body.collideAgainst = [game.Body.PLAYER, game.Body.PLAYERBULLET];
			this.body.position.set(x, y);
			var shape = new game.Rectangle(this.sprite.width / 2, this.sprite.height / 2);
			this.body.addShape(shape);
			this.body.addTo(game.scene.world);
			this.body.collide = this.collide.bind(this);
			this.removeTimer = game.Timer.add(8000, this.remove.bind(this));
		},
		play: function(anim) {
			if (this.sprite.currentAnim === this.sprite.anims[anim]) return;
			this.sprite.play(anim);
		},
		collide: function(body) {
			if (body.collisionGroup === game.Body.PLAYERBULLET) {
				this.hurt();
				return false;
			}
			return true;
		},
		hurt: function() {
			var ths = this;
			if (this.immortal == false) {
				this.immortal = true;
				this.health--;
				var ths = this;
				this.sprite.tint = '#ffffff';
				game.Timer.add(100, function() {
					ths.sprite.tint = '';
					ths.immortal = false;
				});
			}
		},
		remove: function() {
			this.body.remove();
			this.sprite.remove();
			game.scene.removeObject(this);
		},
		dead: function() {
			var ths = this;
			if (this.health <= 0) {
				if (this.alive) {
					this.alive = false;
					game.scene.score = game.scene.score + 10;
					game.scene.scoretxt.text = 'Score : ' + game.scene.score;
					var explosion = new game.Explosion(this.body.position.x, this.body.position.y);
					explosion.sprite.addTo(game.scene.container);
					this.remove();
				}
			}
		},
		reset: function(speed) {
			var ths = this;
			this.selectTime = false;
			if (!this.selectTime) {
				game.Timer.add(speed, function() {
					ths.selectTime = true;
				});
			}
		},
		update: function() {
			this.dead();
			this.sprite.rotation = this.body.position.angle(game.scene.player.body.position) + .1;
			var e = this.sprite.position.angle(game.scene.player.sprite.position);
			this.body.velocity.x = Math.cos(e) * 300, this.body.velocity.y = Math.sin(e) * 300;
			this.sprite.position.x = this.body.position.x;
			this.sprite.position.y = this.body.position.y;
		}
	});
	game.createClass('playerbullet', 'PhysicsSprite', {
		// How fast playerbullet moves (pixels in second)
		init: function(texture, width, height, x, y) {
			this.anchorCenter();
			this.body.position.set(x, y);
			this.body.collisionGroup = game.Body.PLAYERBULLET;
			this.body.collideAgainst = [game.Body.ENEMY];
		},
		collide: function(body) {
			this.remove();
		},
		remove: function() {
			// Extend remove function to also remove object from scene
			// So it's update function doesn't get called anymore
			this.super();
			game.scene.removeObject(this);
		},
		update: function() {
			// Remove playerbullet if out of screen
			if (!this.onScreen()) this.remove();
		}
	});
	game.createClass('Explosion', {
		init: function(x, y) {
            var ths = this;
			this.sheet = new game.SpriteSheet('explosion.png', 256, 256);
			this.sprite = new game.Animation(this.sheet.textures);
			this.sprite.addAnim('doexplode', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], {
				speed: 30,
				loop: false
			});
            
            //Explosion animation completed, the boom will be destroyed 
            this.sprite.anims.doexplode.onComplete = function() {
		    ths.sprite.remove();
            ths.body.remove();
			game.scene.stage.removeChild(ths);
            };
            
			this.sprite.anchorCenter();
			this.sprite.position.set(x, y);
			this.sprite.play('doexplode');
			this.body = new game.Body();
			this.body.mass = 0;
			this.body.position.set(x, y);
			var shape = new game.Rectangle(this.sheet.width, this.sheet.height);
			this.body.addShape(shape);
			this.body.addTo(game.scene.world);
			this.body.collide = this.collide.bind(this);
		},
		play: function(anim) {
			if (this.sprite.currentAnim === this.sprite.anims[anim]) return;
			this.sprite.play(anim);
		},
		collide: function(body) {
			if (this.hurtplayer && body.collisionGroup === game.Body.PLAYER) {
				game.scene.player.hurt();
			}
			return true;
		}
	});
	game.createClass('Wall', {
		init: function(x, y, width, height) {
			this.body = new game.Body();
			var shape = new game.Rectangle();
			shape.width = width;
			shape.height = height;
			this.body.position.x = x;
			this.body.position.y = y;
			this.body.addShape(shape);
			this.body.static = true;
			this.body.addTo(game.scene.world);
		}
	});
	game.createClass('Dialogue', {
		init: function(x, y, txt) {
			this.text = new game.SystemText(txt);
			this.text.size = 25;
			this.text.color = '#fdfdfd';
			this.text.position.set(x, y);
			this.text.addTo(game.scene.stage);
		}
	});
	// Attributes for different body types
	game.addAttributes('Body', {
		WALL: 0,
		PLAYER: 1,
		PLAYERBULLET: 2,
		ENEMY: 3,
		ENEMYBULLET: 4
	});
});
