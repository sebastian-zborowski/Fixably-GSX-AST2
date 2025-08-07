// ==UserScript==
// @name         [GSX] - CLIENT_PASTE
// @version      1.1
// @author       Sebastian Zborowski
// @description  Debugowanie wklejania danych klienta do GSX
// @match        https://gsx2.apple.com/*
// @exclude      https://gsx2*dummy*
// @updateURL    https://raw.githubusercontent.com/sebastian-zborowski/Fixably-GSX-AST2/main/%5BGSX%5D_-_CLIENT_PASTE.js
// @downloadURL  https://raw.githubusercontent.com/sebastian-zborowski/Fixably-GSX-AST2/main/%5BGSX%5D_-_CLIENT_PASTE.js
// @grant        none
// @source       https://github.com/sebastian-zborowski
// ==/UserScript==

//Disclaimer:
//Niniejszy skrypt został utworzony metodą Vibecodingu. Nie ingeruje trwale w oryginalne strony internetowe, ODWOŁUJE SIĘ do danych prywatnych kopiując je do SCHOWKA SYSTEMOWEGO, natomiast nie zapisuje/utrwala ich stale. Skrypt nie zmienia podstawowego działania strony. Skrypt dodaje kilka automatyzacji, skrótów oraz modyfikacje wizualne, które mają na celu usprawnienie i ułatwienie korzystania z serwisu.

//Ostatnia aktualizacja: 07.08.2025

(function() {
    'use strict';

    const map = {
        repairNumber: 'rep_cust__po',
        name: 'rep_cust__fn',
        surname: 'rep_cust__ln',
        email: 'rep_cust__em',
        phone: 'rep_cust__ph',
        nip: 'rep_cust__company',
        street: 'rep_cust__addr1',
        postalCode: 'rep_cust__z',
        city: 'rep_cust__ci'
    };

    function createPasteButton() {
        const btn = document.createElement('button');
        btn.textContent = 'WKLEJ Z SERVO';
        btn.style.marginTop = '1em';
        btn.style.padding = '6px 12px';
        btn.style.backgroundColor = '#0078d7';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '4px';
        btn.style.cursor = 'pointer';
        btn.title = 'Wklej dane klienta ze schowka JSON';

        btn.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                console.log('Pobrano ze schowka:', text);
                if (!text) {
                    alert('Schowek jest pusty lub brak dostępu do schowka.');
                    return;
                }
                let data;
                try {
                    data = JSON.parse(text);
                } catch(e) {
                    alert('Niepoprawny format JSON w schowku.');
                    return;
                }
                for (const [key, id] of Object.entries(map)) {
                    if (data[key] !== undefined) {
                        const el = document.getElementById(id);
                        if (el) {
                            console.log(`Ustawiam pole ${id} (${key}) na wartość:`, data[key]);
                            el.value = data[key];
                            el.dispatchEvent(new Event('input', { bubbles: true }));
                            el.dispatchEvent(new Event('change', { bubbles: true }));
                        } else {
                            console.warn(`Nie znaleziono elementu o id ${id} dla klucza ${key}`);
                        }
                    } else {
                        console.log(`Brak danych dla klucza ${key} w JSON`);
                    }
                }
                console.log('Dane klienta zostały wklejone. Sprawdź konsolę (F12) dla szczegółów.');
            } catch (err) {
                console.log('Błąd podczas wklejania danych: ' + err);
                console.error(err);
            }
        });

        return btn;
    }

    function waitForContainerAndAddButton() {
        const intervalId = setInterval(() => {
            const container = document.querySelector('div.el-col.el-col-24.repair-customer__info-1-1');
            if (container) {
                clearInterval(intervalId);
                container.insertAdjacentHTML('beforeend', '<br><br>');
                const btn = createPasteButton();
                container.appendChild(btn);
            }
        }, 500);
    }

    setTimeout(waitForContainerAndAddButton, 3000);



// Kontrola wersji alert ---------------------------------------------------------
(async function() {
    const scriptList = [
        { name: 'CLIENT_PASTE', url: 'https://raw.githubusercontent.com/sebastian-zborowski/Fixably-GSX-AST2/main/%5BGSX%5D_-_CLIENT_PASTE.js' },
    ];

    const currentVersions = {
        CLIENT_PASTE: '1.1',
    };

    await Promise.all(scriptList.map(async script => {
        try {
            const res = await fetch(script.url);
            const text = await res.text();
            const match = text.match(/@version\s+([0-9.]+)/);
            if (match) {
                const version = match[1];
                localStorage.setItem(script.name, JSON.stringify({
                    name: script.name,
                    remote: version
                }));
                console.log(`[VERSION CONTROL] ${script.name}: ${version}`);
            } else {
                console.warn(`[VERSION CONTROL] Nie znaleziono wersji dla: ${script.name}`);
            }
        } catch (err) {
            console.warn(`[VERSION CONTROL] Błąd ładowania ${script.name}:`, err);
        }
    }));

    let popupCount = 0;
    scriptList.forEach(script => {
        const storedStr = localStorage.getItem(script.name);
        if (!storedStr) return;
        try {
            const data = JSON.parse(storedStr);
            const remoteVer = data?.remote;
            const currentVer = currentVersions[script.name] || '0.0';

            if (remoteVer && compareVersions(remoteVer, currentVer) > 0) {
                showUpdatePopup(script.name, currentVer, remoteVer, popupCount++);
            }
        } catch(e) {
            console.warn(`[UPDATE CHECK] Błąd sprawdzania wersji dla ${script.name}:`, e);
        }
    });

    function compareVersions(v1, v2) {
        const split1 = v1.split('.').map(Number);
        const split2 = v2.split('.').map(Number);
        const length = Math.max(split1.length, split2.length);
        for (let i = 0; i < length; i++) {
            const a = split1[i] || 0;
            const b = split2[i] || 0;
            if (a > b) return 1;
            if (a < b) return -1;
        }
        return 0;
    }

function showUpdatePopup(scriptName, current, remote, index) {
        const popup = document.createElement('div');
        popup.textContent = `🔔 Dostępna aktualizacja ${remote} dla ${scriptName}  (Zainstalowana wersja: ${current})`;
        Object.assign(popup.style, {
        position: 'fixed',
        bottom: `${20 + index * 100}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#222',
        color: '#fff',
        padding: '24px 36px',
        borderRadius: '16px',
        fontSize: '18px',
        zIndex: 9999 + index,
        boxShadow: '0 0 20px rgba(0,0,0,0.4)',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'opacity 0.3s ease',
        opacity: '1',
        maxWidth: '90%',
        textAlign: 'center',
        });

        const closeBtn = document.createElement('span');
        closeBtn.textContent = '❌';
        Object.assign(closeBtn.style, {
            position: 'absolute',
            top: '8px',
            right: '12px',
            cursor: 'pointer',
            color: '#fff',
            fontWeight: 'bold',
        });

        closeBtn.addEventListener('click', () => popup.remove());

        popup.appendChild(closeBtn);
        document.body.appendChild(popup);

        setTimeout(() => {
            popup.style.opacity = '0';
            setTimeout(() => popup.remove(), 500);
        }, 7500);
    }
})();
// ---------------------------------------------------------------------------------

})();
})();
