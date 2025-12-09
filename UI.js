export class UI {
    constructor(game) {
        this.game = game;
     
        this.fontSize = 30; 
        this.fontFamily = 'Helvetica';
        this.livesImage = document.getElementById('lives'); 
    }
    
  
    draw(ctx) {
        ctx.save();
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 0;
        
     
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
        
   
        if (this.game.levelUpMessage) {
            ctx.save(); 
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = '50px Arial';
            ctx.fillText(this.game.levelUpMessage.text, this.game.width * 0.5, this.game.height * 0.4);
            ctx.restore(); 
        }
      

        ctx.restore();
    }
}
