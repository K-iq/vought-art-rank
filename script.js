// =========================================
// VOUGHT ART ARCADE
// Ranking System
// =========================================


// Local onde o ranking será exibido
const scoreboard = document.getElementById("scoreboard");
let sistemaLevels;

// =========================================
// SISTEMA DE LEVEL
// =========================================

function calcularXPDoNivel(level) {
    const base = sistemaLevels.baseXP;
    const limite = 1000;

    // Crescimento inicial rápido
    if (level <= 6) {
        return Math.floor(
            base * Math.pow(sistemaLevels.multiplicador, level - 1)
        );
    }

    // A partir daqui, o crescimento começa a desacelerar
    const xpAnterior = calcularXPDoNivel(level - 1);
    const crescimento = (limite - xpAnterior) * 0.45;

    return Math.min(
        limite,
        Math.round(xpAnterior + crescimento)
    );
}


function calcularLevel(pontos) {
    let level = 1;
    let xpRestante = pontos;

    // Calcula normalmente até a curva estabilizar
    while (level < 15) {
        const xpNecessario = calcularXPDoNivel(level);

        if (xpRestante < xpNecessario) {
            return level;
        }

        xpRestante -= xpNecessario;
        level++;
    }

    // Depois da estabilização, cada level custa 1000 XP
    if (xpRestante >= 1000) {
        level += Math.floor(xpRestante / 1000);
    }

    return level;
}


// =========================================
// CALCULAR PROGRESSO DO LEVEL
// =========================================

function calcularProgressoXP(pontos) {
    let level = 1;
    let xpRestante = pontos;

    // Calcula normalmente até a curva estabilizar
    while (level < 15) {
        const xpNecessario = calcularXPDoNivel(level);

        if (xpRestante < xpNecessario) {
            break;
        }

        xpRestante -= xpNecessario;
        level++;
    }

    let xpNecessario;

    if (level >= 15) {
        xpNecessario = 1000;

        // Avança vários levels de uma vez
        const levelsExtras = Math.floor(xpRestante / xpNecessario);

        level += levelsExtras;
        xpRestante -= levelsExtras * xpNecessario;
    } else {
        xpNecessario = calcularXPDoNivel(level);
    }

    const porcentagem = (xpRestante / xpNecessario) * 100;

    return {
        level: level,
        xpAtual: xpRestante,
        xpNecessario: xpNecessario,
        porcentagem: porcentagem
    };
}

// =========================================
// OBTER TÍTULOS DESBLOQUEADOS
// =========================================

function obterTitulosDesbloqueados(level) {

    return sistemaLevels.titulos.filter((item) => {
        return level >= item.level;
    });

}


// Carrega os dados do ranking
async function carregarRanking() {

    try {

        const respostaRanking = await fetch("data/ranking.json");
		const jogadores = await respostaRanking.json();

		const respostaLevels = await fetch("data/levels.json");
		sistemaLevels = await respostaLevels.json();
		
		// =========================================
		// SISTEMA DE LEVEL
		// =========================================


		function obterTitulo(level) {
			let tituloAtual = sistemaLevels.titulos[0].titulo;

			sistemaLevels.titulos.forEach((item) => {
				if (level >= item.level) {
					tituloAtual = item.titulo;
				}
			});

			return tituloAtual;
		}
		
		console.log(jogadores);


        // Ordena do maior para o menor número de pontos
        jogadores.sort((a, b) => b.pontos - a.pontos);


        // Limpa o ranking atual
        scoreboard.innerHTML = "";
		
		// Cabeçalho do ranking
		const header = document.createElement("div");

		header.classList.add("score-header");

		header.innerHTML = `
			<span>RANK</span>
			<span>PLAYER</span>
			<span>LEVEL</span>
			<span>XP</span>
		`;

		scoreboard.appendChild(header);


        // Cria cada jogador
        jogadores.forEach((jogador, index) => {

            const posicao = index + 1;

            const score = document.createElement("div");

            score.classList.add("score");
			
			score.style.cursor = "pointer";

			score.addEventListener("click", () => {
				abrirPerfil(jogador, posicao);
			});


            // Classes especiais para o Top 3
            if (posicao === 1) {
                score.classList.add("first");
            }

            else if (posicao === 2) {
                score.classList.add("second");
            }

            else if (posicao === 3) {
                score.classList.add("third");
            }


            // Posição
            const position = document.createElement("span");

            position.classList.add("position");

            position.textContent = `${posicao}TH`;


            // Corrige 1ST, 2ND e 3RD
            if (posicao === 1) {
                position.textContent = "1ST";
            }

            else if (posicao === 2) {
                position.textContent = "2ND";
            }

            else if (posicao === 3) {
                position.textContent = "3RD";
            }


            // Nome
			const name = document.createElement("span");

			name.classList.add("name");

			name.textContent = jogador.nome;


			// Level
			const level = document.createElement("span");
			level.classList.add("level");

			const levelAtual = calcularLevel(jogador.pontos);

			level.textContent = `LV. ${levelAtual}`;


			// Pontuação
			const xp = document.createElement("span");

			xp.classList.add("xp");

			xp.textContent = "0 XP";


			// Anima o contador até a pontuação real
			let valorAtual = 0;

			const valorFinal = jogador.pontos;

			const duracao = 2000;

			const inicio = performance.now();


			function animarXP(tempo) {

				const progresso = Math.min((tempo - inicio) / duracao, 1);

			// Suaviza a animação
				const suavizado = 1 - Math.pow(1 - progresso, 3);

				valorAtual = Math.floor(valorFinal * suavizado);

				xp.textContent = `${valorAtual} XP`;


				if (progresso < 1) {

					requestAnimationFrame(animarXP);

				}

				else {	

					xp.textContent = `${valorFinal} XP`;

				}

			}


            // Monta a linha
            score.appendChild(position);

			score.appendChild(name);

			score.appendChild(level);

			score.appendChild(xp);
			
			setTimeout(() => {

				animarXP(performance.now());

			}, posicao * 150 + 450);


            // Coloca no placar
            scoreboard.appendChild(score);

        });

    }

    catch (erro) {

        console.error("Erro ao carregar o ranking:", erro);

        scoreboard.innerHTML = `
            <div class="ranking-error">
                ERROR: RANKING DATA UNAVAILABLE
            </div>
        `;

    }

}

