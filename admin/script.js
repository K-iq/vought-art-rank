const isAdminPage =
    window.location.pathname.endsWith("/admin/index.html");

if (isAdminPage) {

    const session =
        sessionStorage.getItem("vought_session");

    if (!session) {
        window.location.href = "login.html";
    } else {

        fetch(
            "https://vought-arcade-api.vought-art-api.workers.dev/api/auth/me",
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${session}`
                }
            }
        )
        .then(async (response) => {

            if (!response.ok) {
                throw new Error("Unauthorized");
            }

            return response.json();
        })
        .then((data) => {

            console.log(
                "Authenticated as:",
                data.login,
                "Role:",
                data.role
            );

        })
        .catch(() => {

            sessionStorage.removeItem("vought_session");

            window.location.href = "login.html";
        });
    }
}


// ---------- ADMIN LOGIN ----------

const loginForm = document.querySelector(".login-form");

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const login =
            document.querySelector("#login").value.trim();

        const password =
            document.querySelector("#password").value;

        if (login === "" || password === "") {
            alert("PREENCHA LOGIN E SENHA.");
            return;
        }

        try {

            const response = await fetch(
                "https://vought-arcade-api.vought-art-api.workers.dev/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        login: login,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert("INVALID LOGIN OR PASSWORD");
                return;
            }

            if (!data.success || !data.session) {
                alert("AUTHENTICATION ERROR");
                return;
            }

            sessionStorage.setItem(
                "vought_session",
                data.session
            );

            window.location.href = "index.html";

        } catch (error) {

            console.error(error);

            alert("UNABLE TO CONNECT TO AUTHENTICATION SERVER.");
        }
    });
}



// ---------- ADMIN NAVIGATION ----------

const navButtons = document.querySelectorAll(".nav-button");
const adminSections = document.querySelectorAll(".admin-section");

if (navButtons.length > 0) {

    navButtons.forEach((button) => {

        button.addEventListener("click", () => {

            const sectionName = button.dataset.section;


            // Remove o estado ativo dos botões

            navButtons.forEach((btn) => {

                btn.classList.remove("active");

            });


            // Esconde todas as seções

            adminSections.forEach((section) => {

                section.classList.remove("active");

            });


            // Ativa o botão clicado

            button.classList.add("active");


            // Mostra a seção correspondente

            const targetSection =
                document.querySelector(`#section-${sectionName}`);

            if (targetSection) {

                targetSection.classList.add("active");

            }

        });

    });

}

// ---------- ADICIONAR ADMIN ----------

const addAdminButton =
    document.querySelector("#add-admin-button");

const addAdminModal =
    document.querySelector("#add-admin-modal");

const addAdminClose =
    document.querySelector("#add-admin-close");

const addAdminCancel =
    document.querySelector("#add-admin-cancel");

const addAdminForm =
    document.querySelector("#add-admin-form");

const addAdminLogin =
    document.querySelector("#add-admin-login");

const addAdminName =
    document.querySelector("#add-admin-name");

const addAdminPassword =
    document.querySelector("#add-admin-password");


// ABRIR MODAL

if (addAdminButton) {

    addAdminButton.addEventListener("click", () => {

        addAdminModal.style.display = "flex";

        addAdminLogin.focus();

    });

}


// FECHAR MODAL

function fecharModalAddAdmin() {

    if (!addAdminModal) return;

    addAdminModal.style.display = "none";

    addAdminForm.reset();

}


// BOTÃO X

if (addAdminClose) {

    addAdminClose.addEventListener(
        "click",
        fecharModalAddAdmin
    );

}


// BOTÃO CANCELAR

if (addAdminCancel) {

    addAdminCancel.addEventListener(
        "click",
        fecharModalAddAdmin
    );

}


// ADICIONAR ADMIN

