/* ═══════════════════════════════════════════════════════════════════════════════
   CTIA — app.js  v3
   Client-folder navigation, ensaio CRUD, QR, gallery, print label,
   technical results, PDF export, analytics dashboard
   ═══════════════════════════════════════════════════════════════════════════════ */

const API_CLIENTES = '/api/clientes';
const API_ENSAIOS = '/api/ensaios';
const API_CONFIG = '/api/configuracoes';
const API_DESENVOLVIMENTOS = '/api/desenvolvimentos';

// Global error reporter for debugging silent crashes
window.onerror = function(msg, url, line, col, error) {
    const errText = error ? error.stack : msg;
    alert("CTIA OOPS! JS Crash detected:\n" + errText);
    return false;
};
window.addEventListener("unhandledrejection", function(e) {
    alert("CTIA OOPS! Unhandled Promise Rejection:\n" + (e.reason && e.reason.stack ? e.reason.stack : e.reason));
});

// ─── AUTH INTERCEPTOR & STATE ────────────────────────────────────────────────
function getToken() { return localStorage.getItem('token'); }

window.testPhotos = { Bally: [], Veslic: [], Dinamo: [], Hidrolise: [] };

window.handleTestPhotoSelect = function(e, category) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(file => {
        getBase64(file).then(base64 => {
            window.testPhotos[category] = window.testPhotos[category] || [];
            window.testPhotos[category].push({ file: file, base64: base64 });
            window.renderTestPhotosPreview(category);
        });
    });
    e.target.value = ''; // Reset
};

window.renderTestPhotosPreview = function(category) {
    const container = document.getElementById(`preview${category}`);
    if (!container) return;
    container.innerHTML = '';
    
    (window.testPhotos[category] || []).forEach((photoObj, index) => {
        const item = document.createElement('div');
        item.style.position = 'relative';
        item.style.width = '60px';
        item.style.height = '60px';
        item.style.borderRadius = '6px';
        item.style.overflow = 'hidden';
        item.style.border = '1px solid #d1d5db';
        item.style.marginTop = '8px';
        
        const img = document.createElement('img');
        img.src = photoObj.base64;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        
        const btnRemover = document.createElement('button');
        btnRemover.innerHTML = '×';
        btnRemover.style.position = 'absolute';
        btnRemover.style.top = '2px';
        btnRemover.style.right = '4px';
        btnRemover.style.background = 'rgba(0,0,0,0.6)';
        btnRemover.style.color = 'white';
        btnRemover.style.border = 'none';
        btnRemover.style.borderRadius = '50%';
        btnRemover.style.width = '16px';
        btnRemover.style.height = '16px';
        btnRemover.style.fontSize = '12px';
        btnRemover.style.lineHeight = '14px';
        btnRemover.style.cursor = 'pointer';
        btnRemover.style.padding = '0';
        
        btnRemover.onclick = () => {
            window.testPhotos[category].splice(index, 1);
            window.renderTestPhotosPreview(category);
        };
        
        item.appendChild(img);
        item.appendChild(btnRemover);
        container.appendChild(item);
    });
};

function handleAuthError() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/login.html';
}

// Sobrescreve a API nativa do Fetch para sempre injetar o Bearer Token
const originalFetch = window.fetch;
window.fetch = async function () {
    let [resource, config] = arguments;
    if (!config) config = {};

    // Ignorar rotas públicas
    if (typeof resource === 'string' && (resource.includes('/api/auth/login') || resource.includes('/api/public') || resource.includes('/login.html'))) {
        return originalFetch(resource, config);
    }

    if (!config.headers) config.headers = {};
    const token = getToken();

    if (token) {
        if (config.headers instanceof Headers) {
            config.headers.append('Authorization', `Bearer ${token}`);
        } else {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    }

    try {
        const response = await originalFetch(resource, config);
        // Se a API retornar 401 ou 403, o token expirou ou é inválido
        if (response.status === 401 || response.status === 403) {
            handleAuthError();
        }
        return response;
    } catch (err) {
        throw err;
    }
};

async function checkAuthSession() {
    const token = getToken();
    if (!token) {
        window.location.href = '/login.html';
        return false;
    }
    try {
        const res = await originalFetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) { handleAuthError(); return false; }
        const data = await res.json();

        // Atualiza a UI do Header com os dados logados
        if (data.usuario) {
            const nameEl = document.getElementById('userNameDisplay');
            const roleEl = document.getElementById('userRoleDisplay');
            if (nameEl) nameEl.textContent = data.usuario.nome || 'Usuário';
            if (roleEl) roleEl.textContent = data.usuario.cargo || 'Analista';
            
            // Save globally for logic checks
            window.currentUserRole = data.usuario.cargo;
            window.currentUserEmail = data.usuario.email;
            window.currentUserPerms = data.usuario.permissoes || { dashboard: true, ped: true, kanban: true, producao: true };
            currentAnalyst = data.usuario.nome || 'Usuário';
            
            // Controle de Visibilidade do botão de Configuração
            const btnConfiguracoes = document.getElementById('btnConfiguracoes');
            if (btnConfiguracoes) {
                if (window.currentUserRole === 'Gestor' || window.currentUserRole === 'Administrador') {
                    btnConfiguracoes.style.display = 'flex';
                } else {
                    btnConfiguracoes.style.display = 'none';
                }
            }
            
            // Controle de Visibilidade dos Menus Customizados (RBAC)
            const p = window.currentUserPerms;
            const bDash = document.getElementById('btnDashboard');
            const bPed = document.getElementById('btnDesenvolvimentos');
            const bKan = document.getElementById('btnKanban');
            const bProd = document.getElementById('btnProducao');
            
            if (bDash) bDash.style.display = p.dashboard ? 'flex' : 'none';
            if (bPed) bPed.style.display = p.ped ? 'flex' : 'none';
            if (bKan) bKan.style.display = p.kanban ? 'flex' : 'none';
            if (bProd) bProd.style.display = p.producao ? 'flex' : 'none';
        }
        return true;
    } catch (err) {
        return true; // Se a rede cair, mantém o cache temporário
    }
}

// Bind Logout Button
document.addEventListener('DOMContentLoaded', () => {
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) btnLogout.addEventListener('click', handleAuthError);
});

// ─── State ───────────────────────────────────────────────────────────────────
let currentView = 'clientes'; // 'clientes' | 'ensaios' | 'dashboard' | 'desenvolvimentos'

let currentCliente = null;
let allClientes = [];
let allEnsaios = [];
let allDesenvolvimentos = [];
let currentAnalystObj = null;
let currentDevDetalhesId = null;
let currentDevToEnsaioId = null;
let currentEnsaioId = null;
let chartAprovacao = null;
let chartVolume = null;
let chartFalhas = null;
let systemSettings = {}; // Global settings for PDF signatures/footer
let dashboardRawData = []; // Armazena todos os ensaios do dashboard para filtros
let currentAnalyst = null;

// ─── DOM refs ────────────────────────────────────────────────────────────────
const searchInput = document.getElementById('searchInput');
const cardsGrid = document.getElementById('cardsGrid');
const emptyState = document.getElementById('emptyState');
const emptyTitle = document.getElementById('emptyTitle');
const emptyMsg = document.getElementById('emptyMsg');
const fab = document.getElementById('fab');
const logoHome = document.getElementById('logoHome');
const breadcrumb = document.getElementById('breadcrumb');
const breadcrumbText = document.getElementById('breadcrumbText');
const btnVoltar = document.getElementById('btnVoltar');
const clientesList = document.getElementById('clientesList');
const statsBar = document.getElementById('statsBar');
const statTotal = document.getElementById('statTotal');
const statBally = document.getElementById('statBally');
const statVeslic = document.getElementById('statVeslic');
const statDinamo = document.getElementById('statDinamo');
const statHidro = document.getElementById('statHidro');

// Dashboard
const dashboardView = document.getElementById('dashboardView');
const dashCounters = document.getElementById('dashCounters');
const dashFilterPeriodo = document.getElementById('dashFilterPeriodo');
const dashFilterCliente = document.getElementById('dashFilterCliente');
const btnDashboard = document.getElementById('btnDashboard');

// P&D (Desenvolvimentos)
const btnDesenvolvimentos = document.getElementById('btnDesenvolvimentos');
const desenvolvimentosView = document.getElementById('desenvolvimentosView');
const gridDesenvolvimentos = document.getElementById('gridDesenvolvimentos');
const btnNovoDesenvolvimentoView = document.getElementById('btnNovoDesenvolvimentoView');
const modalNovoDesenvolvimento = document.getElementById('modalNovoDesenvolvimento');
const btnFecharNovoDesenvolvimento = document.getElementById('btnFecharNovoDesenvolvimento');
const btnCancelNovoDesenvolvimento = document.getElementById('btnCancelNovoDesenvolvimento');
const desenvolvimentoForm = document.getElementById('desenvolvimentoForm');
const devFotoFile = document.getElementById('devFotoFile');
const devFotoFileName = document.getElementById('devFotoFileName');
const devFotoPreview = document.getElementById('devFotoPreview');
const devCliente = document.getElementById('devCliente');
const devProjeto = document.getElementById('devProjeto');
const devDescricao = document.getElementById('devDescricao');

// Kanban
const btnKanban = document.getElementById('btnKanban');
const kanbanView = document.getElementById('kanbanView');
const kanbanFilterCliente = document.getElementById('kanbanFilterCliente');

// Produção (PCP)
const btnProducao = document.getElementById('btnProducao');
const producaoView = document.getElementById('producaoView');

const colRecebidas = document.getElementById('cards-recebidas');
const colEnsaio = document.getElementById('cards-ensaio');
const colLaudo = document.getElementById('cards-laudo');

const countRecebidas = document.getElementById('count-recebidas');
const countEnsaio = document.getElementById('count-ensaio');
const countLaudo = document.getElementById('count-laudo');

const btnNovaAmostraTriagem = document.getElementById('btnNovaAmostraTriagem');
const modalTriagem = document.getElementById('modalTriagem');
const btnFecharTriagem = document.getElementById('btnFecharTriagem');
const btnCancelTriagem = document.getElementById('btnCancelTriagem');
const triagemForm = document.getElementById('triagemForm');
const triagemCliente = document.getElementById('triagemCliente');
const triagemData = document.getElementById('triagemData');
const triagemAP = document.getElementById('triagemAP');
const triagemRef = document.getElementById('triagemRef');
const triagemModelo = document.getElementById('triagemModelo');
const triagemSubstrato = document.getElementById('triagemSubstrato');

// Cliente Form
const modalCliente = document.getElementById('modalCliente');
const clienteForm = document.getElementById('clienteForm');
const clienteFormTitle = document.getElementById('clienteFormTitle');
const clienteFormId = document.getElementById('clienteFormId');
const clienteFormNome = document.getElementById('clienteFormNome');
const clienteFormLogo = document.getElementById('clienteFormLogo');
const btnFecharCliente = document.getElementById('btnFecharCliente');
const btnCancelCliente = document.getElementById('btnCancelCliente');

// Detalhes
const modalDetalhes = document.getElementById('modalDetalhes');
const btnFecharDetalhes = document.getElementById('btnFecharDetalhes');
const modalCoverImg = document.getElementById('modalCoverImg');
const modalCoverPlaceholder = document.getElementById('modalCoverPlaceholder');
const modalBadge = document.getElementById('modalBadge');
const modalData = document.getElementById('modalData');
const modalRastreio = document.getElementById('modalRastreio');
const modalAP = document.getElementById('modalAP');
const modalRef = document.getElementById('modalRef');
const modalArmario = document.getElementById('modalArmario');
const modalPrateleira = document.getElementById('modalPrateleira');
const modalCaixa = document.getElementById('modalCaixa');
const modalLocationGrid = document.getElementById('modalLocationGrid');
const badgeRetirado = document.getElementById('badgeRetirado');
// Descrição & Kanban (Trello extension)
const formDescricao = document.getElementById('formDescricao');
const formEtiquetasValue = document.getElementById('formEtiquetasValue');

// Parâmetros de Aplicação
const formParamTemp = document.getElementById('formParamTemp');
const formParamTempo = document.getElementById('formParamTempo');
const formParamPressao = document.getElementById('formParamPressao');
const modalAtividadesFlow = document.getElementById('modalAtividadesFlow');
const inputNovaAtividade = document.getElementById('inputNovaAtividade');
const btnPostarAtividade = document.getElementById('btnPostarAtividade');
const modalDescricaoSection = document.getElementById('modalDescricaoSection');
const modalDescricaoText = document.getElementById('modalDescricaoText');
const modalEtiquetasContainer = document.getElementById('modalEtiquetasContainer');
const modalRede = document.getElementById('modalRede');
const modalRedeSection = document.getElementById('modalRedeSection');
const btnCopiarRede = document.getElementById('btnCopiarRede');
const btnAbrirRede = document.getElementById('btnAbrirRede');
const btnImprimirEtiqueta = document.getElementById('btnImprimirEtiqueta');
const btnEditarDetalhes = document.getElementById('btnEditarDetalhes');
const btnExcluirDetalhes = document.getElementById('btnExcluirDetalhes');
const btnExportarPDF = document.getElementById('btnExportarPDF');
// btnGerarDossie removed — unified into single export button
const btnMarcarRetirado = document.getElementById('btnMarcarRetirado');
const modalQrCode = document.getElementById('modalQrCode');
const qrLabel = document.getElementById('qrLabel');
const modalGaleriaSection = document.getElementById('modalGaleriaSection');
const modalGallery = document.getElementById('modalGallery');
const modalResultados = document.getElementById('modalResultados');
const modalResultadoGrid = document.getElementById('modalResultadoGrid');
const modalConclusao = document.getElementById('modalConclusao');
const modalConclusaoBadge = document.getElementById('modalConclusaoBadge');

// Ensaio Form
const modalForm = document.getElementById('modalForm');
const btnFecharForm = document.getElementById('btnFecharForm');
const btnCancelForm = document.getElementById('btnCancelForm');
const ensaioForm = document.getElementById('ensaioForm');
const formTitle = document.getElementById('formTitle');
const formId = document.getElementById('formId');
const formCliente = document.getElementById('formCliente');
const formData = document.getElementById('formData');
const formTipo = document.getElementById('formTipo');
const formAP = document.getElementById('formAP');
const formRef = document.getElementById('formRef');

// Identificação Avançada Vulcabras
const formProjeto = document.getElementById('formProjeto');
const formModelo = document.getElementById('formModelo');
const formCor = document.getElementById('formCor');
const formFornecedorAmostra = document.getElementById('formFornecedorAmostra');
const formSubstrato = document.getElementById('formSubstrato');
const formTecnologia = document.getElementById('formTecnologia');
const formCategoriaAmostra = document.getElementById('formCategoriaAmostra');
const formFinalidadeAmostra = document.getElementById('formFinalidadeAmostra');

const formArmario = document.getElementById('formArmario');
const formPrateleira = document.getElementById('formPrateleira');
const formCaixa = document.getElementById('formCaixa');
const formRede = document.getElementById('formRede');
const formCapa = document.getElementById('formCapa');
const formImagens = document.getElementById('formImagens');
const formCategoriaFoto = document.getElementById('formCategoriaFoto');
const filePreview = document.getElementById('filePreview');

// Result form fields (Vulcabras expanded)
const formCondicaoStress = document.getElementById('formCondicaoStress');
const formCiclosAM1 = document.getElementById('formCiclosAM1');
const formCiclosAM2 = document.getElementById('formCiclosAM2');
const formCiclosSecoAM1 = document.getElementById('formCiclosSecoAM1');
const formCiclosSecoAM2 = document.getElementById('formCiclosSecoAM2');
const formCiclosUmidoAM1 = document.getElementById('formCiclosUmidoAM1');
const formCiclosUmidoAM2 = document.getElementById('formCiclosUmidoAM2');
const formTransferencia = document.getElementById('formTransferencia');
const formVisual = document.getElementById('formVisual');
const formForcaAM1 = document.getElementById('formForcaAM1');
const formForcaAM2 = document.getElementById('formForcaAM2');
const formFalhaDinamometro = document.getElementById('formFalhaDinamometro');
const formConclusao = document.getElementById('formConclusao');
const formObservacoes = document.getElementById('formObservacoes');

const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');

// Configuracoes
const btnConfiguracoes = document.getElementById('btnConfiguracoes');
const configOverlay = document.getElementById('configOverlay');
const btnSairConfig = document.getElementById('btnSairConfig');
const btnCancelarConfig = document.getElementById('btnCancelarConfig');
const configForm = document.getElementById('configForm');
const confAnalistaNome = document.getElementById('confAnalistaNome');
const confAnalistaCargo = document.getElementById('confAnalistaCargo');
const confGerenteNome = document.getElementById('confGerenteNome');
const confGerenteCargo = document.getElementById('confGerenteCargo');
const confEmpresaNome = document.getElementById('confEmpresaNome');
const confEmpresaEndereco = document.getElementById('confEmpresaEndereco');
const confEmpresaEmail = document.getElementById('confEmpresaEmail');
const confUrlPublica = document.getElementById('confUrlPublica');
const confSenhaAdmin = document.getElementById('confSenhaAdmin');
const btnEditarClienteAtual = document.getElementById('btnEditarClienteAtual');
const btnExcluirClienteNoModal = document.getElementById('btnExcluirClienteNoModal');
const kanbanBoard = document.getElementById('kanbanBoard');
const btnAdicionarColuna = document.getElementById('btnAdicionarColuna');

const BADGE_MAP = {
    'Bally': { cls: 'badge-bally', label: 'Bally' },
    'Veslic': { cls: 'badge-veslic', label: 'Veslic' },
    'Dinamômetro': { cls: 'badge-dinamometro', label: 'Dinamômetro' },
    'Hidrólise': { cls: 'badge-hidrolise', label: 'Hidrólise' },
    'Completo': { cls: 'badge-bally', label: 'Completo' },
    'Outros': { cls: 'badge-outros', label: 'Outros' },
};

// Helper Atividades
function updateEtiquetasValue() {
    const active = Array.from(document.querySelectorAll('.label-opt.active'))
        .map(opt => opt.dataset.name);
    formEtiquetasValue.value = active.join(',');
}

async function fetchAtividades(ensaioId) {
    if (!modalAtividadesFlow) return;
    try {
        const res = await fetch(`${API_ENSAIOS}/${ensaioId}/atividades`);
        const data = await res.json();
        modalAtividadesFlow.innerHTML = data.map(at => `
            <div class="activity-item">
                <div class="activity-avatar">${at.usuario[0].toUpperCase()}</div>
                <div class="activity-content">
                    <div class="activity-header">
                        <span class="activity-user">${escapeHtml(at.usuario)}</span>
                        <span class="activity-date">${formatDateTime(at.criado_em)}</span>
                    </div>
                    <div class="activity-text">${escapeHtml(at.texto)}</div>
                </div>
            </div>
        `).join('') || '<p style="font-size:0.85rem;color:var(--text-tertiary);">Nenhuma atividade registrada ainda.</p>';
        modalAtividadesFlow.scrollTop = modalAtividadesFlow.scrollHeight;
    } catch (err) {
        console.error("Erro atividades:", err);
    }
}

async function postarComentario() {
    const texto = inputNovaAtividade.value.trim();
    if (!texto || !currentEnsaioId) return;

    try {
        const res = await fetch(`${API_ENSAIOS}/${currentEnsaioId}/atividades`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texto, usuario: currentAnalyst || 'Analista' })
        });
        if (!res.ok) throw new Error("Erro ao postar");
        inputNovaAtividade.value = '';
        fetchAtividades(currentEnsaioId);
        showToast("Comentário adicionado.");
    } catch (err) {
        showToast("Falha ao comentar.");
    }
}

// Helper Atividades P&D
async function fetchAtividadesPD(devId) {
    const modalPDAtividadesFlow = document.getElementById('modalPDAtividadesFlow');
    if (!modalPDAtividadesFlow) return;
    try {
        // We reuse the same endpoint structure, but we'll fetch using devId
        // In the database, the ensaio_id column will hold the devId for P&D projects
        const res = await fetch(`${API_DESENVOLVIMENTOS}/${devId}/atividades`);
        const data = await res.json();
        modalPDAtividadesFlow.innerHTML = data.map(at => `
            <div class="activity-item">
                <div class="activity-avatar">${at.usuario[0].toUpperCase()}</div>
                <div class="activity-content">
                    <div class="activity-header">
                        <span class="activity-user">${escapeHtml(at.usuario)}</span>
                        <span class="activity-date">${formatDateTime(at.criado_em)}</span>
                    </div>
                    <div class="activity-text">${escapeHtml(at.texto)}</div>
                </div>
            </div>
        `).join('') || '<p style="font-size:0.85rem;color:var(--text-tertiary);">Nenhuma atividade registrada ainda.</p>';
        modalPDAtividadesFlow.scrollTop = modalPDAtividadesFlow.scrollHeight;
    } catch (err) {
        console.error("Erro atividades P&D:", err);
    }
}

async function postarComentarioPD() {
    const inputNovaAtividadePD = document.getElementById('inputNovaAtividadePD');
    const texto = inputNovaAtividadePD.value.trim();
    if (!texto || !currentDevDetalhesId) return;

    try {
        const res = await fetch(`${API_DESENVOLVIMENTOS}/${currentDevDetalhesId}/atividades`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texto, usuario: currentAnalyst || 'Analista' })
        });
        if (!res.ok) throw new Error("Erro ao postar");
        inputNovaAtividadePD.value = '';
        fetchAtividadesPD(currentDevDetalhesId);
        showToast("Comentário adicionado ao P&D.");
    } catch (err) {
        showToast("Falha ao comentar no P&D.");
    }
}

// ─── Lógica de Analistas (Depreciada - agora usa o login) ────────────────
function updateAnalystUI() {
    // No-op: UI removida do index.html. O currentAnalyst agora vem do checkAuthSession
}

function formatDateTime(str) {
    if (!str) return '';
    const d = new Date(str);
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// Helper para converter File para Base64
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// ─── Init ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Valida a sessão antes de carregar o sistema
    const isAuthed = await checkAuthSession();
    if (!isAuthed) return;

    // 2. Continua inicialização padrão
    showClientes();
    bindEvents();
    loadSystemConfig(); // Load PDF signatures/info and dynamic labels
    updateAnalystUI();
});

async function loadSystemConfig() {
    try {
        const res = await fetch(API_CONFIG);
        const config = await res.json();
        systemSettings = config;

        // Update logo if set
        if (systemSettings.empresa_logo) {
            localStorage.setItem('systemLogo', systemSettings.empresa_logo);
            if (document.getElementById('headerLogoImg')) {
                document.getElementById('headerLogoImg').src = systemSettings.empresa_logo;
            }
        }

        // Load dynamic labels
        if (systemSettings.etiquetas_config) {
            try {
                window.etiquetasConfig = JSON.parse(systemSettings.etiquetas_config);
            } catch (e) {
                console.error("Erro ao parsear etiquetas_config:", e);
                window.etiquetasConfig = [];
            }
        } else {
            window.etiquetasConfig = [];
        }
        renderFormEtiquetasSelector(); // Re-render labels in form
        updateAnalystUI(); // Update header with current analyst name

        // Re-render Kanban if it is the current view (fixes custom columns race condition)
        if (currentView === 'kanban') {
            renderKanbanBoard();
        }
    } catch (err) {
        console.error("Erro ao carregar config:", err);
    }
}

