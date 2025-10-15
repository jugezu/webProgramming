const url2= "https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/muutl/statfin_muutl_pxt_11a2.px"

const fetchData= async()=>{
    const url = "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326"
    
    const geores = await fetch(url)
    const geodata = await geores.json()

    const migrationbody = await (await fetch("/query.json")).json()
    const stats = await fetchData2(url2,migrationbody)

    
    console.log("Stats response:", stats)

    combine(geodata,stats)
    initMap(geodata)

}

const fetchData2= async(url,body)=>{
    const response = await fetch(url,{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })
    return await response.json()

}

const combine=(geodata,stats) => {
     if (!stats || !stats.data) {
        console.error("Stats response invalid:", stats)  // 🔍 loggaa jos dataa ei löydy
        return
    }

    stats.data.forEach(element => {

        const code = element.key[0] // municipality codes
        const migrationValues=element.values //vm43_tulo and vm43_lahto
        
        
        const feature = geodata.features.find(f => code === "KU" + f.properties.kunta)

         if (!feature) {
            console.warn("Kuntaa ei löytynyt geodatasta:", code)
            return
        }
        //initializing
        if (!feature.properties.migration) {
            feature.properties.migration = {}
        }


        feature.properties.migration.vm43_tulo=parseInt(migrationValues[0])
        feature.properties.migration.vm43_lahto=parseInt(migrationValues[1])


        //calculating
        feature.properties.tulo = feature.properties.migration.vm43_tulo
        feature.properties.lahto = feature.properties.migration.vm43_lahto

})
}


const colors = (positive, negative) => {
    
    let hue = Math.pow(positive / negative, 3) * 60

    if(hue>120){
        hue=120
    }
    return `hsl(${hue}, 75%, 50%)`
}
const initMap = (data) => {
    let map = L.map('map', {
        minZoom: -3
    })

    let geoJson = L.geoJSON(data, {
        onEachFeature: getFeature,
        style: feature =>({
            weight: 2,
            color: colors(feature.properties.tulo,feature.properties.lahto)
        })
    }).addTo(map)


    // background map
    let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap"
    }).addTo(map)


    map.fitBounds(geoJson.getBounds())

}

// show municipality name and other data
const getFeature = (feature, layer) => {
    layer.bindTooltip(feature.properties.nimi)

    layer.bindPopup(
        `<ul>
            <li>Kunta: ${feature.properties.nimi}</li>
            <li>Tulomuutto: ${feature.properties.tulo ??"no data"}</li>
            <li>Lähtömuutto: ${feature.properties.lahto?? "no data"}</li>
        </ul>`
    )
}

fetchData()
