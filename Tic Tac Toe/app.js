$(() => {
    const session = sessionStorage.getItem("account");
    if (session) {
        showMain(session);
    } else {
        showLogin();
    }

    $("#loginForm").submit(function (e) {
        e.preventDefault();

        const formData = formFormat($(this).serializeArray());

        const check = JSON.parse(localStorage.getItem(formData.username));

        if (check) {
            if (formData.password == check.password) {
                sessionStorage.setItem("account", formData.username);
                showMain(formData.username);
            } else {
                $("#loginWarn").slideDown("fast");
            }
        } else {
            $("#loginWarn").slideDown("fast");
        }
    });

    $("#signUpForm").submit(function (e) {
        e.preventDefault();

        const formData = formFormat($(this).serializeArray());

        const check = localStorage.getItem(formData.username);

        const data = {
            username: formData.username,
            password: formData.password,
            matches: {
                "game-1": {
                    status: false,
                    moves: [[], []],
                    player: 1,
                },
            },
        };

        if (check) {
            $("#signUpWarn").slideDown("fast");
        } else {
            localStorage.setItem(formData.username, JSON.stringify(data));
            sessionStorage.setItem("account", formData.username);
            showMain(formData.username);
        }
    });

    $(".tile").click(function (e) {
        e.preventDefault();

        // data declare: immutable
        const tile = $(this).attr("id");

        // data declare: mutable
        let userData = JSON.parse(localStorage.getItem(sessionStorage.getItem("account")));
        let latestGame = userData.matches[Object.keys(userData.matches)[Object.keys(userData.matches).length - 1]];

        if (checkTile(tile, latestGame.moves)) {
            $("#moveWarn").slideDown("fast");
        } else {
            $("#moveWarn").slideUp("fast");
            if (!latestGame.status) {
                // create data
                latestGame.moves[latestGame.player - 1].push(tile);
                latestGame.player == 1 ? (latestGame.player = 2) : (latestGame.player = 1);

                // check winner
                if (winCheck(latestGame.moves)) {
                    latestGame.status = true;
                }

                // push data
                userData.matches[Object.keys(userData.matches)[Object.keys(userData.matches).length - 1]] = latestGame;
                localStorage.setItem(sessionStorage.getItem("account"), JSON.stringify(userData));

                // refresh game view
                refreshGame();
            } else {
                $("#gameWarn").slideDown("fast");
            }
        }
    });

    $("#newGameBtn").click(function (e) {
        e.preventDefault();
        let userData = JSON.parse(localStorage.getItem(sessionStorage.getItem("account")));

        const newGame = {
            moves: [[], []],
            player: 1,
            status: false,
        };

        userData.matches[`game-${Object.keys(userData.matches).length + 1}`] = newGame;

        localStorage.setItem(sessionStorage.getItem("account"), JSON.stringify(userData));
        refreshGame();
    });
});

function checkTile(tile, moves) {
    const p1moves = moves[0];
    const p2moves = moves[1];
    let isSpotTaken = false;
    $.each(p1moves, function (index, val) {
        tile == val ? (isSpotTaken = true) : null;
    });
    $.each(p2moves, function (index, val) {
        tile == val ? (isSpotTaken = true) : null;
    });

    return isSpotTaken;
}

function showMain() {
    $("#mainView").show();
    $("#loginView").hide();
    $("#signUpModal").modal("hide");

    refreshGame();
}

function showLogin() {
    $("#loginView").show();
    $("#mainView").hide();
}

function formFormat(rawData) {
    let formData = {};
    $(rawData).each(function (index, data) {
        formData[data.name] = data.value;
    });

    return formData;
}

function refreshGame() {
    // data declare: immutable
    const userData = JSON.parse(localStorage.getItem(sessionStorage.getItem("account")));
    const count = Object.keys(userData.matches).length - 1;
    const latestGame = userData.matches[Object.keys(userData.matches)[count]];

    // set up
    setUpGameView(count, latestGame.player, latestGame.moves, latestGame.status);
}

function setUpGameView(count, player, moves, status) {
    // data declare: immutable
    const p1moves = moves[0];
    const p2moves = moves[1];

    // DOM manipulate: empty game board
    $(".tile").empty();
    $("#gameWarn, #moveWarn").hide();

    // DOM manipulate: game info
    $("#gamesPlayed").html(`
        <span class='m-auto'>Games played: ${count}</span>
    `);

    $("#gameInfo").html(`
        <div class='col'>
            <span class='d-flex justify-content-center'>
                Game ${count + 1}
            </span>
        </div>
        <div class='col'>
            <span class='d-flex justify-content-center'>
                Player ${player} turn
            </span>
        </div>
    `);

    // DOM manipulate: game board
    $.each(p1moves, function (index, val) {
        $(`#${val}`).html(`
            <span class='h-100 w-100 d-flex justify-content-center align-items-center'>
                &#10004;
            </span>
        `);
    });

    $.each(p2moves, function (index, val) {
        $(`#${val}`).html(`
            <span class='h-100 w-100 d-flex justify-content-center align-items-center'>
                 &#10060;
            </span>
        `);
    });
    if (status) {
        const winner = winCheck(moves);

        winner == 3
            ? $("#gameResult").html(`
            <h1 class='m-auto'> Draw! </h1>
        `)
            : $("#gameResult").html(`
            <h1 class='m-auto'> Winner is player ${winner} </h1>
        `);
    } else {
        $("#gameResult").empty();
    }
}

function winCheck(moves) {
    // check function
    const checker = (arr, target) => target.every((v) => arr.includes(v));

    // data declare: immutable + mutable
    const p1moves = moves[0];
    const p2moves = moves[1];
    const winCon = [
        ["1-1", "1-2", "1-3"],
        ["2-1", "2-2", "2-3"],
        ["3-1", "3-2", "3-3"],
        ["1-1", "2-1", "3-1"],
        ["1-2", "2-2", "3-2"],
        ["1-3", "2-3", "3-3"],
        ["1-1", "2-2", "3-3"],
        ["1-3", "2-2", "3-1"],
    ];
    let winner = null;

    if (p1moves.length + p2moves.length == 9) {
        winner = 3;
    } else {
        // check
        $.each(winCon, function (index, val) {
            let check = checker(p1moves, val);
            if (check) {
                winner = 1;
            }
        });
        $.each(winCon, function (index, val) {
            let check = checker(p2moves, val);
            if (check) {
                winner = 2;
            }
        });
    }

    return winner;
}
