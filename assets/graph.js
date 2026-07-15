/* Corpus knowledge graph — "Archive" theme.
   Refined, subtle rendering: muted warm hubs, thin citation lines,
   serif hub labels, unlabelled spokes (title-on-hover), physics off once settled.
   Reads Material's active colour scheme so it re-themes on the light/dark toggle.
   Data is regenerated from the real corpus at every build (hooks/corpus_graph.py). */
(function () {
  var GROUP_COLORS = {
    "ai-engineering":       "#5a7a5a",
    "data-engineering":     "#c08a3a",
    "mlops":                "#b06a34",
    "software-engineering": "#6a7d9c",
    "ai-business":          "#a89228",
    "blockchain":           "#8a7aa8",
    "productivity":         "#7a9a5a",
    "trading":              "#4f8a7c"
  };

  function tokens() {
    var scheme = document.body.getAttribute("data-md-color-scheme");
    var dark = scheme === "slate";
    return {
      dark: dark,
      surface: dark ? "#232019" : "#fbf8f0",
      ink:     dark ? "#ece5d6" : "#2b2820",
      inkFaint:dark ? "#8a8272" : "#98917f",
      edge:    dark ? "rgba(179,171,154,0.16)" : "rgba(120,112,96,0.20)",
      accent:  "#a9762a"
    };
  }

  function render() {
    var el = document.getElementById("corpus-graph");
    if (!el || typeof vis === "undefined") return;

    var t = tokens();
    // Re-render if the theme changed since the last draw.
    if (el.dataset.rendered === "1" && el.dataset.scheme === (t.dark ? "slate" : "default")) return;
    el.innerHTML = "";
    el.dataset.rendered = "1";
    el.dataset.scheme = t.dark ? "slate" : "default";

    fetch("assets/graph-data.json")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        data.nodes.forEach(function (n) {
          var c = GROUP_COLORS[n.group] || t.inkFaint;
          n.color = { background: c, border: c, highlight: { background: c, border: t.accent }, hover: { background: c, border: t.accent } };
          n.shape = "dot";
          n.title = n.label;
          if (n.hub) {
            n.value = 46;
            n.label = n.label.replace(/\b\w/g, function (m) { return m.toUpperCase(); });
            n.font = { size: 19, face: "Newsreader, Georgia, serif", color: t.ink, strokeWidth: 6, strokeColor: t.surface };
            n.borderWidth = 0;
          } else {
            n.value = 6;
            n.label = undefined;
            n.borderWidth = 0;
          }
        });
        var nodes = new vis.DataSet(data.nodes);
        var edges = new vis.DataSet(data.edges.map(function (e) {
          return { from: e.from, to: e.to, color: { color: t.edge, highlight: t.accent, hover: t.accent } };
        }));
        var network = new vis.Network(el, { nodes: nodes, edges: edges }, {
          nodes: { scaling: { min: 6, max: 46 } },
          edges: { smooth: { type: "continuous" }, width: 0.5, selectionWidth: 1 },
          physics: {
            barnesHut: { gravitationalConstant: -3600, springLength: 155, springConstant: 0.02, damping: 0.5, avoidOverlap: 0.3 },
            stabilization: { iterations: 200 }
          },
          interaction: { hover: true, tooltipDelay: 120, hideEdgesOnDrag: true },
          layout: { improvedLayout: false }
        });
        network.once("stabilizationIterationsDone", function () { network.setOptions({ physics: false }); });
      })
      .catch(function () {});
  }

  if (typeof document$ !== "undefined" && document$.subscribe) {
    document$.subscribe(render);
  } else {
    document.addEventListener("DOMContentLoaded", render);
  }
})();
