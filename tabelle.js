function mostraClassifiche() {
    const main = document.getElementById("main-content");
    main.innerHTML = "";

    const container = document.createElement("div");
    container.id = "classifica-piloti-container";
    main.appendChild(container);

    mostraClassificaPiloti(gare2025, "classifica-piloti-container");

    // Tabella scuderie
    const containerScuderie = document.createElement("div");
    containerScuderie.id = "classifica-scuderie-container";
    main.appendChild(containerScuderie);

    mostraClassificaScuderie(gare2025, "classifica-scuderie-container");
}
function mostraClassificaPilotiSingola() {
    const main = document.getElementById("main-content");
    main.innerHTML = "";

    const container = document.createElement("div");
    container.id = "classifica-piloti-container";
    main.appendChild(container);

    mostraClassificaPiloti(gare2025, "classifica-piloti-container");
}

function mostraClassificaScuderieSingola() {
    const main = document.getElementById("main-content");
    main.innerHTML = "";

    const container = document.createElement("div");
    container.id = "classifica-scuderie-container";
    main.appendChild(container);

    mostraClassificaScuderie(gare2025, "classifica-scuderie-container");
}


// tabelle.js

// Converti tempo da "m:ss.xxx" a secondi (numero float)
// Converte una stringa tempo "m:ss.xxx" o "ss.xxx" in secondi float
function tempoStrToSec(tempo) {
    if (!tempo) return null;
    const parts = tempo.split(':');
    if (parts.length === 2) {
        const min = parseInt(parts[0], 10);
        const sec = parseFloat(parts[1]);
        if (isNaN(min) || isNaN(sec)) return null;
        return min * 60 + sec;
    } else {
        const sec = parseFloat(tempo);
        return isNaN(sec) ? null : sec;
    }
}

function secToTempoStr(sec) {
    if (sec === null || isNaN(sec)) return "-";
    const min = Math.floor(sec / 60);
    const secondiTot = sec % 60;
    const secondi = Math.floor(secondiTot);
    const millesimi = Math.round((secondiTot - secondi) * 1000);

    const secondiStr = secondi < 10 ? `0${secondi}` : `${secondi}`;
    const millesimiStr = millesimi.toString().padStart(3, '0');

    return `${min}:${secondiStr}.${millesimiStr}`;
}



// Genera la classifica piloti con tutte le statistiche richieste
function generaClassificaPiloti(gare) {
    const puntiPerPosizione = {
        1: 25, 2: 18, 3: 15, 4: 12, 5: 10,
        6: 8, 7: 6, 8: 4, 9: 2, 10: 1,
    };
    const puntiSprint = {
        1: 8, 2: 7, 3: 6, 4: 5, 5: 4,
        6: 3, 7: 2, 8: 1
    };

    const classifica = {};

    gare.forEach(gara => {
        gara.piloti.forEach(pilota => {
            const nome = pilota.nome;
            if (!classifica[nome]) {
                classifica[nome] = {
                    nome: pilota.nome,
                    scuderia: pilota.scuderia,
                    punti: 0,
                    vittorie: 0,
                    podi: 0,
                    gareCorse: 0,
                    posFinaleTot: 0,
                    posFinaleCount: 0,
                    posQualificaTot: 0,
                    posQualificaCount: 0,
                    tempoQualTot: 0,
                    tempoQualCount: 0,
                    q3Count: 0,
                    q2Count: 0,
                    primeFileCount: 0,
                    giriVelociCount: 0,
                    driverDayCount: 0,
                    dnfCount: 0,
                };
            }

            const c = classifica[nome];

            if (pilota.posizioneQualifica) {
                c.posQualificaTot += pilota.posizioneQualifica;
                c.posQualificaCount++;

                if (pilota.posizioneQualifica >= 1 && pilota.posizioneQualifica <= 10) c.q3Count++;
                if (pilota.posizioneQualifica >= 1 && pilota.posizioneQualifica <= 15) c.q2Count++;
                if ([1, 2].includes(pilota.posizioneQualifica)) c.primeFileCount++;
                if ([1, 2, 3].includes(pilota.posizioneFinale)) c.podi++;
            }

            let tempi = [pilota.q1, pilota.q2, pilota.q3].map(tempoStrToSec).filter(t => t !== null);
            if (tempi.length > 0) {
                const mediaTempiGara = tempi.reduce((a, b) => a + b, 0) / tempi.length;
                c.tempoQualTot += mediaTempiGara;
                c.tempoQualCount++;
            }

            if (!pilota.dnf) {
                const punti = puntiPerPosizione[pilota.posizioneFinale] || 0;
                c.punti += punti;

                c.gareCorse++;

                if (pilota.posizioneFinale) {
                    c.posFinaleTot += pilota.posizioneFinale;
                    c.posFinaleCount++;
                }
            }

            if (typeof pilota.sprint === "number") {
                const puntiDaSprint = puntiSprint[pilota.sprint] || 0;
                classifica[nome].punti += puntiDaSprint;
            }

            if (pilota.giroVeloce) c.giriVelociCount++;
            if (pilota.pilotaDelGiorno) c.driverDayCount++;
            if (pilota.dnf) c.dnfCount++;
        });
    });

    return Object.values(classifica).map(p => ({
        nome: p.nome,
        scuderia: p.scuderia,
        punti: p.punti,
        vittorie: p.vittorie,
        podi: p.podi,
        gareCorse: p.gareCorse,
        posizioneMediaFinale: p.posFinaleCount ? (p.posFinaleTot / p.posFinaleCount).toFixed(2) : "-",
        posizioneMediaQualifica: p.posQualificaCount ? (p.posQualificaTot / p.posQualificaCount).toFixed(2) : "-",
        tempoMedioQualifica: p.tempoQualCount ? secToTempoStr(p.tempoQualTot / p.tempoQualCount) : "-",
        q3Count: p.q3Count,
        q2Count: p.q2Count,
        primeFileCount: p.primeFileCount,
        giriVelociCount: p.giriVelociCount,
        driverDayCount: p.driverDayCount,
        dnfCount: p.dnfCount
    })).sort((a, b) => b.punti - a.punti);
}

