
const xpThresholds = [
    0,      // Índice 0 (não utilizado)
    10,     // Para ir do Nível 1 para o 2
    50,     // Para ir do Nível 2 para o 3
    100,    // Para ir do Nível 3 para o 4
    200,    // Para ir do Nível 4 para o 5
  
];

export function checkLevelUp(game) {
    let levelUpOccurred = false;
    let message = null;


    while (true) {
        const nextLevelXP = xpThresholds[game.level];

   
        if (!nextLevelXP || game.score < nextLevelXP) {
            break; 
        }
        
     
        game.level++; 
        levelUpOccurred = true;
        message = `🎉 PARABÉNS! Você alcançou o Nível ${game.level}!`;
        console.log(message);
    }

    return levelUpOccurred ? message : null;
}

