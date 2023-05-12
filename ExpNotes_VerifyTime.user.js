function ExpectedInNotes_ContractsWithoutNotes() {
  if (ExpectedInNotes_PauseUpdating) {
    return ExpectedInNote_ContractIdList
  }

  const ExpectedInNotes_TempList = [];
  let ExpectedInNotes_Sorted = 0;

  ExpectedInBody.querySelectorAll("tr").forEach((tr) => {
    const ExpInContractID = tr.getAttribute("data-contractid");
    const ExpInNote = tr.querySelector("td.note.has-tip");
    const ExpInContent = tr.textContent;
    const ExpInUBOX = ExpInContent.includes("UBox") || ExpInContent.includes("DB") || ExpInContent.includes("UB");

    if (!ExpInNote || (ExpInNote && ExpInNote.textContent.trim() === "" || ExpInNote.textContent.trim().length < 1) && ExpectedInNotes_Sorted < maxProcessAmount) {
      ExpectedInNotes_TempList.push([ExpInContractID, ExpInUBOX])
      ExpectedInNotes_Sorted++;
      ExpectedInBody.querySelector(`tr[data-contractid="${ExpInContractID}"]`).classList.add("has-no-note");

      if (!ExpectedInNotes_ProcessedContracts.has(ExpInContractID)) {
        ExpectedInNotes_ProcessedContracts.add(ExpInContractID)
      }

      visualizeList([ExpInContractID], "#ADD8E6")
    } else {
      resetBackgroundColor(ExpInContractID)
      ExpectedInBody.querySelector(`tr[data-contractid="${ExpInContractID}"]`).classList.remove("has-no-note");
    }
  });

  ExpectedInNote_ContractIdList = ExpectedInNotes_TempList;
  updateButtonLabel(ExpectedInNote_Button, "Expected-In without note(s)", ExpectedInNote_ContractIdList);

  return ExpectedInNotes_Sorted;
}
