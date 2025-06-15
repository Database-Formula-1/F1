document.addEventListener("DOMContentLoaded", () => {
    const navButtons = document.getElementById("nav-buttons");
    const main = document.getElementById("main-content");
    const menuToggle = document.getElementById("menu-toggle");

    // Pulsanti da creare
    const buttons = [
        { label: "Crea Gara", action: creaFormGara },
        { label: "Classifiche", action: mostraClassifiche },
        { label: "Piloti", action: () => mostraMessaggio("Piloti") },
        { label: "Scuderie", action: () => mostraMessaggio("Scuderie") },
        { label: "Gare", action: () => mostraMessaggio("Gare") },
        { label: "Anno", action: mostraMenuGare }
    ];

    // Crea dinamicamente i pulsanti
    buttons.forEach(({ label, action }) => {
        const btn = document.createElement("button");
        btn.textContent = label;
        btn.addEventListener("click", () => {
            main.innerHTML = "";
            action();
        });
        navButtons.appendChild(btn);
    });

    // Menu hamburger toggle
    menuToggle.addEventListener("click", () => {
        navButtons.classList.toggle("show");
    });

    // Placeholder
    function mostraMessaggio(nome) {
        const p = document.createElement("p");
        p.textContent = `Hai cliccato su "${nome}" – Funzione in costruzione.`;
        main.appendChild(p);
    }

    // Funzione vuota temporanea per "Crea Gara"
    function mostraCreaGara() {
        const div = document.createElement("div");
        div.textContent = "Qui verrà il form per creare una gara 🚦";
        main.appendChild(div);
    }
});
