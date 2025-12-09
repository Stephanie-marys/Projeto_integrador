// level.js

// Configurações de dificuldade exportadas
export const difficultySettings = {
    easy: {
        maxSpeed: 2,
        enemyInterval: 1500,
        lives: 10,
        maxTime: 60000 
    },
    medium: {
        maxSpeed: 4, 
        enemyInterval: 1000,
        lives: 5,
        maxTime: 30000
    },
    hard: {
        maxSpeed: 6,
        enemyInterval: 500,
        lives: 3,
        maxTime: 15000 
    }
};

// Função que inicia o jogo. Ela será adicionada ao escopo global para o HTML onclick.
function startGame(difficulty) {
    // Esconde a seleção de dificuldade e mostra o canvas e o dashboard
    document.getElementById('difficulty-selection').style.display = 'none';
    document.getElementById('canvas1').style.display = 'block';
    document.getElementById('game-dashboard').style.display = 'flex'; 

    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1000; 
    canvas.height = 500;

    // Dispara um evento personalizado para notificar o main.js que é hora de iniciar o jogo.
    const event = new CustomEvent('gameStart', { 
        detail: { 
            difficulty: difficulty,
            canvas: canvas,
            context: ctx
        } 
    });
    window.dispatchEvent(event);
}

// Torna a função startGame acessível globalmente (para o HTML onclick="startGame(...)")
window.startGame = startGame;

