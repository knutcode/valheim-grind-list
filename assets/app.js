// Shared checklist engine. Each page sets window.GRIND_DATA and window.GRIND_KEY
// before loading this file.
(function () {
  const DATA = window.GRIND_DATA || [];
  const KEY = window.GRIND_KEY;

  let state = {};
  try { state = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { state = {}; }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  const stepsEl = document.getElementById("steps");

  function render() {
    stepsEl.innerHTML = "";
    let total = 0, totalDone = 0;

    DATA.forEach((step, si) => {
      const doneCount = step.items.filter((_, ii) => state[si + "-" + ii]).length;
      total += step.items.length;
      totalDone += doneCount;
      const allDone = doneCount === step.items.length;

      const stepDiv = document.createElement("div");
      stepDiv.className = "step" + (allDone ? " done" : "");
      if (state["open-" + si] !== false && !allDone) stepDiv.classList.add("open");
      if (state["open-" + si] === true) stepDiv.classList.add("open");

      const header = document.createElement("div");
      header.className = "step-header";
      header.innerHTML =
        '<div class="step-num">' + (allDone ? "&#10003;" : (si + 1)) + "</div>" +
        '<div class="step-title">' + step.title + "</div>" +
        '<div class="step-count">' + doneCount + " / " + step.items.length + "</div>" +
        '<div class="chevron">&#9654;</div>';
      header.onclick = () => {
        const isOpen = stepDiv.classList.contains("open");
        state["open-" + si] = !isOpen;
        save();
        render();
      };
      stepDiv.appendChild(header);

      const body = document.createElement("div");
      body.className = "step-body";

      step.items.forEach((item, ii) => {
        const key = si + "-" + ii;
        const checked = !!state[key];
        const row = document.createElement("label");
        row.className = "item" + (checked ? " checked" : "");

        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = checked;
        cb.onchange = () => {
          state[key] = cb.checked;
          save();
          render();
        };
        row.appendChild(cb);

        const txt = document.createElement("div");
        let html = '<span class="item-text">' + item.t;
        if (item.tag) html += '<span class="tag ' + item.tag + '">' + item.tag + "</span>";
        html += "</span>";
        if (item.n) html += '<span class="item-note">' + item.n + "</span>";
        txt.innerHTML = html;
        row.appendChild(txt);

        body.appendChild(row);
      });

      stepDiv.appendChild(body);
      stepsEl.appendChild(stepDiv);
    });

    document.getElementById("totalCount").textContent = totalDone + " / " + total;
    document.getElementById("totalFill").style.width = (total ? (totalDone / total) * 100 : 0) + "%";
  }

  document.getElementById("resetBtn").onclick = () => {
    if (confirm("Reset all progress?")) {
      state = {};
      save();
      render();
    }
  };

  render();
})();
