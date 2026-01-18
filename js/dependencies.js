// js/dependencies.js

const TILE_SIZE = 90;
const COLS = 9;
const ROWS = 5;
const WIDTH = 810;
const HEIGHT = 630;

const COLORS = {
    bg: '#0f172a',
    grid1: '#1e293b',
    grid2: '#334155',
    base: 'rgba(231, 76, 60, 0.15)',
    highlightOk: 'rgba(52, 152, 219, 0.3)',
    highlightBad: 'rgba(231, 76, 60, 0.3)'
};

// ATUALIZADO: Torres agora tem HP (maxHp)
const TOWERS = {
    marketing: { cost: 50,  maxHp: 50,  color: '#27ae60', icon: '📈', type: 'eco', cooldown: 600, range: 0 },
    store:     { cost: 50,  maxHp: 100, color: '#00cec9', icon: '🏪', type: 'atk', damage: 20, cooldown: 70, range: 900, speed: 8 },
    factory:   { cost: 125, maxHp: 200, color: '#6c5ce7', icon: '🏭', type: 'atk', damage: 35, cooldown: 90, range: 900, speed: 10 },
    bank:      { cost: 300, maxHp: 300, color: '#f1c40f', icon: '🏦', type: 'atk', damage: 100, cooldown: 180, range: 900, speed: 6 },
    // NOVA TORRE: WALL (Compliance)
    wall:      { cost: 75,  maxHp: 800, color: '#f39c12', icon: '🚧', type: 'wall', cooldown: 0, range: 0 } 
};

// ATUALIZADO: Inimigos agora tem 'power' (dano contra torres)
const ENEMIES = {
    client:      { hp: 120, speed: 0.6, reward: 10, power: 1, icon: '😠', color: '#d63031' },
    tax:         { hp: 40,  speed: 1.8, reward: 5,  power: 2, icon: '💸', color: '#00b894' },
    sales:       { hp: 30,  speed: 1.2, reward: 5,  power: 3, icon: '🔻', color: '#3498db' },
    stock:       { hp: 90,  speed: 0.8, reward: 15, power: 2, icon: '📦', color: '#e17055' },
    finance:     { hp: 110, speed: 0.9, reward: 20, power: 4, icon: '📉', color: '#95a5a6' },
    bureaucracy: { hp: 400, speed: 0.3, reward: 50, power: 10, icon: '📋', color: '#7f8c8d' }
};

class Entity { 
    constructor(x, y) { this.x = x; this.y = y; this.markedForDeletion = false; } 
}

class Particle extends Entity {
    constructor(x, y, color) {
        super(x, y);
        this.vx = (Math.random() - 0.5) * 5; this.vy = (Math.random() - 0.5) * 5;
        this.life = 1.0; this.color = color; this.size = Math.random() * 4 + 2;
    }
    update() { this.x += this.vx; this.y += this.vy; this.life -= 0.04; if (this.life <= 0) this.markedForDeletion = true; }
    draw(ctx) { ctx.globalAlpha = this.life; ctx.fillStyle = this.color; ctx.fillRect(this.x, this.y, this.size, this.size); ctx.globalAlpha = 1.0; }
}

class FloatingText extends Entity {
    constructor(x, y, text, color) {
        super(x, y); this.text = text; this.color = color; this.life = 1.0; this.dy = -1.5;
    }
    update() { this.y += this.dy; this.life -= 0.02; if(this.life <= 0) this.markedForDeletion = true; }
    draw(ctx) { 
        ctx.save(); ctx.globalAlpha = this.life; 
        ctx.fillStyle = this.color; ctx.font = "bold 16px 'Segoe UI', sans-serif";
        ctx.shadowColor = "#000"; ctx.shadowBlur = 2;
        ctx.fillText(this.text, this.x, this.y); 
        ctx.restore(); 
    }
}

class Sun extends Entity {
    constructor(x, targetY) {
        super(x, -60); this.targetY = targetY; this.size = 50; this.timer = 600; this.rotation = 0;
    }
    update() {
        if (this.y < this.targetY) { this.y += 5; this.rotation += 0.05; } 
        else { this.y = this.targetY + Math.sin(Date.now()/300)*3; this.rotation = Math.sin(Date.now()/500)*0.1; }
        this.timer--; if (this.timer <= 0) this.markedForDeletion = true;
    }
    draw(ctx) {
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.rotation);
        ctx.shadowColor = "rgba(255, 255, 255, 0.5)"; ctx.shadowBlur = 15;
        this.drawCustomLogo(ctx);
        ctx.restore();
    }
    drawCustomLogo(ctx) {
        ctx.fillStyle = '#f59e0b'; ctx.beginPath();
        const r = 24;
        for (let i=0; i<6; i++) {
            const angle = (Math.PI/3)*i;
            const px = r*Math.cos(angle); const py = r*Math.sin(angle);
            if (i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
        }
        ctx.closePath(); ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = "bold 20px Arial"; ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillText("$", 0, 2);
    }
}