if (addAdminForm) {

    addAdminForm.addEventListener("submit", (event) => {

        event.preventDefault();


        const login =
            addAdminLogin.value.trim();

        const nome =
            addAdminName.value.trim();

        const senha =
            addAdminPassword.value;


        if (login === "") {

            alert("O login não pode estar vazio.");

            addAdminLogin.focus();

            return;

        }


        if (nome === "") {

            alert("O nome não pode estar vazio.");

            addAdminName.focus();

            return;

        }


        if (senha === "") {

            alert("A senha não pode estar vazia.");

            addAdminPassword.focus();

            return;

        }


        const loginExiste =
            adminsData.some((admin) => {

                return admin.login.toLowerCase() ===
                    login.toLowerCase();

            });


        if (loginExiste) {

            alert("Já existe um administrador com esse login.");

            addAdminLogin.focus();

            return;

        }


        adminsData.push({

            login: login,

            nome: nome,

            senha: senha,
			
			role: "admin"

        });
		
		registrarAcao(`ADMIN ADICIONADO — ${login}`);


        renderizarAdmins();

        fecharModalAddAdmin();


        alert("Administrador adicionado com sucesso!");

    });

}

// ---------- EDITAR ADMIN ----------

const editAdminModal =
    document.querySelector("#edit-admin-modal");

const editAdminClose =
    document.querySelector("#edit-admin-close");

const editAdminCancel =
    document.querySelector("#edit-admin-cancel");

const editAdminForm =
    document.querySelector("#edit-admin-form");

const editAdminLogin =
    document.querySelector("#edit-admin-login");

const editAdminName =
    document.querySelector("#edit-admin-name");

const editAdminPassword =
    document.querySelector("#edit-admin-password");

let adminEditando = null;


// ABRIR MODAL

function abrirModalEdicaoAdmin(index) {

    if (!editAdminModal) return;

    const admin = adminsData[index];

    if (!admin) return;

    adminEditando = index;

    editAdminLogin.value = admin.login;

    editAdminName.value = admin.nome;

    editAdminPassword.value = "";

    editAdminModal.style.display = "flex";

    editAdminLogin.focus();
}


// FECHAR MODAL

function fecharModalEdicaoAdmin() {

    if (!editAdminModal) return;

    editAdminModal.style.display = "none";

    editAdminForm.reset();

    adminEditando = null;
}


// BOTÃO X

if (editAdminClose) {

    editAdminClose.addEventListener(
        "click",
        fecharModalEdicaoAdmin
    );

}


// BOTÃO CANCELAR

if (editAdminCancel) {

    editAdminCancel.addEventListener(
        "click",
        fecharModalEdicaoAdmin
    );

}


// BOTÕES EDITAR

function configurarBotoesEditarAdmin() {

    const editButtons =
        document.querySelectorAll(".admin-edit-button");

    editButtons.forEach((button) => {

        button.addEventListener("click", () => {
			const index = Number(button.dataset.index);
			const admin = adminsData[index];

			if (!admin) return;

			if (admin.role === "owner") {
				alert("O Owner não pode ser editado.");
				return;
			}

			abrirModalEdicaoAdmin(index);
		});

    });

}


// SALVAR ALTERAÇÕES

if (editAdminForm) {

    editAdminForm.addEventListener("submit", (event) => {

        event.preventDefault();

        if (adminEditando === null) return;


        const login =
            editAdminLogin.value.trim();

        const nome =
            editAdminName.value.trim();

        const senha =
            editAdminPassword.value;


        if (login === "") {

            alert("O login não pode estar vazio.");

            editAdminLogin.focus();

            return;

        }


        if (nome === "") {

            alert("O nome não pode estar vazio.");

            editAdminName.focus();

            return;

        }


        if (
            senha !== "" &&
            senha.length < 4
        ) {

            alert(
                "A nova senha precisa ter pelo menos 4 caracteres."
            );

            editAdminPassword.focus();

            return;

        }


        const loginExiste =
            adminsData.some((admin, index) => {

                if (index === adminEditando) {
                    return false;
                }

                return (
                    admin.login.toLowerCase() ===
                    login.toLowerCase()
                );

            });


        if (loginExiste) {

            alert(
                "Já existe um administrador com esse login."
            );

            editAdminLogin.focus();

            return;

        }


        adminsData[adminEditando].login =
            login;

        adminsData[adminEditando].nome =
            nome;


        if (senha !== "") {

            adminsData[adminEditando].senha =
                senha;

        }

		registrarAcao(`ADMIN EDITADO — ${login}`);
		
        renderizarAdmins();

        fecharModalEdicaoAdmin();


        alert(
            "Administrador atualizado com sucesso!"
        );

    });

}

