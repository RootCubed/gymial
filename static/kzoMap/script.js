let kzoMap, kzoSVG, currentlySelected, layer = "EG";
let zoomLevel = 1, marginLeft = 0, marginTop = 0;
let prevTouchPos, prevTouchDist = 0;

const xmlNS = "http://www.w3.org/2000/svg";

const grouping = [
    {
        "visibility": "always",
        "groupID": "P1",
        "roomGroup": "P1_Rooms"
    },
    {
        "visibility": "always",
        "groupID": "P2",
        "roomGroup": "P2_Rooms"
    },
    {
        "visibility": "UG",
        "groupID": "G_UG",
        "roomGroup": "G_UG_Rooms"
    },
    {
        "visibility": "UG",
        "groupID": "Aula_UG",
        "roomGroup": "Aula_UG_Rooms"
    },
    {
        "visibility": "UG",
        "groupID": "K_UG",
        "roomGroup": "K_UG_Rooms"
    }
    {
        "visibility": "EG",
        "groupID": "S_EG",
        "roomGroup": "S_EG_Rooms"
    },
    {
        "visibility": "EG",
        "groupID": "Aula_EG",
        "roomGroup": "Aula_EG_Rooms"
    },
    {
        "visibility": "EG",
        "groupID": "G_EG",
        "roomGroup": "G_EG_Rooms"
    },
    {
        "visibility": "EG",
        "groupID": "K_EG",
        "roomGroup": "K_EG_Rooms"
    },
    {
        "visibility": "OG",
        "groupID": "G_OG",
        "roomGroup": "G_OG_Rooms"
    }
]

const roomOffsets = [
    ["AE01", 0, 210],
    ["AE03", 0, -20],
    ["GE09", 60, 60],
    ["GE15", 0, 10],
    ["GU13", 0, -20],
    ["GU27", -10, 20, 20]
]

const textSizes = [10, 15, 20, 40];

