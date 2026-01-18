// js/Enemy.js

class Enemy extends Entity {
    constructor(row, typeKey) {
        const data = ENEMIES[typeKey]; 
        super(WIDTH + 50, row * TILE_SIZE + TILE_SIZE/2);
        
        this.typeKey = typeKey;
        this.hp = data.hp; 
        this.maxHp = data.hp;
        this.speed = data.speed; 
        this.reward = data.reward;
        this.power = data.power || 1; // Dano que causa na torre
        this.icon = data.icon; 
        this.row = row; 
        this.flash = 0;
        
        this.radius = 30;
        this.walkCycle = 0;
        this.walkOffset = Math.random() * Math.PI * 2;
        
        this.isAttacking = false;
        this.attackTimer = 0;
    }

    update(isBlocked) {
        // Se NÃO estiver bloqueado, anda para frente
        if (!isBlocked) {
            this.x -= this.speed;
        }

        // Animação continua rodando mesmo parado (correndo no lugar)
        this.walkCycle += 0.12 * this.speed;
        
        if (this.flash > 0) this.flash--;
    }

    draw(ctx) {
        const pct = Math.max(0, this.hp / this.maxHp);
        const yBar = this.y - (this.radius + 15);
        
        ctx.fillStyle = '#c0392b'; ctx.fillRect(this.x - 20, yBar, 40, 6);
        ctx.fillStyle = '#2ecc71'; ctx.fillRect(this.x - 20, yBar, 40 * pct, 6);

        if (this.flash > 0) {
            ctx.save();
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2); ctx.fill();
            ctx.restore();
            return true;
        }
        return false;
    }

    takeDamage(amount) { 
        this.hp -= amount; 
        this.flash = 4;
        if (this.hp <= 0) this.markedForDeletion = true; 
    }
}