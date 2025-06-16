document.addEventListener("DOMContentLoaded", () => {
    const navButtons = document.getElementById("nav-buttons");
    const main = document.getElementById("main-content");
    const menuToggle = document.getElementById("menu-toggle");

    // Funzioni placeholder
    function mostraMessaggio(nome) {
        const p = document.createElement("p");
        p.textContent = `Hai cliccato su "${nome}" – Funzione in costruzione.`;
        main.appendChild(p);
    }

    // Funzioni vere che vuoi chiamare
    function generaClassificaPiloti() {
        main.innerHTML = "<h2>Classifica Piloti</h2>";
        // qui chiami la tua funzione per piloti, ad es. mostraClassificaPiloti() o simile
        // esempio: mostraClassificaPiloti();
    }

    function generaClassificaScuderie() {
        main.innerHTML = "<h2>Classifica Scuderie</h2>";
        // qui chiami la tua funzione per scuderie
        // esempio: mostraClassificaScuderie();
    }

    // Pulsanti da creare, "Classifiche" avrà sotto-menu
    const buttons = [
        { label: "Crea Gara", action: creaFormGara },
        {
            label: "Classifiche",
            action: null, // non fa nulla al click perché ha un dropdown
            dropdown: [
                { label: "Piloti", action: mostraClassificaPilotiSingola },
                { label: "Scuderie", action: mostraClassificaScuderieSingola }
            ]
        },
        { label: "Piloti", action: () => mostraMessaggio("Piloti") },
        { label: "Scuderie", action: () => mostraMessaggio("Scuderie") },
        { label: "Gare", action: mostraMenuGare }
    ];

    function clearMainAndRun(fn) {
        main.innerHTML = "";
        fn();
        navButtons.classList.remove("show"); // Chiudi menu hamburger
    }

    buttons.forEach(({ label, action, dropdown }) => {
        const btn = document.createElement("button");
        btn.textContent = label;
        btn.classList.add("nav-button");

        if (dropdown && Array.isArray(dropdown)) {
            // Crea contenitore dropdown
            btn.classList.add("has-dropdown");
            const dropdownMenu = document.createElement("div");
            dropdownMenu.classList.add("dropdown-menu", "hidden");

            dropdown.forEach(item => {
                const subBtn = document.createElement("button");
                subBtn.textContent = item.label;
                subBtn.classList.add("dropdown-item");
                subBtn.addEventListener("click", () => {
                    clearMainAndRun(item.action); // chiude anche l’hamburger
                    dropdownMenu.classList.add("hidden");
                });
                dropdownMenu.appendChild(subBtn);
            });

            btn.addEventListener("click", (e) => {
                e.stopPropagation(); // evita che il click chiuda subito il menu
                // toggle dropdown
                dropdownMenu.classList.toggle("hidden");
            });

            // Aggiungo il dropdown dopo il bottone
            navButtons.appendChild(btn);
            navButtons.appendChild(dropdownMenu);

            // Chiudo dropdown cliccando fuori
            document.addEventListener("click", () => {
                dropdownMenu.classList.add("hidden");
            });

        } else {
            btn.addEventListener("click", () => {
                clearMainAndRun(action);
            });
            navButtons.appendChild(btn);
        }
    });

    // Menu hamburger toggle
    menuToggle.addEventListener("click", () => {
        navButtons.classList.toggle("show");
    });

    // Chiudi hamburger cliccando fuori
    document.addEventListener("click", (e) => {
        const isClickInsideMenu = navButtons.contains(e.target);
        const isClickOnToggle = menuToggle.contains(e.target);
        if (!isClickInsideMenu && !isClickOnToggle) {
            navButtons.classList.remove("show");
        }
    });

});
