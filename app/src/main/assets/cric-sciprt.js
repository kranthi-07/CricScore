const startMatch = document.getElementById('startMatch')
let selectingFor = null; // "your" or "opponent"
let lastCreatedTeam = null;
let originalYourTitle = "Select Your Team";
let originalOpponentTitle = "Select Opponent Team";
let selectedYourTeam = null;
let selectedOpponentTeam = null;
let creatingFor = null; // "your" or "opponent"
let userInteracted = false;
let screenStack = ["home"];
let currentScreen = "home";

function closeAllPopups() {
    document.querySelectorAll(
        "#popup, #playersPopup, #miniAddPlayerPopup, #batsmanPopup, #bowlerPopup, #quitMatchPopup, .history-popup, .runout-popup"
    ).forEach(p => {
        if (p) p.style.display = "none";
    });
}

const resumeBtn = document.getElementById("resumeMatchBtn");

function updateResumeVisibility() {
    const liveState = localStorage.getItem("liveMatchState");
    const currentMatch = localStorage.getItem("currentMatch");

    if (liveState && currentMatch) {
        resumeBtn.style.display = "inline-block";
    } else {
        resumeBtn.style.display = "none";
    }
}

updateResumeVisibility();


resumeBtn?.addEventListener("click", () => {
    vibrateTap(20);
    openScreen("liveMatch");
});



const settingsBtn = document.getElementById("settingsBtn");

settingsBtn?.addEventListener("click", () => {
    vibrateTap(15);
    document.getElementById("settingsPopup").style.display = "flex";
});

function closeSettings() {
    document.getElementById("settingsPopup").style.display = "none";
}


function showLoader(duration = 2500) {
    const loader = document.getElementById("loader");
    loader.classList.remove("loader-hidden");

    setTimeout(() => {
        loader.classList.add("loader-hidden");
    }, duration);
}


function renderScreen(id) {
    const template = document.getElementById(id);
    if (!template) return;

    appOverlayContent.innerHTML = template.innerHTML;
    appOverlay.classList.add("active");

    attachBackButton();

    if (id === "startMatchScreen") setupStartMatchScreen();
    if (id === "createTeamScreen") setupCreateTeamScreen();
    if (id === "teamsScreen") loadTeamsScreen();
    if (id === "historyScreen") loadHistoryScreen();
    if (id === "careerScreen") {
        const lastTeam = localStorage.getItem("lastCareerTeam");
        if (lastTeam) loadCareerScreen(lastTeam);
    }
    if (id === "liveMatch") {
        document.querySelector("footer").style.display = "none";
        setupLiveMatchScreen();
    }
}

function renderTeams() {
    const teamsList = document.getElementById("teamsList");
    if (!teamsList) return;

    const teams = JSON.parse(localStorage.getItem("teams")) || [];

    teamsList.innerHTML = "";

    teams.forEach(team => {
        teamsList.innerHTML += `
            <div class="team-card">
                <div class="team-card-header">
                    <h3>${team.teamName}</h3>
                    <div class="team-actions">
                        <span class="delete-team">🗑</span>
                    </div>
                </div>
            </div>
        `;
    });
}


document.addEventListener("click", function (e) {

    if (e.target.classList.contains("delete-team")) {

        const card = e.target.closest(".team-card");
        const teamName = card.querySelector("h3").innerText;

        showConfirmPopup(
            "Delete Team",
            `Delete ${teamName}?`,
            function () {

                let teams = JSON.parse(localStorage.getItem("teams")) || [];
                teams = teams.filter(team => team.teamName !== teamName);
                localStorage.setItem("teams", JSON.stringify(teams));

                card.remove();
            }
        );
    }

});



function openDeleteTeamPopup(teamName) {
    openConfirmPopup(
        `Delete team "${teamName}" completely?`,
        () => {

            let teams = JSON.parse(localStorage.getItem("teams")) || [];
            teams = teams.filter(t => t.teamName !== teamName);
            localStorage.setItem("teams", JSON.stringify(teams));

            showPopup("Team deleted 🗑");

            goHomeScreen();
            setupCareerSection();
        }
    );
}

window.addEventListener("click", () => userInteracted = true, { once: true });
window.addEventListener("touchstart", () => userInteracted = true, { once: true });


function goBackScreen() {
    vibrateTap(15);

    if (location.hash) {
        history.back();
    } else {
        appOverlay.classList.remove("active");
        setActiveNav("home");
    }
}

// Ensure there is always a base HOME state in history
if (!history.state) {
    history.replaceState({ screen: "home" }, "", location.pathname);
}
function attachBackButton() {
    const backBtn = appOverlayContent.querySelector(".overlay-back");
    if (backBtn) {
        backBtn.onclick = () => {
            handleBackNavigation();
        };
    }
}


function handleBackNavigation() {

    // 🔴 LIVE MATCH SPECIAL RULE
    if (currentScreen === "liveMatch") {
        openQuitPopup();
        history.pushState({ screen: "liveMatch" }, "", "");
        return;
    }

    // Remove current screen from stack
    screenStack.pop();

    const previous = screenStack[screenStack.length - 1] || "home";

    if (previous === "home") {
        goHomeScreen();
    } else {
        openScreen(previous, true);
    }
}




function addPressEffect(el) {
    el.addEventListener("touchstart", () => el.classList.add("pressed"));
    el.addEventListener("touchend", () => el.classList.remove("pressed"));
    el.addEventListener("touchcancel", () => el.classList.remove("pressed"));
    el.addEventListener("mousedown", () => el.classList.add("pressed"));
    el.addEventListener("mouseup", () => el.classList.remove("pressed"));
    el.addEventListener("mouseleave", () => el.classList.remove("pressed"));
}

addPressEffect(document.querySelector(".start-match"));
addPressEffect(document.querySelector(".start-tournment"));



let teamSelected = false;
let opponentSelected = false;

window.addEventListener("popstate", () => {
    handleBackNavigation();
});





//////////////////////////////////////////////////
// 📳 VIBRATION FUNCTION
//////////////////////////////////////////////////
function vibrateTap(pattern = 20) {

    if (!userInteracted) return;

    if (window.Android) {
        Android.vibrate(
            Array.isArray(pattern) ? pattern[0] : pattern
        );
    } else if ("vibrate" in navigator) {
        navigator.vibrate(pattern);
    }
}





const navIcons = document.querySelectorAll("footer i");

navIcons.forEach(icon => {
    icon.addEventListener("click", () => {
        navIcons.forEach(i => i.classList.remove("active"));
        icon.classList.add("active");
    });
});


document.querySelector(".start-tournment")?.addEventListener("click", () => vibrateTap(40));


document.querySelector(".start-btn button")?.addEventListener("click", () => vibrateTap([20, 15, 20]));

document.querySelectorAll("footer i").forEach(icon => {
    icon.addEventListener("click", () => vibrateTap(15));
});

document.querySelectorAll(".select").forEach(card => {
    card.addEventListener("click", () => vibrateTap(15));
});

document.querySelector(".popup-box button")?.addEventListener("click", () => vibrateTap(10));

//////////////////////////////////////////////////
// 📳 BUTTON VIBRATIONS

document.querySelector(".profile").addEventListener("click", () => vibrateTap(25));






function selectTeam(team, type) {
    vibrateTap(15);

    const titleEl = appOverlayContent.querySelector(
        type === "your" ? "#yourTeamTitle" : "#opponentTeamTitle"
    );

    if (!titleEl) return;

    titleEl.textContent = team.teamName;   // ✅ Update button text
    // Add remove button
    const removeBtn = document.createElement("span");
    removeBtn.className = "remove-selected-team";
    removeBtn.innerText = "✕";

    removeBtn.onclick = (e) => {
        e.stopPropagation();
        if (type === "your") {
            selectedYourTeam = null;
            teamSelected = false;
        } else {
            selectedOpponentTeam = null;
            opponentSelected = false;
        }

        titleEl.textContent = type === "your"
            ? originalYourTitle
            : originalOpponentTitle;

        card.classList.remove("selected");
        updateMatchPreview();
    };

    titleEl.appendChild(removeBtn);


    const card = titleEl.closest(".select");
    card.classList.add("selected");
    card.classList.remove("open");

    if (type === "your") {
        selectedYourTeam = team;
        teamSelected = true;
    } else {
        selectedOpponentTeam = team;
        opponentSelected = true;
    }

    updateMatchPreview();

}


function updateMatchPreview() {
    const previewTeams = appOverlayContent.querySelector("#previewTeams");
    const previewOvers = appOverlayContent.querySelector("#previewOvers");

    if (!previewTeams || !previewOvers) return;

    if (selectedYourTeam && selectedOpponentTeam) {
        previewTeams.textContent =
            `${selectedYourTeam.teamName} vs ${selectedOpponentTeam.teamName}`;
    } else {
        previewTeams.textContent = "Select Teams";
    }

    const oversInput = appOverlayContent.querySelector(".select-overs input");
    previewOvers.textContent = oversInput?.value || "--";
}





function resetTeamForm() {
    document.getElementById("teamNameInput").value = "";
    playersList.innerHTML = "";
}




function resetSelections() {
    teamSelected = false;
    opponentSelected = false;

    document.getElementById("yourTeamName").innerText = "";
    document.getElementById("opponentTeamName").innerText = "";

    document.querySelector(".select-your-team").classList.remove("selected", "open");
    document.querySelector(".select-opponent-team").classList.remove("selected", "open");

    document.querySelectorAll(".player-list").forEach(el => el.remove());
}




function showPopup(message) {
    const popup = document.getElementById("popup");
    const msg = document.getElementById("popup-msg");

    msg.innerHTML = message;

    popup.style.display = "flex";
    popup.classList.remove("show");
    void popup.offsetWidth;
    popup.classList.add("show");

    vibrateTap(20);
}


function openConfirmPopup(message, onConfirm) {

    const popup = document.getElementById("confirmPopup");
    const msg = document.getElementById("confirmMessage");
    const yesBtn = document.getElementById("confirmYes");
    const noBtn = document.getElementById("confirmNo");

    msg.innerText = message;

    popup.style.display = "flex";

    yesBtn.onclick = () => {
        popup.style.display = "none";
        if (onConfirm) onConfirm();
    };

    noBtn.onclick = () => {
        popup.style.display = "none";
    };
}




const appOverlay = document.getElementById("appOverlay");
const appOverlayContent = document.getElementById("appOverlayContent");

function openScreen(id, fromPop = false) {
    closeAllPopups();

    if (!fromPop) {
        screenStack.push(id);
        history.pushState({ screen: id }, "", "");
    }

    currentScreen = id;

    // 🔥 Footer highlight control
    if (id === "teamsScreen") setActiveNav("team");
    else if (id === "historyScreen") setActiveNav("history");
    else if (id === "profileScreen") setActiveNav("profile");
    else if (id === "home") setActiveNav("home");


    vibrateTap(20);
    showLoader(400);

    const template = document.getElementById(id);
    if (!template) return;

    appOverlayContent.innerHTML = template.innerHTML;
    appOverlay.classList.add("active");

    attachBackButton();

    if (id === "liveMatch") {
        document.querySelector("footer").style.display = "none";
    } else {
        document.querySelector("footer").style.display = "flex";
    }

    // Screen setups
    if (id === "startMatchScreen") setupStartMatchScreen();
    if (id === "createTeamScreen") setupCreateTeamScreen();
    if (id === "profileScreen") setupProfileScreen();
    if (id === "teamsScreen") loadTeamsScreen();
    if (id === "historyScreen") loadHistoryScreen();
    if (id === "liveMatch") setupLiveMatchScreen();
    if (id === "careerScreen") {
        const lastTeam = localStorage.getItem("lastCareerTeam");
        if (lastTeam) loadCareerScreen(lastTeam);
    }
}





function setupProfileScreen() {

    const slider = appOverlayContent.querySelector(".profile-slider");
    const dots = appOverlayContent.querySelectorAll(".dot");

    if (!slider) return;

    let index = 0;
    let startX = 0;

    function updateSlider() {
        slider.style.transform = `translateX(-${index * 100}%)`;

        dots.forEach(d => d.classList.remove("active"));
        dots[index].classList.add("active");
    }

    slider.addEventListener("touchstart", e => {
        startX = e.touches[0].clientX;
    });

    slider.addEventListener("touchend", e => {
        const diff = e.changedTouches[0].clientX - startX;

        if (diff > 50 && index > 0) index--;
        if (diff < -50 && index < 2) index++;

        updateSlider();
    });

    dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
            index = i;
            updateSlider();
        });
    });

    updateSlider();

    buildOverallStats();
    buildTeamStats();
    buildAchievements();
}



