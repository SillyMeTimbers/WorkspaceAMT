function generateEmail(dayEntry) {
    let emailText = "<html><body style='font-family: Arial, sans-serif;'>"; // Default font

    for (let route of dayEntry.routes) {
        emailText += "<b style='color: black; font-size: 14pt;'>" + route.routeStart + "</b><br>"; // Blue color and 18px font

        for (let movement of route.groupMovements) {
            if (movement.deliveryType.toLowerCase() === "transfer") {
                emailText += "<b><i style='color: rgb(200, 38, 19); font-size: 12pt;'>TRANSFER</i> " + movement.transfer_Amount + " from " + `<i style='color: rgb(200, 38, 19); font-size: 12pt;'>${movement.transfer_From}</i>` + " to " + `<i style='color: rgb(200, 38, 19); font-size: 12pt;'>${movement.transfer_To}</i></b>` + "<br>";
            } else {
                const actionWord = movement.deliveryType === "Deliver" ? "to" : "from";
                emailText += `<b><i style='color: rgb(200, 38, 19); font-size: 12pt;'>${movement.deliveryType.toUpperCase()}</i> ` + movement.boxNumbers.length + " " + movement.delivery_Box + " " + actionWord + " " + `<i style='color: rgb(200, 38, 19); font-size: 12pt;'>${movement.delivery_LastName}</i> in ` + `<i style='color: rgb(200, 38, 19); font-size: 12pt;'>${movement.delivery_City}</i> between ` + `<i style='color: rgb(200, 38, 19); font-size: 12pt;'>${movement.delivery_Window}</i></b><br>`
                emailText += "<span style='font-size: 12pt;'>" + movement.delivery_PhoneNumber + "&nbsp;&nbsp;&nbsp;&nbsp;" + movement.delivery_Address + "</span><br>"; // 14px font
            }

            if (movement.boxNumbers && movement.boxNumbers.length) {
                emailText += "<ul style='font-size: 12pt;'>";  // 14px font for the list
                for (let box of movement.boxNumbers) {
                    emailText += "<li>" + box + "</li>";
                }
                emailText += "</ul>";
            }

            emailText += "<br>";  // Additional line break for separation between movements
        }
        
        emailText += "<br>";  // Additional line break for separation between routes
    }

    emailText += "</body></html>";

    return emailText;
}

const CalenderList = $(".calendar-days");
let All = { days: [] };