// ---------- REMOVER ADMIN ----------

function configurarBotoesRemoverAdmin() {

    const removeButtons =
        document.querySelectorAll(".admin-remove-button");

    removeButtons.forEach((button) => {

        button.addEventListener("click", () => {

            const index =
                Number(button.dataset.index);

            const admin =
                adminsData[index];

            if (!admin) return;
			
			if (admin.role === "owner") {
				alert("O Owner não pode ser removido.");
				return;
			}


            // NÃO PERMITIR REMOVER O ÚLTIMO ADMIN

            if (adminsData.length <= 1) {

                alert(
                    "O sistema precisa ter pelo menos um administrador."
                );

                return;

            }


            const confirmar =
                confirm(
                    `Tem certeza que deseja remover o administrador "${admin.nome}"?`
                );


            if (!confirmar) return;
			
			registrarAcao(`ADMIN REMOVIDO — ${admin.login}`);


            adminsData.splice(index, 1);


            renderizarAdmins();


            alert(
                "Administrador removido com sucesso!"
            );

        });

    });

}




//--------VARIAVEIS LOCAIS----------

let sistemaLevels;

let adminsData = [
    {
        login: "admin",
        nome: "Administrador",
		role: "owner"
    }
];

let adminLog = [];



// ---------- LOAD RANKING ----------

const usersTableBody = document.querySelector("#users-table-body");

let rankingData = [];