function generaClassificaOmnicomprensiva(piloti) {
    const pesi = {
        punti: 1.5,
        posizioneMediaFinale: 1.3,
        posizioneMediaQualifica: 1.1,
        q3Count: 0.9,
        q2Count: 0.8,
        driverDayCount: 0.2,
        giriVelociCount: 0.5,
        dnfCount: 0.5,
        tempoMedioQualifica: 1.1,
        primeFileCount: 0.6,
        podi: 0.7,
    };

    const inverti = {
        posizioneMediaFinale: true,
        posizioneMediaQualifica: true,
        dnfCount: true,
        tempoMedioQualifica: true,
    };

    const metriche = Object.keys(pesi);

    // Qui definiamo le metriche discrete da trattare con rango speciale
    const discreteMetrics = new Set([
        'q3Count', 'q2Count', 'driverDayCount',
        'giriVelociCount', 'dnfCount', 'primeFileCount', 'podi'
    ]);

    const ranghiPerMetrica = {};

    metriche.forEach(metrica => {
        // Copia array piloti per ordinamento
        const ordinati = [...piloti].sort((a, b) => {
            const valA = isNaN(a[metrica]) ? -Infinity : parseFloat(a[metrica]);
            const valB = isNaN(b[metrica]) ? -Infinity : parseFloat(b[metrica]);
            return (inverti[metrica] ? valA - valB : valB - valA);
        });

        ranghiPerMetrica[metrica] = {};

        if (discreteMetrics.has(metrica)) {
            // Assegna rango solo a chi ha valore > 0
            let rango = 1;
            let rangoMaxVal = 0;

            ordinati.forEach(p => {
                const val = p[metrica] || 0;
                if (val > 0) {
                    ranghiPerMetrica[metrica][p.nome] = rango;
                    rangoMaxVal = rango;
                    rango++;
                }
            });

            // Tutti quelli con valore 0 prendono rangoMaxVal + 1
            ordinati.forEach(p => {
                const val = p[metrica] || 0;
                if (val === 0) {
                    ranghiPerMetrica[metrica][p.nome] = rangoMaxVal + 1;
                }
            });

        } else {
            // Metodo originale per metriche continue
            ordinati.forEach((p, index) => {
                ranghiPerMetrica[metrica][p.nome] = index + 1;
            });
        }
    });

    let classificaOmni = piloti.map(p => {
        let punteggio = 0;

        metriche.forEach(m => {
            const rango = ranghiPerMetrica[m][p.nome];
            const peso = pesi[m];
            punteggio += rango * peso;
        });

        return {
            nome: p.nome,
            scuderia: p.scuderia,
            punteggioOmni: punteggio,
            dettagli: metriche.reduce((acc, m) => {
                acc[m] = p[m];
                return acc;
            }, {})
        };
    });

    // Ordino crescente per punteggio (migliore = punteggio più basso)
    classificaOmni.sort((a, b) => a.punteggioOmni - b.punteggioOmni);

    // Inverto il punteggio per avere valore più alto = migliore
    const maxPunteggio = classificaOmni[classificaOmni.length - 1].punteggioOmni;

    classificaOmni = classificaOmni.map(p => ({
        ...p,
        punteggioOmni: maxPunteggio - p.punteggioOmni
    }));

    // Ordino decrescente per punteggioOmni (migliore in cima)
    return classificaOmni.sort((a, b) => b.punteggioOmni - a.punteggioOmni);
}


