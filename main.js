import {
    Player
} from './player.js';
import {
    InputHandler
} from './input.js';
import {
    Background
} from './background.js';
import {
    FlyingEnemy,
    ClimbingEnemy,
    GroundEnemy
} from './enemies.js';
import {
    UI
} from './UI.js';
import { checkLevelUp } from './level.js'; 

window.addEventListener('load', () => {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    // Você precisará ter um elemento <div id="level-message"> no seu HTML para isso funcionar.
    const levelMessageDisplay = document.getElementById('level-message'); 
    canvas.width = 900;
    canvas.height = 500;

    class Game {
        // ... (resto do constructor e métodos da classe Game) ...
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.groundMargin = 80;
            this.speed = 0;
            this.maxSpeed = 4;

            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.UI = new UI(this);

            this.enemies = [];
            this.particles = [];
            this.collisions = [];

            this.enemyTimer = 0;
            this.enemyInterval = 1000;

            this.maxParticles = 200;
            this.debug = false;
            this.fontColor = 'black';
            this.time = 0;
            this.winningScore = 25;
            //this.maxTime = 30000; // 30s
            this.gameOver = false;
            this.lives = 5;
            this.score = 0;
            this.level = 1;
            this.levelUpMessage = null;
            
            // áudio
            this.audio = {
                boom: document.getElementById('boom_sfx'),
                started: false,
                start() {
                    if (this.started || !this.boom) return;
                    this.started = true;
                    this.boom.play().then(() => {
                        this.boom.pause();
                        this.boom.currentTime = 0;
                    }).catch(() => {});
                },
                playBoom() {
                    if (!this.boom) return;
                    const sfx = this.boom.cloneNode();
                    sfx.volume = 0.9;
                    sfx.play().catch(() => {});
                }
            };
        }
        initializePlayerState() {
            this.player.currentState = this.player.states[0];
            this.player.currentState.enter();
        }
        update(deltaTime) {
            this.time += deltaTime;
            // if (this.time > this.maxTime) this.gameOver = true; 

            this.background.update();
            this.player.update(this.input.keys, deltaTime);

            if (this.enemyTimer > this.enemyInterval) {
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime;
            }

            this.enemies.forEach(e => e.update(deltaTime));
            this.particles.forEach(p => p.update(deltaTime));
            this.collisions.forEach(c => c.update(deltaTime));

            if (this.particles.length > this.maxParticles) {
                this.particles.length = this.maxParticles;
            }

            this.enemies = this.enemies.filter(e => !e.markedForDeletion);
            this.particles = this.particles.filter(p => !p.markedForDeletion);
            this.collisions = this.collisions.filter(c => !c.markedForDeletion);

            // Código do temporizador da mensagem visual no Canvas (se você usa UI.js para desenhar isso)
            if (this.levelUpMessage) {
                this.levelUpMessage.timer -= deltaTime;
                if (this.levelUpMessage.timer <= 0) {
                    this.levelUpMessage = null; 
                }
            }
        }
        draw(context) {
            this.background.draw(context);
            this.player.draw(context);
            this.enemies.forEach(e => e.draw(context));
            this.particles.forEach(p => p.draw(context));
            this.collisions.forEach(c => c.draw(context));
            this.UI.draw(context);
        }

        addEnemy() {
            if (this.speed > 0 && Math.random() < 0.5) this.enemies.push(new GroundEnemy(this));
            else if (this.speed > 0) this.enemies.push(new ClimbingEnemy(this));
            this.enemies.push(new FlyingEnemy(this));
        }

         addScore(points) {
            this.score += points;
            // Usando checkLevelUp do level.js
            const messageText = checkLevelUp(this); 
            if (messageText) {
                // Preenche a propriedade que a UI.js usa para desenhar no Canvas
                this.levelUpMessage = { text: messageText, timer: 3000 }; 

                // *** Adição para manipular o DOM se você quiser essa abordagem também ***
                if (levelMessageDisplay) {
                    levelMessageDisplay.textContent = messageText;
                    levelMessageDisplay.classList.add('visible');
                    // Remover a classe 'visible' após 3 segundos (sincronizado com o timer do canvas)
                    setTimeout(() => {
                         levelMessageDisplay.classList.remove('visible');
                         levelMessageDisplay.textContent = ''; // Limpa o texto do DOM
                    }, 3000);
                }
            }
        }
    }

    // A FUNÇÃO updateHUD ADICIONADA AQUI (Para manipular elementos HTML DOM)
    function updateHUD(score, time, lives, levelValue) {
        // Certifique-se que você tem esses IDs no seu HTML:
        const scoreElement = document.getElementById("score"); 
        const timeElement = document.getElementById("time");
        const levelElement = document.getElementById("level");
        
        const formattedTime = (time * 0.001).toFixed(1); 

        if (scoreElement) scoreElement.innerText = "Pontuação/XP: " + score;
        if (timeElement) timeElement.innerText = "Tempo: " + formattedTime;
        if (levelElement) levelElement.innerText = "Nível: " + levelValue;
        
        // Se você usa uma imagem de coração no HTML:
         
        const livesElement = document.getElementById("lives-container");
        if (livesElement) { livesElement.innerHTML = '<img src="./heart.png" class="heart">'.repeat(lives); }
    }

    const game = new Game(canvas.width, canvas.height);
    game.initializePlayerState();
    let lastTime = 0;

    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
         
        // Chamando a função updateHUD para sincronizar o DOM com o estado do jogo
        updateHUD(game.score, game.time, game.lives, game.level);

        if (!game.gameOver) requestAnimationFrame(animate);
    }
    animate(0);
});
