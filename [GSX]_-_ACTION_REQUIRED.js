// ==UserScript==
// @name         [GSX] - ACTION_REQUIRED
// @version      1.1
// @description  Sprawdza dane z maila ACTION REQUIRED i generuje wiadomości do serwisantów
// @author       Sebastian Zborowski
// @match        https://gsx2.apple.co*
// @include      https://gsx2.apple.co*
// @updateURL    https://raw.githubusercontent.com/sebastian-zborowski/Fixably-GSX-AST2/main/%5BGSX%5D_-_ACTION_REQUIRED.js
// @downloadURL  https://raw.githubusercontent.com/sebastian-zborowski/Fixably-GSX-AST2/main/%5BGSX%5D_-_ACTION_REQUIRED.js
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @grant        none
// @source       https://github.com/sebastian-zborowski
// ==/UserScript==

//Disclaimer:
//Niniejszy skrypt został utworzony metodą Vibecodingu. Nie ingeruje trwale w oryginalne strony internetowe, nie odwołuje się do danych prywatnych ani chronionych przepisami RODO,
//nie przetwarza danych osobowych, a także nie zmienia podstawowego działania strony. Skrypt dodaje kilka automatyzacji, skrótów oraz modyfikacje wizualne, które mają na celu
//usprawnienie i ułatwienie korzystania z serwisu.

//Ostatni update: 07.08.2025