// Mostra la classifica nel main svuotandolo prima

// Crea la tabella HTML per la classifica piloti
function mostraClassificaPiloti(gare, containerId) {
    let classifica = generaClassificaPiloti(gare);

    // Genera la classifica omnicomprensiva usando la funzione che hai scritto
    const classificaOmni = generaClassificaOmnicomprensiva(classifica);

    // Unisci i dati della classificaOmni con quelli originali basandoti sul nome
    classifica = classifica.map(p => {
        const omni = classificaOmni.find(o => o.nome === p.nome);
        return {
            ...p,
            punteggioOmni: omni ? omni.punteggioOmni : Infinity
        };
    });

    const container = document.getElementById(containerId);

    let sortKey = 'punti'; // default sort by points
    let sortAsc = false; // default descending order

    function renderTable() {
        // Ordina la classifica
        classifica.sort((a, b) => {
            let valA = a[sortKey];
            let valB = b[sortKey];

            // Se la colonna è tempoMedioQualifica, converti da "m:ss.xxx" a secondi
            if (sortKey === 'tempoMedioQualifica') {
                const toSec = s => {
                    if (!s || s === '-') return Infinity; // gestisci valori vuoti o "-"
                    const parts = s.split(':');
                    if (parts.length === 2) {
                        const min = parseInt(parts[0], 10);
                        const sec = parseFloat(parts[1]);
                        if (isNaN(min) || isNaN(sec)) return Infinity;
                        return min * 60 + sec;
                    } else {
                        const sec = parseFloat(s);
                        return isNaN(sec) ? Infinity : sec;
                    }
                };
                valA = toSec(valA);
                valB = toSec(valB);
            } else {
                // Se valori sono numerici come stringhe, convertili
                if (typeof valA === 'string' && !isNaN(parseFloat(valA))) {
                    valA = parseFloat(valA);
                }
                if (typeof valB === 'string' && !isNaN(parseFloat(valB))) {
                    valB = parseFloat(valB);
                }
            }

            if (valA < valB) return sortAsc ? -1 : 1;
            if (valA > valB) return sortAsc ? 1 : -1;
            return 0;
        });

        // Costruzione header con data-key per sorting
        let html = `<table class="tabella-classifica">
        <thead>
          <tr>
            <th data-key="#">Pos</th>
            <th data-key="nome">Pilota</th>
            <th data-key="punti">Punti</th>
            <th data-key="punteggioOmni">Punteggio</th>
            <th data-key="posizioneMediaFinale">Posizione Gara</th>
            <th data-key="posizioneMediaQualifica">Posizione Qualifica</th>
            <th data-key="tempoMedioQualifica">Tempo Qualifica</th>
            <th data-key="q3Count">Presenze Q3</th>
            <th data-key="q2Count">Presenze Q2</th>
            <th data-key="podi">Podi</th>
            <th data-key="primeFileCount">Prime File</th>
            <th data-key="giriVelociCount">Giri Veloci</th>
            <th data-key="driverDayCount">Driver of the Day</th>
            <th data-key="dnfCount">DNF</th>
          </tr>
        </thead>
        <tbody>`;

        classifica.forEach((p, i) => {
            html += `<tr>
                <td>${i + 1}</td>
                <td>${p.nome}</td>
                <td>${p.punti}</td>
                <td>${p.punteggioOmni.toFixed(2)}</td>
                <td>${p.posizioneMediaFinale}</td>
                <td>${p.posizioneMediaQualifica}</td>
                <td>${p.tempoMedioQualifica}</td>
                <td>${p.q3Count}</td>
                <td>${p.q2Count}</td>
                <td>${p.podi}</td>
                <td>${p.primeFileCount}</td>
                <td>${p.giriVelociCount}</td>
                <td>${p.driverDayCount}</td>
                <td>${p.dnfCount}</td>
            </tr>`;
        });

        html += `</tbody></table>`;
        container.innerHTML = `<div class="tabella-scroll-wrapper">${html}</div>`;


        // Aggiungo event listener sulle intestazioni
        const headers = container.querySelectorAll('th[data-key]');
        const ordDecrescenteIniziale = new Set(['punti', 'punteggioOmni', 'podi', 'giriVelociCount', 'primeFileCount', 'q3Count', 'q2Count', 'driverDayCount',]);
        headers.forEach(header => {
            header.style.cursor = 'pointer';
            header.onclick = () => {
                const key = header.getAttribute('data-key');
                if (key === '#') return; // Non ordinare per #
                if (sortKey === key) {
                    sortAsc = !sortAsc; // alterna ordine
                } else {
                    sortKey = key;
                    sortAsc = !ordDecrescenteIniziale.has(key);
                }
                renderTable();
            };
        });
    }

    renderTable();
}