if (usersTableBody) {

    Promise.all([
        fetch("../data/ranking.json"),
        fetch("../data/levels.json")
    ])

        .then(async ([rankingResponse, levelsResponse]) => {

            if (!rankingResponse.ok) {
                throw new Error("Não foi possível carregar o ranking.");
            }

            if (!levelsResponse.ok) {
                throw new Error("Não foi possível carregar o sistema de níveis.");
            }

            const ranking = await rankingResponse.json();
            sistemaLevels = await levelsResponse.json();

            return ranking;

        })

        .then((ranking) => {

            rankingData = ranking;

            // Ordena do maior para o menor XP
            rankingData.sort((a, b) => b.pontos - a.pontos);

            renderizarUsuarios();

        })

        .catch((error) => {

            console.error(error);

            usersTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="5"
                        class="users-empty"
                    >
                        ERRO AO CARREGAR RANKING
                    </td>
                </tr>
            `;

        });

}

// ---------- LOAD CHALLENGE ----------

let challengeData = null;

async function carregarDesafio() {
    try {
        const response = await fetch("../data/challenge.json");

        if (!response.ok) {
            throw new Error("Não foi possível carregar o desafio.");
        }

        challengeData = await response.json();

        const titleInput = document.querySelector("#challenge-title");
        const descriptionInput = document.querySelector("#challenge-description");
        const rewardInput = document.querySelector("#challenge-reward");

        if (titleInput) {
            titleInput.value = challengeData.titulo || "";
        }

        if (descriptionInput) {
            descriptionInput.value = challengeData.descricao || "";
        }

        if (rewardInput) {
            rewardInput.value = challengeData.recompensa ?? 0;
        }

    } catch (error) {
        console.error("Erro ao carregar desafio:", error);
    }
}

carregarDesafio();

const saveChallengeButton = document.querySelector("#save-challenge-button");

if (saveChallengeButton) {

    saveChallengeButton.addEventListener("click", async () => {

        const titleInput =
            document.querySelector("#challenge-title");

        const descriptionInput =
            document.querySelector("#challenge-description");

        const rewardInput =
            document.querySelector("#challenge-reward");


        const titulo =
            titleInput.value.trim();

        const descricao =
            descriptionInput.value.trim();

        const recompensa =
            Number(rewardInput.value);


        // =========================
        // VALIDAÇÕES
        // =========================

        if (titulo === "") {

            alert("O título do desafio não pode estar vazio.");

            titleInput.focus();

            return;
        }


        if (descricao === "") {

            alert("A descrição do desafio não pode estar vazia.");

            descriptionInput.focus();

            return;
        }


        if (!Number.isInteger(recompensa) || recompensa < 0) {

            alert("A recompensa precisa ser um número inteiro válido.");

            rewardInput.focus();

            return;
        }


        // =========================
        // DADOS DO DESAFIO
        // =========================

        const novoDesafio = {

            titulo: titulo,

            descricao: descricao,

            recompensa: recompensa

        };


        // =========================
        // SESSÃO
        // =========================

        const session =
            sessionStorage.getItem("vought_session");


        if (!session) {

            alert("Sessão inválida. Faça login novamente.");

            window.location.href = "login.html";

            return;
        }


        // =========================
        // SALVAR NA API
        // =========================

        try {

            const response = await fetch(
                "https://vought-arcade-api.vought-art-api.workers.dev/api/challenge",
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${session}`

                    },

                    body: JSON.stringify(novoDesafio)

                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                if (response.status === 401) {

                    sessionStorage.removeItem(
                        "vought_session"
                    );

                    alert(
                        "Sua sessão expirou. Faça login novamente."
                    );

                    window.location.href =
                        "login.html";

                    return;
                }


                console.error(
                    "Erro ao salvar desafio:",
                    data
                );

                alert(
                    "Não foi possível salvar o desafio."
                );

                return;
            }


            // =========================
            // ATUALIZAR MEMÓRIA LOCAL
            // =========================

            challengeData =
                novoDesafio;


            alert(
                "Desafio atualizado com sucesso!"
            );


        } catch (error) {

            console.error(
                "Erro ao conectar com a API:",
                error
            );

            alert(
                "Não foi possível conectar ao servidor."
            );

        }

    });

}


// ---------- CALCULAR LEVEL ----------

function calcularLevel(pontos) {

    let level = 1;
    let xpRestante = pontos;

    while (level < 15) {

        const xpNecessario = calcularXPDoNivel(level);

        if (xpRestante < xpNecessario) {
            return level;
        }

        xpRestante -= xpNecessario;

        level++;

    }


    // Depois da estabilização,
    // cada level custa 1000 XP

    if (xpRestante >= 1000) {

        level += Math.floor(xpRestante / 1000);

    }


    return level;

}


// ---------- XP NECESSÁRIO PARA O LEVEL ----------

function calcularXPDoNivel(level) {

    const base = sistemaLevels.baseXP;
    const limite = 1000;

    if (level <= 6) {

        return Math.floor(
            base *
            Math.pow(
                sistemaLevels.multiplicador,
                level - 1
            )
        );

    }


    const xpAnterior =
        calcularXPDoNivel(level - 1);

    const crescimento =
        (limite - xpAnterior) * 0.45;


    return Math.min(
        limite,
        Math.round(
            xpAnterior + crescimento
        )
    );

}

		//---------ATUALIZAR DASHBOARD-----------------/