(function () {
    'use strict';

  if (location.search.includes('dummy=1')) {
    console.log('Dummy page detected, skrypt nie wykonuje się tutaj.');
    return; // przerwij wykonanie skryptu jeżeli strona jest tylko DUMMY do pobrania danych > Zapobieganie zapchaniu pamięci safari
  }

    document.body.style.backgroundColor = "#555";
    const DELAY_MS = 3000;
    const gnumToName = {};
    let codes = [];

    setTimeout(() => {
        const footer = document.querySelector('.ac-gf-footer .left');
        if (!footer || document.querySelector('#action-required-trigger')) return;

        const triggerBtn = document.createElement('button');
        triggerBtn.id = 'action-required-trigger';
        triggerBtn.textContent = 'ACTION REQUIRED';
        triggerBtn.style.cssText = 'margin-left:12px;padding:4px 8px;background:#444;color:#eee;border:1px solid #666;border-radius:3px;font-size:12px;cursor:pointer;opacity:0.8;';
        triggerBtn.addEventListener('mouseenter', () => { triggerBtn.style.opacity = '1'; });
        triggerBtn.addEventListener('mouseleave', () => { triggerBtn.style.opacity = '0.8'; });

        triggerBtn.addEventListener('click', () => {
            triggerBtn.disabled = true;
            triggerBtn.textContent = 'Wczytywanie...';

            setTimeout(() => {
                addInlineParser();

                triggerBtn.style.display = 'none';

                const reloadBtn = document.createElement('button');
                reloadBtn.textContent = 'Przeładuj';
                reloadBtn.style.cssText = 'margin-left:12px;padding:4px 8px;background:#444;color:#eee;border:1px solid #666;border-radius:3px;font-size:12px;cursor:pointer;opacity:0.8;';
                reloadBtn.addEventListener('mouseenter', () => { reloadBtn.style.opacity = '1'; });
                reloadBtn.addEventListener('mouseleave', () => { reloadBtn.style.opacity = '0.8'; });

                const closeBtn = document.createElement('button');
                closeBtn.textContent = 'Zamknij';
                closeBtn.style.cssText = 'margin-left:12px;padding:4px 8px;background:#444;color:#eee;border:1px solid #666;border-radius:3px;font-size:12px;cursor:pointer;opacity:0.8;';
                closeBtn.addEventListener('mouseenter', () => { closeBtn.style.opacity = '1'; });
                closeBtn.addEventListener('mouseleave', () => { closeBtn.style.opacity = '0.8'; });

                footer.appendChild(reloadBtn);

                reloadBtn.onclick = () => {
                    location.reload();
                };

                closeBtn.onclick = () => {
                    // Reset UI and show triggerBtn again
                    const container = document.querySelector('div[data-action-required-container]');
                    if (container) container.remove();
                    const objectsContainer = document.getElementById('objects-container');
                    if (objectsContainer) objectsContainer.remove();
                    const statusText = document.getElementById('current-check-status');
                    if (statusText) statusText.remove();
                    const progressBarWrapper = document.getElementById('progress-bar-wrapper');
                    if (progressBarWrapper) progressBarWrapper.remove();
                    reloadBtn.remove();
                    closeBtn.remove();
                    triggerBtn.style.display = 'inline-block';
                    triggerBtn.disabled = false;
                    triggerBtn.textContent = 'ACTION REQUIRED';
                    codes = [];
                    for (const key in gnumToName) {
                        if (Object.hasOwnProperty.call(gnumToName, key)) {
                            delete gnumToName[key];
                        }
                    }
                };

                triggerBtn.textContent = 'Wczytano.';
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }, 500);
        });

        footer.appendChild(triggerBtn);
    }, DELAY_MS);

    function addInlineParser() {
        const container = document.createElement('div');
        container.setAttribute('data-action-required-container', 'true');
        container.style.cssText = 'position:relative;padding:20px;border-top:3px solid #0275d8;background:#000;color:white;width:80%;max-width:80vw;margin:20px auto;font-family:Arial,sans-serif;';

        const h2 = document.createElement('h2');
        h2.style.color = '#00bfff';
        h2.textContent = 'Szybkie sprawdzanie ACTION REQUIRED';
        container.appendChild(h2);
        container.appendChild(document.createElement('br'));

        const textarea = document.createElement('textarea');
        textarea.id = 'input';
        textarea.placeholder = 'Wklej tutaj tabelkę z maila';
        textarea.style.cssText = 'width:100%;height:150px;font-family:monospace;font-size:14px;padding:8px;background:#111;color:white;border:1px solid #444;box-sizing:border-box;';
        container.appendChild(textarea);
        container.appendChild(document.createElement('br'));

        const buttonsWrapper = document.createElement('div');
        buttonsWrapper.id = 'buttons-wrapper';
        buttonsWrapper.style.cssText = 'margin-top:10px;display:flex;justify-content:center;gap:10px;flex-wrap:wrap;';
        container.appendChild(buttonsWrapper);

        const extractBtn = document.createElement('button');
        extractBtn.id = 'extract';
        extractBtn.textContent = 'Pokaż numery';
        extractBtn.style.cssText = 'padding:8px 16px;background:gray;color:white;border:none;border-radius:4px;font-weight:bold;cursor:pointer;';
        buttonsWrapper.appendChild(extractBtn);

        const fetchAllBtn = document.createElement('button');
        fetchAllBtn.id = 'fetchAll';
        fetchAllBtn.textContent = 'Pobierz wszystkie PO';
        fetchAllBtn.style.cssText = 'padding:8px 16px;background:gray;color:white;border:none;border-radius:4px;font-weight:bold;cursor:pointer;display:none;';
        buttonsWrapper.appendChild(fetchAllBtn);

        const bulkMsgBtn = document.createElement('button');
        bulkMsgBtn.textContent = '📩 Wiadomość zbiorcza';
        bulkMsgBtn.style.cssText = 'padding:8px 16px;background:gray;color:white;border:none;border-radius:4px;font-weight:bold;cursor:pointer;display:none;';
        buttonsWrapper.appendChild(bulkMsgBtn);

        const resultsDiv = document.createElement('div');
        resultsDiv.id = 'results';
        resultsDiv.style.cssText = 'margin-top:20px;white-space:pre-wrap;font-family:monospace;';
        container.appendChild(resultsDiv);

        document.body.appendChild(container);

        let codes = [];

        extractBtn.onclick = () => {
            const matches = textarea.value.match(/G[A-Z0-9]{9}/gi);
            resultsDiv.innerHTML = '';
            fetchAllBtn.style.display = 'none';
            bulkMsgBtn.style.display = 'none';
            codes = [];

            if (matches && matches.length) {
                codes = [...new Set(matches)];
                resultsDiv.style.display = 'grid';
                resultsDiv.style.gridTemplateColumns = 'repeat(4, 1fr)';
                resultsDiv.style.gap = '10px';
                resultsDiv.style.whiteSpace = 'normal';

                codes.forEach(code => {
                    const line = document.createElement('div');
                    line.className = 'result-line';
                    line.dataset.code = code;
                    line.textContent = code + ': X';

                    line.style.border = 'none';
                    line.style.padding = '4px 6px';
                    line.style.borderRadius = '0';
                    line.style.whiteSpace = 'nowrap';
                    line.style.lineHeight = '24px';
                    line.style.overflow = 'hidden';
                    line.style.textOverflow = 'ellipsis';
                    line.style.width = '100%';

                    resultsDiv.appendChild(line);
                });
                fetchAllBtn.style.display = 'inline-block';
            } else {
                resultsDiv.innerHTML = '<span style="color:red;">Brak numerów G*********</span>';
            }
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        };

function fetchCodeData(code) {
    return new Promise(resolve => {
        const line = resultsDiv.querySelector('.result-line[data-code="' + code + '"]');
        if (line) line.textContent = code + ': WCZYTUJE...';

        let statusText = document.getElementById('current-check-status');
        if (!statusText) {
            statusText = document.createElement('div');
            statusText.id = 'current-check-status';
            statusText.style.cssText = 'text-align:center;margin:10px auto 5px auto;font-weight:bold;color:#00bfff;font-size:16px;';
            document.body.appendChild(statusText);
        }
        statusText.textContent = 'Sprawdzam...';

        const currentDate = Date.now();
        const wrapper = document.createElement('div');
        wrapper.id = 'object-wrapper-' + currentDate;
        wrapper.style.cssText = 'display:inline-block;vertical-align:top;width:18%;height:30vh;padding:5px;margin:5px 5px 2% 5px;border:1px solid #00bfff;background:#111;text-align:center;border-radius:4px;';

        const header = document.createElement('div');
        header.textContent = code;
        header.style.cssText = 'color:#00bfff;font-weight:bold;margin-bottom:5px;font-size:14px;';

        const timerDiv = document.createElement('div');
        timerDiv.id = 'object-timer' + currentDate;
        timerDiv.style.cssText = 'color:white;font-weight:bold;font-size:13px;margin-bottom:5px;';
        timerDiv.textContent = 'Rozpoczynam';

        const objectEl = document.createElement('object');
        objectEl.id = 'object-' + currentDate;
        objectEl.data = 'https://gsx2.apple.com/repairs/' + code + '?dummy=1';
        objectEl.type = 'text/html';
        objectEl.style.cssText = 'width:100%;height:15vh;border:2px solid #00bfff;border-radius:3px;';

        const textOutput = document.createElement('div');
        textOutput.id = 'text-output-' + currentDate;
        textOutput.style.cssText = 'margin-top:5px;padding:4px;background:#222;color:#00bfff;font-size:11px;text-align:left;position:relative;height:auto;overflow:auto;white-space:pre-wrap;border:1px solid #444;border-radius:3px;';
        textOutput.textContent = 'Oczekiwanie na dane...';

        wrapper.appendChild(header);
        wrapper.appendChild(timerDiv);
        wrapper.appendChild(objectEl);
        wrapper.appendChild(textOutput);

        let objectsContainer = document.getElementById('objects-container');
        if (!objectsContainer) {
            objectsContainer = document.createElement('div');
            objectsContainer.id = 'objects-container';
            objectsContainer.style.cssText = 'width:100%;display:flex;flex-wrap:wrap;justify-content:center;margin:10px auto;';
            document.body.appendChild(objectsContainer);
        }

        objectsContainer.appendChild(wrapper);

        let secondsElapsed = 0;
        let hasRetried = false;
        const timerInterval = setInterval(() => {
            secondsElapsed++;
            timerDiv.textContent = 'Czas ładowania: ' + secondsElapsed + 's';

            if (secondsElapsed <= 3) {
                timerDiv.style.color = 'lightgreen';
            } else if (secondsElapsed <= 6) {
                timerDiv.style.color = 'yellow';
            } else {
                timerDiv.style.color = 'red';
            }

            if (secondsElapsed >= 15) {
                if (!hasRetried) {
                    hasRetried = true;
                    secondsElapsed = 0;
                    timerDiv.textContent = 'Ponowne ładowanie...';
                    timerDiv.style.color = 'orange';

                    objectEl.data = '';
                    setTimeout(() => {
                        objectEl.data = 'https://gsx2.apple.com/repairs/' + code + '?dummy=1';
                    }, 100);
                } else {
                    clearInterval(timerInterval);
                    clearInterval(checkInterval);
                    wrapper.remove();
                    if (line) line.textContent = code + ': BŁĄD - przekroczono czas ładowania (2 próby)';
                    statusText.textContent = '';
                    resolve({ code, value: 'BŁĄD - przekroczono czas ładowania (2 próby)' });
                }
            }
        }, 1000);

        const checkInterval = setInterval(() => {
            try {
                const doc = objectEl.contentDocument || objectEl.getSVGDocument?.() || null;
                if (!doc || !doc.body) return;

                const rawText = doc.body.innerText.trim();
                if (rawText.length > 0) {
                    textOutput.textContent = rawText;
                }

                const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
                let potentialName = null;

                for (let i of [4, 5]) {
                    const line = lines[i];
                    if (!line) continue;
                    const parts = line.trim().split(/\s+/);
                    if (parts.length === 2) {
                        const validCaps = parts.every(w => /^[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+$/.test(w));
                        const excluded = ['More actions', 'In Repair', 'Carry In', 'Clear All'];
                        if (validCaps && !excluded.includes(line.trim())) {
                            potentialName = line.trim();
                            break;
                        }
                    }
                }

                if (potentialName) {
                    clearInterval(timerInterval);
                    clearInterval(checkInterval);
                    setTimeout(() => {
                        wrapper.remove();
                        if (line) line.textContent = code + ': ' + potentialName;
                        statusText.textContent = '';
                        gnumToName[code] = potentialName;
                        resolve({ code, value: potentialName });
                    }, 600);
                } else if (lines.length > 6) {
                    const specialLine = lines
                    .slice(0, 10)
                    .find(l => ['Closed and completed', 'Closed and Completed', 'Unit Returned Replaced'].includes(l.trim()));

                    const finalValue = specialLine || 'BŁĄD – brak technika';
                    clearInterval(timerInterval);
                    clearInterval(checkInterval);
                    setTimeout(() => {
                        wrapper.remove();
                        if (line) line.textContent = code + ': ' + finalValue;
                        statusText.textContent = '';
                        gnumToName[code] = specialLine ? specialLine : 'ID:';
                        resolve({ code, value: finalValue });
                    }, 600);
                }


            } catch (e) {
                // console.warn('Object access error:', e);
            }
        }, 500);

        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
}




        fetchAllBtn.onclick = async () => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            if (codes.length === 0) return;

            fetchAllBtn.disabled = true;

            const chunks = [];
            const chunkSize = 4;
            let results = [];

            for (let i = 0; i < codes.length; i += chunkSize) {
                chunks.push(codes.slice(i, i + chunkSize));
            }

            const delay = ms => new Promise(res => setTimeout(res, ms));

            let objectsContainer = document.getElementById('objects-container');
            if (!objectsContainer) {
                objectsContainer = document.createElement('div');
                objectsContainer.id = 'objects-container';
                objectsContainer.style.cssText = 'width:100%;display:flex;flex-wrap:wrap;justify-content:center;margin:10px auto;';
                document.body.appendChild(objectsContainer);
            }

            // Progress bar
            const progressBarWrapper = document.createElement('div');
            progressBarWrapper.id = 'progress-bar-wrapper';
            progressBarWrapper.style.cssText = 'width:80%;margin:3vh auto;text-align:center;';

            const progressBar = document.createElement('div');
            progressBar.style.cssText = 'height:20px;background:#222;border:1px solid #555;border-radius:10px;overflow:hidden;';

            const progressFill = document.createElement('div');
            progressFill.style.cssText = 'height:100%;width:0%;background:#00bfff;transition:width 0.3s;';
            progressBar.appendChild(progressFill);

            const progressText = document.createElement('div');
            progressText.style.cssText = 'color:white;margin-top:5px;font-weight:bold;font-size:18px;';
            progressText.textContent = 'Ładowanie';

            progressBarWrapper.appendChild(progressBar);
            progressBarWrapper.appendChild(progressText);

            objectsContainer.parentNode.insertBefore(progressBarWrapper, objectsContainer);

            let checkedCount = 0;
            const totalCount = codes.length;

            for (const chunk of chunks) {
                const chunkResults = await Promise.all(chunk.map(async (code, i) => {
                    await delay(i * 100);
                    try {
                        const result = await fetchCodeData(code);
                        return result;
                    } catch (err) {
                        const line = resultsDiv.querySelector('.result-line[data-code="' + code + '"]');
                        if (line) line.textContent = code + ': BŁĄD - ' + (err?.message || 'nieznany problem');
                        return { code, value: 'BŁĄD - ' + (err?.message || 'nieznany problem') };
                    } finally {
                        checkedCount++;
                        const percent = Math.min(100, Math.round((checkedCount / totalCount) * 100));
                        progressFill.style.width = percent + '%';
                        progressText.textContent = percent + '% (' + checkedCount + ' z ' + totalCount + ')';
                    }
                }));

                results = results.concat(chunkResults);
            }

            await delay(500);

            progressFill.style.width = '100%';
            progressText.textContent = 'GOTOWE (' + totalCount + ' z ' + totalCount + ')';
            setTimeout(() => {
                progressBarWrapper.remove();
            }, 2000);

            // Grupowanie wyników
            const grouped = {};
            results.forEach(r => {
                if (!grouped[r.value]) grouped[r.value] = [];
                grouped[r.value].push(r);
            });

            const order = ['Repair Marked Complete', 'Closed and completed'];
            const sortedGroups = Object.keys(grouped).sort((a, b) => {
                const aIndex = order.indexOf(a);
                const bIndex = order.indexOf(b);
                return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
            });

            resultsDiv.innerHTML = '';
            sortedGroups.forEach(group => {
                const entries = grouped[group];

                const block = document.createElement('div');
                block.style.marginBottom = '30px';
                block.style.border = '1px solid #00bfff';
                block.style.borderRadius = '5px';
                block.style.padding = '10px';
                block.style.position = 'relative';
                block.style.paddingBottom = '60px';

                const linesGrid = document.createElement('div');
                linesGrid.style.display = 'grid';
                linesGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
                linesGrid.style.gap = '10px';

                entries.forEach(r => {
                    const line = document.createElement('div');
                    line.className = 'result-line';
                    line.textContent = r.code + ': ' + r.value;
                    line.style.padding = '4px 6px';
                    line.style.borderRadius = '3px';
                    linesGrid.appendChild(line);
                });

                block.appendChild(linesGrid);

                const buttonsContainer = document.createElement('div');
                buttonsContainer.style.cssText = 'position:absolute;bottom:10px;left:0;right:0;margin:0 auto;width:100%;max-width:100%;display:flex;flex-direction:column;align-items:center;gap:10px;box-sizing:border-box;padding:0 10px;';

                const copyBtn = document.createElement('button');
                copyBtn.textContent = 'KOPIUJ: ' + group;
                copyBtn.style.cssText = 'padding:6px 12px;background:#00bfff;color:black;border:none;border-radius:3px;cursor:pointer;width:100%;max-width:400px;height:36px;font-weight:bold;white-space:normal;';

                copyBtn.onclick = () => {
                    const messagesByName = {};
                    entries.forEach(({ code }) => {
                        const name = gnumToName[code] || 'Serwisant';
                        console.log('Kod:', code, 'Technik:', name);
                        if (!messagesByName[name]) messagesByName[name] = new Set();
                        messagesByName[name].add(code);
                    });

                    let textToCopy = '';
                    for (const [name, codesSet] of Object.entries(messagesByName)) {
                        const codesList = Array.from(codesSet).join('\n');
                        textToCopy += 'Hej ' + name + ',\nApple CSS poinformowało o naprawach:\n\n' + codesList + '\n\nRzuć proszę na to okiem ^^ \n~Wiadomość wygenerowana automatycznie\n\n';
                    }

                    navigator.clipboard.writeText(textToCopy).then(() => {
                        copyBtn.textContent = 'Skopiowano!';
                        setTimeout(() => { copyBtn.textContent = 'KOPIUJ: ' + group; }, 1500);
                    });
                };

                buttonsContainer.appendChild(copyBtn);
                block.appendChild(buttonsContainer);

                resultsDiv.appendChild(block);
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            });

            bulkMsgBtn.style.display = 'inline-block';
            fetchAllBtn.disabled = false;
        };

        bulkMsgBtn.onclick = () => {
            const nameToCodes = {};
            Array.from(resultsDiv.querySelectorAll('.result-line')).forEach(div => {
                const text = div.textContent.trim();
                const match = text.match(/(G[A-Z0-9]{9})/);
                if (!match) return;
                const code = match[1];
                const status = text.replace(code + ': ', '');
                const name = gnumToName[code] || 'BŁĄD - Sprawdzić ręcznie:';
                console.log('Kod:', code, 'Technik:', name);
                if (!nameToCodes[name]) nameToCodes[name] = [];
                nameToCodes[name].push({ code, status });
            });

            let listLines = '';
            for (const [name, entries] of Object.entries(nameToCodes)) {
                listLines += '~ ' + name + '\n';
                entries.forEach(({ code }) => {
                    listLines += '  ' + code + '\n';
                });
                listLines += '\n';
            }

            const message = 'Cześć,\nPrzesłane naprawy należą do:\n\n' + listLines + '~Wiadomość wygenerowana automatycznie\n\n';

            navigator.clipboard.writeText(message).then(() => {
                bulkMsgBtn.textContent = 'Skopiowano!';
                setTimeout(() => {
                    bulkMsgBtn.textContent = '📩 Wiadomość zbiorcza';
                }, 1500);
            }).catch(() => {
                alert('Nie udało się skopiować do schowka. Spróbuj ponownie.');
            });
        };
    }


// Kontrola wersji alert ---------------------------------------------------------
(async function() {
    const scriptList = [
        { name: 'ACTION_REQUIRED', url: 'https://raw.githubusercontent.com/sebastian-zborowski/Fixably-GSX-AST2/main/%5BGSX%5D_-_ACTION_REQUIRED.js' },
    ];

    const currentVersions = {
        ACTION_REQUIRED: '1.1',
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