// =========================================
// ABRIR PERFIL DO JOGADOR
// =========================================

function abrirPerfil(jogador, posicao) {

    const overlay = document.getElementById("profile-overlay");

    const nome = document.getElementById("profile-name");
    const rank = document.getElementById("profile-rank");
    const level = document.getElementById("profile-level");
    const xp = document.getElementById("profile-xp");
	const xpFill = document.getElementById("profile-xp-fill");
	const xpProgress = document.getElementById("profile-xp-progress");
	const profileImage = document.getElementById("profile-image");
	const titleList = document.getElementById("profile-title-list");

    const levelAtual = calcularLevel(jogador.pontos);
	const progressoXP = calcularProgressoXP(jogador.pontos);
	const titulosDesbloqueados = obterTitulosDesbloqueados(levelAtual);
	
	profileImage.src = `assets/profile/${jogador.nome}.png`;

	profileImage.onerror = () => {
		profileImage.src = "assets/profile/default.png";
	};

    nome.textContent = jogador.nome;
    rank.textContent = `RANK #${posicao}`;
    level.textContent = `LV. ${levelAtual}`;
    xp.textContent = `${jogador.pontos} XP`;
	xpFill.style.width = `${progressoXP.porcentagem}%`;
	xpProgress.textContent = `${progressoXP.xpAtual} / ${progressoXP.xpNecessario} XP`;
	titleList.innerHTML = "";

titulosDesbloqueados.forEach((item) => {

    const title = document.createElement("div");

    title.classList.add("profile-title");
	
	title.classList.add(`title-level-${item.level}`);

    title.textContent = item.titulo;

    titleList.appendChild(title);

});

    overlay.style.opacity = "1";
    overlay.style.visibility = "visible";
}

// =========================================
// WEEKLY CHALLENGE
// =========================================

async function abrirDesafioSemanal() {
    const overlay = document.getElementById("challenge-overlay");

    const titulo = document.getElementById("challenge-title");
    const descricao = document.getElementById("challenge-description");
    const recompensa = document.getElementById("challenge-reward");

    try {
        const resposta = await fetch("data/challenge.json");
        const desafio = await resposta.json();

        titulo.textContent = desafio.titulo;
        descricao.textContent = desafio.descricao;
        recompensa.textContent = `${desafio.recompensa} XP`;

        overlay.style.opacity = "1";
        overlay.style.visibility = "visible";

    } catch (erro) {
        console.error("Erro ao carregar desafio:", erro);

        titulo.textContent = "ERROR";
        descricao.textContent = "WEEKLY CHALLENGE DATA UNAVAILABLE";
        recompensa.textContent = "---";

        overlay.style.opacity = "1";
        overlay.style.visibility = "visible";
    }
}


// ABRIR DESAFIO
const challengeButton = document.getElementById("challenge-toggle");

