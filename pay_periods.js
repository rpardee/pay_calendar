const dateParser = d3.timeParse("%m/%d/%Y") ;
const dateFormat = d => d3.timeFormat("%b %e")(dateParser(d)) ;
const holiDateFormat = d => d3.timeFormat("%A %b %e")(dateParser(d)) ;

function getHolidays(pp, holidays) {
  st = dateParser(pp.start_date) ;
  en = dateParser(pp.end_date) ;
  ret = '' ;
  holidays.forEach((hol) => {
    hd = dateParser(hol.date) ;
    if (st < hd && hd < en) {
      ret += `<p>${hol.name}: ${holiDateFormat(hol.date)}</p>` ;
    }
  }) ;
  return ret ;
}

function cellContents(pp, col) {
  if (col.holds === "start_date") {
    return `${dateFormat(pp.start_date)} &mdash; ${dateFormat(pp.end_date)}` ;
  } else if (col.holds === 'effort_certification_period' && 'effort_certification_period' in pp) {
    return typeof pp.effort_certification_period === "string" ? pp.effort_certification_period : `Period ${pp.effort_certification_period}` ;
  } else if (col.holds === 'holidays') {
    return getHolidays(pp, data.holidays) ;
  }
  // return dateFormat(pp[col.holds]) ;
  return pp[col.holds] === undefined ? undefined : dateFormat(pp[col.holds]) ;
}

function ppClass(pp) {
  st = dateParser(pp.start_date) ;
  en = dateParser(pp.end_date) ;
  today = Date.now() ;
  // today = new Date('1/19/2021') ;
  if (en < today) {
    return 'past-week' ;
  } else if (st < today && today < en) {
    return 'current-week' ;
  }
  return 'future-week' ;
}

function getCellClass(pp, col) {
  if (dateParser(pp.pat_submission_due) < dateParser(pp.timecard_approval_due)) {
    if (col.holds === "timecard_approval_due") {
      return "tad-early" ;
    }
    if (col.holds === "pat_submission_due") {
      return "psd-early" ;
    }
  }
  return "class" in col ? col.class : "normal" ;
}


const cols = [
  {"label": "Dates", "holds": "start_date"},
  {"label": "<abbr title = 'For Exempt employees on Grant-funded projects'>Timecards Due Thursday</abbr>", "holds": "timecard_submission_due"},
  {"label": "Timecard Approvals <p>By Noon on</p>", "holds": "timecard_approval_due"},
  {"label": "<a title='Manage Your PAT here' href='https://onelinkfscm.kp.org/psc/fsolprd/EMPLOYEE/ERP/c/NUI_FRAMEWORK.PT_AGSTARTPAGE_NUI.GBL?CONTEXTIDPARAMS=TEMPLATE_ID%3aPTPPNAVCOL&scname=ADMN_KP_GRANTS_MGMT&PanelCollapsible=Y&PTPPB_GROUPLET_ID=KP_GRANTS_MGMT&CRefName=ADMN_NAVCOLL_18'>PAT Changes By", "holds": "pat_submission_due"},
  {"label": "Payday! <p>PM PAT Approvals<br/>By Noon on</p>", "holds": "pat_approval_due"},
  {"label": "Observed Holiday", "holds": "holidays", "class": "holiday"},
  {"label": "<a title = 'Certify your effort here' href = 'https://onelinkfscm.kp.org/psc/fsolprd/EMPLOYEE/ERP/c/NUI_FRAMEWORK.PT_AGSTARTPAGE_NUI.GBL?CONTEXTIDPARAMS=TEMPLATE_ID%3aPTPPNAVCOL&scname=ADMN_KP_GRANTS_MGMT&PanelCollapsible=Y&PTPPB_GROUPLET_ID=KP_GRANTS_MGMT&CRefName=ADMN_NAVCOLL_18'>Effort Certification Period</a>", "holds": "effort_certification_period", "class": "eff-cert"},
]

async function draw_calendar() {

  data = await d3.json('./pay_periods.json') ;

  const table_div = d3.select("#placeholder") ;
  const table = table_div.append("table")
  const thed = table.append("thead")
  ;
  thed.append("th").text("Pay Period") ;
  thed.selectAll("th.normal")
    .data(cols)
    .enter()
      .append("th")
      .attr("class", "normal")
      .html((d) => d.label)
  ;
  const tbod = table.append("tbody") ;

  data.pay_periods.forEach((pp, i) => {
    const roe = tbod.append("tr")
      .attr("class", ppClass(pp))
    ;
    roe.append("td").text(i+1)
      .attr("class", [9, 22].includes(i+1) ? 'no-deduct' : 'normnum')
      .attr("title", [9, 22].includes(i+1) ? 'Semi-monthly Medical & Dental Pre-tax deductions not taken from these paychecks' : '')
    ;
    roe.selectAll("td.normal")
      .data(cols)
      .enter().append("td")
        .html((col) => cellContents(pp, col))
        .attr("class", (col) => getCellClass(pp, col))
        .attr("rowspan", (col) => {
          // console.table(pp) ;
          if (col.holds === 'effort_certification_period') {
            return `${'eff_cert_duration' in pp ? pp.eff_cert_duration : 1}` ;
          } else {
            return '1' ;
          }
        })
  }) ;
  // Ditch the extra empty tds for the certification periods.
  d3.selectAll('td.eff-cert:empty').remove() ;
  // Bring the current week into view.
  document.querySelector('tr.current-week').scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"}) ;

  ;
  console.log(data) ;
}

draw_calendar() ;

