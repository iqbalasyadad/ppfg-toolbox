const submitButton = document.getElementById("submit-btn");
const proposed_wellname_text = document.getElementById("proposed-wellname-text");
const plot_marker_text = document.getElementById("plot-marker-text");

// proposed_wellname_text.value = "H-XX-123";
// plot_marker_text.value = "R27";

const surrounding_marker_input_grid = new DataGridXL("surrounding-marker-input-grid", { 
    data: DataGridXL.createEmptyData(20, 5),
    columns: [
        {title: "WELL"}, 
        {title: "MARKER"},
        {title: "X"},
        {title: "Y"},
        {title: "Z"}
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
    frozenRows: 0,
    topBar: false,
    bottomBar: false
});

const proposed_marker_input_grid = new DataGridXL("proposed-marker-input-grid", { 
    data: DataGridXL.createEmptyData(20, 5),
    columns: [
        {title: "MARKER"},
        {title: "X"},
        {title: "Y"},
        {title: "Z"}
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
    frozenRows: 0,
    topBar: false,
    bottomBar: false
});

function transposeArray(array) {
    return array[0].map((_, colIndex) => array.map(row => row[colIndex]));
}

function get_grid_data(talbleGrid, ncol, types) {
    const allData = talbleGrid.getData();
    const nrow = allData.length;

    var gridDatas = [];

    for (let i=0; i<nrow; i++) {
        let col_status = true;
        for (let j=0; j<ncol; j++) {
            if (allData[i][j] === null) {
                col_status = false;
                break;
            }
        }
        if (col_status) {
            let row_datas = [];
            for (let j=0; j<ncol; j++) {
                if (types[j]==="t") {
                    row_datas.push(allData[i][j]);
                } else if (types[j]==="n") {
                    row_datas.push(parseFloat(allData[i][j]));
                }
            }
            gridDatas.push(row_datas);
        }
    }
    return transposeArray(gridDatas);
}

// PLOTLY
var trace1 = {
    name: 'surrounding well',
    x: [],
    y: [],
    type: 'marker',
    mode: 'markers+text',
    text: [],
    textposition: 'bottom center',
    marker: {
        color: '#000000',
        size: 10,
    },
};

var trace2 = {
    name: 'proposed well',
    x: [],
    y: [],
    type: 'marker',
    mode: 'markers+text',
    text: [],
    textposition: 'bottom center',
    marker: {
        symbol: 'x',
        color: '#915200',
        size: 10,
    },
};
  
var data = [trace1, trace2];

var layout = {
    title: {
        text:'Marker Map',
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
            text: 'X (m)',
            font: {
              family: 'Courier New, monospace',
              size: 10,
              color: '#000000'
            }
        },
    },
    yaxis: {
        title: {
            text: 'Y (m)',
            font: {
              family: 'Courier New, monospace',
              size: 10,
              color: '#000000'
            }
        },
    },
    dragmode: 'pan',
    width: 900,
    height: 900,
    margin: {
        l: 50, r: 50, b: 50, t: 50, pad: 5
    },
    paper_bgcolor: '#B6B6B4',
    plot_bgcolor: '#ffffff',
};

Plotly.newPlot('plotly-plot', data, layout);


function getSurroundingMarker() {
    const [s_wellnames, s_markers, s_xs, s_ys, s_zs] = get_grid_data(surrounding_marker_input_grid, 5, ['t', 't', 'n', 'n', 'n']);
    let surroundingMarker = {
        "wellname": s_wellnames,
        "marker": s_markers,
        "x": s_xs,
        "y": s_ys,
        "z": s_zs
    }
    return surroundingMarker;
}

function getProposedMarker() {
    const [p_markers, p_xs, p_ys, p_zs] = get_grid_data(proposed_marker_input_grid, 4, ['t', 'n', 'n', 'n']);
    let proposedMarker = {
        "marker": p_markers,
        "x": p_xs,
        "y": p_ys,
        "z": p_zs
    }
    return proposedMarker;
}

function filterSurroundingMarker(marker_name, surroundingMarker) {
    let result_ids = [];
    for (let i=0; i<surroundingMarker.marker.length; i++) {
        if (surroundingMarker.marker[i] === marker_name) {
            result_ids.push(i);
        }
    }
    const filteredSurroundingMarker = {
        "wellname": result_ids.map(i => surroundingMarker["wellname"][i]),
        "marker": result_ids.map(i => surroundingMarker["marker"][i]),
        "x": result_ids.map(i => surroundingMarker["x"][i]),
        "y": result_ids.map(i => surroundingMarker["y"][i]),
        "z": result_ids.map(i => surroundingMarker["z"][i])
    }
    return filteredSurroundingMarker;
}

function filterProposedMarker(marker_name, proposedMarker) {
    let result_ids = [];
    for (let i=0; i<proposedMarker.marker.length; i++) {
        if (proposedMarker.marker[i] === marker_name) {
            result_ids.push(i);
        }
    }
    const filteredProposedMarker = {
        "marker": result_ids.map(i => proposedMarker["marker"][i]),
        "x": result_ids.map(i => proposedMarker["x"][i]),
        "y": result_ids.map(i => proposedMarker["y"][i]),
        "z": result_ids.map(i => proposedMarker["z"][i])
    }
    return filteredProposedMarker;
}


submitButton.onclick = function(){
    const marker_map = plot_marker_text.value;

    const surroundingMarker = getSurroundingMarker();
    const filteredSurroundingMarker = filterSurroundingMarker(marker_map, surroundingMarker);

    const proposedMarker = getProposedMarker();
    const filteredProposedMarker = filterProposedMarker(marker_map, proposedMarker);

    const margin_axis = 2500;
    const circle_radius2 = 2000;
    const circle_radius1 = 1000;

    var update = {
        x: [filteredSurroundingMarker["x"], filteredProposedMarker["x"]],
        y: [filteredSurroundingMarker["y"], filteredProposedMarker["y"]],
        text: [filteredSurroundingMarker["wellname"], [proposed_wellname_text.value]]
    };

    var bigCircle = [
        {
          type: 'circle',
          xref: 'x',
          yref: 'y',
          x0: filteredProposedMarker["x"][0] - circle_radius2,   // New x-coordinate of the left side
          y0: filteredProposedMarker["y"][0] - circle_radius2,   // New y-coordinate of the bottom side
          x1: filteredProposedMarker["x"][0] + circle_radius2,   // New x-coordinate of the right side
          y1: filteredProposedMarker["y"][0] + circle_radius2,   // New y-coordinate of the top side
          line: {
            color: '#5d5d61',
            width: 2,
            dash: 'dash'
          }
        },
        {
            type: 'circle',
            xref: 'x',
            yref: 'y',
            x0: filteredProposedMarker["x"][0] - circle_radius1,   // New x-coordinate of the left side
            y0: filteredProposedMarker["y"][0] - circle_radius1,   // New y-coordinate of the bottom side
            x1: filteredProposedMarker["x"][0] + circle_radius1,   // New x-coordinate of the right side
            y1: filteredProposedMarker["y"][0] + circle_radius1,   // New y-coordinate of the top side
            line: {
              color: '#8f8f8f',
              width: 2,
              dash: 'dash'
            }
        }
    ];

    Plotly.update('plotly-plot', update, {
        shapes: bigCircle,
        title: {
            text:'Marker Map ' + marker_map,
            font: {
              family: 'Courier New, monospace',
              size: 12
            },
        },
        xaxis: {
            title: {
                text: 'X (m)',
                font: {
                  family: 'Courier New, monospace',
                  size: 10,
                  color: '#000000'
                }
            },
            tickfont: {
                size: 10,
            },
            tickmode: 'linear',
            tick0: 0,
            dtick: 500,
            range: [filteredProposedMarker["x"][0] - margin_axis, filteredProposedMarker["x"][0] + margin_axis]  // Update x-axis range
        },
        yaxis: {
            title: {
                text: 'Y (m)',
                font: {
                  family: 'Courier New, monospace',
                  size: 10,
                  color: '#000000'
                }
            },
            tickfont: {
                size: 10,
            },
            tickmode: 'linear',
            tick0: 0,
            dtick: 500,
            tickangle: 270,
            range: [filteredProposedMarker["y"][0] - margin_axis, filteredProposedMarker["y"][0] + margin_axis]  // Update y-axis range

        },
     });

}