const cols = [
  {"label": "Pay Period Beginning - Ending", "holds": ""},
  {"label": "Grant-funded Exempt Timecards Due", "holds": ""},
  {"label": "Timecard Approval Due Date", "holds": ""},
  {"label": "PAT Changes Due", "holds": ""},
  {"label": "Payday & PM Pat Aprvl Due", "holds": ""},
  {"label": "Observed Holiday", "holds": ""},
  {"label": "Effort Certification Period", "holds": ""},
]

async function draw_calendar() {

  data = await d3.json('./pay_periods.json') ;
  const table_div = d3.select("#placeholder") ;
  const table = table_div.append("table")
  table.append("thead")
    .selectAll("thead")
    .data(cols)
    .enter()
      .append("th")
      .text((d) => d.label)
  ;
  tbod = table.append("tbody") ;
  tbod.selectAll("tr")
    .data(data.pay_periods)
    .enter()
      .append("tr")
        .selectAll("td")
        .data(cols)
        .enter()
          .append("td")
          .text((d) => d.label)
  ;
  console.log(data) ;
}

draw_calendar() ;
