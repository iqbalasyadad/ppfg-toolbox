// default
document.getElementById("dtshmax-min-text").value=202;
document.getElementById("dtshmax-max-text").value=205;
document.getElementById("dtshmin-min-text").value=50;
document.getElementById("dtshmin-max-text").value=58;
document.getElementById("kam-min-text").value=1500;
document.getElementById("kam-max-text").value=2000;
document.getElementById("nctdepth-max-text").value=4000;


const shptdtf_grid = new DataGridXL("shptdtf-grid", { 
    data: DataGridXL.createEmptyData(5, 2),
    columns: [{title: "DEPTH"}, { title: "SHPTF DT" }],
    allowDeleteCols: false,
    allowMoveCols: false,
    allowInsertCols: false,
    allowHideCols: false,
    allowHideRows: false,
    allowMoveRows: false,
    colHeaderHeight: 20,
    colHeaderWidth: 100,
    colHeaderLabelType: "numbers",
    colHeaderLabelAlign: "center",
    colAlign: "right",
    rowHeight: 20,
    frozenRows: 0
});

const depthfit_grid = new DataGridXL("depthfit-grid", { 
    data: DataGridXL.createEmptyData(2, 2),
    columns: [{title: "DEPTH START"}, { title: "DEPTH END" }],
    allowDeleteCols: false,
    allowMoveCols: false,
    allowInsertCols: false,
    allowMoveRows: false,
    allowHideCols: false,
    allowHideRows: false,
    colHeaderHeight: 20,
    colHeaderWidth: 100,
    colHeaderLabelType: "numbers",
    colHeaderLabelAlign: "center",
    colAlign: "right",
    rowHeight: 20,
    frozenRows: 0
});


// PLOTLY
var trace1 = {
    name: 'SHPT DT',
    x: [],
    y: [],
    type: 'marker',
    mode: 'markers',
    marker: {
        color: 'rgb(17, 157, 255)',
        size: 3,
    },
};

var trace2 = {
    name: 'NCT DT',
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: {
        color: '#000000',
        width: 3
    }
};
  
var data = [trace1, trace2];

var layout = {
    title: {
        text:'SHPTF DT Curve Fitting',
        font: {
          family: 'Courier New, monospace',
          size: 12
        },
        // xref: 'paper',
        // x: 0.05,
    },
    showlegend: true,
    legend: {
      x: 1,
      xanchor: 'right',
      y: 1
    },
    autosize: false,
    xaxis: {
        title: {
            text: 'us/ft',
            font: {
              family: 'Courier New, monospace',
              size: 10,
              color: '#000000'
            }
        },
        autorange: 'reversed',
        tickmode: 'linear',
        tick0: 0,
        dtick: 5
    },
    yaxis: {
        title: {
            text: 'Depth',
            font: {
              family: 'Courier New, monospace',
              size: 10,
              color: '#000000'
            }
        },
        autorange: 'reversed',
        tickmode: 'linear',
        tick0: 0,
        dtick: 100
    },
    width: 400,
    height: 900,
    margin: {
        l: 50, r: 50, b: 50, t: 50, pad: 5
    },
    paper_bgcolor: '#B6B6B4',
    plot_bgcolor: '#E5E4E2',
    };

Plotly.newPlot('plotly-plot', data, layout);

function arange(start, stop, step) {
    if (step === 0) throw new Error("Step cannot be zero.");
    const array = [];
    for (let value = start; (step > 0 ? value < stop : value > stop); value += step) {
        array.push(value);
    }
    return array;
}

function get_shptdt() {
    var shptdt_list = [];
    var tvdss_list = [];
    const nrow = shptdtf_grid._cellStore.length;
    line_list = shptdtf_grid.getCellRangeData([{x: 0, y:0}, {x: 1, y: nrow-1}]);
    for (let i=0; i<line_list.length; i++) {
        if (line_list[i][0]!==null && line_list[i][1]!==null) {
            tvdss_list.push(parseFloat(line_list[i][0]))
            shptdt_list.push(parseFloat(line_list[i][1]))
        } else {
            continue;
        }
    }
    return [tvdss_list, shptdt_list];
}

function get_depth_fit_range() {
    var depth_range_list = [];
    const nrow = depthfit_grid._cellStore.length;
    line_list = depthfit_grid.getCellRangeData([{x: 0, y:0}, {x: 1, y: nrow-1}]);
    for (i=0; i<line_list.length; i++) {
        if (line_list[i][0]!==null && line_list[i][0]!==null) {
            depth_range_list.push([parseFloat(line_list[i][0]), parseFloat(line_list[i][1])])
        } else {
            continue;
        }
    }
    return depth_range_list;
}

function nct_dt(water_depth, air_gap, dtsh_max, dtsh_min, kam, depth_max, depth_interval) {
    var nct = {
        'depths': arange(0, depth_max, depth_interval),
        'vals': []
    };
    for (let i=0;i<nct["depths"].length;i++) {
        if (nct["depths"][i] < (water_depth + air_gap)) {
            nct["vals"].push(dtsh_max);
        } else {
            nct["vals"].push((dtsh_max-dtsh_min)*Math.exp((air_gap + water_depth - nct["depths"][i])/kam) + dtsh_min)
        }
    }
    return nct;
}