function generaClassificaScuderie(gare) {
    const puntiPerPosizione = {
        1: 25, 2: 18, 3: 15, 4: 12, 5: 10,
        6: 8, 7: 6, 8: 4, 9: 2, 10: 1,
    };
    const puntiSprint = {
        1: 8, 2: 7, 3: 6, 4: 5, 5: 4,
        6: 3, 7: 2, 8: 1
    };

    const classifica = {};

    gare.forEach(gara => {
        gara.piloti.forEach(pilota => {
            const scuderia = pilota.scuderia;
            if (!classifica[scuderia]) {
                classifica[scuderia] = {
                    scuderia: scuderia,
                    punti: 0,
                    vittorie: 0,
                    podi: 0,
                    gareCorse: 0,
                    posFinaleTot: 0,
                    posFinaleCount: 0,
                    posQualificaTot: 0,
                    posQualificaCount: 0,
                    tempoQualTot: 0,
                    tempoQualCount: 0,
                    q3Count: 0,
                    q2Count: 0,
                    primeFileCount: 0,
                    giriVelociCount: 0,
                    driverDayCount: 0,
                    dnfCount: 0,
                };
            }

            const c = classifica[scuderia];

            if (pilota.posizioneQualifica) {
                c.posQualificaTot += pilota.posizioneQualifica;
                c.posQualificaCount++;

                if (pilota.posizioneQualifica >= 1 && pilota.posizioneQualifica <= 10) c.q3Count++;
                if (pilota.posizioneQualifica >= 1 && pilota.posizioneQualifica <= 15) c.q2Count++;
                if ([1, 2].includes(pilota.posizioneQualifica)) c.primeFileCount++;
                if ([1, 2, 3].includes(pilota.posizioneFinale)) c.podi++;
            }

            let tempi = [pilota.q1, pilota.q2, pilota.q3].map(tempoStrToSec).filter(t => t !== null);
            if (tempi.length > 0) {
                const mediaTempiGara = tempi.reduce((a, b) => a + b, 0) / tempi.length;
                c.tempoQualTot += mediaTempiGara;
                c.tempoQualCount++;
            }

            if (!pilota.dnf) {
                const punti = puntiPerPosizione[pilota.posizioneFinale] || 0;
                c.punti += punti;

                c.gareCorse++;

                if (pilota.posizioneFinale) {
                    c.posFinaleTot += pilota.posizioneFinale;
                    c.posFinaleCount++;
                }
            }

            if (typeof pilota.sprint === "number") {
                const puntiDaSprint = puntiSprint[pilota.sprint] || 0;
                c.punti += puntiDaSprint;
            }

            if (pilota.giroVeloce) c.giriVelociCount++;
            if (pilota.pilotaDelGiorno) c.driverDayCount++;
            if (pilota.dnf) c.dnfCount++;
        });
    });

    return Object.values(classifica).map(c => ({
        scuderia: c.scuderia,
        punti: c.punti,
        vittorie: c.vittorie,
        podi: c.podi,
        gareCorse: c.gareCorse,
        posizioneMediaFinale: c.posFinaleCount ? (c.posFinaleTot / c.posFinaleCount).toFixed(2) : "-",
        posizioneMediaQualifica: c.posQualificaCount ? (c.posQualificaTot / c.posQualificaCount).toFixed(2) : "-",
        tempoMedioQualifica: c.tempoQualCount ? secToTempoStr(c.tempoQualTot / c.tempoQualCount) : "-",
        q3Count: c.q3Count,
        q2Count: c.q2Count,
        primeFileCount: c.primeFileCount,
        giriVelociCount: c.giriVelociCount,
        driverDayCount: c.driverDayCount,
        dnfCount: c.dnfCount,
    })).sort((a, b) => b.punti - a.punti);
}