function bindEvents() {
    let debounce;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
            if (currentView === 'clientes') filterClientes();
            else if (currentView === 'ensaios') filterEnsaios();
        }, 200);
    });

    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); searchInput.focus(); }
        if (e.key === 'Escape') closeAllModals();
    });

    // Navigation
    logoHome.addEventListener('click', showClientes);
    btnVoltar.addEventListener('click', showClientes);
    btnDashboard.addEventListener('click', showDashboard);
    if (btnDesenvolvimentos) btnDesenvolvimentos.addEventListener('click', showDesenvolvimentos);

    // Dashboard Filters
    if (dashFilterPeriodo) dashFilterPeriodo.addEventListener('change', applyDashboardFilters);
    if (dashFilterCliente) dashFilterCliente.addEventListener('change', applyDashboardFilters);

    // Client View Toggles
    const btnViewClientEnsaios = document.getElementById('btnViewClientEnsaios');
    const btnViewClientPD = document.getElementById('btnViewClientPD');

    if (btnViewClientEnsaios && btnViewClientPD) {
        btnViewClientEnsaios.addEventListener('click', () => {
            btnViewClientEnsaios.classList.add('active-toggle');
            btnViewClientEnsaios.style.background = 'white';
            btnViewClientEnsaios.style.color = '#111827';
            btnViewClientEnsaios.style.border = '1px solid #d1d5db';
            btnViewClientEnsaios.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';

            btnViewClientPD.classList.remove('active-toggle');
            btnViewClientPD.style.background = 'transparent';
            btnViewClientPD.style.color = '#6b7280';
            btnViewClientPD.style.border = '1px solid transparent';
            btnViewClientPD.style.boxShadow = 'none';

            filterEnsaios(); // Render ensaios
        });

        btnViewClientPD.addEventListener('click', () => {
            btnViewClientPD.classList.add('active-toggle');
            btnViewClientPD.style.background = 'white';
            btnViewClientPD.style.color = '#111827';
            btnViewClientPD.style.border = '1px solid #d1d5db';
            btnViewClientPD.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';

            btnViewClientEnsaios.classList.remove('active-toggle');
            btnViewClientEnsaios.style.background = 'transparent';
            btnViewClientEnsaios.style.color = '#6b7280';
            btnViewClientEnsaios.style.border = '1px solid transparent';
            btnViewClientEnsaios.style.boxShadow = 'none';

            renderClientDesenvolvimentos(); // Render P&D
        });
    }

    // New
    const fabMenu = document.getElementById('fabMenu');
    const fabIcon = document.getElementById('fabIcon');

    fab.addEventListener('click', () => {
        fabMenu.classList.toggle('active');
        if (fabMenu.classList.contains('active')) {
            fabIcon.style.transform = 'rotate(45deg)';
        } else {
            fabIcon.style.transform = 'rotate(0deg)';
        }
    });

    document.addEventListener('click', (e) => {
        if (fabMenu && fabMenu.classList.contains('active') && !fab.contains(e.target) && !fabMenu.contains(e.target)) {
            fabMenu.classList.remove('active');
            fabIcon.style.transform = 'rotate(0deg)';
        }
    });

    document.getElementById('btnFabCliente').addEventListener('click', () => {
        fabMenu.classList.remove('active');
        fabIcon.style.transform = 'rotate(0deg)';
        openNewCliente();
    });

    document.getElementById('btnFabEnsaio').addEventListener('click', () => {
        fabMenu.classList.remove('active');
        fabIcon.style.transform = 'rotate(0deg)';
        if (currentView === 'clientes') openNewEnsaioFromHome();
        else if (currentView === 'kanban') openTriagem();
        else openNewEnsaio();
    });

    // Kanban
    if (btnKanban) btnKanban.addEventListener('click', showKanban);
    if (kanbanFilterCliente) kanbanFilterCliente.addEventListener('change', () => {
        if (currentView === 'kanban') renderKanbanBoard();
    });

    // P&D Modals and Logic
    if (btnNovoDesenvolvimentoView) btnNovoDesenvolvimentoView.addEventListener('click', openNovoDesenvolvimento);
    if (btnFecharNovoDesenvolvimento) btnFecharNovoDesenvolvimento.addEventListener('click', () => closeModal(modalNovoDesenvolvimento));
    if (btnCancelNovoDesenvolvimento) btnCancelNovoDesenvolvimento.addEventListener('click', () => closeModal(modalNovoDesenvolvimento));
    if (modalNovoDesenvolvimento) modalNovoDesenvolvimento.addEventListener('click', (e) => { if (e.target === modalNovoDesenvolvimento) closeModal(modalNovoDesenvolvimento); });
    if (desenvolvimentoForm) desenvolvimentoForm.addEventListener('submit', handleDesenvolvimentoSubmit);
    if (devFotoFile) devFotoFile.addEventListener('change', handleDevFotoChange);
    const devFotoCam = document.getElementById('devFotoCam');
    if (devFotoCam) devFotoCam.addEventListener('change', handleDevFotoChange);

    // Triagem Modal
    if (btnNovaAmostraTriagem) btnNovaAmostraTriagem.addEventListener('click', openTriagem);
    if (btnFecharTriagem) btnFecharTriagem.addEventListener('click', () => closeModal(modalTriagem));
    if (btnCancelTriagem) btnCancelTriagem.addEventListener('click', () => closeModal(modalTriagem));
    if (triagemForm) triagemForm.addEventListener('submit', handleTriagemSubmit);
    if (modalTriagem) modalTriagem.addEventListener('click', (e) => { if (e.target === modalTriagem) closeModal(modalTriagem); });

    // P&D Detalhes Modal
    const btnFecharPDDetalhes = document.getElementById('btnFecharPDDetalhes');
    if (btnFecharPDDetalhes) btnFecharPDDetalhes.addEventListener('click', () => closeModal(document.getElementById('modalPDDetalhes')));
    const modalPDDetalhes = document.getElementById('modalPDDetalhes');
    if (modalPDDetalhes) modalPDDetalhes.addEventListener('click', (e) => { if (e.target === modalPDDetalhes) closeModal(modalPDDetalhes); });

    const btnPostarAtividadePD = document.getElementById('btnPostarAtividadePD');
    if (btnPostarAtividadePD) btnPostarAtividadePD.addEventListener('click', postarComentarioPD);

    const btnGerarEnsaioFromModal = document.getElementById('btnGerarEnsaioFromModal');
    if (btnGerarEnsaioFromModal) {
        btnGerarEnsaioFromModal.addEventListener('click', () => {
            closeModal(modalPDDetalhes);
            gerarEnsaioDoDesenvolvimento(currentDevDetalhesId);
        });
    }

    const btnExcluirPDDetalhes = document.getElementById('btnExcluirPDDetalhes');
    if (btnExcluirPDDetalhes) {
        btnExcluirPDDetalhes.addEventListener('click', () => {
            if (currentDevDetalhesId) {
                deleteDesenvolvimento(currentDevDetalhesId);
                closeModal(modalPDDetalhes);
            }
        });
    }

    // Form tipo is now hidden (unified) — no toggle needed

    // Cliente modal
    if (btnFecharCliente) btnFecharCliente.addEventListener('click', () => closeModal(modalCliente));
    if (btnCancelCliente) btnCancelCliente.addEventListener('click', () => closeModal(modalCliente));
    if (modalCliente) modalCliente.addEventListener('click', (e) => { if (e.target === modalCliente) closeModal(modalCliente); });
    if (clienteForm) clienteForm.addEventListener('submit', handleClienteSubmit);

    // Detalhes modal
    if (btnFecharDetalhes) btnFecharDetalhes.addEventListener('click', () => closeModal(modalDetalhes));
    if (modalDetalhes) modalDetalhes.addEventListener('click', (e) => { if (e.target === modalDetalhes) closeModal(modalDetalhes); });
    if (btnEditarDetalhes) btnEditarDetalhes.addEventListener('click', () => {
        closeModal(modalDetalhes);
        const e = allEnsaios.find(x => x.id === currentEnsaioId);
        if (e) openEditEnsaio(e);
    });
    if (btnExcluirDetalhes) btnExcluirDetalhes.addEventListener('click', () => {
        deleteEnsaio(currentEnsaioId);
    });
    if (btnCopiarRede) btnCopiarRede.addEventListener('click', copyRede);
    if (btnAbrirRede) btnAbrirRede.addEventListener('click', abrirRede);
    btnImprimirEtiqueta.addEventListener('click', () => {
        const e = allEnsaios.find(x => x.id === currentEnsaioId);
        if (e) printLabel(e);
    });
    btnExportarPDF.addEventListener('click', async () => {
        const e = allEnsaios.find(x => x.id === currentEnsaioId);
        if (e) {
            btnExportarPDF.disabled = true;
            const originalText = btnExportarPDF.innerHTML;
            btnExportarPDF.innerHTML = 'Gerando...';
            try {
                await exportarLaudoPDF(e);
            } catch (err) {
                console.error("Erro PDF:", err);
                showToast("Erro ao gerar PDF.");
            } finally {
                btnExportarPDF.disabled = false;
                btnExportarPDF.innerHTML = originalText;
            }
        }
    });
    btnMarcarRetirado.addEventListener('click', () => {
        const e = allEnsaios.find(x => x.id === currentEnsaioId);
        if (e) marcarComoRetirado(e.id);
    });
    if (btnEditarClienteAtual) {
        btnEditarClienteAtual.addEventListener('click', openEditClienteAtual);
    }
    if (btnExcluirClienteNoModal) {
        btnExcluirClienteNoModal.addEventListener('click', deleteClienteAtual);
    }
    if (btnAdicionarColuna) {
        btnAdicionarColuna.addEventListener('click', adicionarColunaKanban);
    }
    if (btnPostarAtividade) {
        btnPostarAtividade.addEventListener('click', postarComentario);
    }

    // Label selector no Formulário
    renderFormEtiquetasSelector();

    // Ensaio form
    if (btnFecharForm) btnFecharForm.addEventListener('click', () => closeModal(modalForm));
    if (btnCancelForm) btnCancelForm.addEventListener('click', () => closeModal(modalForm));
    if (modalForm) modalForm.addEventListener('click', (e) => { if (e.target === modalForm) closeModal(modalForm); });
    if (ensaioForm) {
        const btnSubmitForm = document.getElementById('btnSubmitForm');
        if (btnSubmitForm) {
            btnSubmitForm.addEventListener('click', handleEnsaioSubmit);
        }
    }

    // File preview & Camera Capture Integration
    const formImagensCamera = document.getElementById('formImagensCamera');

    function updateFilePreview() {
        if (!filePreview) return;
        filePreview.innerHTML = '';
        if (!formImagens.files) return;
        for (const f of formImagens.files) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(f);
            img.title = f.name;
            filePreview.appendChild(img);
        }
    }

    if (formImagens) {
        formImagens.addEventListener('change', updateFilePreview);
    }
    
    if (formImagensCamera) {
        formImagensCamera.addEventListener('change', () => {
            if (formImagensCamera.files.length === 0) return;
            
            // Append camera files to the existing formImagens selection
            const dt = new DataTransfer();
            if (formImagens.files) {
                for (const f of formImagens.files) dt.items.add(f);
            }
            for (const f of formImagensCamera.files) {
                // Add a unique name to camera captures to avoid overwriting usually named "image.jpg"
                const ext = f.name.split('.').pop() || 'jpg';
                const newFile = new File([f], `camera_${Date.now()}.${ext}`, { type: f.type });
                dt.items.add(newFile);
            }
            
            formImagens.files = dt.files;
            formImagensCamera.value = '';
            
            updateFilePreview();
        });
    }

    // Configuracoes
    if (btnConfiguracoes) btnConfiguracoes.addEventListener('click', openConfig);
    if (btnSairConfig) btnSairConfig.addEventListener('click', () => closeModal(configOverlay));
    if (btnCancelarConfig) btnCancelarConfig.addEventListener('click', () => closeModal(configOverlay));
    if (configOverlay) configOverlay.addEventListener('click', (e) => { if (e.target === configOverlay) closeModal(configOverlay); });
    if (configForm) configForm.addEventListener('submit', handleConfigSubmit);

    // Produção (PCP) Navigation
    // Produção (PCP) Navigation
    if (btnProducao) btnProducao.addEventListener('click', showProducao);
    
    // Legacy Search Listeners backported to Calendar Header
    const btnPcpBuscar = document.getElementById('btnPcpBuscar');
    const btnPcpLimparBusca = document.getElementById('btnPcpLimparBusca');
    const pcpSearchInput = document.getElementById('pcpSearchInput');
    
    if (btnPcpBuscar) btnPcpBuscar.addEventListener('click', () => buscarProducao());
    if (pcpSearchInput) pcpSearchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') buscarProducao(); });
    if (btnPcpLimparBusca) {
        btnPcpLimparBusca.addEventListener('click', () => {
            if (pcpSearchInput) pcpSearchInput.value = '';
            document.getElementById('pcpResultados').style.display = 'none';
            document.getElementById('pcpCalendarContainer').style.display = 'block';
            btnPcpLimparBusca.style.display = 'none';
        });
    }
    
    // Calendar DOM Listeners
    const btnPcpAnterior = document.getElementById('btnPcpAnterior');
    const btnPcpProximo = document.getElementById('btnPcpProximo');
    const btnFecharPcpDia = document.getElementById('btnFecharPcpDia');
    const modalPcpDia = document.getElementById('modalPcpDia');

    if (btnPcpAnterior) {
        btnPcpAnterior.addEventListener('click', () => {
            currentPcpMonth--;
            if (currentPcpMonth < 0) {
                currentPcpMonth = 11;
                currentPcpYear--;
            }
            renderCalendarPCP(currentPcpMonth, currentPcpYear);
        });
    }

    if (btnPcpProximo) {
        btnPcpProximo.addEventListener('click', () => {
            currentPcpMonth++;
            if (currentPcpMonth > 11) {
                currentPcpMonth = 0;
                currentPcpYear++;
            }
            renderCalendarPCP(currentPcpMonth, currentPcpYear);
        });
    }

    if (btnFecharPcpDia) {
        btnFecharPcpDia.addEventListener('click', () => closeModal(modalPcpDia));
    }



    // Delegated Click Handlers for Cards (Ensaios and Clients)
    cardsGrid.addEventListener('click', (e) => {
        // Ensaio Card
        const enCard = e.target.closest('.card');
        if (enCard && enCard.dataset.id) {
            openDetalhes(enCard.dataset.id);
            return;
        }
        // Client Card
        const clCard = e.target.closest('.client-card');
        if (clCard && clCard.dataset.id && !clCard.classList.contains('pd-card')) { // Exclude P&D cards here
            openCliente(clCard.dataset.id);
            return;
        }

        // P&D Card (added to handle P&D items inside client folders)
        const pdCard = e.target.closest('.pd-card');
        if (pdCard && pdCard.dataset.id) {
            openPDDetalhes(pdCard.dataset.id);
            return;
        }
    });

    if (kanbanBoard) {
        kanbanBoard.addEventListener('click', (e) => {
            const card = e.target.closest('.kanban-card-modern');
            if (card && card.dataset.id) {
                // Se o clique foi nas etiquetas, o openQuickLabelEdit já deu stopPropagation
                openDetalhes(card.dataset.id);
            }
        });
    }

    // P&D actions
    if (gridDesenvolvimentos) {
        gridDesenvolvimentos.addEventListener('click', (e) => {
            const btnDelete = e.target.closest('.btn-excluir-dev');
            if (btnDelete) {
                e.stopPropagation();
                deleteDesenvolvimento(btnDelete.dataset.id);
                return;
            }

            const btnEdit = e.target.closest('.btn-editar-dev');
            if (btnEdit) {
                e.stopPropagation();
                abrirEdicaoDesenvolvimento(btnEdit.dataset.id);
                return;
            }

            const btnGerar = e.target.closest('.btn-gerar-ensaio-dev');
            if (btnGerar) {
                // Prevent modal from opening
                e.stopPropagation();
                gerarEnsaioDoDesenvolvimento(btnGerar.dataset.id);
                return;
            }

            // Click anywhere else on the card opens the details modal
            const card = e.target.closest('.pd-card'); // Changed from .client-card to .pd-card
            if (card) {
                openPDDetalhes(card.dataset.id);
            }
        });
    }
}

function openPDDetalhes(devId) {
    const dev = allDesenvolvimentos.find(d => d.id === devId);
    if (!dev) return;

    currentDevDetalhesId = devId;

    document.getElementById('pdDetalhesProjeto').textContent = dev.projeto;
    document.getElementById('pdDetalhesCliente').textContent = dev.cliente;
    document.getElementById('pdDetalhesData').textContent = formatDateTime(dev.criado_em);
    document.getElementById('pdDetalhesStatus').textContent = dev.status;
    document.getElementById('pdDetalhesDescricao').textContent = dev.descricao || 'Nenhuma descrição informada.';

    const fotoEl = document.getElementById('pdDetalhesFoto');
    const fotoContainer = document.getElementById('pdDetalhesFotoContainer');

    if (dev.foto_url) {
        fotoEl.src = dev.foto_url;
        fotoContainer.style.display = 'block';
    } else {
        fotoEl.src = '';
        fotoContainer.style.display = 'none';
    }

    document.getElementById('pdAtividadeUserDisplay').textContent = currentAnalyst || 'Analista';
    fetchAtividadesPD(devId);

    openModal(document.getElementById('modalPDDetalhes'));
}

// ─── P&D Logic ─────────────────────────────────────────────────────────────
function handleDevFotoChange(e) {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        devFotoFileName.textContent = file.name;
        getBase64(file).then(base64 => {
            devFotoPreview.src = base64;
            devFotoPreview.style.display = 'block';
        });
    } else {
        devFotoFileName.textContent = 'Selecionar imagem...';
        devFotoPreview.style.display = 'none';
        devFotoPreview.src = '';
    }
}

async function showDesenvolvimentos() {
    currentView = 'desenvolvimentos';
    currentCliente = null;
    if (kanbanView) kanbanView.style.display = 'none';
    if (dashboardView) dashboardView.style.display = 'none';
    if (cardsGrid) cardsGrid.style.display = 'none';
    if (statsBar) statsBar.style.display = 'none';
    if (emptyState) emptyState.style.display = 'none';
    if (breadcrumb) breadcrumb.style.display = 'none';
    if (document.getElementById('fabContainer')) document.getElementById('fabContainer').style.display = 'none';

    const pView = document.getElementById('producaoView');
    if (pView) pView.style.display = 'none';

    if (desenvolvimentosView) desenvolvimentosView.style.display = 'block';

    // active state on nav
    if (btnDashboard) btnDashboard.classList.remove('active');
    if (btnKanban) btnKanban.classList.remove('active');
    if (btnDesenvolvimentos) btnDesenvolvimentos.classList.add('active');

    try {
        const res = await fetch(API_DESENVOLVIMENTOS);
        allDesenvolvimentos = await res.json();
        renderDesenvolvimentos(allDesenvolvimentos);
    } catch (e) {
        console.error("Erro listando desenvolvimentos", e);
    }
}

