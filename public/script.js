const socket = io();

let team1, team2;
let currentStep = 0;
let mapIconCounter = 0; // Counter for top row map icons
const instructions = [
    "1팀: 밴할 맵을 선택해주세요.",
    "2팀: 밴할 맵을 선택해주세요.",
    "1팀: 첫번째 맵을 선택해주세요.",
    "2팀: 버튼으로 첫번째 맵에서 시작할 사이드를 선택해주세요. (공격/수비)",
    "2팀: 두번째 맵을 선택해주세요.",
    "1팀: 버튼으로 두번째 맵에서 시작할 사이드를 선택해주세요. (공격/수비)",
    "1팀: 밴할 맵을 선택해주세요.",
    "2팀: 밴할 맵을 선택해주세요.",
    "디사이더 맵을 클릭해주세요.",
    "버튼으로 디사이더 맵에서 시작할 사이드를 선택해주세요. (공격/수비)",
    "맵 밴/픽이 완료되었습니다."
];

const mapContainer = document.getElementById('map-container');
const sideSelectionContainer = document.getElementById('side-selection-container');

const banSound = document.getElementById('ban-sound');
const pickSound = document.getElementById('pick-sound');
const middleSound = document.getElementById('middle-sound');

banSound.volume = 0.1;
pickSound.volume = 0.1;
middleSound.volume = 0.1;

function assignTeams() {
    team1 = document.getElementById("team1-name").value;
    team2 = document.getElementById("team2-name").value;
    if (team1 && team2) {
        socket.emit('assignTeams', { team1, team2 });
    } else {
        alert("Please enter both team names");
    }
}

socket.on('updateTeams', (data) => {
    team1 = data.team1;
    team2 = data.team2;
    document.getElementById("assign-teams").style.display = 'none';
    document.getElementById("map-selection").style.display = 'block';
    updateInstruction();
});

function selectMap(element) {
    if (!mapContainer.classList.contains('disabled')) {
        let action = (currentStep === 2 || currentStep === 4) ? 'picked' : 'banned';
        let team;
        if (currentStep === 0 || currentStep === 2 || currentStep === 6) {
            team = team1; // Team 1 picks first map
        } else if (currentStep === 1 || currentStep === 4 || currentStep === 7) {
            team = team2; // Team 2 picks second map
        }
        socket.emit('selectMap', { map: element.dataset.map, action, team });
    }
}

function selectSide(side) {
    if (!sideSelectionContainer.classList.contains('disabled')) {
        let team;
        if (currentStep === 1 || currentStep === 5 || currentStep === 9) {
            team = team1; // Team 1 picks first map
        } else if (currentStep === 3) {
            team = team2; // Team 2 picks second map
        }
        socket.emit('selectSide', { side, team });
    }
}

socket.on('mapSelected', (data) => {
    const element = [...document.querySelectorAll('.map-icon')].find(el => el.dataset.map === data.map);
    if (data.action === 'picked') {
        element.classList.add('picked');
        pickSound.play();
    } else if (currentStep === 8) {
        element.classList.add('picked');
        pickSound.play();
    }
    else {
        element.classList.add('banned');
        banSound.play();
    }
    updateBottomUI(data.map, data.action, data.team);
    currentStep++;

    updateInstruction();
});

socket.on('sideSelected', (data) => {
    updateBottomUI(null, data.side, data.team);
    middleSound.play();
    currentStep++;
    updateInstruction();
});

function autoSelectLastMap() {
    const remainingMap = [...document.querySelectorAll('.map-icon')].find(el => !el.classList.contains('picked') && !el.classList.contains('banned'));
    if (remainingMap) {
        remainingMap.classList.add('picked');
        updateBottomUI(remainingMap.dataset.map, 'picked', 'Decider');
    }
}

function updateInstruction() {
    document.getElementById("instruction").innerText = instructions[currentStep];
    toggleContainers();
}

function toggleContainers() {
    if (currentStep === 3 || currentStep === 5 || currentStep === 9) {
        mapContainer.classList.add('disabled');
        sideSelectionContainer.classList.remove('disabled');
    } else {
        mapContainer.classList.remove('disabled');
        sideSelectionContainer.classList.add('disabled');
    }
}

function updateBottomUI(map, action, team) {
    // Update map icons in the top row
    if (map && mapIconCounter < 7) {
        const stepElement = document.getElementById(`step${mapIconCounter + 1}`);
        if (stepElement) {
            if (mapIconCounter === 6) {
                stepElement.innerText = `Decider Map: ${map}`;
                action = 'picked';
            } else {
                stepElement.innerText = `${action.charAt(0).toUpperCase() + action.slice(1)}: ${map} \n(팀: ${team})`;
            }
            stepElement.classList.add(action);
            stepElement.style.backgroundImage = `url(images/${map.toLowerCase()}.png)`; // Set background image
            mapIconCounter++;
        } else {
            console.error(`Element with ID step${mapIconCounter + 1} not found`);
        }
    }

    // Update side icons in the bottom row
    if (action && (currentStep === 3 || currentStep === 5 || currentStep === 8 || currentStep === 9)) {
        let sidePosition;
        if (currentStep === 3) {
            sidePosition = 3; // 3rd icon for the 4th step
        } else if (currentStep === 5) {
            sidePosition = 4; // 4th icon for the 6th step
        } else if (currentStep === 9) { // Change from 8 to 9 for the final step
            sidePosition = 7; // 8th icon for the final step
        }

        if (sidePosition !== undefined) {
            const stepElementNew = document.getElementById(`step${sidePosition}-new`);
            if (stepElementNew) {
                if (team) {
                    // Update side icons for other steps
                    stepElementNew.innerText = `공격/수비: ${action} \n(팀: ${team})`;
                    stepElementNew.classList.add(action);
                }
            } else {
                console.error(`Element with ID step${sidePosition}-new not found`);
            }
        }
    }
}
