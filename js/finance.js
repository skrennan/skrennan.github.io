class FinanceEnemy extends Enemy {
    constructor(row) {
        super(row, 'finance');
        this.radius = 30;
        
        // Variáveis de animação
        this.legCycle = 0;
        this.lcdBlinkTimer = 0;
        this.displayState = 0; // 0 = ERR, 1 = -$-
    }

    update() {
        super.update();
        
        // Animação das pernas (rápida, estilo inseto)
        this.legCycle += 0.3 * (this.speed > 0 ? this.speed : 1);

        // Piscar o display LCD
        this.lcdBlinkTimer++;
        if (this.lcdBlinkTimer > 30) {
            this.displayState = !this.displayState;
            this.lcdBlinkTimer = 0;
        }
    }

    draw(ctx) {
        // 1. Chama o pai para barra de vida
        if (super.draw(ctx)) return;

        // 2. Desenha a Calculadora Aranha
        this.drawSpiderCalculator(ctx);
    }

    drawSpiderCalculator(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Cores
        const bodyColor = '#2c3e50'; // Cinza Escuro
        const btnColor = '#7f8c8d';  // Teclas Cinza
        const accentBtn = '#c0392b'; // Tecla C/OFF Vermelha
        const lcdOn = '#e74c3c';     // Tela Vermelha (Erro/Mal)
        const lcdOff = '#732d2d';    // Tela Escura

        // --- PERNAS DE ARANHA (Bobina de Papel / Metal) ---
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#95a5a6'; // Cinza claro (metal)
        ctx.lineWidth = 3;

        // Função para desenhar par de pernas
        const drawLegs = (offset, phase) => {
            const angle = Math.sin(this.legCycle + phase) * 0.5;
            const length = 25;
            
            // Perna Esquerda (Trás)
            ctx.beginPath();
            ctx.moveTo(-10, offset); 
            ctx.lineTo(-20, offset - 10); // Joelho
            ctx.lineTo(-25 + Math.sin(angle)*10, offset + 15); // Pé
            ctx.stroke();

            // Perna Direita (Frente)
            ctx.beginPath();
            ctx.moveTo(10, offset);
            ctx.lineTo(20, offset - 10);
            ctx.lineTo(25 + Math.sin(-angle)*10, offset + 15);
            ctx.stroke();
        };

        // 4 Pares de pernas
        drawLegs(10, 0);
        drawLegs(5, Math.PI/2);
        drawLegs(-5, Math.PI);
        drawLegs(-10, Math.PI*1.5);

        // --- CORPO DA CALCULADORA ---
        // Sombra leve flutuando nas pernas
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath(); ctx.ellipse(0, 25, 15, 5, 0, 0, Math.PI*2); ctx.fill();

        // Corpo Principal
        ctx.fillStyle = bodyColor;
        // Desenha retângulo arredondado manualmente
        ctx.beginPath();
        ctx.roundRect(-18, -25, 36, 45, 6);
        ctx.fill();
        
        // Borda 3D
        ctx.strokeStyle = '#1a252f';
        ctx.lineWidth = 2;
        ctx.stroke();

        // --- DISPLAY LCD ---
        ctx.fillStyle = this.displayState ? lcdOn : lcdOff;
        ctx.fillRect(-14, -20, 28, 12);
        
        // Texto no Display (Brilho)
        if (this.displayState) {
            ctx.shadowColor = '#e74c3c';
            ctx.shadowBlur = 5;
            ctx.fillStyle = '#fff';
            ctx.font = "bold 10px 'Courier New', monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("ERR", 0, -14);
            ctx.shadowBlur = 0;
        }

        // --- TECLADO ---
        // Grade de botões
        ctx.fillStyle = btnColor;
        const startY = -2;
        const gap = 8;
        
        // Linha 1
        ctx.fillRect(-12, startY, 6, 4);
        ctx.fillRect(-2, startY, 6, 4);
        ctx.fillStyle = accentBtn; // Botão vermelho
        ctx.fillRect(8, startY, 6, 4);

        // Linha 2
        ctx.fillStyle = btnColor;
        ctx.fillRect(-12, startY + gap, 6, 4);
        ctx.fillRect(-2, startY + gap, 6, 4);
        ctx.fillRect(8, startY + gap, 6, 4);

        // Linha 3
        ctx.fillRect(-12, startY + gap*2, 6, 4);
        ctx.fillRect(-2, startY + gap*2, 6, 4);
        ctx.fillRect(8, startY + gap*2, 6, 4);

        // Olhos Malignos (Em cima do display, opcionais, para dar vida)
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(-8, -28, 4, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(8, -28, 4, 0, Math.PI*2); ctx.fill();
        
        ctx.fillStyle = '#000'; // Pupilas
        ctx.beginPath(); ctx.arc(-8, -28, 1.5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(8, -28, 1.5, 0, Math.PI*2); ctx.fill();

        // Sobrancelha de Aranha
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-12, -32); ctx.lineTo(-4, -29);
        ctx.moveTo(12, -32); ctx.lineTo(4, -29);
        ctx.stroke();

        ctx.restore();
    }
}