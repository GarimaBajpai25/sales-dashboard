// ==========================================
// SALES DASHBOARD
// ==========================================

let salesData = [];

let categoryChart;
let regionChart;
let segmentChart;
let profitChart;
let salesTrendChart;
let topProductsChart;


// ==========================================
// LOAD CSV
// ==========================================

document.addEventListener("DOMContentLoaded", loadCSV);


function loadCSV() {

    fetch("./Sample%20-%20Superstore.csv")

        .then(response => {

            if (!response.ok) {
                throw new Error("CSV file nahi mili.");
            }

            return response.text();
        })

        .then(csvText => {

            salesData = parseCSV(csvText);

            console.log("CSV Loaded Successfully!");
            console.log("Total Rows:", salesData.length);

            if (salesData.length === 0) {
                throw new Error("CSV me data nahi mila.");
            }

            setupFilters();

            updateDashboard();

        })

        .catch(error => {

            console.error(error);

            document.getElementById("errorMessage").textContent =
                "CSV file load nahi hui. Check karo ki CSV file index.html ke same folder me hai.";

            document.getElementById("errorMessage").style.display = "block";
        });
}


// ==========================================
// CSV PARSER
// ==========================================

function parseCSV(text) {

    const rows = [];

    let row = [];

    let value = "";

    let insideQuotes = false;


    for (let i = 0; i < text.length; i++) {

        const char = text[i];

        const next = text[i + 1];


        if (char === '"') {

            if (insideQuotes && next === '"') {

                value += '"';
                i++;

            } else {

                insideQuotes = !insideQuotes;
            }

        }

        else if (char === "," && !insideQuotes) {

            row.push(value.trim());

            value = "";
        }

        else if (
            (char === "\n" || char === "\r") &&
            !insideQuotes
        ) {

            if (char === "\r" && next === "\n") {
                i++;
            }

            row.push(value.trim());

            rows.push(row);

            row = [];

            value = "";
        }

        else {

            value += char;
        }
    }


    if (value || row.length) {

        row.push(value.trim());

        rows.push(row);
    }


    const headers = rows[0];

    return rows.slice(1).map(row => {

        const obj = {};

        headers.forEach((header, index) => {

            obj[header] = row[index] || "";

        });

        return obj;
    });
}


// ==========================================
// NUMBER CONVERTER
// ==========================================

function num(value) {

    return parseFloat(
        String(value)
            .replace(/[$,]/g, "")
            .trim()
    ) || 0;
}


// ==========================================
// FILTER SETUP
// ==========================================

function setupFilters() {

    fillFilter(
        "regionFilter",
        "Region"
    );

    fillFilter(
        "categoryFilter",
        "Category"
    );

    fillFilter(
        "segmentFilter",
        "Segment"
    );


    document
        .getElementById("regionFilter")
        .addEventListener(
            "change",
            updateDashboard
        );


    document
        .getElementById("categoryFilter")
        .addEventListener(
            "change",
            updateDashboard
        );


    document
        .getElementById("segmentFilter")
        .addEventListener(
            "change",
            updateDashboard
        );


    document
        .getElementById("resetBtn")
        .addEventListener(
            "click",
            resetFilters
        );
}


// ==========================================
// FILL FILTER
// ==========================================

function fillFilter(id, column) {

    const select =
        document.getElementById(id);


    const values = [
        ...new Set(
            salesData
                .map(row => row[column])
                .filter(Boolean)
        )
    ];


    values.sort();


    values.forEach(value => {

        const option =
            document.createElement("option");

        option.value = value;

        option.textContent = value;

        select.appendChild(option);
    });
}


// ==========================================
// GET FILTERED DATA
// ==========================================

function getFilteredData() {

    const region =
        document.getElementById(
            "regionFilter"
        ).value;


    const category =
        document.getElementById(
            "categoryFilter"
        ).value;


    const segment =
        document.getElementById(
            "segmentFilter"
        ).value;


    return salesData.filter(row => {

        const regionMatch =
            region === "All" ||
            row.Region === region;


        const categoryMatch =
            category === "All" ||
            row.Category === category;


        const segmentMatch =
            segment === "All" ||
            row.Segment === segment;


        return (
            regionMatch &&
            categoryMatch &&
            segmentMatch
        );
    });
}


// ==========================================
// UPDATE DASHBOARD
// ==========================================

function updateDashboard() {

    const data =
        getFilteredData();


    updateKPIs(data);

    updateCategoryChart(data);

    updateRegionChart(data);

    updateSegmentChart(data);

    updateProfitChart(data);

    updateSalesTrend(data);

    updateTopProducts(data);
}


// ==========================================
// KPI CARDS
// ==========================================

function updateKPIs(data) {

    let sales = 0;

    let profit = 0;

    let quantity = 0;

    const orders = new Set();


    data.forEach(row => {

        sales += num(row.Sales);

        profit += num(row.Profit);

        quantity += num(row.Quantity);


        if (row["Order ID"]) {

            orders.add(row["Order ID"]);
        }
    });


    document.getElementById(
        "totalSales"
    ).textContent =
        "$" + sales.toLocaleString(
            "en-US",
            {
                maximumFractionDigits: 2
            }
        );


    document.getElementById(
        "totalProfit"
    ).textContent =
        "$" + profit.toLocaleString(
            "en-US",
            {
                maximumFractionDigits: 2
            }
        );


    document.getElementById(
        "totalOrders"
    ).textContent =
        orders.size.toLocaleString();


    document.getElementById(
        "totalQuantity"
    ).textContent =
        quantity.toLocaleString();
}