class Bullet extends Entity {
    constructor(x, y, speed, damage, color) { super(x, y); this.speed = speed; this.damage = damage; this.color = color; }
    update() { this.x += this.speed; if (this.x > WIDTH) this.markedForDeletion = true; }
    draw(ctx) { ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, 5, 0, Math.PI*2); ctx.fill(); }
}

class Tower extends Entity {
    constructor(c, r, typeKey) {
        super(c * TILE_SIZE + TILE_SIZE/2, r * TILE_SIZE + TILE_SIZE/2);
        const data = TOWERS[typeKey];
        this.typeKey = typeKey; this.row = r; this.col = c;
        this.cooldownTimer = 0; this.maxCooldown = data.cooldown; this.data = data;
        
        // Sistema de Vida da Torre
        this.hp = data.maxHp;
        this.maxHp = data.maxHp;
        
        this.scale = 0;
    }
    update(game) {
        if (this.scale < 1) this.scale += 0.1;
        
        // Torre Wall não atira nem gera dinheiro
        if (this.typeKey === 'wall') return;

        this.cooldownTimer--;
        if (this.data.type === 'eco') {
            if (this.cooldownTimer <= 0) {
                game.spawnSun(this.x, this.y); this.cooldownTimer = this.maxCooldown;
            } return;
        }
        if (this.cooldownTimer <= 0) {
            const hasEnemy = game.enemies.some(e => e.row === this.row && e.x > this.x && e.x < WIDTH);
            if (hasEnemy) {
                game.bullets.push(new Bullet(this.x + 20, this.y, this.data.speed, this.data.damage, this.data.color));
                AudioSys.play('shoot'); this.cooldownTimer = this.maxCooldown;
                this.x -= 4; setTimeout(()=>this.x += 4, 50);
            }
        }
    }
    
    // Receber dano dos inimigos
    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) this.markedForDeletion = true;
    }

    draw(ctx) {
        const s = this.scale; ctx.save(); ctx.translate(this.x, this.y); ctx.scale(s, s);
        
        // Se for a Parede, desenha a Barreira
        if (this.typeKey === 'wall') {
            this.drawComplianceWall(ctx);
        } else {
            // Desenho padrão (Emoji)
            ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(0, 20, 25, 8, 0, 0, Math.PI*2); ctx.fill();
            ctx.font = "42px Segoe UI Emoji"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText(this.data.icon, 0, 0);
        }

        // Barra de Vida da Torre (Só mostra se tomou dano)
        if (this.hp < this.maxHp) {
            const pct = Math.max(0, this.hp / this.maxHp);
            ctx.fillStyle = 'red'; ctx.fillRect(-20, -35, 40, 4);
            ctx.fillStyle = '#2ecc71'; ctx.fillRect(-20, -35, 40 * pct, 4);
        }

        ctx.restore();
    }

    drawComplianceWall(ctx) {
        // Bloco de Concreto
        ctx.fillStyle = '#576574'; // Cinza escuro
        ctx.fillRect(-30, -25, 60, 50);
        
        // Listras de Aviso (Amarelo e Preto)
        ctx.fillStyle = '#f1c40f'; // Amarelo
        ctx.beginPath();
        ctx.moveTo(-30, -25); ctx.lineTo(-10, -25); ctx.lineTo(-30, -5); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0, -25); ctx.lineTo(20, -25); ctx.lineTo(-30, 25); ctx.lineTo(-30, 5); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(30, -25); ctx.lineTo(30, -5); ctx.lineTo(0, 25); ctx.lineTo(-20, 25); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(30, 5); ctx.lineTo(30, 25); ctx.lineTo(10, 25); ctx.fill();
        
        // Borda 3D
        ctx.lineWidth = 2; ctx.strokeStyle = '#2c3e50';
        ctx.strokeRect(-30, -25, 60, 50);

        // Placa "STOP"
        ctx.fillStyle = '#c0392b';
        ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = "bold 10px Arial"; ctx.fillText("STOP", 0, 1);
    }
}