const baseURL="https://api.tvmaze.com/search/shows?q="

// listen submit instead of click
document.querySelector("form").addEventListener("submit", async(event)=>{
    const input= document.getElementById("input-show")
    const form= document.querySelector("form")
    const container= document.querySelector(".show-container")

    //const inputText=encodeURIComponent(input.value.trim())
    const inputText = decodeURIComponent(input.value)
    event.preventDefault() // safe to refresh

    if(inputText==''){
        return
    }

    try{
        const response = await fetch(baseURL + inputText)

        const data = await response.json()

        container.innerHTML="" //this should remove old searches


        data.forEach(element => {

            //help in this section: https://stackoverflow.com/questions/50267313/show-search-results-from-api-call
            const show=element.show

            const template= `
            <div class="show-data"> 
                ${show.image ? `<img src="${show.image.medium}">` : ''}
                <div class="show-info"> 
                    <h1>${show.name}</h1> 
                    ${show.summary} 
                </div> 
            </div>`

            // add new show to the list
            container.innerHTML= container.innerHTML+ template
            
        });

    } catch (error){
        console.error(error)
    }
    
})