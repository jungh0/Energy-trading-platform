var dollar = 0;
var chart = AmCharts.makeChart("chartdiv", {
    "type": "serial",
    "theme": "dark",
    "dataLoader": {
        "url": "https://poloniex.com/public?command=returnOrderBook&currencyPair=USDT_ETH&depth=50",
        "format": "json",
        "reload": 30,
        "postProcess": function (data) {

            // Function to process (sort and calculate cummulative volume)
            function processData(list, type, desc) {

                // Convert to data points
                for (var i = 0; i < list.length; i++) {
                    list[i] = {
                        value: Number(list[i][0]),
                        volume: Number(list[i][1]),
                    }
                }

                // Sort list just in case
                list.sort(function (a, b) {
                    if (a.value > b.value) {
                        return 1;
                    }
                    else if (a.value < b.value) {
                        return -1;
                    }
                    else {
                        return 0;
                    }
                });

                // Calculate cummulative volume
                if (desc) {
                    for (var i = list.length - 1; i >= 0; i--) {
                        if (i < (list.length - 1)) {
                            list[i].totalvolume = list[i + 1].totalvolume + list[i].volume;
                        }
                        else {
                            list[i].totalvolume = list[i].volume;
                        }
                        var dp = {};
                        dp["value"] = list[i].value;
                        dp[type + "volume"] = list[i].volume;
                        dp[type + "totalvolume"] = list[i].totalvolume;
                        res.unshift(dp);
                    }
                }
                else {
                    for (var i = 0; i < list.length; i++) {
                        if (i > 0) {
                            list[i].totalvolume = list[i - 1].totalvolume + list[i].volume;
                        }
                        else {
                            list[i].totalvolume = list[i].volume;
                        }
                        var dp = {};
                        dp["value"] = list[i].value;
                        dp[type + "volume"] = list[i].volume;
                        dp[type + "totalvolume"] = list[i].totalvolume;
                        res.push(dp);
                    }
                }

            }

            // Init
            var res = [];
            processData(data.bids, "bids", true);
            processData(data.asks, "asks", false);

            //console.log();
            dollar = data.asks[0]["value"];
            var tmpv = '$' + data.asks[0]["value"];
            document.getElementById('ETHPrice1').innerHTML = tmpv;
            document.getElementById('ETHPrice2').innerHTML = tmpv;

            //console.log(res);
            return res;
        }
    },
    "graphs": [{
        "id": "bids",
        "fillAlphas": 0.1,
        "lineAlpha": 1,
        "lineThickness": 2,
        "lineColor": "#e02745",
        "type": "step",
        "valueField": "bidstotalvolume",
        "balloonFunction": balloon
    }, {
        "id": "asks",
        "fillAlphas": 0.1,
        "lineAlpha": 1,
        "lineThickness": 2,
        "lineColor": "#1a63b2",
        "type": "step",
        "valueField": "askstotalvolume",
        "balloonFunction": balloon
    }, {
        "lineAlpha": 0,
        "fillAlphas": 0.2,
        "lineColor": "#000",
        "type": "column",
        "clustered": false,
        "valueField": "bidsvolume",
        "showBalloon": false
    }, {
        "lineAlpha": 0,
        "fillAlphas": 0.2,
        "lineColor": "#000",
        "type": "column",
        "clustered": false,
        "valueField": "asksvolume",
        "showBalloon": false
    }],
    "categoryField": "value",
    "chartCursor": {},
    "balloon": {
        "textAlign": "left"
    },
    "valueAxes": [{
        "title": "Volume",
        "color": "#000",
        "titleColor": "#000"
    }],
    "categoryAxis": {
        "title": "Price (USDT/ETH)",
        "minHorizontalGap": 100,
        "startOnAxis": true,
        "showFirstLabel": false,
        "showLastLabel": false,
        "titleColor": "#000"
    },
    "export": {
        "enabled": true
    }
});

function balloon(item, graph) {
    var txt;
    if (graph.id == "asks") {
        txt = "Ask: $<strong>" + formatNumber(item.dataContext.value, graph.chart, 4) + "</strong><br />"
            + "Total volume: <strong>" + formatNumber(item.dataContext.askstotalvolume, graph.chart, 4) + "</strong><br />"
            + "Volume: <strong>" + formatNumber(item.dataContext.asksvolume, graph.chart, 4) + "</strong>";
    }
    else {
        txt = "Bid: $<strong>" + formatNumber(item.dataContext.value, graph.chart, 4) + "</strong><br />"
            + "Total volume: <strong>" + formatNumber(item.dataContext.bidstotalvolume, graph.chart, 4) + "</strong><br />"
            + "Volume: <strong>" + formatNumber(item.dataContext.bidsvolume, graph.chart, 4) + "</strong>";
    }
    return txt;
}

function formatNumber(val, chart, precision) {
    return AmCharts.formatNumber(
        val,
        {
            precision: precision ? precision : chart.precision,
            decimalSeparator: chart.decimalSeparator,
            thousandsSeparator: chart.thousandsSeparator
        }
    );
}

var buyeth = 0;
var oldVal = "";
//예전 jQuery라면 on이 아니라 bind나 live 
$("#ordercount").on("change keyup paste", function () {
    var currentVal = $(this).val();

    if (currentVal == oldVal) {
        return;
    }

    if (isNaN(currentVal) == true) {
        $(this).val("");
        //alert("숫자만 입력해주세요.");
    } else {
        oldVal = currentVal;
        var tmp = currentVal / 10;
        buyeth = tmp;
        buyeth2 = buyeth * dollar;
        $("#orderprice").val(buyeth + " ETH");
        document.getElementById('infoo').innerHTML = "$" + buyeth2;
    }

    
    //alert("changed!");
});

