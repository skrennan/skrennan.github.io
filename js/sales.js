class SalesEnemy extends Enemy {
    constructor(row) {
        super(row, 'sales');
        this.radius = 32;
        
        // Variaveis de animação
        this.wobblePhase = Math.random() * Math.PI * 2;
        this.particles = []; // Rastro de fumaça
    }

    update() {
        super.update();
        
        // Aumenta o tremor (wobble) rápido para parecer instável
        this.wobblePhase += 0.3;

        // --- SISTEMA DE PARTÍCULAS (FUMAÇA) ---
        // Adiciona fumaça saindo da "traseira" da seta
        if (Math.random() < 0.4) {
            this.particles.push({
                x: this.x + 20, // Nas costas da seta
                y: this.y - 10,
                vx: (Math.random()) * 2, // Vai pra direita (fica pra trás)
                vy: (Math.random() - 0.5) * 1,
                size: Math.random() * 5 + 3,
                life: 1.0,
                color: Math.random() < 0.5 ? '#7f8c8d' : '#95a5a6' // Cinzas variados
            });
        }

        // Atualiza partículas
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.04; // Desaparece
            p.size += 0.1;  // Expande
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    draw(ctx) {
        // 1. Desenha o Rastro de Fumaça (Atrás de tudo)
        this.drawSmoke(ctx);

        // 2. Chama o pai para desenhar a barra de vida
        // (Ajustamos para desenhar o flash de dano corretamente)
        if (super.draw(ctx)) return;

        // 3. Desenha a Seta de Queda
        this.drawCrashArrow(ctx);
    }

    drawSmoke(ctx) {
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life * 0.6;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;
    }

    drawCrashArrow(ctx) {
        ctx.save();
        
        // Aplica o tremor (Wobble) na posição Y e Rotação
        const shake = Math.sin(this.wobblePhase) * 2;
        ctx.translate(this.x, this.y + shake);

        // Rotação: Apontando para Baixo/Esquerda (Queda)
        // + um pouco de rotação extra baseada no tremor
        const angle = (Math.PI / 1.2) + Math.sin(this.wobblePhase*0.5)*0.1;
        ctx.rotate(angle);

        // Cores (Laranja Crise)
        const faceColor = '#e67e22'; // Laranja
        const sideColor = '#d35400'; // Laranja Escuro (3D)
        const outline = '#ffffff';   // Borda Branca para contraste

        // Escala pulsante (Panic Pulse)
        const scale = 1 + Math.sin(this.wobblePhase) * 0.05;
        ctx.scale(scale, scale);

        // --- DESENHO DA SETA 3D ---
        
        // 1. Lateral 3D (Sombra)
        ctx.fillStyle = sideColor;
        ctx.beginPath();
        ctx.moveTo(-15, -15);
        ctx.lineTo(15, -15);
        ctx.lineTo(25, 0);   // Ponta lateral
        ctx.lineTo(10, 35);  // Bico lateral
        ctx.lineTo(0, 30);   
        ctx.fill();

        // 2. Face Principal
        ctx.fillStyle = faceColor;
        ctx.beginPath();
        // Corpo da seta
        ctx.moveTo(-20, -20);
        ctx.lineTo(10, -20);
        ctx.lineTo(10, -5);
        // Cabeça da seta
        ctx.lineTo(25, -5);
        ctx.lineTo(-5, 30); // A Ponta
        ctx.lineTo(-5, 30);
        ctx.lineTo(-35, -5);
        ctx.lineTo(-20, -5);
        ctx.closePath();
        ctx.fill();

        // Borda Branca (Para destacar no fundo escuro)
        ctx.strokeStyle = outline;
        ctx.lineWidth = 2;
        ctx.stroke();

        // --- ROSTO (PÂNICO) ---
        // Desfaz rotação levemente para os olhos ficarem legíveis
        ctx.rotate(Math.PI / 2); 
        
        // Olhos
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(-8, -8, 7, 0, Math.PI*2); ctx.fill(); // Esq
        ctx.beginPath(); ctx.arc(8, -8, 6, 0, Math.PI*2); ctx.fill();  // Dir
        
        // Pupilas (Pequenas = Medo/Foco)
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(-8, -8, 2, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(8, -8, 2, 0, Math.PI*2); ctx.fill();

        // Sobrancelhas franzidas (Queda rápida)
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-12, -14); ctx.lineTo(-4, -10);
        ctx.moveTo(12, -14); ctx.lineTo(4, -10);
        ctx.stroke();

        // Boca (Gritando/Tremendo)
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(0, 2, 3, 5, 0, 0, Math.PI*2);
        ctx.fill();

        ctx.restore();
    }
}