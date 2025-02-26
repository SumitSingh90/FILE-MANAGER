document.querySelector(".access").addEventListener('click',()=>{
    let userData={};
    $.ajax({
        url: "http://localhost:3000/access", 
        type: "POST",
        contentType: "application/json", 
        data: JSON.stringify(userData),
        success: function(response) {
        }
            ,
        error: function(xhr, status, error) {
            console.error("Error:", error);
            alert("Something went wrong!");
        }
    });
});

