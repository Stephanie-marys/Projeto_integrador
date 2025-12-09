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

// Move a definição da classe Game para fora do listener de 'load' 
// ou para antes de ser instanciada pela primeira vez.
class Game {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.groundMargin = 80;
        this.speed = 0; // Velocidade de rolagem do cenário
        this.maxSpeed = 4;

        // Inicialização dos componentes principais do jogo
        this.background = new Background(this);
        this.player = new Player(this);
        this.input = new InputHandler(this);
        // Instancia a UI AQUI dentro da classe Game. 
        // A outra instância fora do loop principal será removida.
        this.UI = new UI(this); 

        // Arrays para gerenciar objetos dinâmicos
        this.enemies = [];
        this.particles = [];
        this.collisions = []; // Efeitos visuais de colisão

        // Lógica de spawn de inimigos
        this.enemyTimer = 0;
        this.enemyInterval = 1000; // A cada 1 segundo

        this.maxParticles = 200;
        this.debug = false; // Ativa/desativa o modo debug (geralmente com a tecla F)
        this.score = 0;
        this.fontColor = 'black';
        this.time = 0;
        this.winningScore = 25;
        this.gameOver = false;
        this.lives = 5;

        // Configuração inicial do estado do player
        this.player.currentState = this.player.states[0];
        this.player.currentState.enter();

        // Configuração de áudio (pré-carregamento e reprodução)
        this.audio = {
            boom: document.getElementById('boom_sfx'),
            started: false,
            start() {
                // Tenta dar play e pausar rapidamente para inicializar o contexto de áudio
                if (this.started || !this.boom) return;
                this.started = true;
                this.boom.play().then(() => {
                    this.boom.pause();
                    this.boom.currentTime = 0;
                }).catch(() => {});
            },
            playBoom() {
                // Clona o som para permitir múltiplas reproduções simultâneas
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
        // Verifica se o tempo limite foi atingido para encerrar o jogo
        if (this.time > this.maxTime) this.gameOver = true; 

        // Atualiza a lógica de todos os elementos do jogo
        this.background.update();
        // Passa as teclas pressionadas e o delta time para o player
        this.player.update(this.input.keys, deltaTime); 

        // Lógica de spawn de inimigos baseada em tempo
        if (this.enemyTimer > this.enemyInterval) {
            this.addEnemy();
            this.enemyTimer = 0;
        } else {
            this.enemyTimer += deltaTime;
        }
        
        // Atualiza inimigos, partículas e colisões
        this.enemies.forEach(e => e.update(deltaTime));
        this.particles.forEach(p => p.update(deltaTime));
        this.collisions.forEach(c => c.update(deltaTime));

        // Limita o número de partículas para otimização
        if (this.particles.length > this.maxParticles) {
            this.particles.length = this.maxParticles;
        }

        // Remove objetos marcados para exclusão (otimização de memória)
        this.enemies = this.enemies.filter(e => !e.markedForDeletion);
        this.particles = this.particles.filter(p => !p.markedForDeletion);
        this.collisions = this.collisions.filter(c => !c.markedForDeletion);
    }

    // Método de desenho chamado a cada frame
    draw(context) {
        // Desenha todos os elementos na ordem correta (background -> player -> inimigos -> etc.)
        this.background.draw(context);
        this.player.draw(context);
        this.enemies.forEach(e => e.draw(context));
        this.particles.forEach(p => p.draw(context));
        this.collisions.forEach(c => c.draw(context));
        // Desenha a interface do usuário por último para garantir que fique por cima de tudo
        this.UI.draw(context);
    }

    // Adiciona um novo inimigo de forma procedural
    addEnemy() {
        // Lógica para decidir qual tipo de inimigo adicionar com base na velocidade atual e aleatoriedade
        if (this.speed > 0 && Math.random() < 0.5) this.enemies.push(new GroundEnemy(this));
        else if (this.speed > 0) this.enemies.push(new ClimbingEnemy(this));
        this.enemies.push(new FlyingEnemy(this)); // Sempre adiciona um voador
    }
}


// Função para atualizar os elementos HTML (DOM) da interface
function updateHUD(score, time, lives) {
    // Estas IDs (score, time, lives) devem existir no seu arquivo index.html
    const scoreElement = document.getElementById("score");
    const timeElement = document.getElementById("time");
    const livesElement = document.getElementById("lives");
    // >>> Adicione este console.log para depurar <<<
    console.log("Elemento #lives encontrado:", livesElement); 
    console.log("Valor de 'lives':", lives);
    // Formata o tempo para uma casa decimal, como na sua imagem
    const formattedTime = time.toFixed(1); 

    if (scoreElement) scoreElement.innerText = "Pontuação: " + score;
    if (timeElement) timeElement.innerText = "Tempo: " + formattedTime;
    
    // Move a função aninhada para fora ou garante que seja chamada:

    // function updateLives(lives) {
    //     document.getElementById("lives").innerHTML =
    //         '<img src="./heart.png" class="heart">'.repeat(lives);
    // }

    // Chamada da função para renderizar as vidas, ou use o código diretamente:
    if (livesElement) {
        livesElement.innerHTML = '<img src="./heart.png" class="heart">'.repeat(lives);
    }else {
        // Se o elemento não for encontrado, isso aparecerá no console
        console.error("Erro: Elemento com ID 'lives' não foi encontrado no HTML!");
    }
}


// Evento que garante que todos os assets da página foram carregados antes de iniciar o jogo
window.addEventListener('load', () => {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1000;
    canvas.height = 500;

    // Instancia o objeto principal do jogo APENAS AQUI
    const game = new Game(canvas.width, canvas.height);
    // Remove a linha 'const ui = new UI(game);' daqui, pois já está no constructor do Game.

    let lastTime = 0; // Armazena o timestamp do frame anterior

    // Função principal do loop de animação do jogo
    function animate(timeStamp) {
        // Calcula o tempo decorrido desde o último frame (deltaTime)
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        
        // Limpa a tela antes de desenhar o próximo frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Atualiza e desenha o estado do jogo
        game.update(deltaTime);
        game.draw(ctx);
        
        updateHUD(game.score, (game.time * 0.001), game.lives);
        // Continua o loop se o jogo não tiver acabado
        if (!game.gameOver) requestAnimationFrame(animate);
    }
   
    // Inicia o loop de animação passando o timestamp inicial (0)
    animate(0);
});