function atualizarDashboard() {
    const dashboardUsers = document.querySelector("#dashboard-users");
    const dashboardTopPlayer = document.querySelector("#dashboard-top-player");
    const dashboardTotalXp = document.querySelector("#dashboard-total-xp");
    const dashboardChallenge = document.querySelector("#dashboard-challenge");

    if (dashboardUsers) {
        dashboardUsers.textContent = rankingData.length;
    }

    if (dashboardTopPlayer) {
        if (rankingData.length > 0) {
            dashboardTopPlayer.textContent = rankingData[0].nome;
        } else {
            dashboardTopPlayer.textContent = "---";
        }
    }

    if (dashboardTotalXp) {
        const totalXp = rankingData.reduce((total, usuario) => {
            return total + usuario.pontos;
        }, 0);

        dashboardTotalXp.textContent = totalXp.toLocaleString("pt-BR");
    }

    if (dashboardChallenge) {
        dashboardChallenge.textContent = "ATIVO";
    }
}

		//---------------DASHLOG---------------

function renderizarAdminLog() {
    const adminLogList = document.querySelector("#admin-log-list");

    if (!adminLogList) return;

    adminLogList.innerHTML = "";

    if (adminLog.length === 0) {
        adminLogList.innerHTML = `
            <div class="admin-log-item">
                NENHUMA AÇÃO REGISTRADA.
            </div>
        `;

        return;
    }

    adminLog.slice(0, 5).forEach((acao) => {
        const item = document.createElement("div");

        item.className = "admin-log-item";
        item.textContent = acao;

        adminLogList.appendChild(item);
    });
}

renderizarAdminLog();

function registrarAcao(mensagem) {
    adminLog.unshift(mensagem);

    if (adminLog.length > 5) {
        adminLog = adminLog.slice(0, 5);
    }

    renderizarAdminLog();
}






// ---------- RENDERIZAR USUÁRIOS ----------

function renderizarUsuarios() {

    usersTableBody.innerHTML = "";

    rankingData.forEach((usuario, index) => {

        const levelAtual =
            calcularLevel(usuario.pontos);

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>
                ${index + 1}
            </td>

            <td>
                ${usuario.nome}
            </td>

            <td>
                ${usuario.pontos.toLocaleString("pt-BR")}
            </td>

            <td>
                LV. ${levelAtual}
            </td>

            <td class="user-actions">

				<button
				type="button"
				class="user-edit-button"
				data-index="${index}"
			>
				EDITAR
			</button>

			<button
				type="button"
				class="user-remove-button"
				data-index="${index}"
			>
				REMOVER
			</button>
            </td>
        `;

        usersTableBody.appendChild(row);

    });
	
configurarBotoesEditar();
configurarBotoesRemover();
atualizarDashboard();
renderizarPreview();

}

		//------------ATUALIZAR RANK--------------/

function renderizarPreview() {
    const previewRanking = document.querySelector("#preview-ranking");

    if (!previewRanking) return;

    previewRanking.innerHTML = "";

    rankingData.forEach((usuario, index) => {
        const posicao = index + 1;

        let classeTop = "";

        if (posicao === 1) {
            classeTop = "top-1";
        } else if (posicao === 2) {
            classeTop = "top-2";
        } else if (posicao === 3) {
            classeTop = "top-3";
        }

        const linha = document.createElement("div");

        linha.className = `preview-ranking-row ${classeTop}`;

        linha.innerHTML = `
            <div class="preview-position">
                #${posicao}
            </div>

            <div class="preview-name">
                ${usuario.nome}
            </div>

            <div class="preview-xp">
                ${usuario.pontos.toLocaleString("pt-BR")} XP
            </div>

            <div class="preview-level">
                LV. ${calcularLevel(usuario.pontos)}
            </div>
        `;

        previewRanking.appendChild(linha);
    });
}


		//----------------RENDERIZAR ADMINS---------------

function renderizarAdmins() {
    const adminsTableBody =
        document.querySelector("#admins-table-body");

    if (!adminsTableBody) return;

    adminsTableBody.innerHTML = "";

    adminsData.forEach((admin, index) => {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>
                ${admin.login}
            </td>

            <td>
                ${admin.nome}
            </td>

            <td>
                <div class="admin-actions">

                    <button
                        type="button"
                        class="admin-edit-button"
                        data-index="${index}"
                    >
                        EDITAR
                    </button>

                    <button
                        type="button"
                        class="admin-remove-button"
                        data-index="${index}"
                    >
                        REMOVER
                    </button>

                </div>
            </td>
        `;

        adminsTableBody.appendChild(row);
    });
	
configurarBotoesEditarAdmin();
configurarBotoesRemoverAdmin();

}

