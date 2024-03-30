document.addEventListener("DOMContentLoaded", function() {
    const addStockButton = document.getElementById("addStockButton");
    const newStockForm = document.getElementById("newStockForm");

    addStockButton.addEventListener("click", function() {
        // Toggle visibility of the new stock form
        if (newStockForm.style.display === "none" || newStockForm.style.display === "") {
            newStockForm.style.display = "block";
        } else {
            newStockForm.style.display = "none";
        }
    });

    // Handle form submission 
    newStockForm.addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent default form submission
        
        const companyName = document.getElementById("companyName").value;
        const stockTicker = document.getElementById("stockTicker").value;
        const volume = document.getElementById("volume").value;
        const initialPrice = document.getElementById("initialPrice").value;

        // You can perform further actions, such as sending data to the server, here
        console.log("Company Name:", companyName);
        console.log("Stock Ticker:", stockTicker);
        console.log("Volume:", volume);
        console.log("Initial Price:", initialPrice);

        // Reset form fields after submission
        newStockForm.reset();

        // Hide the form after submission
        newStockForm.style.display = "none";
    });
});