function generaClassificaOmnicomprensivaScuderie(scuderie) {
    const pesi = {
        punti: 1.5,
        posizioneMediaFinale: 1.3,
        posizioneMediaQualifica: 1.1,
        q3Count: 0.9,
        q2Count: 0.8,
        driverDayCount: 0.2,
        giriVelociCount: 0.5,
        dnfCount: 0.5,
        tempoMedioQualifica: 1.1,
        primeFileCount: 0.6,
        podi: 0.7,
    };

    const inverti = {
        posizioneMediaFinale: true,
        posizioneMediaQualifica: true,
        dnfCount: true,
        tempoMedioQualifica: true,
    };

    const metriche = Object.keys(pesi);

    // Metriche discrete con rango speciale
    const discreteMetrics = new Set([
        'q3Count', 'q2Count', 'driverDayCount',
        'giriVelociCount', 'dnfCount', 'primeFileCount', 'podi'
    ]);

    const ranghiPerMetrica = {};

    metriche.forEach(metrica => {
        // Copia array scuderie per ordinamento
        const ordinati = [...scuderie].sort((a, b) => {
            const valA = isNaN(a[metrica]) ? -Infinity : parseFloat(a[metrica]);
            const valB = isNaN(b[metrica]) ? -Infinity : parseFloat(b[metrica]);
            return (inverti[metrica] ? valA - valB : valB - valA);
        });

        ranghiPerMetrica[metrica] = {};

        if (discreteMetrics.has(metrica)) {
            // Assegna rango solo a chi ha valore > 0
            let rango = 1;
            let rangoMaxVal = 0;

            ordinati.forEach(s => {
                const val = s[metrica] || 0;
                if (val > 0) {
                    ranghiPerMetrica[metrica][s.scuderia] = rango;
                    rangoMaxVal = rango;
                    rango++;
                }
            });

            // Tutti con valore 0 prendono rangoMaxVal + 1
            ordinati.forEach(s => {
                const val = s[metrica] || 0;
                if (val === 0) {
                    ranghiPerMetrica[metrica][s.scuderia] = rangoMaxVal + 1;
                }
            });

        } else {
            // Metodo originale per metriche continue
            ordinati.forEach((s, index) => {
                ranghiPerMetrica[metrica][s.scuderia] = index + 1;
            });
        }
    });

    let classificaOmni = scuderie.map(s => {
        let punteggio = 0;

        metriche.forEach(m => {
            const rango = ranghiPerMetrica[m][s.scuderia];
            const peso = pesi[m];
            punteggio += rango * peso;
        });

        return {
            scuderia: s.scuderia,
            punteggioOmni: punteggio,
            dettagli: metriche.reduce((acc, m) => {
                acc[m] = s[m];
                return acc;
            }, {})
        };
    });

    // Ordino crescente per punteggio (migliore = punteggio più basso)
    classificaOmni.sort((a, b) => a.punteggioOmni - b.punteggioOmni);

    // Inverto il punteggio per avere valore più alto = migliore
    const maxPunteggio = classificaOmni[classificaOmni.length - 1].punteggioOmni;

    classificaOmni = classificaOmni.map(s => ({
        ...s,
        punteggioOmni: maxPunteggio - s.punteggioOmni
    }));

    // Ordino decrescente per punteggioOmni (migliore in cima)
    return classificaOmni.sort((a, b) => b.punteggioOmni - a.punteggioOmni);
}