// ==========================================
// CATEGORY CHART
// ==========================================

function updateCategoryChart(data) {

    const totals = {};


    data.forEach(row => {

        const category =
            row.Category;

        if (!category) return;


        totals[category] =
            (totals[category] || 0)
            + num(row.Sales);
    });


    createOrUpdateChart(
        "categoryChart",
        categoryChart,
        "bar",
        Object.keys(totals),
        Object.values(totals),
        "Sales by Category"
    )
        .then(chart => {
            categoryChart = chart;
        });
}


// ==========================================
// REGION CHART
// ==========================================

function updateRegionChart(data) {

    const totals = {};


    data.forEach(row => {

        const region =
            row.Region;

        if (!region) return;


        totals[region] =
            (totals[region] || 0)
            + num(row.Sales);
    });


    createOrUpdateChart(
        "regionChart",
        regionChart,
        "bar",
        Object.keys(totals),
        Object.values(totals),
        "Sales by Region"
    )
        .then(chart => {
            regionChart = chart;
        });
}


// ==========================================
// SEGMENT CHART
// ==========================================

function updateSegmentChart(data) {

    const totals = {};


    data.forEach(row => {

        const segment =
            row.Segment;

        if (!segment) return;


        totals[segment] =
            (totals[segment] || 0)
            + num(row.Sales);
    });


    createOrUpdateChart(
        "segmentChart",
        segmentChart,
        "doughnut",
        Object.keys(totals),
        Object.values(totals),
        "Sales by Segment"
    )
        .then(chart => {
            segmentChart = chart;
        });
}


// ==========================================
// PROFIT CHART
// ==========================================

function updateProfitChart(data) {

    const totals = {};


    data.forEach(row => {

        const category =
            row.Category;

        if (!category) return;


        totals[category] =
            (totals[category] || 0)
            + num(row.Profit);
    });


    createOrUpdateChart(
        "profitChart",
        profitChart,
        "bar",
        Object.keys(totals),
        Object.values(totals),
        "Profit by Category"
    )
        .then(chart => {
            profitChart = chart;
        });
}


// ==========================================
// SALES TREND
// ==========================================

function updateSalesTrend(data) {

    const totals = {};


    data.forEach(row => {

        const date =
            parseDate(row["Order Date"]);


        if (!date) return;


        const key =
            date.getFullYear() +
            "-" +
            String(
                date.getMonth() + 1
            ).padStart(2, "0");


        totals[key] =
            (totals[key] || 0)
            + num(row.Sales);
    });


    const labels =
        Object.keys(totals).sort();


    const values =
        labels.map(
            label => totals[label]
        );


    if (salesTrendChart) {
        salesTrendChart.destroy();
    }


    const ctx =
        document
            .getElementById(
                "salesTrendChart"
            )
            .getContext("2d");


    salesTrendChart =
        new Chart(ctx, {

            type: "line",

            data: {

                labels: labels,

                datasets: [{
                    label: "Sales",
                    data: values,
                    fill: false,
                    tension: 0.3
                }]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: true
                    }
                },

                scales: {

                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
}


// ==========================================
// TOP 10 PRODUCTS
// ==========================================

function updateTopProducts(data) {

    const products = {};


    data.forEach(row => {

        const product =
            row["Product Name"];

        if (!product) return;


        products[product] =
            (products[product] || 0)
            + num(row.Sales);
    });


    const sorted =
        Object.entries(products)
            .sort(
                (a, b) => b[1] - a[1]
            )
            .slice(0, 10);


    const labels =
        sorted.map(item => item[0]);


    const values =
        sorted.map(item => item[1]);


    if (topProductsChart) {
        topProductsChart.destroy();
    }


    const ctx =
        document
            .getElementById(
                "topProductsChart"
            )
            .getContext("2d");


    topProductsChart =
        new Chart(ctx, {

            type: "bar",

            data: {

                labels: labels,

                datasets: [{
                    label: "Sales",
                    data: values
                }]
            },

            options: {

                indexAxis: "y",

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: false
                    }
                }
            }
        });
}


// ==========================================
// CHART HELPER
// ==========================================

function createOrUpdateChart(
    canvasId,
    oldChart,
    type,
    labels,
    values,
    label
) {

    return new Promise(resolve => {

        if (oldChart) {
            oldChart.destroy();
        }


        const canvas =
            document.getElementById(
                canvasId
            );


        const ctx =
            canvas.getContext("2d");


        const chart =
            new Chart(ctx, {

                type: type,

                data: {

                    labels: labels,

                    datasets: [{
                        label: label,
                        data: values
                    }]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: true
                        }
                    },

                    scales:
                        type === "doughnut"
                            ? {}
                            : {
                                y: {
                                    beginAtZero: true
                                }
                            }
                }
            });


        resolve(chart);
    });
}


// ==========================================
// DATE PARSER
// ==========================================

function parseDate(value) {

    if (!value) return null;


    const parts =
        value.split("/");


    if (parts.length === 3) {

        const month =
            parseInt(parts[0]) - 1;

        const day =
            parseInt(parts[1]);

        const year =
            parseInt(parts[2]);


        return new Date(
            year,
            month,
            day
        );
    }


    const date =
        new Date(value);


    return isNaN(date)
        ? null
        : date;
}


// ==========================================
// RESET
// ==========================================

function resetFilters() {

    document.getElementById(
        "regionFilter"
    ).value = "All";


    document.getElementById(
        "categoryFilter"
    ).value = "All";


    document.getElementById(
        "segmentFilter"
    ).value = "All";


    updateDashboard();
}