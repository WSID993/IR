const game = document.getElementById("game");
const player = document.getElementById("player");

let roomX = 0;
let roomY = 0;

let currentRoom = null;

// 사운드
const sfxRoom = document.getElementById("sfx-room");
const sfxMob = document.getElementById("sfx-mob");

function playSound(audio) {
    audio.currentTime = 0;
    audio.play();
}

/* 
  ▒▒ 섹션 정보 ▒▒
  좌표에 따라 분위기 변화
*/
const Sections = {
    normal: {
        tileColor: () => `hsl(${Math.random() * 40 + 200}, 20%, 25%)`,
        mobChance: 0.15,
    },
    dark: {
        tileColor: () => `hsl(${Math.random() * 40 + 260}, 10%, 15%)`,
        mobChance: 0.30,
    },
    danger: {
        tileColor: () => `hsl(0, 60%, ${Math.random() * 20 + 20}%)`,
        mobChance: 0.50,
    }
};

// 현재 좌표가 어떤 섹션인지 계산
function getSection(x, y) {
    const dist = Math.abs(x) + Math.abs(y);
    if (dist < 4) return Sections.normal;
    if (dist < 10) return Sections.dark;
    return Sections.danger;
}

// 몹 생성
function spawnMob() {
    const mob = document.createElement("div");
    mob.classList.add("mob");

    // 랜덤 위치
    mob.style.left = Math.random() * 550 + "px";
    mob.style.top = Math.random() * 550 + "px";

    game.appendChild(mob);

    playSound(sfxMob);

    // 간단한 AI (플레이어 쪽으로 천천히 이동)
    let interval = setInterval(() => {
        const px = parseFloat(player.style.left);
        const py = parseFloat(player.style.top);
        let mx = parseFloat(mob.style.left);
        let my = parseFloat(mob.style.top);

        let dx = px - mx;
        let dy = py - my;

        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 5) {
            clearInterval(interval);
            mob.remove();
        }

        mob.style.left = mx + (dx / dist) * 1.2 + "px";
        mob.style.top = my + (dy / dist) * 1.2 + "px";
    }, 20);
}

// 방 생성
function generateRoom(x, y) {
    // 기존 방 삭제
    document.querySelectorAll(".room-tile, .mob").forEach(e => e.remove());

    const section = getSection(x, y);
    const tiles = [];

    for (let i = 0; i < 36; i++) {
        const tile = document.createElement("div");
        tile.classList.add("room-tile");
        tile.style.left = (i % 6) * 100 + "px";
        tile.style.top = Math.floor(i / 6) * 100 + "px";

        tile.style.background = section.tileColor();

        game.appendChild(tile);
        tiles.push(tile);
    }

    currentRoom = { x, y, tiles };

    playSound(sfxRoom);

    // 몹 스폰 확률
    if (Math.random() < section.mobChance) {
        spawnMob();
    }
}

// 플레이어 이동
document.addEventListener("keydown", e => {
    const step = 10;
    let x = parseInt(player.style.left);
    let y = parseInt(player.style.top);

    if (e.key === "ArrowUp") y -= step;
    if (e.key === "ArrowDown") y += step;
    if (e.key === "ArrowLeft") x -= step;
    if (e.key === "ArrowRight") x += step;

    player.style.left = x + "px";
    player.style.top = y + "px";

    checkRoomChange();
});

// 방 이동 체크
function checkRoomChange() {
    const px = parseInt(player.style.left);
    const py = parseInt(player.style.top);

    let moved = false;

    if (px < 0) {
        roomX -= 1;
        player.style.left = "570px";
        moved = true;
    } else if (px > 570) {
        roomX += 1;
        player.style.left = "0px";
        moved = true;
    }

    if (py < 0) {
        roomY -= 1;
        player.style.top = "570px";
        moved = true;
    } else if (py > 570) {
        roomY += 1;
        player.style.top = "0px";
        moved = true;
    }

    if (moved) generateRoom(roomX, roomY);
}

// 첫 방 생성
generateRoom(roomX, roomY);
