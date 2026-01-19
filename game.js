const ENEMY_CLASSES = {
    'client': ClientEnemy, 'tax': TaxEnemy, 'sales': SalesEnemy,
    'stock': StockEnemy, 'finance': FinanceEnemy, 'bureaucracy': Enemy
};

const AudioSys = {
    ctx: null,
    init() { 
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
    },
    play(type) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.ctx.destination);
        const t = this.ctx.currentTime;

        if (type === 'shoot') {
            osc.frequency.setValueAtTime(600, t); osc.frequency.exponentialRampToValueAtTime(100, t+0.1);
            gain.gain.setValueAtTime(0.05, t); gain.gain.exponentialRampToValueAtTime(0.001, t+0.1);
            osc.start(t); osc.stop(t+0.1);
        } else if (type === 'hit') {
            osc.type = 'square'; osc.frequency.setValueAtTime(150, t);
            gain.gain.setValueAtTime(0.03, t); gain.gain.linearRampToValueAtTime(0, t+0.05);
            osc.start(t); osc.stop(t+0.05);
        } else if (type === 'coin') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(1200, t); osc.frequency.linearRampToValueAtTime(1600, t+0.1);
            gain.gain.setValueAtTime(0.1, t); gain.gain.linearRampToValueAtTime(0, t+0.3);
            osc.start(t); osc.stop(t+0.3);
        } else if (type === 'win') {
            osc.type = 'triangle'; osc.frequency.setValueAtTime(300, t); osc.frequency.linearRampToValueAtTime(600, t+0.3);
            gain.gain.setValueAtTime(0.1, t); gain.gain.linearRampToValueAtTime(0, t+0.6);
            osc.start(t); osc.stop(t+0.6);
        } else if (type === 'error') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, t);
            gain.gain.setValueAtTime(0.1, t); gain.gain.linearRampToValueAtTime(0, t+0.2);
            osc.start(t); osc.stop(t+0.2);
        } else if (type === 'chomp') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, t); 
            gain.gain.setValueAtTime(0.05, t); gain.gain.linearRampToValueAtTime(0, t+0.1);
            osc.start(t); osc.stop(t+0.1);
        } else if (type === 'alarm') { // SOM DE ALARME DA BIG WAVE
            osc.type = 'square'; osc.frequency.setValueAtTime(440, t); osc.frequency.linearRampToValueAtTime(880, t+0.5);
            gain.gain.setValueAtTime(0.1, t); gain.gain.linearRampToValueAtTime(0, t+0.5);
            osc.start(t); osc.stop(t+0.5);
        }
    }
};

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.active = false;
        this.money = 100; this.lives = 5; this.wave = 1; this.score = 0;
        
        this.grid = []; this.towers = []; this.enemies = []; this.bullets = [];
        this.particles = []; this.suns = []; this.floatingTexts = [];
        
        this.waveActive = false; this.enemiesToSpawn = []; this.spawnTimer = 0;
        this.isRushMode = false; // Controle da Big Wave
        
        this.selectedTower = null; this.sellMode = false;
        this.mouseX = 0; this.mouseY = 0;

        this.canvas.addEventListener('mousemove', e => this.updateMouse(e));
        this.canvas.addEventListener('mousedown', e => this.handleClick(e));
        
        this.canvas.addEventListener('touchstart', e => { e.preventDefault(); this.handleTouch(e); }, {passive: false});
        this.canvas.addEventListener('touchmove', e => { e.preventDefault(); this.updateTouchPosition(e); }, {passive: false});

        this.loop = this.loop.bind(this); requestAnimationFrame(this.loop);
        setInterval(() => { if (this.waveActive) this.spawnSun(Math.random()*(WIDTH-100)+50, -50, true); }, 12000);
    }

    start() {
        AudioSys.init(); this.active = true; this.money = 100; this.lives = 5; this.wave = 1; this.score = 0;
        this.resetBoard(); this.updateUI();
        
        const title = document.getElementById('menu-title');
        title.innerText = "DEFESA FISCAL 🛡️"; title.style.color = "#f1c40f";
        document.getElementById('menu-subtitle').innerText = "Proteja o fluxo de caixa!";
        document.querySelector('#menu-overlay button').innerHTML = "ASSINAR CONTRATO ✒️";
        document.getElementById('menu-overlay').classList.add('hidden');
        this.startWave();
    }
    resetBoard() {
        this.towers = []; this.enemies = []; this.bullets = []; this.suns = []; this.particles = []; this.floatingTexts = [];
        this.grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
        this.selectedTower = null; this.sellMode = false;
        this.highlightUI(null);
    }
    
    startWave() {
        this.waveActive = true; 
        this.isRushMode = false;
        this.showToast(`Trimestre ${this.wave}`);
        
        this.enemiesToSpawn = [];
        
        // --- 1. CONFIGURAÇÃO DOS INIMIGOS DA ONDA ---
        const normalCount = 4 + Math.floor(this.wave * 1.5);
        const bigWaveCount = 3 + Math.floor(this.wave * 0.5); // Aumenta com a dificuldade
        
        const pool = ['client'];
        if(this.wave >= 2) pool.push('tax'); if(this.wave >= 3) pool.push('sales');
        if(this.wave >= 4) pool.push('stock'); if(this.wave >= 5) pool.push('finance');
        if(this.wave >= 6) pool.push('bureaucracy');

        // Adiciona a HORDA FINAL primeiro (Como usamos .pop(), eles ficam no fundo da pilha e saem por último)
        for (let i=0; i<bigWaveCount; i++) {
            // Na big wave, tentamos colocar inimigos mais fortes se disponíveis
            const toughEnemy = pool.length > 1 ? pool[Math.floor(Math.random()*(pool.length-1)) + 1] : 'client';
            this.enemiesToSpawn.push(toughEnemy);
        }

        // Adiciona os inimigos normais (ficam no topo da pilha, saem primeiro)
        for (let i=0; i<normalCount; i++) {
            this.enemiesToSpawn.push(pool[Math.floor(Math.random()*pool.length)]);
        }
        
        this.spawnTimer = 0;
    }

    spawnSun(x, y, fromSky=false) {
        const targetY = fromSky ? Math.random()*(HEIGHT-120)+60 : y+40;
        const startY = fromSky ? -60 : y;
        const s = new Sun(x, targetY); if(fromSky) s.y = startY;
        this.suns.push(s);
    }

    update() {
        if (!this.active) return;
        
        // --- SPAWNER INTELIGENTE ---
        if (this.waveActive && this.enemiesToSpawn.length > 0) {
            this.spawnTimer++;
            
            // Verifica se entramos na "Big Wave" (últimos 5 inimigos)
            if (!this.isRushMode && this.enemiesToSpawn.length <= 5) {
                this.isRushMode = true;
                this.showToast("⚠️ HORDA FINAL! ⚠️");
                AudioSys.play('alarm');
            }

            // Tempo de spawn: Normal = Lento | Big Wave = Rápido
            let spawnRate = 90 - (this.wave * 2); 
            if (this.isRushMode) spawnRate = 30; // Muito rápido na horda final

            if (spawnRate < 20) spawnRate = 20; // Limite mínimo

            if (this.spawnTimer > spawnRate) {
                const typeKey = this.enemiesToSpawn.pop();
                const row = Math.floor(Math.random()*ROWS);
                const EnemyClass = ENEMY_CLASSES[typeKey] || Enemy;
                this.enemies.push(new EnemyClass(row, typeKey));
                this.spawnTimer = 0;
            }
        }
        
        if (this.waveActive && this.enemiesToSpawn.length === 0 && this.enemies.length === 0) this.endWave();

        // UPDATE TOWERS
        for (let i = this.towers.length - 1; i >= 0; i--) {
            const t = this.towers[i]; t.update(this);
            if (t.markedForDeletion) {
                for(let k=0; k<10; k++) this.particles.push(new Particle(t.x, t.y, '#95a5a6'));
                this.grid[t.row][t.col] = null; this.towers.splice(i, 1); AudioSys.play('error');
            }
        }

        this.bullets.forEach(b => {
            b.update();
            this.enemies.forEach(e => {
                const dist = Math.sqrt((b.x-e.x)**2 + (b.y-e.y)**2);
                if (dist < e.radius + 5) {
                    b.markedForDeletion = true; e.takeDamage(b.damage); AudioSys.play('hit');
                    this.floatingTexts.push(new FloatingText(e.x, e.y-20, `-${b.damage}`, '#ff6b6b'));
                    for(let i=0; i<3; i++) this.particles.push(new Particle(e.x, e.y, '#fff'));
                    if (e.markedForDeletion) {
                        this.money += e.reward; this.score += e.reward*10;
                        this.floatingTexts.push(new FloatingText(e.x, e.y-40, `+$${e.reward}`, '#f1c40f'));
                        AudioSys.play('coin'); this.updateUI();
                    }
                }
            });
        });

        this.enemies.forEach(e => {
            const frontX = e.x - e.radius; const col = Math.floor(frontX / TILE_SIZE); const row = e.row;
            let isBlocked = false;
            if (col >= 0 && col < COLS) {
                const tower = this.towers.find(t => t.row === row && t.col === col);
                if (tower && frontX < (tower.col * TILE_SIZE + TILE_SIZE - 20)) {
                    isBlocked = true; e.attackTimer--;
                    if (e.attackTimer <= 0) {
                        tower.takeDamage(e.power); e.attackTimer = 60; AudioSys.play('chomp');
                        this.particles.push(new Particle(tower.x, tower.y, '#f1c40f'));
                    }
                }
            }
            e.update(isBlocked);
            if (e.x < 0) {
                e.markedForDeletion = true; this.lives--; AudioSys.play('error');
                this.updateUI(); this.ctx.translate(5,0); setTimeout(()=>this.ctx.setTransform(1,0,0,1,0,0), 50);
                if (this.lives <= 0) this.gameOver();
            }
        });
        [this.suns, this.particles, this.floatingTexts].forEach(arr => arr.forEach(i => i.update()));
        this.bullets = this.bullets.filter(b=>!b.markedForDeletion);
        this.enemies = this.enemies.filter(e=>!e.markedForDeletion);
        this.particles = this.particles.filter(p=>!p.markedForDeletion);
        this.suns = this.suns.filter(s=>!s.markedForDeletion);
        this.floatingTexts = this.floatingTexts.filter(t=>!t.markedForDeletion);
    }

    draw() {
        this.ctx.fillStyle = COLORS.bg; this.ctx.fillRect(0,0,WIDTH,HEIGHT);
        this.ctx.lineWidth = 1; this.ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        for(let r=0; r<ROWS; r++){
            for(let c=0; c<COLS; c++){
                const x = c*TILE_SIZE; const y = r*TILE_SIZE;
                this.ctx.fillStyle = (r+c)%2===0 ? COLORS.grid1 : COLORS.grid2;
                this.ctx.fillRect(x,y,TILE_SIZE,TILE_SIZE); this.ctx.strokeRect(x,y,TILE_SIZE,TILE_SIZE);
                
                if(this.active && this.mouseX>x && this.mouseX<x+TILE_SIZE && this.mouseY>y && this.mouseY<y+TILE_SIZE) {
                    if (this.sellMode) {
                        this.ctx.strokeStyle = '#e74c3c'; this.ctx.lineWidth = 2; this.ctx.strokeRect(x,y,TILE_SIZE,TILE_SIZE);
                    } else if (this.selectedTower) {
                        const range = TOWERS[this.selectedTower].range;
                        this.ctx.fillStyle = this.grid[r][c] ? COLORS.highlightBad : COLORS.highlightOk;
                        this.ctx.fillRect(x,y,TILE_SIZE,TILE_SIZE);
                        if (range) {
                            this.ctx.beginPath(); this.ctx.arc(x+TILE_SIZE/2, y+TILE_SIZE/2, range, 0, Math.PI*2);
                            this.ctx.fillStyle = 'rgba(52, 152, 219, 0.1)'; this.ctx.fill();
                            this.ctx.strokeStyle = 'rgba(52, 152, 219, 0.3)'; this.ctx.stroke();
                        }
                    }
                }
            }
        }
        this.ctx.fillStyle = COLORS.base; this.ctx.fillRect(0,0,TILE_SIZE,HEIGHT);
        this.ctx.strokeStyle = '#c0392b'; this.ctx.beginPath(); this.ctx.moveTo(TILE_SIZE,0); this.ctx.lineTo(TILE_SIZE,HEIGHT); this.ctx.stroke();

        this.towers.forEach(t => t.draw(this.ctx));
        this.enemies.forEach(e => e.draw(this.ctx));
        this.bullets.forEach(b => b.draw(this.ctx));
        this.particles.forEach(p => p.draw(this.ctx));
        this.suns.forEach(s => s.draw(this.ctx));
        this.floatingTexts.forEach(t => t.draw(this.ctx));
    }

    loop() { this.update(); this.draw(); requestAnimationFrame(this.loop); }
    
    getGameCoordinates(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
    }
    updateMouse(e) { const coords = this.getGameCoordinates(e.clientX, e.clientY); this.mouseX = coords.x; this.mouseY = coords.y; }
    handleTouch(e) {
        if (!this.active) return;
        const touch = e.touches[0];
        const coords = this.getGameCoordinates(touch.clientX, touch.clientY);
        this.mouseX = coords.x; this.mouseY = coords.y;
        this.processClick();
    }
    updateTouchPosition(e) {
        const touch = e.touches[0];
        const coords = this.getGameCoordinates(touch.clientX, touch.clientY);
        this.mouseX = coords.x; this.mouseY = coords.y;
    }
    handleClick(e) { if(!this.active) return; this.updateMouse(e); this.processClick(); }

    processClick() {
        for (let i=this.suns.length-1; i>=0; i--) {
            const s = this.suns[i];
            if (Math.sqrt((this.mouseX-s.x)**2 + (this.mouseY-s.y)**2) < 50) {
                s.markedForDeletion = true; this.money += 25; AudioSys.play('coin'); this.updateUI();
                this.floatingTexts.push(new FloatingText(s.x, s.y, "+$25", "#2ecc71")); return;
            }
        }
        const c = Math.floor(this.mouseX/TILE_SIZE); const r = Math.floor(this.mouseY/TILE_SIZE);
        if(c>=0 && c<COLS && r>=0 && r<ROWS) {
            if (this.sellMode) {
                const idx = this.towers.findIndex(t=>t.col===c && t.row===r);
                if(idx !== -1) {
                    const refund = Math.floor(this.towers[idx].data.cost * 0.7);
                    this.money += refund; this.towers.splice(idx, 1); this.grid[r][c] = null;
                    AudioSys.play('coin'); this.updateUI(); this.toggleSellMode();
                    this.floatingTexts.push(new FloatingText(c*TILE_SIZE+45, r*TILE_SIZE+45, `+$${refund}`, "#fff"));
                }
                return;
            }
            if(this.selectedTower && !this.grid[r][c]) {
                const data = TOWERS[this.selectedTower];
                if(this.money >= data.cost) {
                    this.money -= data.cost; this.grid[r][c] = this.selectedTower;
                    this.towers.push(new Tower(c, r, this.selectedTower));
                    AudioSys.play('coin'); this.updateUI(); this.selectedTower = null; this.highlightUI(null);
                } else AudioSys.play('error');
            } else if (this.selectedTower) AudioSys.play('error');
        }
    }

    toggleSellMode() {
        this.sellMode = !this.sellMode; this.selectedTower = null; this.highlightUI(null);
        const btn = document.getElementById('btn-sell');
        if(this.sellMode) { btn.classList.add('selected'); document.body.style.cursor = 'no-drop'; }
        else { btn.classList.remove('selected'); document.body.style.cursor = 'default'; }
    }
    selectTower(type, cost) {
        if(this.sellMode) this.toggleSellMode();
        if(this.money >= cost) { this.selectedTower = type; this.highlightUI(type); AudioSys.play('coin'); }
        else AudioSys.play('error');
    }
    highlightUI(type) {
        document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
        if(type) document.getElementById({'wall':'btn-wall','marketing':'btn-marketing','store':'btn-store','factory':'btn-factory','bank':'btn-bank'}[type]).classList.add('selected');
    }
    updateUI() {
        document.getElementById('money-display').innerText = this.money;
        document.getElementById('lives-display').innerText = this.lives;
        document.getElementById('wave-display').innerText = this.wave;
        document.getElementById('score-display').innerText = this.score;
        const costs = {'btn-wall':75, 'btn-marketing':50, 'btn-store':50, 'btn-factory':125, 'btn-bank':300};
        for(const [id,cost] of Object.entries(costs)){
            const el = document.getElementById(id);
            if(this.money<cost) el.classList.add('disabled'); else el.classList.remove('disabled');
        }
    }
    endWave() {
        this.waveActive = false; AudioSys.play('win');
        const bonus = 150 + (this.wave*50); this.money += bonus;
        document.getElementById('level-wave-num').innerText = this.wave;
        document.getElementById('level-bonus-value').innerText = `+$${bonus}`;
        document.getElementById('level-overlay').classList.remove('hidden');
    }
    nextLevel() {
        document.getElementById('level-overlay').classList.add('hidden');
        this.wave++; this.resetBoard(); this.updateUI(); this.startWave();
    }
    showToast(msg) {
        const t = document.getElementById('toast'); t.innerText=msg; t.classList.add('visible');
        setTimeout(()=>t.classList.remove('visible'), 2000);
    }
    gameOver() {
        this.active = false;
        const title = document.getElementById('menu-title');
        title.innerHTML = "FALÊNCIA! 📉"; title.style.color = "#e74c3c";
        document.getElementById('menu-subtitle').innerHTML = "Seus bens foram congelados.<br>O RH quer falar com você.";
        document.querySelector('#menu-overlay button').innerHTML = "TENTAR RECUPERAÇÃO 💸";
        document.getElementById('menu-overlay').classList.remove('hidden');
    }
}

const game = new Game();