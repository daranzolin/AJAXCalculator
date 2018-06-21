const margin = {top: 10, right: 30, bottom: 40, left: 50};
const h = 350;
const w = 500;
const border = 1;

const svg = d3.select("#chartArea")
    .append("svg")
    .attr("height", h)
    .attr("width", w);

const borderPath = svg.append("rect")
.attr("x", 0)
.attr("y", 0)
.attr("height", h)
.attr("width", w)
.style("stroke", "black")
.style("fill", "none")
.style("stroke-width", border);

let calcs = 0;

function drawChart(total, years) {

    let yearlyPayment = +total/+years;
    let payments = Array(+years).fill(yearlyPayment);
    pmts = cumSum(payments)
    pmts = pmts.map(p => Math.round(p));

    let x = d3.scaleBand()
        .domain(d3.range(pmts.length))
        .range([margin.left, w - margin.right])
        .paddingInner(0.05);

    let y = d3.scaleLinear()
        .domain([0, d3.max(pmts, p => p) * 1.25])
        .range([h - margin.bottom, margin.top])
    
    let yAxis = d3.axisLeft()
        .scale(y)
        .ticks(6)
        .tickFormat(d3.format("$~f"));

    let xAxis = d3.axisBottom()
        .scale(x)
        .ticks(pmts.length)
        .tickFormat("");
    
    let tip = d3.tip()
        .attr("class", "d3-tip")
        .html(function(d, i) {return `<span> Year: ${i+1} </span> <br> <span> Paid To-date: $${d} </span>`})
        .offset([-15, -25]); 

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(yAxis)
    
    svg.call(tip);

    svg.append("g")
        .attr("transform", `translate(0,${h - margin.bottom})`)
        .call(xAxis)
        .append("text")
        .attr("x", w - 40)
        .attr("y", 30)
        .attr("font-weight", "bold")
        .attr("text-anchor", "end")
        .attr("fill", "black")
        .text("Year");

    svg.selectAll("rect")
        .data(pmts, (d, i) => d + i)
        .enter()
        .append("rect")
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide)
        .attr("class", "rect")
        .attr("x", (d,i) => x(i))
        .attr("y", d => y(d))
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .transition()
        .delay((d, i) => i * 110)
        .duration(3000)
        .attr("height", d => {return y(0) - y(d);})
        .attr("fill", "forestgreen")
        .attr("stroke", "black");

};

function getRequest() {
    var request;
        if (window.XMLHttpRequest) {
            request  = new XMLHttpRequest();
        } else {
            request = new ActiveXObject();
        }
        return request;
};

function cumSum(arr) {
    let result = [arr[0]];
    for(let i = 1; i < arr.length; i++) {
        result[i] = result[i - 1] + arr[i];
    }
    return result;
};

window.onload = () => {
    document.getElementById('zipcode').addEventListener('keyup', () => {
        let searchField = document.getElementById('zipcode');
        let query = searchField.value;
        let regExp = new RegExp(`^${query}`, 'i')
        let xhr = getRequest();
        xhr.open('GET', 'lenders.json');
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                let myJSON = JSON.parse(xhr.responseText);
                let output = '<ul>';
                for (let prop in myJSON) {
                    if (regExp.test(myJSON[prop].zipcode)) {
                        output += `<li>
                        <a href="${myJSON[prop].url}">${myJSON[prop].name}</a><br>
                        <span>Zipcode: ${myJSON[prop].zipcode}</span>
                    </li>`
                    }
                }
                output += '</ul>'
                document.getElementById('asyncOutput').innerHTML = output;
            }
        };
        xhr.send();
    })
};


document.getElementById('calculateButton').addEventListener("click", function() {
    let amt = document.getElementById('loanAmount').value;
    let int = document.getElementById('annualInterest').value;
    let years = document.getElementById('repaymentPeriod').value;
    let totalInterest = amt * int * years;
    let totalPayment = +amt + +totalInterest;
    let monthlyPayment = Math.round(totalPayment/(years * 12));
    document.getElementById("monthlyPaymentOutput").innerHTML = `$${monthlyPayment}.00`;
    document.getElementById("totalPaymentOutput").innerHTML = `$${totalPayment}.00`;
    document.getElementById("totalInterestOutput").innerHTML = `$${totalInterest}.00`;
    if (calcs === 0) {
        drawChart(totalPayment, years);
    } else {
        updateChart(totalPayment, years)
    }
    calcs += 1;
});

function checkInterest() {
    let int = document.getElementById('annualInterest').value;
    if (isNaN(int) || !(+int > 0 && +int < 1)) {
        document.getElementById('annualInterest').value = '';
        alert("Please enter an Annual Interest value between 0 and 1.");
    }
};

function updateChart(totalPayment, years) {
    d3.selectAll("svg > *").remove();
    drawChart(totalPayment, years);
}

/* function checkZip() {
    let zip = document.getElementById('zipcode').value;
    let zipRegex = /(^\d{5}$)|(^\d{5}-\d{4}$)/
    if (!zipRegex.test(zip)) {
        document.getElementById('zipcode').value = '';
        alert("Please enter a valid zip code.")
    }
}; */

