$("#scrape").on("click", function (event) {
    event.preventDefault();
    $.ajax({
        method: "GET",
        url: "/scrape"
    }).then(function (results) {
        if (results === "completed")
            location.reload();
    })
})

$(".comment").on("click", function (event) {
    
    event.preventDefault();
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    }).then(function (results) {
        console.log(results)
    })
})

$(".post").on("click", function (event) {
    event.preventDefault();

    var thisId = $(this).attr("data-id");
    //var text = $("#text").val().trim();

    $.ajax("/articles/" + thisId, {
        method: "POST",
        data: {

            // Value taken from note textarea
            body: $("#message" + thisId).val().trim()
          }
    }).then(function(data){
        console.log(data);
        location.reload();
    })
})