function renderDesenvolvimentos(list) {
    if (!gridDesenvolvimentos) return;
    gridDesenvolvimentos.innerHTML = '';
    if (list.length === 0) {
        gridDesenvolvimentos.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">Nenhum desenvolvimento registrado.</div>';
        return;
    }

    const html = (list || []).map(dev => `
        <div class="client-card pd-card" data-id="${dev.id}" style="cursor: pointer;">
            <div class="client-card-cover" style="height: 200px;">
                ${dev.foto_url
            ? `<img src="${dev.foto_url}" style="object-fit: cover; width: 100%; height: 100%; border-radius: 20px 20px 0 0;">`
            : `<div class="client-logo-placeholder" style="border-radius:0; width:100%; height:100%;">P&D</div>`}
            </div>
            <div class="client-card-body" style="align-items: flex-start; text-align: left; padding: 16px;">
                <h4 style="font-size: 1rem; color: var(--text-primary); margin-bottom: 4px;">${escapeHtml(dev.projeto)}</h4>
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 8px;">
                    <strong>Cliente:</strong> ${escapeHtml(dev.cliente)}<br>
                    <strong>Data:</strong> ${formatDateTime(dev.criado_em)}
                </div>
                <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 16px; flex-grow: 1; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">
                    ${escapeHtml(dev.descricao || 'Sem descrição.')}
                </div>
                
                <div style="display:flex; width: 100%; gap:8px;">
                    <button class="btn-modern-secondary btn-editar-dev" data-id="${dev.id}" style="padding: 8px; flex: 0 0 auto; color: #4F46E5; border-color: rgba(79, 70, 229, 0.2); background: rgba(79, 70, 229, 0.05);" title="Editar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    </button>
                    <button class="btn-modern-secondary btn-excluir-dev" data-id="${dev.id}" style="padding: 8px; flex: 0 0 auto; color: #DC2626; border-color: rgba(220, 38, 38, 0.2); background: rgba(220, 38, 38, 0.05);" title="Excluir">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                    <button class="btn-submit btn-gerar-ensaio-dev" data-id="${dev.id}" style="flex: 1; font-size: 0.8rem; padding: 8px; border-radius: 8px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        Gerar Ensaio
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    gridDesenvolvimentos.innerHTML = html;
}

// ─── PCP Produção (Calendário Mensal Fixo) ───────────────────────────
let currentPcpMonth = new Date().getMonth();
let currentPcpYear = new Date().getFullYear();

const mesesNomes = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

// Mock Data Generator for UI Testing (Phase 1)
function generateFakePcpData(month, year) {
    const fakeData = [];
    const maquinas = ["ATMA 01 (Digital)", "SAKURAI 02", "ESTUFA CONTÍNUA", "REVISÃO CTIA", "ATMA 03"];
    const statusOpts = ["FINALIZADA", "EM ANDAMENTO", "AGUARDANDO", "LIBERADA", "Pendente"];
    const descricoes = ["AP 4021 - Filme Transfer", "AP 4055 - Verniz Localizado", "Secagem Tinta Branca", "Bancada de Inspeção"];
    
    // Gerar 20 produções espalhadas aleatoriamente no mês
    for(let i=0; i<35; i++) {
        const dia = Math.floor(Math.random() * 28) + 1;
        const maq = maquinas[Math.floor(Math.random() * maquinas.length)];
        const st = statusOpts[Math.floor(Math.random() * statusOpts.length)];
        const desc = descricoes[Math.floor(Math.random() * descricoes.length)];
        
        const dateStr = `${String(dia).padStart(2, '0')}/${String(month+1).padStart(2, '0')}/${year}`;
        
        fakeData.push({
            aba: 'Agendamento Mock',
            maquina: maq,
            data: dateStr,
            status: st,
            detalhes: [`🎯 [ALVO] ${desc}`, `Quantidade: ${Math.floor(Math.random()*10)*1000 + 500} fls`]
        });
    }
    return fakeData;
}

function showProducao() {
    currentView = 'producao';
    currentCliente = null;
    if (kanbanView) kanbanView.style.display = 'none';
    if (dashboardView) dashboardView.style.display = 'none';
    if (cardsGrid) cardsGrid.style.display = 'none';
    if (statsBar) statsBar.style.display = 'none';
    if (emptyState) emptyState.style.display = 'none';
    if (breadcrumb) breadcrumb.style.display = 'none';
    if (typeof desenvolvimentosView !== 'undefined' && desenvolvimentosView) desenvolvimentosView.style.display = 'none';

    const producaoView = document.getElementById('producaoView');
    if (producaoView) producaoView.style.display = 'block';

    if (btnDashboard) btnDashboard.classList.remove('active');
    if (btnKanban) btnKanban.classList.remove('active');
    if (typeof btnDesenvolvimentos !== 'undefined' && btnDesenvolvimentos) btnDesenvolvimentos.classList.remove('active');
    if (btnProducao) btnProducao.classList.add('active');

    renderCalendarPCP(currentPcpMonth, currentPcpYear);
}

function renderCalendarPCP(month, year) {
    const grid = document.getElementById('pcpCalendarGrid');
    const titulo = document.getElementById('pcpMesAnoTitulo');
    if (!grid || !titulo) return;

    titulo.textContent = `${mesesNomes[month]} ${year}`;
    grid.innerHTML = '';

    const firstDay = new Date(year, month, 1).getDay(); // 0 (Domingo) a 6 (Sábado)
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // In Phase 1, we use pure fake data for the requested month
    const listPcp = generateFakePcpData(month, year);
    
    // Group by Date "DD/MM/YYYY"
    const pcpByDate = {};
    listPcp.forEach(item => {
        if (!pcpByDate[item.data]) pcpByDate[item.data] = [];
        pcpByDate[item.data].push(item);
    });

    // Empty cells before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        const d = document.createElement('div');
        d.className = 'calendar-day-empty';
        d.style.background = '#f8fafc';
        d.style.minHeight = '100px';
        grid.appendChild(d);
    }

    // Days of the month
    for (let dia = 1; dia <= daysInMonth; dia++) {
        const d = document.createElement('div');
        d.className = 'calendar-day cell-hover';
        d.style.background = 'white';
        d.style.minHeight = '100px';
        d.style.padding = '8px';
        d.style.position = 'relative';
        d.style.cursor = 'pointer';
        d.style.border = '1px solid transparent';
        d.style.transition = 'all 0.2s';
        
        // Hover effect setup is better in CSS, but applying mild here inline
        d.onmouseover = () => d.style.boxShadow = 'inset 0 0 0 2px #e0e7ff';
        d.onmouseout = () => d.style.boxShadow = 'none';

        const dateStr = `${String(dia).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
        const prodDoDia = pcpByDate[dateStr] || [];

        // Dia header
        let diaHtml = `<div style="font-weight: 600; font-size: 0.9em; margin-bottom: 6px; color: ${prodDoDia.length > 0 ? '#4338ca' : '#64748b'}">${dia}</div>`;

        // Badges / Preview
        if (prodDoDia.length > 0) {
            diaHtml += `<div style="display:inline-block; font-size:0.75rem; background:#e0e7ff; color:#4338ca; padding:2px 6px; border-radius:12px; font-weight:600; margin-bottom:4px;">${prodDoDia.length} ${prodDoDia.length===1?'item':'itens'}</div>`;
            
            // Preview lines (up to 3)
            const previewLimit = Math.min(3, prodDoDia.length);
            for(let p=0; p<previewLimit; p++) {
                const item = prodDoDia[p];
                let bgBadge = '#cbd5e1';
                const st = (item.status||'').toUpperCase();
                if (st.includes('LIBERADA')) bgBadge = '#10b981';
                else if (st.includes('ANDAMENTO')) bgBadge = '#3b82f6';
                else if (st.includes('FINALIZADA')) bgBadge = '#a855f7';
                else if (st.includes('AGUARDANDO')) bgBadge = '#f59e0b';

                diaHtml += `
                    <div style="font-size: 0.7rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
                        <span style="display:inline-block; width:6px; height:6px; background:${bgBadge}; border-radius:50%; flex-shrink:0;"></span>
                        <span style="color:#475569;">${escapeHtml(item.maquina)}</span>
                    </div>
                `;
            }
            if (prodDoDia.length > 3) {
                diaHtml += `<div style="font-size:0.65rem; color:#94a3b8; margin-top:2px;">+ ${prodDoDia.length - 3} mais...</div>`;
            }
        }

        d.innerHTML = diaHtml;
        
        // CLICK TO OPEN DAY DETAILS
        d.addEventListener('click', () => {
            openPcpDia(dateStr, prodDoDia);
        });

        grid.appendChild(d);
    }

    // Fill remaining cells for perfect grid (up to 42 cells total max typically)
    const totalCellsAssigned = firstDay + daysInMonth;
    const remainingToCompleteRow = (7 - (totalCellsAssigned % 7)) % 7;
    for (let i = 0; i < remainingToCompleteRow; i++) {
        const d = document.createElement('div');
        d.className = 'calendar-day-empty';
        d.style.background = '#f8fafc';
        d.style.minHeight = '100px';
        grid.appendChild(d);
    }
}

function openPcpDia(dateStr, items) {
    const titulo = document.getElementById('pcpDiaTitulo');
    const timeline = document.getElementById('pcpDiaTimeline');
    if(!titulo || !timeline) return;

    titulo.textContent = `Produção: ${dateStr}`;
    timeline.innerHTML = '';

    if (!items || items.length === 0) {
        timeline.innerHTML = '<div style="text-align:center; padding:30px; color:#94a3b8;">Sem produções agendadas para este dia.</div>';
    } else {
        items.forEach(res => {
            const card = document.createElement('div');
            card.className = 'pcp-card dashboard-animate-up';
            card.style.marginBottom = '12px';
            
            let statusColor = '#94a3b8';
            let statusBg = '#f1f5f9';
            const st = (res.status || '').toUpperCase();
            if (st.includes('LIBERADA')) { statusColor = '#10b981'; statusBg = '#d1fae5'; }
            else if (st.includes('ANDAMENTO')) { statusColor = '#3b82f6'; statusBg = '#dbeafe'; }
            else if (st.includes('FINALIZADA')) { statusColor = '#a855f7'; statusBg = '#f3e8ff'; }
            else if (st.includes('AGUARDANDO')) { statusColor = '#f59e0b'; statusBg = '#fef3c7'; }

            let detHtml = '';
            if (res.detalhes && res.detalhes.length > 0) {
                detHtml = `<ul class="pcp-details-list">
                    ${res.detalhes.map(d => `<li>${escapeHtml(d)}</li>`).join('')}
                </ul>`;
            }

            card.innerHTML = `
                <div class="pcp-card-header">
                    <div>
                        <span class="pcp-machine-title">${escapeHtml(res.maquina)}</span>
                    </div>
                    <div class="pcp-status-box">
                        <span class="pcp-status-badge" style="color:${statusColor}; background:${statusBg};">
                            ${escapeHtml(res.status)}
                        </span>
                    </div>
                </div>
                <div class="pcp-card-body" style="border-left-color: ${statusColor};">
                    ${detHtml}
                </div>
            `;
            timeline.appendChild(card);
        });
    }

    openModal(document.getElementById('modalPcpDia'));
}

async function buscarProducao() {
    const input = document.getElementById('pcpSearchInput');
    const container = document.getElementById('pcpResultados');
    const calendarCont = document.getElementById('pcpCalendarContainer');
    const btnLimpar = document.getElementById('btnPcpLimparBusca');
    if (!input || !container) return;

    const query = input.value.trim();
    if (!query) {
        showToast('Digite a AP ou material para buscar.');
        return;
    }

    if (calendarCont) calendarCont.style.display = 'none';
    if (btnLimpar) btnLimpar.style.display = 'inline-block';
    
    container.style.display = 'block';
    container.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-secondary);"><div class="spinner" style="margin: 0 auto 10px auto; border:4px solid #e0e7ff; border-top-color:#4338ca; border-radius:50%; width:30px; height:30px; animation:spin 1s linear infinite;"></div> Buscando na planilha...</div>';
    
    try {
        const res = await fetch(`/api/producao/buscar?q=${encodeURIComponent(query)}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();

        if (!res.ok) {
            container.innerHTML = `<div style="text-align:center; padding:40px; color:#ef4444;">${escapeHtml(data.error || 'Erro na busca.')}</div>`;
            return;
        }

        if (!data || data.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-secondary);">Nenhum registro encontrado para "<b>${escapeHtml(query)}</b>".</div>`;
            return;
        }

        renderResultadosPcp(data);
    } catch (err) {
        console.error("Erro na busca PCP:", err);
        container.innerHTML = `<div style="text-align:center; padding:40px; color:#ef4444;">Erro de conexão com o servidor local.</div>`;
    }
}

function renderResultadosPcp(resultados) {
    const container = document.getElementById('pcpResultados');
    container.innerHTML = '';

    const timeline = document.createElement('div');
    timeline.className = 'pcp-timeline';

    resultados.forEach(res => {
        const card = document.createElement('div');
        card.className = 'pcp-card dashboard-animate-up';
        
        let statusColor = '#94a3b8';
        let statusBg = '#f1f5f9';
        const st = (res.status || '').toUpperCase();
        if (st.includes('LIBERADA')) { statusColor = '#10b981'; statusBg = '#d1fae5'; }
        else if (st.includes('ANDAMENTO')) { statusColor = '#3b82f6'; statusBg = '#dbeafe'; }
        else if (st.includes('FINALIZADA')) { statusColor = '#a855f7'; statusBg = '#f3e8ff'; }
        else if (st.includes('AGUARDANDO')) { statusColor = '#f59e0b'; statusBg = '#fef3c7'; }

        let detHtml = '';
        if (res.detalhes && res.detalhes.length > 0) {
            detHtml = `<ul class="pcp-details-list">
                ${res.detalhes.map(d => `<li>${escapeHtml(d)}</li>`).join('')}
            </ul>`;
        }

        card.innerHTML = `
            <div class="pcp-card-header">
                <div>
                    <span class="pcp-machine-title">${escapeHtml(res.maquina)}</span>
                    <span class="pcp-sheet-subtitle">Aba: ${escapeHtml(res.aba)}</span>
                </div>
                <div class="pcp-status-box">
                    <span class="pcp-status-badge" style="color:${statusColor}; background:${statusBg};">
                        ${escapeHtml(res.status)}
                    </span>
                    <div class="pcp-date">📅 ${escapeHtml(res.data)}</div>
                </div>
            </div>
            <div class="pcp-card-body" style="border-left-color: ${statusColor};">
                ${detHtml}
            </div>
        `;
        timeline.appendChild(card);
    });

    container.appendChild(timeline);
}

function openNovoDesenvolvimento() {
    if (desenvolvimentoForm) desenvolvimentoForm.reset();
    const editingIdEl = document.getElementById('editingDevId');
    if (editingIdEl) editingIdEl.value = '';
    const titleEl = document.getElementById('devFormTitle');
    if (titleEl) titleEl.textContent = 'Novo Desenvolvimento (P&D)';
    
    if (devFotoFileName) devFotoFileName.textContent = 'Selecionar imagem...';
    if (devFotoPreview) {
        devFotoPreview.style.display = 'none';
        devFotoPreview.src = '';
    }

    // Populate Datalist with Clients
    const datalist = document.getElementById('clientesList');
    if (datalist && allClientes && allClientes.length > 0) {
        datalist.innerHTML = allClientes.map(c => `<option value="${escapeHtml(c.nome)}">`).join('');
    }

    // If already inside a client view, pre-fill it
    if (currentCliente && currentView === 'ensaios') {
        const devClienteInput = document.getElementById('devCliente');
        if (devClienteInput) devClienteInput.value = currentCliente.nome;
    }

    openModal(modalNovoDesenvolvimento);
}

function abrirEdicaoDesenvolvimento(id) {
    const dev = allDesenvolvimentos.find(d => d.id === id);
    if (!dev) return;

    if (desenvolvimentoForm) desenvolvimentoForm.reset();
    
    const editingIdEl = document.getElementById('editingDevId');
    if (editingIdEl) editingIdEl.value = dev.id;
    
    const titleEl = document.getElementById('devFormTitle');
    if (titleEl) titleEl.textContent = 'Editar Desenvolvimento (P&D)';

    if (devCliente) devCliente.value = dev.cliente;
    if (devProjeto) devProjeto.value = dev.projeto;
    if (devDescricao) devDescricao.value = dev.descricao;
    
    document.getElementById('devFornNome').value = dev.forn_nome || '';
    document.getElementById('devFornRep').value = dev.forn_rep || '';
    document.getElementById('devFornContato').value = dev.forn_contato || '';
    document.getElementById('devFornEmail').value = dev.forn_email || '';
    document.getElementById('devFornReferencia').value = dev.forn_referencia || '';
    document.getElementById('devFornObs').value = dev.forn_obs || '';

    if (dev.foto_url) {
        devFotoFileName.textContent = 'Imagem atual carregada (envie outra para trocar)';
        devFotoPreview.src = dev.foto_url;
        devFotoPreview.style.display = 'block';
    } else {
        devFotoFileName.textContent = 'Selecionar nova imagem...';
        devFotoPreview.style.display = 'none';
        devFotoPreview.src = '';
    }

    // Populate Datalist with Clients
    const datalist = document.getElementById('clientesList');
    if (datalist && allClientes && allClientes.length > 0) {
        datalist.innerHTML = allClientes.map(c => `<option value="${escapeHtml(c.nome)}">`).join('');
    }

    openModal(modalNovoDesenvolvimento);
}

async function handleDesenvolvimentoSubmit(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('cliente', devCliente.value.trim());
    fd.append('projeto', devProjeto.value.trim());
    fd.append('descricao', devDescricao.value.trim());
    fd.append('forn_nome', document.getElementById('devFornNome').value.trim());
    fd.append('forn_rep', document.getElementById('devFornRep').value.trim());
    fd.append('forn_contato', document.getElementById('devFornContato').value.trim());
    fd.append('forn_email', document.getElementById('devFornEmail').value.trim());
    fd.append('forn_referencia', document.getElementById('devFornReferencia').value.trim());
    fd.append('forn_obs', document.getElementById('devFornObs').value.trim());

    const devCamField = document.getElementById('devFotoCam');
    const editingIdEl = document.getElementById('editingDevId');
    const isEditing = editingIdEl && editingIdEl.value;
    
    if (devCamField && devCamField.files && devCamField.files.length > 0) {
        fd.append('foto', devCamField.files[0]);
    } else if (devFotoFile.files && devFotoFile.files.length > 0) {
        fd.append('foto', devFotoFile.files[0]);
    } else {
        if (!isEditing) {
            showToast("É obrigatório enviar a foto do desenvolvimento.");
            return;
        }
    }

    try {
        const btn = desenvolvimentoForm.querySelector('button[type="submit"]');
        const origText = btn.innerHTML;
        btn.innerHTML = 'Salvando...';
        btn.disabled = true;

        const urlParams = isEditing ? `/${editingIdEl.value}` : '';
        const fetchMethod = isEditing ? 'PUT' : 'POST';

        const res = await fetch(API_DESENVOLVIMENTOS + urlParams, {
            method: fetchMethod,
            body: fd
        });

        btn.innerHTML = origText;
        btn.disabled = false;

        if (!res.ok) throw new Error("Erro ao salvar P&D");

        showToast("Desenvolvimento registrado com sucesso!");
        closeModal(modalNovoDesenvolvimento);

        // Refresh based on context
        if (currentView === 'ensaios' && currentCliente) {
            const resPD = await fetch(API_DESENVOLVIMENTOS);
            allDesenvolvimentos = await resPD.json();

            const btnViewClientPD = document.getElementById('btnViewClientPD');
            if (btnViewClientPD && btnViewClientPD.classList.contains('active-toggle')) {
                renderClientDesenvolvimentos();
            }
        } else {
            showDesenvolvimentos();
        }
    } catch (err) {
        showToast("Erro ao salvar o desenvolvimento.");
    }
}

