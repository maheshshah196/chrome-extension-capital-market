(function ($) {

    'use strict';

    const EXPAND_ICON_SELECTOR = ".portfolio_table_content table tr:not(.total_value_row) td span.cursorpointer:not(.hidden-md)";
    const COPY_BUTTON_CLASS = "copy-transactions-button";
    const COPY_BUTTON_SELECTOR = `button.${COPY_BUTTON_CLASS}`;
    const CHECK_INTERRVAL = 500;
    const transactionTableColumns = ["date", "action", "quantity", "price", "amount"];
    const COPY_TOAST_TIMEOUT = 3000;

    const utils = {
        convertCSVDataToString(csvData) {
            return csvData.map(rowData => rowData.join("\t")).join("\n");
        },
        showToast(message, timeout) {
            const $toast = $(`<div class="toast-message">${message}</div>`);

            $("body").append($toast);
            setTimeout(() => $toast.remove(), timeout);
        },
        copy(content, toastMessage, toastTimeout) {
            navigator.clipboard.writeText(content);
            utils.showToast(toastMessage, toastTimeout);
        }
    }

    function addCopyButton($expandIcon, $transactionsContainer) {
        if (!$expandIcon.hasClass("active")) return;

        const $transactionsTable = $transactionsContainer.children("table");

        if ($transactionsTable.length > 0) {
            $transactionsTable.find("tr.footable-group-row th").append(`<button class="${COPY_BUTTON_CLASS}" type="button">Copy</button>`);
        } else {
            setTimeout(() => {
                addCopyButton($expandIcon, $transactionsContainer);
            }, CHECK_INTERRVAL)
        }
    }

    function parseTransactionsTable($transactionsTable) {
        return $transactionsTable.find("tbody").first().children("tr").toArray().reduce((tableData, tr) => {
            const $allTd = $(tr).children("td.transwidth");

            if ($allTd.length == 0) return tableData;

            tableData.push($(tr).children("td").toArray().reduce((rowData, td, index) => {
                const dataKey = transactionTableColumns[index];

                if (!dataKey) return rowData;

                rowData[dataKey] = $(td).text().trim();

                return rowData;
            }, {}));

            return tableData;
        }, []);
    }

    function generateTransactionsCSVContent(transactionsData) {
        return utils.convertCSVDataToString(transactionsData.map(rowData => {
            const buyCellsData = [[rowData.quantity, rowData.price, rowData.amount], ['', '', '']];

            return Array.prototype.concat.apply([rowData.date], rowData.action.toLowerCase() == "buy" ? buyCellsData : buyCellsData.reverse());
        }));
    }

    function init() {
        $(document).on("click", EXPAND_ICON_SELECTOR, function () {
            const $expandIcon = $(this);
            const $transactionsContainer = $expandIcon.closest("tr").next("tr.nopadding_tr").find(".stock_table");

            setTimeout(() => {
                addCopyButton($expandIcon, $transactionsContainer);
            }, CHECK_INTERRVAL);
        });

        $(document).on("click", COPY_BUTTON_SELECTOR, function () {
            const transactionsData = parseTransactionsTable($(this).closest("table"));
            const csvContent = generateTransactionsCSVContent(transactionsData);
            utils.copy(csvContent, "Data Copied", COPY_TOAST_TIMEOUT);
        });
    }

    init();

})(jQuery)