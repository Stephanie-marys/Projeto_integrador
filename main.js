// main.js

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
// Importa as configurações de dificuldade
import { difficultySettings } from './level.js'; 


// Variáveis globais para o loop de animação
let game;
let ctx;
let canvas;
let lastTime = 0;

class Game {
    constructor(width, height, difficulty = 'medium') {
        this.width = width;
        this.height = height;
        this.groundMargin = 80;

        // Aplica as configurações de dificuldade
        const settings = difficultySettings[difficulty] || difficultySettings.medium;
        this.speed = 0; 
        this.maxSpeed = settings.maxSpeed;
        this.enemyInterval = settings.enemyInterval;
        this.lives = settings.lives;
        this.maxTime = settings.maxTime; 

        // Inicialização dos componentes principais do jogo
        this.background = new Background(this);
        this.player = new Player(this);
        this.input = new InputHandler(this);
        this.UI = new UI(this); 

        // ... (resto do seu construtor, arrays, audio, etc.) ...
        this.enemies = [];
        this.particles = [];
        this.collisions = [];
        this.enemyTimer = 0;
        this.maxParticles = 200;
        this.debug = false; 
        this.score = 0;
        this.fontColor = 'black';
        this.time = 0;
        this.winningScore = 25;
        this.gameOver = false;
        
        // Configuração inicial do estado do player
        this.player.currentState = this.player.states;
        this.player.currentState.enter();
        // ... (resto do seu construtor de áudio) ...
    }

    // ... (Métodos update(), draw(), addEnemy() da classe Game) ...
    update(deltaTime) {
         this.time += deltaTime;
        if (this.time > this.maxTime) this.gameOver = true; 
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
}


// Função para atualizar o HUD (mantida aqui ou movida para UI.js)
function updateHUD(score, time, lives) {
    const scoreElement = document.getElementById("score");
    const timeElement = document.getElementById("time");
    const livesElement = document.getElementById("lives");

    const formattedTime = time.toFixed(1); 

    if (scoreElement) scoreElement.innerText = "Pontuação: " + score;
    if (timeElement) timeElement.innerText = "Tempo: " + formattedTime;
    
    if (livesElement) {
        livesElement.innerHTML = '<img src="./heart.png" class="heart">'.repeat(lives);
    }
}

// Loop de animação principal
function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    game.update(deltaTime);
    game.draw(ctx);
    
    updateHUD(game.score, (game.time * 0.001), game.lives);
    if (!game.gameOver) requestAnimationFrame(animate);
}

// ====================================================================
// Listener que inicia o jogo quando o evento 'gameStart' é disparado do level.js
// ====================================================================

window.addEventListener('gameStart', (event) => {
    const { difficulty, canvas: c, context: ct } = event.detail;
    canvas = c;
    ctx = ct;
    
    // Instancia o jogo com a dificuldade selecionada
    game = new Game(canvas.width, canvas.height, difficulty);
    
    // Inicia o loop de animação
    lastTime = 0;
    requestAnimationFrame(animate);
});
