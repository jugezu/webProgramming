const jsonQuery = (municipalityCode) => {
  const muncode=municipalityCode || "SSS" //default whole country
  return {
    "query": [
    {
      "code": "Vuosi",
      "selection": {
        "filter": "item",
        "values": [
          "2000",
          "2001",
          "2002",
          "2003",
          "2004",
          "2005",
          "2006",
          "2007",
          "2008",
          "2009",
          "2010",
          "2011",
          "2012",
          "2013",
          "2014",
          "2015",
          "2016",
          "2017",
          "2018",
          "2019",
          "2020",
          "2021",
        ]
      }
    },
    {
      "code": "Alue",
      "selection": {
        "filter": "item",
        "values": [
          muncode
        ]
      }
    },

    {
      "code": "Tiedot",     //forgot to add this 
      "selection": {
        "filter": "item",
        "values": [
          "vaesto"
        ]
      }
    }

  ],
  "response": {
    "format": "json-stat2"
  }
}
};


const getData = async(query) =>{
    const url="https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px"

    const res = await fetch(url, {
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify(query)
    })
    if(!res.ok){
        return;
    }
    const data= await res.json()

    return data
}

const getCodes =async()=>{
    const url="https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px"

    const res=await fetch(url)
    const data=await res.json()

    const municipalityCodes=data.variables[1].values
    const municipalityNames=data.variables[1].valueTexts
    return {municipalityCodes, municipalityNames}
    //console.log(municipalityCodes,municipalityNames)

}

let chart = null

const buildChart =async(data,municipalityName) =>{
    
    //console.log(data)
    
    const vaesto = data.dimension.Tiedot.category.index["vaesto"]
    //console.log("vaesto:", vaesto)

    const years =Object.keys(data.dimension.Vuosi.category.index)
    
    //console.log("years:", years)
    

    const values = data.value

    if(chart){
      chart.update({
        labels: years,
        datasets:[
      {
        name: "Population",
        values: values
      }
      ]
      })
    } else {
      const chart = new frappe.Chart("#chart", {


    title: `Population growth in ${municipalityName}`,
    data: {

      labels: years,
      datasets:[
      {
        name: "Population",
        values: values
      }
    ]
    },
    height: 450,
    type: "line",
    colors:['#eb5146']
})

    }



    
}


document.getElementById("submit-data").addEventListener("click",async()=> {
//case insesitive: https://stackoverflow.com/questions/2140627/how-to-do-case-insensitive-string-comparison
//basicly compare strings using toUpperCase or ToLoverCase

const {municipalityCodes,municipalityNames}= await getCodes()

const inputText = document.getElementById("input-area").value.toUpperCase()

//finding municipality code in for loop

let index=null

for(let i=0; i<municipalityNames.length; i++){
  if(municipalityNames[i].toUpperCase() === inputText){
    index=i
    break
  }
}
  const municipalityName=municipalityNames[index]
  const municipalityCode=municipalityCodes[index]

  //console.log("muni: ",municipalityName,"code: ",municipalityCode )
  const query=jsonQuery(municipalityCode)
  const data = await getData(query)
  buildChart(data,municipalityName)

})


document.getElementById("add-data").addEventListener("click",()=>{

  if(!chart){
    return
  }



})



// set whole country as default
window.addEventListener("DOMContentLoaded",async()=>{
  const query=jsonQuery("SSS")
  const {municipalityCodes,municipalityName}= await getCodes()
  const index = municipalityCodes[0]
  
  const data=await getData(query)
  buildChart(data,"Whole country")

})
