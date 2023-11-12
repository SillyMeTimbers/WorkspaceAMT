function locOpen(checkDate) {
    let LocationHours = $("#mapLocationDetails > div.row > div:nth-child(1) > dl.split.small")

    if (LocationHours.length < 1) {
        LocationHours = $("dl.schedule-hours")
    }
    
    const HolidayInfo = $("#tab-Holidays > div");
    let isOpen = false;
    let isHoliday = false;
    const checkMoment = moment(checkDate, "MM/DD/YYYY HH");

    // Parse Holiday Hours
    HolidayInfo.find('dl.inline').each(function() {
        const start = $(this).find('dd').eq(0).text();
        const end = $(this).find('dd').eq(1).text();
        const startDate = moment(start, "MM/DD/YYYY");
        const endDate = moment(end, "MM/DD/YYYY").endOf('day');

        // Check if checkDate is within the holiday range
        if (checkMoment.isBetween(startDate, endDate, null, '[]')) {
            isHoliday = true; // Mark as holiday
            let holidayTextElements = $(this).nextUntil('hr'); // Get all siblings until the next 'hr' tag
            let closedText = holidayTextElements.filter('p').text().trim(); // Get the text of paragraph elements

            if (closedText.includes("Closed on these days")) {
                isOpen = false; // Closed on this holiday
                return false; // Exit the .each() loop
            } else {
                let hoursText = holidayTextElements.filter('dl').find('dd').text().trim(); // Get the text of dd elements within dl
                if (hoursText) {
                    const times = hoursText.split(' to ');
                    if (times.length === 2) {
                        const openingTime = moment(startDate.format("YYYY-MM-DD") + " " + times[0], "YYYY-MM-DD h:mm A");
                        const closingTime = moment(startDate.format("YYYY-MM-DD") + " " + times[1], "YYYY-MM-DD h:mm A");
                        if (times[1].includes('PM') && closingTime.hour() < 12) {
                            closingTime.add(12, 'hours');
                        }
                        if (closingTime.isBefore(openingTime)) {
                            closingTime.add(1, 'day');
                        }
                        isOpen = checkMoment.isBetween(openingTime, closingTime, null, '[]'); // Open during these special holiday hours
                    }
                }
                return false; // Exit the .each() loop
            }
        }
    });

    // If it's a holiday, return the isOpen status
    if (isHoliday) {
        return isOpen;
    }

    // Regular hours check if not a holiday
    let dayOfWeek = checkMoment.day(); // moment.js treats Sunday as 0, Monday as 1, etc.
    dayOfWeek = (dayOfWeek === 0) ? 6 : dayOfWeek - 1; // Adjust if your week starts with Monday as 0

    if (LocationHours) {
        const hoursText = LocationHours.find(`dd:eq(${dayOfWeek})`).text().trim();
        const hoursRange = hoursText.split(' - ');

        if (hoursRange.length === 2) {
            const openingTime = moment(checkDate.split(' ')[0] + ' ' + hoursRange[0], "MM/DD/YYYY h:mm A");
            const closingTime = moment(checkDate.split(' ')[0] + ' ' + hoursRange[1], "MM/DD/YYYY h:mm A");

            // Adjust for PM times
            if (hoursRange[1].includes('PM') && closingTime.hour() < 12) {
                closingTime.add(12, 'hours');
            }

            // If the closing time is before the opening time, we assume it closes after midnight
            if (closingTime.isBefore(openingTime)) {
                closingTime.add(1, 'day');
            }

            // Check if the checkMoment is within the range
            isOpen = checkMoment.isBetween(openingTime, closingTime, null, '[]');
        }
    }

    return isOpen; // Default return if all checks fail
}

// Example usage
console.log(locOpen("11/23/2023 15"), ": Expected True");
console.log(locOpen("11/23/2023 16"), ": Expected False");