function buildOverallStats() {

    const container = appOverlayContent.querySelector(".overall-slide");
    if (!container) return;

    const history = JSON.parse(localStorage.getItem("matchHistory")) || [];

    const totalMatches = history.length;
    const wins = history.filter(m => m.result.includes("Won")).length;
    const losses = history.filter(m => m.result.includes("Lost")).length;
    const tied = history.filter(m => m.result.includes("Tied")).length;

    const winRate = totalMatches ? ((wins / totalMatches) * 100).toFixed(1) : 0;

    const level = Math.floor(totalMatches / 5) + 1;
    const xp = totalMatches % 5;

    container.innerHTML = `
        <div class="profile-card">
            <h3>Level ${level}</h3>
            <p>${xp} / 5 XP</p>
        </div>

        <div class="profile-stats-grid">
            <div><span>Matches</span><b>${totalMatches}</b></div>
            <div><span>Wins</span><b>${wins}</b></div>
            <div><span>Losses</span><b>${losses}</b></div>
            <div><span>Win %</span><b>${winRate}%</b></div>
        </div>
    `;
}



function buildTeamStats() {

    const container = appOverlayContent.querySelector(".teams-slide");
    if (!container) return;

    const history = JSON.parse(localStorage.getItem("matchHistory")) || [];
    const teams = JSON.parse(localStorage.getItem("teams")) || [];

    container.innerHTML = "";

    teams.forEach(team => {

        const teamMatches = history.filter(m =>
            m.teamA === team.teamName || m.teamB === team.teamName
        );

        const wins = teamMatches.filter(m => m.result.includes(team.teamName)).length;
        const winRate = teamMatches.length
            ? ((wins / teamMatches.length) * 100).toFixed(1)
            : 0;

        container.innerHTML += `
            <div class="profile-card">
                <h4>${team.teamName}</h4>
                <p>Matches: ${teamMatches.length}</p>
                <p>Wins: ${wins}</p>
                <p>Win Rate: ${winRate}%</p>
            </div>
        `;
    });
}


function buildAchievements() {

    const container = appOverlayContent.querySelector(".achievements-slide");
    if (!container) return;

    const history = JSON.parse(localStorage.getItem("matchHistory")) || [];

    const achievements = [
        { title: "First Match", unlocked: history.length >= 1 },
        { title: "5 Matches", unlocked: history.length >= 5 },
        { title: "10 Matches", unlocked: history.length >= 10 }
    ];

    container.innerHTML = achievements.map(a => `
        <div class="achievement ${a.unlocked ? "unlocked" : "locked"}">
            ${a.unlocked ? "🏆" : "🔒"} ${a.title}
        </div>
    `).join("");
}








function showPlayersPopup(team, type) {
    if (!team) return;

    const popup = document.getElementById("playersPopup");
    const nameInput = document.getElementById("popupTeamNameInput");
    const playerInput = document.getElementById("popupPlayerInput");
    const addBtn = document.getElementById("popupAddPlayerBtn");
    const list = document.getElementById("popupPlayersList");
    const saveBtn = document.getElementById("popupSaveBtn");
    const cancelBtn = document.getElementById("popupCancelBtn");
    const closeIcon = document.getElementById("closePlayersPopup");
    const overlay = document.getElementById("playersPopupOverlay");

    popup.style.display = "block";
    nameInput.value = team.teamName;
    list.innerHTML = "";

    team.players.forEach((player, index) => {

        if (typeof player === "string") {
            player = {
                name: player,
                role: "Batsman",
                batting: "Right Hand",
                bowling: "None"
            };
            team.players[index] = player;
        }

        const card = document.createElement("div");
        card.className = "edit-player-card";
        card.dataset.index = index;


        card.innerHTML = `
            <div class="player-left">
                <div class="player-name" data-name="${player.name}">
                        <span class="player-number">${index + 1}.</span>
                        <span class="name-text">${player.name}</span>
                        ${player.captain ? '<span class="tag captain">C</span>' : ''}
                        ${player.viceCaptain ? '<span class="tag vice">VC</span>' : ''}
                        ${player.wicketKeeper ? '<span class="tag wk">WK</span>' : ''}
                </div>
                <div class="player-tags">
                    <span>${player.batting}</span>
                    <span>${player.bowling}</span>
                    <span>${player.role}</span>
                </div>
            </div>
            <button class="remove-player" data-index="${index}">✕</button>
        `;

        card.addEventListener("click", () => {
            openEditPlayerPopup(team, index);
        });


        list.appendChild(card);
    });







    const openAddBtn = popup.querySelector("#openAddPlayerPopup");
    const miniPopup = document.getElementById("miniAddPlayerPopup");

    if (!miniPopup) {
        console.error("miniAddPlayerPopup not found in DOM at all");
        return;
    }

    const captainCheck = miniPopup.querySelector(".captain-check");
    const viceCheck = miniPopup.querySelector(".vice-check");

    if (captainCheck && viceCheck) {

        captainCheck.addEventListener("change", () => {
            if (captainCheck.checked) {
                viceCheck.checked = false;
            }
        });

        viceCheck.addEventListener("change", () => {
            if (viceCheck.checked) {
                captainCheck.checked = false;
            }
        });
    }




    if (openAddBtn && miniPopup) {
        openAddBtn.onclick = () => {

            const miniPopup = document.getElementById("miniAddPlayerPopup");

            // 🔥 CLEAR FORM FIRST
            miniPopup.querySelector("#newPlayerName").value = "";
            miniPopup.querySelector("#newPlayerRole").value = "Batsman";
            miniPopup.querySelector("#newPlayerBatting").value = "Right Hand";
            miniPopup.querySelector("#newPlayerBowling").value = "None";

            const captainCheck = miniPopup.querySelector(".captain-check");
            const viceCheck = miniPopup.querySelector(".vice-check");
            const wkCheck = miniPopup.querySelector(".wk-check");

            if (captainCheck) captainCheck.checked = false;
            if (viceCheck) viceCheck.checked = false;
            if (wkCheck) wkCheck.checked = false;


            // 🔥 REMOVE EDIT HANDLER
            miniPopup.dataset.editIndex = "";

            miniPopup.style.display = "flex";
        };

    }


    document.getElementById("cancelAddPlayer").onclick = () => {
        miniPopup.style.display = "none";
    };

    const confirmBtn = document.getElementById("confirmAddPlayer");
    const cancelMiniBtn = document.getElementById("cancelAddPlayer");


    if (confirmBtn) {

        confirmBtn.onclick = () => {

            const miniPopup = document.getElementById("miniAddPlayerPopup");

            const name = miniPopup.querySelector("#newPlayerName").value.trim();
            const role = miniPopup.querySelector("#newPlayerRole").value;
            const batting = miniPopup.querySelector("#newPlayerBatting").value;
            const bowling = miniPopup.querySelector("#newPlayerBowling").value;

            const captain = miniPopup.querySelector(".captain-check")?.checked || false;
            const viceCaptain = miniPopup.querySelector(".vice-check")?.checked || false;
            const wicketKeeper = miniPopup.querySelector(".wk-check")?.checked || false;

            if (!name) {
                showPopup("Enter player name");
                return;
            }

            // 🔥 Ensure single roles
            if (captain) team.players.forEach(p => p.captain = false);
            if (viceCaptain) team.players.forEach(p => p.viceCaptain = false);
            if (wicketKeeper) team.players.forEach(p => p.wicketKeeper = false);

            const editIndex = miniPopup.dataset.editIndex;

            if (editIndex !== undefined && editIndex !== "") {
                // EDIT MODE
                team.players[editIndex] = {
                    name,
                    role,
                    batting,
                    bowling,
                    captain,
                    viceCaptain,
                    wicketKeeper
                };
            } else {
                // ADD MODE
                team.players.push({
                    name,
                    role,
                    batting,
                    bowling,
                    captain,
                    viceCaptain,
                    wicketKeeper
                });
            }

            miniPopup.style.display = "none";
            miniPopup.dataset.editIndex = "";

            showPlayersPopup(team); // refresh
        };
    }




    // Remove player
    list.querySelectorAll(".remove-player").forEach(btn => {

        btn.onclick = () => {
            const i = btn.dataset.index;
            team.players.splice(i, 1);
            showPlayersPopup(team, type);
        };
    });





    // Save
    saveBtn.onclick = () => {

        const updatedName = nameInput.value.trim();

        if (!updatedName) {
            return showPopup("Please enter team name");
        }

        if (team.players.length < 2) {
            return showPopup("A team must have at least 2 players");
        }

        team.teamName = updatedName;

        let teams = JSON.parse(localStorage.getItem("teams")) || [];

        // 🔥 Find index of existing team
        const index = teams.findIndex(t => t.teamName === team.teamName);

        if (index !== -1) {
            teams[index] = team;   // ✅ Replace existing team
        } else {
            teams.push(team);      // Fallback (should not normally happen)
        }

        localStorage.setItem("teams", JSON.stringify(teams));

        popup.style.display = "none";

        loadTeamsScreen();  // 🔥 Refresh screen instantly
        showPopup("Team Updated ✅");
    };



    // Close
    function close() {
        popup.style.display = "none";
    }

    cancelBtn.onclick = close;
    closeIcon.onclick = close;
    overlay.onclick = close;
}


function openEditPlayerPopup(team, index) {

    const miniPopup = document.getElementById("miniAddPlayerPopup");
    if (!miniPopup) {
        console.error("miniAddPlayerPopup not found in DOM");
        return;
    }

    // 🔥 TARGET INPUTS GLOBALLY — NOT SCOPED
    const nameInput = document.getElementById("newPlayerName");
    const roleSelect = document.getElementById("newPlayerRole");
    const battingSelect = document.getElementById("newPlayerBatting");
    const bowlingSelect = document.getElementById("newPlayerBowling");

    const captainCheck = miniPopup.querySelector(".captain-check");
    const viceCheck = miniPopup.querySelector(".vice-check");
    const wkCheck = miniPopup.querySelector(".wk-check");

    if (!nameInput || !roleSelect || !battingSelect || !bowlingSelect) {
        console.error("Mini popup form elements missing in HTML");
        return;
    }

    const player = team.players[index];

    nameInput.value = player.name || "";
    roleSelect.value = player.role || "Batsman";
    battingSelect.value = player.batting || "Right Hand";
    bowlingSelect.value = player.bowling || "None";

    if (captainCheck) captainCheck.checked = !!player.captain;
    if (viceCheck) viceCheck.checked = !!player.viceCaptain;
    if (wkCheck) wkCheck.checked = !!player.wicketKeeper;

    miniPopup.dataset.editIndex = index;
    miniPopup.style.display = "flex";
}