async function deleteDesenvolvimento(id) {
    if (!await validarAcessoAdmin("Excluir Desenvolvimento", "Tem certeza que deseja excluir permanentemente este desenvolvimento?")) return;
    try {
        const res = await fetch(`${API_DESENVOLVIMENTOS}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error("Erro ao excluir");
        showToast("Desenvolvimento excluído.");

        // Refresh based on context
        if (currentView === 'ensaios' && currentCliente) {
            const resPD = await fetch(API_DESENVOLVIMENTOS);
            allDesenvolvimentos = await resPD.json();
            renderClientDesenvolvimentos();
        } else {
            showDesenvolvimentos();
        }
    } catch (err) {
        showToast("Erro ao excluir desenvolvimento.");
    }
}

async function gerarEnsaioDoDesenvolvimento(id) {
    const dev = allDesenvolvimentos.find(d => d.id === id);
    if (!dev) return;

    currentDevToEnsaioId = id;

    // We prepare the Ensaio modal
    if (ensaioForm) ensaioForm.reset();
    if (formId) formId.value = '';
    if (formTitle) formTitle.textContent = 'Gerar Ensaio a Partir de P&D';
    if (formData) formData.valueAsDate = new Date();

    // Pre-fill data
    if (formCliente) formCliente.value = dev.cliente;
    if (formProjeto) formProjeto.value = dev.projeto;

    if (formObservacoes) formObservacoes.value = 'Gerado a partir do P&D: ' + dev.projeto + '\\n\\nDescrição Técnica Original:\\n' + dev.descricao;

    // Reset Image Preview
    if (filePreview) filePreview.innerHTML = '';

    if (dev.foto_url && formImagens) {
        try {
            const resp = await fetch(dev.foto_url);
            const blob = await resp.blob();
            const file = new File([blob], dev.foto_url.split('/').pop(), { type: blob.type });

            const dt = new DataTransfer();
            dt.items.add(file);
            formImagens.files = dt.files;

            // Render preview
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            if (filePreview) filePreview.appendChild(img);
        } catch (err) {
            console.error("Could not fetch image for pre-fill", err);
        }
    }

    openModal(modalForm);
}

// ═══════════════════════════════════════════════════════════════════════════════
// GESTÃO DE USUÁRIOS (Admin)
// ═══════════════════════════════════════════════════════════════════════════════
let allUsuariosAdmin = [];
const modalUsuarioForm = document.getElementById('modalUsuarioForm');

function bindUserAdminEvents() {
    const btnNovoUsuario = document.getElementById('btnNovoUsuario');
    const btnFecharUsuarioForm = document.getElementById('btnFecharUsuarioForm');
    const btnCancelUsuarioForm = document.getElementById('btnCancelUsuarioForm');
    const usuarioForm = document.getElementById('usuarioForm');
    const btnExcluirUsuarioForm = document.getElementById('btnExcluirUsuarioForm');

    if (btnNovoUsuario) btnNovoUsuario.addEventListener('click', openNovoUsuario);
    if (btnFecharUsuarioForm) btnFecharUsuarioForm.addEventListener('click', () => closeModal(modalUsuarioForm));
    if (btnCancelUsuarioForm) btnCancelUsuarioForm.addEventListener('click', () => closeModal(modalUsuarioForm));
    if (modalUsuarioForm) modalUsuarioForm.addEventListener('click', (e) => { if (e.target === modalUsuarioForm) closeModal(modalUsuarioForm); });
    
    if (usuarioForm) {
        usuarioForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('usuarioFormId').value;
            const payload = {
                nome: document.getElementById('usuarioFormNome').value.trim(),
                email: document.getElementById('usuarioFormEmail').value.trim(),
                senha: document.getElementById('usuarioFormSenha').value,
                cargo: document.getElementById('usuarioFormCargo').value,
                ativo: document.getElementById('usuarioFormAtivo').checked ? 1 : 0,
                permissoes: {
                    dashboard: document.getElementById('permDashboard').checked,
                    ped: document.getElementById('permPed').checked,
                    kanban: document.getElementById('permKanban').checked,
                    producao: document.getElementById('permProducao').checked
                }
            };
            
            try {
                const url = id ? `/api/usuarios/${id}` : '/api/usuarios';
                const method = id ? 'PUT' : 'POST';
                
                const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Erro ao salvar usuário');
                
                showToast('Usuário salvo com sucesso!');
                closeModal(modalUsuarioForm);
                carregarUsuariosAdmin();
            } catch (err) {
                alert(err.message);
            }
        });
    }

    if (btnExcluirUsuarioForm) {
        btnExcluirUsuarioForm.addEventListener('click', async () => {
            const id = document.getElementById('usuarioFormId').value;
            if (!id) return;
            if (!confirm('Tem certeza que deseja excluir permanentemente este acesso?')) return;
            
            try {
                const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Erro ao excluir usuário');
                
                showToast('Usuário excluído!');
                closeModal(modalUsuarioForm);
                carregarUsuariosAdmin();
            } catch (err) {
                alert(err.message);
            }
        });
    }
}

async function carregarUsuariosAdmin() {
    const container = document.getElementById('confUsuariosGestao');
    if (!container) return;
    try {
        const res = await fetch('/api/usuarios');
        if (!res.ok) throw new Error('Falha ao buscar usuários');
        allUsuariosAdmin = await res.json();
        
        container.innerHTML = allUsuariosAdmin.map(u => {
            const btnEditar = (window.currentUserEmail === 'laboratorio.ctia@cromotransfer.com.br') ? 
                `<button type="button" class="btn-action" style="padding:4px 8px; font-size:0.8rem;" onclick="openEditUsuario('${u.id}')">Editar</button>` : '';

            return `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:var(--bg); border:1px solid var(--glass-border); border-radius:6px;">
                <div>
                    <strong>${escapeHtml(u.nome)}</strong> <span style="font-size:0.8rem; color:var(--text-tertiary);">(${escapeHtml(u.cargo)})</span>
                    <div style="font-size:0.85rem; color:var(--text-secondary);">${escapeHtml(u.email)} ${u.ativo ? '' : '<span style="color:#a51d2d; font-weight:bold;">(Inativo)</span>'}</div>
                </div>
                ${btnEditar}
            </div>
            `;
        }).join('');
    } catch (err) {
        console.error("Erro usuarios gestao:", err);
        container.innerHTML = '<p style="color:#a51d2d;">Erro ao carregar lista de usuários.</p>';
    }
}

function openNovoUsuario() {
    document.getElementById('usuarioForm').reset();
    document.getElementById('usuarioFormId').value = '';
    document.getElementById('usuarioFormTitle').textContent = 'Novo Usuário';
    document.getElementById('usuarioFormSenha').required = true;
    document.getElementById('usuarioFormSenhaHint').style.display = 'none';
    document.getElementById('btnExcluirUsuarioForm').style.display = 'none';
    document.getElementById('permDashboard').checked = true;
    document.getElementById('permPed').checked = true;
    document.getElementById('permKanban').checked = true;
    document.getElementById('permProducao').checked = true;
    openModal(modalUsuarioForm);
}

window.openEditUsuario = function(id) {
    const u = allUsuariosAdmin.find(x => x.id === id);
    if (!u) return;
    
    document.getElementById('usuarioForm').reset();
    document.getElementById('usuarioFormId').value = u.id;
    document.getElementById('usuarioFormTitle').textContent = 'Editar Usuário';
    document.getElementById('usuarioFormNome').value = u.nome;
    document.getElementById('usuarioFormEmail').value = u.email;
    document.getElementById('usuarioFormCargo').value = u.cargo;
    document.getElementById('usuarioFormAtivo').checked = u.ativo === 1;
    
    // Set permissoes
    const p = u.permissoes || {};
    document.getElementById('permDashboard').checked = p.dashboard !== false;
    document.getElementById('permPed').checked = p.ped !== false;
    document.getElementById('permKanban').checked = p.kanban !== false;
    document.getElementById('permProducao').checked = p.producao !== false;
    
    document.getElementById('usuarioFormSenha').required = false;
    document.getElementById('usuarioFormSenhaHint').style.display = 'block';
    document.getElementById('btnExcluirUsuarioForm').style.display = 'block';
    
    openModal(modalUsuarioForm);
};

// Bind elements on startup
document.addEventListener('DOMContentLoaded', bindUserAdminEvents);

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW: Clientes (folders)
// ═══════════════════════════════════════════════════════════════════════════════
async function showClientes() {
    currentView = 'clientes';
    currentCliente = null;
    searchInput.value = '';
    searchInput.placeholder = 'Buscar cliente, AP, referência ou tipo…';
    if (breadcrumb) breadcrumb.style.display = 'none';
    if (statsBar) statsBar.style.display = 'none';
    if (dashboardView) dashboardView.style.display = 'none';
    if (kanbanView) kanbanView.style.display = 'none';
    if (document.getElementById('producaoView')) document.getElementById('producaoView').style.display = 'none';
    if (document.getElementById('desenvolvimentosView')) document.getElementById('desenvolvimentosView').style.display = 'none';
    if (document.getElementById('fabContainer')) document.getElementById('fabContainer').style.display = 'flex';
    if (cardsGrid) cardsGrid.style.display = '';

    try {
        const res = await fetch(API_CLIENTES);
        allClientes = await res.json();
        filterClientes();
    } catch (err) {
        showToast('Erro ao carregar clientes.');
    }
}

async function filterClientes() {
    let q = searchInput.value.trim();
    if (!q) {
        renderHomeElements(allClientes, []);
        return;
    }

    let isExactMode = false;
    let exactType = null;
    let cleanQ = q;
    const lowerQ = q.toLowerCase();

    if (lowerQ.startsWith('ap:') || lowerQ.startsWith('ap ')) {
        cleanQ = q.substring(3).trim();
        isExactMode = true;
        exactType = 'ap';
    } else if (lowerQ.startsWith('ref:') || lowerQ.startsWith('ref ')) {
        cleanQ = q.substring(4).trim();
        isExactMode = true;
        exactType = 'ref';
    }

    try {
        const resClientes = await fetch(`${API_CLIENTES}/busca?q=${encodeURIComponent(cleanQ)}`);
        let listClientes = await resClientes.json();

        const resEnsaios = await fetch(`${API_ENSAIOS}?busca=${encodeURIComponent(cleanQ)}`);
        let listEnsaios = await resEnsaios.json();

        if (isExactMode && cleanQ) {
            // Busca intencional de AP ou Ref - esconde clientes e filtra pelo campo exato
            listClientes = [];
            if (exactType === 'ap') {
                listEnsaios = listEnsaios.filter(e => e.ap && e.ap.toLowerCase().includes(cleanQ.toLowerCase()));
            } else {
                listEnsaios = listEnsaios.filter(e => e.referencia && e.referencia.toLowerCase().includes(cleanQ.toLowerCase()));
            }
        } else {
            // Eliminar ruído filtrando da busca global itens que só entraram pelo match de "cliente"
            const filterVal = cleanQ.toLowerCase();
            listEnsaios = listEnsaios.filter(e =>
                (e.ap && e.ap.toLowerCase().includes(filterVal)) ||
                (e.referencia && e.referencia.toLowerCase().includes(filterVal)) ||
                (e.codigo_rastreio && e.codigo_rastreio.toLowerCase().includes(filterVal))
            );
        }

        // Popular o cache global pra permitir clicar nos cards injetados na Home
        allEnsaios = listEnsaios;

        renderHomeElements(listClientes, listEnsaios);
    } catch (err) {
        renderHomeElements([], []);
    }
}

function renderHomeElements(clientes, ensaios) {
    if (clientes.length === 0 && ensaios.length === 0) {
        cardsGrid.innerHTML = '';
        emptyTitle.textContent = 'Nenhum item encontrado';
        emptyMsg.innerHTML = 'Clique em <strong>"Novo Cliente"</strong> para começar.';
        if (currentView === 'home') {
            emptyState.style.display = 'block';
        }
        return;
    }
    if (currentView === 'home') emptyState.style.display = 'none';

    let html = '';

    // Render Clientes
    if (clientes.length > 0) {

        html += clientes.map((c, i) => {
            const hasLogo = c.logo_url && c.logo_url.trim();
            const initials = c.nome.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
            return `
            <div class="client-card" style="animation-delay:${i * 0.04}s; cursor: pointer;" data-id="${c.id}">
                <div class="client-card-cover">
                    ${hasLogo
                    ? `<img src="${escapeHtml(c.logo_url)}" alt="${escapeHtml(c.nome)}" onerror="this.parentElement.innerHTML='<div class=client-logo-placeholder>${initials}</div>'">`
                    : `<div class="client-logo-placeholder">${initials}</div>`
                }
                </div>
                <div class="client-card-body">
                    <span class="client-name">${escapeHtml(c.nome)}</span>
                    <span class="client-count">${c.total_ensaios || 0} ensaio${(c.total_ensaios || 0) !== 1 ? 's' : ''}</span>
                </div>
            </div>`;
        }).join('');
    }

    // Render Ensaios Avulsos (Busca)
    if (ensaios.length > 0) {

        html += ensaios.map((e, i) => {
            const badge = BADGE_MAP[e.tipo_teste] || BADGE_MAP['Outros'];
            const hasCover = e.url_capa && e.url_capa.trim();
            const conclusaoCls = e.conclusao === 'Aprovado' ? 'card-aprovado' : e.conclusao === 'Reprovado' ? 'card-reprovado' : '';
            return `
            <div class="card ${conclusaoCls}" style="animation-delay:${i * 0.04}s; cursor: pointer; border: 1px solid var(--border);" data-id="${e.id}">
                <div class="card-cover">
                    ${hasCover
                    ? `<img src="${escapeHtml(e.url_capa)}" alt="Capa" loading="lazy" onerror="this.parentElement.innerHTML='<div class=card-cover-placeholder><svg width=40 height=40 viewBox=&quot;0 0 24 24&quot; fill=none stroke=currentColor stroke-width=1><rect x=3 y=3 width=18 height=18 rx=2/><circle cx=8.5 cy=8.5 r=1.5/><polyline points=&quot;21 15 16 10 5 21&quot;/></svg></div>'">`
                    : `<div class="card-cover-placeholder"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`}
                </div>
                <div class="card-body">
                    <div class="card-header">
                        <span class="card-cliente">${escapeHtml(e.cliente)}</span>
                        <span class="badge ${badge.cls}">${badge.label}</span>
                    </div>
                    ${(e.ap || e.referencia) ? `<div class="card-meta" style="margin-top:6px;margin-bottom:0">
                        ${e.ap ? `<span class="card-meta-item"><strong>AP:</strong>&nbsp;${escapeHtml(e.ap)}</span>` : ''}
                        ${e.referencia ? `<span class="card-meta-item"><strong>Ref:</strong>&nbsp;${escapeHtml(e.referencia)}</span>` : ''}
                    </div>` : ''}
                    <div class="card-meta">
                        <span class="card-meta-item">
                            ${formatDate(e.data_ensaio)}
                        </span>
                        ${e.status ? `<span class="conclusao-badge" style="background:#f3f4f6; color:#4b5563; border:1px solid #d1d5db; font-size:0.65rem;padding:3px 10px">${e.status}</span>` : ''}
                        ${e.conclusao ? `<span class="conclusao-badge ${e.conclusao === 'Aprovado' ? 'aprovado' : 'reprovado'}" style="font-size:0.65rem;padding:3px 10px">${e.conclusao}</span>` : ''}
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    cardsGrid.innerHTML = html;
}

// Retrocompatibility pointer
function renderClientes(list) {
    renderHomeElements(list, []);
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW: Configurações
// ═══════════════════════════════════════════════════════════════════════════════
async function fetchSettings() {
    // This function is now replaced by loadSystemConfig for initial load
    // Keeping it for retro-compatibility if any other part of the code still calls it.
    await loadSystemConfig();
}

function openConfig() {
    // Fill form with current state
    const config = systemSettings;
    confAnalistaNome.value = config.analista_nome || 'Lúcio Monteiro';
    confAnalistaCargo.value = config.analista_cargo || 'Analista de Laboratório';
    confGerenteNome.value = config.gerente_nome || 'Jeferson Bueno';
    confGerenteCargo.value = config.gerente_cargo || 'Gerente de Processos';
    confEmpresaNome.value = config.empresa_nome || 'CTIA — CROMOTRANSFER';
    confEmpresaEndereco.value = config.empresa_endereco || 'R. Kesser Zattar, 162 - João Costa, Joinville - SC';
    confEmpresaEmail.value = config.empresa_email || 'ctia.lab@cromotransfer.com';
    confUrlPublica.value = config.url_publica || '';

    // Config logo prep
    const logoInput = document.getElementById('confEmpresaLogo');
    const logoPreview = document.getElementById('confEmpresaLogoPreview');
    if (logoInput) logoInput.value = '';
    if (logoPreview) {
        if (config.empresa_logo) {
            logoPreview.src = config.empresa_logo;
            logoPreview.style.display = 'block';
        } else {
            logoPreview.style.display = 'none';
            logoPreview.src = '';
        }
    }
    const senhaInput = document.getElementById('confSenhaAdmin');
    if (senhaInput) senhaInput.value = config.senha_admin || '';

    // Carregar Etiquetas Config para Edição
    const container = document.getElementById('confEtiquetasContainer');
    if (container) {
        const defaultColors = ['#4BCE97', '#F5CD47', '#FEA362', '#F87168', '#9F8FEF', '#579DFF'];
        let html = '';
        for (let i = 0; i < 6; i++) {
            const tagColor = window.etiquetasConfig && window.etiquetasConfig[i] && window.etiquetasConfig[i].cor ? window.etiquetasConfig[i].cor : defaultColors[i];
            const tagName = window.etiquetasConfig && window.etiquetasConfig[i] && window.etiquetasConfig[i].nome ? window.etiquetasConfig[i].nome : '';

            html += `
                <div style="display:flex; align-items:center; gap:8px;">
                    <input type="color" id="confTagColor_${i}" value="${tagColor}" style="width: 40px; height: 32px; border:none; border-radius:4px; cursor:pointer;" title="Cor da etiqueta">
                    <input type="text" id="confTagName_${i}" value="${escapeHtml(tagName)}" placeholder="Ex: Urgente, Concluído (ou vazio)" style="flex:1;">
                </div>
            `;
        }
        container.innerHTML = html;
    }


    // Admin Users Section (Apenas para Gestor/Admin)
    const adminUsersSection = document.getElementById('adminUsersSection');
    const btnNovoUsuario = document.getElementById('btnNovoUsuario');
    
    if (adminUsersSection) {
        if (window.currentUserRole === 'Gestor' || window.currentUserRole === 'Administrador') {
            adminUsersSection.style.display = 'block';
            carregarUsuariosAdmin();
            
            if (window.currentUserEmail !== 'laboratorio.ctia@cromotransfer.com.br' && btnNovoUsuario) {
                btnNovoUsuario.style.display = 'none';
            } else if (btnNovoUsuario) {
                btnNovoUsuario.style.display = 'inline-block';
            }
        } else {
            adminUsersSection.style.display = 'none';
        }
    }

    // PCP Config Path
    const confPcpPath = document.getElementById('confPcpPath');
    if (confPcpPath) confPcpPath.value = config.pcp_spreadsheet_path || '';

    openModal(configOverlay);
}

async function handleConfigSubmit(e) {
    e.preventDefault();

    const logoInput = document.getElementById('confEmpresaLogo');
    let logoDataUrl = systemSettings.empresa_logo || '';

    try {
        if (logoInput && logoInput.files.length > 0) {
            const formData = new FormData();
            formData.append('logo', logoInput.files[0]);

            const uploadRes = await fetch('/api/upload-logo', {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) throw new Error('Falha ao fazer upload do logo');
            const uploadData = await uploadRes.json();
            logoDataUrl = uploadData.url;
        }

        // Extrair Array de Etiquetas Customizadas
        const etiquetasToSave = [];
        for (let i = 0; i < 6; i++) {
            const colorInput = document.getElementById(`confTagColor_${i}`);
            const nameInput = document.getElementById(`confTagName_${i}`);
            if (colorInput && nameInput) {
                etiquetasToSave.push({ cor: colorInput.value, nome: nameInput.value.trim() });
            }
        }

        const analistasToSave = Array.from(document.querySelectorAll('.analista-input'))
            .map(input => input.value.trim())
            .filter(name => name !== '');

        const payload = {
            analista_nome: confAnalistaNome.value,
            analista_cargo: confAnalistaCargo.value,
            gerente_nome: confGerenteNome.value,
            gerente_cargo: confGerenteCargo.value,
            empresa_nome: confEmpresaNome.value,
            empresa_endereco: confEmpresaEndereco.value,
            empresa_email: confEmpresaEmail.value,
            url_publica: confUrlPublica.value,
            empresa_logo: logoDataUrl,
            senha_admin: document.getElementById('confSenhaAdmin').value,
            etiquetas_config: JSON.stringify(etiquetasToSave),
            analistas_lista: systemSettings.analistas_lista,
            kanban_colunas: systemSettings.kanban_colunas, // Preserve existing columns
            pcp_spreadsheet_path: document.getElementById('confPcpPath') ? document.getElementById('confPcpPath').value : systemSettings.pcp_spreadsheet_path
        };

        console.log("Enviando Payload de Configuração:", payload);

        const res = await fetch('/api/configuracoes', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok) {
            closeAllModals(); // Use closeAllModals to be safe
            showToast('Configurações salvas com sucesso!');
            await loadSystemConfig();
        } else {
            console.error("Resposta de erro do servidor:", data);
            showToast('Erro ao salvar: ' + (data.error || 'Erro desconhecido'));
        }
    } catch (err) {
        showToast(`Erro de rede ao salvar configurações: ${err.message}`);
    }
}


// ═══════════════════════════════════════════════════════════════════════════════
// VIEW: Ensaios (inside a client)
// ═══════════════════════════════════════════════════════════════════════════════
async function openCliente(clienteId) {
    currentView = 'ensaios';
    currentCliente = allClientes.find(c => c.id === clienteId);
    searchInput.value = '';
    searchInput.placeholder = 'Buscar ensaios…';
    breadcrumb.style.display = 'flex';
    breadcrumbText.textContent = currentCliente ? currentCliente.nome : '';
    const clientViewToggles = document.getElementById('clientViewToggles');
    if (clientViewToggles) clientViewToggles.style.display = 'flex';
    statsBar.style.display = 'flex';
    dashboardView.style.display = 'none';
    if (desenvolvimentosView) desenvolvimentosView.style.display = 'none';
    if (kanbanView) kanbanView.style.display = 'none';
    if (document.getElementById('fabContainer')) document.getElementById('fabContainer').style.display = 'flex';
    cardsGrid.style.display = '';

    try {
        const res = await fetch(`${API_ENSAIOS}?cliente_id=${clienteId}`);
        allEnsaios = await res.json();
        const resPD = await fetch(API_DESENVOLVIMENTOS);
        allDesenvolvimentos = await resPD.json();

        // Reset toggle to Ensaios by default
        const btnViewClientEnsaios = document.getElementById('btnViewClientEnsaios');
        if (btnViewClientEnsaios) btnViewClientEnsaios.click();
    } catch (err) {
        showToast('Erro ao carregar dados do cliente.');
    }
}

function renderClientDesenvolvimentos() {
    if (!currentCliente) return;
    statsBar.style.display = 'none'; // Hide stats for P&D view

    // Filter P&D items by client name (exact match for now, could be improved if needed)
    const list = allDesenvolvimentos.filter(d => d.cliente.toLowerCase() === currentCliente.nome.toLowerCase());

    if (list.length === 0) {
        cardsGrid.innerHTML = '';
        emptyTitle.textContent = 'Nenhum P&D encontrado';
        emptyMsg.innerHTML = 'Este cliente não possui registros de pesquisa e desenvolvimento.';
        if (currentView === 'ensaios') {
            emptyState.style.display = 'block';
        }
        return;
    }
    if (currentView === 'ensaios') emptyState.style.display = 'none';

    // Reuse the exact same card layout as the main P&D view
    const html = list.map(dev => `
        <div class="client-card pd-card" data-id="${dev.id}" style="cursor: pointer;">
            <div class="client-card-cover" style="height: 200px;">
                ${dev.foto_url
            ? `<img src="${dev.foto_url}" style="object-fit: cover; width: 100%; height: 100%; border-radius: 20px 20px 0 0;">`
            : `<div class="client-logo-placeholder" style="border-radius:0; width:100%; height:100%;">P&D</div>`}
            </div>
            <div class="client-card-body" style="align-items: flex-start; text-align: left; padding: 16px;">
                <h4 style="font-size: 1rem; color: var(--text-primary); margin-bottom: 4px;">${escapeHtml(dev.projeto)}</h4>
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 8px;">
                    <strong>Cliente:</strong> ${escapeHtml(dev.cliente)}<br>
                    <strong>Data:</strong> ${formatDateTime(dev.criado_em)}
                </div>
                <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 16px; flex-grow: 1; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">
                    ${escapeHtml(dev.descricao || 'Sem descrição.')}
                </div>
                
                <div style="display:flex; width: 100%; gap:8px;">
                    <button class="btn-modern-secondary btn-excluir-dev" data-id="${dev.id}" style="padding: 8px; flex: 0 0 auto; color: #DC2626; border-color: rgba(220, 38, 38, 0.2); background: rgba(220, 38, 38, 0.05);" title="Excluir">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                    <button class="btn-submit btn-gerar-ensaio-dev" data-id="${dev.id}" style="flex: 1; font-size: 0.8rem; padding: 8px; border-radius: 8px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        Gerar Ensaio
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    cardsGrid.innerHTML = html;
}

async function deleteClienteAtual() {
    if (!currentCliente) return;

    if (!await validarAcessoAdmin("Excluir Cliente", `ATENÇÃO: Isso apagará DEFINITIVAMENTE o cliente "${currentCliente.nome}", todos os seus ensaios, P&D e atividades. Deseja continuar?`)) return;

    try {
        const res = await fetch(`${API_CLIENTES}/${currentCliente.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error("Erro ao excluir cliente");
        closeModal(modalCliente); // Ensure modal is closed if open
        showToast("Cliente e dados excluídos com sucesso.");
        showClientes();
    } catch (err) {
        showToast("Erro ao excluir cliente.");
    }
}

function filterEnsaios() {
    statsBar.style.display = 'flex'; // Ensure stats bar is visible for Ensaios view
    let originalQ = searchInput.value.trim();
    let q = originalQ.toLowerCase();
    let isExactMode = false;
    let exactType = null;
    let cleanQ = q;

    if (q.startsWith('ap:') || q.startsWith('ap ')) {
        cleanQ = q.substring(3).trim();
        isExactMode = true;
        exactType = 'ap';
    } else if (q.startsWith('ref:') || q.startsWith('ref ')) {
        cleanQ = q.substring(4).trim();
        isExactMode = true;
        exactType = 'ref';
    }

    let list = allEnsaios;
    if (originalQ) {
        list = allEnsaios.filter(e => {
            if (isExactMode) {
                if (exactType === 'ap') return e.ap && e.ap.toLowerCase().includes(cleanQ);
                if (exactType === 'ref') return e.referencia && e.referencia.toLowerCase().includes(cleanQ);
            }
            return e.cliente.toLowerCase().includes(q) ||
                e.tipo_teste.toLowerCase().includes(q) ||
                (e.ap && e.ap.toLowerCase().includes(q)) ||
                (e.referencia && e.referencia.toLowerCase().includes(q)) ||
                (e.codigo_rastreio && e.codigo_rastreio.toLowerCase().includes(q)) ||
                (e.conclusao && e.conclusao.toLowerCase().includes(q));
        });
    }
    updateStats(list);
    renderEnsaios(list);
}

function updateStats(list) {
    statTotal.textContent = list.length;
    statBally.textContent = list.filter(e => ensaioHasBally(e) || e.tipo_teste === 'Bally').length;
    statVeslic.textContent = list.filter(e => ensaioHasVeslic(e) || e.tipo_teste === 'Veslic').length;
    statDinamo.textContent = list.filter(e => ensaioHasDinamo(e) || e.tipo_teste === 'Dinamômetro').length;
    statHidro.textContent = list.filter(e => ensaioHasHidrolise(e) || e.tipo_teste === 'Hidrólise').length;
}

function renderEnsaios(list) {
    if (list.length === 0) {
        cardsGrid.innerHTML = '';
        emptyTitle.textContent = 'Nenhum ensaio encontrado';
        emptyMsg.innerHTML = 'Clique em <strong>"Novo Ensaio"</strong> para registrar.';
        if (currentView === 'home' || currentView === 'ensaios' || currentView === 'kanban') {
            emptyState.style.display = 'block';
        }
        return;
    }
    if (currentView === 'home' || currentView === 'ensaios' || currentView === 'kanban') {
        emptyState.style.display = 'none';
    }

    cardsGrid.innerHTML = list.map((e, i) => {
        const testBadges = getEnsaioTestBadges(e);
        const hasCover = e.url_capa && e.url_capa.trim();
        const conclusaoCls = e.conclusao === 'Aprovado' ? 'card-aprovado' : e.conclusao === 'Reprovado' ? 'card-reprovado' : '';
        return `
        <div class="card ${conclusaoCls}" style="animation-delay:${i * 0.04}s; cursor: pointer;" data-id="${e.id}">
            <div class="card-cover">
                ${hasCover
                ? `<img src="${escapeHtml(e.url_capa)}" alt="Capa" loading="lazy" onerror="this.parentElement.innerHTML='<div class=card-cover-placeholder><svg width=40 height=40 viewBox=&quot;0 0 24 24&quot; fill=none stroke=currentColor stroke-width=1><rect x=3 y=3 width=18 height=18 rx=2/><circle cx=8.5 cy=8.5 r=1.5/><polyline points=&quot;21 15 16 10 5 21&quot;/></svg></div>'">`
                : `<div class="card-cover-placeholder"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`}
            </div>
            <div class="card-body">
                <div class="card-header">
                    <span class="card-cliente">${escapeHtml(e.cliente)}</span>
                    ${testBadges}
                </div>
                ${(e.ap || e.referencia) ? `<div class="card-meta" style="margin-top:6px;margin-bottom:0">
                    ${e.ap ? `<span class="card-meta-item"><strong>AP:</strong>&nbsp;${escapeHtml(e.ap)}</span>` : ''}
                    ${e.referencia ? `<span class="card-meta-item"><strong>Ref:</strong>&nbsp;${escapeHtml(e.referencia)}</span>` : ''}
                </div>` : ''}
                <div class="card-meta">
                    <span class="card-meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        ${formatDate(e.data_ensaio)}
                    </span>
                    ${e.conclusao ? `<span class="conclusao-badge ${e.conclusao === 'Aprovado' ? 'aprovado' : 'reprovado'}" style="font-size:0.65rem;padding:3px 10px">${e.conclusao}</span>` : ''}
                    ${e.retirado ? `<span class="conclusao-badge reprovado" style="font-size:0.65rem;padding:3px 10px;margin-left:4px;">Retirado</span>` : ''}
                </div>
            </div>
        </div>`;
    }).join('');
}

// ═══════════════════════════════════════════════════════════════════════════════
// CRUD: Clientes
// ═══════════════════════════════════════════════════════════════════════════════
function openNewCliente() {
    clienteFormTitle.textContent = 'Novo Cliente';
    clienteFormId.value = '';
    clienteForm.reset();
    if (document.getElementById('clienteLogoFileName')) {
        document.getElementById('clienteLogoFileName').textContent = 'Selecionar imagem...';
    }
    if (btnExcluirClienteNoModal) btnExcluirClienteNoModal.style.display = 'none';
    openModal(modalCliente);
}

window.handleClienteLogoChange = function (input) {
    const fileNameSpan = document.getElementById('clienteLogoFileName');
    if (input.files && input.files[0]) {
        fileNameSpan.textContent = input.files[0].name;
    } else {
        fileNameSpan.textContent = 'Selecionar imagem...';
    }
};

function openEditClienteAtual() {
    if (!currentCliente) return;
    clienteForm.reset();
    clienteFormId.value = currentCliente.id;
    clienteFormNome.value = currentCliente.nome;
    clienteFormLogo.value = currentCliente.logo_url || '';
    if (clienteLogoFileName) {
        clienteLogoFileName.textContent = currentCliente.logo_url ? 'Imagem atual vinculada' : 'Selecionar imagem...';
    }

    clienteFormTitle.textContent = 'Editar Cliente';
    if (btnExcluirClienteNoModal) btnExcluirClienteNoModal.style.display = 'flex';

    openModal(modalCliente);
}

async function handleClienteSubmit(e) {
    e.preventDefault();

    let logoUrl = clienteFormLogo.value.trim();
    const fileInput = document.getElementById('clienteFormLogoFile');

    try {
        // Se houver arquivo, faz o upload primeiro
        if (fileInput.files && fileInput.files[0]) {
            const formData = new FormData();
            formData.append('logo', fileInput.files[0]);

            const uploadRes = await fetch('/api/upload-logo', {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) throw new Error('Falha ao fazer upload do logo');
            const uploadData = await uploadRes.json();
            logoUrl = uploadData.url;
        }

        const payload = {
            nome: clienteFormNome.value.trim(),
            logo_url: logoUrl
        };

        const isEdit = !!clienteFormId.value;
        const url = isEdit ? `${API_CLIENTES}/${clienteFormId.value}` : API_CLIENTES;
        const res = await fetch(url, {
            method: isEdit ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) { const err = await res.json(); throw new Error(err.erro); }
        const cliente = await res.json();
        closeModal(modalCliente);
        showToast(isEdit ? 'Cliente atualizado!' : 'Cliente criado!');

        if (isEdit && currentCliente && currentCliente.id == cliente.id) {
            currentCliente = cliente;
            if (breadcrumbText) breadcrumbText.innerText = cliente.nome;
        }

        // Recarregar configs globais
        loadSystemConfig();
        if (currentView === 'kanban') renderKanbanBoard();

        showClientes();
    } catch (err) {
        showToast(`Erro: ${err.message}`);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CRUD: Ensaios
// ═══════════════════════════════════════════════════════════════════════════════
function toggleResultadosSection() {
    // Unified form: all sections always available via accordions. No-op.
}

// ─── Accordion helpers ────────────────────────────────────────────────────
window.toggleAccordion = function(name) {
    const body = document.getElementById('body' + name);
    const chevron = document.getElementById('chevron' + name);
    if (!body) return;
    if (body.style.display === 'none') {
        body.style.display = 'block';
        if (chevron) chevron.classList.add('open');
    } else {
        body.style.display = 'none';
        if (chevron) chevron.classList.remove('open');
    }
};

window.updateAccordionStatus = function(name) {
    const statusEl = document.getElementById('status' + name);
    const accordionEl = document.getElementById('accordion' + name);
    if (!statusEl) return;
    let filled = false;
    if (name === 'Bally') filled = !!(formCiclosAM1.value || formCiclosAM2.value);
    else if (name === 'Veslic') filled = !!(formCiclosSecoAM1.value || formCiclosSecoAM2.value || formCiclosUmidoAM1.value || formCiclosUmidoAM2.value || formTransferencia.value);
    else if (name === 'Dinamo') filled = !!(formForcaAM1.value || formForcaAM2.value);
    else if (name === 'Hidrolise') filled = !!formVisual.value;
    if (filled) {
        statusEl.textContent = '✅ Preenchido';
        statusEl.className = 'ensaio-accordion-status done';
        if (accordionEl) accordionEl.classList.add('filled');
    } else {
        statusEl.textContent = '⏳ Pendente';
        statusEl.className = 'ensaio-accordion-status';
        if (accordionEl) accordionEl.classList.remove('filled');
    }
};

function resetAllAccordions() {
    ['Bally', 'Veslic', 'Dinamo', 'Hidrolise', 'Identificacao', 'Complementos'].forEach(name => {
        const body = document.getElementById('body' + name);
        const chevron = document.getElementById('chevron' + name);
        if (body) body.style.display = 'none';
        if (chevron) chevron.classList.remove('open');
    });
    ['Bally', 'Veslic', 'Dinamo', 'Hidrolise'].forEach(name => updateAccordionStatus(name));
}

// Helper: check if ensaio has results for a test type
function ensaioHasBally(e) { return !!(e.resultado_ciclos_am1 || e.resultado_ciclos_am2); }
function ensaioHasVeslic(e) { return !!(e.resultado_ciclos_am1 || e.resultado_ciclos_am2 || e.resultado_ciclos_umido_am1 || e.resultado_ciclos_umido_am2 || e.resultado_transferencia); }
function ensaioHasDinamo(e) { return !!(e.resultado_forca_am1 || e.resultado_forca_am2); }
function ensaioHasHidrolise(e) { return !!e.resultado_visual; }

// For unified records, we detect by filled data. For legacy records, we also check tipo_teste.
function getEnsaioTestBadges(e) {
    if (e.tipo_teste && e.tipo_teste !== 'Completo' && e.tipo_teste !== 'Outros') {
        // Legacy: single-type record
        const badge = BADGE_MAP[e.tipo_teste] || BADGE_MAP['Outros'];
        return `<span class="badge ${badge.cls}">${badge.label}</span>`;
    }
    // Unified: show mini badges for each test
    const tests = [
        { key: 'Bally', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', has: ensaioHasBally(e) },
        { key: 'Veslic', color: '#10B981', bg: 'rgba(16,185,129,0.1)', has: ensaioHasVeslic(e) },
        { key: 'Dinamo', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', has: ensaioHasDinamo(e) },
        { key: 'Hidról.', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', has: ensaioHasHidrolise(e) },
    ];
    return `<div class="card-tests-row">${tests.map(t => 
        `<span class="card-test-badge ${t.has ? 'done' : 'pending'}" style="background:${t.bg};color:${t.color}">${t.has ? '✓' : '○'} ${t.key}</span>`
    ).join('')}</div>`;
}

window.handleEnsaioCapaChange = function (input) {
    const fileNameSpan = document.getElementById('formCapaFileName');
    if (input.files && input.files[0]) {
        fileNameSpan.textContent = input.files[0].name;
    } else {
        fileNameSpan.textContent = 'Selecionar imagem de capa...';
    }
};

function openNewEnsaio() {
    formTitle.textContent = 'Novo Ensaio';
    formId.value = '';
    ensaioForm.reset();
    filePreview.innerHTML = '';
    window.testPhotos = { Bally: [], Veslic: [], Dinamo: [], Hidrolise: [] };
    ['Bally', 'Veslic', 'Dinamo', 'Hidrolise'].forEach(c => window.renderTestPhotosPreview(c));

    formRef.value = '';
    formProjeto.value = '';
    formModelo.value = '';
    formCor.value = '';
    formFornecedorAmostra.value = 'Cromotransfer';
    formSubstrato.value = '';
    formTecnologia.value = '';
    formCategoriaAmostra.value = '';
    formFinalidadeAmostra.value = '';
    formArmario.value = '';
    formPrateleira.value = '';
    formCaixa.value = '';
    formRede.value = '';
    formCapa.value = '';

    if (document.getElementById('formCapaFileName')) {
        document.getElementById('formCapaFileName').textContent = 'Selecionar imagem de capa...';
    }
    const capatFileInput = document.getElementById('formCapaFile');
    if (capatFileInput) capatFileInput.value = '';

    formCategoriaFoto.value = 'Outra';
    formData.value = new Date().toISOString().split('T')[0];
    if (currentCliente) formCliente.value = currentCliente.nome;
    formCondicaoStress.value = 'Condições Normais';
    formCiclosAM1.value = '';
    formCiclosAM2.value = '';
    formCiclosSecoAM1.value = '';
    formCiclosSecoAM2.value = '';
    formCiclosUmidoAM1.value = '';
    formCiclosUmidoAM2.value = '';
    formTransferencia.value = '';
    formVisual.value = '';
    formForcaAM1.value = '';
    formForcaAM2.value = '';
    formFalhaDinamometro.value = '';
    formConclusao.value = '';
    formObservacoes.value = '';

    // Trello fields reset
    if (formDescricao) formDescricao.value = '';
    if (formEtiquetasValue) formEtiquetasValue.value = '';
    document.querySelectorAll('.label-opt').forEach(opt => opt.classList.remove('active'));

    // Parâmetros de Aplicação reset
    if (formParamTemp) formParamTemp.value = '';
    if (formParamTempo) formParamTempo.value = '';
    if (formParamPressao) formParamPressao.value = '';

    populateClientesList();
    formTipo.value = 'Completo';
    resetAllAccordions();
    openModal(modalForm);
}

function openNewEnsaioWithStatus(status) {
    openNewEnsaio();
    // Forçar o status se vier do Kanban
    // Como o status não está no formulário de ensaio (ele é inferido ou automático),
    // vamos garantir que ao salvar ele use este status.
    // O formulário de ensaio padrão não tem campo de status, ele é definido no POST.
    // Mas no Kanban, queremos que o salvamento respeite a coluna.
    // Vou criar uma variável global temporária para isso.
    window.tempKanbanStatus = status;
}

function openNewEnsaioFromHome() {
    currentCliente = null;
    formTitle.textContent = 'Novo Ensaio';
    formId.value = '';
    ensaioForm.reset();
    filePreview.innerHTML = '';
    window.testPhotos = { Bally: [], Veslic: [], Dinamo: [], Hidrolise: [] };
    ['Bally', 'Veslic', 'Dinamo', 'Hidrolise'].forEach(c => window.renderTestPhotosPreview(c));

    formRef.value = '';
    formProjeto.value = '';
    formModelo.value = '';
    formCor.value = '';
    formFornecedorAmostra.value = 'Cromotransfer';
    formSubstrato.value = '';
    formTecnologia.value = '';
    formCategoriaAmostra.value = '';
    formFinalidadeAmostra.value = '';
    formArmario.value = '';
    formPrateleira.value = '';
    formCaixa.value = '';
    formRede.value = '';
    formCapa.value = '';

    if (document.getElementById('formCapaFileName')) {
        document.getElementById('formCapaFileName').textContent = 'Selecionar imagem de capa...';
    }
    const capatFileInputHome = document.getElementById('formCapaFile');
    if (capatFileInputHome) capatFileInputHome.value = '';

    formCategoriaFoto.value = 'Outra';
    formData.value = new Date().toISOString().split('T')[0];
    formCliente.value = '';
    formCondicaoStress.value = 'Condições Normais';
    formCiclosAM1.value = '';
    formCiclosAM2.value = '';
    formCiclosSecoAM1.value = '';
    formCiclosSecoAM2.value = '';
    formCiclosUmidoAM1.value = '';
    formCiclosUmidoAM2.value = '';
    formTransferencia.value = '';
    formVisual.value = '';
    formForcaAM1.value = '';
    formForcaAM2.value = '';
    formFalhaDinamometro.value = '';
    formConclusao.value = '';
    formObservacoes.value = '';

    // Trello fields reset
    if (formDescricao) formDescricao.value = '';
    if (formEtiquetasValue) formEtiquetasValue.value = '';
    document.querySelectorAll('.label-opt').forEach(opt => opt.classList.remove('active'));

    // Parâmetros de Aplicação reset
    if (formParamTemp) formParamTemp.value = '';
    if (formParamTempo) formParamTempo.value = '';
    if (formParamPressao) formParamPressao.value = '';

    populateClientesList();
    formTipo.value = 'Completo';
    resetAllAccordions();
    openModal(modalForm);
}

function populateClientesList() {
    clientesList.innerHTML = allClientes
        .map(c => `<option value="${escapeHtml(c.nome)}">`)
        .join('');
}

function openEditEnsaio(e) {
    window.testPhotos = { Bally: [], Veslic: [], Dinamo: [], Hidrolise: [] };
    ['Bally', 'Veslic', 'Dinamo', 'Hidrolise'].forEach(c => window.renderTestPhotosPreview(c)); // clear on open

    formTitle.textContent = 'Editar Ensaio';
    formId.value = e.id;
    formCliente.value = e.cliente;
    formData.value = e.data_ensaio;
    formTipo.value = e.tipo_teste || 'Completo';
    formAP.value = e.ap || '';
    formRef.value = e.referencia || '';
    formProjeto.value = e.projeto || '';
    formModelo.value = e.modelo || '';
    formCor.value = e.cor || '';
    formFornecedorAmostra.value = e.fornecedor || 'Cromotransfer';
    formSubstrato.value = e.substrato || '';
    formTecnologia.value = e.tecnologia || '';
    formCategoriaAmostra.value = e.categoria || '';
    formFinalidadeAmostra.value = e.finalidade || '';
    formArmario.value = e.loc_armario || '';
    formPrateleira.value = e.loc_prateleira || '';
    formCaixa.value = e.loc_caixa || '';
    formRede.value = e.caminho_rede || '';
    formCapa.value = e.url_capa || '';
    if (document.getElementById('formCapaFileName')) {
        document.getElementById('formCapaFileName').textContent = e.url_capa ? 'Imagem atual vinculada' : 'Selecionar imagem de capa...';
    }
    const capatFileInputEdit = document.getElementById('formCapaFile');
    if (capatFileInputEdit) capatFileInputEdit.value = '';
    formDescricao.value = e.descricao || '';
    formEtiquetasValue.value = e.etiquetas || '';

    // Parâmetros de Aplicação
    if (formParamTemp) formParamTemp.value = e.param_temperatura || '';
    if (formParamTempo) formParamTempo.value = e.param_tempo || '';
    if (formParamPressao) formParamPressao.value = e.param_pressao || '';

    // Reset labels UI
    document.querySelectorAll('.label-opt').forEach(opt => {
        const labels = (e.etiquetas || '').split(',');
        if (labels.includes(opt.dataset.name)) opt.classList.add('active');
        else opt.classList.remove('active');
    });

    formCategoriaFoto.value = 'Outra';
    // Result fields — load ALL results (unified)
    formCondicaoStress.value = e.condicao_stress || 'Condições Normais';
    formCiclosAM1.value = e.resultado_ciclos_am1 || '';
    formCiclosAM2.value = e.resultado_ciclos_am2 || '';
    formCiclosSecoAM1.value = e.resultado_ciclos_am1 || '';
    formCiclosSecoAM2.value = e.resultado_ciclos_am2 || '';
    formCiclosUmidoAM1.value = e.resultado_ciclos_umido_am1 || '';
    formCiclosUmidoAM2.value = e.resultado_ciclos_umido_am2 || '';
    formTransferencia.value = e.resultado_transferencia || '';
    formVisual.value = e.resultado_visual || '';
    formForcaAM1.value = e.resultado_forca_am1 || '';
    formForcaAM2.value = e.resultado_forca_am2 || '';
    formFalhaDinamometro.value = e.falha_dinamometro || '';
    formConclusao.value = e.conclusao || '';
    formObservacoes.value = e.observacoes || '';

    // Trello fields population
    if (formDescricao) formDescricao.value = e.descricao || '';
    if (formEtiquetasValue) formEtiquetasValue.value = e.etiquetas || '';
    document.querySelectorAll('.label-opt').forEach(opt => {
        const labels = (e.etiquetas || '').split(',');
        if (labels.includes(opt.dataset.name)) opt.classList.add('active');
        else opt.classList.remove('active');
    });
    filePreview.innerHTML = '';
    formCategoriaFoto.value = 'Outra';
    populateClientesList();
    resetAllAccordions();
    // Auto-expand accordions that have data
    ['Bally', 'Veslic', 'Dinamo', 'Hidrolise'].forEach(name => {
        updateAccordionStatus(name);
        const statusEl = document.getElementById('status' + name);
        if (statusEl && statusEl.classList.contains('done')) {
            const body = document.getElementById('body' + name);
            const chevron = document.getElementById('chevron' + name);
            if (body) body.style.display = 'block';
            if (chevron) chevron.classList.add('open');
        }
    });
    openModal(modalForm);
}

async function handleEnsaioSubmit(e) {
    if (e) e.preventDefault();
    console.log("handleEnsaioSubmit started. isEdit:", !!formId.value);

    try {
        // Manual validation (form has novalidate to prevent hidden-field issues)
        if (!formCliente.value.trim()) {
            console.warn("Validation failed: Cliente empty");
            showToast('Preencha o campo Cliente.');
        formCliente.focus();
        return;
    }
    if (!formData.value) {
        showToast('Preencha a Data do Ensaio.');
        formData.focus();
        return;
    }

    const isEdit = !!formId.value;
    if (isEdit && !await validarAcessoAdmin("Editar Ensaio", "Autorizar alteração em ensaio já cadastrado?")) return;

    const payload = {
        cliente_id: currentCliente ? currentCliente.id : undefined,
        cliente: formCliente.value.trim(),
        data_ensaio: formData.value,
        tipo_teste: formTipo.value || 'Completo',
        ap: formAP.value.trim(),
        referencia: formRef.value.trim(),
        projeto: formProjeto.value.trim(),
        modelo: formModelo.value.trim(),
        cor: formCor.value.trim(),
        fornecedor: formFornecedorAmostra.value.trim(),
        substrato: formSubstrato.value.trim(),
        tecnologia: formTecnologia.value.trim(),
        categoria: formCategoriaAmostra.value,
        finalidade: formFinalidadeAmostra.value,
        loc_armario: formArmario.value.trim(),
        loc_prateleira: formPrateleira.value.trim(),
        loc_caixa: formCaixa.value.trim(),
        caminho_rede: formRede.value.trim(),
        url_capa: formCapa.value.trim(),

        condicao_stress: formCondicaoStress.value,
        // Unified: send ALL results — Bally uses formCiclosAM1/AM2, Veslic uses formCiclosSecoAM1/AM2
        resultado_ciclos_am1: formCiclosAM1.value || formCiclosSecoAM1.value || '',
        resultado_ciclos_am2: formCiclosAM2.value || formCiclosSecoAM2.value || '',
        resultado_ciclos_umido_am1: formCiclosUmidoAM1.value || '',
        resultado_ciclos_umido_am2: formCiclosUmidoAM2.value || '',
        resultado_transferencia: formTransferencia.value || '',
        resultado_visual: formVisual.value || '',
        resultado_forca_am1: formForcaAM1 ? formForcaAM1.value : '',
        resultado_forca_am2: formForcaAM2 ? formForcaAM2.value : '',
        falha_dinamometro: formFalhaDinamometro ? formFalhaDinamometro.value : '',
        conclusao: formConclusao ? formConclusao.value : '',
        observacoes: formObservacoes ? formObservacoes.value : '',
        status: formId && formId.value ? undefined : (window.tempKanbanStatus || 'Amostras Recebidas'), // Usa status da coluna se disponível
        etiquetas: formEtiquetasValue ? formEtiquetasValue.value : '',
        descricao: formDescricao ? formDescricao.value : '',
        param_temperatura: formParamTemp ? formParamTemp.value : '',
        param_tempo: formParamTempo ? formParamTempo.value : '',
        param_pressao: formParamPressao ? formParamPressao.value : ''
    };
    // Limpar status temporário após capturar
    window.tempKanbanStatus = null;

    const btnSubmit = document.getElementById('btnSubmitForm');
    const originalHtml = btnSubmit ? btnSubmit.innerHTML : 'Salvar Ensaio';
    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = 'Salvando...';
    }

    try {
        // Upload de Capa se houver arquivo selecionado
        let urlCapa = formCapa.value.trim();
        const capaFileField = document.getElementById('formCapaFile');
        const capaCamField = document.getElementById('formCapaCam');
        const activeCapaFile = (capaCamField && capaCamField.files && capaCamField.files[0]) 
            ? capaCamField.files[0] 
            : (capaFileField && capaFileField.files && capaFileField.files[0] ? capaFileField.files[0] : null);

        if (activeCapaFile) {
            const formDataCapa = new FormData();
            formDataCapa.append('logo', activeCapaFile); // Reutiliza rota de upload de logo que aceita um arquivo
            const uploadRes = await fetch('/api/upload-logo', {
                method: 'POST',
                body: formDataCapa
            });
            if (!uploadRes.ok) throw new Error('Falha ao fazer upload da capa');
            const uploadData = await uploadRes.json();
            urlCapa = uploadData.url;
        }
        payload.url_capa = urlCapa;

        const url = isEdit ? `${API_ENSAIOS}/${formId.value}` : API_ENSAIOS;
        const res = await fetch(url, {
            method: isEdit ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (res.ok) {
            // Upload images if any
            if (formImagens.files.length > 0) {
                const fd = new FormData();
                for (const f of formImagens.files) fd.append('imagens', f);
                fd.append('categoria_foto', formCategoriaFoto.value);
                await fetch(`${API_ENSAIOS}/${data.id}/upload`, { method: 'POST', body: fd });
            }

            // New test-specific photos
            for (const category of Object.keys(window.testPhotos || {})) {
                if (window.testPhotos[category] && window.testPhotos[category].length > 0) {
                    const fdTest = new FormData();
                    window.testPhotos[category].forEach(photoObj => {
                        fdTest.append('imagens', photoObj.file);
                    });
                    fdTest.append('categoria_foto', category);
                    await fetch(`${API_ENSAIOS}/${data.id}/upload`, { method: 'POST', body: fdTest });
                }
            }
            closeModal(modalForm);
            showToast(isEdit ? 'Ensaio atualizado!' : 'Ensaio cadastrado!');

            // Transferir Atividades se vier de um P&D
            if (!isEdit && currentDevToEnsaioId && data.id) {
                try {
                    await fetch(`${API_DESENVOLVIMENTOS}/${currentDevToEnsaioId}/transferir-atividades`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ newEnsaioId: data.id })
                    });
                } catch (e) {
                    console.error("Erro ao transferir atividades:", e);
                }
                currentDevToEnsaioId = null;
            } else {
                currentDevToEnsaioId = null;
            }

            if (currentView === 'clientes') showClientes();
            else if (currentView === 'ensaios') openCliente(currentCliente.id);
            else if (currentView === 'kanban') renderKanbanBoard();
        } else {
            showToast('Erro: ' + (data.error || 'Falha ao salvar.'));
        }
    } catch (err) {
        console.error("Erro no submit:", err);
        showToast('Erro de conexão.');
    } finally {
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = originalHtml;
        }
    }
  } catch (syncErr) {
      console.error("Erro síncrono fatal em handleEnsaioSubmit:", syncErr);
      alert("ERRO FATAL AO SALVAR: " + syncErr.message + "\n\nStack:\n" + syncErr.stack);
  }
}
async function deleteEnsaio(id) {
    if (!await validarAcessoAdmin("Excluir Ensaio", "Tem certeza que deseja excluir este ensaio?")) return;
    try {
        await fetch(`${API_ENSAIOS}/${id}`, { method: 'DELETE' });
        closeModal(modalDetalhes);
        showToast('Ensaio excluído.');
        if (currentCliente) openCliente(currentCliente.id);
    } catch (err) {
        showToast('Erro ao excluir ensaio.');
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CRUD: Retirada
// ═══════════════════════════════════════════════════════════════════════════════
async function marcarComoRetirado(id) {
    if (!await showCustomPromptModal("Confirmação", "Deseja marcar esta amostra como retirada? O espaço no armário será liberado.", false)) return;
    try {
        const res = await fetch(`${API_ENSAIOS}/${id}/retirar`, { method: 'PUT' });
        if (!res.ok) throw new Error('Falha ao retirar amostra');

        // Update local object
        const updatedEnsaio = await res.json();
        const idx = allEnsaios.findIndex(x => x.id === id);
        if (idx >= 0) {
            allEnsaios[idx] = updatedEnsaio;
        }

        showToast('Amostra marcada como retirada.');
        closeModal(modalDetalhes);
        filterEnsaios(); // Refresh list to show change
    } catch (err) {
        showToast('Erro ao marcar amostra como retirada.');
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Modal: Detalhes
// ═══════════════════════════════════════════════════════════════════════════════
function openDetalhes(id) {
    const e = allEnsaios.find(x => x.id === id);
    if (!e) return;
    currentEnsaioId = id;

    // Cover
    if (e.url_capa && e.url_capa.trim()) {
        modalCoverImg.src = e.url_capa;
        modalCoverImg.style.display = 'block';
        modalCoverPlaceholder.style.display = 'none';
    } else {
        modalCoverImg.style.display = 'none';
        modalCoverPlaceholder.style.display = 'flex';
    }

    const clienteH2 = modalDetalhes.querySelector('.modal-header-row h2');
    clienteH2.textContent = e.cliente;

    // Show test type or 'Completo' for unified records
    const badgeLabel = (e.tipo_teste && e.tipo_teste !== 'Completo' && e.tipo_teste !== 'Outros') ? e.tipo_teste : 'Completo';
    const badge = BADGE_MAP[badgeLabel] || BADGE_MAP['Outros'];
    modalBadge.className = `badge ${badge.cls}`;
    modalBadge.textContent = badge.label;

    modalData.textContent = formatDate(e.data_ensaio);
    modalRastreio.textContent = e.codigo_rastreio;
    modalAP.textContent = e.ap || '—';
    modalRef.textContent = e.referencia || '—';

    // Labels no Modal
    if (modalEtiquetasContainer) {
        // Parse etiquetas config
        const tagsConfigStr = systemSettings.etiquetas_config || '[{"cor":"#4BCE97","nome":"Concluído"},{"cor":"#F5CD47","nome":"Atenção"},{"cor":"#FEA362","nome":"Prioridade"},{"cor":"#F87168","nome":"Urgente"},{"cor":"#9F8FEF","nome":"Aguardando"},{"cor":"#579DFF","nome":"Em Análise"}]';
        try {
            window.etiquetasConfig = JSON.parse(tagsConfigStr);
        } catch (e) {
            window.etiquetasConfig = [];
        }
        const labelMap = {};
        window.etiquetasConfig.forEach(tag => {
            labelMap[tag.nome] = tag.cor;
        });
        const labels = e.etiquetas ? e.etiquetas.split(',') : [];
        modalEtiquetasContainer.innerHTML = labels.map(l => `
            <span class="modal-label-tag" style="background:${labelMap[l] || '#ccc'}">${escapeHtml(l)}</span>
        `).join('');
    }

    // Descrição no Modal
    if (modalDescricaoSection && modalDescricaoText) {
        if (e.descricao) {
            modalDescricaoSection.style.display = 'block';
            modalDescricaoText.textContent = e.descricao;
        } else {
            modalDescricaoSection.style.display = 'none';
        }
    }

    // Parâmetros de Aplicação
    const modalParametrosSection = document.getElementById('modalParametrosSection');
    const modalParamTemp = document.getElementById('modalParamTemp');
    const modalParamTempo = document.getElementById('modalParamTempo');
    const modalParamPressao = document.getElementById('modalParamPressao');

    if (modalParametrosSection && (e.param_temperatura || e.param_tempo || e.param_pressao)) {
        modalParametrosSection.style.display = 'block';
        if (modalParamTemp) modalParamTemp.textContent = e.param_temperatura || '-';
        if (modalParamTempo) modalParamTempo.textContent = e.param_tempo || '-';
        if (modalParamPressao) modalParamPressao.textContent = e.param_pressao || '-';
    } else if (modalParametrosSection) {
        modalParametrosSection.style.display = 'none';
    }

    // Carregar Atividades
    fetchAtividades(e.id);

    // Localização / Retirada
    if (e.retirado) {
        badgeRetirado.style.display = 'inline-block';
        modalLocationGrid.style.display = 'none';
        btnMarcarRetirado.style.display = 'none';
    } else {
        badgeRetirado.style.display = 'none';
        modalLocationGrid.style.display = 'grid';
        modalArmario.textContent = e.loc_armario || '—';
        modalPrateleira.textContent = e.loc_prateleira || '—';
        modalCaixa.textContent = e.loc_caixa || '—';
        btnMarcarRetirado.style.display = 'flex';
    }

    if (e.caminho_rede && e.caminho_rede.trim()) {
        modalRedeSection.style.display = 'block';
        modalRede.textContent = e.caminho_rede;
    } else {
        modalRedeSection.style.display = 'none';
    }

    // ─── Results ──────────────────────────────────────────
    renderModalResultados(e);

    // ─── Conclusão ────────────────────────────────────────
    if (e.conclusao) {
        modalConclusao.style.display = 'block';
        modalConclusaoBadge.textContent = e.conclusao === 'Aprovado' ? '✅ Aprovado' : '❌ Reprovado';
        modalConclusaoBadge.className = `conclusao-badge ${e.conclusao === 'Aprovado' ? 'aprovado' : 'reprovado'}`;
    } else {
        modalConclusao.style.display = 'none';
    }

    // Gallery (Exclude test-specific photos)
    const generalImages = (e.imagens || []).filter(img => 
        !['Bally', 'Veslic', 'Dinamo', 'Hidrolise'].includes(img.categoria_foto)
    );

    if (generalImages.length > 0) {
        modalGaleriaSection.style.display = 'block';
        
        const groups = {};
        generalImages.forEach(img => {
            const cat = img.categoria_foto || 'Outra';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(img);
        });

        let html = '';
        for (const [cat, imgs] of Object.entries(groups)) {
            html += `<h4 style="margin: 10px 0 5px 0; color: var(--text-secondary); font-size: 0.85em; text-transform:uppercase;">${escapeHtml(cat)}</h4>`;
            html += `<div style="display:flex; flex-wrap:wrap; gap:8px;">`;
            html += imgs.map(img => 
                `<img class="gallery-thumb" style="cursor: pointer; border-radius:4px;" src="${escapeHtml(img.url)}" alt="${escapeHtml(img.nome)}" title="${escapeHtml(img.nome)}" onclick="openLightbox('${escapeHtml(img.url)}')">`
            ).join('');
            html += `</div>`;
        }
        modalGallery.innerHTML = html;
    } else {
        modalGaleriaSection.style.display = 'none';
    }

    // QR
    generateQRCode(e);

    openModal(modalDetalhes);
}

function renderModalResultados(e) {
    let items = [];
    
    function getCategoryImagesHtml(category) {
        if (!e.imagens || !e.imagens.length) return '';
        const imgs = e.imagens.filter(img => img.categoria_foto === category);
        if (!imgs.length) return '';
        return `<div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:12px; grid-column: 1 / -1;">` +
            imgs.map(img => `<img style="width:56px; height:56px; cursor: pointer; border-radius:6px; object-fit: cover; border: 1px solid #e5e7eb;" src="${escapeHtml(img.url)}" alt="${escapeHtml(img.nome)}" title="${escapeHtml(img.nome)}" onclick="openLightbox('${escapeHtml(img.url)}')">`).join('') +
            `</div>`;
    }

    // Unified: show all results that have data
    if (ensaioHasBally(e)) {
        items.push({ label: 'Bally — AM1', value: e.resultado_ciclos_am1 || '-', norma: 'Flexão Contínua', html: getCategoryImagesHtml('Bally') });
        items.push({ label: 'Bally — AM2', value: e.resultado_ciclos_am2 || '-', norma: 'Flexão Contínua' });
    }
    if (ensaioHasVeslic(e)) {
        items.push({ label: 'Veslic Seco — AM1', value: e.resultado_ciclos_am1 || '-', norma: 'Atrito Seco', html: getCategoryImagesHtml('Veslic') });
        items.push({ label: 'Veslic Seco — AM2', value: e.resultado_ciclos_am2 || '-', norma: 'Atrito Seco' });
        items.push({ label: 'Veslic Úmido — AM1', value: e.resultado_ciclos_umido_am1 || '-', norma: 'Atrito Úmido' });
        items.push({ label: 'Veslic Úmido — AM2', value: e.resultado_ciclos_umido_am2 || '-', norma: 'Atrito Úmido' });
        if (e.resultado_transferencia) items.push({ label: 'Transferência', value: e.resultado_transferencia, norma: 'Mín: Nota 3' });
    }
    if (ensaioHasDinamo(e)) {
        items.push({ label: 'Dinamômetro — AM1', value: `${e.resultado_forca_am1 || '-'} N/cm`, norma: 'Mín: 25 N/cm', html: getCategoryImagesHtml('Dinamo') });
        items.push({ label: 'Dinamômetro — AM2', value: `${e.resultado_forca_am2 || '-'} N/cm`, norma: 'Mín: 25 N/cm' });
    }
    if (ensaioHasHidrolise(e)) {
        items.push({ label: 'Hidrólise Visual', value: e.resultado_visual, norma: 'Sem Danos / Danos Leves', html: getCategoryImagesHtml('Hidrolise') });
    }

    if (items.length > 0) {
        modalResultados.style.display = 'block';
        modalResultadoGrid.innerHTML = items.map(it => `
            <div class="resultado-item" style="display:flex; flex-direction:column;">
                <label>${it.label}</label>
                <div class="value">${it.value}</div>
                <div class="norma">${it.norma}</div>
                ${it.html || ''}
            </div>
        `).join('');
    } else {
        modalResultados.style.display = 'none';
    }
}

// ─── QR Code ─────────────────────────────────────────────────────────────────
function generateQRCode(ensaio) {
    modalQrCode.innerHTML = '';
    const baseUrl = (systemSettings.url_publica && systemSettings.url_publica.trim() !== '') ? systemSettings.url_publica.trim() : window.location.origin;
    const qrContent = `${baseUrl}/consulta/${ensaio.codigo_rastreio}`;
    new QRCode(modalQrCode, {
        text: qrContent,
        width: 140, height: 140,
        colorDark: '#1D1D1F', colorLight: '#FFFFFF',
        correctLevel: QRCode.CorrectLevel.M,
    });
    qrLabel.textContent = ensaio.codigo_rastreio;
}

function abrirRede() {
    const e = allEnsaios.find(x => x.id === currentEnsaioId);
    if (!e || !e.caminho_rede) return;

    // Browsers block direct file:// access. 
    // Best we can do is copy to clipboard and notify, OR try window.open if it's a valid URI.
    // However, users often expect it to "just open". In a local environment, they might have 
    // browser extensions or protocols. Let's try window.open but prioritize instructions.
    window.open(e.caminho_rede, '_blank');
    showToast('Tentando abrir pasta... Se não abrir, use o botão Copiar.');
}

function copyRede() {
    const e = allEnsaios.find(x => x.id === currentEnsaioId);
    if (!e || !e.caminho_rede) return;

    navigator.clipboard.writeText(e.caminho_rede)
        .then(() => showToast('Caminho copiado para a área de transferência!'))
        .catch(() => showToast('Erro ao copiar caminho.'));
}

// ─── Lightbox ────────────────────────────────────────────────────────────────
function openLightbox(url) {
    let lb = document.querySelector('.lightbox');
    if (!lb) {
        lb = document.createElement('div');
        lb.className = 'lightbox';
        lb.addEventListener('click', () => lb.classList.remove('active'));
        document.body.appendChild(lb);
    }
    lb.innerHTML = `<img src="${url}" alt="Imagem ampliada">`;
    lb.classList.add('active');
}

// ═══════════════════════════════════════════════════════════════════════════════
// PDF Export — Laudo Profissional (Minimalist Apple Style)
// ═══════════════════════════════════════════════════════════════════════════════
async function exportarLaudoPDF(ensaio) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        showToast("Erro: Biblioteca jsPDF não foi carregada no navegador.");
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const W = 210, H = 297, M = 20;
    let y = 20;

    // ─── Header Organizado (Logo L | Info C | QR R) ──────────────────
    const headerHeight = 25;
    const qrSize = 22;
    const logoSize = 25;

    // 1. Logo (Esquerda - Mantendo Proporção)
    if (systemSettings.empresa_logo) {
        const logoDataUrl = await fetchImageAsDataUrl(systemSettings.empresa_logo);
        if (logoDataUrl) {
            // Criar objeto de imagem para calcular proporção
            const imgObj = new Image();
            imgObj.src = logoDataUrl;
            await new Promise(resolve => imgObj.onload = resolve);

            const originalW = imgObj.width;
            const originalH = imgObj.height;
            const ratio = originalW / originalH;

            let finalW = logoSize;
            let finalH = logoSize / ratio;

            // Se a altura calculada for maior que o limite, ajusta pela altura
            if (finalH > logoSize) {
                finalH = logoSize;
                finalW = logoSize * ratio;
            }

            doc.addImage(logoDataUrl, 'PNG', M, y - 5, finalW, finalH, undefined, 'FAST');
        } else {
            doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(31, 41, 55);
            doc.text('CTIA', M, y);
        }
    } else {
        doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(31, 41, 55);
        doc.text('CTIA', M, y);
    }

    // 2. Informações Centrais (Apenas Nome)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text('CENTRO TECNOLÓGICO DE INTELIGÊNCIA APLICADA', W / 2, y + 2, { align: 'center' });

    // 3. QR Code (Direita)
    const qrX = W - M - qrSize;
    const qrY = y - 5;
    const tempQrDiv = document.createElement('div');
    const baseUrl = (systemSettings.url_publica && systemSettings.url_publica.trim() !== '') ? systemSettings.url_publica.trim() : window.location.origin;
    new QRCode(tempQrDiv, {
        text: `${baseUrl}/consulta/${ensaio.codigo_rastreio}`,
        width: 120, height: 120,
        correctLevel: QRCode.CorrectLevel.M
    });

    await new Promise(r => setTimeout(r, 450)); // Tempo para render do QR
    const qrImg = tempQrDiv.querySelector('img') || tempQrDiv.querySelector('canvas');
    let qrDataUrl = '';
    if (qrImg && qrImg.tagName === 'IMG') qrDataUrl = qrImg.src;
    else if (qrImg && qrImg.tagName === 'CANVAS') qrDataUrl = qrImg.toDataURL();

    if (qrDataUrl) {
        doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
        doc.setFontSize(6);
        doc.setTextColor(156, 163, 175);
        doc.text('VALIDAÇÃO DIGITAL', qrX + (qrSize / 2), qrY + qrSize + 3, { align: 'center' });
    }

    y += 18;
    doc.setDrawColor(229, 231, 235); // #e5e7eb
    doc.setLineWidth(0.5);
    doc.line(M, y, W - M, y);
    y += 12;

    // ─── Document Title ──────────────────────────────
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39); // #111827
    doc.text('CERTIFICADO DE ANÁLISE LABORATORIAL', M, y);
    y += 10;

    // ─── Identification Table Minimalist ────────────────
    doc.autoTable({
        startY: y,
        margin: { left: M, right: M },
        theme: 'plain',
        styles: { cellPadding: 2, fontSize: 8, textColor: [31, 41, 55], font: 'helvetica' },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 35, textColor: [107, 114, 128] }, 2: { fontStyle: 'bold', cellWidth: 35, textColor: [107, 114, 128] } },
        body: [
            ['Cliente / Marca', ensaio.cliente || '—', 'Projeto', ensaio.projeto || '—'],
            ['Modelo', ensaio.modelo || '—', 'Cor', ensaio.cor || '—'],
            ['Fornecedor', ensaio.fornecedor || '—', 'Substrato', ensaio.substrato || '—'],
            ['Tecnologia', ensaio.tecnologia || '—', 'Categoria', ensaio.categoria || '—'],
            ['Finalidade', ensaio.finalidade || '—', 'Data Ensaio', formatDate(ensaio.data_ensaio)],
            ['Referência / Artigo', ensaio.referencia || '—', 'Rastreabilidade AP', ensaio.ap || '—']
        ],
    });
    y = doc.lastAutoTable.finalY + 12;

    // ─── Parâmetros de Aplicação ───
    if (ensaio.param_temperatura || ensaio.param_tempo || ensaio.param_pressao) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39);
        doc.text('PARÂMETROS DE APLICAÇÃO (Recomendação)', M, y);
        y += 6;

        doc.autoTable({
            startY: y,
            margin: { left: M, right: M },
            theme: 'plain',
            styles: { cellPadding: 2, fontSize: 8, textColor: [31, 41, 55], font: 'helvetica' },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 35, textColor: [107, 114, 128] }, 2: { fontStyle: 'bold', cellWidth: 35, textColor: [107, 114, 128] } },
            body: [
                ['Temperatura', `${ensaio.param_temperatura || '-'}`, 'Tempo', `${ensaio.param_tempo || '-'}`],
                ['Pressão', `${ensaio.param_pressao || '-'}`, '', '']
            ]
        });
        y = doc.lastAutoTable.finalY + 12;
    }

    // ─── Results Table Minimalist ───────────────────────
    const resultRows = buildResultRows(ensaio);
    if (resultRows.length > 0) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39);
        doc.text('RESULTADOS TÉCNICOS', M, y);
        y += 6;

        doc.autoTable({
            startY: y,
            margin: { left: M, right: M },
            theme: 'grid',
            headStyles: { fillColor: [243, 244, 246], textColor: [55, 65, 81], fontSize: 7, fontStyle: 'bold', lineColor: [229, 231, 235], lineWidth: 0.1, halign: 'center' },
            bodyStyles: { fontSize: 8, textColor: [31, 41, 55], lineColor: [229, 231, 235], lineWidth: 0.1, halign: 'center' },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            head: [['Método (Norma)', 'Parâmetro', 'Unidade', 'Req. Mínimo', 'Resultado AM1', 'Resultado AM2']],
            body: resultRows,
            didParseCell: function (data) {
                // If we want color coding we can check specific text, e.g. Falha, but Vulcabras just needs raw data in these cells
            }
        });
        y = doc.lastAutoTable.finalY + 8;
    }

    // ─── Metodologia Automática ──────────────────────────
    let metodologia = "Metodologia interna padrão do laboratório CTIA.";
    if (ensaio.tipo_teste === 'Bally') metodologia = "Ensaio realizado conforme a norma ABNT NBR 13521 - Determinação da resistência à flexão contínua.";
    else if (ensaio.tipo_teste === 'Veslic') metodologia = "Ensaio realizado conforme a norma ABNT NBR 14744 - Determinação da solidez da cor ao atrito (Veslic).";
    else if (ensaio.tipo_teste === 'Hidrólise') metodologia = "Avaliação padronizada sobre envelhecimento acelerado e degradação hidrolítica.";
    else if (ensaio.tipo_teste === 'Dinamômetro') metodologia = "Ensaio de força de fixação / rasgo executado seguindo diretrizes de tração (Mín. 25 N/cm).";

    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(107, 114, 128);
    doc.text(`Metodologia: ${metodologia}`, M, y, { maxWidth: W - (M * 2) });
    y += 12;

    // ─── Conclusão / Status Badge ────────────────────────
    if (ensaio.conclusao) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39);
        doc.text('CONCLUSÃO FINAL', M, y);
        y += 6;

        const isAprov = ensaio.conclusao === 'Aprovado';
        const badgeColor = isAprov ? [220, 252, 231] : [254, 226, 226]; // pastel green / red
        const textColor = isAprov ? [22, 101, 52] : [153, 27, 27];

        doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
        doc.roundedRect(M, y - 4, 60, 12, 3, 3, 'F'); // Increased size for prominence

        doc.setFontSize(12); // Increased font size
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text(ensaio.conclusao.toUpperCase(), M + 30, y + 2.5, { align: 'center' });
        y += 16; // Adjusted y for larger badge
    }

    // ─── Parecer Técnico / Observações ───────────────────
    if (ensaio.observacoes) {
        if (y > 230) { doc.addPage(); y = 30; }
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39);
        doc.text('PARECER TÉCNICO', M, y);
        y += 6;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(55, 65, 81);
        const splitText = doc.splitTextToSize(ensaio.observacoes, W - (M * 2));
        doc.text(splitText, M, y);
        y += (splitText.length * 5) + 6;
    }

    // ─── Helper for Image fetching ───────────
    async function fetchImageAsDataUrl(url) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            return await new Promise(resolve => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        } catch (e) { return null; }
    }

    // ─── Anexo Fotográfico (Grid Limpo) ──────────────────
    if (ensaio.imagens && ensaio.imagens.length > 0) {
        doc.addPage();
        y = M;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39);
        doc.text('ANEXO FOTOGRÁFICO', M, y);
        y += 8;

        const originais = ensaio.imagens.filter(img => img.categoria_foto === 'Original');
        const depois = ensaio.imagens.filter(img => img.categoria_foto === 'Pós-Ensaio');
        const outras = ensaio.imagens.filter(img => img.categoria_foto !== 'Original' && img.categoria_foto !== 'Pós-Ensaio');

        const imgW = 80, imgH = 60;

        const drawImageLabel = (label, x, y) => {
            doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(75, 85, 99);
            doc.text(label, x, y);
        };

        const maxPairs = Math.max(originais.length, depois.length);
        for (let i = 0; i < maxPairs; i++) {
            if (y + imgH + 12 > 260) { doc.addPage(); y = M; }

            // Left (Original)
            if (i < originais.length) {
                const leftUrl = await fetchImageAsDataUrl(originais[i].url);
                if (leftUrl) {
                    drawImageLabel('Foto Original (Antes)', M, y);
                    doc.addImage(leftUrl, 'JPEG', M, y + 3, imgW, imgH);
                    doc.setDrawColor(229, 231, 235); doc.rect(M, y + 3, imgW, imgH);
                }
            }

            // Right (Pós-Ensaio)
            if (i < depois.length) {
                const rightUrl = await fetchImageAsDataUrl(depois[i].url);
                if (rightUrl) {
                    drawImageLabel('Foto Pós-Ensaio (Depois)', M + imgW + 10, y);
                    doc.addImage(rightUrl, 'JPEG', M + imgW + 10, y + 3, imgW, imgH);
                    doc.setDrawColor(229, 231, 235); doc.rect(M + imgW + 10, y + 3, imgW, imgH);
                }
            }
            y += imgH + 15;
        }

        // Outras
        for (let i = 0; i < outras.length; i++) {
            if (y + imgH + 12 > 260) { doc.addPage(); y = M; }
            const x = M + (i % 2) * (imgW + 10);
            const dataUrl = await fetchImageAsDataUrl(outras[i].url);
            if (dataUrl) {
                const catLabel = outras[i].categoria_foto && outras[i].categoria_foto !== 'Outra' ? outras[i].categoria_foto : 'Registro Analítico';
                drawImageLabel(catLabel, x, y);
                doc.addImage(dataUrl, 'JPEG', x, y + 3, imgW, imgH);
                doc.setDrawColor(229, 231, 235); doc.rect(x, y + 3, imgW, imgH);
            }
            if (i % 2 === 1 || i === outras.length - 1) y += imgH + 15;
        }
    }

    // ─── Signatures ──────────────────────────
    const remainingSpace = H - y;
    if (remainingSpace < 45) { doc.addPage(); y = 40; }
    else { y = Math.max(y, H - 65); }

    const colWidthAssin = (W - (M * 2)) / 2;
    doc.setDrawColor(156, 163, 175);
    doc.setLineWidth(0.3);

    // Linha 1
    doc.line(M + 5, y, M + colWidthAssin - 5, y);
    // Linha 2
    doc.line(M + colWidthAssin + 5, y, W - M - 5, y);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text(systemSettings.analista_nome || 'Lúcio Monteiro', M + colWidthAssin / 2, y + 5, { align: 'center' });
    doc.text(systemSettings.gerente_nome || 'Jeferson Bueno', M + colWidthAssin + colWidthAssin / 2, y + 5, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(systemSettings.analista_cargo || 'Analista de Laboratório', M + colWidthAssin / 2, y + 9, { align: 'center' });
    doc.text(systemSettings.gerente_cargo || 'Gerente de Processos / Resp. Técnico', M + colWidthAssin + colWidthAssin / 2, y + 9, { align: 'center' });

    // Inject Glossary Page
    drawGlossary(doc);

    // ─── Global Footer (Inject on all pages) ──────────────────
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(156, 163, 175); // #9ca3af
        const footerText = `${systemSettings.empresa_nome || 'CTIA — CROMOTRANSFER'} | ${systemSettings.empresa_endereco || 'R. Kesser Zattar, 162 - João Costa, Joinville - SC'} | ${systemSettings.empresa_email || 'ctia.lab@cromotransfer.com'}`;
        const now = new Date();
        const d = String(now.getDate()).padStart(2, '0');
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const y = now.getFullYear();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        const dataHora = `${d}/${m}/${y} às ${hh}:${mm}:${ss}`;

        doc.text(footerText, W / 2, H - 12, { align: 'center' });
        doc.text(`Documento gerado eletronicamente pelo Sistema de Gestão CTIA em ${dataHora}.`, W / 2, H - 8, { align: 'center' });
        doc.text(`Página ${i} de ${pageCount}`, W - M, H - 8, { align: 'right' });
    }

    const safeName = (ensaio.codigo_rastreio || 'SemRastreio').replace(/[^a-z0-9]/gi, '_');
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laudo_CTIA_${safeName}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Laudo PDF exportado com sucesso!');
}

