// level.js 

const xpThresholds = [
    0,      // Índice 0 (não utilizado)
    10,     // Para ir do Nível 1 para o 2
    50,     // Para ir do Nível 2 para o 3
    100,    // Para ir do Nível 3 para o 4
    200,    // Para ir do Nível 4 para o 5
    // ... adicione mais limites aqui
];

/**
 * Função central para verificar e subir de nível o jogador.
 * Usa um loop para garantir que todos os níveis sejam incrementados se houver XP suficiente.
 * @returns {string|null} A mensagem do ÚLTIMO nível atingido, ou null.
 */
export function checkLevelUp(game) {
    let levelUpOccurred = false;
    let message = null;

    // Loop que continua enquanto houver XP suficiente para o próximo nível
    while (true) {
        const nextLevelXP = xpThresholds[game.level];

        // Se não houver um próximo limite definido OU o score for insuficiente, pare o loop.
        if (!nextLevelXP || game.score < nextLevelXP) {
            break; 
        }
        
        // Se chegamos aqui, o jogador subiu de nível.
        game.level++; 
        levelUpOccurred = true;
        message = `🎉 PARABÉNS! Você alcançou o Nível ${game.level}!`;
        console.log(message);
    }

    return levelUpOccurred ? message : null;
}