renderizarAdmins();


// ---------- USER SEARCH ----------

const userSearch = document.querySelector("#user-search");

if (userSearch) {

    userSearch.addEventListener("input", () => {

        const searchTerm = userSearch.value
            .trim()
            .toLowerCase();


        // Nenhuma busca: mostra todos
        if (searchTerm === "") {

            renderizarUsuarios();

            return;

        }


        // Filtra os usuários pelo nome
        const usuariosFiltrados = rankingData.filter((usuario) => {

            return usuario.nome
                .toLowerCase()
                .includes(searchTerm);

        });


        // Guarda temporariamente o ranking original
        const rankingOriginal = rankingData;

        // Renderiza somente os resultados encontrados
        rankingData = usuariosFiltrados;

        renderizarUsuarios();

        // Recupera o ranking completo
        rankingData = rankingOriginal;

    });

}

// ---------- ADD USER MODAL ----------

const addUserButton =
    document.querySelector("#add-user-button");

const addUserModal =
    document.querySelector("#add-user-modal");

const addUserClose =
    document.querySelector("#add-user-close");

const addUserCancel =
    document.querySelector("#add-user-cancel");


function abrirModalUsuario() {

    if (!addUserModal) return;

    addUserModal.style.display = "flex";

}


function fecharModalUsuario() {

    if (!addUserModal) return;

    addUserModal.style.display = "none";

}


// Abrir modal
if (addUserButton) {

    addUserButton.addEventListener("click", () => {

        abrirModalUsuario();

    });

}


// Fechar pelo X
if (addUserClose) {

    addUserClose.addEventListener("click", () => {

        fecharModalUsuario();

    });

}


// Fechar pelo botão CANCELAR
if (addUserCancel) {

    addUserCancel.addEventListener("click", () => {

        fecharModalUsuario();

    });

}


// Fechar clicando fora do modal
if (addUserModal) {

    addUserModal.addEventListener("click", (event) => {

        if (event.target === addUserModal) {

            fecharModalUsuario();

        }

    });

}

// ---------- EDIT USER MODAL ----------

const editUserModal =
    document.querySelector("#edit-user-modal");

const editUserClose =
    document.querySelector("#edit-user-close");

const editUserCancel =
    document.querySelector("#edit-user-cancel");

const editUserName =
    document.querySelector("#edit-user-name");

const editUserPoints =
    document.querySelector("#edit-user-points");

const editUserCurrentPhoto =
    document.querySelector("#edit-user-current-photo");


// Usuário atualmente sendo editado
let usuarioEditando = null;


// ---------- ABRIR E PREENCHER MODAL ----------

function abrirModalEdicao(index) {

    if (!editUserModal) return;

    const usuario = rankingData[index];

    if (!usuario) return;


    usuarioEditando = index;


    // Preencher nome
    editUserName.value = usuario.nome;


    // Preencher XP
    editUserPoints.value = usuario.pontos;


    // Carregar foto atual
    editUserCurrentPhoto.src =
        `../assets/profile/${usuario.nome}.png`;


    // Caso a foto não exista
    editUserCurrentPhoto.onerror = () => {

        editUserCurrentPhoto.src =
            "../assets/profile/default.png";

    };


    // Abrir modal
    editUserModal.style.display = "flex";

}


// ---------- FECHAR MODAL ----------

function fecharModalEdicao() {

    if (!editUserModal) return;

    editUserModal.style.display = "none";

    usuarioEditando = null;

}


// ---------- BOTÕES EDITAR ----------