function setupStartMatchScreen() {

    attachBackButton();



    const selects = appOverlayContent.querySelectorAll(".select");
    const startBtn = appOverlayContent.querySelector(".start-btn button");
    const oversInput = appOverlayContent.querySelector(".select-overs input");
    const yourCard = appOverlayContent.querySelector(".select-your-team");
    const oppCard = appOverlayContent.querySelector(".select-opponent-team");
    oversInput.addEventListener("input", updateMatchPreview);
    oversInput.addEventListener("input", () => {
        quickButtons.forEach(b => {
            b.classList.toggle("active", b.dataset.ov === oversInput.value);
        });
    });

    const quickButtons = appOverlayContent.querySelectorAll(".quick-overs button");



    yourCard.addEventListener("click", (e) => {
        if (!yourCard.classList.contains("selected")) return;

        e.stopPropagation(); // ⛔ stop dropdown logic
        vibrateTap(15);
        showPlayersPopup(selectedYourTeam, "your");
    });


    oppCard.addEventListener("click", (e) => {
        if (!oppCard.classList.contains("selected")) return;

        e.stopPropagation(); // ⛔ stop dropdown logic
        vibrateTap(15);
        showPlayersPopup(selectedOpponentTeam, "opponent");
    });



    quickButtons.forEach(btn => {
        btn.addEventListener("click", () => {

            const value = btn.dataset.ov;

            oversInput.value = value;

            quickButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            updateMatchPreview();
            vibrateTap(10);
        });
    });



    // DROPDOWN OPEN/CLOSE
    selects.forEach(select => {
        select.addEventListener("click", (e) => {

            if (select.classList.contains("selected")) {
                e.stopPropagation();
                if (select.classList.contains("select-your-team")) {
                    showPlayersPopup(selectedYourTeam, "your");
                } else {
                    showPlayersPopup(selectedOpponentTeam, "opponent");
                }
                return;
            }

            selects.forEach(s => s.classList.remove("open"));
            select.classList.toggle("open");
            vibrateTap(10);
        });
    });



    appOverlayContent.querySelectorAll(".add-existing").forEach(btn => {
        btn.addEventListener("click", () => {
            vibrateTap(20);

            // Determine which card triggered it
            const parentCard = btn.closest(".select");
            selectingFor = parentCard.classList.contains("select-your-team") ? "your" : "opponent";

            openScreen("teamsScreen");
        });
    });


    // START BUTTON VALIDATION POPUPS
    startBtn.addEventListener("click", () => {
        vibrateTap([20, 10, 20]);

        if (!selectedYourTeam && !selectedOpponentTeam)
            return showPopup("Select both teams first");
        if (!selectedYourTeam)
            return showPopup("Please select your team");
        if (!selectedOpponentTeam)
            return showPopup("Please select opponent team");
        if (!oversInput.value.trim())
            return showPopup("Please enter number of overs");

        // 🧹 FULL MATCH RESET
        localStorage.removeItem("liveMatchState");
        localStorage.removeItem("firstInningsStats");
        localStorage.removeItem("secondInningsStats");


        const matchSetup = {
            yourTeam: selectedYourTeam,
            opponentTeam: selectedOpponentTeam,
            overs: parseInt(oversInput.value.trim())
        };


        localStorage.setItem("currentMatch", JSON.stringify(matchSetup));

        // Show batting selection popup
        openBattingChoicePopup(selectedYourTeam, selectedOpponentTeam);

    });



    // ADD NEW TEAM → OPEN CREATE TEAM SCREEN
    appOverlayContent.querySelectorAll(".add-new").forEach(btn => {
        btn.addEventListener("click", (e) => {

            e.stopPropagation(); // 🔴 IMPORTANT
            e.preventDefault();  // 🔴 IMPORTANT

            vibrateTap(25);

            const parentCard = btn.closest(".select");
            creatingFor = parentCard.classList.contains("select-your-team") ? "your" : "opponent";

            openScreen("createTeamScreen");
        });
    });



    // Reapply previously selected teams (when coming back from Teams screen)
    if (selectedYourTeam) {
        selectTeam(selectedYourTeam, "your");
    }
    if (selectedOpponentTeam) {
        selectTeam(selectedOpponentTeam, "opponent");
    }

    // ⭐ Auto-select team after creating
    if (lastCreatedTeam && creatingFor) {
        selectTeam(lastCreatedTeam, creatingFor);
        lastCreatedTeam = null;
        creatingFor = null;
    }
    updateMatchPreview();




}

function openBattingChoicePopup(teamA, teamB) {
    const popup = document.getElementById("battingChoicePopup");
    const btnA = document.getElementById("batFirstTeamA");
    const btnB = document.getElementById("batFirstTeamB");

    btnA.innerText = teamA.teamName;
    btnB.innerText = teamB.teamName;

    btnA.onclick = () => chooseBattingOrder(teamA, teamB);
    btnB.onclick = () => chooseBattingOrder(teamB, teamA);

    popup.style.display = "flex";
}

function chooseBattingOrder(battingTeam, bowlingTeam) {
    const match = JSON.parse(localStorage.getItem("currentMatch"));

    match.yourTeam = battingTeam;
    match.opponentTeam = bowlingTeam;

    localStorage.setItem("currentMatch", JSON.stringify(match));

    document.getElementById("battingChoicePopup").style.display = "none";

    showPopup(`🏏 ${match.yourTeam.teamName} batting first`);

    setTimeout(() => {
        startMatchCountdown();
    }, 1500);
}


function startMatchCountdown() {
    const popup = document.getElementById("countdownPopup");
    const text = document.getElementById("countdownText");

    let time = 5;
    popup.style.display = "flex";
    text.innerText = time;

    const interval = setInterval(() => {
        time--;
        text.innerText = time;

        // 📳 short tick vibration
        if (window.Android) {
            Android.vibrate(30);
        } else {
            navigator.vibrate(30);
        }

        if (time <= 0) {

            if (window.Android) {
                Android.vibrate(150);
            } else {
                navigator.vibrate([100, 50, 100]);
            }

            clearInterval(interval);
            popup.style.display = "none";
            openScreen("liveMatch");
        }

    }, 1000);
}


function setupCreateTeamScreen() {
    attachBackButton();

    const playersList = appOverlayContent.querySelector("#createPlayersList");
    const addPlayerBtn = appOverlayContent.querySelector("#createAddPlayerBtn");
    const saveBtn = appOverlayContent.querySelector("#createSaveTeamBtn");
    const teamNameInput = appOverlayContent.querySelector("#createTeamNameInput");

    // const backBtn = appOverlayContent.querySelector(".overlay-back");

    teamNameInput.value = "";
    playersList.innerHTML = "";


    addPlayerBtn.onclick = () => {

        const wrapper = document.createElement("div");
        wrapper.className = "player-entry";

        wrapper.innerHTML = `
            <input type="text" placeholder="Player name" class="create-player-name" />

            <select class="player-role">
                <option value="Batsman">Batsman</option>
                <option value="Bowler">Bowler</option>
                <option value="All-rounder">All-rounder</option>
            </select>

            <select class="player-batting">
                <option value="Right Hand">Right Hand</option>
                <option value="Left Hand">Left Hand</option>
            </select>

            <select class="player-bowling">
                <option value="None">No Bowling</option>
                <option value="Fast">Fast</option>
                <option value="Medium">Medium</option>
                <option value="Spin">Spin</option>
            </select>

            <div class="player-tags-checkbox">
                <label><input type="checkbox" class="captain-check"> Captain</label>
                <label><input type="checkbox" class="vice-check"> Vice Captain</label>
                <label><input type="checkbox" class="wk-check"> Wicket Keeper</label>

            </div>
        `;


        playersList.appendChild(wrapper);
    };


    saveBtn.onclick = () => {
        const teamName = teamNameInput.value.trim();

        const players = [...playersList.querySelectorAll(".player-entry")]
            .map(entry => {

                const name = entry.querySelector(".create-player-name").value.trim();
                if (!name) return null;

                const role = entry.querySelector(".player-role").value;
                const batting = entry.querySelector(".player-batting").value;
                const bowling = entry.querySelector(".player-bowling").value;

                const captain = entry.querySelector(".captain-check")?.checked || false;
                const viceCaptain = entry.querySelector(".vice-check")?.checked || false;
                const wicketKeeper = entry.querySelector(".wk-check")?.checked || false;


                return {
                    name,
                    role,
                    batting,
                    bowling,
                    captain,
                    viceCaptain,
                    wicketKeeper
                };
            })
            .filter(Boolean);

        if (!teamName || players.length < 2)
            return showPopup("Enter team name and at least 2 players");

        const captainCount = players.filter(p => p.captain).length;
        const viceCount = players.filter(p => p.viceCaptain).length;

        if (captainCount !== 1)
            return showPopup("Select exactly 1 Captain");

        if (viceCount !== 1)
            return showPopup("Select exactly 1 Vice Captain");

        let teams = JSON.parse(localStorage.getItem("teams")) || [];

        const newTeam = { teamName, players };

        teams = teams.filter(t => t.teamName.toLowerCase() !== teamName.toLowerCase());
        teams.push(newTeam);

        localStorage.setItem("teams", JSON.stringify(teams));

        lastCreatedTeam = newTeam;

        showPopup("Team Saved ✅");
        openScreen("startMatchScreen");
    };


}



function closePopup() {
    const popup = document.getElementById("popup");
    popup.classList.remove("show");

    setTimeout(() => {
        popup.style.display = "none";
    }, 200); // match CSS animation time
}


function closeScreen() {
    appOverlay.classList.remove("active");
}

function closeAllOverlays() {
    appOverlay.classList.remove("active");
    setActiveNav("home");
    history.replaceState({}, "", location.pathname);
}

function loadTeamsScreen() {
    const container = appOverlayContent;

    const teams = JSON.parse(localStorage.getItem("teams")) || [];

    container.innerHTML = `
        <div class="overlay-header">
            <i class="ri-arrow-left-line overlay-back"></i>
            <h2>My Teams</h2>
        </div>

        <div class="teams-header">
            <button class="create-team-btn">Create New Team</button>
            <button class="clear-teams-btn">Clear All Teams</button>
        </div>

        <div class="teams-list"></div>
    `;

    container.querySelector(".create-team-btn").onclick = () => {
        openScreen("createTeamScreen");
    };


    const list = container.querySelector(".teams-list");

    if (teams.length === 0) {
        list.innerHTML = `
            <div class="no-teams">
                <p>No teams created yet</p>
                <button class="create-first-team">Create Team</button>
            </div>
        `;

        list.querySelector(".create-first-team").onclick = () => {
            openScreen("createTeamScreen");
        };

        return;
    }


    teams.forEach(team => {

        let isCurrentlySelected =
            (selectedYourTeam?.teamName === team.teamName) ||
            (selectedOpponentTeam?.teamName === team.teamName);



        const card = document.createElement("div");
        card.className = `team-card`;

        card.innerHTML = `
            ${isCurrentlySelected ? `<div class="selected-badge">✔ Selected</div>` : ""}

            <div class="team-card-header">
                <h3>${team.teamName}</h3>
                <div class="team-actions">
                    <span class="edit-team">✏️</span>
                    <span class="delete-team">🗑</span>
                </div>
            </div>

            <ul class="team-players">
               ${team.players.map((p, index) => {

            if (typeof p === "string") {
                p = {
                    name: p,
                    role: "Batsman",
                    batting: "Right Hand",
                    bowling: "None"
                };
            }

            return `
    <li>
        ${p.name}
        ${p.captain ? '<span class="tag captain">C</span>' : ''}
        ${p.viceCaptain ? '<span class="tag vice">VC</span>' : ''}
        ${p.wicketKeeper ? '<span class="tag wk">WK</span>' : ''}

        <div class="player-meta">
            <span>${p.batting}</span>
            <span>${p.bowling}</span>
            <span>${p.role}</span>
        </div>
    </li>
`;

        }).join("")}


            </ul>
        `;


        list.appendChild(card);

        // SELECT TEAM
        card.addEventListener("click", () => {

            if (!selectingFor) return;

            if (
                (selectingFor === "your" && selectedOpponentTeam?.teamName === team.teamName) ||
                (selectingFor === "opponent" && selectedYourTeam?.teamName === team.teamName)
            ) {
                showPopup("You already selected this team for the other side");
                return;
            }

            if (selectingFor === "your") {
                selectedYourTeam = team;
            } else {
                selectedOpponentTeam = team;
            }

            selectingFor = null;

            // 🔥 Properly go back using stack system
            history.back();
        });


        // EDIT
        card.querySelector(".edit-team").addEventListener("click", (e) => {
            e.stopPropagation();
            showPlayersPopup(team, "edit");
        });

        // DELETE
        card.querySelector(".delete-team").addEventListener("click", (e) => {
            e.stopPropagation();

            let teams = JSON.parse(localStorage.getItem("teams")) || [];
            teams = teams.filter(t => t.teamName !== team.teamName);
            localStorage.setItem("teams", JSON.stringify(teams));

            loadTeamsScreen();
            showPopup("Team Deleted");
        });
    });

    container.querySelector(".clear-teams-btn").addEventListener("click", () => {
        localStorage.removeItem("teams");
        loadTeamsScreen();
        showPopup("All teams cleared");
    });

    // 🔥 Re-attach back button AFTER injecting HTML
    const backBtn = container.querySelector(".overlay-back");
    if (backBtn) {
        backBtn.onclick = () => {
            handleBackNavigation();
        };
    }

}





const startMatchBtn = document.getElementById("startMatch");

if (startMatchBtn) {
    startMatchBtn.addEventListener("click", () => {
        vibrateTap(30);
        openScreen("startMatchScreen");
    });
}



function setActiveNav(name) {
    document.querySelectorAll("footer i").forEach(i => i.classList.remove("active"));
    if (!name) return;
    const el = document.querySelector(`footer .${name} i`);
    if (el) el.classList.add("active");
}


document.querySelector(".home").addEventListener("click", goHomeScreen, closeAllPopups);

document.querySelector(".team").addEventListener("click", () => {
    closeAllPopups();

    screenStack = ["home"];
    openScreen("teamsScreen");
});

document.querySelector(".history").addEventListener("click", () => {
    closeAllPopups();

    screenStack = ["home"];
    openScreen("historyScreen");
});

document.querySelector(".profile").addEventListener("click", () => {
    closeAllPopups();

    screenStack = ["home"];
    openScreen("profileScreen");
});