function buildResultRows(e) {
    const rows = [];
    const stress = e.condicao_stress === 'Após Envelhecimento (Stress Test)' ? ' (Stress Test)' : '';

    // Unified: include all types that have data
    if (ensaioHasBally(e)) {
        const req = (e.categoria === 'Premium' || e.categoria === 'Performance') ? 'Mín. 50.000 c' : 'Mín. 30.000 c';
        rows.push([{ content: 'BALLY FLEX', colSpan: 6, styles: { fillColor: [219, 234, 254], fontStyle: 'bold', textColor: [29, 78, 216], halign: 'center' } }]);
        rows.push([
            'NBR 13521' + stress,
            'Flexão Contínua',
            'Grau',
            req,
            e.resultado_ciclos_am1 || '-',
            e.resultado_ciclos_am2 || '-'
        ]);
    }
    if (ensaioHasVeslic(e)) {
        rows.push([{ content: 'VESLIC', colSpan: 6, styles: { fillColor: [209, 250, 229], fontStyle: 'bold', textColor: [4, 120, 87], halign: 'center' } }]);
        rows.push([
            'NBR 14744' + stress,
            'Atrito Seco',
            'Grau',
            'Mín. 3',
            e.resultado_ciclos_am1 || '-',
            e.resultado_ciclos_am2 || '-'
        ]);
        rows.push([
            'NBR 14744' + stress,
            'Atrito Úmido',
            'Grau',
            'Mín. 3',
            e.resultado_ciclos_umido_am1 || '-',
            e.resultado_ciclos_umido_am2 || '-'
        ]);
        rows.push([
            'NBR 14744' + stress,
            'Transferência',
            'Grau',
            'Mín. 3',
            e.resultado_transferencia || '-',
            e.resultado_transferencia || '-'
        ]);
    }
    if (ensaioHasHidrolise(e)) {
        rows.push([{ content: 'HIDRÓLISE', colSpan: 6, styles: { fillColor: [254, 243, 199], fontStyle: 'bold', textColor: [146, 64, 14], halign: 'center' } }]);
        rows.push([
            'IntLab Hidro' + stress,
            'Degradação Visual',
            'Visual',
            'Sem Alteração',
            e.resultado_visual || '-',
            e.resultado_visual || '-'
        ]);
    }
    if (ensaioHasDinamo(e)) {
        const r1 = e.resultado_forca_am1 ? `${e.resultado_forca_am1} ${e.falha_dinamometro ? '(' + e.falha_dinamometro + ')' : ''}` : '-';
        const r2 = e.resultado_forca_am2 ? `${e.resultado_forca_am2} ${e.falha_dinamometro ? '(' + e.falha_dinamometro + ')' : ''}` : '-';
        rows.push([{ content: 'DINAMÔMETRO', colSpan: 6, styles: { fillColor: [237, 233, 254], fontStyle: 'bold', textColor: [91, 33, 182], halign: 'center' } }]);
        rows.push([
            'Tração IntLab' + stress,
            'Força de Fixação / Descolamento',
            'N/cm / C. Falha',
            'Mín. 25 N/cm',
            r1,
            r2
        ]);
    }
    return rows;
}