function init() {
    kzoSVG = document.querySelector("#kzoMap");
    kzoMap = kzoSVG.contentDocument;
    kzoMap = document.body.appendChild(kzoMap.children[0]);
    kzoSVG.remove();
    kzoSVG = document.getElementsByTagName("svg")[0];
    for (let group of grouping) {
        for (let room of kzoMap.getElementById(group.roomGroup).children) {
            if (room.nodeName == "text") continue;
            let roomName = room.id.split('.')[0];
            let roomBB = room.getBBox();
            let textX = roomBB.x + roomBB.width / 2;
            let textY = roomBB.y + roomBB.height / 2;
            let textSize;
            for (let room of roomOffsets) {
                if (room[0] === roomName) {
                    textX += room[1];
                    textY += room[2];
                    if (room[3]) textSize = room[3];
                }
            }
            let roomNameText = document.createElementNS(xmlNS, "text");
            let roomNameTextSpan = document.createElementNS(xmlNS, "tspan");
            roomNameTextSpan.innerHTML = roomName;
            roomNameTextSpan.setAttribute("x", textX);
            roomNameTextSpan.setAttribute("y", textY);
            roomNameTextSpan.setAttribute("dominant-baseline", "central");
            roomNameTextSpan.setAttribute("style", "text-anchor: middle;pointer-events: none;");
            roomNameText.appendChild(roomNameTextSpan);
            roomNameText.setAttribute("x", textX);
            roomNameText.setAttribute("y", textY);
            roomNameText.id = roomName + "_text";
            room.insertAdjacentElement("afterEnd", roomNameText);
            let textEl = kzoMap.getElementById(roomName + "_text");
            if (textSize) {
                textEl.style.fontSize = textSize;
            } else {
                for (let i = 0; i < textSizes.length; i++) {
                    textEl.style.fontSize = textSizes[i];
                    let textElBBox = textEl.getBBox();
                    if (textElBBox.width > roomBB.width || textElBBox.height > roomBB.height) {
                        textEl.style.fontSize = textSizes[i - 1];
                    }
                }
            }
            room.style.opacity = 0;
            room.onclick = () => {
                console.log(room.id);
                let roomID = room.id
                    .replace(/_/g, ' ').replace(/Ae/g, 'Ä').replace(/Oe/g, 'Ö').replace(/Ue/g, 'Ü')
                    .replace(/ae/g, 'ä').replace(/oe/g, 'ö').replace(/ue/g, 'ü')
                    .replace(/:/g, '/')
                    .split('.');
                document.querySelector("#roomName").textContent = `${roomID[0]} (${roomID[roomID.length - 1]})`;
                let thisRoom = room;
                if (currentlySelected) {
                    currentlySelected.style.opacity = 0;
                }
                currentlySelected = thisRoom;
                thisRoom.style.opacity = 1;
            };
        }
        setVisible(group);
    }
    kzoMap.addEventListener("wheel", event => {
        let multiplier = 1 - event.deltaY / 500;
        zoomIn(multiplier, event.x, event.y);
    });
    document.documentElement.addEventListener("touchstart", function (event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    }, true);
    document.documentElement.addEventListener("touchmove", event => {
        switch (event.touches.length) {
            case 1:
                if (prevTouchPos) {
                    let xDiff = event.touches[0].screenX - prevTouchPos.screenX;
                    let yDiff = event.touches[0].screenY - prevTouchPos.screenY;
                    moveMap(xDiff, yDiff);
                }
                prevTouchPos = event.touches[0];
                break;
            case 2:
                let t1X = event.touches[0].clientX;
                let t2X = event.touches[1].clientX;
                let t1Y = event.touches[0].clientY;
                let t2Y = event.touches[1].clientY;
                let xDiff = Math.abs(t1X - t2X);
                let yDiff = Math.abs(t1Y - t2Y);
                let xAvg = (t1X + t2X) / 2;
                let yAvg = (t1Y + t1Y) / 2;
                let distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
                if (prevTouchDist) zoomIn(distance / prevTouchDist, xAvg, yAvg);
                prevTouchDist = distance;
                break;
        }
        event.preventDefault();
    });
    document.documentElement.addEventListener("touchend", event => {
        if (event.touches.length == 1) {
            prevTouchDist = undefined;
        }
        if (event.touches.length == 0) {
            prevTouchPos = undefined;
        }
    });
    document.documentElement.addEventListener("mousemove", event => {
        if (event.buttons != 1) {
            return;
        }
        moveMap(event.movementX, event.movementY);
        event.preventDefault();
    });
}

function zoomIn(multiplier, x, y) {
    if (zoomLevel * multiplier < 0.2) {
        multiplier = 0.2 / zoomLevel;
    } else if (zoomLevel * multiplier > 1) {
        multiplier = 1 / zoomLevel;
    }
    let corrX = (x - marginLeft) / zoomLevel;
    let corrY = (y - marginTop) / zoomLevel;
    zoomChange = zoomLevel * multiplier - zoomLevel;
    zoomLevel *= multiplier;
    kzoSVG.style.transform = `scale(${zoomLevel})`;
    marginLeft -= (corrX * zoomChange);
    marginTop -= (corrY * zoomChange);
    kzoSVG.style.marginLeft = marginLeft;
    kzoSVG.style.marginTop = marginTop;
}

function moveMap(moveX, moveY) {
    marginLeft += moveX;
    marginTop += moveY;
    kzoSVG.style.marginLeft = marginLeft;
    kzoSVG.style.marginTop = marginTop;
}

function changeLayer(name) {
    layer = name;
    for (let group of grouping) {
        setVisible(group);
    }
}

function setVisible(group) {
    if (group.visibility != "always" && group.visibility != layer) {
        kzoMap.getElementById(group.groupID).style.display = "none";
    } else {
        kzoMap.getElementById(group.groupID).style.display = "inline";
    }
}