window.addEventListener("load", () => {

    const savedState = history.state;

    // Always show footer initially
    document.querySelector("footer").style.display = "flex";

    if (!savedState || !savedState.screen || savedState.screen === "home") {

        // 🏠 Proper Home Restore
        screenStack = ["home"];
        currentScreen = "home";

        appOverlay.classList.remove("active");
        setActiveNav("home");

        // Delay ensures DOM is fully ready
        setTimeout(() => {
            setupCareerSection();
        }, 0);

        return;
    }

    // 🔄 Restore Overlay Screen
    const screen = savedState.screen;

    screenStack = ["home", screen];
    currentScreen = screen;

    openScreen(screen, true);

    // 🔥 Set correct footer highlight
    if (screen === "teamsScreen") setActiveNav("team");
    else if (screen === "historyScreen") setActiveNav("history");
    else if (screen === "profileScreen") setActiveNav("profile");
    else if (screen === "home") setActiveNav("home");

});


function goHomeScreen(fromPop = false) {

    screenStack = ["home"];
    currentScreen = "home";

    appOverlay.classList.remove("active");
    document.querySelector("footer").style.display = "flex";
    setActiveNav("home");
    setupCareerSection();

    if (!fromPop) {
        history.pushState({ screen: "home" }, "");
    }
}






// ==========================================PLAYERS LIST POPUP=================================



//===============================================LIVE MATCH=====================================