function formatObj(obj) {
    if (Object.keys(obj).length === 0) return '';
    const parts = Object.entries(obj).map(([k, v]) => `${k}:${v}`);
    return `\n(${parts.join(', ')})`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PDF Export — Dossiê Completo por AP (Minimalist Apple Style)
// ═══════════════════════════════════════════════════════════════════════════════
async function exportarDossiePDF(ap) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        showToast("Erro: Biblioteca jsPDF não foi carregada no navegador.");
        return;
    }
    const ensaiosAP = allEnsaios.filter(e => e.ap === ap).sort((a, b) => new Date(a.data_ensaio) - new Date(b.data_ensaio));
    if (ensaiosAP.length === 0) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const W = 210, H = 297, M = 20;
    let y = 20;

    const clienteNome = ensaiosAP[0].cliente;

    // ─── Header Minimalista ──────────────────────────────
    // Fetch custom logo if exists
    if (systemSettings.empresa_logo) {
        const logoDataUrl = await fetchImageAsDataUrl(systemSettings.empresa_logo);
        if (logoDataUrl) {
            // Draw logo on the left
            doc.addImage(logoDataUrl, 'PNG', M, y - 5, 25, 25, undefined, 'FAST');
        } else {
            doc.setFontSize(16); doc.setFont('helvetica', 'bold'); doc.setTextColor(31, 41, 55);
            doc.text('CTIA', M, y);
            doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(107, 114, 128);
            doc.text('Grupo Cromotransfer', M, y + 5);
        }
    } else {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(31, 41, 55); // #1f2937
        doc.text('CTIA', M, y);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(107, 114, 128); // #6b7280
        doc.text('Grupo Cromotransfer', M, y + 5);
    }

    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text('Centro Tecnológico de', W - M, y, { align: 'right' });
    doc.text('Inteligência Aplicada', W - M, y + 4, { align: 'right' });

    y += 18;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(M, y, W - M, y);
    y += 12;

    // ─── Document Title ──────────────────────────────
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text('DOSSIÊ TÉCNICO CONSOLIDADO', M, y);
    y += 10;

    // ─── Identification Table Minimalist ────────────────
    doc.autoTable({
        startY: y,
        margin: { left: M, right: M },
        theme: 'plain',
        styles: { cellPadding: 2, fontSize: 8, textColor: [31, 41, 55], font: 'helvetica' },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 35, textColor: [107, 114, 128] }, 2: { fontStyle: 'bold', cellWidth: 35, textColor: [107, 114, 128] } },
        body: [
            ['Cliente / Marca', clienteNome || '—', 'Projeto', ensaiosAP[0].projeto || '—'],
            ['Modelo', ensaiosAP[0].modelo || '—', 'Cor', ensaiosAP[0].cor || '—'],
            ['Fornecedor', ensaiosAP[0].fornecedor || '—', 'Substrato', ensaiosAP[0].substrato || '—'],
            ['Tecnologia', ensaiosAP[0].tecnologia || '—', 'Categoria', ensaiosAP[0].categoria || '—'],
            ['Finalidade', ensaiosAP[0].finalidade || '—', 'Data Ensaio', formatDate(ensaiosAP[0].data_ensaio)],
            ['Referência / Artigo', ensaiosAP[0].referencia || '—', 'Rastreabilidade AP', ap]
        ],
    });
    y = doc.lastAutoTable.finalY + 12;

    // ─── Consolidated Results Table ──────────
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text('CONSOLIDADO DE RESULTADOS', M, y);
    y += 6;

    let allRows = [];
    let isAllApproved = true;
    let totalConclusions = 0;
    for (const e of ensaiosAP) {
        // Determine overall approval status based on individual ensaio conclusions
        if (e.conclusao === 'Reprovado') isAllApproved = false;
        if (e.conclusao) totalConclusions++;

        const eRows = buildResultRows(e);
        if (eRows.length > 0) {
            allRows.push([{ content: `ENSAIO: ${e.tipo_teste.toUpperCase()}`, colSpan: 6, styles: { fillColor: [243, 244, 246], fontStyle: 'bold', textColor: [31, 41, 55], halign: 'center' } }]);
            allRows.push(...eRows);
            if (e.observacoes) {
                allRows.push([{ content: `Parecer: ${e.observacoes}`, colSpan: 6, styles: { fontStyle: 'italic', textColor: [107, 114, 128], fontSize: 8 } }]);
            }
        } else {
            allRows.push([{ content: `ENSAIO: ${e.tipo_teste.toUpperCase()}`, colSpan: 6, styles: { fillColor: [243, 244, 246], fontStyle: 'bold', textColor: [31, 41, 55], halign: 'center' } }]);
            allRows.push(['Sem parâmetros catalogados', '-', '-', '-', '-', '-']);
        }
    }

    doc.autoTable({
        startY: y,
        margin: { left: M, right: M },
        theme: 'grid',
        headStyles: { fillColor: [243, 244, 246], textColor: [55, 65, 81], fontSize: 8, fontStyle: 'bold', lineColor: [229, 231, 235], lineWidth: 0.1 },
        bodyStyles: { fontSize: 9, textColor: [31, 41, 55], lineColor: [229, 231, 235], lineWidth: 0.1 },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        head: [['Método (Norma)', 'Parâmetro', 'Unidade', 'Req. Mínimo', 'Resultado AM1', 'Resultado AM2']],
        body: allRows,
        didParseCell: function (data) {
            // No specific color coding for results in consolidated view, just raw data
        }
    });
    y = doc.lastAutoTable.finalY + 12;

    // ─── Conclusão Geral / Status Badge ─────────────────────
    if (totalConclusions > 0) {
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39);
        doc.text('PARECER FINAL DA AP', M, y);
        y += 6;

        const badgeColor = isAllApproved ? [220, 252, 231] : [254, 226, 226]; // pastel
        const textColor = isAllApproved ? [22, 101, 52] : [153, 27, 27];

        doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
        doc.roundedRect(M, y - 4, 40, 8, 2, 2, 'F');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text(isAllApproved ? 'APROVADO' : 'REPROVADO', M + 20, y + 1.5, { align: 'center' });
        y += 16;
    }

    // ─── Helper for Image fetching ───────────
    async function fetchImageAsDataUrl(url) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            return await new Promise(resolve => {
                const reader = new FileReader(); reader.onloadend = () => resolve(reader.result); reader.readAsDataURL(blob);
            });
        } catch (e) { return null; }
    }

    // ─── Anexo Fotográfico Consolidado ───────
    let hasImages = ensaiosAP.some(e => e.imagens && e.imagens.length > 0);
    if (hasImages) {
        doc.addPage();
        y = M;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39);
        doc.text('ANEXO FOTOGRÁFICO', M, y);
        y += 8;

        for (const e of ensaiosAP) {
            if (!e.imagens || e.imagens.length === 0) continue;

            if (y > 260) { doc.addPage(); y = M; }
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(55, 65, 81);
            doc.text(`Imagens Visuais: ${e.tipo_teste}`, M, y);
            y += 6;

            const originais = e.imagens.filter(img => img.categoria_foto === 'Original');
            const depois = e.imagens.filter(img => img.categoria_foto === 'Pós-Ensaio');
            const outras = e.imagens.filter(img => img.categoria_foto !== 'Original' && img.categoria_foto !== 'Pós-Ensaio');

            const imgW = 80, imgH = 60;
            const drawImageLabel = (label, x, y) => {
                doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(75, 85, 99);
                doc.text(label, x, y);
            };

            const maxPairs = Math.max(originais.length, depois.length);
            for (let i = 0; i < maxPairs; i++) {
                if (y + imgH + 12 > 260) { doc.addPage(); y = M; }

                // Left
                if (i < originais.length) {
                    const leftUrl = await fetchImageAsDataUrl(originais[i].url);
                    if (leftUrl) {
                        drawImageLabel('Foto Original (Antes)', M, y);
                        doc.addImage(leftUrl, 'JPEG', M, y + 3, imgW, imgH);
                        doc.setDrawColor(229, 231, 235); doc.rect(M, y + 3, imgW, imgH);
                    }
                }

                // Right
                if (i < depois.length) {
                    const rightUrl = await fetchImageAsDataUrl(depois[i].url);
                    if (rightUrl) {
                        drawImageLabel('Foto Pós-Ensaio (Depois)', M + imgW + 10, y);
                        doc.addImage(rightUrl, 'JPEG', M + imgW + 10, y + 3, imgW, imgH);
                        doc.setDrawColor(229, 231, 235); doc.rect(M + imgW + 10, y + 3, imgW, imgH);
                    }
                }
                y += imgH + 15;
            }

            for (let i = 0; i < outras.length; i++) {
                if (y + imgH + 12 > 260) { doc.addPage(); y = M; }
                const x = M + (i % 2) * (imgW + 10);
                const dataUrl = await fetchImageAsDataUrl(outras[i].url);
                if (dataUrl) {
                    const catLabel = outras[i].categoria_foto && outras[i].categoria_foto !== 'Outra' ? outras[i].categoria_foto : 'Registro Analítico';
                    drawImageLabel(catLabel, x, y);
                    doc.addImage(dataUrl, 'JPEG', x, y + 3, imgW, imgH);
                    doc.setDrawColor(229, 231, 235); doc.rect(x, y + 3, imgW, imgH);
                }
                if (i % 2 === 1 || i === outras.length - 1) y += imgH + 15;
            }
        }
    }

    // ─── Signatures (Dossiê) ──────────────────
    if (y > 240) { doc.addPage(); y = 40; } else { y = Math.max(y + 10, H - 65); }

    const colWidthDossie = (W - (M * 2)) / 2;
    doc.setDrawColor(156, 163, 175);
    doc.setLineWidth(0.3);

    // Linha 1
    doc.line(M + 5, y, M + colWidthDossie - 5, y);
    // Linha 2
    doc.line(M + colWidthDossie + 5, y, W - M - 5, y);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text(systemSettings.analista_nome || 'Lúcio Monteiro', M + colWidthDossie / 2, y + 5, { align: 'center' });
    doc.text(systemSettings.gerente_nome || 'Jeferson Bueno', M + colWidthDossie + colWidthDossie / 2, y + 5, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(systemSettings.analista_cargo || 'Analista de Laboratório', M + colWidthDossie / 2, y + 9, { align: 'center' });
    doc.text(systemSettings.gerente_cargo || 'Gerente de Processos / Resp. Técnico', M + colWidthDossie + colWidthDossie / 2, y + 9, { align: 'center' });

    // Inject Glossary Page
    drawGlossary(doc);

    // ─── Global Footer (Inject on all pages) ──────────────────
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(156, 163, 175);
        const footerText = `${systemSettings.empresa_nome || 'CTIA — CROMOTRANSFER'} | ${systemSettings.empresa_endereco || 'R. Kesser Zattar, 162 - João Costa, Joinville - SC'} | ${systemSettings.empresa_email || 'ctia.lab@cromotransfer.com'}`;
        const now = new Date();
        const d = String(now.getDate()).padStart(2, '0');
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const y = now.getFullYear();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        const dataHora = `${d}/${m}/${y} às ${hh}:${mm}:${ss}`;

        doc.text(footerText, W / 2, H - 12, { align: 'center' });
        doc.text(`Documento gerado eletronicamente pelo Sistema de Gestão CTIA em ${dataHora}.`, W / 2, H - 8, { align: 'center' });
        doc.text(`Página ${i} de ${pageCount}`, W - M, H - 8, { align: 'right' });
    }

    const safeAp = (ap || 'Avulso').replace(/[^a-z0-9]/gi, '_');
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dossie_CTIA_AP_${safeAp}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Dossiê consolidado exportado com sucesso!');
}

