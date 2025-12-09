export class UI {
    constructor(game) {
        this.game = game;
        // Estas propriedades (fontSize, fontFamily, livesImage) agora só são usadas para a tela de Game Over
        this.fontSize = 30; 
        this.fontFamily = 'Helvetica';
        this.livesImage = document.getElementById('lives'); 
    }
    
    // O método draw AGORA DEVE CUIDAR DA TELA DE GAME OVER E DA MENSAGEM DE NÍVEL
    draw(ctx) {
        ctx.save();
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 0;
        
        // game over screen
        if (this.game.gameOver) {
            ctx.textAlign = 'center';
            ctx.font = this.fontSize * 2 + 'px ' + this.fontFamily;
            ctx.fillStyle = this.game.fontColor;
            if (this.game.score > this.game.winningScore) {
                ctx.fillText('Boo-yah', this.game.width * 0.5, this.game.height * 0.5 - 20);
                ctx.font = this.fontSize * 0.7 + 'px ' + this.fontFamily;
                ctx.fillText('Com medo do que?', this.game.width * 0.5, this.game.height * 0.5 + 20);
            } else {
                ctx.fillText('GAME OVER', this.game.width * 0.5, this.game.height * 0.5 - 20);
                ctx.font = this.fontSize * 0.7 + 'px ' + this.fontFamily;
                ctx.fillText('Melhor sorte na próxima', this.game.width * 0.5, this.game.height * 0.5 + 20);
            }
        } 
        
        // --- ADIÇÃO CORRIGIDA: Lógica da mensagem de nível (Fora do bloco 'gameOver') ---
        // Isso garante que a mensagem apareça DURANTE o jogo, não apenas no Game Over.
        if (this.game.levelUpMessage) {
            ctx.save(); // Salva o estado do canvas para o estilo específico da mensagem
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = '50px Arial';
            // Desenha o texto da mensagem no meio da tela (corrigido para usar 'ctx')
            ctx.fillText(this.game.levelUpMessage.text, this.game.width * 0.5, this.game.height * 0.4);
            ctx.restore(); // Restaura o estado anterior do canvas
        }
        // --- FIM DA ADIÇÃO CORRIGIDA ---

        ctx.restore();
    }
}