function setupLiveMatchScreen() {
    // history.replaceState({ screen: "liveMatch" }, "", "#liveMatch");
    console.log("Live match screen loaded");

    const match = JSON.parse(localStorage.getItem("currentMatch"));
    if (!match) return;
    let saved = JSON.parse(localStorage.getItem("liveMatchState"));

    if (!saved || saved.matchFinished) {
        saved = {
            score: 0,
            wickets: 0,
            balls: 0,
            innings: 1,
            inningsStats: {
                1: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 6: 0, W: 0, NB: 0, WB: 0 },
                2: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 6: 0, W: 0, NB: 0, WB: 0 }
            },
            batsmanStats: {},
            bowlerStats: {},
            outBatsmen: [],
            usedBowlers: [],
            ballHistory: ["|"]
        };
    }

    let inningsStats = saved.inningsStats || {
        1: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 6: 0, W: 0, NB: 0, WB: 0 },
        2: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 6: 0, W: 0, NB: 0, WB: 0 }
    };

    // history.pushState({ screen: "liveMatch" }, "", "#liveMatch");


    // Hide footer during live match
    document.querySelector("footer").style.display = "none";
    let innings = saved.innings || 1;
    let target = saved.target || null;
    let ballHistory = saved.ballHistory || [];
    const timelineEl = document.getElementById("thisOverTimeline");
    let matchStatus = saved.matchStatus || "live";
    // "live" | "finished"

    let outBatsmen = saved.outBatsmen || [];
    let usedBowlers = saved.usedBowlers || [];
    let outTypes = saved.outTypes || {};

    let lastBowler = null;
    const batsmanStatsList = document.getElementById("batsmanStatsList");
    const bowlerStatsList = document.getElementById("bowlerStatsList");
    let matchFinished = saved.matchFinished || false;
    let winningTeamName = saved.winningTeamName || null;

    let players = [...match.yourTeam.players];
    let bowlers = [...match.opponentTeam.players];


    const scope = appOverlayContent.querySelector("#liveScore") ? appOverlayContent : document;
    const battingLabelEl = appOverlayContent.querySelector(".batting-team-label");
    const bowlingLabelEl = appOverlayContent.querySelector(".bowling-team-label");

    function updateTeamLabels() {
        if (battingLabelEl) battingLabelEl.innerText = match.yourTeam.teamName;
        if (bowlingLabelEl) bowlingLabelEl.innerText = match.opponentTeam.teamName;
    }



    updateTeamLabels();

    const scoreEl = scope.querySelector("#liveScore");
    const oversEl = scope.querySelector("#liveOvers");
    const runRateEl = scope.querySelector("#liveRunrate");
    const bowlerEl = scope.querySelector(".bowler");
    const strikerEl = scope.querySelector(".striker-box");
    const nonStrikerEl = scope.querySelector(".nonstriker-box");




    const firstBtn = appOverlayContent.querySelector(".first-innings");
    const secondBtn = appOverlayContent.querySelector(".second-innings");
    const switchBox = appOverlayContent.querySelector(".innings-switch");



    bowlerEl.innerText = "Select Bowler";

    bowlerEl.onclick = () => {
        if (currentBowler) return; // already selected for this over
        openBowlerSelector();
    };



    const swapBtn = scope.querySelector("#swapStrikeBtn");
    if (swapBtn) {
        swapBtn.onclick = () => {

            if (!striker || !nonStriker) {
                showPopup("Select both batsmen first");
                return;
            }

            // Animate flip
            strikerEl.classList.add("strike-flip");
            nonStrikerEl.classList.add("strike-flip");

            setTimeout(() => {

                [striker, nonStriker] = [nonStriker, striker];

                updateDisplay();

                strikerEl.classList.remove("strike-flip");
                nonStrikerEl.classList.remove("strike-flip");

            }, 300);

            vibrateTap(30);
        };
    }


    let score = saved.score || 0;
    let wickets = saved.wickets || 0;
    let balls = saved.balls || 0;
    let striker = saved.striker || null;
    let nonStriker = saved.nonStriker || null;
    let currentBowler = saved.currentBowler || null;
    let batsmanStats = saved.batsmanStats || {};
    let bowlerStats = saved.bowlerStats || {};


    if (ballHistory.length === 0) ballHistory.push("|");

    players.forEach(p => {
        if (!batsmanStats[p.name]) {
            batsmanStats[p.name] = { runs: 0, balls: 0 };
        }
    });

    bowlers.forEach(p => {
        if (!bowlerStats[p.name]) {
            bowlerStats[p.name] = { balls: 0, runs: 0, wickets: 0 };
        }
    });



    const maxBalls = match.overs * 6;







    const runButtons = appOverlayContent.querySelectorAll(".runs p");
    const wicketButtons = appOverlayContent.querySelectorAll(".wicket p");
    const undoBtn = appOverlayContent.querySelector(".undo-p");

    let history = [];


    function updateStatsUI() {
        batsmanStatsList.innerHTML = "";
        bowlerStatsList.innerHTML = "";

        // 🏏 Show ONLY striker & non-striker
        // 🏏 CURRENT BATSMEN
        [striker, nonStriker].forEach(name => {
            if (!name) return;
            const s = batsmanStats[name];
            const sr = s.balls ? ((s.runs / s.balls) * 100).toFixed(1) : "0";

            const isStriker = name === striker;
            const icon = isStriker ? "🏏" : "👤";

            const row = document.createElement("div");
            const playerObj = players.find(p => p.name === name);
            const tags = `
                ${playerObj?.captain ? '<span class="tag captain">C</span>' : ''}
                ${playerObj?.viceCaptain ? '<span class="tag vice">VC</span>' : ''}
                ${playerObj?.wicketKeeper ? '<span class="tag wk">WK</span>' : ''}
            `;



            row.className = "stat-row current";
            row.innerHTML = `${icon} <span class="stat-name">${name} ${tags}</span>
                     <span>${s.runs} (${s.balls})</span>
                     <span>SR ${sr}</span>`;
            batsmanStatsList.appendChild(row);
        });



        // ❌ OUT BATSMEN
        outBatsmen.forEach(name => {

            const s = batsmanStats[name];
            const sr = s.balls ? ((s.runs / s.balls) * 100).toFixed(1) : "0";
            const type = outTypes[name] || "W";

            const playerObj = players.find(p => p.name === name);

            const tags = `
                ${playerObj?.captain ? '<span class="tag captain">C</span>' : ''}
                ${playerObj?.viceCaptain ? '<span class="tag vice">VC</span>' : ''}
                ${playerObj?.wicketKeeper ? '<span class="tag wk">WK</span>' : ''}
            `;

            const row = document.createElement("div");
            row.className = "stat-row out";

            row.innerHTML = `
                <span class="stat-name">
                    ${name} ${tags}
                </span>
                <span class="wicket-type">(${type})</span>
                <span>${s.runs} (${s.balls})</span>
                <span>SR ${sr}</span>
            `;

            batsmanStatsList.appendChild(row);
        });





        // 🎯 Show ONLY current bowler
        // 🎯 CURRENT BOWLER
        // 🎯 CURRENT BOWLER
        if (currentBowler) {

            const b = bowlerStats[currentBowler] || { balls: 0, runs: 0, wickets: 0 };

            const balls = b.balls || 0;
            const overs = `${Math.floor(balls / 6)}.${balls % 6}`;
            const eco = balls ? (b.runs / (balls / 6)).toFixed(2) : "0.00";

            const row = document.createElement("div");
            row.className = "stat-row current-bow";

            row.innerHTML = `
                <span class="stat-name">${currentBowler}</span>
                <span>${overs} ov</span>
                <span>${b.wickets}/${b.runs}</span>
                <span>Eco ${eco}</span>
            `;

            bowlerStatsList.appendChild(row);
        }



        // 🏏 PREVIOUS BOWLERS
        usedBowlers.forEach(name => {

            if (name === currentBowler) return;

            const b = bowlerStats[name] || { balls: 0, runs: 0, wickets: 0 };

            const balls = b.balls || 0;
            const overs = `${Math.floor(balls / 6)}.${balls % 6}`;
            const eco = balls ? (b.runs / (balls / 6)).toFixed(2) : "0.00";

            const row = document.createElement("div");
            row.className = "stat-row old-bow";

            row.innerHTML = `
        <span class="stat-name">${name}</span>
        <span>${overs} ov</span>
        <span>${b.wickets}/${b.runs}</span>
        <span>Eco ${eco}</span>
    `;

            bowlerStatsList.appendChild(row);
        });

    }


    function updateDisplay() {

        const currentScoreText = scoreEl.innerText || "0/0";
        const oldScore = parseInt(currentScoreText.split("/")[0]) || 0;

        if (!isNaN(score)) {
            scoreEl.innerText = `${score}/${wickets}`;
        }

        oversEl.innerText = `${Math.floor(balls / 6)}.${balls % 6} / ${match.overs} ov`;

        runRateEl.innerHTML = balls
            ? (score / (balls / 6)).toFixed(2)
            : "0.00";


        // STRIKER BUTTON
        // STRIKER UI

        if (typeof Android !== "undefined") {

            const overText = `${Math.floor(balls / 6)}.${balls % 6}`;
            const teamA = match.yourTeam.teamName;
            const teamB = match.opponentTeam.teamName;

            let title = `${teamA} vs ${teamB}`;
            let content = `${score}/${wickets} • ${overText} ov`;

            if (innings === 2 && target && !matchFinished) {
                const runsNeeded = target - score;
                const ballsLeft = (match.overs * 6) - balls;
                content += ` • Need ${runsNeeded} in ${ballsLeft}`;
            }

            if (matchFinished && winningTeamName) {
                const resultText =
                    winningTeamName === "Match Tied"
                        ? "🤝 MATCH TIED"
                        : `🏆 ${winningTeamName} WON`;

                Android.updateScore(title, resultText, true);
            }

        }





        if (striker) {

            if (!batsmanStats[striker]) {
                batsmanStats[striker] = { runs: 0, balls: 0 };
            }

            const s = batsmanStats[striker];

            strikerEl.innerHTML = `
        <div class="name on-strike">${striker}</div>
        <div class="sub">${s.runs} (${s.balls})</div>
    `;
        }
        else {
            strikerEl.innerHTML = `
        <div class="name">Select Striker</div>
        <div class="sub"></div>
    `;
        }

        // NON STRIKER UI
        if (nonStriker) {

            if (!batsmanStats[nonStriker]) {
                batsmanStats[nonStriker] = { runs: 0, balls: 0 };
            }

            const ns = batsmanStats[nonStriker];

            nonStrikerEl.innerHTML = `
        <div class="name">${nonStriker}</div>
        <div class="sub">${ns.runs} (${ns.balls})</div>
    `;
        }
        else {
            nonStrikerEl.innerHTML = `
        <div class="name">Select Non-Striker</div>
        <div class="sub"></div>
    `;
        }



        // BOWLER BUTTON
        if (currentBowler) {
            const b = bowlerStats[currentBowler];
            const overs = `${Math.floor(b.balls / 6)}.${b.balls % 6}`;
            const overNumber = Math.floor(b.balls / 6) + 1;

            bowlerEl.innerHTML = `
        <div class="name">${currentBowler}</div>
        <div class="sub">${overNumber} over | ${overs} | ${b.wickets}/${b.runs}</div>
    `;
        } else {
            bowlerEl.innerText = "Select Bowler";
        }


        const inningsTagEl = document.getElementById("inningsTag");
        const targetInfoEl = document.getElementById("targetInfo");

        inningsTagEl.innerText = innings === 1 ? "1st Innings" : "2nd Innings";

        if (matchFinished) {
            if (winningTeamName === "Match Tied") {
                targetInfoEl.innerHTML = `<span class="match-result tied">🤝 MATCH TIED</span>`;
            } else {
                targetInfoEl.innerHTML = `<span class="match-result win">🏆 ${winningTeamName} WON</span>`;
            }
        }
        else if (innings === 2 && target) {
            const runsNeeded = target - score;
            const ballsLeft = maxBalls - balls;
            const reqRR = ballsLeft > 0 ? (runsNeeded / (ballsLeft / 6)).toFixed(2) : "-";

            targetInfoEl.innerHTML = `
        Target: <b>${target}</b> |
        Need <b>${runsNeeded}</b> runs in <b>${ballsLeft}</b> balls |
        <p>Req RR: <b>${reqRR}</b></p>
    `;
        } else {
            targetInfoEl.innerHTML = "";
        }



        localStorage.setItem("liveMatchState", JSON.stringify({
            score, wickets, balls,
            striker, nonStriker,
            currentBowler,
            outTypes,
            batsmanStats,
            bowlerStats,
            inningsStats,
            ballHistory,
            matchStatus,
            outBatsmen,
            usedBowlers,
            innings,
            target,
            matchFinished,
            winningTeamName
        }));






        updateStatsUI();
        updateTimeline();
        updateTotalRunsUI();
        updateInningsButtons();

    }

    function showMatchResult() {

        if (!target) return;

        const firstInnings = JSON.parse(localStorage.getItem("firstInningsStats"));
        if (!firstInnings) return;

        const firstTeam = firstInnings.battingTeam;
        const secondTeam = match.yourTeam.teamName;

        const firstScore = firstInnings.score;
        const secondScore = score;

        let resultText;

        // ✅ Decide winner
        if (secondScore >= target) {
            winningTeamName = secondTeam;
        }
        else if (secondScore === firstScore) {
            winningTeamName = "Match Tied";
        }
        else {
            winningTeamName = firstTeam;
        }

        // ✅ Build result text
        if (winningTeamName === "Match Tied") {
            resultText = "Match Tied";
        }
        else if (secondScore >= target) {
            const wicketsLeft = players.length - 1 - wickets;
            resultText = `${winningTeamName} won by ${wicketsLeft} wickets`;
        }
        else {
            const runMargin = firstScore - secondScore;
            resultText = `${winningTeamName} won by ${runMargin} runs`;
        }

        matchFinished = true;

        // ✅ Save second innings BEFORE clearing anything
        const finalState = {
            score,
            wickets,
            balls,
            inningsStats: JSON.parse(JSON.stringify(inningsStats)),
            batsmanStats: JSON.parse(JSON.stringify(batsmanStats)),
            bowlerStats: JSON.parse(JSON.stringify(bowlerStats)),
            outTypes: { ...outTypes },
            battingTeam: secondTeam
        };

        localStorage.setItem("secondInningsStats", JSON.stringify(finalState));

        // ✅ Android notification AFTER resultText exists
        if (typeof Android !== "undefined") {
            Android.updateScore(
                `${match.yourTeam.teamName} vs ${match.opponentTeam.teamName}`,
                winningTeamName === "Match Tied"
                    ? "🤝 MATCH TIED"
                    : `🏆 ${resultText}`,
                true
            );
        }

        updateDisplay();

        const insight = generateInsights();
        const pom = calculatePlayerOfMatch();

        setTimeout(() => {

            const result = winningTeamName === "Match Tied"
                ? "🤝 MATCH TIED"
                : `🏆 ${resultText}`;


            const popupHTML = `
                <div class="match-result-card">
                    <h2>${result}</h2>
                    <div class="pom-section">
                        <div class="pom-title">⭐ PLAYER OF THE MATCH</div>
                        <div class="pom-name">${pom}</div>
                    </div>
                    <div class="insight">${insight}</div>
                </div>
            `;

            showPopup(popupHTML);

        }, 400);


        matchStatus = "finished";

        localStorage.setItem("liveMatchState", JSON.stringify({
            score, wickets, balls,
            striker, nonStriker,
            currentBowler,
            outTypes: { ...outTypes },
            batsmanStats,
            bowlerStats,
            inningsStats: { 2: inningsStats[2] },
            ballHistory,
            matchStatus: "finished",
            outBatsmen,
            usedBowlers,
            innings,
            target,
            matchFinished: true,
            winningTeamName
        }));


        function calculatePlayerOfMatch() {

            const first = JSON.parse(localStorage.getItem("firstInningsStats"));
            const second = JSON.parse(localStorage.getItem("secondInningsStats"));
            const winner = winningTeamName;

            if (!winner || winner === "Match Tied") return "N/A";

            const combined = {};

            function merge(inn) {
                if (!inn) return;

                const team = inn.battingTeam;

                // 🏏 Only consider winning team players
                if (team !== winner) return;

                Object.entries(inn.batsmanStats || {}).forEach(([name, s]) => {
                    if (!combined[name]) {
                        combined[name] = {
                            runs: 0,
                            balls: 0,
                            wickets: 0,
                            ballsBowled: 0,
                            runsConceded: 0
                        };
                    }

                    combined[name].runs += s.runs || 0;
                    combined[name].balls += s.balls || 0;
                });

                Object.entries(inn.bowlerStats || {}).forEach(([name, b]) => {
                    if (!combined[name]) {
                        combined[name] = {
                            runs: 0,
                            balls: 0,
                            wickets: 0,
                            ballsBowled: 0,
                            runsConceded: 0
                        };
                    }

                    combined[name].wickets += b.wickets || 0;
                    combined[name].ballsBowled += b.balls || 0;
                    combined[name].runsConceded += b.runs || 0;
                });
            }

            merge(first);
            merge(second);

            let bestPlayer = null;
            let bestImpact = -Infinity;

            Object.entries(combined).forEach(([name, s]) => {

                const sr = s.balls ? (s.runs / s.balls) * 100 : 0;
                const overs = s.ballsBowled / 6;
                const eco = overs ? s.runsConceded / overs : 0;

                let impact = 0;

                // 🏏 Batting value
                impact += s.runs * 2;

                // 🎯 Bowling value
                impact += s.wickets * 45;

                // 🔥 Strike rate bonus (only if 20+ runs)
                if (s.runs >= 20) impact += sr / 10;

                // 🎯 Economy bonus (only if bowled 2+ overs)
                if (overs >= 2) impact += (8 - eco) * 5;

                if (impact > bestImpact) {
                    bestImpact = impact;
                    bestPlayer = name;
                }
            });

            return bestPlayer || "N/A";
        }










        // 🟢 AUTO SAVE MATCH RESULT


        saveMatchToHistory(resultText, finalState);

        // Clear live state since match is done
        localStorage.removeItem("liveMatchState");
        localStorage.removeItem("currentMatch");




    }



    function generateInsights() {

        let topRuns = 0;
        let topPlayer = null;

        Object.entries(batsmanStats).forEach(([name, stats]) => {
            if (stats.runs > topRuns) {
                topRuns = stats.runs;
                topPlayer = name;
            }
        });

        if (!topPlayer) return "No top performer";

        return `🔥 Top Scorer: ${topPlayer} (${topRuns} runs)`;
    }




    function recordState() {
        history.push(JSON.stringify({
            score,
            wickets,
            balls,
            striker,
            nonStriker,
            currentBowler,
            outBatsmen: [...outBatsmen],
            outTypes: { ...outTypes },
            usedBowlers: [...usedBowlers],
            batsmanStats: JSON.parse(JSON.stringify(batsmanStats)),
            bowlerStats: JSON.parse(JSON.stringify(bowlerStats)),
            inningsStats: JSON.parse(JSON.stringify(inningsStats)), // 🔥 IMPORTANT
            ballHistory: [...ballHistory],
            innings,
            target,
            matchFinished
        }));
    }




    function swapStrike() {
        const strikerBox = appOverlayContent.querySelector(".striker-box");
        const nonStrikerBox = appOverlayContent.querySelector(".nonstriker-box");

        if (!strikerBox || !nonStrikerBox) return;

        strikerBox.classList.add("strike-flip");
        nonStrikerBox.classList.add("strike-flip");

        setTimeout(() => {
            [striker, nonStriker] = [nonStriker, striker];
            updateDisplay();

            strikerBox.classList.remove("strike-flip");
            nonStrikerBox.classList.remove("strike-flip");
        }, 350);
    }



    function updateTotalRunsUI() {
        const stats = inningsStats[innings];

        const map = {
            0: "zeros",
            1: "ones",
            2: "twos",
            3: "threes",
            4: "fours",
            6: "sixes",
            WB: "wides",
            NB: "nobes",
            LB: "byes"
        };

        Object.keys(map).forEach(key => {
            const el = document.getElementById(map[key]);
            if (el) el.innerText = stats[key] || 0;
        });
    }






    function addRuns(run, extra = false) {
        vibrateTap(10);

        if (innings === 2 && score >= target) {
            showMatchResult();
            return;
        }

        if (run === 4) showCelebration(4);
        if (run === 6) showCelebration(6);




        if (!striker || !nonStriker) return showPopup("Select both batsmen first");
        if (!currentBowler) return showPopup("Select bowler first");

        recordState();
        if (!extra && [0, 1, 2, 3, 4, 6].includes(run)) {
            inningsStats[innings][run]++;
        }

        score += run;
        // 🏆 INSTANT MATCH END IF TARGET CHASED
        if (innings === 2 && target && score >= target) {

            balls++; // count this ball
            batsmanStats[striker].runs += run;
            batsmanStats[striker].balls++;
            bowlerStats[currentBowler].balls++;
            bowlerStats[currentBowler].runs += run;

            ballHistory.push(run.toString());

            showMatchResult();   // 🔥 END MATCH NOW
            return;              // ⛔ STOP FURTHER CODE
        }




        if (!extra) {
            balls++;

            batsmanStats[striker].runs += run;
            batsmanStats[striker].balls++;

            bowlerStats[currentBowler].balls++;
            bowlerStats[currentBowler].runs += run;

            if (run % 2 === 1) swapStrike();

            // 🟢 OVER COMPLETE
            if (balls % 6 === 0) {
                swapStrike();
                lastBowler = currentBowler;
                if (!usedBowlers.includes(currentBowler)) {
                    usedBowlers.push(currentBowler); // save finished bowler
                }

                currentBowler = null;
                showPopup("Select next bowler");
            }

        }

        if (!extra) {
            ballHistory.push(run.toString());
        } else {
            ballHistory.push("NB");
        }





        updateDisplay();
        checkInningsEnd();

    }



    function addWicket(type = "W") {

        if (balls >= maxBalls) {
            showPopup("Innings Complete 🏁");
            return;
        }
        if (window.Android) {
            Android.vibrate(200);
        } else {
            navigator.vibrate([100, 50, 100]);
        }


        if (!striker || !currentBowler) return;

        recordState();
        wickets++;
        balls++;

        batsmanStats[striker].balls++;
        bowlerStats[currentBowler].balls++;
        bowlerStats[currentBowler].wickets++;

        outBatsmen.push(striker); // store dismissed batsman
        outTypes[striker] = type;

        striker = null;

        inningsStats[innings]["W"]++;

        if (balls % 6 === 0) {
            swapStrike();
            lastBowler = currentBowler;
            currentBowler = null;
            showPopup("Over finished — Select next bowler");
        }

        ballHistory.push("W");

        showCelebration("W");

        updateDisplay();
        updateDisplay();

        // 🏁 LAST WICKET LOGIC
        if (wickets >= players.length - 1) {

            if (innings === 1) {
                showInningsComplete();
            } else {
                showMatchResult();
            }

            return; // 🚨 STOP execution
        }

        checkInningsEnd();
        showPopup("Select new batsman");

    }



    function undo() {
        if (matchFinished) return showPopup("Cannot undo after match finished");

        if (!history.length) return;

        const prev = JSON.parse(history.pop());

        score = prev.score;
        wickets = prev.wickets;
        balls = prev.balls;
        striker = prev.striker;
        nonStriker = prev.nonStriker;
        currentBowler = prev.currentBowler;

        outBatsmen = prev.outBatsmen;
        outTypes = prev.outTypes;
        usedBowlers = prev.usedBowlers;

        batsmanStats = prev.batsmanStats;
        bowlerStats = prev.bowlerStats;
        inningsStats = prev.inningsStats;

        ballHistory = prev.ballHistory;
        innings = prev.innings;
        target = prev.target;
        matchFinished = prev.matchFinished;

        updateDisplay();
    }




    // Run Buttons
    runButtons.forEach(btn => {
        btn.onclick = () => {
            const val = btn.innerText.trim();

            if (val === "NB") {
                openNoBallOptions();
                return;
            }

            // 🟡 WIDE BALL
            else if (val === "WB") {
                inningsStats[innings]["WB"]++;
                score += 1;
                ballHistory.push("WB");
                updateDisplay();
                return;
            }

            // 🟡 LEG BYE
            else if (val === "LB") {
                inningsStats[innings][1]++;
                addRuns(1, false);
            }

            // 🟢 NORMAL RUNS (THIS WAS MISSING ❌)
            else {
                const run = parseInt(val);
                if (!isNaN(run)) {
                    addRuns(run, false);
                }
            }
        };
    });


    function openNoBallOptions() {

        const popup = document.createElement("div");
        popup.className = "runout-popup";

        popup.innerHTML = `
        <div class="runout-box">
            <h3>No Ball</h3>
            <button data-run="1">1</button>
            <button data-run="2">2</button>
            <button data-run="3">3</button>
            <button data-run="4">4</button>
            <button data-run="6">6</button>
        </div>
    `;

        document.body.appendChild(popup);

        popup.querySelectorAll("button").forEach(btn => {
            btn.onclick = () => {

                const run = parseInt(btn.dataset.run);

                inningsStats[innings]["NB"]++;

                // Add runs but DO NOT count ball
                score += run;

                batsmanStats[striker].runs += run;
                batsmanStats[striker].balls++;

                bowlerStats[currentBowler].runs += run;

                ballHistory.push("NB" + run);

                updateDisplay();
                popup.remove();
            };
        });

        popup.onclick = (e) => {
            if (e.target === popup) popup.remove();
        };
    }


    wicketButtons.forEach(btn => {

        btn.onclick = () => {

            const type = btn.innerText.trim();

            if (type === "R") {
                openRunOutOptions();
                return;
            }

            addWicket(type);
        };
    });


    function openRunOutOptions() {

        const popup = document.createElement("div");
        popup.className = "runout-popup";

        popup.innerHTML = `
        <div class="runout-box">
            <h3>Run Out</h3>
            <button data-run="0">0W</button>
            <button data-run="1">1W</button>
            <button data-run="2">2W</button>
            <button data-run="3">3W</button>
        </div>
    `;

        document.body.appendChild(popup);

        popup.querySelectorAll("button").forEach(btn => {
            btn.onclick = () => {

                const run = parseInt(btn.dataset.run);

                recordState();

                if (run > 0) {
                    score += run;
                    batsmanStats[striker].runs += run;
                    batsmanStats[striker].balls++;
                }

                wickets++;
                balls++;

                batsmanStats[striker].balls++;
                bowlerStats[currentBowler].balls++;
                bowlerStats[currentBowler].wickets++;

                outBatsmen.push(striker);
                outTypes[striker] = "RO";

                ballHistory.push("W" + run); // 🔥 IMPORTANT

                striker = null;

                updateDisplay();
                checkInningsEnd();

                popup.remove();
            };
        });

        popup.onclick = (e) => {
            if (e.target === popup) popup.remove();
        };
    }


    undoBtn.onclick = undo;

    // Batsman Selection
    strikerEl.onclick = () => {
        if (striker) return; // already selected — do nothing
        openBatsmanSelector("striker");
    };

    nonStrikerEl.onclick = () => {
        if (nonStriker) return; // already selected — do nothing
        openBatsmanSelector("non");
    };




    function openBatsmanSelector(type) {
        const popup = document.getElementById("batsmanPopup");
        const list = document.getElementById("batsmanList");

        if (!popup || !list) {
            console.error("Batsman popup elements missing in HTML");
            return;
        }

        list.innerHTML = `<div class="selector-title">
        Select ${type === "striker" ? "Striker" : "Non-Striker"}
    </div>`;

        players.forEach(player => {

            if (
                player.name === striker ||
                player.name === nonStriker ||
                outBatsmen.includes(player.name)
            ) return;

            const row = document.createElement("div");
            row.className = "selector-row";

            row.innerHTML = `
        <span class="sel-name">${player.name}</span>
        <span class="tag">${player.batting}</span>
        <span class="tag">${player.role}</span>
    `;

            row.onclick = () => {
                if (type === "striker") striker = player.name;
                else nonStriker = player.name;

                closeBatsmanPopup();
                updateDisplay();
            };

            list.appendChild(row);
        });






        popup.style.display = "flex";
    }




    function openBowlerSelector() {
        const popup = document.getElementById("bowlerPopup");
        const list = document.getElementById("bowlerList");

        if (!popup || !list) {
            console.error("Bowler popup elements missing in HTML");
            return;
        }

        list.innerHTML = `<div class="selector-title">Select Bowler</div>`;

        bowlers.forEach(player => {

            if (player.name === lastBowler) return;

            const row = document.createElement("div");
            row.className = "selector-row";

            row.innerHTML = `
        <span class="sel-name">${player.name}</span>
        <span class="tag">${player.bowling}</span>
    `;

            row.onclick = () => {
                currentBowler = player.name;
                ballHistory.push("|");

                if (!usedBowlers.includes(player.name)) {
                    usedBowlers.push(player.name);
                }

                closeBowlerPopup();
                updateDisplay();
            };

            list.appendChild(row);
        });

        popup.style.display = "flex";
    }
    setTimeout(() => {
        const backBtn = document.getElementById("liveBackBtn");
        if (!backBtn) return;

        backBtn.onclick = () => {
            const liveState = JSON.parse(localStorage.getItem("liveMatchState"));

            // 🏁 If match already finished → just go home (already saved)
            if (liveState?.matchFinished) {
                closeAfterMatch();
                return;
            }

            // 🛑 If match in progress → ask quit confirmation
            openQuitPopup();
        };

    }, 100);


    function showHeaderMessage(text) {
        const tag = document.getElementById("inningsTag");
        if (!tag) return;

        tag.innerText = text;
        tag.style.color = "#facc15";

        setTimeout(() => {
            tag.innerText = innings === 1 ? "1st Innings" : "2nd Innings";
            tag.style.color = "";
        }, 2000);
    }


    function showInningsComplete() {
        // Clear batsman UI boxes
        const strikerBox = appOverlayContent.querySelector(".striker-box .name");
        const nonStrikerBox = appOverlayContent.querySelector(".nonstriker-box .name");
        const strikerSub = appOverlayContent.querySelector(".striker-box .sub");
        const nonStrikerSub = appOverlayContent.querySelector(".nonstriker-box .sub");

        if (strikerBox) strikerBox.innerText = "Select Striker";
        if (nonStrikerBox) nonStrikerBox.innerText = "Select Non-Striker";
        if (strikerSub) strikerSub.innerText = "";
        if (nonStrikerSub) nonStrikerSub.innerText = "";

        if (innings === 1) {

            localStorage.setItem("firstInningsStats", JSON.stringify({
                battingTeam: match.yourTeam.teamName,
                bowlingTeam: match.opponentTeam.teamName,
                batsmanStats: JSON.parse(JSON.stringify(batsmanStats)),
                bowlerStats: JSON.parse(JSON.stringify(bowlerStats)),
                outBatsmen: [...outBatsmen],
                outTypes: { ...outTypes },   // 🔥 IMPORTANT
                inningsStats: JSON.parse(JSON.stringify(inningsStats)),
                score,
                wickets,
                balls
            }));

            target = score + 1;
            innings = 2;
            updateInningsButtons();

            const oversText = `${Math.floor(balls / 6)}.${balls % 6}`;

            const popupHTML = `
                <div class="match-result-card">
                    <h2>🏁 1st Innings Complete</h2>
                    <p><b>${match.yourTeam.teamName}</b></p>
                    <h3>${score}/${wickets} (${oversText} ov)</h3>
                    <div class="target-box">
                        🎯 Target: <b>${target}</b>
                    </div>
                    <button onclick="closePopup()">Start 2nd Innings</button>
                </div>
            `;

            showPopup(popupHTML);

            // 🔄 Swap teams in match object
            // 🔄 REAL TEAM SWAP
            // 🔄 REAL TEAM SWAP
            // 🔄 Swap teams
            const temp = match.yourTeam;
            match.yourTeam = match.opponentTeam;
            match.opponentTeam = temp;

            // Save swapped teams
            localStorage.setItem("currentMatch", JSON.stringify(match));

            // Rebuild player pools
            players = [...match.yourTeam.players];
            bowlers = [...match.opponentTeam.players];

            // Update team labels on UI
            updateTeamLabels();




            // 🧹 RESET INNINGS STATE
            score = 0;
            wickets = 0;
            balls = 0;
            striker = null;
            nonStriker = null;
            currentBowler = null;
            outBatsmen = [];
            usedBowlers = [];
            lastBowler = null;
            outTypes = {};

            // 🧠 Reset stats objects for new innings
            batsmanStats = {};
            bowlerStats = {};

            players.forEach(p => {
                batsmanStats[p.name] = { runs: 0, balls: 0 };
            });

            bowlers.forEach(p => {
                bowlerStats[p.name] = { balls: 0, runs: 0, wickets: 0 };
            });


            updateDisplay();
            return;
        }


        // updateDisplay()/;
    }


    function checkInningsEnd() {

        // 🏁 FIRST INNINGS END
        if (innings === 1 && (balls >= maxBalls || wickets >= players.length - 1)) {
            showInningsComplete();
            return;
        }

        // 🏁 SECOND INNINGS END (TARGET NOT CHASED)
        if (innings === 2 && (balls >= maxBalls || wickets >= players.length - 1)) {
            showMatchResult();
            return;
        }
    }




    updateDisplay();
    function updateInningsButtons() {
        if (!firstBtn || !secondBtn || !switchBox) return;

        if (innings === 1) {
            firstBtn.classList.add("innings-active");
            secondBtn.classList.remove("innings-active");
            switchBox.classList.remove("second-active");
        } else {
            secondBtn.classList.add("innings-active");
            firstBtn.classList.remove("innings-active");
            switchBox.classList.add("second-active");
        }
    }

    firstBtn.onclick = () => {
        if (innings === 1) return; // already live 1st innings
        vibrateTap(10);

        firstBtn.classList.add("innings-active");
        secondBtn.classList.remove("innings-active");
        switchBox.classList.remove("second-active");

        showOnlyFirstInningsStats();
    };

    secondBtn.onclick = () => {
        vibrateTap(10);

        secondBtn.classList.add("innings-active");
        firstBtn.classList.remove("innings-active");
        switchBox.classList.add("second-active");

        restoreLiveUI();
        updateDisplay();
    };








    function updateTimeline() {
        if (!timelineEl) return;

        timelineEl.innerHTML = "";

        // Get balls in CURRENT over only
        const ballsInCurrentOver = balls % 6 === 0 ? 6 : balls % 6;
        let temp = [];
        for (let i = ballHistory.length - 1; i >= 0; i--) {
            if (ballHistory[i] === "|") break;
            temp.unshift(ballHistory[i]);
        }
        const thisOverBalls = temp;



        thisOverBalls.forEach(b => {
            const div = document.createElement("div");
            div.classList.add("ball");

            if (b === "W") div.classList.add("wicket");
            else if (b === "4") div.classList.add("four");
            else if (b === "6") div.classList.add("six");
            else if (b === "NB" || b === "WB") div.classList.add("extra");
            else if (b === "0") div.classList.add("dot");
            else div.classList.add("run");

            div.innerText = b === "0" ? "•" : b;
            timelineEl.appendChild(div);
        });
    }

    function showOnlyFirstInningsStats() {
        const liveSections = appOverlayContent.querySelectorAll(
            ".live-batsman, .live-bowler, .update-score, .this-over"
        );
        liveSections.forEach(el => el.style.display = "none");
        const data = JSON.parse(localStorage.getItem("firstInningsStats"));
        if (!data) return;
        const totals = appOverlayContent.querySelector(".total-runs");
        if (totals) totals.style.display = "none";


        const liveBatsman = appOverlayContent.querySelector(".live-batsman");
        const liveBowler = appOverlayContent.querySelector(".live-bowler");
        const updateScore = appOverlayContent.querySelector(".update-score");
        const thisOver = appOverlayContent.querySelector(".this-over");
        batsmanStatsList.innerHTML = "<h4 style='margin:15px'>1st Innings Batting</h4>";
        bowlerStatsList.innerHTML = "<h4>1st Innings Bowling</h4>";
        const stats = data.inningsStats?.[1];
        if (stats) {
            const summary = document.createElement("div");

            summary.className = "innings-summary";
            summary.innerHTML = `
                <h4>Ball Summary</h4>
                0s: ${stats[0]} | 1s: ${stats[1]} | 2s: ${stats[2]} |
                3s: ${stats[3]} | 4s: ${stats[4]} | 6s: ${stats[6]} |
                W: ${stats.W}
            `;
            batsmanStatsList.prepend(summary);
        }

        if (liveBatsman) liveBatsman.style.display = "none";
        if (liveBowler) liveBowler.style.display = "none";
        if (updateScore) updateScore.style.display = "none";
        if (thisOver) thisOver.style.display = "none";



        Object.keys(data.batsmanStats).forEach(name => {

            const s = data.batsmanStats[name];
            if (s.balls === 0) return;
            const sr = s.balls ? ((s.runs / s.balls) * 100).toFixed(1) : "0";
            const type = data.outTypes?.[name];
            const playerObj = players.find(p => p.name === name);

            const tags = `
                ${playerObj?.captain ? '<span class="tag captain">C</span>' : ''}
                ${playerObj?.viceCaptain ? '<span class="tag vice">VC</span>' : ''}
                ${playerObj?.wicketKeeper ? '<span class="tag wk">WK</span>' : ''}
            `;

            const row = document.createElement("div");
            row.className = "stat-row old";

            row.innerHTML = `
                <span class="stat-name">
                    ${name} ${tags}
                </span>
                <span>${type ? `<small>(${type})</small>` : "*"}</span>
                <span>${s.runs} (${s.balls})</span>
                <span>${sr}</span>

            `;

            batsmanStatsList.appendChild(row);
        });


        Object.entries(data.bowlerStats || {}).forEach(([name, b]) => {

            if (!b || b.balls === 0) return;   // 🔥 ONLY SHOW ACTIVE BOWLERS

            const overs = `${Math.floor(b.balls / 6)}.${b.balls % 6}`;
            const eco = balls ? (b.runs / (balls / 6)).toFixed(2) : "0.00";
            const row = document.createElement("div");
            row.className = "stat-row old";
            row.innerHTML = `
                <span class="stat-name">${name}</span>
                <span>${overs} ov</span>
                <span>${b.wickets}/${b.runs}</span>
                <span>${eco}</span>
            `;

            bowlerStatsList.appendChild(row);
        });
        showHeaderMessage("1st Innings Summary");
    }


    function restoreLiveUI() {
        const liveBatsman = appOverlayContent.querySelector(".live-batsman");
        const liveBowler = appOverlayContent.querySelector(".live-bowler");
        const updateScore = appOverlayContent.querySelector(".update-score");
        const thisOver = appOverlayContent.querySelector(".this-over");
        const totals = appOverlayContent.querySelector(".total-runs");

        if (totals) totals.style.display = "";
        if (liveBatsman) liveBatsman.style.display = "";
        if (liveBowler) liveBowler.style.display = "";
        if (updateScore) updateScore.style.display = "";
        if (thisOver) thisOver.style.display = "";
        const liveSections = appOverlayContent.querySelectorAll(
            ".live-batsman, .live-bowler, .update-score, .this-over"
        );
        liveSections.forEach(el => el.style.display = "");

        // ❗ CLEAR OLD SUMMARY CONTENT
        batsmanStatsList.innerHTML = "";
        bowlerStatsList.innerHTML = "";
    }






}