// ─── Glossary Page Generator ───────────────────────────────────────────
function drawGlossary(doc) {
    const W = 210, M = 20;
    let y = 30;
    doc.addPage();

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text('ANEXO: CRITÉRIOS DE AVALIAÇÃO E LEGENDAS', M, y);
    y += 12;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(55, 65, 81);
    doc.text('1. Escala de Avaliação Visual (Bally e Veslic)', M, y);
    y += 6;

    doc.autoTable({
        startY: y, margin: { left: M, right: M },
        theme: 'grid',
        headStyles: { fillColor: [243, 244, 246], textColor: [55, 65, 81], fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8, textColor: [31, 41, 55] },
        head: [['Grau', 'Critério / Descrição de Falha']],
        body: [
            ['Grau 5', 'Excelente: Nenhuma alteração visual ou dano perceptível.'],
            ['Grau 4', 'Bom: Leve alteração na superfície, sem comprometimento do filme.'],
            ['Grau 3', 'Aceitável: Fissuras superficiais leves ou transferência de cor moderada.'],
            ['Grau 2', 'Fraco: Rachaduras severas evidentes ou forte degradação de acabamento.'],
            ['Grau 1', 'Muito Fraco: Destruição do material ou delaminação total.']
        ]
    });
    y = doc.lastAutoTable.finalY + 12;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(55, 65, 81);
    doc.text('2. Códigos de Falha de Colagem (Dinamômetro)', M, y);
    y += 6;

    doc.autoTable({
        startY: y, margin: { left: M, right: M },
        theme: 'grid',
        headStyles: { fillColor: [243, 244, 246], textColor: [55, 65, 81], fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8, textColor: [31, 41, 55] },
        head: [['Falha', 'Descrição Técnica']],
        body: [
            ['A', 'Rompimento do Material (Substrato cedeu antes da colagem)'],
            ['B', 'Falta de Adesão / Falha Coesiva da Fita Adesiva'],
            ['C', 'Adesão ao Solvente / Primer (Falha de preparação)'],
            ['D', 'Rasgo do Material (Rasgo sem delaminação)'],
            ['E', 'Delaminação (Separação das camadas do filme transfer)']
        ]
    });
}

// ─── Print Label (with AP/Referência) ────────────────────────────────────────
function printLabel(ensaio) {
    const existing = document.querySelector('.print-label');
    if (existing) existing.remove();

    const qrDiv = document.createElement('div');
    qrDiv.style.display = 'inline-block';
    const baseUrl = (systemSettings.url_publica && systemSettings.url_publica.trim() !== '') ? systemSettings.url_publica.trim() : window.location.origin;
    new QRCode(qrDiv, {
        text: `${baseUrl}/consulta/${ensaio.codigo_rastreio}`,
        width: 90, height: 90,
        colorDark: '#1D1D1F', colorLight: '#FFFFFF',
        correctLevel: QRCode.CorrectLevel.M,
    });

    setTimeout(() => {
        const qrImg = qrDiv.querySelector('img') || qrDiv.querySelector('canvas');
        let qrSrc = '';
        if (qrImg && qrImg.tagName === 'IMG') qrSrc = qrImg.src;
        else if (qrImg && qrImg.tagName === 'CANVAS') qrSrc = qrImg.toDataURL();

        const label = document.createElement('div');
        label.className = 'print-label';
        label.innerHTML = `
            <div class="print-label-left">
                <div class="print-label-logo">CTIA <span>Gestão de Ensaios</span></div>
                <div class="print-label-cliente">${escapeHtml(ensaio.cliente)}</div>
                <div class="print-label-tipo">${escapeHtml(ensaio.tipo_teste)}</div>
                <div class="print-label-info">
                    <strong>Data:</strong> ${formatDate(ensaio.data_ensaio)}<br>
                    ${ensaio.ap ? `<strong>AP:</strong> ${escapeHtml(ensaio.ap)}<br>` : ''}
                    ${ensaio.referencia ? `<strong>Ref:</strong> ${escapeHtml(ensaio.referencia)}<br>` : ''}
                    <strong>Local:</strong> ${escapeHtml(ensaio.loc_armario || '—')} · ${escapeHtml(ensaio.loc_prateleira || '—')} · ${escapeHtml(ensaio.loc_caixa || '—')}
                </div>
                <div class="print-label-rastreio">${escapeHtml(ensaio.codigo_rastreio)}</div>
            </div>
            <div class="print-label-right">
                ${qrSrc ? `<img src="${qrSrc}" alt="QR Code">` : ''}
                <span>Escaneie para<br>rastrear</span>
            </div>`;
        document.body.appendChild(label);
        setTimeout(() => { window.print(); setTimeout(() => label.remove(), 500); }, 200);
    }, 300);
}

