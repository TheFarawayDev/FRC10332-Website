(() => {
  const root = document.documentElement;
  const scale = (0.96 + Math.random() * 0.18).toFixed(2);
  const gap = `${Math.round(32 + Math.random() * 16)}px`;
  const line = `${Math.round(1 + Math.random())}px`;
  const opacity = (0.06 + Math.random() * 0.07).toFixed(2);
  const shiftX = `${Math.round(-18 + Math.random() * 36)}px`;
  const shiftY = `${Math.round(-12 + Math.random() * 24)}px`;

  root.style.setProperty("--topo-scale", scale);
  root.style.setProperty("--topo-gap", gap);
  root.style.setProperty("--topo-line", line);
  root.style.setProperty("--topo-opacity", opacity);
  root.style.setProperty("--topo-shift-x", shiftX);
  root.style.setProperty("--topo-shift-y", shiftY);
})();
