$("#scrape").on("click", function(){
    $.ajax({
        method: "GET",
        url: "/scrape"
    }).then(function(results){
        window.location.href = "/scrape"
    })
})