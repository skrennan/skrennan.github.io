class StockEnemy extends Enemy {
    constructor(row) {
        super(row, 'stock');
        this.radius = 35;
        // Ajuste: Estoque é lento mas resistente
        this.jumpPhase = Math.random() * Math.PI * 2;
    }

    update() {
        super.update();
        // Atualiza o ciclo do pulo
        this.jumpPhase += 0.15;
    }

    draw(ctx) {
        // 1. Chama o pai para barra de vida e flash
        if (super.draw(ctx)) return;

        // 2. Desenha a Caixa
        this.drawHeavyBox(ctx);
    }

    drawHeavyBox(ctx) {
        ctx.save();
        
        const jumpY = Math.abs(Math.sin(this.jumpPhase)) * 15; // Pulo pesado
        
        // Efeito "Squash & Stretch" (Amassar e Esticar)
        // Quando está no alto (jumpY alto), estica verticalmente.
        // Quando está no chão (jumpY baixo), achata horizontalmente.
        let scaleX = 1 + (jumpY / 100); 
        let scaleY = 1 - (jumpY / 100);
        
        // Inverte quando bate no chão para "esparramar"
        if (jumpY < 2) {
            scaleX = 1.2;
            scaleY = 0.8;
        }

        ctx.translate(this.x, this.y + 10 - jumpY); // +10 para alinhar base
        ctx.scale(scaleX, scaleY);

        // Cores de Papelão
        const boxColor = '#d35400'; // Marrom escuro
        const boxFace = '#e67e22';  // Marrom claro
        const tapeColor = '#f39c12'; // Fita adesiva
        
        // --- DESENHO DA CAIXA ---

        // Sombra no chão (só desenha se estiver no ar)
        if (jumpY > 2) {
            ctx.save();
            ctx.scale(1/scaleX, 1/scaleY); // Remove a escala da caixa para a sombra
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.ellipse(0, 25 + jumpY, 25 - jumpY/2, 10 - jumpY/4, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.restore();
        }

        // Lado Esquerdo (Profundidade 3D)
        ctx.fillStyle = boxColor;
        ctx.beginPath();
        ctx.moveTo(-25, -25);
        ctx.lineTo(-25, 15);
        ctx.lineTo(-10, 25);
        ctx.lineTo(-10, -15);
        ctx.fill();

        // Frente da Caixa
        ctx.fillStyle = boxFace;
        ctx.fillRect(-10, -15, 35, 40);
        
        // Borda / Contorno
        ctx.strokeStyle = '#a04000';
        ctx.lineWidth = 2;
        ctx.strokeRect(-10, -15, 35, 40);

        // Fita Adesiva (No meio)
        ctx.fillStyle = tapeColor;
        ctx.fillRect(-10, -5, 35, 10);
        
        // Aba superior (Aberta balançando)
        ctx.fillStyle = boxColor;
        const flapAngle = Math.sin(this.jumpPhase * 2) * 0.5;
        
        ctx.save();
        ctx.translate(-10, -15);
        ctx.rotate(flapAngle - 0.5);
        ctx.fillRect(0, -15, 35, 15); // Aba
        ctx.restore();

        // Rosto (Opcional - Estilo "Caixa Viva")
        // Olhos
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(15, 0, 6, 0, Math.PI*2); ctx.fill();
        
        // Pupilas
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(15, 0, 2, 0, Math.PI*2); ctx.fill();

        ctx.restore();
    }
}