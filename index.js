const populationURL= "https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/vaerak/statfin_vaerak_pxt_11ra.px"
const employmentURL= "https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/tyokay/statfin_tyokay_pxt_115b.px"

const fetchData= async(url,body)=>{
    const response = await fetch(url,{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })
    return await response.json()

}

function setupTable(municipalityData,employmentData) {

    const municipalities = municipalityData.dimension.Alue.category.label
    const populations = municipalityData.value
    const employment = employmentData.value

    const tableBody = document.getElementById("table");

    Object.entries(municipalities).forEach(([key, name], index) => {
        let tr = document.createElement("tr")
        let td1 = document.createElement("td")
        let td2 = document.createElement("td")
        let td3 = document.createElement("td")
        let td4 = document.createElement("td")

        td1.innerText = name
        td2.innerText = populations[index]
        td3.innerText = employment[index]

        // rounding: https://www.w3schools.com/jsref/jsref_tofixed.asp
        let employmentRate=((employment[index] / populations[index])*100)
        let roundedEmployment = employmentRate.toFixed(2)
        
        td4.innerText = roundedEmployment+"%"

        // how to change css styles in js: https://www.udacity.com/blog/2021/06/javascript-css.html 
        if(roundedEmployment>45){
            tr.style.backgroundColor= "#abffbd";
        }

        //I don't see anything under 25%
        if(roundedEmployment<25){
            tr.style.backgroundColor= "#ff9e9e";
        } 


        tr.appendChild(td1)
        tr.appendChild(td2)
        tr.appendChild(td3)
        tr.appendChild(td4)
        tableBody.appendChild(tr);
    });

}


const initializeCode= async() =>{
    const populationBody = await (await fetch("/population_query.json")).json();
    const employmentBody = await (await fetch("/employment_query.json")).json();


    const [municipalityData, employmentData] = await Promise.all([
        fetchData(populationURL,populationBody),
        fetchData(employmentURL,employmentBody)
    ])

    //const municipalityData= await fetchData(populationURL,populationBody)
    //const employmentData= await fetchData(employmentURLL,populationBody)

    setupTable(municipalityData,employmentData)
}


document.addEventListener("DOMContentLoaded", initializeCode);