function nct_dt_by_depths(water_depth, air_gap, dtsh_max, dtsh_min, kam, depth_list) {
    var nct = {
        'depths': depth_list,
        'vals': []
    };
    for (let i=0; i<nct["depths"].length; i++) {
        if (nct["depths"][i] < (water_depth + air_gap)) {
            nct["vals"].push(dtsh_max);
        } else {
            nct["vals"].push((dtsh_max-dtsh_min)*Math.exp((air_gap + water_depth - nct["depths"][i])/kam) + dtsh_min)
        }
    }
    return nct;
}

function nct_dt_fit(shptf_depths, shptf_vals, depths_fit_ranges, dtsh_max_ranges, dtsh_min_ranges, kam_ranges, nct_max_depth, nct_depth_interval) {
    const water_depth = 0
    const air_gap = 0
    var shptf_used_raw = {
        "depths": [],
        "vals": []
    }

    for (let i=0; i<depths_fit_ranges.length; i++) {
        for (let j=0;j<shptf_depths.length;j++) {
            if ((shptf_depths[j] >= depths_fit_ranges[i][0]) && (shptf_depths[j] <= depths_fit_ranges[i][1])) {
                shptf_used_raw["depths"].push(shptf_depths[j])
                shptf_used_raw["vals"].push(shptf_vals[j])
            }
        }
    }

    // sampling shptf used
    shptf_used = { "depths": [], "vals": [] }
    shpf_used_interval = 20
    for (let i=0;i<shptf_used_raw["depths"].length; i++) {
        if (i%shpf_used_interval === 0) {
            shptf_used["depths"].push(shptf_used_raw["depths"][i])
            shptf_used["vals"].push(shptf_used_raw["vals"][i])
        }
    }

    // NCT fitting
    let RMSE_min = 999
    let dtsh_max_best = 0
    let dtsh_min_best = 0
    let kam_best = 0

    for (let dtsh_max=dtsh_max_ranges[0]; dtsh_max<=dtsh_max_ranges[1]; dtsh_max++) {
        for (let dtsh_min=dtsh_min_ranges[0]; dtsh_min<=dtsh_min_ranges[1]; dtsh_min++) {
            for (let kam=kam_ranges[0]; kam<=kam_ranges[1]; kam++) {

                let nct_shptf = nct_dt_by_depths(water_depth, air_gap, dtsh_max, dtsh_min, kam, shptf_used["depths"])
                
                let n_SHPT_f = nct_shptf["vals"].length;

                let delta_all = 0
                for (let i=0; i<n_SHPT_f; i++) {
                    delta_all += (shptf_used["vals"][i]-nct_shptf["vals"][i])**2
                }
                let RMSE = delta_all/n_SHPT_f

                if (RMSE < RMSE_min) {
                    RMSE_min = RMSE
                    dtsh_max_best = dtsh_max
                    dtsh_min_best = dtsh_min
                    kam_best = kam
                }
            }
        }    
    }
    return [RMSE_min, dtsh_max_best, dtsh_min_best, kam_best];
}

function run() {
    dtsh_max_ranges_min = document.getElementById("dtshmax-min-text").value;
    dtsh_max_ranges_max = document.getElementById("dtshmax-max-text").value;
    dtsh_max_ranges = [dtsh_max_ranges_min, dtsh_max_ranges_max];

    dtsh_min_ranges_min = document.getElementById("dtshmin-min-text").value;
    dtsh_min_ranges_max = document.getElementById("dtshmin-max-text").value;
    dtsh_min_ranges = [dtsh_min_ranges_min, dtsh_min_ranges_max];

    kam_ranges_min = document.getElementById("kam-min-text").value;
    kam_ranges_max = document.getElementById("kam-max-text").value;
    kam_ranges = [kam_ranges_min, kam_ranges_max];

    kam_ranges_max = document.getElementById("nctdepth-max-text").value;
    nct_max_depth = kam_ranges_max;

    nct_depth_interval = 10;
    const [shpt_depths, shpt_vals] = get_shptdt();
    depths_fit = get_depth_fit_range();
    const [rmse_min, dtsh_max_best, dtsh_min_best, kam_best] = nct_dt_fit(shpt_depths, shpt_vals, depths_fit, dtsh_max_ranges, dtsh_min_ranges, kam_ranges, nct_max_depth, nct_depth_interval);
    nct_best = nct_dt(0, 0, dtsh_max_best, dtsh_min_best, kam_best, nct_max_depth, nct_depth_interval);

    var update = {
        x: [shpt_vals, nct_best["vals"]],
        y: [shpt_depths, nct_best["depths"]]
    };
    
    Plotly.restyle('plotly-plot', update);
    result_nct_param_ta.value = "dtsh max: "+dtsh_max_best+'\n'+"dtsh min: "+dtsh_min_best+'\n'+"kam: "+kam_best+'\n'+"rmse: "+rmse_min.toFixed(2);
}

const submitButton = document.getElementById("submit-btn");
const loadingAnimation = document.getElementById("lds-ring");
const result_nct_param_ta = document.querySelector("#nct-result-ta");

submitButton.onclick = function(){
    submitButton.disabled = true;
    run();
    submitButton.disabled = false;
}