$("#scrape").on("click", function(){
    $.ajax({
        method: "GET",
        url: "/scrape"
    }).then(function(results){
        if(results === "completed")
        location.reload();
    })
})