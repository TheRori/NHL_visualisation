// public/scripts/main.js

// Fonction pour charger les données et créer les deux graphiques
fetch('/api/players')
    .then(response => response.json())
    .then(data => {
        createStackedBarGraph(data);
        createScatterPlot(data);
        createBubblePlot(data);
    })
    .catch(error => console.error('Erreur lors de la récupération des données:', error));

// Fonction pour créer le scatter plot dans le conteneur #scatter-plot
function createScatterPlot(data) {
    const margin = { top: 20, right: 30, bottom: 70, left: 70 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#scatter-plot") // Utilisation correcte de #scatter-plot
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select("#tooltip");

    // Échelle pour l'axe X (minutes de jeu)
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.timeOnIcePerGame)])
        .nice()
        .range([0, width]);

    // Échelle pour l'axe Y (points)
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.points)])
        .nice()
        .range([height, 0]);

    // Ajouter les axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d => d + " min"));

    svg.append("g")
        .call(d3.axisLeft(y).ticks(5));

    // Ajout des points pour chaque joueur
    svg.append("g")
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => x(d.timeOnIcePerGame))
        .attr("cy", d => y(d.points))
        .attr("r", 5)
        .attr("fill", "#1f77b4")
        .on("mouseover", function(event, d) {
            tooltip.style("visibility", "visible")
                .text(`${d.fullName}: ${d.timeOnIcePerGame.toFixed(2)} min, ${d.points} points`);
        })
        .on("mousemove", function(event) {
            tooltip.style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
        });

    // Ajout des labels pour les axes
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 20)
        .attr("text-anchor", "middle")
        .text("Minutes de Jeu par Match");

    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Points");
}

// Fonction pour créer le bar chart empilé dans le conteneur #stacked-bar-chart
function createStackedBarGraph(data) {
    const margin = { top: 20, right: 30, bottom: 70, left: 100 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#stacked-bar-chart") // Utilisation correcte de #stacked-bar-chart
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select("#tooltip");

    // Initialisation des échelles
    const x = d3.scaleBand().range([0, width]).padding(0.1);
    const y = d3.scaleLinear().range([height, 0]);

    // Ajouter les axes
    const xAxisGroup = svg.append("g")
        .attr("transform", `translate(0,${height})`);
    const yAxisGroup = svg.append("g");

    // Fonction de mise à jour du graphique
    function updateChart(segment1, segment2) {
        // Préparation des données pour l'empilement avec les segments sélectionnés
        const stack = d3.stack().keys([segment1, segment2]);
        const series = stack(data);

        // Mise à jour des domaines des échelles
        x.domain(data.map(d => d.fullName));
        y.domain([0, d3.max(data, d => d[segment1] + d[segment2])]).nice();

        // Mise à jour des barres empilées
        svg.selectAll("g.layer").remove(); // Supprimer les couches existantes

        const layers = svg.selectAll("g.layer")
            .data(series)
            .join("g")
            .classed("layer", true)
            .attr("fill", d => d.key === segment1 ? '#1f77b4' : '#ff7f0e'); // Bleu pour le segment 1, orange pour le segment 2

        layers.selectAll("rect")
            .data(d => d)
            .join("rect")
            .attr("x", d => x(d.data.fullName))
            .attr("width", x.bandwidth())
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]))
            .on("mouseover", function(event, d) {
                tooltip.style("visibility", "visible")
                    .text(`${d.data.fullName}: ${d3.select(this.parentNode).datum().key} = ${d[1] - d[0]}`);
            })
            .on("mousemove", function(event) {
                tooltip.style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("visibility", "hidden");
            });

        // Mise à jour des axes
        xAxisGroup.call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        yAxisGroup.call(d3.axisLeft(y));
    }

    // Écouteurs d'événements pour les sélections de segment
    d3.select("#segment1").on("change", function() {
        const segment1 = this.value;
        const segment2 = d3.select("#segment2").node().value;
        updateChart(segment1, segment2);
    });

    d3.select("#segment2").on("change", function() {
        const segment1 = d3.select("#segment1").node().value;
        const segment2 = this.value;
        updateChart(segment1, segment2);
    });

    // Variables par défaut et premier affichage
    const initialSegment1 = d3.select("#segment1").node().value;
    const initialSegment2 = d3.select("#segment2").node().value;
    updateChart(initialSegment1, initialSegment2);
}

// Fonction pour créer le bubble plot
function createBubblePlot(data) {
    const margin = { top: 20, right: 30, bottom: 70, left: 70 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#bubble-plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select("#tooltip");

    // Échelle pour l'axe X (minutes de jeu)
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.timeOnIcePerGame)])
        .nice()
        .range([0, width]);

    // Échelle pour l'axe Y (points)
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.points)])
        .nice()
        .range([height, 0]);

    // Échelle pour la taille des bulles (goals)
    const radius = d3.scaleSqrt() // Utilisation d'une échelle racine carrée pour mieux gérer les tailles
        .domain([0, d3.max(data, d => d.goals)])
        .range([5, 30]); // Les bulles auront des rayons entre 5 et 30

    // Ajouter les axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d => d + " min"));

    svg.append("g")
        .call(d3.axisLeft(y).ticks(5));

    // Ajouter les bulles pour chaque joueur
    svg.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => x(d.timeOnIcePerGame))
        .attr("cy", d => y(d.points))
        .attr("r", d => radius(d.goals)) // Taille de la bulle selon le nombre de buts
        .attr("fill", "#69b3a2")
        .attr("opacity", 0.7)
        .on("mouseover", function(event, d) {
            tooltip.style("visibility", "visible")
                .text(`${d.fullName}: ${d.timeOnIcePerGame.toFixed(2)} min, ${d.points} points, ${d.goals} goals`);
        })
        .on("mousemove", function(event) {
            tooltip.style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
        });

    // Ajout des labels pour les axes
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 20)
        .attr("text-anchor", "middle")
        .text("Minutes de Jeu par Match");

    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Points");
}
