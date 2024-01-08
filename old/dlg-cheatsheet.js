(async () => {
    const evidences = Object.freeze({
        EMF: 0,
        ESG: 1,
        EASEL: 2,
        ECTOPLASM: 3,
        SPIRIT_BOX: 4,
        FINGERPRINTS: 5,
        FREEZING: 6,
    });

    const info = await fetch('./information.json').then(res => res.json());

    const evidence_statuses = Object.fromEntries(Object.entries(evidences).map(([key, value]) => [key, 0]));

    const table = document.querySelector('table');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');

    const evidence_ghost_map = Array.from({ length: Object.keys(evidences).length }, () => new Set());
    for (const [ghost_name, ghost] of Object.entries(info)) {
        const { evidences: evidence } = ghost;
        evidence.forEach(evidence_num => evidence_ghost_map[evidence_num].add(ghost_name));
        thead.querySelector('tr').appendChild(document.createElement('th')).innerText = ghost_name;
    }

    const ghost_names = Object.keys(info);

    const ghost_amount = Object.keys(info).length;
    for (const evidence_id in evidence_ghost_map) {
        const tr = document.createElement('tr');
        const tds = Array.from({ length: ghost_amount + 1 }, () => document.createElement('td'));
        tds[0].innerText = Object.keys(evidences)[evidence_id];
        for (const ghost_name of ghost_names) {
            if (evidence_ghost_map[evidence_id].has(ghost_name)) {
                tds[ghost_names.indexOf(ghost_name) + 1].innerText = 'X';
            }
        }
        tr.append(...tds);
        tbody.appendChild(tr);
    }
    // on click on evidence, highlight the row, ghosts who dont have that evidence should by greyed out
    tbody.querySelectorAll('tr').forEach(tr => {
        tr.addEventListener('click', () => {
            const evidence_name = tr.querySelector('td').innerText;

            if (tr.classList.contains('include')) {
                tr.classList.remove('include');
                tr.classList.add('exclude');
                evidence_statuses[evidence_name] = 2;
            } else if (tr.classList.contains('exclude')) {
                tr.classList.remove('exclude');
                evidence_statuses[evidence_name] = 0;
            } else {
                tr.classList.add('include');
                evidence_statuses[evidence_name] = 1;
            }
            draw_table_status();
        });
    });

    function draw_table_status() {
        thead.querySelectorAll('th:not(:first-child)').forEach(th => { th.classList.remove('exclude', 'hide'); });
        const rows = [...tbody.querySelectorAll('tr')];
        const ths = [...thead.querySelectorAll('th')];

        for (const evidence_name in evidence_statuses) {
            const state = evidence_statuses[evidence_name];
            if (state === 0) continue;

            const row = rows.find(row => row.querySelector('td').innerText === evidence_name);
            const row_tds = [...row.querySelectorAll('td')];
            for (const idx in row_tds) {
                if (idx === '0') continue;

                const td = row_tds[idx];
                if (state === 1) {
                    if (td.innerText !== 'X') {
                        const matching_th = ths[idx];
                        if (matching_th.classList.contains('include')) continue

                        matching_th.classList.add('exclude', 'hide');
                    }
                } else if (state === 2) {
                    if (td.innerText === 'X') {
                        const matching_th = ths[idx];
                        if (matching_th.classList.contains('include')) continue

                        matching_th.classList.add('exclude', 'hide');
                    }
                }
            }
        }
    }
})();