challengeButton.addEventListener("click", () => {
    abrirDesafioSemanal();
});


// FECHAR DESAFIO
const challengeClose = document.getElementById("challenge-close");
const challengeOverlay = document.getElementById("challenge-overlay");

challengeClose.addEventListener("click", () => {
    challengeOverlay.style.opacity = "0";
    challengeOverlay.style.visibility = "hidden";
});

// =========================================
// FECHAR PERFIL
// =========================================

const profileClose = document.getElementById("profile-close");
const profileOverlay = document.getElementById("profile-overlay");

profileClose.addEventListener("click", () => {
    profileOverlay.style.opacity = "0";
    profileOverlay.style.visibility = "hidden";
});



// Inicializa o ranking
carregarRanking();

// =========================================
// CONTROLE DE MÚSICA
// =========================================

const music = document.getElementById("arcade-music");
const musicButton = document.getElementById("music-toggle");


// Volume da música
music.volume = 0.25;


// Botão ON / OFF
musicButton.addEventListener("click", async () => {

    if (music.paused) {

        try {

            await music.play();

            musicButton.textContent = "♪ MUSIC: ON";

        }

        catch (erro) {

            console.error("Erro ao iniciar música:", erro);

        }

    }

    else {

        music.pause();

        musicButton.textContent = "♪ MUSIC: OFF";

    }

});

// =========================================
// EFEITO SONORO DE CLIQUE
// =========================================

const clickSound = document.getElementById("click-sound");

clickSound.volume = 0.1;

document.addEventListener("click", () => {
    clickSound.currentTime = 0;
    clickSound.play();
});

// =========================================
// PARTICLES
// =========================================

const particlesContainer = document.getElementById("particles");

function criarParticula() {
    const particle = document.createElement("div");
    particle.classList.add("particle");

    // Posição aleatória na tela
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;

    particlesContainer.appendChild(particle);

    // Remove depois de um tempo
    setTimeout(() => {
        particle.remove();
    }, 2000);
}

// Cria uma nova partícula a cada 300ms
setInterval(criarParticula, 200);

// ---------- ELASTIC OVERSCROLL ----------

const arcadeScreen = document.querySelector(".arcade-screen");

const MAX_OVERSCROLL = 50;
const RESISTANCE = 40;

let overscrollOffset = 0;
let overscrollActive = false;

function calcularElastic(raw) {
    const sinal = Math.sign(raw);
    const distancia = Math.abs(raw);

    const resistencia =
        MAX_OVERSCROLL *
        (1 - Math.exp(-distancia / RESISTANCE));

    return sinal * resistencia;
}

function aplicarOverscroll(valor) {
    overscrollOffset = valor;
    arcadeScreen.style.transform = `translateY(${valor}px)`;
}

function voltarOverscroll() {
    if (!overscrollActive) return;

    overscrollActive = false;

    arcadeScreen.classList.add("overscroll-return");
    arcadeScreen.style.transform = "translateY(0)";

    setTimeout(() => {
        arcadeScreen.classList.remove("overscroll-return");
        overscrollOffset = 0;
    }, 450);
}

window.addEventListener("wheel", (event) => {

    const noFundo =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 1;

    // Tentando puxar para baixo estando no fundo
    if (noFundo && event.deltaY > 0) {

        event.preventDefault();

        overscrollActive = true;

        const novoOffset =
            calcularElastic(overscrollOffset + event.deltaY);

        aplicarOverscroll(novoOffset);

        return;
    }

    // Se voltou para dentro da área normal
    if (overscrollActive) {
        voltarOverscroll();
    }

}, { passive: false });


// ---------- ELASTIC OVERSCROLL — MOBILE ----------

let touchStartY = 0;
let touchAtBottom = false;

window.addEventListener("touchstart", (event) => {

    if (event.touches.length !== 1) return;

    touchStartY = event.touches[0].clientY;

    touchAtBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 1;

}, { passive: true });


window.addEventListener("touchmove", (event) => {

    if (event.touches.length !== 1) return;
    if (!touchAtBottom) return;

    const currentY = event.touches[0].clientY;
    const delta = currentY - touchStartY;

    // Só ativa quando o dedo está puxando para cima
    if (delta >= 0) return;

    event.preventDefault();

    overscrollActive = true;

    const novoOffset =
        calcularElastic(Math.abs(delta));

    aplicarOverscroll(-novoOffset);

}, { passive: false });


window.addEventListener("touchend", () => {

    if (!overscrollActive) return;

    voltarOverscroll();

    touchStartY = 0;
    touchAtBottom = false;

}, { passive: true });