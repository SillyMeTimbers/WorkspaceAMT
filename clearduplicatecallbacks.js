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

    const maxAmount = 51
    let proces = 0
    async function deleteCallback() {
        if (proces < maxAmount) {
            console.log("---------------------------------------")
            proces++
            await waitForElementToDisappear("#callback-details > .text-center")
            await wait(500)
            
            console.log("CB_CLEANER - LOADED")
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
        }
        console.log(proces)
    }

    function compareNames(p1, p2) {
        console.log(p1)
        console.log(p2)

        if (p1.First == p2.First && p1.Last == p2.Last) {
            return true
        }

        return false
    }

    const CallbacksList = document.querySelector("#callbacks-list tbody > tr")
    let PreviousPerson = {
        First: null,
        Last: null
    }

    CallbacksList.click()
    console.log("clicky :)")
    deleteCallback()
