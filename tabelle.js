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


function generaClassificaPiloti(gare, finoAGara = null) {
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
        if (finoAGara !== null && gara.numeroGara > finoAGara) return;

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
                c.punti += puntiDaSprint;
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
    }));
}

function differenzaPuntiUltimeDueGare(gare) {
    const maxGara = Math.max(...gare.map(g => g.numeroGara));
    if (maxGara < 2) {
        // Se c'è solo una gara o meno, non ha senso calcolare la differenza
        return {};
    }

    const classificaFinoN = generaClassificaPiloti(gare, maxGara);
    const classificaFinoNMinus1 = generaClassificaPiloti(gare, maxGara - 1);

    // Creiamo un oggetto per mappare i punti fino a gara n-1
    const puntiFinoNMinus1 = {};
    classificaFinoNMinus1.forEach(pilota => {
        puntiFinoNMinus1[pilota.nome] = pilota.punti;
    });

    // Ora creiamo un array con la differenza punti (n - (n-1))
    const differenze = classificaFinoN.map(pilota => {
        const puntiPrecedenti = puntiFinoNMinus1[pilota.nome] || 0;
        return {
            nome: pilota.nome,
            scuderia: pilota.scuderia,
            puntiUltimaGara: pilota.punti - puntiPrecedenti,
            puntiTotali: pilota.punti,
        };
    });

    return differenze;
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
    const maxPunteggio = 193.2;

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
    const maxGara = Math.max(...gare.map(g => g.numeroGara));
    const classificaUltima = generaClassificaPiloti(gare, maxGara);
    const classificaPenultima = generaClassificaPiloti(gare, maxGara - 1);

    // Calcolo punteggio omni per entrambe
    const classificaOmniUltima = generaClassificaOmnicomprensiva(classificaUltima);
    const classificaOmniPenultima = generaClassificaOmnicomprensiva(classificaPenultima);

    // Mappa per facile accesso
    const penultimaMap = Object.fromEntries(classificaPenultima.map(p => [p.nome, p]));
    const penultimaOmniMap = Object.fromEntries(classificaOmniPenultima.map(o => [o.nome, o]));

    // Unisci e calcola differenze
    let classifica = classificaUltima.map(p => {
        const pPenultima = penultimaMap[p.nome] || { punti: 0 };
        const omniUltima = classificaOmniUltima.find(o => o.nome === p.nome) || { punteggioOmni: 0 };
        const omniPenultima = penultimaOmniMap[p.nome] || { punteggioOmni: 0 };

        return {
            ...p,
            punteggioOmni: omniUltima.punteggioOmni,
            diffPunti: p.punti - pPenultima.punti,
            diffPunteggioOmni: omniUltima.punteggioOmni - omniPenultima.punteggioOmni,
        };
    });

    const container = document.getElementById(containerId);

    let sortKey = 'punti'; // default sort by points
    let sortAsc = false; // default descending order

    // Funzione per colore rosso→bianco→verde
    function colorScale(value, modalita = "verde") {
        if (value < 0) value = 0;
        if (value > 1) value = 1;

        if (value <= 0.5) {
            const ratio = value / 0.5;
            const r = 255;
            const g = Math.round(255 * ratio);
            const b = Math.round(255 * ratio);
            return `rgb(${r},${g},${b})`; // rosso → bianco
        } else {
            const ratio = (value - 0.5) / 0.5;
            const r = Math.round(255 * (1 - ratio));
            const g = Math.round(255 - (127 * ratio)); // controlla il bianco → verde/blu
            let b;
            if (modalita === "verde") {
                b = Math.round(255 * (1 - ratio)); // bianco → verde
            } else if (modalita === "blu") {
                b = Math.round(255 * ratio); // bianco → blu
            } else {
                b = Math.round(255 * (1 - ratio)); // default fallback
            }
            return `rgb(${r},${g},${b})`;
        }
    }


    function renderTable() {
        // Ordina la classifica
        classifica.sort((a, b) => {
            let valA = a[sortKey];
            let valB = b[sortKey];

            if (sortKey === 'tempoMedioQualifica') {
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

        function creaScaler(data, key, inverti = false) {
            const valori = data.map(d => d[key]).filter(v => typeof v === 'number' && !isNaN(v));
            const min = Math.min(...valori);
            const max = Math.max(...valori);
            return function (val) {
                if (max === min) return 0;
                let norm = (val - min) / (max - min);
                return inverti ? 1 - norm : norm;
            };
        }

        const normalizzaPunti = creaScaler(classifica, 'punti');
        const normalizzaPunteggioOmni = creaScaler(classifica, 'punteggioOmni');
        const normalizzaPosizioneMediaFinale = creaScaler(
            classifica.map(p => ({ ...p, posizioneMediaFinale: parseFloat(p.posizioneMediaFinale) })),
            'posizioneMediaFinale',
            true
        );
        const normalizzaPosizioneMediaQualifica = creaScaler(
            classifica.map(p => ({ ...p, posizioneMediaQualifica: parseFloat(p.posizioneMediaQualifica) })),
            'posizioneMediaQualifica',
            true
        );
        const normalizzaTempoMedioQualifica = creaScaler(
            classifica.map(p => ({
                ...p,
                tempoMedioQualifica: tempoStrToSec(p.tempoMedioQualifica)
            })),
            'tempoMedioQualifica',
            true
        );
        const normalizzaQ3 = creaScaler(classifica, 'q3Count');
        const normalizzaQ2 = creaScaler(classifica, 'q2Count');
        const normalizzaPodi = creaScaler(classifica, 'podi');
        const normalizzaprimeFile = creaScaler(classifica, 'primeFileCount');
        const normalizzaGiriVeloci = creaScaler(classifica, 'giriVelociCount');
        const normalizzaDriverDay = creaScaler(classifica, 'driverDayCount');
        const normalizzaDNF = creaScaler(classifica, 'dnfCount', true);

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
    const colorePosizione = colorScale(1 - i / (classifica.length - 1), "blu");
    const colori = pilotiColori[p.nome] || ["transparent", "transparent"];
    const colorePunti = colorScale(normalizzaPunti(p.punti));
    const colorePunteggioOmni = colorScale(normalizzaPunteggioOmni(p.punteggioOmni));
    const colorePosizioneMediaFinale = colorScale(normalizzaPosizioneMediaFinale(p.posizioneMediaFinale));
    const colorePosizioneMediaQualifica = colorScale(normalizzaPosizioneMediaQualifica(p.posizioneMediaQualifica));
    const coloreTempoMedioQualifica = colorScale(normalizzaTempoMedioQualifica(p.tempoMedioQualifica === '-' ? 0 : tempoStrToSec(p.tempoMedioQualifica)));
    const coloreQ3 = colorScale(normalizzaQ3(p.q3Count));
    const coloreQ2 = colorScale(normalizzaQ2(p.q2Count));
    const colorePodi = colorScale(normalizzaPodi(p.podi));
    const colorePrimeFile = colorScale(normalizzaprimeFile(p.primeFileCount));
    const coloreGiriVeloci = colorScale(normalizzaGiriVeloci(p.giriVelociCount));
    const coloreDriverDay = colorScale(normalizzaDriverDay(p.driverDayCount));
    const coloreDNF = colorScale(normalizzaDNF(p.dnfCount));

    // Calcolo differenze rispetto al pilota sopra (se esiste)
    const diffPunti = i > 0 ? p.punti - classifica[i - 1].punti : 0;
    const diffOmni = p.diffPunteggioOmni || 0;

const formatDiff = (diff, isPunti = false) => {
  if (diff === 0) return isPunti ? '+0' : '+0.0';
  if (diff > 0) return isPunti ? `+${Math.round(diff)}` : `+${diff.toFixed(1)}`;
  return isPunti ? `${Math.round(diff)}` : diff.toFixed(1);
};


function arrow(diff) {
    if (diff > 0) return ' <span style="color: green;">&#9650;</span>'; // freccia su verde
    if (diff < 0) return ' <span style="color: red;">&#9660;</span>';   // freccia giù rossa
    return '';
}


html += `<tr>
    <td style="box-shadow: inset 0 0 10px ${colorePosizione};">${i + 1}</td>
    <td style="box-shadow: inset -5px -5px 8px ${colori[1]}, inset 5px 5px 8px ${colori[0]};">${p.nome}</td>
    <td style="box-shadow: inset 0 0 10px ${colorePunti};">
        ${p.punti} <span style="font-size: smaller; color: gray;">${formatDiff(p.diffPunti, true)}</span>
    </td>
    <td style="box-shadow: inset 0 0 10px ${colorePunteggioOmni};">
        ${p.punteggioOmni.toFixed(2)} <span style="font-size: smaller; color: gray;">${formatDiff(diffOmni)}${arrow(diffOmni)}</span>
    </td>
    <td style="box-shadow: inset 0 0 10px ${colorePosizioneMediaFinale};">${p.posizioneMediaFinale}</td>
    <td style="box-shadow: inset 0 0 10px ${colorePosizioneMediaQualifica};">${p.posizioneMediaQualifica}</td>
    <td style="box-shadow: inset 0 0 10px ${coloreTempoMedioQualifica};">${p.tempoMedioQualifica}</td>
    <td style="box-shadow: inset 0 0 10px ${coloreQ3};">${p.q3Count}</td>
    <td style="box-shadow: inset 0 0 10px ${coloreQ2};">${p.q2Count}</td>
    <td style="box-shadow: inset 0 0 10px ${colorePodi};">${p.podi}</td>
    <td style="box-shadow: inset 0 0 10px ${colorePrimeFile};">${p.primeFileCount}</td>
    <td style="box-shadow: inset 0 0 10px ${coloreGiriVeloci};">${p.giriVelociCount}</td>
    <td style="box-shadow: inset 0 0 10px ${coloreDriverDay};">${p.driverDayCount}</td>
    <td style="box-shadow: inset 0 0 10px ${coloreDNF};">${p.dnfCount}</td>
</tr>`;

});


        html += `</tbody>
    <tfoot>
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
    </tfoot>
    </table>`;

        container.innerHTML = `<div class="tabella-scroll-wrapper">${html}</div>`;

        const headers = container.querySelectorAll('th[data-key]');
        const ordDecrescenteIniziale = new Set(['punti', 'punteggioOmni', 'podi', 'giriVelociCount', 'primeFileCount', 'q3Count', 'q2Count', 'driverDayCount']);
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
    const maxPunteggio = 92;

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

    let sortKey = 'punti';
    let sortAsc = false;

    // Funzione colore rosso→bianco→verde
    function colorScale(value, modalita = "verde") {
        if (value < 0) value = 0;
        if (value > 1) value = 1;

        if (value <= 0.5) {
            const ratio = value / 0.5;
            const r = 255;
            const g = Math.round(255 * ratio);
            const b = Math.round(255 * ratio);
            return `rgb(${r},${g},${b})`; // rosso → bianco
        } else {
            const ratio = (value - 0.5) / 0.5;
            const r = Math.round(255 * (1 - ratio));
            const g = Math.round(255 - (127 * ratio)); // controlla il bianco → verde/blu
            let b;
            if (modalita === "verde") {
                b = Math.round(255 * (1 - ratio)); // bianco → verde
            } else if (modalita === "blu") {
                b = Math.round(255 * ratio); // bianco → blu
            } else {
                b = Math.round(255 * (1 - ratio)); // default fallback
            }
            return `rgb(${r},${g},${b})`;
        }
    }

    function creaScaler(data, key, inverti = false) {
        const valori = data
            .map(d => parseFloat(d[key]))
            .filter(v => typeof v === 'number' && !isNaN(v));

        const min = Math.min(...valori);
        const max = Math.max(...valori);

        return function (val) {
            const numero = parseFloat(val);
            if (isNaN(numero) || max === min) return 0;
            let norm = (numero - min) / (max - min);
            return inverti ? 1 - norm : norm;
        };
    }


    function renderTable() {
        classifica.sort((a, b) => {
            let valA = a[sortKey];
            let valB = b[sortKey];

            if (sortKey === 'tempoMedioQualifica') {
                valA = tempoStrToSec(valA);
                valB = tempoStrToSec(valB);
            } else {
                valA = parseFloat(valA) || 0;
                valB = parseFloat(valB) || 0;
            }

            return sortAsc ? valA - valB : valB - valA;
        });

        // Normalizzatori per colonne
        const normPunti = creaScaler(classifica, 'punti');
        const normPunteggioOmni = creaScaler(classifica, 'punteggioOmni');
        const normPosMediaGara = creaScaler(classifica, 'posizioneMediaFinale', true);
        const normPosMediaQualifica = creaScaler(classifica, 'posizioneMediaQualifica', true);
        const normTempoQualifica = creaScaler(classifica.map(s => ({ ...s, tempoMedioQualifica: tempoStrToSec(s.tempoMedioQualifica) })), 'tempoMedioQualifica', true);
        const normQ3 = creaScaler(classifica, 'q3Count');
        const normQ2 = creaScaler(classifica, 'q2Count');
        const normPodi = creaScaler(classifica, 'podi');
        const normPrimeFile = creaScaler(classifica, 'primeFileCount');
        const normGiriVeloci = creaScaler(classifica, 'giriVelociCount');
        const normDriverDay = creaScaler(classifica, 'driverDayCount');
        const normDNF = creaScaler(classifica, 'dnfCount', true);

        let html = `<table class="tabella-classifica">
        <thead>
            <tr>
                <th data-key="#">Pos</th>
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

        classifica.forEach((s, i) => {
            const colorePosizione = colorScale(1 - i / (classifica.length - 1), "blu");
            const colori = scuderiaColori[s.scuderia] || ["transparent", "transparent"];
            html += `<tr>
                    <td style="box-shadow: inset 0 0 10px ${colorePosizione};">${i + 1}</td>
                <td style="box-shadow: inset -5px -5px 10px ${colori[1]}, inset 5px 5px 10px ${colori[0]};">${s.scuderia}</td>
                <td style="box-shadow: inset 0 0 10px ${colorScale(normPunti(s.punti))};">${s.punti}</td>
                <td style="box-shadow: inset 0 0 10px ${colorScale(normPunteggioOmni(s.punteggioOmni))};">${s.punteggioOmni.toFixed(2)}</td>
                <td style="box-shadow: inset 0 0 10px ${colorScale(normPosMediaGara(s.posizioneMediaFinale))};">${s.posizioneMediaFinale}</td>
                <td style="box-shadow: inset 0 0 10px ${colorScale(normPosMediaQualifica(s.posizioneMediaQualifica))};">${s.posizioneMediaQualifica}</td>
                <td style="box-shadow: inset 0 0 10px ${colorScale(normTempoQualifica(tempoStrToSec(s.tempoMedioQualifica)))};">${s.tempoMedioQualifica}</td>
                <td style="box-shadow: inset 0 0 10px ${colorScale(normQ3(s.q3Count))};">${s.q3Count}</td>
                <td style="box-shadow: inset 0 0 10px ${colorScale(normQ2(s.q2Count))};">${s.q2Count}</td>
                <td style="box-shadow: inset 0 0 10px ${colorScale(normPodi(s.podi))};">${s.podi}</td>
                <td style="box-shadow: inset 0 0 10px ${colorScale(normPrimeFile(s.primeFileCount))};">${s.primeFileCount}</td>
                <td style="box-shadow: inset 0 0 10px ${colorScale(normGiriVeloci(s.giriVelociCount))};">${s.giriVelociCount}</td>
                <td style="box-shadow: inset 0 0 10px ${colorScale(normDriverDay(s.driverDayCount))};">${s.driverDayCount}</td>
                <td style="box-shadow: inset 0 0 10px ${colorScale(normDNF(s.dnfCount))};">${s.dnfCount}</td>
            </tr>`;
        });

        html += `</tbody></table>`;
        container.innerHTML = `<div class="tabella-scroll-wrapper" style="margin-top:20px;">${html}</div>`;

        const headers = container.querySelectorAll('th[data-key]');
        const ordDecrescenteIniziale = new Set(['punti', 'punteggioOmni', 'podi', 'giriVelociCount', 'primeFileCount', 'q3Count', 'q2Count', 'driverDayCount']);
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