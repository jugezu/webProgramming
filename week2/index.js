document.getElementById("submit-data").addEventListener("click", function(event){
    event.preventDefault()

    const username= document.getElementById("input-username")
    const email=document.getElementById("input-email")
    const admin= document.getElementById("input-admin")
    
    const admin2 = admin.checked ? "X": "-"

  

    let picture=""
    const file= document.getElementById("input-image")
    const image= file.files[0]

    if(image){

        //https://www.w3schools.com/js/js_string_templates.asp
        // I forgot how to use html in js but this quick tutorial helped me
        const imageURL= URL.createObjectURL(image)
        picture =`<img src="${imageURL}" height="64" width="64">`

    }



    const tbody = document.getElementById("table")

    // https://stackoverflow.com/questions/3065342/how-do-i-iterate-through-table-rows-and-cells-in-javascript
    var found= false

    for (let row of tbody.rows){
        const username2= row.cells[0];

        if(username2.innerText===username.value){
            row.cells[1].innerText=document.getElementById("input-email").value
            row.cells[2].innerText=admin2
            row.cells[3].innerHTML=picture
            found=true
            break
        }
    }
    if(!found){
        const row= document.createElement("tr")
        // https://stackoverflow.com/questions/55199645/javascript-add-new-row-to-table-using-appendchild
    
        let html = '<td>' + username.value + '</td>'+
        '<td>' +email.value + '</td>'+
        '<td>' +admin2 + '</td>'+
        '<td>' +picture +'</td>'
        row.innerHTML = html
    

        tbody.appendChild(row)

    }
        

})

 // https://stackoverflow.com/questions/7271490/delete-all-rows-in-an-html-table
 // deleting table

document.getElementById("empty-table").addEventListener("click", ()=> {
    const tbody= document.getElementById("table")

    tbody.innerHTML = ""
})


