const pp_input_grid = new DataGridXL("pp-input-grid", { 
    data: DataGridXL.createEmptyData(20, 2),
    columns: [
        {title: "PP DEPTH"}, 
        {title: "PP SG"}
    ],
    allowDeleteCols: false,
    allowMoveCols: false,
    allowInsertCols: false,
    allowHideCols: false,
    allowHideRows: false,
    allowMoveRows: false,
    colHeaderHeight: 20,
    colHeaderWidth: 50,
    colHeaderLabelType: "numbers",
    colHeaderLabelAlign: "center",
    colAlign: "right",
    rowHeight: 20,
    frozenRows: 0
});


const pp_shale_output_grid = new DataGridXL("pp-shale-output-grid", { 
    data: DataGridXL.createEmptyData(20, 2),
    columns: [
        {title: "PP DEPTH"}, 
        {title: "PP SG"}
    ],
    allowDeleteCols: false,
    allowMoveCols: false,
    allowInsertCols: false,
    allowHideCols: false,
    allowHideRows: false,
    allowMoveRows: false,
    colHeaderHeight: 20,
    colHeaderWidth: 50,
    colHeaderLabelType: "numbers",
    colHeaderLabelAlign: "center",
    colAlign: "right",
    rowHeight: 20,
    frozenRows: 0
});


const pp_sand_output_grid = new DataGridXL("pp-sand-output-grid", { 
    data: DataGridXL.createEmptyData(20, 2),
    columns: [
        {title: "PP DEPTH"}, 
        {title: "PP SG"}
    ],
    allowDeleteCols: false,
    allowMoveCols: false,
    allowInsertCols: false,
    allowHideCols: false,
    allowHideRows: false,
    allowMoveRows: false,
    colHeaderHeight: 20,
    colHeaderWidth: 50,
    colHeaderLabelType: "numbers",
    colHeaderLabelAlign: "center",
    colAlign: "right",
    rowHeight: 20,
    frozenRows: 0
});


// PLOTLY
var trace1 = {
    name: 'PP w/ depletion',
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: {
        color: '#ff110d',
        width: 3
    }
};

var trace2 = {
    name: 'FG w/ depletion',
    x: [],
    y: [],
    type: 'marker',
    mode: 'markers',
    marker: {
        color: '#000000',
        size: 10,
    },
};
  
var data = [trace1, trace2];

var layout = {
    title: {
        text:'Separate PPFG Depletion',
        font: {
          family: 'Courier New, monospace',
          size: 12
        },
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
            text: 'SG',
            font: {
              family: 'Courier New, monospace',
              size: 10,
              color: '#000000'
            }
        },
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
    width: 900,
    height: 900,
    margin: {
        l: 50, r: 50, b: 50, t: 50, pad: 5
    },
    paper_bgcolor: '#B6B6B4',
    plot_bgcolor: '#E5E4E2',
    };

Plotly.newPlot('plotly-plot', data, layout);

// Function to retrieve all data from the grid
function get_col_ab(talbleGrid) {
    const allData = talbleGrid.getData(); // Get all data
    const nrow = allData.length;

    var col_a = [];
    var col_b = [];
    for (let i=0; i<nrow; i++) {
        if (allData[i][0] !== null && allData[i][1] !== null) {
            col_a.push(parseFloat(allData[i][0]));
            col_b.push(parseFloat(allData[i][1]));
        } else {
            continue;
        }
    }
    console.log(col_a, col_b);
    return[col_a, col_b];
}

function remove_depletion(depths, vals, cutoff) {
    let shale_depth_list = [depths[0]];
    let shale_val_list = [vals[0]];

    let sand_depth_list = [];
    let sand_val_list = [];

    let remove_data = true;

    for (let i=0; i<depths.length-1; i++) {
        if ((Math.abs(vals[i+1] - vals[i]) > cutoff) && remove_data) {
            sand_depth_list.push(depths[i+1]);
            sand_val_list.push(vals[i+1]);
            remove_data = false;
        } else {
            shale_depth_list.push(depths[i+1]);
            shale_val_list.push(vals[i+1]);
            remove_data = true;
        }
    }
    return [shale_depth_list, shale_val_list, sand_depth_list, sand_val_list];
}

function col_to_row(a, b) {
    let result = []
    for (let i=0; i<a.length; i++) {
        result.push([a[i], b[i]])
    }
    return result;
}

function run_pp() {
    const [pp_input_depths, pp_input_vals] =  get_col_ab(pp_input_grid);
    let [pp_shale_depths, pp_shale_vals, pp_sand_depths, pp_sand_vals] = remove_depletion(pp_input_depths, pp_input_vals, 0.025);
    let pp_shale_list = col_to_row(pp_shale_depths, pp_shale_vals);
    let pp_sand_list = col_to_row(pp_sand_depths, pp_sand_vals);

    const pp_shale_output_grid = new DataGridXL("pp-shale-output-grid", { 
        data: pp_shale_list,
        columns: [
            {title: "PP DEPTH"}, 
            {title: "PP SG"}
        ],
        allowDeleteCols: false,
        allowMoveCols: false,
        allowInsertCols: false,
        allowHideCols: false,
        allowHideRows: false,
        allowMoveRows: false,
        colHeaderHeight: 20,
        colHeaderWidth: 50,
        colHeaderLabelType: "numbers",
        colHeaderLabelAlign: "center",
        colAlign: "right",
        rowHeight: 20,
        frozenRows: 0
    });

    const pp_sand_output_grid = new DataGridXL("pp-sand-output-grid", { 
        data: pp_sand_list,
        columns: [
            {title: "PP DEPTH"}, 
            {title: "PP SG"}
        ],
        allowDeleteCols: false,
        allowMoveCols: false,
        allowInsertCols: false,
        allowHideCols: false,
        allowHideRows: false,
        allowMoveRows: false,
        colHeaderHeight: 20,
        colHeaderWidth: 50,
        colHeaderLabelType: "numbers",
        colHeaderLabelAlign: "center",
        colAlign: "right",
        rowHeight: 20,
        frozenRows: 0
    });

    var update = {
        x: [pp_input_vals, pp_sand_vals],
        y: [pp_input_depths, pp_sand_depths]
    };
    
    Plotly.restyle('plotly-plot', update);

}

const submitPPButton = document.getElementById("submit-pp-btn");
submitPPButton.onclick = function(){
    run_pp();
}