CalenderList.find("> .calendar-day").each(function(index) {
    const Day = $(this).find(".stop_row");
    const date = Day.data('date');
    const RouteDivs = $(this).find(".dynamic-routes > div");

    let dayEntry = { date: date, routes: [] };
    let currentRoute = null;

    RouteDivs.each(function() {
        if ($(this).hasClass('route-start')) {
            if (currentRoute) {
                dayEntry.routes.push(currentRoute);
            }
            currentRoute = {
                routeStart: $(this).find(".route-name").text(),
                groupMovements: []
            };
        } else if ($(this).hasClass('group-movements') && currentRoute) {
            $(this).find(".calendar-ubox").each(function() {
                const DeliveryID = $(this).find("> .ubox").data("module");
                const DeliveryToolTip = $(DeliveryID); // Assuming DeliveryID can be used as an ID selector

                if (DeliveryToolTip.length) {
                    const DelTypeH1 = DeliveryToolTip.find("> h1").text().trim();
                    let inf_DelType;
                    let boxNumStorage = [];

                    // transfer segment
                    let transfer_Amount
                    let transfer_From
                    let transfer_To

                    // delivery/pickup segment
                    let delivery_LastName
                    let delivery_PhoneNumber
                    let delivery_Address
                    let delivery_City
                    let delivery_Window
                    let delivery_CoveringEntity
                    let delivery_Box
                    
                    if (DelTypeH1.toLowerCase() === "scheduled transfer") {
                        inf_DelType = "Transfer";

                        const TransferString = DeliveryToolTip.find("p").text().trim().split(" ")
                        transfer_Amount = TransferString[2]
                        transfer_From = TransferString[4]
                        transfer_To = TransferString[6]

                        const BoxNumbers = DeliveryToolTip.find(".no-styles li");
                        BoxNumbers.each(function() {
                            boxNumStorage.push($(this).text());
                        });
                    } else {
                        inf_DelType = DeliveryToolTip.find("> p > span").text().trim().split(" ")[0];
                        delivery_Box = DeliveryToolTip.find("> p > span").text().trim().split(" ")[3].toUpperCase();
                        
                        const CustomerName = DeliveryToolTip.find(".no-styles > span:first").text().trim().split(" ");
                        delivery_LastName = CustomerName.slice(1).join(" ").toUpperCase();

                        const CustomerAddress = DeliveryToolTip.find(".no-styles > span:eq(1)").text().trim();
                        const CustomerAddressCityState = DeliveryToolTip.find(".no-styles > span:eq(2)").text().trim();
                        delivery_Address = CustomerAddress + ", " + CustomerAddressCityState
                        delivery_City = CustomerAddressCityState.split(",")[0].toUpperCase()

                        const CustomerPhoneNumber = DeliveryToolTip.find("a > span:first").text().trim()
                        delivery_PhoneNumber = CustomerPhoneNumber

                        if (DeliveryToolTip.find(".no-styles > span:eq(3)")) {
                            if (DeliveryToolTip.find(".no-styles > text:eq(1) > span:eq(1)").text().trim().length > 0) {
                                const timeWindow = DeliveryToolTip.find(".no-styles > text:eq(1) > span:eq(1)").text().trim()
                                delivery_Window = timeWindow

                                const coveringEntity = DeliveryToolTip.find(".no-styles > text:eq(2)").text().trim().split(":")[1].trim()
                                delivery_CoveringEntity = coveringEntity
                            } else {
                                const timeWindow = DeliveryToolTip.find(".no-styles > text:eq(2) > span:eq(1)").text().trim()
                                delivery_Window = timeWindow

                                if (DeliveryToolTip.find(".no-styles > text:eq(3)").text()) {
                                    const coveringEntity = DeliveryToolTip.find(".no-styles > text:eq(3)").text().trim().split(":")[1].trim()
                                    delivery_CoveringEntity = coveringEntity
                                }
                            }
                        }
                        
                        const BoxNumbers = DeliveryToolTip.find(".no-styles li");
                        BoxNumbers.each(function() {
                            boxNumStorage.push($(this).text());
                        });
                    }

                    currentRoute.groupMovements.push({
                        deliveryType: inf_DelType,
                        deliveryID: DeliveryID,
                        tooltip: DeliveryToolTip,
                        boxNumbers: boxNumStorage,
                        transfer_Amount: transfer_Amount,
                        transfer_From: transfer_From,
                        transfer_To: transfer_To,
                        delivery_LastName: delivery_LastName,
                        delivery_PhoneNumber: delivery_PhoneNumber,
                        delivery_Address: delivery_Address,
                        delivery_City: delivery_City,
                        delivery_Window: delivery_Window,
                        delivery_CoveringEntity: delivery_CoveringEntity,
                        delivery_Box: delivery_Box
                    });
                }
            });
        }
    });

    if (currentRoute) {
        dayEntry.routes.push(currentRoute);
    }

    All.days.push(dayEntry);
});

CalenderList.find("> .calendar-day").each(function(index) {
    const NotesTab = $(this).find(".notes");
    const clonedNotesTab = NotesTab.clone();
    
    clonedNotesTab.attr('id', 'email');
    clonedNotesTab.find('.fa-file-text-o').remove();
    
    clonedNotesTab.find('span').text("Email").click(function(event) {
        event.preventDefault();

        const dayEntry = All.days[index];  // Get the day entry for the clicked day
        const emailText = generateEmail(dayEntry);
    
        navigator.clipboard.write([
            new ClipboardItem({
                'text/html': new Blob([emailText], { type: 'text/html' })
            })
        ]);
        console.log('Email copied to clipboard!');
    });

    NotesTab.after(clonedNotesTab);
});

console.log(All);
