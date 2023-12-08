    async function waitForElement(selector, timeout = 10000) {
        const startTime = Date.now();
    
        while (Date.now() - startTime < timeout) {
            const element = document.querySelector(selector);
    
            if (element) {
                return element;
            }
    
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    
        return null;
    }

    async function waitForElementToDisappear(selector, timeout = 30000) {
        const startTime = Date.now();
    
        while (Date.now() - startTime < timeout) {
            const element = document.querySelector(selector);
    
            if (!element || element.style.display === "none" || element.style.visibility === "hidden") {
                break;
            }
    
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    }

    function wait(time) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    }

    function compareNames(p1, p2) {
        console.log(p1)
        console.log(p2)

        if (p1.First == p2.First && p1.Last == p2.Last) {
            return true
        }

        return false
    }

    function hasExistingReservation() {
        const otherQuotes = $("#otherActivityContent > div:nth-child(2) > div")
        let actQuote = false
        
        otherQuotes.find("> div").each(function() {
            const tabHeader = $(this).find("> h3 > span:first")
    
            if (tabHeader.text() == "Reservation") {
                actQuote = true
            }
        })
    
        return actQuote
    }

    const CallbacksList = $("#callbacks-list tbody > tr")
    const CallbackSorted = []
    function isDuplicate(p) {
        for (const currPerson of CallbackSorted) {
            if (currPerson.First == p.First && currPerson.Last == p.Last) {
                return true
            }
        }

        return false
    }

    const maxAmount = 51
    let proces = 0
    let Dupe = 0
    let Confirmed = 0
    let Due = 0
    let Ignore = 0
    async function deleteCallback() {
        if (proces < maxAmount) {
            console.log("---------------------------------------")
            proces++
            await waitForElementToDisappear("#callback-details > .text-center")
            await wait(500)
            
            console.log("CB_CLEANER - LOADED")
            const cxFirstName = $("#callback-details > div:nth-child(3) > div.flex-grid-x.grid-padding-x > div.flex-cell.medium-5 > fieldset:nth-child(3) > div > div:nth-child(1) > label > input[type=text]").val()
            const cxLastName = $("#callback-details > div:nth-child(3) > div.flex-grid-x.grid-padding-x > div.flex-cell.medium-5 > fieldset:nth-child(3) > div > div:nth-child(2) > label > input[type=text]").val()
            const PickupDate = $("#callbackDetailsContent > div:nth-child(3) > div.flex-grid-x.grid-padding-x > div:nth-child(1) > dl > dd").text()
            
            if (isDuplicate({First: cxFirstName, Last: cxLastName})) {
                console.log("CB_CLEANER - DUPLICATE")

                Dupe++
                $("select[name='SelectedCallbackResultID']").val("6").change(); // Update Dropdown results
    
                const NextButton = $("#callbacks-main > div:nth-child(2) > div.text-right > button:nth-child(2)")
                if (!NextButton.is(":disabled")) {
                    console.log("CB_CLEANER - PROCEEDING NEXT CONTRACT")
                    await wait(200)
                    $("#callbacks-main > div:nth-child(2) > div.panel > div:nth-child(2) > button:nth-child(2)").click()
                    await waitForElementToDisappear("#callbackDetailsContent")
                    await wait(10)
                    deleteCallback()
                } else {
                    console.log("CB_CLEANER - FINISHED PAGE")
                }
            } else if (hasExistingReservation()) {
                console.log("CB_CLEANER - ALREADY CONFIRMED")

                Confirmed++
                $("select[name='SelectedCallbackResultID']").val("9").change(); // Update Dropdown results
    
                const NextButton = $("#callbacks-main > div:nth-child(2) > div.text-right > button:nth-child(2)")
                if (!NextButton.is(":disabled")) {
                    console.log("CB_CLEANER - PROCEEDING NEXT CONTRACT")
                    await wait(200)
                    $("#callbacks-main > div:nth-child(2) > div.panel > div:nth-child(2) > button:nth-child(2)").click()
                    await waitForElementToDisappear("#callbackDetailsContent")
                    await wait(10)
                    deleteCallback()
                } else {
                    console.log("CB_CLEANER - FINISHED PAGE")
                }
            } else if (PickupDate.trim() == "12/03/2023" || PickupDate.trim() == "12/04/2023") {
                console.log("CB_CLEANER - PAST DUE")

                Due++
                $("select[name='SelectedCallbackResultID']").val("6").change(); // Update Dropdown results
    
                const NextButton = $("#callbacks-main > div:nth-child(2) > div.text-right > button:nth-child(2)")
                if (!NextButton.is(":disabled")) {
                    console.log("CB_CLEANER - PROCEEDING NEXT CONTRACT")
                    await wait(200)
                    $("#callbacks-main > div:nth-child(2) > div.panel > div:nth-child(2) > button:nth-child(2)").click()
                    await waitForElementToDisappear("#callbackDetailsContent")
                    await wait(10)
                    deleteCallback()
                } else {
                    console.log("CB_CLEANER - FINISHED PAGE")
                }
            } else {
                console.log("CB_CLEANER - NON-DUPE")

                Ignore++
                const NextButton = $("#callbacks-main > div:nth-child(2) > div.text-right > button:nth-child(2)")
                if (!NextButton.is(":disabled")) {
                    console.log("CB_CLEANER - PROCEEDING NEXT CONTRACT >> DID NOT DELETE")
                    await wait(200)
                    NextButton.click()
                    await waitForElementToDisappear("#callbackDetailsContent")
                    await wait(10)
                    deleteCallback()
                } else {
                    console.log("CB_CLEANER - FINISHED PAGE")
                }
            }

            CallbackSorted.push({First: cxFirstName, Last: cxLastName})
        }
        console.log(proces)
        console.log(CallbackSorted)

        console.log(`Duplicates: ${Dupe}`)
        console.log(`Already Confirmed: ${Confirmed}`)
        console.log(`Past Due: ${Due}`)
        console.log(`Ignored Callbacks: ${Ignore}`)
    }


    if (CallbacksList.length > 0) {
        CallbacksList.click()
        deleteCallback()
    } else {
        console.warn("CB_CLEANER - UNABLE TO START")
    }