function showCelebration(type) {

    const el = document.createElement("div");
    el.className = "celebration";

    document.body.classList.add(type === 4 ? "four-glow" :
        type === 6 ? "six-glow" :
            "wicket-glow");

    setTimeout(() => {
        document.body.classList.remove("four-glow", "six-glow", "wicket-glow");
    }, 1000);

}


function saveMatchToHistory(resultText, secondInningsState) {
    const history = JSON.parse(localStorage.getItem("matchHistory")) || [];
    const first = JSON.parse(localStorage.getItem("firstInningsStats"));

    if (!secondInningsState || !first) return;

    const matchId = "match_" + Date.now();

    const historyItem = {
        id: matchId,
        date: new Date().toLocaleString(),
        teamA: first.battingTeam,
        teamB: secondInningsState.battingTeam,
        result: resultText,
        innings: {
            1: {
                team: first.battingTeam,
                score: `${first.score}/${first.wickets}`,
                overs: `${Math.floor(first.balls / 6)}.${first.balls % 6}`,
                batsmanStats: first.batsmanStats,
                bowlerStats: first.bowlerStats,
                outTypes: first.outTypes,   // ADD THIS
                summary: first.inningsStats
                    ? first.inningsStats[1]
                    : {},
                battingOrder: Object.keys(first.batsmanStats),


            },
            2: {
                team: secondInningsState.battingTeam,
                score: `${secondInningsState.score}/${secondInningsState.wickets}`,
                overs: `${Math.floor(secondInningsState.balls / 6)}.${secondInningsState.balls % 6}`,
                batsmanStats: secondInningsState.batsmanStats,
                bowlerStats: secondInningsState.bowlerStats,
                outTypes: secondInningsState.outTypes,   // ADD THIS
                summary: secondInningsState.inningsStats
                    ? secondInningsState.inningsStats[2]
                    : {},
                battingOrder: Object.keys(secondInningsState.batsmanStats),


            }

        }
    };

    history.unshift(historyItem);
    localStorage.setItem("matchHistory", JSON.stringify(history));
}





