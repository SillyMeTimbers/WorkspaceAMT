    function compareNames(p1, p2) {
        console.log(p1)
        console.log(p2)

        if (p1.First == p2.First && p1.Last == p2.Last) {
            return true
        }

        return false
    }

    const CallbacksList = $("#callbacks-list tbody > tr")
    let PreviousPerson = {
        First: null,
        Last: null
    }

    CallbacksList.each(function(index, element) {
        console.log("--------------")
        const cxFirstName = $(element).find("td:nth-child(8)").text().trim()
        const cxLastName = $(element).find("td:nth-child(9)").text().trim()
        const isDuplicate = compareNames(PreviousPerson, {First: cxFirstName, Last: cxLastName})

        console.log(isDuplicate)
        PreviousPerson.First = cxFirstName
        PreviousPerson.Last = cxLastName
    })
