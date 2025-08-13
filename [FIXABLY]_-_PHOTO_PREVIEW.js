// ==UserScript==
// @name         [FIXABLY][1.0] - PHOTO_PREVIEW
// @version      1.0
// @icon         https://cdn.prod.website-files.com/605c419c1fff37864e13ab98/60b73e4b3ecef03cf244861f_fixably-favicon.png
// @author       Sebastian Zborowski - https://github.com/sebastian-zborowski
// @description  Pogląd zdjęć i plikw załączonych do naprawy
// @match        https://ispot.fixably.com/*
// @grant        none
// ==/UserScript==

//Disclaimer:
//Niniejszy skrypt został utworzony metodą Vibecodingu. Nie ingeruje trwale w oryginalne strony internetowe, ODWOŁUJE SIĘ do danych prywatnych kopiując je do SCHOWKA SYSTEMOWEGO, natomiast nie zapisuje/utrwala ich stale. Skrypt nie zmienia podstawowego działania strony. Skrypt dodaje kilka automatyzacji, skrótów oraz modyfikacje wizualne, które mają na celu usprawnienie i ułatwienie korzystania z serwisu.

//Ostatnia aktualizacja: 13.08.2025

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

})();
