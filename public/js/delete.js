document.querySelectorAll(".file-container").forEach((container)=>{
        container.addEventListener("click", function(event) {
            if (event.target.classList.contains("delete")) {
                const fileCard = event.target.closest(".file-card"); 
                const fileElement = fileCard.querySelector("img, video > source, audio > source, iframe");

                const fileSrc = fileElement.src || fileElement.getAttribute("src");

                if (fileCard) {
                    fileCard.remove(); 
                    console.log("File deleted!");
                }

                let data ={file:fileSrc};

                $.ajax({
                    url: "http://localhost:3000/delete", 
                    type: "DELETE",
                    contentType: "application/json", 
                    data: JSON.stringify(data),
                    success: function(response) {
                       alert(response);
                    }
                        ,
                    error: function(xhr, status, error) {
                        console.error("Error:", error);
                        alert("Something went wrong!");
                    }
                });
            }


           

})

});
