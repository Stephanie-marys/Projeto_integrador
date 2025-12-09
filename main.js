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


// Variáveis globais para o loop de animação e assets
let game;
let ctx;
let canvas;
let lastTime = 0;
let assetsLoaded = false; // Flag para verificar se os assets carregaram

// Array de IDs dos assets de imagem que devem ser carregados
// Certifique-se que esses IDs batem com os IDs no seu index.html
const assetIds = ['player', 'layer1', 'layer2', 'layer3', 'layer4', 'layer5', 'enemy_fly', 'enemy_plant', 'enemy_spider', 'fire', 'collisionAnimation', 'heart-asset'];


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

        // Arrays para gerenciar objetos dinâmicos
        this.enemies = [];
        this.particles = [];
        this.collisions = [];

        // Lógica de spawn de inimigos
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

        // Configuração de áudio (pré-carregamento e reprodução)
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

    // Método de atualização chamado a cada frame
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
    
    // Método de desenho chamado a cada frame
    draw(context) {
        // Apenas desenhe se os assets já tiverem sido carregados
        if (assetsLoaded) { 
            this.background.draw(context);
            this.player.draw(context);
            this.enemies.forEach(e => e.draw(context));
            this.particles.forEach(p => p.draw(context));
            this.collisions.forEach(c => c.draw(context));
            this.UI.draw(context);
        }
    }

    // Adiciona um novo inimigo de forma procedural
    addEnemy() {
        if (this.speed > 0 && Math.random() < 0.5) this.enemies.push(new GroundEnemy(this));
        else if (this.speed > 0) this.enemies.push(new ClimbingEnemy(this));
        this.enemies.push(new FlyingEnemy(this));
    }
}


// Função para atualizar os elementos HTML (DOM) da interface
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
// Gerenciamento de Inicialização e Assets
// ====================================================================

// Função para carregar assets
function loadAssets(callback) {
    let loadedCount = 0;
    assetIds.forEach(id => {
        const img = document.getElementById(id);
        // Verifica se a imagem já está no cache ou se precisa carregar
        if (img.complete) {
            loadedCount++;
        } else {
            img.onload = () => {
                loadedCount++;
                if (loadedCount === assetIds.length) {
                    callback(); // Chama o callback quando tudo carregar
                }
            };
            img.onerror = () => {
                console.error(`Falha ao carregar asset: ${id}`);
                loadedCount++; 
                if (loadedCount === assetIds.length) {
                    callback();
                }
            };
        }
    });

    // Caso todos os assets já estivessem completos antes mesmo de adicionar listeners
    if (loadedCount === assetIds.length) {
        callback();
    }
}

// Listener que inicia o jogo quando o evento 'gameStart' é disparado do level.js
window.addEventListener('gameStart', (event) => {
    const { difficulty, canvas: c, context: ct } = event.detail;
    canvas = c;
    ctx = ct;
    
    // Espera os assets carregarem antes de instanciar o jogo e iniciar o loop
    loadAssets(() => {
        assetsLoaded = true; // Define a flag como true
        console.log("Todos os assets carregados. Iniciando o jogo...");

        // Instancia o jogo com a dificuldade selecionada
        game = new Game(canvas.width, canvas.height, difficulty);
        
        // Inicia o loop de animação
        lastTime = 0;
        requestAnimationFrame(animate);
    });
});