function shareMatch() {
    const state = JSON.parse(localStorage.getItem("liveMatchState"));
    const match = JSON.parse(localStorage.getItem("currentMatch"));

    const text = `🏏 Match Result\n${match.yourTeam.teamName} vs ${match.opponentTeam.teamName}\nScore: ${state.score}/${state.wickets}\nResult: ${state.winningTeamName}`;

    if (navigator.share) {
        navigator.share({ text });
    } else {
        navigator.clipboard.writeText(text);
        showPopup("Match result copied to clipboard 📋");
    }
}



function closeBatsmanPopup() {
    document.getElementById("batsmanPopup").style.display = "none";
}


function closeBowlerPopup() {
    document.getElementById("bowlerPopup").style.display = "none";
}



function openQuitPopup() {
    const popup = document.getElementById("quitMatchPopup");
    popup.style.display = "flex";
    popup.classList.remove("show");
    void popup.offsetWidth;
    popup.classList.add("show");
}


function closeQuitPopup() {
    const popup = document.getElementById("quitMatchPopup");
    popup.classList.remove("show");

    setTimeout(() => {
        popup.style.display = "none";
    }, 200);
}



function confirmQuitMatch() {

    const state = JSON.parse(localStorage.getItem("liveMatchState"));
    const match = JSON.parse(localStorage.getItem("currentMatch"));

    if (match) {
        const safeState = state || {
            score: 0,
            wickets: 0,
            balls: 0,
            batsmanStats: {},
            bowlerStats: {},
            inningsStats: {
                1: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 6: 0, W: 0, NB: 0, WB: 0 },
                2: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 6: 0, W: 0, NB: 0, WB: 0 }
            }
        };

        saveMatchToHistory("Match Abandoned", {
            ...safeState,
            battingTeam: match.yourTeam.teamName
        });
    }

    // 🔴 CLOSE POPUP FIRST
    closeQuitPopup();

    // 🧹 THEN CLEAN MATCH
    closeAfterMatch();
}







function discardMatch() {
    closeAfterMatch();
    closeQuitPopup();
}

function closeAfterMatch() {
    selectedYourTeam = null;
    selectedOpponentTeam = null;
    selectingFor = null;

    // Ensure popup hidden
    const quitPopup = document.getElementById("quitMatchPopup");
    if (quitPopup) quitPopup.style.display = "none";

    localStorage.removeItem("liveMatchState");
    localStorage.removeItem("currentMatch");

    document.querySelector("footer").style.display = "flex";

    screenStack = ["home"];
    currentScreen = "home";

    appOverlay.classList.remove("active");
    setActiveNav("home");
    setupCareerSection();

    history.pushState({ screen: "home" }, "");
}






