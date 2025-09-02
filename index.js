const myButton = document.getElementById("my-button");
myButton.addEventListener("click", ()=>{
    console.log("Hello World")
    const h1 = document.querySelector("h1")
    h1.innerText= "Moi maailma"
    
})

const add=document.getElementById("add-data");
add.addEventListener("click",()=> {  
    const notes = document.getElementById("my-list")
    const newLi = document.createElement("li");

    newLi.innerText = document.getElementById("text").value;
    notes.appendChild(newLi);

})