// ─── Copy / Open Rede ────────────────────────────────────────────────────────
function copyRede() {
    const e = allEnsaios.find(x => x.id === currentEnsaioId);
    if (e && e.caminho_rede) {
        navigator.clipboard.writeText(e.caminho_rede).then(() => {
            btnCopiarRede.classList.add('copied');
            const orig = btnCopiarRede.innerHTML;
            btnCopiarRede.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Copiado!`;
            setTimeout(() => { btnCopiarRede.classList.remove('copied'); btnCopiarRede.innerHTML = orig; }, 2000);
        });
    }
}

function abrirRede() {
    const e = allEnsaios.find(x => x.id === currentEnsaioId);
    if (e && e.caminho_rede) {
        window.open('file:///' + e.caminho_rede.replace(/\\/g, '/'), '_blank');
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Dashboard de Inteligência
// ═══════════════════════════════════════════════════════════════════════════════
async function showDashboard() {
    currentView = 'dashboard';
    searchInput.value = '';
    searchInput.placeholder = 'Buscar…';
    breadcrumb.style.display = 'none';
    statsBar.style.display = 'none';
    cardsGrid.style.display = 'none';
    emptyState.style.display = 'none';
    dashboardView.style.display = 'block';
    if (kanbanView) kanbanView.style.display = 'none';
    if (desenvolvimentosView) desenvolvimentosView.style.display = 'none';
    const pView = document.getElementById('producaoView');
    if (pView) pView.style.display = 'none';
    if (document.getElementById('fabContainer')) document.getElementById('fabContainer').style.display = 'none';

    try {
        // Fetch all ensaios for analytics
        const res = await fetch(API_ENSAIOS);
        dashboardRawData = await res.json();

        // Povoa filtro de clientes dinamicamente
        if (dashFilterCliente) {
            const clientesUnicos = [...new Set(dashboardRawData.map(e => e.cliente))].sort();
            dashFilterCliente.innerHTML = '<option value="Todos" selected>Todos os Clientes</option>' +
                clientesUnicos.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
            dashFilterCliente.value = "Todos";
            dashFilterPeriodo.value = "Este Mês"; // Default
        }

        applyDashboardFilters();
    } catch (err) {
        showToast('Erro ao carregar dashboard.');
    }
}

function applyDashboardFilters() {
    let filteredData = dashboardRawData;
    const periodo = dashFilterPeriodo ? dashFilterPeriodo.value : 'Este Mês';
    const cliente = dashFilterCliente ? dashFilterCliente.value : 'Todos';
    const now = new Date();

    // 1. Filter by Period
    if (periodo === 'Este Mês') {
        filteredData = filteredData.filter(e => {
            const d = new Date(e.data_ensaio);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
    } else if (periodo === 'Últimos 7 Dias') {
        const seteDiasAtras = new Date();
        seteDiasAtras.setDate(now.getDate() - 7);
        filteredData = filteredData.filter(e => new Date(e.data_ensaio) >= seteDiasAtras);
    } else if (periodo === 'Últimos 30 Dias') {
        const trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(now.getDate() - 30);
        filteredData = filteredData.filter(e => new Date(e.data_ensaio) >= trintaDiasAtras);
    } // Se for 'Todo o Período', não filtra por data

    // 2. Filter by Cliente
    if (cliente !== 'Todos') {
        filteredData = filteredData.filter(e => e.cliente === cliente);
    }

    renderDashboard(filteredData, periodo, cliente);
}

function renderDashboard(data, periodoLabel, clienteLabel) {
    const totalAprovados = data.filter(e => e.conclusao === 'Aprovado').length;
    const totalReprovados = data.filter(e => e.conclusao === 'Reprovado').length;

    // Counters Modernos
    const countersHTML = `
        <div class="dash-counter-modern">
            <div class="counter-icon" style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <div class="counter-info">
                <div class="number">${data.length}</div>
                <div class="label">Ensaios no Período</div>
            </div>
        </div>
        <div class="dash-counter-modern">
            <div class="counter-icon" style="background: linear-gradient(135deg, #22C55E, #16A34A);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div class="counter-info">
                <div class="number" style="color: #16A34A">${totalAprovados}</div>
                <div class="label">Aprovados</div>
            </div>
        </div>
        <div class="dash-counter-modern">
            <div class="counter-icon" style="background: linear-gradient(135deg, #EF4444, #DC2626);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <div class="counter-info">
                <div class="number" style="color: #DC2626">${totalReprovados}</div>
                <div class="label">Reprovados</div>
            </div>
        </div>
    `;
    dashCounters.innerHTML = countersHTML;

    // Chart 1: Aprovação × Reprovação por Cliente
    const clienteStats = {};
    data.forEach(e => {
        if (!clienteStats[e.cliente]) clienteStats[e.cliente] = { aprovados: 0, reprovados: 0 };
        if (e.conclusao === 'Aprovado') clienteStats[e.cliente].aprovados++;
        else if (e.conclusao === 'Reprovado') clienteStats[e.cliente].reprovados++;
    });
    const labels1 = Object.keys(clienteStats);
    const aprovados1 = labels1.map(c => clienteStats[c].aprovados);
    const reprovados1 = labels1.map(c => clienteStats[c].reprovados);

    if (chartAprovacao) chartAprovacao.destroy();
    chartAprovacao = new Chart(document.getElementById('chartAprovacao'), {
        type: 'bar',
        data: {
            labels: labels1,
            datasets: [
                { label: 'Aprovados', data: aprovados1, backgroundColor: '#22C55E', borderRadius: 8, barThickness: 24 },
                { label: 'Reprovados', data: reprovados1, backgroundColor: '#EF4444', borderRadius: 8, barThickness: 24 },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', align: 'end', labels: { boxWidth: 12, usePointStyle: true, font: { weight: '600', family: "'Inter', sans-serif" } } }
            },
            scales: {
                x: { grid: { display: false }, ticks: { font: { family: "'Inter', sans-serif" } } },
                y: { beginAtZero: true, ticks: { stepSize: 1, font: { family: "'Inter', sans-serif" } }, grid: { borderDash: [4, 4], color: '#e5e7eb', drawBorder: false } }
            },
        },
    });

    // Chart 2: Volume Mensal por Tipo
    const meses = {};
    data.forEach(e => {
        const d = new Date(e.data_ensaio);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!meses[key]) meses[key] = { Bally: 0, Veslic: 0, 'Dinamômetro': 0, 'Hidrólise': 0, Outros: 0 };
        meses[key][e.tipo_teste] = (meses[key][e.tipo_teste] || 0) + 1;
    });
    const sortedMonths = Object.keys(meses).sort();
    const tipoColors = { Bally: '#3B82F6', Veslic: '#10B981', 'Dinamômetro': '#8B5CF6', 'Hidrólise': '#F59E0B', Outros: '#6E6E73' };
    const datasets2 = Object.keys(tipoColors).map(tipo => ({
        label: tipo,
        data: sortedMonths.map(m => meses[m][tipo] || 0),
        borderColor: tipoColors[tipo],
        backgroundColor: tipoColors[tipo] + '22',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 6
    }));

    if (chartVolume) chartVolume.destroy();
    chartVolume = new Chart(document.getElementById('chartVolume'), {
        type: 'line',
        data: { labels: sortedMonths.map(m => { const [y, mo] = m.split('-'); return `${mo}/${y}`; }), datasets: datasets2 },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', align: 'end', labels: { boxWidth: 12, usePointStyle: true, font: { weight: '600', family: "'Inter', sans-serif" } } }
            },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1, font: { family: "'Inter', sans-serif" } }, grid: { borderDash: [4, 4], color: '#e5e7eb', drawBorder: false } },
                x: { grid: { display: false }, ticks: { font: { family: "'Inter', sans-serif" } } }
            },
        },
    });

    // Chart 3: Análise de Falhas de Colagem (Dinamômetro)
    const falhasCount = { 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0 };
    const falhasLabels = {
        'A': 'A: Rompimento',
        'B': 'B: Falta de Adesão',
        'C': 'C: Adesão ao Solvente',
        'D': 'D: Rasgo do Material',
        'E': 'E: Delaminação'
    };

    // Contabiliza apenas se tiver a falha no dinamômetro
    data.forEach(e => {
        if (e.tipo_teste === 'Dinamômetro' && e.falha_dinamometro) {
            const code = e.falha_dinamometro.charAt(0).toUpperCase(); // Pega 'A', 'B'...
            if (falhasCount[code] !== undefined) falhasCount[code]++;
        }
    });

    const falhasData = [falhasCount['A'], falhasCount['B'], falhasCount['C'], falhasCount['D'], falhasCount['E']];
    const hasFalhas = falhasData.some(v => v > 0);

    if (chartFalhas) chartFalhas.destroy();

    const falhasCanvas = document.getElementById('chartFalhas');
    if (!falhasCanvas) return;

    if (!hasFalhas) {
        const ctx = falhasCanvas.getContext('2d');
        ctx.clearRect(0, 0, falhasCanvas.width, falhasCanvas.height);
        ctx.font = '600 14px "Inter", sans-serif';
        ctx.fillStyle = '#9ca3af';
        ctx.textAlign = 'center';
        ctx.fillText('Nenhuma falha de dinamômetro no período', falhasCanvas.width / 2, falhasCanvas.height / 2);
    } else {
        chartFalhas = new Chart(falhasCanvas, {
            type: 'doughnut',
            data: {
                labels: Object.values(falhasLabels),
                datasets: [{
                    data: falhasData,
                    backgroundColor: ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6'],
                    hoverOffset: 20,
                    borderWidth: 4,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right', labels: { padding: 20, usePointStyle: true, font: { weight: '600', family: "'Inter', sans-serif" } } }
                },
                cutout: '70%'
            }
        });
    }
}

// ─── Modal / Toast helpers ───────────────────────────────────────────────────
function openModal(ov) { ov.classList.add('active'); document.body.style.overflow = 'hidden'; }
function closeModal(ov) { ov.classList.remove('active'); document.body.style.overflow = ''; }
function closeAllModals() { [modalDetalhes, modalForm, modalCliente].forEach(closeModal); }

function showToast(msg) {
    toastMsg.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function formatDate(d) {
    if (!d) return '—';
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
}

function escapeHtml(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Kanban Board View
// ═══════════════════════════════════════════════════════════════════════════════
async function showKanban() {
    currentView = 'kanban';
    searchInput.value = '';
    searchInput.placeholder = 'Buscar…';
    if (breadcrumb) breadcrumb.style.display = 'none';
    if (statsBar) statsBar.style.display = 'none';
    if (cardsGrid) {
        cardsGrid.style.display = 'none';
        cardsGrid.innerHTML = '';
    }
    if (emptyState) emptyState.style.display = 'none';
    if (dashboardView) dashboardView.style.display = 'none';
    if (desenvolvimentosView) desenvolvimentosView.style.display = 'none';
    const pView = document.getElementById('producaoView');
    if (pView) pView.style.display = 'none';
    if (kanbanView) kanbanView.style.display = 'block';

    // Hide FAB on this view
    const fabContainer = document.getElementById('fabContainer');
    if (fabContainer) fabContainer.style.display = 'none';

    try {
        const res = await fetch(API_ENSAIOS);
        allEnsaios = await res.json();

        // Populate Kanban Client Filter
        if (kanbanFilterCliente) {
            const clientesUnicos = [...new Set(allEnsaios.map(e => e.cliente))].sort();
            kanbanFilterCliente.innerHTML = '<option value="Todos" selected>Todos os Clientes</option>' +
                clientesUnicos.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
            kanbanFilterCliente.value = "Todos";
        }

        renderKanbanBoard();
        setupDragAndDrop();
    } catch (err) {
        showToast('Erro ao carregar Kanban');
    }
}

// ─── Lógica de Edição Rápida de Etiquetas (Popover) ───────────
let popoverOpenForId = null;

function openQuickLabelEdit(e, id) {
    e.stopPropagation(); // Impede de abrir o modal de Detalhes

    // Configurações do popover
    const popover = document.getElementById('quickLabelPopover');
    const container = document.getElementById('quickLabelList');
    popoverOpenForId = id;

    // Encontra o ensaio local
    const ensaio = allEnsaios.find(x => x.id === id);
    if (!ensaio) return;

    const selectedLabels = ensaio.etiquetas ? ensaio.etiquetas.split(',') : [];

    // Se não tiver configurações, exibe aviso
    if (!window.etiquetasConfig || window.etiquetasConfig.length === 0) {
        container.innerHTML = '<span style="color:#6b7280; font-size:0.85rem;">Nenhuma etiqueta configurada nas Configurações.</span>';
    } else {
        container.innerHTML = window.etiquetasConfig.map((tag, i) => {
            if (!tag.nome) return ''; // Ignora nomes em branco
            const isChecked = selectedLabels.includes(tag.nome);
            return `
                <div class="quick-label-item" onclick="toggleQuickLabel('${escapeHtml(tag.nome)}')">
                    <div class="quick-label-color" style="background:${tag.cor}"></div>
                    <span class="quick-label-name">${escapeHtml(tag.nome)}</span>
                    <input type="checkbox" class="quick-label-checkbox" id="ql_chk_${i}" ${isChecked ? 'checked' : ''} onclick="event.stopPropagation(); toggleQuickLabel('${escapeHtml(tag.nome)}')">
                </div>
            `;
        }).join('');
    }

    // Posicionamento
    const rect = e.currentTarget.getBoundingClientRect();
    let top = rect.bottom + window.scrollY + 5;
    let left = rect.left + window.scrollX;

    popover.style.display = 'block';

    // Evita sair da tela pela direita ou por baixo
    if (left + 280 > window.innerWidth) left = window.innerWidth - 300;
    popover.style.top = top + 'px';
    popover.style.left = left + 'px';
}

async function toggleQuickLabel(labelName) {
    if (!popoverOpenForId) return;

    const ensaio = allEnsaios.find(x => x.id === popoverOpenForId);
    if (!ensaio) return;

    let selectedLabels = ensaio.etiquetas ? ensaio.etiquetas.split(',') : [];

    if (selectedLabels.includes(labelName)) {
        selectedLabels = selectedLabels.filter(l => l !== labelName);
    } else {
        selectedLabels.push(labelName);
    }

    const newVal = selectedLabels.join(',');

    // Optimistic UI Update in Array
    ensaio.etiquetas = newVal;

    // Update Popover View
    openQuickLabelEdit({ target: document.querySelector('.quick-label-popover'), stopPropagation: () => { }, currentTarget: document.querySelector(`[data-id="${ensaio.id}"] .kanban-card-labels`) }, ensaio.id);

    try {
        const res = await fetch(`${API_ENSAIOS}/${ensaio.id}/etiquetas`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ etiquetas: newVal })
        });
        if (!res.ok) throw new Error("Falha ao salvar etiquetas rapidamente.");

        // Renderiza Kanban silenciosamente para atualizar a barra de cor
        renderKanbanBoard();

    } catch (err) {
        showToast("Erro ao editar etiquetas: " + err.message);
    }
}

// Fechar Popover de Etiquetas
document.addEventListener('click', (e) => {
    const popover = document.getElementById('quickLabelPopover');
    if (popover && popover.style.display === 'block') {
        if (!popover.contains(e.target) && !e.target.closest('.kanban-card-labels')) {
            popover.style.display = 'none';
            popoverOpenForId = null;
        }
    }
});
document.getElementById('btnFecharPopover')?.addEventListener('click', () => {
    const popover = document.getElementById('quickLabelPopover');
    if (popover) popover.style.display = 'none';
});


function renderFormEtiquetasSelector() {
    const container = document.getElementById('formEtiquetas');
    if (!container) return;

    if (!window.etiquetasConfig || window.etiquetasConfig.length === 0) {
        container.innerHTML = '<span style="color:#6b7280; font-size:0.85rem;">Nenhuma etiqueta configurada nas Configurações do Sistema.</span>';
        return;
    }

    container.innerHTML = window.etiquetasConfig.map(tag => {
        if (!tag.nome) return '';
        return `<div class="label-opt" data-color="${tag.cor}" data-name="${escapeHtml(tag.nome)}"></div>`;
    }).join('');

    // Re-bind events
    document.querySelectorAll('.label-opt').forEach(opt => {
        opt.style.backgroundColor = opt.dataset.color;
        opt.innerHTML = `<span style="font-size:0.75rem; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.5); font-weight: 500;">${opt.dataset.name}</span>`;
        opt.style.display = 'inline-flex';
        opt.style.alignItems = 'center';
        opt.style.justifyContent = 'center';
        opt.style.padding = '0 8px';
        opt.style.minWidth = '80px';

        opt.addEventListener('click', () => {
            opt.classList.toggle('active');
            updateEtiquetasValue();
        });
    });
}
// ─── Kanban Logic ────────────────────────────────────────────────────────────

function renderKanbanBoard() {
    if (!kanbanView || !kanbanBoard) return;

    // Colunas dinâmicas (recuperadas das configurações ou padrão)
    const columnsString = systemSettings?.kanban_colunas || 'Amostras Recebidas,Em Ensaio,Laudo Gerado';
    const columns = columnsString.split(',').map(s => s.trim()).filter(Boolean);

    // Listagem base
    let list = allEnsaios;
    const clientFilter = kanbanFilterCliente ? kanbanFilterCliente.value : 'Todos';
    if (clientFilter !== 'Todos') {
        list = list.filter(e => e.cliente === clientFilter);
    }
    list = list.filter(e => e.retirado !== 1);

    const buildCard = (e) => {
        const badge = BADGE_MAP[e.tipo_teste] || BADGE_MAP['Outros'];
        const labels = e.etiquetas ? e.etiquetas.split(',') : [];
        const labelMap = {};
        if (window.etiquetasConfig) {
            window.etiquetasConfig.forEach(t => {
                if (t.nome) labelMap[t.nome] = t.cor;
            });
        }

        return `
            <div class="kanban-card-modern" draggable="true" data-id="${e.id}">
                ${e.url_capa ? `<img src="${e.url_capa}" class="kanban-card-cover">` : ''}
                
                <div class="kanban-card-labels" style="display:flex; gap:6px; margin-bottom: 12px; min-height: 8px;" onclick="openQuickLabelEdit(event, '${e.id}')" title="Editar etiquetas">
                    ${labels.map(l => labelMap[l] ? `<div class="card-label-bar" style="background:${labelMap[l]}" title="${l}"></div>` : '').join('')}
                    ${labels.length === 0 ? `<div class="card-label-bar" style="background:transparent; border: 1.5px dashed var(--glass-border); width: 32px;" title="Adicionar etiqueta"></div>` : ''}
                </div>

                <span class="kanban-card-cliente">${escapeHtml(e.cliente)}</span>
                
                <div class="kanban-card-info">
                    <span class="badge ${badge.cls} kanban-card-badge">${badge.label}</span>
                    ${e.ap ? `<span><strong>AP:</strong> ${escapeHtml(e.ap)}</span>` : ''}
                </div>

                ${e.referencia ? `<div class="kanban-card-info"><strong>Ref:</strong> ${escapeHtml(e.referencia)}</div>` : ''}
                ${e.descricao ? `<div class="card-description-preview" style="margin-top: 8px;">${escapeHtml(e.descricao)}</div>` : ''}
                
                <div class="kanban-card-footer-modern">
                    <span class="kanban-card-date">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        ${formatDate(e.data_ensaio)}
                    </span>
                    <span class="kanban-card-tracker">${escapeHtml(e.codigo_rastreio)}</span>
                </div>
            </div>
        `;
    };

    // Renderizar colunas
    const kanbanBoardElement = document.getElementById('kanbanBoard');
    if (kanbanBoardElement) {
        kanbanBoardElement.className = 'kanban-board-modern';
        kanbanBoardElement.innerHTML = columns.map((colName, index) => {
            const cards = list.filter(e => e.status === colName || (!e.status && colName === 'Amostras Recebidas'));
            const safeColName = colName.replace(/'/g, "\\'"); // Escape for inline JS

            return `
                <div class="kanban-column-modern" data-status="${escapeHtml(colName)}">
                    <div class="kanban-column-header-modern">
                        <h3 style="display: flex; align-items: center; gap: 10px;">
                            ${escapeHtml(colName)}
                            <button class="kanban-column-delete" onclick="removerColunaKanban('${safeColName}')" title="Remover esta etapa">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                    <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </h3>
                        <span class="kanban-count-modern">${cards.length}</span>
                    </div>
                    <div class="kanban-cards-container-modern">
                        ${cards.map(buildCard).join('')}
                    </div>
                    <button class="btn-kanban-column-add-modern" onclick="openNewEnsaioWithStatus('${safeColName}')" title="Adicionar novo ensaio">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Adicionar Card
                    </button>
                </div>
            `;
        }).join('');
    }

    // Re-setup drag and drop for new elements
    setupDragAndDrop();
}

async function adicionarColunaKanban() {
    const nome = prompt("Digite o nome da nova etapa/coluna:");
    if (!nome || !nome.trim()) return;

    const columnsString = systemSettings?.kanban_colunas || 'Amostras Recebidas,Em Ensaio,Laudo Gerado';
    const columns = columnsString.split(',').map(s => s.trim()).filter(Boolean);

    if (columns.includes(nome.trim())) {
        alert("Esta etapa já existe!");
        return;
    }

    columns.push(nome.trim());
    const newColumnsString = columns.join(',');

    try {
        // Enviar todos os campos atuais para evitar resetar configurações
        const res = await fetch(API_CONFIG, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...systemSettings, kanban_colunas: newColumnsString })
        });
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || "Erro ao salvar configuração");
        }

        systemSettings.kanban_colunas = newColumnsString;
        showToast("Nova etapa adicionada!");
        renderKanbanBoard();
    } catch (err) {
        showToast("Erro ao adicionar etapa: " + err.message);
    }
}

async function removerColunaKanban(nome) {
    if (!await showCustomPromptModal("Atenção", `Deseja realmente remover a etapa "${nome}"? Os ensaios nela não serão apagados, mas ficarão sem status visível no Kanban.`)) return;

    const columnsString = systemSettings?.kanban_colunas || 'Amostras Recebidas,Em Ensaio,Laudo Gerado';
    let columns = columnsString.split(',').map(s => s.trim()).filter(Boolean);

    columns = columns.filter(c => c !== nome);
    const newColumnsString = columns.join(',');

    try {
        const res = await fetch(API_CONFIG, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...systemSettings, kanban_colunas: newColumnsString })
        });
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || "Erro ao salvar configuração");
        }

        systemSettings.kanban_colunas = newColumnsString;
        showToast("Etapa removida.");
        renderKanbanBoard();
    } catch (err) {
        showToast("Erro ao remover etapa: " + err.message);
    }
}

// ─── Drag and Drop Logic
let dndKanbanSetup = false;
function setupDragAndDrop() {
    if (dndKanbanSetup) return;
    dndKanbanSetup = true;

    // Use delegation on document for cards (dynamic)
    document.addEventListener('dragstart', (e) => {
        const card = e.target.closest('.kanban-card-modern');
        if (card) {
            card.classList.add('dragging');
            e.dataTransfer.setData('text/plain', card.dataset.id);
            e.dataTransfer.effectAllowed = 'move';
        }
    });

    document.addEventListener('dragend', (e) => {
        const card = e.target.closest('.kanban-card-modern');
        if (card) {
            card.classList.remove('dragging');
        }
    });

    // Event Delegation on kanbanBoard (for columns)
    if (kanbanBoard) {
        kanbanBoard.addEventListener('dragover', e => {
            const column = e.target.closest('.kanban-column-modern');
            if (column) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (!column.classList.contains('drag-over')) {
                    column.classList.add('drag-over');
                }
            }
        });

        kanbanBoard.addEventListener('dragleave', e => {
            const column = e.target.closest('.kanban-column-modern');
            // Check if we are actually leaving the column, not just entering a child
            if (column && !column.contains(e.relatedTarget)) {
                column.classList.remove('drag-over');
            }
        });

        kanbanBoard.addEventListener('drop', async (e) => {
            const column = e.target.closest('.kanban-column-modern');
            if (!column) return;

            e.preventDefault();
            column.classList.remove('drag-over');

            const id = e.dataTransfer.getData('text/plain');
            const newStatus = column.dataset.status;

            if (!id || !newStatus) return;

            // Optimistic UI Update
            const draggable = document.querySelector(`.kanban-card-modern[data-id="${id}"]`);
            const container = column.querySelector('.kanban-cards-container-modern');
            if (draggable && container) {
                container.appendChild(draggable);
            }

            try {
                const res = await fetch(`${API_ENSAIOS}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });

                if (!res.ok) throw new Error("Falha no sync do Kanban");

                const ensaio = allEnsaios.find(x => x.id === id);
                if (ensaio) ensaio.status = newStatus;

                // Refresh counts and render to sync state
                renderKanbanBoard();
            } catch (err) {
                showToast("Erro ao atualizar status.");
                renderKanbanBoard();
            }
        });
    }
}

// ─── Triagem (Cadastro Rápido) 
function openTriagem() {
    if (triagemForm) triagemForm.reset();
    triagemData.value = new Date().toISOString().split('T')[0];
    openModal(modalTriagem);
}

async function handleTriagemSubmit(e) {
    e.preventDefault();
    const payload = {
        cliente: triagemCliente.value.trim(),
        data_ensaio: triagemData.value,
        tipo_teste: 'Completo', // Valor padrao para cadastro unificado
        ap: triagemAP.value.trim(),
        referencia: triagemRef.value.trim(),
        modelo: triagemModelo.value.trim(),
        substrato: triagemSubstrato.value.trim(),
        status: 'Amostras Recebidas'
    };

    try {
        const res = await fetch(API_ENSAIOS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Falha originando Amostra pela triagem.");

        closeModal(modalTriagem);
        showToast("Amostra recebida arquivada.");
        // Reload API
        showKanban();
    } catch (err) {
        showToast("Erro: " + err.message);
    }
}

// --- Custom Modal Prompt Logic ---
let customPromptResolve = null;

function showCustomPromptModal(titulo, mensagem, isPrompt) {
    return new Promise((resolve) => {
        const modal = document.getElementById('modalCustomPrompt');
        if (!modal) {
            return resolve(isPrompt ? prompt(mensagem) : confirm(mensagem));
        }

        document.getElementById('customPromptTitle').textContent = titulo;
        document.getElementById('customPromptMessage').textContent = mensagem;

        const inputContainer = document.getElementById('customPromptInputContainer');
        const input = document.getElementById('customPromptInput');

        if (isPrompt) {
            inputContainer.style.display = 'block';
            input.value = '';
        } else {
            inputContainer.style.display = 'none';
            input.value = '';
        }

        customPromptResolve = resolve;
        openModal(modal);

        if (isPrompt) {
            setTimeout(() => input.focus(), 100);
        }
    });
}

function closeCustomPrompt(value) {
    const modal = document.getElementById('modalCustomPrompt');
    if (modal) closeModal(modal);
    if (customPromptResolve) {
        customPromptResolve(value);
        customPromptResolve = null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const btnConfirm = document.getElementById('btnCustomPromptConfirm');
    const btnCancel = document.getElementById('btnCustomPromptCancel');
    const input = document.getElementById('customPromptInput');

    if (btnConfirm) {
        btnConfirm.addEventListener('click', () => {
            const isPrompt = document.getElementById('customPromptInputContainer').style.display !== 'none';
            if (isPrompt) {
                closeCustomPrompt(input.value);
            } else {
                closeCustomPrompt(true);
            }
        });
    }

    if (btnCancel) {
        btnCancel.addEventListener('click', () => closeCustomPrompt(null));
    }

    if (input) {
        input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                btnConfirm.click();
            }
        });
    }
});

async function validarAcessoAdmin(titulo = "Ação Restrita", mensagem = "Confirma esta ação?") {
    if (!systemSettings.senha_admin) {
        const res = await showCustomPromptModal(titulo, mensagem, false);
        return !!res;
    }

    const input = await showCustomPromptModal(titulo, mensagem, true);
    if (input === null) return false;
    if (input === systemSettings.senha_admin) return true;

    showToast("Senha de segurança incorreta.");
    return false;
}