function mostraClassificaScuderie(gare, containerId) {
    const classifica = generaClassificaScuderie(gare);
    const classificaOmni = generaClassificaOmnicomprensivaScuderie(classifica);

    // Aggiungo punteggioOmni agli elementi di classifica
    const punteggiMap = new Map(classificaOmni.map(c => [c.scuderia, c.punteggioOmni]));
    classifica.forEach(s => {
        s.punteggioOmni = punteggiMap.get(s.scuderia) ?? 0;
    });

    const container = document.getElementById(containerId);

    let sortKey = 'punti';  // default sort by punti
    let sortAsc = false;    // default descending

    function renderTable() {
        // Ordina la classifica
        classifica.sort((a, b) => {
            let valA = a[sortKey];
            let valB = b[sortKey];

            if (sortKey === 'punteggioOmni') {
                valA = parseFloat(valA) || 0;
                valB = parseFloat(valB) || 0;
            } else if (sortKey === 'tempoMedioQualifica') {
                const toSec = s => {
                    if (!s || s === '-') return Infinity;
                    const parts = s.split(':');
                    if (parts.length === 2) {
                        const min = parseInt(parts[0], 10);
                        const sec = parseFloat(parts[1]);
                        if (isNaN(min) || isNaN(sec)) return Infinity;
                        return min * 60 + sec;
                    } else {
                        const sec = parseFloat(s);
                        return isNaN(sec) ? Infinity : sec;
                    }
                };
                valA = toSec(valA);
                valB = toSec(valB);
            } else {
                if (typeof valA === 'string' && !isNaN(parseFloat(valA))) valA = parseFloat(valA);
                if (typeof valB === 'string' && !isNaN(parseFloat(valB))) valB = parseFloat(valB);
            }

            if (valA < valB) return sortAsc ? -1 : 1;
            if (valA > valB) return sortAsc ? 1 : -1;
            return 0;
        });

        let html = `<table class="tabella-classifica">
        <thead>
            <tr>
                <th data-key="#">#</th>
                <th data-key="scuderia">Scuderia</th>
                <th data-key="punti">Punti</th>
                <th data-key="punteggioOmni">Punteggio</th>
                <th data-key="posizioneMediaFinale">Posizione Gara</th>
                <th data-key="posizioneMediaQualifica">Posizione Qualifica</th>
                <th data-key="tempoMedioQualifica">Tempo Qualifica</th>
                <th data-key="q3Count">Presenze Q3</th>
                <th data-key="q2Count">Presenze Q2</th>
                <th data-key="podi">Podi</th>
                <th data-key="primeFileCount">Prime File</th>
                <th data-key="giriVelociCount">Giri Veloci</th>
                <th data-key="driverDayCount">Driver of the Day</th>
                <th data-key="dnfCount">DNF</th>
            </tr>
        </thead>
        <tbody>`;

        classifica.forEach((s, index) => {
            html += `<tr>
                <td>${index + 1}</td>
                <td>${s.scuderia}</td>
                <td>${s.punti}</td>
                <td>${s.punteggioOmni.toFixed(2)}</td>
                <td>${s.posizioneMediaFinale}</td>
                <td>${s.posizioneMediaQualifica}</td>
                <td>${s.tempoMedioQualifica}</td>
                <td>${s.q3Count}</td>
                <td>${s.q2Count}</td>
                <td>${s.podi}</td>
                <td>${s.primeFileCount}</td>
                <td>${s.giriVelociCount}</td>
                <td>${s.driverDayCount}</td>
                <td>${s.dnfCount}</td>
            </tr>`;
        });

        html += `</tbody></table>`;
        container.innerHTML = `<h2></h2><div class="tabella-scroll-wrapper" style="margin-top:20px;">${html}</div>`;

        const headers = container.querySelectorAll('th[data-key]');
        const ordDecrescenteIniziale = new Set(['punti', 'punteggioOmni', 'podi', 'giriVelociCount', 'primeFileCount', 'q3Count', 'q2Count', 'driverDayCount',]);

        headers.forEach(header => {
            header.style.cursor = 'pointer';
            header.onclick = () => {
                const key = header.getAttribute('data-key');
                if (key === '#') return;
                if (sortKey === key) {
                    sortAsc = !sortAsc;
                } else {
                    sortKey = key;
                    sortAsc = !ordDecrescenteIniziale.has(key); 
                }
                renderTable();
            };
        });
    }

    renderTable();
}
