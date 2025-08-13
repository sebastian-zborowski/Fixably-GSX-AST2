// ==UserScript==
// @name         [GSX][1.0] - OPEN_GNUM
// @version      1.0
// @icon         https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://gsx2.apple.com/&size=128
// @description  Automatycznie otwiera naprawę GSX z poziomu Fixably jednym kliknięciem. Rzoszerzenie działa w kooperacji z: FIXABLY_-_INTERFACE_TWEAKS
// @author       Sebastian Zborowski - https://github.com/sebastian-zborowski
// @match        https://gsx2.apple.com/*
// @exclude      https://gsx2*dummy*
// @grant        none
// ==/UserScript==

//Disclaimer:
//Niniejszy skrypt został utworzony metodą Vibecodingu. Nie ingeruje trwale w oryginalne strony internetowe, nie odwołuje się do danych prywatnych ani chronionych przepisami RODO, nie przetwarza danych osobowych, a także nie zmienia podstawowego działania strony. Skrypt dodaje kilka automatyzacji, skrótów oraz modyfikacje wizualne, które mają na celu usprawnienie i ułatwienie korzystania z serwisu.

//Ostatnia aktualizacja: 13.08.2025

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

})();