var main = (function() {

    // JSON properties
    const JSONproperties = {
        name: "SURNAME",
        email: "EMAIL1",
        accountName: "QUICK_ACCOUNT_NAME",
        comments: "COMMENTS"
    };

    // HTTP request constants
    const url = "https://eu-central.pipelinersales.com/rest_services/v1/fr3_test_assesment/Contacts";
    const username = "fr3_test_assesment_AM2KN76DREP6C0GL";
    const password = "8RvumdmnK0JFQh74";

    // JSON processing constants
    const columnHeaders = ["Order", "First name", "Middle name", "Last name", "Email", "Account name", "Comments", "Comment word count"]; // headers for CSV
    const columnSeparator = ','; // separator that separates text between different columns
    const lineSeparator = '\r\n'; // separator that separates text between different lines
    const byteOrderMark = "\uFEFF";

    var result = ""; // final data for CSV export
    var readyToDownload = false;

    // HTTP request status definitions
    var getHTTPRequestStatus = function(stateNumber) {
        switch(stateNumber) {
            case 0:
                return "0: UNSENT => Client has been created. open() not called yet.";
            case 1:
                return "1: OPENED => open() has been called.";
            case 2:
                return "2: HEADERS_RECEIVED => send() has been called, and headers and status are available.";
            case 3:
                return "3: LOADING => Downloading; responseText holds partial data.";
            case 4:
                return "4: DONE	=> The operation is complete.";
            default: 
                return;
        }
    };

    var makeHTTPRequest = function() {
        var httpRequest = new XMLHttpRequest();

        httpRequest.onreadystatechange = function() {
            console.log(getHTTPRequestStatus(httpRequest.readyState));
            if (httpRequest.readyState === 4 && httpRequest.status === 200) { // request was successful and data was fetched
                readyToDownload = true;
                changeStatusParagraphStyle();    
                processJSONObject(JSON.parse(httpRequest.responseText));

            } 
        };

        httpRequest.open("GET", url, true);
        // HTTP request needs authorization. The btoa() method encodes a string in base-64.
        httpRequest.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
        httpRequest.send();
    };

    var processJSONObject = function(JSONobject) {
        var order;     

        addHeadersIntoResult();

        order = 1;
        JSONobject.forEach(function(JSONelement) {
            result += order + "." + columnSeparator;
            Object.keys(JSONproperties).forEach(function(propertyKey) {
                addPropertyValueIntoResult(JSONelement, JSONproperties[propertyKey]);
            });
            order++;
        });
    };

    var addHeadersIntoResult = function() {
        columnHeaders.forEach(function(header) {
            result += '"' + header + '"' + columnSeparator;
        });

        // Remove the last char of the string (get rid of a comma at the end)
        result = result.replace(/.$/, lineSeparator);
    };

    var addPropertyValueIntoResult = function(JSONelement, propertyValue) {
        switch(propertyValue) {
            case JSONproperties.name:
                result += '"' + getName(JSONelement[propertyValue].split(' ')) + '"' + columnSeparator;
                break;
            case JSONproperties.email:
                result += '"' + JSONelement[propertyValue] + '"' + columnSeparator;
                break;
            case JSONproperties.accountName:
                result += '"' + JSONelement[propertyValue] + '"' + columnSeparator;
                break;
            case JSONproperties.comments:
                result += '"' + JSONelement[propertyValue] + '"' + columnSeparator + '"' + getCommentWordCount(JSONelement[propertyValue]) + '"' + lineSeparator;                    
                break;
            default:
                break;
        }
    };

    // Returns a string with combination of first name, middle name or last name
    var getName = function(nameArray) {
        if(nameArray.length === 3) {
            return nameArray[0] + '"' + columnSeparator + '"' + nameArray[1] + '"' + columnSeparator + '"' + nameArray[2];
        } else if(nameArray.length === 2) {
            return nameArray[0] + '"' + columnSeparator.repeat(2) + '"' + nameArray[1];
        } else if(nameArray.length === 1) {
            return nameArray[0] + '"' + columnSeparator.repeat(2);
        }
    };

    // Replace all characters except letters, numbers, dots, symbol '&' and whitespace across the whole string for whitespace.
    // Then replace all double whitespaces for one whitespace.
    // Finally count the number of words and return its value
    var getCommentWordCount = function(comment) {
        return comment.replace(/[^a-zA-Z0-9\.&\s]/g, ' ').replace("  ", ' ').split(' ').length;
    };

    var changeStatusParagraphStyle = function() {
        let status;

        status = document.querySelector(".status");
        status.textContent = "File is ready to be downloaded \u2713";
        status.setAttribute("style", "color: green");
    };

    var setEventListeners = function() {
        document.querySelector(".download").addEventListener("click", downloadCSVFile);
    };

    var downloadCSVFile = function() {
        if (!readyToDownload || result === null || result === "") return;

        let csvData, button;

        // Define a separator for columns in final CSV
        if (!result.startsWith("sep=")) {
            result = "sep=" + columnSeparator + lineSeparator + result;
        }

        // Specify the type and encoding of a file.
        // Encode the result string.
        csvData = "data:text/csv;charset=utf-8," + encodeURI(byteOrderMark + result);

        button = document.querySelector(".download");
        // Set the data for download
        button.setAttribute("href", csvData);
        // Set the filename for download attribute
        button.setAttribute("download", "export.csv");

    };

    return {
        init: function() {
            setEventListeners();
            makeHTTPRequest();       
        }
    }
})();

main.init();









