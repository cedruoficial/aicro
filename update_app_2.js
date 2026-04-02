const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, 'public', 'app.js');
let appJs = fs.readFileSync(appJsPath, 'utf8');

const regex = /function validarAcessoAdmin\([\s\S]*?return false;\s*\r?\n\}/m;

const newValidarStr = `// --- Custom Modal Prompt Logic ---
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

appJs = appJs.replace(regex, newValidarStr);

fs.writeFileSync(appJsPath, appJs, 'utf8');
console.log('App.js correctly updated the function block.');
