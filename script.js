//Adding event listener to the search button
document.getElementById('searchButton').addEventListener('click', () => {
  if (searchBox.value != 0) {
    getData(searchBox.value.toUpperCase(), document.getElementById('selectLabel').value);
  }
});

//Function that allows us to get the data from a website
function getData(keyTag, timeStamp) {
  //This key is necessary to access the files on ALPHA VANTAGE(Free generated key)
  const API_KEY = 'E9N6IVQZE31T6CQV';
  //Creating the url with the api key and our searched terms and options
  let url = `https://www.alphavantage.co/query?function=TIME_SERIES_${timeStamp}&symbol=${keyTag}&outputsize=compact&interval=60min&apikey=${API_KEY}`;
  //Using the 'fetch API' to get data from the website
  fetch(url)
    .then(response => response.json())
    .then(data => {
      //If the searched tag is not correct or found in the database
      if (Object.keys(data)[0] === 'Error Message') {
        document.getElementById('searchText').innerText = 'Stock Tag not found, please try again';
        return;
      }
      //If the searched tag is good
      //If there is another chart generated already
      if (document.getElementById('myChart')) {
        document.getElementById('myChart').remove();
      }
      document.getElementById('searchText').innerText = 'Insert new stock tag';
      editText(timeStamp);
      let DataId = setDataId(timeStamp);
      setChart(data[DataId], keyTag, timeStamp);
    })
    //"Catching" an error
    .catch(err => {
      document.getElementById('searchText').innerText = 'Stock Tag not found, please try again';
    })
}

//Function for editing the text for the key inside the data object
function setDataId(timeStamp) {
  if (timeStamp === 'DAILY') {
    return `Time Series (${timeStamp[0] + timeStamp.toLowerCase().substring(1)})`;
  } else if (timeStamp === 'INTRADAY') {
    return 'Time Series (60min)';
  } else if (timeStamp === 'WEEKLY') {
    return 'Weekly Time Series';
  } else if (timeStamp === 'MONTHLY') {
    return 'Monthly Time Series';
  }
}

//The called function that creates our diagram
function setChart(extractedData, symbol, timeStamp) {
  let myChart = document.createElement('canvas');
  document.getElementById('chartPlace').appendChild(myChart);
  myChart.id = 'myChart';
  const ctx = myChart.getContext('2d');
  let labels = [];
  let prices = [];
  //Filtering the chart by the option selected 
  if (timeStamp === 'DAILY') {
    getDataPerLast30Days(extractedData, labels, prices);;
  } else if (timeStamp === 'INTRADAY') {
    getDataPerHour(extractedData, labels, prices);
  } else if (timeStamp === 'WEEKLY') {
    getDataPerWeek(extractedData, labels, prices);
  } else if (timeStamp === 'MONTHLY') {
    getDataPerLastYear(extractedData, labels, prices);
  }
  //Using Chart.js for the chart
  const data = {
    labels: labels,
    datasets: [{
      label: `${symbol} Stock Price`,
      borderColor: "rgb(185, 217, 235)",
      fill: true,
      backgroundColor: "rgb(185, 217, 235, 0.3)",
      opacity: '1',
      data: prices,
    }]
  };
  const config = {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      scales: {
        y: {
          ticks: {
            //For showing the dollar "$" sign
            callback: function (value) {
              return `${value} $`
            }
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          labels: {
            font: {
              weight: '900',
              size: 14
            }
          }
        }
      }
    }
  };
  myChart = new Chart(ctx, config);
}

//Function that 'creates' our data for the last 30 days option
function getDataPerLast30Days(extractedData, labels, prices) {
  let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 29; i >= 0; --i) {
    if (Object.keys(extractedData)[i].slice(5, 7)[0] == 0) {
      labels.push(`${Object.keys(extractedData)[i].slice(8, 10)} ${months[Object.keys(extractedData)[i].slice(5, 7)[1] - 1]}`);
    } else {
      labels.push(`${Object.keys(extractedData)[i].slice(8, 10)} ${months[Object.keys(extractedData)[i].slice(5, 7)]}`);
    }
    prices.push(extractedData[Object.keys(extractedData)[i]]['1. open'])
  }
}

//Function that 'creates' our data for the last 24 hours option
function getDataPerHour(extractedData, labels, prices) {
  for (let i = 23; i >= 0; --i) {
    labels.push(Object.keys(extractedData)[i].slice(10, 16));
    prices.push(extractedData[Object.keys(extractedData)[i]]['1. open'])
  }
}

//Function that 'creates' our data for the last 12 weeks option
function getDataPerWeek(extractedData, labels, prices) {
  for (let i = 11; i >= 0; --i) {
    let week = Object.keys(extractedData)[i].slice(8, 10)
    week = Object.keys(extractedData)[i + 1].slice(8, 10) + '-' + week
    labels.push(week);
    prices.push(extractedData[Object.keys(extractedData)[i]]['1. open'])
  }
}

//Function that 'creates' our data for the last 12 months option
function getDataPerLastYear(extractedData, labels, prices) {
  let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  for (let i = 12; i >= 0; --i) {
    if (Object.keys(extractedData)[i].slice(5, 7)[0] == 0) {
      labels.push(months[Object.keys(extractedData)[i].slice(5, 7)[1] - 1]);
    } else {
      labels.push(months[Object.keys(extractedData)[i].slice(5, 7)]);
    }
    prices.push(extractedData[Object.keys(extractedData)[i]]['1. open'])
  }
}

//Function that edits the info text
function editText(timeStamp) {
  if (timeStamp === 'DAILY') {
    document.getElementById('timeStamp').innerText = `Time stamp: Last 30 Days`;
  } else if (timeStamp === 'INTRADAY') {
    document.getElementById('timeStamp').innerText = `Time stamp: Last 24 Hours`;
  } else if (timeStamp === 'WEEKLY') {
    document.getElementById('timeStamp').innerText = `Time stamp: Last 12 Weeks`;
  } else if (timeStamp === "MONTHLY") {
    document.getElementById('timeStamp').innerText = `Time stamp: Last 12 Months`;
  }
}