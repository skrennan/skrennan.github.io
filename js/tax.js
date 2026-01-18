class TaxEnemy extends Enemy {
    constructor(row) {
        super(row, 'tax');
        this.radius = 28;
        this.hoverOffset = 0;
        
        // Fase aleatória para bater as asas desencontrado de outros
        this.flapPhase = Math.random() * Math.PI * 2;
        
        // Partículas (Moedas caindo)
        this.coins = []; 
    }

    update() {
        super.update();
        
        // Flutuação Vertical (Senoide suave)
        this.hoverOffset = Math.sin(this.walkCycle * 0.4) * 12;
        
        // Velocidade do bater de asas
        this.flapPhase += 0.4;

        // Gerar moedinhas caindo (Dreno de dinheiro)
        // Chance baixa a cada frame
        if (Math.random() < 0.1) {
            this.coins.push({
                x: this.x + (Math.random() - 0.5) * 10,
                y: this.y + 10,
                vy: Math.random() * 2 + 1, // Velocidade de queda
                life: 1.0
            });
        }

        // Atualizar moedas
        for (let i = this.coins.length - 1; i >= 0; i--) {
            let c = this.coins[i];
            c.y += c.vy;
            c.life -= 0.03;
            if (c.life <= 0) this.coins.splice(i, 1);
        }
    }

    draw(ctx) {
        // 1. Desenha as moedas caindo (atrás do inimigo)
        this.drawCoins(ctx);

        // 2. Ajusta a posição da barra de vida para acompanhar o voo
        // Sobrescrevemos o draw padrão levemente para considerar o hoverOffset
        const pct = Math.max(0, this.hp / this.maxHp);
        const yBar = this.y - 45 + this.hoverOffset; 
        
        ctx.fillStyle = '#c0392b'; ctx.fillRect(this.x - 20, yBar, 40, 6);
        ctx.fillStyle = '#2ecc71'; ctx.fillRect(this.x - 20, yBar, 40 * pct, 6);

        // 3. Flash de Dano
        if (this.flash > 0) {
            ctx.save();
            ctx.translate(0, this.hoverOffset);
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2); ctx.fill();
            ctx.restore();
            return;
        }

        // 4. Desenha a Fatura Maligna
        this.drawEvilInvoice(ctx);
    }

    drawCoins(ctx) {
        ctx.fillStyle = '#f1c40f'; // Dourado
        this.coins.forEach(c => {
            ctx.globalAlpha = c.life;
            ctx.beginPath();
            ctx.arc(c.x, c.y, 2, 0, Math.PI*2); // Moedinha pequena
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;
    }

    drawEvilInvoice(ctx) {
        ctx.save();
        
        // Aplica o hover (voo)
        ctx.translate(this.x, this.y + this.hoverOffset);
        
        // Inclinação agressiva para frente
        ctx.rotate(-0.3);

        const flap = Math.sin(this.flapPhase); // Ciclo da asa (-1 a 1)
        
        // Escala X negativa se estiver indo para a direita (não é o caso aqui, mas bom ter)
        // Aqui usamos escala Y para bater a asa
        
        // --- ASAS (Estilo Nota de Dinheiro / Morcego) ---
        const drawWing = (side) => {
            ctx.save();
            ctx.scale(1, side * flap); // Inverte para asa de trás/frente e anima
            
            // Cor da asa (Verde Dinheiro Escuro)
            ctx.fillStyle = '#1e8449'; 
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(15, -40, 45, -20); // Ponta da asa
            ctx.quadraticCurveTo(25, -5, 5, 5);     // Base da asa
            ctx.fill();

            // Detalhes da nota (Linhas)
            ctx.strokeStyle = '#2ecc71'; // Verde Claro
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(5, -5); ctx.lineTo(35, -18);
            ctx.moveTo(8, 0); ctx.lineTo(30, -10);
            ctx.stroke();
            
            ctx.restore();
        };

        // Asa de Trás (Mais escura)
        ctx.globalBrightness = 0.7; // Pseudo-escurecimento
        ctx.fillStyle = '#145a32';
        drawWing(-1); // Asa "de baixo" visualmente quando flap está negativo

        // --- CORPO (O Papel da Fatura) ---
        ctx.rotate(0.1); // Leve ajuste
        
        // Papel
        ctx.fillStyle = '#ecf0f1';
        ctx.beginPath();
        // Envelope meio curvado pelo vento
        ctx.moveTo(-20, -15);
        ctx.lineTo(20, -15);
        ctx.lineTo(25, 15);
        ctx.lineTo(-15, 15);
        ctx.fill();

        // Borda do Papel
        ctx.strokeStyle = '#bdc3c7';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Linhas de Texto (A dívida)
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(-12, -8, 24, 3);
        ctx.fillRect(-12, -2, 18, 3);
        ctx.fillRect(-12, 4, 20, 3);

        // Selo "URGENTE" (Vermelho)
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.arc(12, 8, 7, 0, Math.PI*2);
        ctx.fill();
        
        // Simbolo $ no selo
        ctx.fillStyle = '#fff';
        ctx.font = "bold 10px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("!", 12, 9);

        // --- OLHOS MALIGNOS ---
        // Para dar personalidade
        ctx.fillStyle = '#e74c3c'; // Vermelho Neon
        ctx.beginPath();
        // Olho esquerdo
        ctx.arc(-8, -4, 3, 0, Math.PI*2);
        // Olho direito
        ctx.arc(2, -4, 3, 0, Math.PI*2);
        ctx.fill();
        
        // Brilho no olho
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-9, -5, 1, 0, Math.PI*2);
        ctx.arc(1, -5, 1, 0, Math.PI*2);
        ctx.fill();

        // Asa da Frente (Normal)
        drawWing(1);

        ctx.restore();
    }
}