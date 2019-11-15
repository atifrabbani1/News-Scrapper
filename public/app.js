//GET method to scrape all the news on the app
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

//GET method to view all the comments on the article
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

//POST method to post a comment on article
$(".post").on("click", function (event) {
    event.preventDefault();

    var thisId = $(this).attr("data-id");

    $.ajax("/articles/" + thisId, {
        method: "POST",
        data: {

            // Value taken from comment textbox
            body: $("#message" + thisId).val().trim()
          }
    }).then(function(data){
        console.log(data);
        location.reload();
    })
})

//DELETE method to delete a comment on article.
$(".delete").on("click", function(event){
    event.preventDefault();
    var thisId = $(this).attr("data-id");

    $.ajax("/articles/" + thisId,{
        method: "DELETE"
    }).then(function (results) {
        console.log(results)
        location.reload();
    })
})