function configurarBotoesEditar() {

    const editButtons =
        document.querySelectorAll(".user-edit-button");


    editButtons.forEach((button) => {

        button.addEventListener("click", () => {

            const index =
                Number(button.dataset.index);

            abrirModalEdicao(index);

        });

    });

}

function configurarBotoesRemover() {
    const removeButtons = document.querySelectorAll(".user-remove-button");

    removeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const index = Number(button.dataset.index);
            const usuario = rankingData[index];

            if (!usuario) return;

            const confirmar = confirm(
                `Tem certeza que deseja remover o usuário "${usuario.nome}"?`
            );

            if (!confirmar) return;

            rankingData.splice(index, 1);

            renderizarUsuarios();
        });
    });
}


// Fechar pelo X
if (editUserClose) {

    editUserClose.addEventListener("click", () => {

        fecharModalEdicao();

    });

}


// Fechar pelo botão CANCELAR
if (editUserCancel) {

    editUserCancel.addEventListener("click", () => {

        fecharModalEdicao();

    });

}


// Fechar clicando fora
if (editUserModal) {

    editUserModal.addEventListener("click", (event) => {

        if (event.target === editUserModal) {

            fecharModalEdicao();

        }

    });

}

// ---------- EDITAR USUÁRIO ----------

const editUserForm = document.querySelector("#edit-user-form");

