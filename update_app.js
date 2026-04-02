const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, 'public', 'app.js');
let appJs = fs.readFileSync(appJsPath, 'utf8');

// 1. Replace validarAcessoAdmin definition and append the custom modal logic
const oldValidarStr = `function validarAcessoAdmin(titulo = "Ação Restrita", mensagem = "Confirma esta ação?") {
    if (!systemSettings.senha_admin) return confirm(mensagem); // Sem senha, apenas confirmação comum

    const input = prompt(\`\${titulo.toUpperCase()}\\n\\n\${mensagem}\\n\\nDigite a Senha de Gestão para autorizar:\`);
    if (input === null) return false;
    if (input === systemSettings.senha_admin) return true;

    showToast("Senha de segurança incorreta.");
    return false;
}`;

const newValidarStr = `// --- Custom Modal Prompt Logic ---
let customPromptResolve = null;

function showCustomPromptModal(titulo, mensagem, isPrompt) {
    return new Promise((resolve) => {
        const modal = document.getElementById('modalCustomPrompt');
        if (!modal) {
            // Se por algum motivo o modal não existir no HTML, fallback gracefully (não deve acontecer com index atualizado)
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
        modal.style.display = 'flex';
        
        if (isPrompt) {
            setTimeout(() => input.focus(), 100);
        }
    });
}

function closeCustomPrompt(value) {
    const modal = document.getElementById('modalCustomPrompt');
    if (modal) modal.style.display = 'none';
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
}`;

appJs = appJs.replace(oldValidarStr, newValidarStr);

// 2. Replace calls to validarAcessoAdmin to await
appJs = appJs.replace(
    /if \(!validarAcessoAdmin\("Excluir Desenvolvimento",/g,
    'if (!await validarAcessoAdmin("Excluir Desenvolvimento",'
);

appJs = appJs.replace(
    /if \(!validarAcessoAdmin\("Excluir Cliente",/g,
    'if (!await validarAcessoAdmin("Excluir Cliente",'
);

appJs = appJs.replace(
    /if \(isEdit && !validarAcessoAdmin\("Editar Ensaio",/g,
    'if (isEdit && !await validarAcessoAdmin("Editar Ensaio",'
);

appJs = appJs.replace(
    /if \(!validarAcessoAdmin\("Excluir Ensaio",/g,
    'if (!await validarAcessoAdmin("Excluir Ensaio",'
);

// 3. Replace calls to confirm() in async functions
appJs = appJs.replace(
    /if \(!confirm\('Deseja marcar esta amostra como retirada\? O espaço no armário será liberado\.'\)\) return;/g,
    'if (!await showCustomPromptModal("Confirmação", "Deseja marcar esta amostra como retirada? O espaço no armário será liberado.", false)) return;'
);

appJs = appJs.replace(
    /if \(!confirm\(`Deseja realmente remover a etapa "\$\{nome\}"\? Os ensaios nela não serão apagados, mas ficarão sem status visível no Kanban até você atualizá-los\.'\)\) return;/g,
    'if (!await showCustomPromptModal("Atenção", `Deseja realmente remover a etapa "${nome}"? Os ensaios nela não serão apagados, mas ficarão sem status visível no Kanban até você atualizá-los.`, false)) return;'
);

appJs = appJs.replace(
    /if \(!confirm\(`Deseja realmente remover a etapa "\$\{nome\}"\? Os ensaios nela/g,
    'if (!await showCustomPromptModal("Atenção", `Deseja realmente remover a etapa "${nome}"? Os ensaios nela'
);
// Handle the remaining part of the template literal string if needed, actually a RegExp approach:
appJs = appJs.replace(
    /if \(!confirm\(`Deseja realmente remover a etapa "\$\{nome\}"\?(.*?)`\)\) return;/g,
    'if (!await showCustomPromptModal("Atenção", `Deseja realmente remover a etapa "${nome}"?$1`, false)) return;'
);

fs.writeFileSync(appJsPath, appJs, 'utf8');
console.log('App.js successfully updated.');
