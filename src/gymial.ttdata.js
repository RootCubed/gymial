export function getFirstDayOfWeek(d) {
    let day = d.getDay();
    let diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}

export function classFromTTData(data) {
    let potentialClasses = {};
    for (let d of data) {
        if (d.classId.length == 1) {
            if (potentialClasses[d.className]) {
                potentialClasses[d.className]++;
            } else {
                potentialClasses[d.className] = 1;
            }
        }
    }
    let best = ["", 0];
    for (let d in potentialClasses) {
        if (potentialClasses[d] > best[1]) {
            best[0] = d;
            best[1] = potentialClasses[d];
        }
    }
    return best[0].replace(/ /g, '');
}

export const DAY = 24 * 60 * 60 * 1000;

export function convertToUsable(timetable, time, hours, shortHours) {
    let result = {};
    // first pass of data, remove completely unnecessary stuff and find range of dates
    let minimalLessons = [];
    let insPersonIds = [];
    for (let lesson of timetable) {
        let mLesson = {
            lDate: lesson.start,
            lStart: lesson.lessonStart,
            lEnd: lesson.lessonEnd,
            cName: lesson.title,
            cId: lesson.courseId,
            class: lesson.classId,
            tId: lesson.teacherId[0],
            tAcronym: lesson.teacherAcronym,
            tFull: lesson.teacherFullName,
            room: lesson.roomName,
            sNames: lesson.student,
            fullDay: lesson.isAllDay,
            special: lesson.timetableEntryTypeId == 15,
            cancelled: lesson.timetableEntryTypeId == 11
        };
        if (mLesson.cName == "IU") {
            if (!mLesson.sNames) continue;
            if (!mLesson.sNames[0]) continue;
            if (insPersonIds.indexOf(mLesson.sNames[0].studentId) > -1) continue;
            insPersonIds.push(mLesson.sNames[0].studentId);
        }
        minimalLessons.push(mLesson);
    }
    let minDate = getFirstDayOfWeek(new Date(time));
    for (let date = minDate; date < new Date(minDate.getTime() + DAY * 5); date = new Date(date.getTime() + DAY)) {
        result[date.toLocaleDateString("de-CH", {timeZone: "Europe/Zurich"})] = 
        new Array(hours.length).fill(null).map(() => {
            return {
                type: "empty",
                length: 1,
                data: []
            };
        });
    }
    // second pass of data, put all lessons in array
    for (let i = 0; i < minimalLessons.length; i++) {
        let lesson = minimalLessons[i];

        if (!result[dateToObjectKey(lesson.lDate)]) continue;

        let tmpTime = lesson.lStart.split(':');
        let shortTime = parseInt(tmpTime[0] + tmpTime[1]);

        let index = 0;
        while (shortHours[index + 1] <= shortTime) {
            index++;
        }

        result[dateToObjectKey(lesson.lDate)][index].type = "lesson";
        result[dateToObjectKey(lesson.lDate)][index].data.push(lesson);
    }
    // third pass of data, find double lessons
    for (let day in result) {
        let currRef;
        let lessonLength = 1;

        for (let i = 0; i <= result[day].length; i++) {
            if (currRef != 0 && !currRef) currRef = -1;

            let compLesson = result[day][currRef];
            let currLesson = result[day][i];

            if (currLesson && currLesson.data.length > 0 && currLesson.data[0].fullDay) {
                result[day][i].type = "lesson";
                result[day][i].length = 11;
                result[day][i].data = [result[day][i].data[0]]; // only use the full day info
                for (let i = 1; i < result[day].length; i++) {
                    result[day][i].type = "ignore";
                }
                break;
            }

            if (currLesson && compLesson && areLessonsIdentical(currLesson.data, compLesson.data)) {
                lessonLength++;
            } else {
                if (result[day][currRef] && result[day][currRef].length > 0) {
                    result[day][currRef].length = lessonLength;
                    for (let cLes = currRef + 1; cLes < currRef + lessonLength; cLes++) {
                        result[day][cLes].type = "ignore";
                    }
                }
                currRef = i;
                lessonLength = 1;
            }
        }
    }
    return result;
}

function areLessonsIdentical(les1, les2) {
    if (!les1 || !les2) return false;
    if (les1.length != les2.length) return false;
    for (let j = 0; j < les1.length; j++) {
        let les1Entries = les1[j];
        let les2Entries = les2[j];
        if (
            les1Entries.cName != les2Entries.cName ||
            les1Entries.tAcronym != les2Entries.tAcronym ||
            les1Entries.cancelled != les2Entries.cancelled ||
            (les1Entries.sNames && les2Entries.sNames && !arraysAreEqual(les1Entries.sNames, les2Entries.sNames))
        ) {
            return false;
        }
    }
    return true;
}

function arraysAreEqual(ar1, ar2) {
    if (ar1.length !== ar2.length) return false;
    for (let i = 0; i < ar1.length; i++) {
        if (ar1[i].studentId !== ar2[i].studentId) return false;
    }
    return true;
}

function dateToObjectKey(date) {
    return new Date(parseInt(date.substr(6))).toLocaleDateString("de-CH", {timeZone: "Europe/Zurich"});
}

export function buildHTML(timetableData, hours) {
    let mainDivHTML = "";
    let dates = "";
    for (let day in timetableData) {
        dates += `<th class="timetable-date">${day}</th>`;
    }
    mainDivHTML += `<tr><td class="timetable-time"></td>${dates}</tr>`;
    for (let i = 0; i < hours.length; i++) {
        let timeRows = hours[i].replace(/-/g, "-<wbr>");
        mainDivHTML += `<tr class="time-row"><td class="timetable-entry timetable-time timetable-lesson-times">${timeRows}</td>`;
        for (let day in timetableData) {
            if (timetableData[day][i].type == "ignore") {
                continue;
            }
            let lessons = "";
            let isSpecial = "";
            if (timetableData[day][i].type == "lesson") {
                for (let lesson of timetableData[day][i].data) {
                    let modText = "";
                    if (lesson.special) isSpecial = "special";
                    if (lesson.cancelled) modText = "cancelled";
                    lessons += `<div class="${modText}"><span class="entry-title">${lesson.cName}</span>`;
                    if (lesson.room != "") {
                        lessons += `<span class="entry-room">${lesson.room}</span>`;
                    }
                    if (lesson.tAcronym != "") {
                        lessons += `<span class="entry-teacher">${lesson.tAcronym}</span>`;
                    }
                    if (lesson.sNames != undefined && lesson.sNames.length > 0) {
                        lessons += (lesson.cName == "IU") ? `<br><span class="entry-instrName">${lesson.sNames[0].studentName}</span>` : "";
                    }
                    lessons += "</div>";
                }
            }
            if (timetableData[day][i].type == "empty") {
                mainDivHTML += `<td rowspan=${timetableData[day][i].length} class="timetable-entry empty"><div class="sc_cont"></div></td>`;
            } else {
                let lLength = timetableData[day][i].length;
                let lengthName = "";
                if (lLength == 2) {
                    lengthName = "double";
                }
                if (lLength == 3) {
                    lengthName = "triple";
                }
                if (lLength == 11) {
                    lengthName = "fullday";
                }
                mainDivHTML += `<td rowspan=${lLength} class="timetable-entry ${isSpecial}" data="${day + ";" + i}"><div class="sc_cont"><div class="scroller-container ${lengthName}"><div class="scroller">${lessons}<div class="addScroller"></div></div></div></div></td>`;
            }
        }
        mainDivHTML += `</tr>`;
    }
    return mainDivHTML;
}