if (editUserForm) {

    editUserForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        if (usuarioEditando === null) return;

        const nome =
            editUserName.value.trim();

        const pontos =
            Number(editUserPoints.value);


        // =========================
        // VALIDAÇÕES
        // =========================

        if (nome === "") {

            alert(
                "O nome do usuário não pode estar vazio."
            );

            editUserName.focus();

            return;
        }


        if (
            !Number.isInteger(pontos) ||
            pontos < 0
        ) {

            alert(
                "O XP precisa ser um número inteiro válido."
            );

            editUserPoints.focus();

            return;
        }


        // =========================
        // VERIFICAR DUPLICADO
        // =========================

        const usuarioExiste =
            rankingData.some((usuario, index) => {

                if (index === usuarioEditando) {
                    return false;
                }

                return (
                    usuario.nome.toLowerCase() ===
                    nome.toLowerCase()
                );

            });


        if (usuarioExiste) {

            alert(
                "Já existe um usuário com esse nome."
            );

            editUserName.focus();

            return;
        }


        // =========================
        // CRIAR NOVO RANKING
        // =========================

        const novoRanking =
            rankingData.map((usuario, index) => {

                if (index === usuarioEditando) {

                    return {
                        ...usuario,
                        nome: nome,
                        pontos: pontos
                    };

                }

                return usuario;

            });


        // =========================
        // ORDENAR RANKING
        // =========================

        novoRanking.sort(
            (a, b) => b.pontos - a.pontos
        );


        // =========================
        // SESSÃO
        // =========================

        const session =
            sessionStorage.getItem(
                "vought_session"
            );


        if (!session) {

            alert(
                "Sessão inválida. Faça login novamente."
            );

            window.location.href =
                "login.html";

            return;
        }


        // =========================
        // ENVIAR PARA API
        // =========================

        try {

            const response =
                await fetch(
                    "https://vought-arcade-api.vought-art-api.workers.dev/api/ranking",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${session}`
                        },

                        body:
                            JSON.stringify(
                                novoRanking
                            )
                    }
                );


            const data =
                await response.json();


            // =========================
            // ERRO DE AUTENTICAÇÃO
            // =========================

            if (!response.ok) {

                if (
                    response.status === 401
                ) {

                    sessionStorage.removeItem(
                        "vought_session"
                    );

                    alert(
                        "Sua sessão expirou. Faça login novamente."
                    );

                    window.location.href =
                        "login.html";

                    return;
                }


                console.error(
                    "Erro ao editar ranking:",
                    data
                );

                alert(
                    "Não foi possível salvar as alterações."
                );

                return;
            }


            // =========================
            // ATUALIZAR RANKING LOCAL
            // =========================

            rankingData =
                novoRanking;


            renderizarUsuarios();


            // =========================
            // FECHAR MODAL
            // =========================

            fecharModalEdicao();


            // =========================
            // LOG
            // =========================

            registrarAcao(
                `USUÁRIO EDITADO — ${nome}`
            );


            alert(
                "Usuário atualizado com sucesso!"
            );


        } catch (error) {

            console.error(
                "Erro ao conectar com a API:",
                error
            );

            alert(
                "Não foi possível conectar ao servidor."
            );

        }

    });

}

// ---------- ADICIONAR NOVO USUÁRIO ----------
const addUserForm =
    document.querySelector("#add-user-form");

if (addUserForm) {

    addUserForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const nameInput =
            document.querySelector("#add-user-name");

        const pointsInput =
            document.querySelector("#add-user-points");

        const nome =
            nameInput.value.trim();

        const pontos =
            Number(pointsInput.value);


        // =========================
        // VALIDAÇÕES
        // =========================

        if (nome === "") {

            alert(
                "O nome do usuário não pode estar vazio."
            );

            nameInput.focus();

            return;
        }


        if (
            !Number.isInteger(pontos) ||
            pontos < 0
        ) {

            alert(
                "O XP inicial precisa ser um número inteiro válido."
            );

            pointsInput.focus();

            return;
        }


        // =========================
        // VERIFICAR DUPLICADO
        // =========================

        const usuarioExiste =
            rankingData.some((usuario) => {

                return (
                    usuario.nome.toLowerCase() ===
                    nome.toLowerCase()
                );

            });


        if (usuarioExiste) {

            alert(
                "Já existe um usuário com esse nome."
            );

            nameInput.focus();

            return;
        }


        // =========================
        // CRIAR USUÁRIO
        // =========================

        const novoUsuario = {

            nome: nome,

            pontos: pontos

        };


        // =========================
        // CRIAR NOVO RANKING
        // =========================

        const novoRanking = [

            ...rankingData,

            novoUsuario

        ];


        novoRanking.sort(
            (a, b) => b.pontos - a.pontos
        );


        // =========================
        // SESSÃO
        // =========================

        const session =
            sessionStorage.getItem(
                "vought_session"
            );


        if (!session) {

            alert(
                "Sessão inválida. Faça login novamente."
            );

            window.location.href =
                "login.html";

            return;
        }


        // =========================
        // ENVIAR PARA API
        // =========================

        try {

            const response =
                await fetch(
                    "https://vought-arcade-api.vought-art-api.workers.dev/api/ranking",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${session}`

                        },

                        body:
                            JSON.stringify(
                                novoRanking
                            )

                    }
                );


            const data =
                await response.json();


            // =========================
            // ERRO DE AUTENTICAÇÃO
            // =========================

            if (!response.ok) {

                if (
                    response.status === 401
                ) {

                    sessionStorage.removeItem(
                        "vought_session"
                    );

                    alert(
                        "Sua sessão expirou. Faça login novamente."
                    );

                    window.location.href =
                        "login.html";

                    return;
                }


                console.error(
                    "Erro ao salvar ranking:",
                    data
                );

                alert(
                    "Não foi possível salvar o ranking."
                );

                return;
            }


            // =========================
            // ATUALIZAR RANKING LOCAL
            // =========================

            rankingData =
                novoRanking;


            renderizarUsuarios();


            // =========================
            // LIMPAR E FECHAR
            // =========================

            fecharModalUsuario();

            addUserForm.reset();


            // =========================
            // LOG
            // =========================

            registrarAcao(
                `USUÁRIO ADICIONADO — ${nome}`
            );


            alert(
                "Usuário adicionado com sucesso!"
            );


        } catch (error) {

            console.error(
                "Erro ao conectar com a API:",
                error
            );

            alert(
                "Não foi possível conectar ao servidor."
            );

        }

    });

}