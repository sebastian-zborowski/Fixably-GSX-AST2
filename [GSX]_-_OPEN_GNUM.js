// ==UserScript==
// @name         [GSX] - OPEN_GNUM
// @version      1.0
// @description  Automatycznie otwiera naprawę GSX z poziomu Fixably jednym kliknięciem. Rzoszerzenie działa w kooperacji z: FIXABLY_-_INTERFACE_TWEAKS
// @author       Sebastian Zborowski
// @match        https://gsx2.apple.com/*
// @updateURL    https://raw.githubusercontent.com/sebastian-zborowski/Fixably-GSX-AST2/main/%5BGSX%5D_-_OPEN_GNUM.js
// @downloadURL  https://raw.githubusercontent.com/sebastian-zborowski/Fixably-GSX-AST2/main/%5BGSX%5D_-_OPEN_GNUM.js
// @grant        none
// @source       https://github.com/sebastian-zborowski
// ==/UserScript==

//Disclaimer:
//Niniejszy skrypt został utworzony metodą Vibecodingu. Nie ingeruje trwale w oryginalne strony internetowe, nie odwołuje się do danych prywatnych ani chronionych przepisami RODO, nie przetwarza danych osobowych, a także nie zmienia podstawowego działania strony. Skrypt dodaje kilka automatyzacji, skrótów oraz modyfikacje wizualne, które mają na celu usprawnienie i ułatwienie korzystania z serwisu.

//Ostatnia aktualizacja: 03.08.2025

(function () {
    'use strict';


  if (location.search.includes('dummy=1')) {
    console.log('Dummy page detected, skrypt nie wykonuje się tutaj.');
    return; // przerwij wykonanie skryptu jeżeli strona jest tylko DUMMY do pobrania danych > Zapobieganie zapchaniu pamięci safari
  }

   const urlParams = new URLSearchParams(window.location.search);
    const openGnum = urlParams.get('opengnum'); //szukaj parametru opengnum, tylko wtedy uruchamiaj skrypt

    if (openGnum !== '1') return;

    const waitForContainer = () => {
        return new Promise((resolve) => {
            const observer = new MutationObserver((mutations, obs) => {
                const container = document.querySelector('#product-repairs');
                if (container) {
                    obs.disconnect();
                    resolve(container);
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });
        });
    };

    const expandRepairSection = () => {
        const toggleBtn = document.querySelector('bricks-button[aria-expanded="false"] i.icon-arrow-expand-internal-sections-outline');
        if (toggleBtn) {
            toggleBtn.click();
        }
    };

    const findAndClickGnum = () => {
        const links = document.querySelectorAll('a[href^="/repairs/G"]');
        for (let link of links) {
            if (link.href.includes('/repairs/G')) {
                console.log('Clicking GNUM link:', link.href);
                link.click();
                return true;
            }
        }
        console.warn('GNUM link not found');
        return false;
    };

    waitForContainer().then(() => {
        setTimeout(() => {
            expandRepairSection();
            setTimeout(() => {
                findAndClickGnum();
            }, 500);
        }, 500);
    });


    // Kontrola wersji alert ---------------------------------------------------------
    (async function() {

        const scriptList = [
            { name: 'OPEN_GNUM', url: 'https://raw.githubusercontent.com/sebastian-zborowski/Fixably-GSX-AST2/main/%5BGSX%5D_-_OPEN_GNUM.js' },
        ];

        const currentVersions = {
            OPEN_GNUM: '1.0',
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
        popup.textContent = `🔔 Dostępna aktualizacja dla ${scriptName}: ${remote} (Zainstalowana wersja: ${current})`;
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
// ---------------------------------------------------------------------------------

})(window.jQuery);
})();
