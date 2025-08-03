// ==UserScript==
// @name         [FIXABLY] - PHOTO_PREVIEW
// @version      1.0
// @author       Sebastian Zborowski
// @description  Pogląd zdjęć i plikw załączonych do naprawy
// @match        https://ispot.fixably.com/*
// @updateURL    https://raw.githubusercontent.com/sebastian-zborowski/Fixably-GSX-AST2/main/%5BFIXABLY%5D_-_PHOTO_PREVIEW.js
// @downloadURL  https://raw.githubusercontent.com/sebastian-zborowski/Fixably-GSX-AST2/main/%5BFIXABLY%5D_-_PHOTO_PREVIEW.js
// @grant        none
// @source       https://github.com/sebastian-zborowski
// ==/UserScript==

// ==/UserScript==
//Disclaimer:
//Niniejszy skrypt został utworzony metodą Vibecodingu. Nie ingeruje trwale w oryginalne strony internetowe, nie odwołuje się do danych prywatnych ani chronionych przepisami RODO,
//nie przetwarza danych osobowych, a także nie zmienia podstawowego działania strony. Skrypt dodaje kilka automatyzacji, skrótów oraz modyfikacje wizualne, które mają na celu
//usprawnienie i ułatwienie korzystania z serwisu.

//Ostatnia aktualizacja 03.08.2025

(function() {
    'use strict';

    const SUPPORTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.heic'];
    const SUPPORTED_PDF_EXTENSIONS = ['.pdf'];

    function isImageFile(href) {
        return SUPPORTED_IMAGE_EXTENSIONS.some(ext => href.toLowerCase().includes(ext));
    }

    function isPdfFile(href) {
        return SUPPORTED_PDF_EXTENSIONS.some(ext => href.toLowerCase().includes(ext));
    }

    function createPreviewPopup() {
        const popup = document.createElement('div');
        popup.id = 'filePreviewPopup';
        Object.assign(popup.style, {
            position: 'fixed',
            top: '20px',
            left: '20px',
            width: '35%',
            height: '65%',
            zIndex: '9999',
            border: '2px solid #444',
            borderRadius: '8px',
            boxShadow: '0 0 12px rgba(0,0,0,0.3)',
            background: 'gray',
            display: 'none',
            overflow: 'hidden',
        });
        document.body.appendChild(popup);
        return popup;
    }

    const previewPopup = createPreviewPopup();

    function clearPreviewPopup() {
        while (previewPopup.firstChild) {
            previewPopup.removeChild(previewPopup.firstChild);
        }
    }

    window.preview = function(event) {
        const link = event.currentTarget;
        const href = link.getAttribute('href');
        if (!href) return;

        clearPreviewPopup();

        if (isImageFile(href)) {
            const img = document.createElement('img');
            img.src = href;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            previewPopup.appendChild(img);
            previewPopup.style.display = 'block';
        } else if (isPdfFile(href)) {
            const iframe = document.createElement('iframe');
            iframe.src = href;
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            previewPopup.appendChild(iframe);
            previewPopup.style.display = 'block';
        } else {
            previewPopup.style.display = 'none';
        }
    };

    window.hidePreview = function() {
        previewPopup.style.display = 'none';
        clearPreviewPopup();
    };

    function attachPreviewHandlers() {
        const allLinks = document.querySelectorAll('.dropdown-menu a[href]');
        allLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (link.dataset.previewBound) return;
            if (!href) return;
            if (!(isImageFile(href) || isPdfFile(href))) return;

            link.addEventListener('mouseover', window.preview);
            link.addEventListener('mouseout', window.hidePreview);
            link.dataset.previewBound = 'true';
        });
    }

    const observer = new MutationObserver(() => attachPreviewHandlers());
    observer.observe(document.body, { childList: true, subtree: true });

    attachPreviewHandlers();

// Kontrola wersji alert ---------------------------------------------------------
(async function() {
    const scriptList = [
        { name: 'PHOTO_PREVIEW', url: 'https://raw.githubusercontent.com/sebastian-zborowski/Fixably-GSX-AST2/main/%5BFIXABLY%5D_-_PHOTO_PREVIEW.js' },
    ];

    const currentVersions = {
        PHOTO_PREVIEW: '1.0',
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
                //console.log([VERSION CONTROL] ${script.name}: ${version});
            } else {
                //console.warn([VERSION CONTROL] Nie znaleziono wersji dla: ${script.name});
            }
        } catch (err) {
            //console.warn([VERSION CONTROL] Błąd ładowania ${script.name}:, err);
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
            //console.warn([UPDATE CHECK] Błąd sprawdzania wersji dla ${script.name}:, e);
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
        popup.textContent = `🔔 Aktualizacja dostępna dla ${scriptName}: ${remote} (masz ${current})`;
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

        popup.addEventListener('click', () => popup.remove());

        document.body.appendChild(popup);

        setTimeout(() => {
            // animacja znikania
            popup.style.opacity = '0';
            setTimeout(() => popup.remove(), 500);
        }, 7500);
    }
})();
// ---------------------------------------------------------------------------------
})();
