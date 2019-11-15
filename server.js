var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");
var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));
// Handlebars
app.engine(
    "handlebars",
    exphbs({
      defaultLayout: "main"
    })
  );
  app.set("view engine", "handlebars");

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/mongoHeadlines", { useNewUrlParser: true });

// Routes
app.get("/",function(req,res){
    db.Article.find({})
    .then(function(results){
        res.render("index", {articles:results})
    })
    .catch(function(err) {
        // If an error occurred, log it
        console.log(err);
      });
})
// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.usatoday.com/news/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $(".gnt_m_flm_a").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.headline = $(this)
        .text();
      result.summary = $(this)
        .attr("data-c-br");
        result.url = "https://www.usatoday.com" + $(this)
        .attr("href")

        console.log(result);

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });
    res.send("completed")
    // Send a message to the client
   // res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // TODO: Finish the route so it grabs all of the articles
  db.Article.find({})
  .then(function(data){
    res.json(data)
  })
  .catch(function(err){
    res.json(err)
  })
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({_id:req.params.id})
  .populate("note")
  .then(function(data){
    res.json(data)
  })
  .catch(function(err){
    res.json(err)
  })
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {

  db.Note.create(
    req.body
  ).then(function(data){
    return db.Article.findOneAndUpdate({_id:req.params.id},
      {note: data._id},{new: true} )
  })
  .then(function(data){
    res.json(data)
  })
  .catch(function(err){
    res.json(err)
  })
  // TODO
  // ====
  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update it's "note" property with the _id of the new note
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