function loadHistoryScreen() {
    const container = appOverlayContent.querySelector(".overlay-content");
    const history = JSON.parse(localStorage.getItem("matchHistory")) || [];

    container.innerHTML = `

    <button id="clearHistoryBtn" class="clear-history-btn">🗑 Clear History</button>

    <div class="history-tabs">
        <button class="history-tab active" data-filter="all">All</button>
        <button class="history-tab" data-filter="won">Wins</button>
        <button class="history-tab" data-filter="lost">Losses</button>
        <button class="history-tab" data-filter="tied">Tied</button>
    </div>

    <div id="historyList"></div>
`;

    const clearBtn = container.querySelector("#clearHistoryBtn");
    clearBtn.onclick = () => {
        openConfirmPopup("Delete all match history?", () => {
            localStorage.removeItem("matchHistory");
            showPopup("Match history cleared 🗑");
            loadHistoryScreen();
        });
    };


    const listEl = container.querySelector("#historyList");

    function renderList(filter) {
        const allHistory = JSON.parse(localStorage.getItem("matchHistory")) || [];
        listEl.innerHTML = "";

        const filtered = allHistory.filter(match => {
            if (filter === "all") return true;
            if (filter === "won") return match.result.includes("Won");
            if (filter === "lost") return match.result.includes("Lost");
            if (filter === "tied") return match.result.includes("Tied");
        });

        if (filtered.length === 0) {
            listEl.innerHTML = "<p class='no-history'>No matches found.</p>";
            return;
        }

        filtered.forEach(match => {
            const card = document.createElement("div");
            card.className = "history-card";

            card.innerHTML = `
            <div class="history-card-top">
                <span class="teams">${match.teamA} <span class="vs">vs</span> ${match.teamB}</span>
                <button class="delete-match" data-id="${match.id}">−</button>
            </div>

            <div class="history-scores">
                <div>${match.innings[1].team}:
                    <p><span class="score">${match.innings[1].score}</span>
                    <span>(${match.innings[1].overs})</span></p>
                </div>
                <div>${match.innings[2].team}:
                    <p><span class="score">${match.innings[2].score}</span>
                    <span>(${match.innings[2].overs})</span></p>
                </div>
            </div>

            <div><span class="history-result">${match.result}</span></div>

            <div class="history-card-bottom">
                <span>${match.date}</span>
            </div>
        `;

            // 🔹 View Details Click
            card.addEventListener("click", () => {
                showHistoryDetails(match);
            });

            // 🔹 Delete Button Click
            const deleteBtn = card.querySelector(".delete-match");
            deleteBtn.addEventListener("click", (e) => {
                e.stopPropagation();

                let historyData = JSON.parse(localStorage.getItem("matchHistory")) || [];
                historyData = historyData.filter(m => m.id !== match.id);

                localStorage.setItem("matchHistory", JSON.stringify(historyData));

                vibrateTap(20);
                showPopup("Match deleted 🗑");

                renderList(filter); // re-render same filter
            });

            listEl.appendChild(card);
        });
    }

    renderList("all");

    container.querySelectorAll(".history-tab").forEach(tab => {
        tab.onclick = () => {
            container.querySelectorAll(".history-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            renderList(tab.dataset.filter);
        };
    });
}


function renderInnings(inn) {

    const teams = JSON.parse(localStorage.getItem("teams")) || [];
    const teamObj = teams.find(t => t.teamName === inn.team);

    return `
        <div class="scorecard-innings">

            <div class="innings-header-pro">
                <div class="team-name">${inn.team}</div>
                <div class="team-score">${inn.score} (${inn.overs} ov)</div>
            </div>

            <div class="score-table">
                <div class="thead">
                    <span>Batter</span>
                    <span>R</span>
                    <span>B</span>
                    <span>SR</span>
                </div>

                ${Object.entries(inn.batsmanStats || {})
            .filter(([_, s]) => s.balls > 0)
            .map(([name, s]) => {

                const sr = s.balls ? ((s.runs / s.balls) * 100).toFixed(1) : "0";
                const type = inn.outTypes?.[name];

                const playerObj = teamObj?.players.find(p => p.name === name);

                const tags = `
            ${playerObj?.captain ? '<span class="tag captain">C</span>' : ''}
            ${playerObj?.viceCaptain ? '<span class="tag vice">VC</span>' : ''}
            ${playerObj?.wicketKeeper ? '<span class="tag wk">WK</span>' : ''}
        `;

                return `
            <div class="row">
                <span>
                    ${name} ${tags}
                    ${type ? `<small class="dismissal">(${type})</small>` : "*"}
                </span>
                <span>${s.runs}</span>
                <span>${s.balls}</span>
                <span>${sr}</span>
            </div>
        `;
            }).join("")}
            </div>

            <div class="score-table">
                <div class="thead">
                    <span>Bowler</span>
                    <span>O</span>
                    <span>R</span>
                    <span>W</span>
                </div>

                ${Object.entries(inn.bowlerStats || {})
            .filter(([_, b]) => b.balls > 0)   // 🔥 FILTER HERE
            .map(([name, b]) => {
                const overs = `${Math.floor(b.balls / 6)}.${b.balls % 6}`;
                return `
                        <div class="row">
                            <span>${name}</span>
                            <span>${overs}</span>
                            <span>${b.runs}</span>
                            <span>${b.wickets}</span>
                        </div>
                    `;
            }).join("")}
            </div>

            <div class="summary-line">
                0s: ${inn.summary?.[0] || 0} |
                4s: ${inn.summary?.[4] || 0} |
                6s: ${inn.summary?.[6] || 0} |
                W: ${inn.summary?.W || 0}
            </div>

        </div>
    `;
}


function shareHistoryMatch(match) {

    const text = `
🏏 Match Result
${match.teamA} vs ${match.teamB}

1st Innings:
${match.innings[1].team} - ${match.innings[1].score} (${match.innings[1].overs})

2nd Innings:
${match.innings[2].team} - ${match.innings[2].score} (${match.innings[2].overs})

Result:
${match.result}
    `;

    if (navigator.share) {
        navigator.share({ text });
    }
    else if (window.Android && Android.shareImage) {

        // simple text share for android
        Android.shareImage("", text);

    }
    else {
        navigator.clipboard.writeText(text);
        showPopup("Match summary copied 📋");
    }
}


function showHistoryDetails(match) {
    const popup = document.createElement("div");
    popup.className = "history-popup";

    popup.innerHTML = `
        <div class="history-popup-content pro-scorecard">

            <div class="scorecard-header">
                <h2>${match.teamA} vs ${match.teamB}</h2>
                <div class="match-result">${match.result}</div>
            </div>

            <div class="scorecard-tabs">
                <button class="tab active" data-tab="1">${match.innings[1].team}</button>
                <button class="tab" data-tab="2">${match.innings[2].team}</button>
            </div>

            <div class="scorecard-body">
                <div class="innings-panel active" id="tab-1">
                    ${renderInnings(match.innings[1])}
                </div>
                <div class="innings-panel" id="tab-2">
                    ${renderInnings(match.innings[2])}
                </div>
            </div>

            <button class="share-history">Share Match</button>
            <button class="close-btn" onclick="this.closest('.history-popup').remove()">Close</button>        </div>
    `;

    document.body.appendChild(popup);
    popup.querySelector(".share-history").onclick = () => {
        shareHistoryMatch(match);
    };

    popup.querySelectorAll(".tab").forEach(btn => {
        btn.addEventListener("click", () => {
            const tabId = "tab-" + btn.dataset.tab;

            popup.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
            popup.querySelectorAll(".innings-panel").forEach(p => p.classList.remove("active"));

            btn.classList.add("active");

            const panel = popup.querySelector("#" + tabId);
            if (panel) panel.classList.add("active");
        });
    });

}



function buildInningsScorecard(match, inningsNo) {
    const data = match.inningsStats?.[inningsNo];
    const batStats = match.batsmanStats?.[inningsNo] || {};
    const bowlStats = match.bowlerStats?.[inningsNo] || {};

    if (!data) return "<p>No data</p>";

    return `
        <div class="score-section">

            <h3>Batting</h3>
            <div class="table">
                <div class="thead">
                    <span>Batter</span><span>R</span><span>B</span><span>SR</span>
                </div>
                ${Object.entries(batStats).map(([name, s]) => {
        const sr = s.balls ? ((s.runs / s.balls) * 100).toFixed(1) : "0";
        return `<div class="row">
                        <span>${name}</span>
                        <span>${s.runs}</span>
                        <span>${s.balls}</span>
                        <span>${sr}</span>
                    </div>`;
    }).join("")}
            </div>

            <h3>Bowling</h3>
            <div class="table">
                <div class="thead">
                    <span>Bowler</span><span>O</span><span>R</span><span>W</span>
                </div>
                ${Object.entries(bowlStats).map(([name, b]) => {
        const overs = `${Math.floor(b.balls / 6)}.${b.balls % 6}`;
        return `<div class="row">
                        <span>${name}</span>
                        <span>${overs}</span>
                        <span>${b.runs}</span>
                        <span>${b.wickets}</span>
                    </div>`;
    }).join("")}
            </div>

            <h3>Ball Summary</h3>
            <div class="ball-summary">
                0s: ${data[0] || 0} |
                1s: ${data[1] || 0} |
                2s: ${data[2] || 0} |
                3s: ${data[3] || 0} |
                4s: ${data[4] || 0} |
                6s: ${data[6] || 0} |
                W: ${data.W || 0}
            </div>

        </div>
    `;
}


//===========================================================================================

function setupCareerSection() {
    const careerBox = document.querySelector(".career .tabs");
    if (!careerBox) return;

    const teams = JSON.parse(localStorage.getItem("teams")) || [];
    careerBox.innerHTML = "";

    if (teams.length === 0) {
        careerBox.innerHTML = "<p style='color:gray'>No teams created yet</p>";
        return;
    }

    teams.forEach(team => {
        const card = document.createElement("div");
        card.className = "career-team-card";

        card.innerHTML = `
            <div style="display:flex;gap:10px;justify-content:center;align-items:center"><h5>Team:</h5><h4>${team.teamName}</h4></div>
            <p>Tap To View →</p>
        `;

        card.onclick = () => openTeamCareer(team.teamName);
        careerBox.appendChild(card);
    });
}


function openTeamCareer(teamName) {
    localStorage.setItem("lastCareerTeam", teamName);
    openScreen("careerScreen");
}



function loadCareerScreen(teamName) {



    const container = appOverlayContent.querySelector("#careerContent");
    if (!container) return;

    const history = JSON.parse(localStorage.getItem("matchHistory")) || [];
    const teams = JSON.parse(localStorage.getItem("teams")) || [];
    const teamObj = teams.find(t => t.teamName === teamName);
    if (!teamObj) return;

    const playerStats = {};

    teamObj.players.forEach(p => {

        const name = typeof p === "string" ? p : p.name;

        playerStats[name] = {
            runs: 0,
            balls: 0,
            wickets: 0,
            ballsBowled: 0,
            runsConceded: 0,
            matches: 0,
            thirties: 0
        };
    });




    // Collect only YOUR TEAM innings
    history.forEach(match => {

        Object.values(match.innings).forEach(inn => {
            let appeared = new Set();
            // 🏏 Batting stats
            if (inn.team?.trim().toLowerCase() === teamName.trim().toLowerCase()) {

                Object.entries(inn.batsmanStats || {}).forEach(([name, s]) => {
                    if (!playerStats[name]) return;
                    appeared.add(name);
                    playerStats[name].runs += s.runs || 0;
                    playerStats[name].balls += s.balls || 0;
                    playerStats[name].matches += 1;

                    if (s.runs >= 30) playerStats[name].thirties += 1;

                    // 🔥 Track Top Batting
                    if (!playerStats[name].topBat || s.runs > playerStats[name].topBat.runs) {
                        playerStats[name].topBat = {
                            runs: s.runs,
                            balls: s.balls
                        };
                    }
                });
            }

            // 🎯 Bowling stats (team was bowling)
            if (inn.team?.trim().toLowerCase() !== teamName.trim().toLowerCase()) {

                Object.entries(inn.bowlerStats || {}).forEach(([name, b]) => {
                    if (!playerStats[name]) return;

                    playerStats[name].wickets += b.wickets || 0;
                    playerStats[name].ballsBowled += b.balls || 0;
                    playerStats[name].runsConceded += b.runs || 0;

                    // 🔥 Track Top Bowling
                    if (!playerStats[name].topBowl || b.wickets > playerStats[name].topBowl.wickets) {
                        playerStats[name].topBowl = {
                            wickets: b.wickets,
                            runs: b.runs
                        };
                    }
                });
            }

            appeared.forEach(name => {
                if (playerStats[name]) {
                    playerStats[name].matches += 1;
                }
            });

        });

    });


    const sortedPlayers = Object.entries(playerStats).sort((a, b) => {
        if (b[1].runs !== a[1].runs) return b[1].runs - a[1].runs;
        return b[1].wickets - a[1].wickets;
    });

    // ✅ Prevent crash when no data
    if (sortedPlayers.length === 0) {
        container.innerHTML += `<p class="no-career">No player stats available yet.</p>`;
        return;
    }

    const topScorer = sortedPlayers[0][0];

    const bowlSorted = Object.entries(playerStats)
        .sort((a, b) => b[1].wickets - a[1].wickets);

    const topBowler = bowlSorted.length ? bowlSorted[0][0] : null;


    container.innerHTML = `
        <div class="career-header">
            <h2>${teamName}</h2>
            <button id="deleteTeamCareer" class="danger-btn">Delete Team</button>
        </div>

        <div class="career-player-list"></div>
    `;

    const deleteBtn = container.querySelector("#deleteTeamCareer");

    if (deleteBtn) {
        deleteBtn.onclick = () => {
            openDeleteTeamPopup(teamName);
        };
    }



    const list = container.querySelector(".career-player-list");

    sortedPlayers.forEach(([name, s], index) => {
        const sr = s.balls ? ((s.runs / s.balls) * 100).toFixed(1) : "0";
        const overs = s.ballsBowled ? (s.ballsBowled / 6).toFixed(1) : "0";
        const eco = s.ballsBowled ? (s.runsConceded / (s.ballsBowled / 6)).toFixed(2) : "0.00";

        const card = document.createElement("div");
        card.className = "career-player-card";
        card.innerHTML = `
                <div class="player-top">
                    <div class="player-name">
                        🏏 ${name}
                        ${name === topScorer ? '<span class="badge orange">Top Scorer</span>' : ''}
                        ${name === topBowler ? '<span class="badge purple">Top Bowler</span>' : ''}
                    </div>
                    <button class="share-player">Share</button>
                </div>

                <div class="career-stats-grid">
                    <div><span>Matches</span><b>${s.matches}</b></div>
                    <div><span>Runs</span><b>${s.runs}</b></div>
                    <div><span>SR</span><b>${sr}</b></div>
                    <div><span>30+</span><b>${s.thirties}</b></div>
                    <div><span>Wickets</span><b>${s.wickets}</b></div>
                    <div><span>Eco</span><b>${eco}</b></div>
                </div>

                <div class="career-performance">
                    <div>🔥 Best Bat:
                        <b>${s.topBat ? `${s.topBat.runs} (${s.topBat.balls})` : "-"}</b>
                    </div>
                    <div>🎯 Best Bowl:
                        <b>${s.topBowl ? `${s.topBowl.wickets}/${s.topBowl.runs}` : "-"}</b>
                    </div>
                </div>
            `;



        // SHARE BUTTON
        card.querySelector(".share-player").onclick = () => sharePlayerCard(card, name);

        list.appendChild(card);
    });

    const clearBtn = appOverlayContent.querySelector("#clearCareerBtn");

    if (clearBtn) {
        clearBtn.onclick = () => {
            openConfirmPopup(
                "Clear all career stats? This will remove match history permanently.",
                () => {
                    localStorage.removeItem("matchHistory");
                    showPopup("Career stats cleared 🗑");
                    loadCareerScreen(teamName);
                    setupCareerSection();
                }
            );



            setupCareerSection(); // Refresh home career cards
        };
    }


}




function sharePlayerCard(cardEl, playerName) {

    if (typeof html2canvas === "undefined") {
        showPopup("Sharing not supported");
        return;
    }

    html2canvas(cardEl, { scale: 2 }).then(canvas => {

        const base64 = canvas.toDataURL("image/png");

        // ✅ If running inside Android app
        if (window.Android && Android.shareImage) {
            Android.shareImage(base64, playerName + " Career Stats");
            return;
        }

        // 🌐 Browser fallback
        const link = document.createElement("a");
        link.href = base64;
        link.download = playerName + "-stats.png";
        link.click();
    });
}



function showTeamPlayers(teamName) {
    const container = document.getElementById("careerContent");
    const team = JSON.parse(localStorage.getItem("teamCareer"))[teamName];

    container.innerHTML = `<h2>${teamName} Players</h2>`;

    Object.keys(team.players).forEach(name => {
        const p = team.players[name];
        const sr = p.balls ? ((p.runs / p.balls) * 100).toFixed(1) : "0";
        const eco = p.ballsBowled ? (p.runsConceded / (p.ballsBowled / 6)).toFixed(2) : "0";

        const card = document.createElement("div");
        card.className = "player-career-card";
        card.innerHTML = `
            <h4>${name}</h4>
            <p>Runs: ${p.runs} (${p.balls}) | SR: ${sr}</p>
            <p>Wickets: ${p.wickets} | Eco: ${eco}</p>
        `;

        container.appendChild(card);
    });
}



