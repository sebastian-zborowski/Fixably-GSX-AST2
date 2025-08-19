// ==UserScript==
// @name         [FIXABLY][1.0] - NOTIFICATION FILTER
// @version      1.0
// @icon         https://cdn.prod.website-files.com/605c419c1fff37864e13ab98/60b73e4b3ecef03cf244861f_fixably-favicon.png
// @author       Sebastian Zborowski - https://github.com/sebastian-zborowski
// @description  Lepsza widocznośc powiadomień pośród "ACKJI EDYCJI ZBIORCZEJ"
// @match        https://ispot.fixably.com/pl/notifications/list*
// @grant        none
// ==/UserScript==

//Disclaimer:
//Niniejszy skrypt został utworzony metodą Vibecodingu. Nie ingeruje trwale w oryginalne strony internetowe, ODWOŁUJE SIĘ do danych prywatnych kopiując je do SCHOWKA SYSTEMOWEGO, natomiast nie zapisuje/utrwala ich stale. Skrypt nie zmienia podstawowego działania strony. Skrypt dodaje kilka automatyzacji, skrótów oraz modyfikacje wizualne, które mają na celu usprawnienie i ułatwienie korzystania z serwisu.

//Ostatnia aktualizacja: 18.08.2025

(function() {
    'use strict';

    function recolorRows() {
        const rows = document.querySelectorAll("table.table.table-hover.table-condensed tr");

        rows.forEach(row => {
            const text = row.innerText.toLowerCase();

            if (row.classList.contains("bg-success")
                && text.includes("daniel latocha")
                && text.includes("zbiorczej")) {
                row.style.backgroundColor = "gray";
                row.style.color = "red";
            } else {
                row.style.backgroundColor = "#5cfff1";
                row.style.color = "#black";
            }
        });
    }

    recolorRows();

    const observer = new MutationObserver(recolorRows);
    observer.observe(document.body, { childList: true, subtree: true });
})();
