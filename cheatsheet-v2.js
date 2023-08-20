document.onload = main();

const EVIDENCE_FA_CLASSES = ['fa-radiation', 'fa-bolt', 'fa-paintbrush', 'fa-splotch', 'fa-walkie-talkie', 'fa-fingerprint', 'fa-snowflake'];
const ALL_EVIDENCES = new Set(['0', '1', '2', '3', '4', '5', '6']);

async function main() {
    const ghost_infos = await get_ghost_infos();
    const ghost_template = document.getElementById('ghost-template');
    const ghosts_element = document.querySelector('.ghosts');

    for (const [ghost_name, ghost_info] of Object.entries(ghost_infos)) {
        const ghost_element = document.importNode(ghost_template.content, true).querySelector('.ghost')
        const ghost_name_element = ghost_element.querySelector('.ghost-name');
        const ghost_evidences = ghost_element.querySelectorAll('.evidence');
        const ghost_strength_element = ghost_element.querySelector('.strength');
        const ghost_weakness_element = ghost_element.querySelector('.weakness');

        ghost_name_element.textContent = ghost_name;
        ghost_element.dataset.evidences = ghost_info.evidences.join(' ');
        for (const [index, evidence] of Object.entries(ghost_info.evidences)) {
            const evidence_element = ghost_evidences[index];
            const i_tag = document.createElement('i');
            evidence_element.appendChild(i_tag);
            i_tag.classList.add('fa-solid');
            i_tag.classList.add(EVIDENCE_FA_CLASSES[evidence]);
        }
        ghost_strength_element.textContent = ghost_info.additional.secondary || 'Unknown';
        ghost_weakness_element.textContent = ghost_info.additional.weakness || 'Unknown';

        if (ghost_info.additional.description) {
            const description_sections = ghost_info.additional.description.split('. ');
            for (const section of description_sections) {
                const p_tag = document.createElement('p');
                p_tag.textContent = section;
                ghost_element.querySelector('.info').appendChild(p_tag);
            }
        } else {
            const p_tag = document.createElement('p');
            p_tag.textContent = 'We currently have no information on this ghost';
            ghost_element.querySelector('.info').appendChild(p_tag);
        }

        ghosts_element.appendChild(ghost_element);
    }

    const evidence_buttons = document.querySelectorAll('.main .evidence');
    const filter_state = {
        '0': null,
        '1': null,
        '2': null,
        '3': null,
        '4': null,
        '5': null,
        '6': null,
    };
    for (const evidence_button of evidence_buttons) {
        evidence_button.addEventListener('click', () => {
            const evidence = evidence_button.dataset.evidence;
            const ghosts = document.querySelectorAll('.ghost');
            let action = 'add';

            if (evidence_button.classList.contains('bg-green')) {
                evidence_button.classList.remove('bg-green');
                evidence_button.classList.add('bg-red');
                action = 'remove';
                filter_state[evidence] = false;
            } else if (evidence_button.classList.contains('bg-red')) {
                evidence_button.classList.remove('bg-red');
                action = 'ignore';
                filter_state[evidence] = null;
            } else {
                evidence_button.classList.add('bg-green');
                filter_state[evidence] = true;
            }

            const possible_combinations = new Set();
            for (const ghost of ghosts) {
                const ghost_evidences = ghost.dataset.evidences.split(' ');

                const non_null_states = Object.entries(filter_state).filter(([ev, state]) => state !== null);
                if (non_null_states.length === 0) {
                    for (const ev of ALL_EVIDENCES) {
                        document.querySelector(`.main .evidence[data-evidence="${ev}"]`).classList.remove('disabled');
                    }
                    ghost.classList.remove('hidden');
                    continue;
                }

                // check if the ghost has all the evidences that are true and none of the evidences that are false
                const positive_states = non_null_states.filter(([ev, state]) => state);
                const negative_states = non_null_states.filter(([ev, state]) => !state);

                const has_includes = positive_states.every(([ev, state]) => ghost_evidences.includes(ev))
                const has_excludes = negative_states.some(([ev, state]) => ghost_evidences.includes(ev));
                const hide = !has_includes || has_excludes;
                if (hide) {
                    ghost.classList.add('hidden');
                } else {
                    ghost.classList.remove('hidden');
                }

                if (!ghost.classList.contains('hidden')) {
                    const evidences = ghost.dataset.evidences.split(' ');
                    for (const ev of evidences) {
                        possible_combinations.add(ev);
                    }
                }
            }
            for (const ev of ALL_EVIDENCES) {
                if (!possible_combinations.has(ev)) {
                    document.querySelector(`.main .evidence[data-evidence="${ev}"]`).classList.add('disabled');
                } else {
                    document.querySelector(`.main .evidence[data-evidence="${ev}"]`).classList.remove('disabled');
                }
            }
        });
    }
}

async function get_ghost_infos() {
    const response = await fetch('./information.json');
    const text = await response.text();
    const ghost_infos = JSON.parse(text);
    return ghost_infos;
}
