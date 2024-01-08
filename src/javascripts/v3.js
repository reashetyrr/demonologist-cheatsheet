const EVIDENCE_FA_CLASSES = ['fa-radiation', 'fa-bolt', 'fa-paintbrush', 'fa-splotch', 'fa-walkie-talkie', 'fa-fingerprint', 'fa-snowflake'];
const ALL_EVIDENCES = new Set(['0', '1', '2', '3', '4', '5', '6']);
const filter_state = {
    '0': null,
    '1': null,
    '2': null,
    '3': null,
    '4': null,
    '5': null,
    '6': null,
};

async function get_ghost_infos() {
    const response = await fetch('./information.json');
    const text = await response.text();
    const ghost_infos = JSON.parse(text);
    return ghost_infos;
}


const build_ghosts = (ghost_infos) => {
    const ghost_template = document.getElementById('ghost-template');
    const ghosts_element = document.getElementById('ghosts');

    for (const [ghost_name, ghost_info] of Object.entries(ghost_infos)) {
        const ghost_element = document.importNode(ghost_template.content, true).querySelector('.ghost')
        const ghost_name_element = ghost_element.querySelector('.ghost-name');
        const ghost_evidences = ghost_element.querySelectorAll('.evidence');
        const ghost_strength_element = ghost_element.querySelector('.strength');
        const ghost_weakness_element = ghost_element.querySelector('.weakness');
        const ghost_description_element = ghost_element.querySelector('.description');

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
            ghost_description_element.innerHTML = ghost_info.additional.description.split('. ').join('.<br>');
        } else {
            ghost_description_element.textContent = 'We currently have no information on this ghost';
        }
        ghosts_element.appendChild(ghost_element);
    }
}
const filter_ghosts = () => {
    const ghosts = document.querySelectorAll('.ghost');
    const possible_combinations = new Set();
    for (const ghost of ghosts) {
        const ghost_evidences = ghost.dataset.evidences.split(' ');

        const non_null_states = Object.entries(filter_state).filter(([ev, state]) => state !== null);
        if (non_null_states.length === 0) {
            for (const ev of ALL_EVIDENCES) {
                document.querySelector(`footer .evidence[data-evidence="${ev}"]`).classList.remove('disabled');
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

    if (possible_combinations.size === 0) {
        for (const ev of ALL_EVIDENCES) {
            document.querySelector(`footer .evidence[data-evidence="${ev}"]`).classList.remove('disabled');
        }
    } else {
        for (const ev of ALL_EVIDENCES) {
            if (!possible_combinations.has(ev)) {
                try {
                    document.querySelector(`footer .evidence[data-evidence="${ev}"]:not(.bg-danger)`).classList.add('disabled');
                } catch (e) {
                    // do nothing
                }
            } else {
                try {
                    document.querySelector(`footer .evidence[data-evidence="${ev}"]`).classList.remove('disabled');
                } catch (e) {
                    // do nothing
                }
            }
        }
    }
}
const handle_evidence_click = (event) => {
    let target = event.target;
    if (!target.classList.contains('evidence')) {
        target = target.closest('.evidence');
    }

    if (target.classList.contains('disabled')) {
        return;
    }

    const evidence = target.dataset.evidence;
    const evidence_state = filter_state[evidence];

    if (evidence_state === null) {
        target.classList.add('bg-success');
        target.classList.add('text-white');
        filter_state[evidence] = true;
    } else if (evidence_state) {
        target.classList.remove('bg-success');
        target.classList.add('bg-danger');
        filter_state[evidence] = false;
    } else {
        target.classList.remove('bg-danger');
        target.classList.remove('text-white');
        filter_state[evidence] = null;
    }

    filter_ghosts();
}

const set_evidence_handlers = () => {
    const footer = document.querySelector('footer');
    footer.addEventListener('click', handle_evidence_click)
    const reset_button = document.querySelector('[data-action="reset"]');
    reset_button.addEventListener('click', () => {
        const evidence_buttons = document.querySelectorAll('.evidence');
        for (const evidence_button of evidence_buttons) {
            evidence_button.classList.remove('bg-danger');
            evidence_button.classList.remove('bg-success');
            evidence_button.classList.remove('text-white');
            filter_state[evidence_button.dataset.evidence] = null;
        }
        filter_ghosts();
    });
}

const onload = async () => {
    set_evidence_handlers();
    const ghost_infos = await get_ghost_infos();
    build_ghosts(ghost_infos);
}

document.onload = onload();