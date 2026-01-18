// js/Client.js

class ClientEnemy extends Enemy {
    constructor(row) {
        super(row, 'client');
        // Ajuste do raio de colisão para o tamanho do desenho
        this.radius = 40; 
    }

    draw(ctx) {
        // Chama o draw do pai para desenhar a barra de vida e checar flash de dano
        // Se retornar true (está piscando), paramos de desenhar.
        if (super.draw(ctx)) return; 

        // Desenha o boneco específico
        this.drawAngrySuitGuy(ctx);
    }

    drawAngrySuitGuy(ctx) {
        ctx.save();
        
        const cycle = this.walkCycle + this.walkOffset;
        
        // --- PALETA DE CORES DE ALTO CONTRASTE ---
        // Terno Cinza Claro (Silver) para destacar no fundo escuro
        const suitColor = '#bdc3c7';     
        // Cor mais escura para os membros de trás (profundidade)
        const suitDark = '#7f8c8d';      
        // Gravata vermelha vibrante
        const tieColor = '#c0392b';      
        // Pele amarela brilhante
        const skinColor = '#f6e58d';     
        
        // Física do Pulo (Bounce)
        const bounce = Math.cos(cycle * 2) * 3; 
        
        // Pontos Pivô
        const hipX = this.x;
        const hipY = this.y + bounce - 5;
        const shoulderY = hipY - 25;

        // Ângulos (Senoide para balanço)
        const legSwap = Math.sin(cycle); 
        const legAngleMax = 0.6; 
        
        const rightLegAngle = legSwap * legAngleMax;
        const leftLegAngle = -legSwap * legAngleMax;

        // Braços balançam ao contrário das pernas
        const rightArmAngle = -legSwap * 0.7;
        const leftArmAngle = legSwap * 0.7;

        // Configuração de Linha
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // --- HELPER PARA DESENHAR MEMBROS ---
        const drawLimb = (x, y, angle, length, thickness, color, hasFoot=false) => {
            ctx.lineWidth = thickness;
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            
            const endX = x + Math.sin(angle) * length;
            const endY = y + Math.cos(angle) * length;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            if(hasFoot) {
                ctx.beginPath();
                ctx.ellipse(endX, endY, thickness/1.5, thickness/2.5, 0, 0, Math.PI*2);
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(endX, endY, thickness/2.2, 0, Math.PI*2);
                ctx.fill();
            }
        };

        // 1. CAMADA DE TRÁS (Mais escuro para profundidade)
        drawLimb(hipX, hipY, leftLegAngle, 22, 10, suitDark, true); // Perna Esq
        drawLimb(hipX, shoulderY, leftArmAngle, 18, 9, suitDark);   // Braço Esq

        // 2. CORPO (Tronco)
        ctx.lineWidth = 20;
        ctx.strokeStyle = suitColor;
        ctx.beginPath();
        ctx.moveTo(hipX, hipY - 5);
        ctx.lineTo(hipX, shoulderY);
        ctx.stroke();

        // 3. GRAVATA
        ctx.fillStyle = tieColor;
        ctx.beginPath();
        ctx.moveTo(hipX, shoulderY - 5);
        ctx.lineTo(hipX - 4, shoulderY + 8);
        ctx.lineTo(hipX + 4, shoulderY + 8);
        ctx.closePath();
        ctx.fill();

        // 4. CABEÇA
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(hipX, shoulderY - 12, 11, 0, Math.PI * 2);
        ctx.fill();

        // 5. ROSTO BRAVO
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        // Sobrancelhas
        ctx.moveTo(hipX - 6, shoulderY - 16); ctx.lineTo(hipX - 1, shoulderY - 13);
        ctx.moveTo(hipX + 6, shoulderY - 16); ctx.lineTo(hipX + 1, shoulderY - 13);
        // Boca
        ctx.moveTo(hipX - 4, shoulderY - 8); ctx.lineTo(hipX + 4, shoulderY - 8);
        ctx.stroke();

        // 6. CAMADA DA FRENTE (Cor normal)
        drawLimb(hipX, hipY, rightLegAngle, 22, 10, suitColor, true); // Perna Dir
        drawLimb(hipX, shoulderY, rightArmAngle, 18, 9, suitColor);   // Braço Dir

        ctx.restore();
    }
}