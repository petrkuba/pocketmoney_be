const budget = {
  id: "0001",
  name:"02-2023",
  balances: {
    actualSummaryBalance:"900",
    plannedSummaryBalance: "4500",
    accounts:[
      {id:"0", name: "unicredit", actualBalance: "700", plannedBalance: "1000"},
      {id:"1", name: "revolut", actualBalance: "100", plannedBalance: "2000"},
      {id:"2", name: "creditCard", actualBalance: "100", plannedBalance: "1500"}
    ]
  },
  expenseGroups: [
    {
      id: "01",
      type: "Mandatory Expenses",
      remainingSummaryValue: "300",
      paidSummaryValue: "2700",
      expenses: [
        {id:"0", name:"byt saturnova", valueRemaining:"6000", valuePaid:"20"},
        {id:"1", name:"hypotéka dopravní", valueRemaining: "8394", valuePaid:"30"},
        {id:"2", name:"O2 telefony", valueRemaining: "3500", valuePaid:"50"},
        {id:"3", name:"nájem měcholupy", valueRemaining: "34000", valuePaid:"0"}
      ]
    },
    {
      id: "02",
      type: "Other Expenses",
      remainingSummaryValue:"400",
      paidSummaryValue: "450",
      expenses: [
        {id:"4", name:"jídlo", valueRemaining:"16000", valuePaid:"40"},
        {id:"5", name:"benzín", valueRemaining: "6000", valuePaid:"300"},
        {id:"6", name:"pojistka transit", valueRemaining: "2000", valuePaid:"670"},
        {id:"7", name:"rezerva", valueRemaining: "20000", valuePaid:"0"}
      ]
    }
  ]
}

exports.budget = budget;