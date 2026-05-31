(() => {
  const root = document.documentElement;
  const scale = (0.9 + Math.random() * 0.45).toFixed(2);
  const gap = `${Math.round(12 + Math.random() * 15)}px`;
  const opacity = (0.12 + Math.random() * 0.16).toFixed(2);

  root.style.setProperty("--topo-scale", scale);
  root.style.setProperty("--topo-gap", gap);
  root.style.setProperty("--topo-opacity", opacity);
})();
